import { Pool as MysqlPool } from 'mysql2/promise';
import { Pool as OdbcPool } from 'odbc';
import { logger } from '../../utils/logger.js';
import { getCodexcodeAtcQuery } from '../../db/queries/source.js';
import { insertCodexcodeAtcQuery } from '../../db/queries/target.js';
import { truncateTable } from '../truncateTable.js';

export class CodexcodeAtcExtractor {
  private sourcePool: OdbcPool;
  private targetPool: MysqlPool;

  constructor(sourcePool: OdbcPool, targetPool: MysqlPool) {
    this.sourcePool = sourcePool;
    this.targetPool = targetPool;
  }

  async extract(): Promise<void> {
    try {
      // 1. Vider la table cible
      logger.info('Vidage de la table codexcode_atc...');
      await truncateTable(this.targetPool, 'codexcode_atc');
      logger.info('Table codexcode_atc videe avec succes');

      // 2. Executer la requête source
      logger.info('Extraction des donnees ATC...');
      const sourceQuery = getCodexcodeAtcQuery();
      const sourceResult = await this.sourcePool.query(sourceQuery);

      if (!sourceResult || !Array.isArray(sourceResult)) {
        throw new Error('Resultat de la requête source invalide');
      }

      const rows = sourceResult;
      if (rows.length === 0) {
        logger.warn('Aucune donnee trouvee pour les codes ATC');
        return;
      }

      logger.info(`${rows.length} codes ATC trouves`);

      // 3. Inserer les donnees dans la table cible
      logger.info('Insertion des donnees dans codexcode_atc...');
      const insertQuery = insertCodexcodeAtcQuery();
      let insertedCount = 0;
      let errorCount = 0;

      for (const row of rows) {
        try {
          await this.targetPool.query(insertQuery, [
            row.CodeATC,
            row.libCourt,
            row.NbCarCodeATC,
            row.TypeCodeATC
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
      logger.error('Erreur lors de l\'extraction des codes ATC:', error);
      throw error;
    }
  }
} 