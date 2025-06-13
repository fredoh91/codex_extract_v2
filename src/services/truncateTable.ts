import { Pool as MysqlPool } from 'mysql2/promise';
import { logger } from '../utils/logger.js';

export async function truncateTable(pool: MysqlPool, tableName: string): Promise<void> {
  try {
    // Désactiver les clés étrangères
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Truncate la table
    await pool.query(`TRUNCATE TABLE ${tableName}`);
    
    // Réactiver les clés étrangères
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    
    logger.info(`Table ${tableName} videe avec succes`);
  } catch (error) {
    logger.error(`Erreur lors du vidage de la table ${tableName}:`, error);
    throw error;
  }
} 