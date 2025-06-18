import { Pool as MysqlPool } from 'mysql2/promise';
import { Pool as OdbcPool } from 'odbc';
import { logger } from '../../utils/logger.js';
import { getDboComposantsHaumeaQuery } from '../../db/queries/source.js';
import { insertDboComposantsHaumeaQuery } from '../../db/queries/target.js';
import { truncateTable } from '../truncateTable.js';

export class DboComposantsHaumeaExtractor {
  private sourcePool: OdbcPool;
  private targetPool: MysqlPool;

  constructor(sourcePool: OdbcPool, targetPool: MysqlPool) {
    this.sourcePool = sourcePool;
    this.targetPool = targetPool;
  }

  async extract(): Promise<void> {
    try {
      // 1. Vider la table cible
      logger.info('Vidage de la table dbo_composants_haumea...');
      await truncateTable(this.targetPool, 'dbo_composants_haumea');
      logger.info('Table dbo_composants_haumea videe avec succes');

      // 2. Executer la requête source
      logger.info('Extraction des donnees de composants...');
      const sourceQuery = getDboComposantsHaumeaQuery();
      const sourceResult = await this.sourcePool.query(sourceQuery);

      if (!sourceResult || !Array.isArray(sourceResult)) {
        throw new Error('Resultat de la requête source invalide');
      }

      const rows = sourceResult;
      if (rows.length === 0) {
        logger.warn('Aucune donnee trouvee pour les composants');
        return;
      }

      logger.info(`${rows.length} composants trouves`);

      // 3. Inserer les donnees dans la table cible
      logger.info('Insertion des donnees dans dbo_composants_haumea...');
      const insertQuery = insertDboComposantsHaumeaQuery();
      let insertedCount = 0;
      let errorCount = 0;
      const logFrequency = parseInt(process.env.NB_LIGNES_DEBUG_DBOCOMPOSANTSHAUMEA || '1000');

      for (const row of rows) {
        try {
          await this.targetPool.query(insertQuery, [
            row.codeVU,
            row.numElement,
            row.codeSubstance,
            row.numComposant,
            row.codeUniteDosage,
            row.codeNomSubstance,
            row.codeNature,
            row.qteDosage,
            row.dosageLibra,
            row.dosageLibraTypo,
            row.CEP,
            row.numOrdreEdit,
            row.remComposants,
            row.dateCreation,
            row.dateDernModif,
            row.indicValide,
            row.codeModif
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
      logger.error('Erreur lors de l\'extraction des composants:', error);
      throw error;
    }
  }
} 