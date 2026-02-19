import odbc from 'odbc';
import { logger } from '../utils/logger.js';
import { getMocatorOdbcConfig } from '../config/database.js'; // Import de la fonction

let mocatorOdbcPool: odbc.Pool | null = null;

export async function createPoolMocatorOdbc(): Promise<odbc.Pool> {
    if (!mocatorOdbcPool) {
        try {
            logger.info('Création du pool de connexions pour MOCATOR ODBC...');
            const config = getMocatorOdbcConfig(); // Appel de la fonction
            const connectionString = `DSN=${config.dsn};\nUid=${config.uid};\nPwd=${config.pwd};\nCHARSET=${config.charset}`;
            mocatorOdbcPool = await odbc.pool({ connectionString });
            logger.info('Pool MOCATOR ODBC créé avec succès');
        } catch (error) {
            logger.error('\nERREUR DE CONNEXION MOCATOR ODBC:');
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
    return mocatorOdbcPool;
}

export async function closePoolMocatorOdbc(): Promise<void> {
    if (mocatorOdbcPool) {
        try {
            logger.info('Fermeture du pool MOCATOR ODBC...');
            await mocatorOdbcPool.close();
            mocatorOdbcPool = null;
            logger.info('Pool MOCATOR ODBC fermé avec succès');
        } catch (error) {
            logger.warn('Erreur non critique lors de la fermeture du pool MOCATOR ODBC:', error);
            // Ne pas re-throw pour les erreurs non critiques de fermeture de pool
        }
    }
}