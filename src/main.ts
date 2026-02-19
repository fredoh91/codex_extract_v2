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
import { createPoolMocatorOdbc, closePoolMocatorOdbc } from './db/mocator.js';
import { createPoolBnpvExtract, closePoolBnpvExtract } from './db/mysqlBnpv.js'; // Nouveau
import { logger } from './utils/logger.js';
import { insertDatesLancementsExtractionsQuery } from './db/queries/target.js';
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
import { SubSimadExtractor } from './services/extractors/subSimad.js';
import { DashboardRs5Extractor } from './services/extractors/dashboardRs5.js';
import { MocatorDocumentExtractor } from './services/extractors/mocatordocument.js';
import { MocatorDocumentHtmlExtractor } from './services/extractors/mocatordocument_html.js';
import { MocatorDocumentXmlExtractor } from './services/extractors/mocatordocument_xml.js';

async function main(): Promise<void> {
  let poolCodexExtract;
  let poolCodexOdbc; // Maintenu pour être passé aux constructeurs des extracteurs
  let poolMocatorOdbc; // Maintenu pour être passé aux constructeurs des extracteurs
  let poolBnpvExtract; // Nouvelle déclaration
  const extractionStart = new Date();
  let nbTablesExtraites = 0;
  try {
    logger.info('Debut import : CODEX => CODEX_extract');
    
    poolCodexExtract = await createPoolCodexExtract();
    poolCodexOdbc = await createPoolCodexOdbc(); // Assigne l'instance singleton
    poolMocatorOdbc = await createPoolMocatorOdbc(); // Assigne l'instance singleton
    poolBnpvExtract = createPoolBnpvExtract(); // Nouvelle initialisation


    // //Creation et execution des extracteurs
    const savuExtractor = new SavuExtractor(poolCodexOdbc, poolCodexExtract);
    await savuExtractor.extract();
    nbTablesExtraites++;

    const vuutilExtractor = new VuutilExtractor(poolCodexOdbc, poolCodexExtract);
    await vuutilExtractor.extract();
    nbTablesExtraites++;

    const codexcodeAtcExtractor = new CodexcodeAtcExtractor(poolCodexOdbc, poolCodexExtract);
    await codexcodeAtcExtractor.extract();
    nbTablesExtraites++;

    const codexpictoGrossesseExtractor = new CodexpictoGrossesseExtractor(poolCodexOdbc, poolCodexExtract);
    await codexpictoGrossesseExtractor.extract();
    nbTablesExtraites++;

    const codexpresentationExtractor = new CodexpresentationExtractor(poolCodexOdbc, poolCodexExtract);
    await codexpresentationExtractor.extract();
    nbTablesExtraites++;

    const codexvoieAdminExtractor = new CodexvoieAdminExtractor(poolCodexOdbc, poolCodexExtract);
    await codexvoieAdminExtractor.extract();
    nbTablesExtraites++;

    const dboComposantsHaumeaExtractor = new DboComposantsHaumeaExtractor(poolCodexOdbc, poolCodexExtract);
    await dboComposantsHaumeaExtractor.extract();
    nbTablesExtraites++;

    const contactExtractor = new DboContactHaumeaExtractor(poolCodexOdbc, poolCodexExtract);
    await contactExtractor.extract();
    nbTablesExtraites++;

    const dossierExtractor = new DboDossierHaumeaExtractor(poolCodexOdbc, poolCodexExtract);
    await dossierExtractor.extract();
    nbTablesExtraites++;

    const nomsSubstanceExtractor = new DboNomsSubstanceHaumeaExtractor(poolCodexOdbc, poolCodexExtract);
    await nomsSubstanceExtractor.extract();
    nbTablesExtraites++;

    const vuExtractor = new DboVuHaumeaExtractor(poolCodexOdbc, poolCodexExtract);
    await vuExtractor.extract();
    nbTablesExtraites++;

    const vuTitulairesExtractor = new DboVuTitulairesHaumeaExtractor(poolCodexOdbc, poolCodexExtract);
    await vuTitulairesExtractor.extract();
    nbTablesExtraites++;

    const vudelivranceExtractor = new VudelivranceExtractor(poolCodexOdbc, poolCodexExtract);
    await vudelivranceExtractor.extract();
    nbTablesExtraites++;

    const subSimadExtractor = new SubSimadExtractor(poolCodexExtract); // Correction ici
    await subSimadExtractor.extract();
    nbTablesExtraites++;

    const dashboardRs5Extractor = new DashboardRs5Extractor(poolCodexOdbc, poolCodexExtract, 100);
    await dashboardRs5Extractor.extract();
    nbTablesExtraites++;
    
    // Extraction MOCATOR -> CODEX_extract
    const mocatorDocumentExtractor = new MocatorDocumentExtractor(poolMocatorOdbc, poolCodexExtract);
    await mocatorDocumentExtractor.extract();
    nbTablesExtraites++;

    const mocatorDocumentHtmlExtractor = new MocatorDocumentHtmlExtractor(poolMocatorOdbc, poolCodexExtract);
    await mocatorDocumentHtmlExtractor.extract();
    nbTablesExtraites++;

    const mocatorDocumentXmlExtractor = new MocatorDocumentXmlExtractor(poolMocatorOdbc, poolCodexExtract);
    await mocatorDocumentXmlExtractor.extract();
    nbTablesExtraites++;

  } catch (error) {
    logger.error('Erreur brute:', error);
    logger.error('Erreur lors du traitement:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      logger.error('Stack trace:', error.stack);
    }
    process.exit(1);
  } finally {
    // Enregistrement de la date de fin et du nombre de tables extraites
    const extractionEnd = new Date();
    if (poolCodexExtract) {
      try {
        const insertQuery = insertDatesLancementsExtractionsQuery();
        await poolCodexExtract.query(insertQuery, [
          extractionStart,
          extractionEnd,
          nbTablesExtraites
        ]);
        logger.info('Dates d\'extraction et nombre de tables extraites enregistrés dans dates_lancements_extractions.');
      } catch (err) {
        logger.error('Erreur lors de l\'insertion dans dates_lancements_extractions:', err);
      }
      await closePoolCodexExtract();
    }
    await closePoolCodexOdbc(); // Appel direct de la fonction de fermeture singleton
    await closePoolMocatorOdbc(); // Appel direct de la fonction de fermeture singleton
    // Fermeture du pool BNPV Miroir
    if (poolBnpvExtract) {
      try {
        await closePoolBnpvExtract();
      } catch (err) {
        logger.warn('Erreur non critique lors de la fermeture du pool BNPV Miroir:', err);
      }
    }
    logger.info('Fin import');
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