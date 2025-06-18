import { Pool as MysqlPool } from 'mysql2/promise';
import { Pool as OdbcPool } from 'odbc';
import { logger } from '../../utils/logger.js';
import { getVuutilQuery } from '../../db/queries/source.js';
import { truncateTable } from '../truncateTable.js';

export class VuutilExtractor {
  private sourcePool: OdbcPool;
  private targetPool: MysqlPool;

  constructor(sourcePool: OdbcPool, targetPool: MysqlPool) {
    this.sourcePool = sourcePool;
    this.targetPool = targetPool;
  }

  async extract(): Promise<void> {
    try {
      // 1. Vider la table cible
      logger.info('Vidage de la table vuutil...');
      await truncateTable(this.targetPool, 'vuutil');
      logger.info('Table vuutil videe avec succes');

      // 2. Executer la requête source
      logger.info('Extraction des donnees VU...');
      const sourceQuery = getVuutilQuery();
      logger.info('Requete source executee');
      
      const sourceResult = await this.sourcePool.query(sourceQuery);

      if (!sourceResult || !Array.isArray(sourceResult)) {
        throw new Error('Resultat de la requête source invalide');
      }

      const rows = sourceResult;
      if (rows.length === 0) {
        logger.warn('Aucune donnee trouvee pour les VU');
        return;
      }

      logger.info(`${rows.length} VU trouves`);

      // // 3. Afficher le premier enregistrement pour debug
      // const firstRow = rows[0];
      // logger.info('=== PREMIER ENREGISTREMENT ===');
      // logger.info('Proprietes disponibles: ' + Object.keys(firstRow).join(', '));
      
      // // Afficher les valeurs importantes pour debug
      // logger.info(`paysLibAbr: ${firstRow.paysLibAbr}`);
      // logger.info(`codeProduit: ${firstRow.codeProduit}`);
      // logger.info('=============================');

      // 4. Traiter toutes les lignes
      const rowsToProcess = rows;
      logger.info(`Traitement de ${rowsToProcess.length} lignes`);

      // // 5. Test progressif - tester avec 29 colonnes (complet) sur toutes les lignes
      // logger.info('=== TEST PROGRESSIF - 29 COLONNES (COMPLET) - TOUTES LES LIGNES ===');
      
      const columns = [
        'code_vu',
        'code_cis', 
        'code_dossier',
        'nom_vu',
        'dbo_autorisation_lib_abr',
        'dbo_classe_atc_lib_abr',
        'dbo_classe_atc_lib_court',
        'code_contact',
        'nom_contact_libra',
        'adresse_contact',
        'adresse_compl',
        'code_post',
        'nom_ville',
        'tel_contact',
        'fax_contact',
        'dbo_pays_lib_court',
        'dbo_statut_speci_lib_abr',
        'statut_abrege',
        'code_acteur',
        'code_tigre',
        'nom_acteur_long',
        'adresse',
        'adresse_compl_expl',
        'code_post_expl',
        'nom_ville_expl',
        'complement',
        'tel',
        'fax',
        'dbo_pays_lib_abr',
        'code_produit'
      ];

      const insertQuery = `INSERT INTO vuutil (${columns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')});`;
      
      // logger.info('Insertion avec 29 colonnes...');
      
      let insertedCount = 0;
      let errorCount = 0;
      const logFrequency = parseInt(process.env.NB_LIGNES_DEBUG_VUUTIL || '1000');

      for (const row of rowsToProcess) {
        try {
          const values = [
            row.codeVU,
            row.codeCIS,
            row.codeDossier,
            row.nomVU,
            row.autorisationLibAbr,
            row.classeATCLibAbr,
            row.classeATCLibCourt,
            row.codeContact,
            row.nomContactLibra,
            row.adresseContact,
            row.adresseCompl,
            row.codePost,
            row.nomVille,
            row.telContact,
            row.faxContact,
            row.paysLibCourt,
            row.statutSpeciLibAbr,
            row.statutAbrege,
            row.codeActeur,
            row.codeTigre,
            row.nomActeurLong,
            row.adresse,
            row.adresseComplExpl,
            row.codePostExpl,
            row.nomVilleExpl,
            row.complement,
            row.tel,
            row.fax,
            row.paysLibAbr,
            row.codeProduit
          ];

          await this.targetPool.query(insertQuery, values);
          insertedCount++;
          
          // Log selon la fréquence configurée
          if (insertedCount % logFrequency === 0) {
            logger.info(`${insertedCount} enregistrements inseres...`);
          }
          
        } catch (error) {
          errorCount++;
          logger.error(`Erreur lors de l'insertion de la ligne ${insertedCount + errorCount}:`, error);
          logger.error('Donnees problematiques:', row);
        }
      }

      logger.info(`Traitement termine : ${insertedCount} enregistrements inseres, ${errorCount} erreurs`);

    } catch (error) {
      logger.error('Erreur lors de l\'extraction des VU: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  }
} 