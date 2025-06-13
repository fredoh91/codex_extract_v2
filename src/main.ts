import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Configuration du chemin pour le fichier .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Chargement du fichier .env
dotenv.config({ path: resolve(__dirname, '../.env') });

import { createPoolCodexExtract, closePoolCodexExtract } from './db/mysql.js';
import { createPoolCodexOdbc, closePoolCodexOdbc } from './db/sybase.js';
import { logger } from './utils/logger.js';
import { SavuExtractor } from './services/extractors/savu.js';
import { VuutilExtractor } from './services/extractors/vuutil.js';
import { CodexcodeAtcExtractor } from './services/extractors/codexcodeAtc.js';
import { CodexpictoGrossesseExtractor } from './services/extractors/codexpictoGrossesse.js';
import { CodexpresentationExtractor } from './services/extractors/codexpresentation.js';
import { CodexvoieAdminExtractor } from './services/extractors/codexvoieAdmin.js';
import { DboComposantsHaumeaExtractor } from './services/extractors/dboComposantsHaumea.js';
import { DboContactHaumeaExtractor } from './services/extractors/dboContactHaumea.js';
import { DboDossierHaumeaExtractor } from './services/extractors/dboDossierHaumea.js';
import { DboNomsSubstanceHaumeaExtractor } from './services/extractors/dboNomsSubstanceHaumea.js';
import { DboVuHaumeaExtractor } from './services/extractors/dboVuHaumea.js';
import { DboVuTitulairesHaumeaExtractor } from './services/extractors/dboVuTitulairesHaumea.js';
import { VudelivranceExtractor } from './services/extractors/vudelivrance.js';
import { DashboardRs5Extractor } from './services/extractors/dashboardRs5.js';

async function main(): Promise<void> {
  let poolCodexExtract;
  let poolCodexOdbc;
  try {
    logger.info('Debut import : CODEX => CODEX_extract');
    
    poolCodexExtract = await createPoolCodexExtract();
    poolCodexOdbc = await createPoolCodexOdbc();

    // Creation et execution des extracteurs
    const savuExtractor = new SavuExtractor(poolCodexOdbc, poolCodexExtract);
    await savuExtractor.extract();

    const vuutilExtractor = new VuutilExtractor(poolCodexOdbc, poolCodexExtract);
    await vuutilExtractor.extract();

    const codexcodeAtcExtractor = new CodexcodeAtcExtractor(poolCodexOdbc, poolCodexExtract);
    await codexcodeAtcExtractor.extract();

    const codexpictoGrossesseExtractor = new CodexpictoGrossesseExtractor(poolCodexOdbc, poolCodexExtract);
    await codexpictoGrossesseExtractor.extract();

    const codexpresentationExtractor = new CodexpresentationExtractor(poolCodexOdbc, poolCodexExtract);
    await codexpresentationExtractor.extract();

    const codexvoieAdminExtractor = new CodexvoieAdminExtractor(poolCodexOdbc, poolCodexExtract);
    await codexvoieAdminExtractor.extract();

    const dboComposantsHaumeaExtractor = new DboComposantsHaumeaExtractor(poolCodexOdbc, poolCodexExtract);
    await dboComposantsHaumeaExtractor.extract();

    // Extraction des contacts
    const contactExtractor = new DboContactHaumeaExtractor(poolCodexOdbc, poolCodexExtract);
    await contactExtractor.extract();

    // Extraction des dossiers
    const dossierExtractor = new DboDossierHaumeaExtractor(poolCodexOdbc, poolCodexExtract);
    await dossierExtractor.extract();

    // Extraction des noms de substance
    const nomsSubstanceExtractor = new DboNomsSubstanceHaumeaExtractor(poolCodexOdbc, poolCodexExtract);
    await nomsSubstanceExtractor.extract();

    // Extraction des VU
    const vuExtractor = new DboVuHaumeaExtractor(poolCodexOdbc, poolCodexExtract);
    await vuExtractor.extract();

    // Extraction des VU titulaires
    const vuTitulairesExtractor = new DboVuTitulairesHaumeaExtractor(poolCodexOdbc, poolCodexExtract);
    await vuTitulairesExtractor.extract();

    const vudelivranceExtractor = new VudelivranceExtractor(poolCodexOdbc, poolCodexExtract);
    await vudelivranceExtractor.extract();

    const dashboardRs5Extractor = new DashboardRs5Extractor(poolCodexOdbc, poolCodexExtract, 100);
    await dashboardRs5Extractor.extract();

  } catch (error) {
    console.error('Erreur brute:', error);
    logger.error('Erreur lors du traitement:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      logger.error('Stack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    // Fermeture des pools
    if (poolCodexExtract) {
      await closePoolCodexExtract(poolCodexExtract);
    }
    if (poolCodexOdbc) {
      await closePoolCodexOdbc(poolCodexOdbc);
    }
  }
}

// Gestion des erreurs non capturees
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

// Lancement de l'application
main().catch((error) => {
  logger.error('Erreur dans le programme principal:', error);
  process.exit(1);
});