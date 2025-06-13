import { Pool as MysqlPool } from 'mysql2/promise';
import { Pool as OdbcPool } from 'odbc';
import { logger } from '../../utils/logger.js';
import { getCodexpictoGrossesseQuery } from '../../db/queries/source.js';
import { insertCodexpictoGrossesseQuery } from '../../db/queries/target.js';
import { truncateTable } from '../truncateTable.js';

export class CodexpictoGrossesseExtractor {
  private sourcePool: OdbcPool;
  private targetPool: MysqlPool;

  constructor(sourcePool: OdbcPool, targetPool: MysqlPool) {
    this.sourcePool = sourcePool;
    this.targetPool = targetPool;
  }

  async extract(): Promise<void> {
    try {
      // 1. Vider la table cible
      logger.info('Vidage de la table codexpicto_grossesse...');
      await truncateTable(this.targetPool, 'codexpicto_grossesse');
      logger.info('Table codexpicto_grossesse videe avec succes');

      // 2. Executer la requête source
      logger.info('Extraction des donnees de pictogrammes de grossesse...');
      const sourceQuery = getCodexpictoGrossesseQuery();
      const sourceResult = await this.sourcePool.query(sourceQuery);

      if (!sourceResult || !Array.isArray(sourceResult)) {
        throw new Error('Resultat de la requête source invalide');
      }

      const rows = sourceResult;
      if (rows.length === 0) {
        logger.warn('Aucune donnee trouvee pour les pictogrammes de grossesse');
        return;
      }

      logger.info(`${rows.length} pictogrammes de grossesse trouves`);

      // 3. Inserer les donnees dans la table cible
      logger.info('Insertion des donnees dans codexpicto_grossesse...');
      const insertQuery = insertCodexpictoGrossesseQuery();
      let insertedCount = 0;
      let errorCount = 0;

      for (const row of rows) {
        try {
          await this.targetPool.query(insertQuery, [
            row.codeVU,
            row.numPresentation,
            row.nomPresentation,
            row.codeCIP,
            row.codeCIP13,
            row.statutComm,
            row.Code_Picto,
            row.Lib_Picto
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
      logger.error('Erreur lors de l\'extraction des pictogrammes de grossesse:', error);
      throw error;
    }
  }
} 