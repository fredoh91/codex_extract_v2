import { BaseExtractor } from './base.js';
import { logger } from '../../utils/logger.js';

export class DashboardExtractor extends BaseExtractor {
  constructor(sourceConnection: any, targetConnection: any) {
    super(sourceConnection, targetConnection, 'dashboard_rs_5');
  }

  async extract(): Promise<void> {
    try {
      // Vider la table cible
      await this.truncateTable();

      // Requête source
      const sourceQuery = `
        SELECT DISTINCT
          VU.codeVU,
          VU.codeCIS,
          VU.codeDossier,
          VU.nomVU,
          Autorisation.libAbr AS typeProcedure,
          ClasseATC.libAbr AS CodeATC,
          ClasseATC.libCourt AS LibATC,
          VUElements.nomElement AS forme_pharma,
          VoieAdmin.libCourt AS voie_admin,
          StatutSpeci.libAbr AS statutSpecialite,
          StatutSpeci.codeTerme,
          VU.codeProduit,
          VUTitulaires.indicValide,
          Presentations.codeCIP13,
          Presentations.nomPresentation,
          NomsSubstance.nomSubstance,
          Composants.dosageLibra,
          (SELECT ClasseACP.libCourt
           FROM VUClassesACP
           INNER JOIN ClasseACP ON VUClassesACP.codeClasACP = ClasseACP.codeTerme
           WHERE VUClassesACP.codeVU = VU.codeVU
           AND ClasseACP.codeTermePere = 300) AS ClasseACP_libCourt
        FROM VU
        INNER JOIN Autorisation ON VU.codeAutorisation = Autorisation.codeTerme
        INNER JOIN VUClassesATC ON VU.codeVU = VUClassesATC.codeVU
        INNER JOIN ClasseATC ON VUClassesATC.codeClasATC = ClasseATC.codeTerme
        INNER JOIN VUTitulaires ON VU.codeVU = VUTitulaires.codeVU
        INNER JOIN StatutSpeci ON VU.codeStatut = StatutSpeci.codeTerme
        INNER JOIN VUElements ON VU.codeVU = VUElements.codeVU
        INNER JOIN VUVoiesAdmin ON VU.codeVU = VUVoiesAdmin.codeVU
        INNER JOIN VoieAdmin ON VUVoiesAdmin.codeVoie = VoieAdmin.codeTerme
        INNER JOIN Presentations ON VU.codeVU = Presentations.codeVU
        INNER JOIN Composants ON VU.codeVU = Composants.codeVU
        INNER JOIN NomsSubstance ON Composants.codeNomSubstance = NomsSubstance.codeNomSubstance
        WHERE StatutSpeci.codeTerme = 1
          AND VUTitulaires.indicValide = 1
          AND Presentations.flagActif = 0
          AND Composants.codeNature = 3
        ORDER BY VU.codeVU, Presentations.codeCIP13
      `;

      // Executer la requête source
      const results = await this.sourceConnection.query(sourceQuery);

      if (results.length > 0) {
        // Preparer la requête d'insertion
        const insertQuery = `
          INSERT INTO ${this.tableName} (
            codeVU, codeCIS, codeDossier, nomVU, typeProcedure,
            CodeATC, LibATC, forme_pharma, voie_admin, statutSpecialite,
            codeTerme, codeProduit, indicValide, codeCIP13, nomPresentation,
            nomSubstance, dosageLibra, ClasseACP_libCourt, date_extract
          ) VALUES ?
        `;

        // Transformer les donnees
        const values = results.map((row: any) => [
          row.codeVU,
          row.codeCIS,
          row.codeDossier,
          row.nomVU,
          row.typeProcedure,
          row.CodeATC,
          row.LibATC,
          row.forme_pharma,
          row.voie_admin,
          row.statutSpecialite,
          row.codeTerme,
          row.codeProduit,
          row.indicValide,
          row.codeCIP13,
          row.nomPresentation,
          row.nomSubstance,
          row.dosageLibra,
          row.ClasseACP_libCourt,
          new Date().toISOString().split('T')[0] // date_extract
        ]);

        // Inserer les donnees
        await this.targetConnection.query(insertQuery, [values]);
        this.logExtraction(results.length);
      }
    } catch (error) {
      console.error(`Erreur lors de l'extraction de ${this.tableName}:`, error);
      logger.error(`Erreur lors de l'extraction de ${this.tableName}:`, error);
      throw error;
    }
  }
} 