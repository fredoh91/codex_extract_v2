import { Pool as MysqlPool } from 'mysql2/promise';
import { Pool as OdbcPool } from 'odbc';
import { logger } from '../../utils/logger.js';
import { getMocatorDocumentQuery } from '../../db/queries/source.js';
import { insertMocatorDocumentQuery } from '../../db/queries/target.js';
import { truncateTable } from '../truncateTable.js';

export class MocatorDocumentExtractor {
  private sourcePool: OdbcPool;
  private targetPool: MysqlPool;

  constructor(sourcePool: OdbcPool, targetPool: MysqlPool) {
    this.sourcePool = sourcePool;
    this.targetPool = targetPool;
  }

  async extract(): Promise<void> {
    try {
      logger.info('Vidage de la table mocatordocument...');
      await truncateTable(this.targetPool, 'mocatordocument');
      logger.info('Table mocatordocument videe avec succes');

      logger.info('Extraction des donnees MOCATOR Document...');
      const sourceQuery = getMocatorDocumentQuery();
      const sourceResult = await this.sourcePool.query(sourceQuery);

      if (!sourceResult || !Array.isArray(sourceResult)) {
        throw new Error('Resultat de la requête source invalide');
      }

      const rows = sourceResult;
      if (rows.length === 0) {
        logger.warn('Aucune donnee trouvee pour mocatordocument');
        return;
      }

      logger.info(`${rows.length} documents trouves`);
      const insertQuery = insertMocatorDocumentQuery();
      let insertedCount = 0;
      let errorCount = 0;
      const logFrequency = parseInt(process.env.NB_LIGNES_DEBUG_MOCATORDOCUMENT || '1000');

      for (const row of rows) {
        try {
          await this.targetPool.query(insertQuery, [
            row.DocId,
            row.GrpId,
            row.NotId,
            row.DateArch,
            row.DateNotif,
            row.SrceName,
            row.SrceSize,
            row.SrceLastUpd,
            row.NativeFormat,
            row.ServerName,
            row.Rem,
            row.Author,
            row.SeanceId,
            row.DateSeance
          ]);
          insertedCount++;
          if (insertedCount % logFrequency === 0) {
            logger.info(`${insertedCount} enregistrements inseres...`);
          }
        } catch (error) {
          errorCount++;
          logger.error(`Erreur lors de l'insertion de l'enregistrement:`, error);
          logger.error('Donnees problematiques:', JSON.stringify(row, null, 2));
        }
      }
      logger.info(`Traitement termine : ${insertedCount} enregistrements inseres, ${errorCount} erreurs`);
    } catch (error) {
      logger.error('Erreur lors de l\'extraction des documents MOCATOR:', error);
      throw error;
    }
  }
} 