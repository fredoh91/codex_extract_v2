import { 
  createPoolCodexExtract,
  closePoolCodexExtract,
} from './db/dbMySQL.js';

import { 
  createPoolCodexOdbc,
  closePoolCodexOdbc,
} from './db/dbODBC.js';

import {
  donneTabCodeVU,
  trtLotCodeVU,
} from './db/requetes.js';

import { 
  logger,
} from './logs_config.js'

import {
  donneformattedDate,
} from './util.js'

import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';

const currentUrl = import.meta.url;
const currentDir = path.dirname(fileURLToPath(currentUrl));
const envPath = path.resolve(currentDir, '..', '.env');
dotenv.config({ path: envPath });

// Nombre total de lignes à traiter pour les tests
const NB_CODEVU_A_TRAITER_PAR_LOT = parseInt(process.env.NB_CODEVU_A_TRAITER_PAR_LOT ?? '100', 10);

/**
 * Fonction principale
 */
const main = async (): Promise<void> => {
  if (process.env.TYPE_EXECUTION === 'Prod') {
    process.on('uncaughtException', (err: Error) => {
      const stackLines = err.stack?.split('\n') ?? [];
      const location = stackLines[1]?.trim() ?? 'Unknown location';
      logger.error(`Uncaught Exception: ${err.message}`);
      logger.error(`Location: ${location}`);
      logger.error(err.stack);
    });
  
    process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
      const error = reason as Error;
      const stackLines = error.stack?.split('\n') ?? [];
      const location = stackLines[1]?.trim() ?? 'Unknown location';
      logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
      logger.error(`Location: ${location}`);
      logger.error(error.stack);
    });
  }
  
  logger.info('Début import : CODEX => CODEX_extract');
  
  const poolCodexExtract = await createPoolCodexExtract();
  const connectionCodexExtract = await poolCodexExtract.getConnection();
  
  const poolCodexOdbc = await createPoolCodexOdbc();
  const connectionCodexOdbc = await poolCodexOdbc.connect();
  
  const formattedDate = donneformattedDate();

  // TRUNCATE dans CODEX_extract
  const SQL_truncate = `TRUNCATE TABLE dashboard_rs_5 ;`
  await connectionCodexExtract.query(SQL_truncate);

  // permet de couper la liste des codeVU à traiter en lots de NB_CODEVU_A_TRAITER_PAR_LOT
  const lstCodeVU = await donneTabCodeVU(connectionCodexOdbc, NB_CODEVU_A_TRAITER_PAR_LOT);

  // Traitement par lot
  const promises_trtCodeVU: Promise<void>[] = lstCodeVU.map((codeVUArray: string[]): Promise<void> => {
    return trtLotCodeVU(codeVUArray, connectionCodexOdbc, connectionCodexExtract, formattedDate);
  });

  // pour attendre la fin de tous les traitements trtLotCodeVU
  await Promise.all(promises_trtCodeVU);

  await closePoolCodexExtract(poolCodexExtract);
  await closePoolCodexOdbc(poolCodexOdbc);

  logger.info('Fin import : CODEX => CODEX_extract');
}

main().catch((error) => {
  logger.error('Erreur dans le programme principal:', error);
  process.exit(1);
});