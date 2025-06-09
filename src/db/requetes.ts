import {
  logger,
} from '../logs_config.js'

// Interfaces pour typer les données
interface CodeVUResult {
  codeVU: string;
}

interface CodexResult {
  codeVU: string;
  codeCIS: string;
  codeDossier: string;
  nomVU: string;
  typeProcedure: string;
  CodeATC: string;
  LibATC: string;
  forme_pharma: string;
  voie_admin: string;
  statutSpecialite: string;
  codeTerme: number;
  codeProduit: string;
  indicValide: number;
  codeCIP13: string;
  nomPresentation: string;
  nomSubstance: string;
  dosageLibra: string;
  ClasseACP_libCourt: string;
}

// Types pour les connexions
interface DbConnection {
  query(sql: string, values?: any[]): Promise<any>;
}

/**
 * Cette fonction renvoie un tableau de codeVU à traiter
 * permettant d'alimenter la requete d'import et de traiter les données par lot
 * 
 * @param {*} connectionCodexOdbc : connexion à la base CODEX via ODBC
 * @param {*} nbCodeVU : nombre de codeVU à traiter par lot
 * @returns : un tableau de codeVU à traiter
 */
async function donneTabCodeVU(connectionCodexOdbc: DbConnection, nbCodeVU: number): Promise<string[][]> {
    const SQL_CodeVU = `SELECT DISTINCT VU.codeVU
                                    FROM VU 
                                    INNER JOIN VUTitulaires 	ON VU.codeVU = VUTitulaires.codeVU
                                    INNER JOIN StatutSpeci 		ON VU.codeStatut = StatutSpeci.codeTerme
                                    INNER JOIN Presentations 	ON VU.codeVU = Presentations.codeVU
                                    INNER JOIN Composants	 	ON VU.codeVU = Composants.codeVU
                                    WHERE StatutSpeci.codeTerme = 1
                                    AND VUTitulaires.indicValide = 1
                                    AND Presentations.flagActif = 0
                                    AND Composants.codeNature = 3
                                    ;`
    try {
        const lstComplete = await connectionCodexOdbc.query(SQL_CodeVU);
        const codeVUArray = lstComplete.map((item: CodeVUResult) => item.codeVU);
        return chunkArray(codeVUArray, nbCodeVU);
    } catch (err) {
        console.error(err);
        throw err; // Propager l'erreur
    }
}

/**
 * Fonction de traitement des données CODEX proprement dite.
 * Les données sont récupérées depuis la base CODEX via ODBC, puis insérées dans la base CODEX_extract
 * 
 * @param {*} codeVUArray 
 * @param {*} connectionCodexOdbc 
 * @param {*} connectionCodexExtract 
 * @param {*} formattedDate 
 */
async function trtLotCodeVU(codeVUArray: string[], connectionCodexOdbc: DbConnection, connectionCodexExtract: DbConnection, formattedDate: string): Promise<void> {
    const codeVUString = codeVUArray.map(codeVU => `'${codeVU}'`).join(',');
    const sSQL_select = donneSQL_select(codeVUString);
    const results = await connectionCodexOdbc.query(sSQL_select);
    
    if (results.length > 0) {
        const SQL_insert = `INSERT INTO dashboard_rs_5 (
                            codeVU, 
                            codeCIS, 
                            codeDossier,
                            nomVU, 
                            typeProcedure, 
                            CodeATC, 
                            LibATC, 
                            forme_pharma, 
                            voie_admin, 
                            statutSpecialite, 
                            codeTerme, 
                            codeProduit, 
                            indicValide,
                            codeCIP13,
                            nomPresentation,
                            nomSubstance,
                            dosageLibra, 
                            ClasseACP_libCourt,
                            date_extract) VALUES ?`;
        const values = results.map((row: CodexResult) => [
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
            formattedDate
        ]);                          
        await connectionCodexExtract.query(SQL_insert, [values]);
        logger.info(`Insertion de ${results.length} lignes dans dashboard_rs_5`);
    }
}

/**
 * Cette fonction renvoie la requête SQL permettant de récupérer les données CODEX
 * 
 * @param {*} lstCodeVU_string : liste des codeVU à traiter, sous forme de chaine de caractères.
 *                                Ce paramètre est optionnel, si non renseigné, la requête retournera l'ensemble des données CODEX
 * @returns : requête SQL sous forme de chaine de caractère
 */
function donneSQL_select(lstCodeVU_string: string = ''): string {
    const sSQL_select = `SELECT DISTINCT
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
                            Composants.dosageLibra
                            ,
                          (SELECT ClasseACP.libCourt
                              FROM VUClassesACP
                              INNER JOIN ClasseACP ON VUClassesACP.codeClasACP = ClasseACP.codeTerme
                              WHERE VUClassesACP.codeVU = VU.codeVU
                              AND ClasseACP.codeTermePere = 300) AS ClasseACP_libCourt	
                          FROM VU
                          INNER JOIN Autorisation 	ON VU.codeAutorisation = Autorisation.codeTerme
                          INNER JOIN VUClassesATC 	ON VU.codeVU = VUClassesATC.codeVU
                          INNER JOIN ClasseATC 		ON VUClassesATC.codeClasATC = ClasseATC.codeTerme
                          INNER JOIN VUTitulaires 	ON VU.codeVU = VUTitulaires.codeVU
                          INNER JOIN StatutSpeci 		ON VU.codeStatut = StatutSpeci.codeTerme
                          INNER JOIN VUElements 		ON VU.codeVU = VUElements.codeVU
                          INNER JOIN VUVoiesAdmin	 	ON VU.codeVU = VUVoiesAdmin.codeVU
                          INNER JOIN VoieAdmin	 	ON VUVoiesAdmin.codeVoie = VoieAdmin.codeTerme
                          INNER JOIN Presentations 	ON VU.codeVU = Presentations.codeVU
                          INNER JOIN Composants	 	ON VU.codeVU = Composants.codeVU
                          INNER JOIN NomsSubstance 	ON Composants.codeNomSubstance = NomsSubstance.codeNomSubstance
                          WHERE StatutSpeci.codeTerme = 1
                            AND VUTitulaires.indicValide = 1
                            AND Presentations.flagActif = 0
                            AND Composants.codeNature = 3
                            ${lstCodeVU_string ? `AND VU.codeVU IN (${lstCodeVU_string})` : ''}
                          ORDER BY VU.codeVU, Presentations.codeCIP13
                            `;  
    return sSQL_select;
}
  
/**
 * Découpe un tableau de codeVU en plusieurs tableaux de taille égale "chunkSize"
 * Chaque tableau de second niveau correspondra aun lot à traiter
 * @param {*} array 
 * @param {*} chunkSize 
 * @returns 
 */
function chunkArray(array: string[], chunkSize: number): string[][] {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        result.push(chunk);
    }
    return result;
}

export {
    donneTabCodeVU,
    trtLotCodeVU,
    donneSQL_select,
    chunkArray
};