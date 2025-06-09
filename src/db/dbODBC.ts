// import mysql from 'mysql2/promise';
import odbc from 'odbc';
import path from 'path';
import { fileURLToPath } from 'url';


// import 'dotenv/config'
import dotenv from 'dotenv';

// const envPath = path.resolve(__dirname, '..', '.env');
const currentUrl = import.meta.url;
const currentDir = path.dirname(fileURLToPath(currentUrl));
const envPath = path.resolve(currentDir, '..', '.env');
dotenv.config({ path: envPath });


// -------------------------------------------------------------------------------
// --            Création d'un pool de connexion pour la base CODEX via ODBC    --
// -------------------------------------------------------------------------------
/**
 * Crée un pool de connexion pour la base CODEX via ODBC
 * @returns Promise<odbc.Pool> Le pool de connexion
 */
async function createPoolCodexOdbc(): Promise<odbc.Pool> {
  try {
    const connectionConfig = {
      connectionString: `DSN=${process.env.CODEX_ODBC_NAME};
                         Uid=${process.env.CODEX_USER};
                         Pwd=${process.env.CODEX_PASSWORD};
                         CHARSET=UTF8`,
      connectionTimeout: 10,
      loginTimeout: 10,
    };

    const pool = await odbc.pool(connectionConfig);
    
    console.log('Pool BDD CODEX/ODBC ouvert');

    return pool;
  } catch (err) {
    console.error('Erreur à la connexion de CODEX/ODBC :', err);
    throw err;
  }
}



// -------------------------------------------------------------------------------
// --                          Ferme le pool CODEX via ODBC                     --
// -------------------------------------------------------------------------------
/**
 * Ferme le pool CODEX via ODBC
 * @param pool Le pool de connexion à fermer
 */
async function closePoolCodexOdbc(pool: odbc.Pool): Promise<void> {
  try {
    console.log('Fermeture du pool vers la BDD CODEX/ODBC');
    pool.close();
  } catch (err) {
    console.error('Erreur à la fermeture de la connexion de CODEX/ODBC :', err);
    throw err;
  }
}

export {
  createPoolCodexOdbc,
  closePoolCodexOdbc,
};

