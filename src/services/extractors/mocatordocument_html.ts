import { Pool as MysqlPool } from 'mysql2/promise';
import { Pool as OdbcPool } from 'odbc';
import { logger } from '../../utils/logger.js';
import { getMocatorDocumentHtmlQuery } from '../../db/queries/source.js';
import { insertMocatorDocumentHtmlQuery } from '../../db/queries/target.js';
import { truncateTable } from '../truncateTable.js';

export class MocatorDocumentHtmlExtractor {
  private sourcePool: OdbcPool;
  private targetPool: MysqlPool;

  constructor(sourcePool: OdbcPool, targetPool: MysqlPool) {
    this.sourcePool = sourcePool;
    this.targetPool = targetPool;
  }

  async extract(): Promise<void> {
    try {
      logger.info('Vidage de la table mocatordocument_html...');
      await truncateTable(this.targetPool, 'mocatordocument_html');
      logger.info('Table mocatordocument_html videe avec succes');

      logger.info('Extraction des donnees MOCATOR DocumentHTML...');
      const sourceQuery = getMocatorDocumentHtmlQuery();
      const sourceResult = await this.sourcePool.query(sourceQuery);

      if (!sourceResult || !Array.isArray(sourceResult)) {
        throw new Error('Resultat de la requête source invalide');
      }

      const rows = sourceResult;
      if (rows.length === 0) {
        logger.warn('Aucune donnee trouvee pour mocatordocument_html');
        return;
      }

      logger.info(`${rows.length} documents HTML trouves`);
      const insertQuery = insertMocatorDocumentHtmlQuery();
      let insertedCount = 0;
      let errorCount = 0;
      const logFrequency = parseInt(process.env.NB_LIGNES_DEBUG_MOCATORDOCUMENTHTML || '1000');

      for (const row of rows) {
        try {
          await this.targetPool.query(insertQuery, [
            row.HdocId,
            row.SpecId,
            row.DocId,
            row.TypId,
            row.HName,
            row.DateConv
          ]);
          insertedCount++;
          if (insertedCount % logFrequency === 0) {
            const now = new Date();
            const dateStr = now.toLocaleString('fr-FR', { hour12: false });
            console.log(`[${dateStr}] ${insertedCount} enregistrements inseres...`);
          }
        } catch (error) {
          errorCount++;
          logger.error(`Erreur lors de l'insertion de l'enregistrement:`, error);
          logger.error('Donnees problematiques:', JSON.stringify(row, null, 2));
        }
      }
      logger.info(`Traitement termine : ${insertedCount} enregistrements inseres, ${errorCount} erreurs`);
    } catch (error) {
      logger.error('Erreur lors de l\'extraction des documents HTML MOCATOR:', error);
      throw error;
    }
  }
} 