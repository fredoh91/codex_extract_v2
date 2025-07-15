import { Pool as MysqlPool } from 'mysql2/promise';
import { Pool as OdbcPool } from 'odbc';
import { logger } from '../../utils/logger.js';
import { getMocatorDocumentXmlQuery } from '../../db/queries/source.js';
import { insertMocatorDocumentXmlQuery } from '../../db/queries/target.js';
import { truncateTable } from '../truncateTable.js';

export class MocatorDocumentXmlExtractor {
  private sourcePool: OdbcPool;
  private targetPool: MysqlPool;

  constructor(sourcePool: OdbcPool, targetPool: MysqlPool) {
    this.sourcePool = sourcePool;
    this.targetPool = targetPool;
  }

  async extract(): Promise<void> {
    try {
      logger.info('Vidage de la table mocatordocument_xml...');
      await truncateTable(this.targetPool, 'mocatordocument_xml');
      logger.info('Table mocatordocument_xml videe avec succes');

      logger.info('Extraction des donnees MOCATOR DocumentXML...');
      const sourceQuery = getMocatorDocumentXmlQuery();
      const sourceResult = await this.sourcePool.query(sourceQuery);

      if (!sourceResult || !Array.isArray(sourceResult)) {
        throw new Error('Resultat de la requête source invalide');
      }

      const rows = sourceResult;
      if (rows.length === 0) {
        logger.warn('Aucune donnee trouvee pour mocatordocument_xml');
        return;
      }

      logger.info(`${rows.length} documents XML trouves`);
      const insertQuery = insertMocatorDocumentXmlQuery();
      let insertedCount = 0;
      let errorCount = 0;
      const logFrequency = parseInt(process.env.NB_LIGNES_DEBUG_MOCATORDOCUMENTXML || '1000');

      for (const row of rows) {
        try {
          await this.targetPool.query(insertQuery, [
            row.XdocId,
            row.codeVU,
            row.DocId,
            row.NatureDoc,
            row.StatutDoc,
            row.Auteur,
            row.ServerName,
            row.SrceName,
            row.SrceSize,
            row.SrceLastUpd,
            row.NativeFormat,
            row.VersionDTD,
            row.DocJoint,
            row.NumOrdre,
            row.DateMajAMM,
            row.DateValide,
            row.DateLiv,
            row.DateArch,
            row.Commentaire
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
      logger.error('Erreur lors de l\'extraction des documents XML MOCATOR:', error);
      throw error;
    }
  }
} 