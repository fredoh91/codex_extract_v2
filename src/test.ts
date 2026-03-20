import { config } from 'dotenv';
import { createPoolCodexExtract, closePoolCodexExtract } from './db/mysql.js';
import { logger } from './utils/logger.js';

// Chargement des variables d'environnement
config();

async function main(): Promise<void> {
  let poolCodexExtract;
  try {
    logger.info('Test de connexion et de truncate');

    // Creation du pool MySQL
    poolCodexExtract = await createPoolCodexExtract();

    // Test du truncate
    const connection = await poolCodexExtract.getConnection();
    try {
      await connection.beginTransaction();
      
      // Desactiver les cles etrangeres
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      logger.info('Cles etrangeres desactivees');
      
      // Truncate
      await connection.query('TRUNCATE TABLE savu');
      logger.info('Table savu videe');
      
      // Reactiver les cles etrangeres
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      logger.info('Cles etrangeres reactivees');
      
      await connection.commit();
      logger.info('Transaction validee');
    } catch (error) {
      await connection.rollback();
      logger.error('Erreur SQL:', error);
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    logger.error('Erreur lors du test:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      logger.error('Stack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    // Fermeture du pool
    if (poolCodexExtract) {
      await closePoolCodexExtract();
    }
  }
}

main();