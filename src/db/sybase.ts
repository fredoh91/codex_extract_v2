import odbc from 'odbc';
import { logger } from '../utils/logger.js';
import { getCodexOdbcConfig } from '../config/database.js'; // Import de la fonction

let codexOdbcPool: odbc.Pool | null = null;

export async function createPoolCodexOdbc(): Promise<odbc.Pool> {
    if (!codexOdbcPool) {
        try {
            logger.info('Création du pool de connexions pour SYBASE ODBC CODEX...');
            const config = getCodexOdbcConfig(); // Appel de la fonction

            const connectionString = `DSN=${config.dsn};
                                      Uid=${config.uid};
                                      Pwd=${config.pwd};
                                      CHARSET=${config.charset}`;

            codexOdbcPool = await odbc.pool({ connectionString });
            logger.info('Pool SYBASE ODBC CODEX créé avec succès');
        } catch (error) {
            logger.error('ERREUR DE CONNEXION SYBASE ODBC CODEX:');
            logger.error(`   - Type: ${error instanceof Error ? error.constructor.name : typeof error}`);
            logger.error(`   - Message: ${error instanceof Error ? error.message : String(error)}`);
            if (error instanceof Error && 'odbcErrors' in error) {
                (error as any).odbcErrors.forEach((err: any, index: number) => {
                    logger.error(`     Erreur ${index + 1}:`);
                    logger.error(`       - Code: ${err.code}`);
                    logger.error(`       - État: ${err.state}`);
                    logger.error(`       - Message: ${err.message}`);
                });
            }
            logger.error('===============================');
            throw error;
        }
    }
    return codexOdbcPool;
}

export async function closePoolCodexOdbc(): Promise<void> {
    if (codexOdbcPool) {
        try {
            logger.info('Fermeture du pool SYBASE ODBC CODEX...');
            await codexOdbcPool.close();
            codexOdbcPool = null;
            logger.info('Pool SYBASE ODBC CODEX fermé avec succès');
        } catch (error) {
            logger.warn('Erreur non critique lors de la fermeture du pool SYBASE ODBC CODEX:', error);
            // Ne pas re-throw pour les erreurs non critiques de fermeture de pool
        }
    }
} 