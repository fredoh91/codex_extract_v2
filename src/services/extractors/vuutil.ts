import { Pool as MysqlPool } from 'mysql2/promise';
import { Pool as OdbcPool } from 'odbc';
import { logger } from '../../utils/logger.js';
import { getVuutilQuery } from '../../db/queries/source.js';
import { insertVuutilQuery } from '../../db/queries/target.js';
import { truncateTable } from '../truncateTable.js';

export class VuutilExtractor {
  private sourcePool: OdbcPool;
  private targetPool: MysqlPool;

  constructor(sourcePool: OdbcPool, targetPool: MysqlPool) {
    this.sourcePool = sourcePool;
    this.targetPool = targetPool;
  }

  async extract(): Promise<void> {
    try {
      // 1. Vider la table cible
      logger.info('Vidage de la table vuutil...');
      await truncateTable(this.targetPool, 'vuutil');
      logger.info('Table vuutil videe avec succes');

      // 2. Executer la requête source
      logger.info('Extraction des donnees VU...');
      const sourceQuery = getVuutilQuery();
      const sourceResult = await this.sourcePool.query(sourceQuery);

      if (!sourceResult || !Array.isArray(sourceResult)) {
        throw new Error('Resultat de la requête source invalide');
      }

      const rows = sourceResult;
      if (rows.length === 0) {
        logger.warn('Aucune donnee trouvee pour les VU');
        return;
      }

      logger.info(`${rows.length} VU trouves`);

      // 3. Inserer les donnees dans la table cible
      logger.info('Insertion des donnees dans vuutil...');
      const insertQuery = insertVuutilQuery();
      let insertedCount = 0;
      let errorCount = 0;

      for (const row of rows) {
        try {
          await this.targetPool.query(insertQuery, [
            row.codeVU,
            row.codeCIS,
            row.codeDossier
          ]);
          insertedCount++;
        } catch (error) {
          errorCount++;
          logger.error(`Erreur lors de l'insertion de l'enregistrement:`, error);
          logger.error('Donnees problematiques:', row);
        }
      }

      logger.info(`Traitement termine : ${insertedCount} enregistrements inseres, ${errorCount} erreurs`);

    } catch (error) {
      logger.error('Erreur lors de l\'extraction des VU:', error);
      throw error;
    }
  }
} 