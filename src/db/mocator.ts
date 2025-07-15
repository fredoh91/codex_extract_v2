import odbc from 'odbc';

export async function createPoolMocatorOdbc(): Promise<odbc.Pool> {
    try {
        const pool = await odbc.pool({
            connectionString: `DSN=${process.env.MOCATOR_DSN};\nUid=${process.env.MOCATOR_USER};\nPwd=${process.env.MOCATOR_PASSWORD};\nCHARSET=UTF8`
        });
        console.log('Pool MOCATOR ODBC créé avec succès');
        return pool;
    } catch (error) {
        console.log('\nERREUR DE CONNEXION MOCATOR:');
        console.log(`   - Type: ${error instanceof Error ? error.constructor.name : typeof error}`);
        console.log(`   - Message: ${error instanceof Error ? error.message : String(error)}`);
        if (error instanceof Error && 'odbcErrors' in error) {
            console.log('   - Détails ODBC:');
            (error as any).odbcErrors.forEach((err: any, index: number) => {
                console.log(`     Erreur ${index + 1}:`);
                console.log(`       - Code: ${err.code}`);
                console.log(`       - État: ${err.state}`);
                console.log(`       - Message: ${err.message}`);
            });
        }
        console.log('===============================');
        throw error;
    }
}

export async function closePoolMocatorOdbc(pool: odbc.Pool): Promise<void> {
    try {
        await pool.close();
    } catch (error) {
        console.error('Erreur lors de la fermeture du pool ODBC MOCATOR:', error);
        throw error;
    }
} 