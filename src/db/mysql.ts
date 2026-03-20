import mysql from 'mysql2/promise';
import { getCodexExtractConfig } from '../config/database.js'; // Import de la fonction
import { logger } from '../utils/logger.js';

let codexExtractPool: mysql.Pool | null = null;

export async function createPoolCodexExtract(): Promise<mysql.Pool> {
  if (!codexExtractPool) {
    try {
      logger.info('Création du pool de connexions pour CODEX_EXTRACT...');
      codexExtractPool = mysql.createPool(getCodexExtractConfig()); // Appel de la fonction
      logger.info('Pool MySQL CODEX_EXTRACT créé avec succès');
    } catch (error) {
      logger.error('Erreur lors de la création du pool MySQL CODEX_EXTRACT:', error);
      throw error;
    }
  }
  return codexExtractPool;
}

export async function closePoolCodexExtract(): Promise<void> {
  if (codexExtractPool) {
    try {
      logger.info('Fermeture du pool MySQL CODEX_EXTRACT...');
      await codexExtractPool.end();
      codexExtractPool = null;
      logger.info('Pool MySQL CODEX_EXTRACT fermé avec succès');
    } catch (error) {
      logger.error('Erreur lors de la fermeture du pool MySQL CODEX_EXTRACT:', error);
      throw error;
    }
  }
} 