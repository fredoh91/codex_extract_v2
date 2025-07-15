import { Pool as MysqlPool } from 'mysql2/promise';
import { Pool as OdbcPool } from 'odbc';
import { logger } from '../../utils/logger.js';
import { getDboContactHaumeaQuery } from '../../db/queries/source.js';
import { insertDboContactHaumeaQuery } from '../../db/queries/target.js';
import { truncateTable } from '../truncateTable.js';

export class DboContactHaumeaExtractor {
  private sourcePool: OdbcPool;
  private targetPool: MysqlPool;

  constructor(sourcePool: OdbcPool, targetPool: MysqlPool) {
    this.sourcePool = sourcePool;
    this.targetPool = targetPool;
  }

  async extract(): Promise<void> {
    try {
      // 1. Vider la table cible
      logger.info('Vidage de la table dbo_contact_haumea...');
      await truncateTable(this.targetPool, 'dbo_contact_haumea');
      logger.info('Table dbo_contact_haumea videe avec succes');

      // 2. Executer la requête source
      logger.info('Extraction des donnees de contacts...');
      const sourceQuery = getDboContactHaumeaQuery();
      const sourceResult = await this.sourcePool.query(sourceQuery);

      if (!sourceResult || !Array.isArray(sourceResult)) {
        throw new Error('Resultat de la requête source invalide');
      }

      const rows = sourceResult;
      if (rows.length === 0) {
        logger.warn('Aucune donnee trouvee pour les contacts');
        return;
      }

      logger.info(`${rows.length} contacts trouves`);

      // 3. Inserer les donnees dans la table cible
      logger.info('Insertion des donnees dans dbo_contact_haumea...');
      const insertQuery = insertDboContactHaumeaQuery();
      let insertedCount = 0;
      let errorCount = 0;
      const logFrequency = parseInt(process.env.NB_LIGNES_DEBUG_DBOCONTACTHAUMEA || '1000');

      for (const row of rows) {
        try {
          await this.targetPool.query(insertQuery, [
            row.codeContact,
            row.codePays,
            row.codeGroupeLabo,
            row.nomContact,
            row.libRech,
            row.codeAMM,
            row.codeLibra,
            row.codeMuse,
            row.nomContactLibra,
            row.adresseContact,
            row.adresseCompl,
            row.codePost,
            row.nomVille,
            row.telContact,
            row.faxContact,
            row.nomResponsable,
            row.indicCandidat,
            row.dateCreation,
            row.dateDernModif,
            row.codeOrigine,
            row.remContact,
            row.flagActif,
            row.codeModif
          ]);
          insertedCount++;
          
          // Log selon la fréquence configurée
          if (insertedCount % logFrequency === 0) {
            const now = new Date();
            const dateStr = now.toLocaleString('fr-FR', { hour12: false });
            console.log(`[${dateStr}] ${insertedCount} enregistrements inseres...`);
          }
          
        } catch (error) {
          errorCount++;
          logger.error(`Erreur lors de l'insertion de l'enregistrement:`, error);
          logger.error('Donnees problematiques:', row);
        }
      }

      logger.info(`Traitement termine : ${insertedCount} enregistrements inseres, ${errorCount} erreurs`);

    } catch (error) {
      logger.error('Erreur lors de l\'extraction des contacts:', error);
      throw error;
    }
  }
} 