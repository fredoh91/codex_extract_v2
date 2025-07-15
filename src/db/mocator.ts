import odbc from 'odbc';
import { logger } from '../utils/logger.js';

export async function createPoolMocatorOdbc(): Promise<odbc.Pool> {
    try {
        const pool = await odbc.pool({
            connectionString: `DSN=${process.env.MOCATOR_DSN};\nUid=${process.env.MOCATOR_USER};\nPwd=${process.env.MOCATOR_PASSWORD};\nCHARSET=UTF8`
        });
        console.log('Pool MOCATOR ODBC créé avec succès');
        logger.info('Pool MOCATOR ODBC créé avec succès');
        return pool;
    } catch (error) {
        console.log('\nERREUR DE CONNEXION MOCATOR:');
        logger.error('\nERREUR DE CONNEXION MOCATOR:');
        console.log(`   - Type: ${error instanceof Error ? error.constructor.name : typeof error}`);
        logger.error(`   - Type: ${error instanceof Error ? error.constructor.name : typeof error}`);
        console.log(`   - Message: ${error instanceof Error ? error.message : String(error)}`);
        logger.error(`   - Message: ${error instanceof Error ? error.message : String(error)}`);
        if (error instanceof Error && 'odbcErrors' in error) {
            console.log('   - Détails ODBC:');
            logger.error('   - Détails ODBC:');
            (error as any).odbcErrors.forEach((err: any, index: number) => {
                console.log(`     Erreur ${index + 1}:`);
                logger.error(`     Erreur ${index + 1}:`);
                console.log(`       - Code: ${err.code}`);
                logger.error(`       - Code: ${err.code}`);
                console.log(`       - État: ${err.state}`);
                logger.error(`       - État: ${err.state}`);
                console.log(`       - Message: ${err.message}`);
                logger.error(`       - Message: ${err.message}`);
            });
        }
        console.log('===============================');
        logger.error('===============================');
        throw error;
    }
}

export async function closePoolMocatorOdbc(pool: odbc.Pool): Promise<void> {
    try {
        await pool.close();
    } catch (error) {
        console.error('Erreur lors de la fermeture du pool ODBC MOCATOR:', error);
        logger.error('Erreur lors de la fermeture du pool ODBC MOCATOR:', error);
        throw error;
    }
} 