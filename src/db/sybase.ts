import odbc from 'odbc';
import { logger } from '../utils/logger.js';

export async function createPoolCodexOdbc(): Promise<odbc.Pool> {
    try {
        // console.log('=== DIAGNOSTIC CONNEXION SYBASE ===');
        // console.log('1. Vérification des variables d\'environnement:');
        // console.log(`   - CODEX_DSN: ${process.env.CODEX_DSN ? '✓ Configuré' : '✗ Non configuré'}`);
        // console.log(`   - CODEX_USER: ${process.env.CODEX_USER ? '✓ Configuré' : '✗ Non configuré'}`);
        // console.log(`   - CODEX_PASSWORD: ${process.env.CODEX_PASSWORD ? '✓ Configuré' : '✗ Non configuré'}`);
        // console.log('\n2. Tentative de création du pool...');
        const pool = await odbc.pool({
            connectionString: `DSN=${process.env.CODEX_DSN};
                         Uid=${process.env.CODEX_USER};
                         Pwd=${process.env.CODEX_PASSWORD};
                         CHARSET=UTF8`
        });
        console.log('Pool SYBASE ODBC créé avec succès');
        logger.info('Pool SYBASE ODBC créé avec succès');
        return pool;
    } catch (error) {
        console.log('\n3. ERREUR DE CONNEXION:');
        logger.error('\n3. ERREUR DE CONNEXION:');
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

export async function closePoolCodexOdbc(pool: odbc.Pool): Promise<void> {
    try {
        await pool.close();
    } catch (error) {
        console.error('Erreur lors de la fermeture du pool ODBC:', error);
        logger.error('Erreur lors de la fermeture du pool ODBC:', error);
        throw error;
    }
} 