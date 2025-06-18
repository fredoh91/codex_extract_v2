import { Pool as MysqlPool } from 'mysql2/promise';
import { Pool as OdbcPool } from 'odbc';
import { logger } from '../../utils/logger.js';
import { getDboNomsSubstanceHaumeaQuery } from '../../db/queries/source.js';
import { insertDboNomsSubstanceHaumeaQuery } from '../../db/queries/target.js';
import { truncateTable } from '../truncateTable.js';

export class DboNomsSubstanceHaumeaExtractor {
  private sourcePool: OdbcPool;
  private targetPool: MysqlPool;

  constructor(sourcePool: OdbcPool, targetPool: MysqlPool) {
    this.sourcePool = sourcePool;
    this.targetPool = targetPool;
  }

  async extract(): Promise<void> {
    try {
      // 1. Vider la table cible
      logger.info('Vidage de la table dbo_noms_substance_haumea...');
      await truncateTable(this.targetPool, 'dbo_noms_substance_haumea');
      logger.info('Table dbo_noms_substance_haumea videe avec succes');

      // 2. Executer la requête source
      logger.info('Extraction des donnees de noms de substance...');
      const sourceQuery = getDboNomsSubstanceHaumeaQuery();
      const sourceResult = await this.sourcePool.query(sourceQuery);

      if (!sourceResult || !Array.isArray(sourceResult)) {
        throw new Error('Resultat de la requête source invalide');
      }

      const rows = sourceResult;
      if (rows.length === 0) {
        logger.warn('Aucune donnee trouvee pour les noms de substance');
        return;
      }

      logger.info(`${rows.length} noms de substance trouves`);

      // 3. Inserer les donnees dans la table cible
      logger.info('Insertion des donnees dans dbo_noms_substance_haumea...');
      const insertQuery = insertDboNomsSubstanceHaumeaQuery();
      let insertedCount = 0;
      let errorCount = 0;
      const logFrequency = parseInt(process.env.NB_LIGNES_DEBUG_DBONOMSSUBSTANCEHAUMEA || '1000');

      for (const row of rows) {
        try {
          await this.targetPool.query(insertQuery, [
            row.codeNomSubstance,
            row.codeSubstance,
            row.nomSubstance,
            row.libRech,
            row.codeDenom,
            row.codeOrigineNom,
            row.indicValide,
            row.nomValidePar,
            row.indicCandidat,
            row.dateCreation,
            row.dateDernModif
          ]);
          insertedCount++;
          
          // Log selon la fréquence configurée
          if (insertedCount % logFrequency === 0) {
            logger.info(`${insertedCount} enregistrements inseres...`);
          }
          
        } catch (error) {
          errorCount++;
          logger.error(`Erreur lors de l'insertion de l'enregistrement:`, error);
          logger.error('Donnees problematiques:', row);
        }
      }

      logger.info(`Traitement termine : ${insertedCount} enregistrements inseres, ${errorCount} erreurs`);

    } catch (error) {
      logger.error('Erreur lors de l\'extraction des noms de substance:', error);
      throw error;
    }
  }
} 