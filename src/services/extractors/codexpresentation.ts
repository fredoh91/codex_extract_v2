import { Pool as MysqlPool } from 'mysql2/promise';
import { Pool as OdbcPool } from 'odbc';
import { logger } from '../../utils/logger.js';
import { getCodexpresentationQuery } from '../../db/queries/source.js';
import { insertCodexpresentationQuery } from '../../db/queries/target.js';
import { truncateTable } from '../truncateTable.js';

export class CodexpresentationExtractor {
  private sourcePool: OdbcPool;
  private targetPool: MysqlPool;

  constructor(sourcePool: OdbcPool, targetPool: MysqlPool) {
    this.sourcePool = sourcePool;
    this.targetPool = targetPool;
  }

  async extract(): Promise<void> {
    try {
      // 1. Vider la table cible
      logger.info('Vidage de la table codexpresentation...');
      await truncateTable(this.targetPool, 'codexpresentation');
      logger.info('Table codexpresentation videe avec succes');

      // 2. Executer la requête source
      logger.info('Extraction des donnees de presentation...');
      const sourceQuery = getCodexpresentationQuery();
      const sourceResult = await this.sourcePool.query(sourceQuery);

      if (!sourceResult || !Array.isArray(sourceResult)) {
        throw new Error('Resultat de la requête source invalide');
      }

      const rows = sourceResult;
      if (rows.length === 0) {
        logger.warn('Aucune donnee trouvee pour les presentations');
        return;
      }

      logger.info(`${rows.length} presentations trouvees`);

      // 3. Inserer les donnees dans la table cible
      logger.info('Insertion des donnees dans codexpresentation...');
      const insertQuery = insertCodexpresentationQuery();
      let insertedCount = 0;
      let errorCount = 0;
      const logFrequency = parseInt(process.env.NB_LIGNES_DEBUG_CODEXPRESENTATION || '1000');

      for (const row of rows) {
        try {
          await this.targetPool.query(insertQuery, [
            row.codeVU,
            row.numPresentation,
            row.nomPresentation,
            row.codeCIP,
            row.codeCIP13,
            row.statutComm,
            row.infoCommCourt,
            row.infoCommLong
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
      logger.error('Erreur lors de l\'extraction des presentations:', error);
      throw error;
    }
  }
} 