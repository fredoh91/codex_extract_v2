import mysql from 'mysql2/promise';
import { getDbBnpvMiroirConfig } from '../config/database.js'; // Import de la fonction
import { logger } from '../utils/logger.js'; // Assumer que le logger est disponible

let bnpvMiroirPool: mysql.Pool | null = null;

export function createPoolBnpvExtract(): mysql.Pool {
  if (!bnpvMiroirPool) {
    logger.info('Création du pool de connexions pour BNPV_MIROIR...');
    bnpvMiroirPool = mysql.createPool(getDbBnpvMiroirConfig()); // Appel de la fonction
  }
  return bnpvMiroirPool;
}

export async function closePoolBnpvExtract(): Promise<void> {
  if (bnpvMiroirPool) {
    logger.info('Fermeture du pool de connexions pour BNPV_MIROIR...');
    await bnpvMiroirPool.end();
    bnpvMiroirPool = null;
  }
}
