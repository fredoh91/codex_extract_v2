import { Pool as MysqlPool } from 'mysql2/promise';
import { Pool as OdbcPool } from 'odbc';
import { logger } from '../../utils/logger.js';
import { getCodexvoieAdminQuery } from '../../db/queries/source.js';
import { insertCodexvoieAdminQuery } from '../../db/queries/target.js';
import { truncateTable } from '../truncateTable.js';

export class CodexvoieAdminExtractor {
  private sourcePool: OdbcPool;
  private targetPool: MysqlPool;

  constructor(sourcePool: OdbcPool, targetPool: MysqlPool) {
    this.sourcePool = sourcePool;
    this.targetPool = targetPool;
  }

  async extract(): Promise<void> {
    try {
      // 1. Vider la table cible
      logger.info('Vidage de la table codexvoie_admin...');
      await truncateTable(this.targetPool, 'codexvoie_admin');
      logger.info('Table codexvoie_admin videe avec succes');

      // 2. Executer la requête source
      logger.info('Extraction des donnees de voies d\'administration...');
      const sourceQuery = getCodexvoieAdminQuery();
      const sourceResult = await this.sourcePool.query(sourceQuery);

      if (!sourceResult || !Array.isArray(sourceResult)) {
        throw new Error('Resultat de la requête source invalide');
      }

      const rows = sourceResult;
      if (rows.length === 0) {
        logger.warn('Aucune donnee trouvee pour les voies d\'administration');
        return;
      }

      logger.info(`${rows.length} voies d'administration trouvees`);

      // 3. Inserer les donnees dans la table cible
      logger.info('Insertion des donnees dans codexvoie_admin...');
      const insertQuery = insertCodexvoieAdminQuery();
      let insertedCount = 0;
      let errorCount = 0;
      const logFrequency = parseInt(process.env.NB_LIGNES_DEBUG_CODEXVOIEADMIN || '1000');

      for (const row of rows) {
        try {
          await this.targetPool.query(insertQuery, [
            row.codeVU,
            row.codeVoie,
            row.libAbr,
            row.libCourt,
            row.libLong,
            row.libRech,
            row.numOrdreEdit,
            row.indicValide
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
      logger.error('Erreur lors de l\'extraction des voies d\'administration:', error);
      throw error;
    }
  }
} 