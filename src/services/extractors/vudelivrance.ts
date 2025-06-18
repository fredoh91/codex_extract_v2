import { Pool as MysqlPool } from 'mysql2/promise';
import { Pool as OdbcPool } from 'odbc';
import { logger } from '../../utils/logger.js';
import { getVudelivranceQuery } from '../../db/queries/source.js';
import { insertVudelivranceQuery } from '../../db/queries/target.js';
import { truncateTable } from '../truncateTable.js';

export class VudelivranceExtractor {
  private sourcePool: OdbcPool;
  private targetPool: MysqlPool;

  constructor(sourcePool: OdbcPool, targetPool: MysqlPool) {
    this.sourcePool = sourcePool;
    this.targetPool = targetPool;
  }

  async extract(): Promise<void> {
    try {
      // 1. Vider la table cible
      logger.info('Vidage de la table vudelivrance...');
      await truncateTable(this.targetPool, 'vudelivrance');
      logger.info('Table vudelivrance videe avec succes');

      // 2. Executer la requête source
      logger.info('Extraction des donnees de delivrance...');
      const sourceQuery = getVudelivranceQuery();
      const sourceResult = await this.sourcePool.query(sourceQuery);

      if (!sourceResult || !Array.isArray(sourceResult)) {
        throw new Error('Resultat de la requête source invalide');
      }

      const rows = sourceResult;
      if (rows.length === 0) {
        logger.warn('Aucune donnee trouvee pour les delivrances');
        return;
      }

      logger.info(`${rows.length} delivrances trouves`);

      // 3. Inserer les donnees dans la table cible
      logger.info('Insertion des donnees dans vudelivrance...');
      const insertQuery = insertVudelivranceQuery();
      let insertedCount = 0;
      let errorCount = 0;
      const logFrequency = parseInt(process.env.NB_LIGNES_DEBUG_VUDELIVRANCE || '1000');

      for (const row of rows) {
        try {
          await this.targetPool.query(insertQuery, [
            row.codeVU,
            row.codeDelivrance,
            row.libLong
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
      logger.error('Erreur lors de l\'extraction des delivrances:', error);
      throw error;
    }
  }
} 