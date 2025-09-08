import { Pool as MysqlPool } from 'mysql2/promise';
import { Pool as OdbcPool } from 'odbc';
import { logger } from '../../utils/logger.js';
import { getSavuQuery } from '../../db/queries/source.js';
import { insertSavuQuery } from '../../db/queries/target.js';
import { truncateTable } from '../truncateTable.js';

export class SavuExtractor {
  private sourcePool: OdbcPool;
  private targetPool: MysqlPool;

  constructor(sourcePool: OdbcPool, targetPool: MysqlPool) {
    this.sourcePool = sourcePool;
    this.targetPool = targetPool;
  }

  async extract(): Promise<void> {
    try {
      // 1. Vider la table cible
      logger.info('Vidage de la table savu...');
      await truncateTable(this.targetPool, 'savu');
      logger.info('Table savu videe avec succes');

      // 2. Executer la requête source
      logger.info('Extraction des donnees SAVU...');
      const sourceQuery = getSavuQuery();
      const sourceResult = await this.sourcePool.query(sourceQuery);

      if (!sourceResult || !Array.isArray(sourceResult)) {
        throw new Error('Resultat de la requête source invalide');
      }

      const rows = sourceResult;
      if (rows.length === 0) {
        logger.warn('Aucune donnee trouvee pour les SAVU');
        return;
      }

      logger.info(`${rows.length} SAVU trouves`);

      // // Afficher le premier enregistrement pour debug
      // if (rows.length > 0) {
      //   const firstRow = rows[0];
      //   logger.info('=== PREMIER ENREGISTREMENT SAVU ===');
      //   logger.info('Proprietes disponibles: ' + Object.keys(firstRow).join(', '));
      //   logger.info('Donnees du premier enregistrement:', JSON.stringify(firstRow, null, 2));
      //   logger.info('=============================');
      // }

      // 3. Inserer les donnees dans la table cible
      logger.info('Insertion des donnees dans savu...');
      const insertQuery = insertSavuQuery();
      let insertedCount = 0;
      let errorCount = 0;
      const logFrequency = parseInt(process.env.NB_LIGNES_DEBUG_SAVU || '1000');

      for (const row of rows) {
        try {
          await this.targetPool.query(insertQuery, [
            row.codeVU,
            row.codeCIS,
            row.codeDossier,
            row.nomVU,
            row.numElement,
            row.codeSubstance,
            row.numComposant,
            row.codeUniteDosage,
            row.codeNature,
            row.dosageLibraTypo,
            row.dosageLibra,
            row.libCourt,
            row.nomSubstance,
            row.codeProduit,
            row.libNature,
            row.libFormePH,
            row.lib_rech_substance,
            row.lib_rech_denomination,
            row.nomProduit
          ]);
          insertedCount++;
          
          // Log selon la fréquence configurée
          if (insertedCount % logFrequency === 0) {
            const now = new Date();
            const dateStr = now.toLocaleString('fr-FR', { hour12: false });
            console.log(`[${dateStr}] ${insertedCount} enregistrements inseres...`);
          }
          
        } catch (error) {
          errorCount++;
          logger.error(`Erreur lors de l'insertion de l'enregistrement:`, error);
          logger.error('Message d\'erreur:', error instanceof Error ? error.message : String(error));
          logger.error('Donnees problematiques:', JSON.stringify(row, null, 2));
          
          // Afficher les détails de l'erreur MySQL si disponible
          if (error instanceof Error && 'code' in error) {
            logger.error('Code erreur MySQL:', (error as any).code);
            logger.error('Etat SQL:', (error as any).sqlState);
            logger.error('Message SQL:', (error as any).sqlMessage);
          }
        }
      }

      logger.info(`Traitement termine : ${insertedCount} enregistrements inseres, ${errorCount} erreurs`);

    } catch (error) {
      logger.error('Erreur lors de l\'extraction des SAVU:', error);
      throw error;
    }
  }
} 