import mysql from 'mysql2/promise';

export async function createPoolCodexExtract(): Promise<mysql.Pool> {
  try {
    // console.log('Configuration MySQL:');
    // console.log('- Host:', process.env.CODEX_EXTRACT_HOST);
    // console.log('- User:', process.env.CODEX_EXTRACT_USER);
    // console.log('- Database:', process.env.CODEX_EXTRACT_DATABASE);
    
    const pool = mysql.createPool({
      host: process.env.CODEX_EXTRACT_HOST,
      user: process.env.CODEX_EXTRACT_USER,
      password: process.env.CODEX_EXTRACT_PASSWORD,
      database: process.env.CODEX_EXTRACT_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    console.log('Pool MySQL cree avec succes');
    return pool;
  } catch (error) {
    console.error('Erreur lors de la creation du pool MySQL:', error);
    throw error;
  }
}

export async function closePoolCodexExtract(pool: mysql.Pool): Promise<void> {
  try {
    await pool.end();
    console.log('Pool MySQL ferme avec succes');
  } catch (error) {
    console.error('Erreur lors de la fermeture du pool MySQL:', error);
    throw error;
  }
} 