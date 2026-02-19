import { createPoolBnpvExtract } from '../../db/mysqlBnpv.js';
import { getSubSimadDataQuery } from '../../db/queries/source.js';
import { insertSubSimadQuery } from '../../db/queries/target.js'; // Import de la fonction de requête d'insertion
import { logger } from '../../utils/logger.js';
import { truncateTable } from '../truncateTable.js';
import { SubSimad } from '../../types/subsimad.js';
import { Pool } from 'mysql2/promise';

export class SubSimadExtractor {
  private targetPool: Pool;

  constructor(targetPool: Pool) {
    this.targetPool = targetPool;
  }

  async extract(): Promise<void> {
    logger.info('Démarrage de l\'extraction et du chargement de sub_simad...');
    const sourcePool = createPoolBnpvExtract();
    let connectionSource;
    let connectionTarget;

    try {
      connectionSource = await sourcePool.getConnection();
      connectionTarget = await this.targetPool.getConnection();

      // 1. Extraction des données de la source
      const [rows] = await connectionSource.execute(getSubSimadDataQuery());
      const subSimadData = rows as SubSimad[];
      logger.info(`Nombre d'enregistrements extraits de BNPV_MIROIR : ${subSimadData.length}`);

      // 2. Truncation de la table cible (si nécessaire)
      await truncateTable(this.targetPool, 'sub_simad');
      logger.info('Table sub_simad tronquée.');

      // 3. Insertion des données dans la table cible
      if (subSimadData.length > 0) {
        const insertQuery = insertSubSimadQuery(); // Appel de la fonction de requête
        let insertedCount = 0;
        let errorCount = 0;
        const logFrequency = parseInt(process.env.NB_LIGNES_DEBUG_SUBSIMAD || '1000');

        for (const row of subSimadData) {
          try {
            await connectionTarget.query(insertQuery, [
              row.productfamily,
              row.topproductname,
              row.productname,
              row.creation_date,
              row.modification_date,
              row.unii_id,
              row.cas_id,
              row.is_product_enabled,
              row.product_pv,
              row.product_addicto,
            ]);
            insertedCount++;

            if (insertedCount % logFrequency === 0) {
              const now = new Date();
              const dateStr = now.toLocaleString('fr-FR', { hour12: false });
              console.log(`[${dateStr}] ${insertedCount} enregistrements inseres dans sub_simad...`);
            }
          } catch (error) {
            errorCount++;
            logger.error('Erreur lors de l\'insertion de l\'enregistrement dans sub_simad:', (error instanceof Error ? error.message : error));
            logger.error('Donnees problematiques dans sub_simad:', row);
          }
        }
        logger.info(`Traitement termine pour sub_simad : ${insertedCount} enregistrements insérés, ${errorCount} erreurs.`);
      } else {
        logger.warn('Aucune donnée à insérer dans sub_simad.');
      }

      logger.info('Extraction et chargement de sub_simad terminés avec succès.');
    } catch (error) {
      logger.error(`Erreur lors de l'extraction et du chargement de sub_simad: ${(error instanceof Error ? error.message : error)}`);
      throw error;
    } finally {
      if (connectionSource) connectionSource.release();
      if (connectionTarget) connectionTarget.release();
    }
  }
}
