import { Pool as OdbcPool } from 'odbc';
import { Pool as MysqlPool } from 'mysql2/promise';
import { logger } from '../../utils/logger.js';
import { getDashboardRs5Query, getDashboardRs5CodeVUQuery } from '../../db/queries/source.js';
import { insertDashboardRs5Query } from '../../db/queries/target.js';
import { BaseExtractor } from './base.js';
import { truncateTable } from '../truncateTable.js';

interface DashboardRs5Data {
  code_vu: string;
  code_cis: string;
  code_dossier: string;
  nom_vu: string;
  type_procedure: string;
  code_atc: string;
  lib_atc: string;
  forme_pharma: string;
  voie_admin: string;
  statut_specialite: string;
  code_terme: string;
  code_produit: string;
  indic_valide: number;
  code_cip13: string | null;
  nom_presentation: string;
  nom_substance: string;
  dosage_libra: string;
  classe_acp_lib_court: string | null;
  date_extract: string;
}

export class DashboardRs5Extractor extends BaseExtractor {
  private readonly initialBatchSize: number; // Taille des lots pour la récupération des codes VU
  private readonly insertionBatchSize: number; // Taille des lots pour le traitement avant l'insertion SQL
  private readonly logFrequency: number; // Taille des morceaux pour l'insertion SQL et la fréquence de log

  protected sourcePool: OdbcPool;
  protected targetPool: MysqlPool;

  constructor(sourcePool: OdbcPool, targetPool: MysqlPool, initialBatchSize: number = 50000, insertionBatchSize: number = 5000, logFrequency: number = 1000) {
    super(sourcePool, targetPool, 'dashboard_rs5');
    this.initialBatchSize = initialBatchSize;
    this.insertionBatchSize = insertionBatchSize;
    this.logFrequency = logFrequency;
    this.sourcePool = sourcePool;
    this.targetPool = targetPool;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "''")}'`;
    }
    return value.toString();
  }

  private formatRow(row: DashboardRs5Data): string {
    return `(${[
      this.formatValue(row.code_vu),
      this.formatValue(row.code_cis),
      this.formatValue(row.code_dossier),
      this.formatValue(row.nom_vu),
      this.formatValue(row.type_procedure),
      this.formatValue(row.code_atc),
      this.formatValue(row.lib_atc),
      this.formatValue(row.forme_pharma),
      this.formatValue(row.voie_admin),
      this.formatValue(row.statut_specialite),
      this.formatValue(row.code_terme),
      this.formatValue(row.code_produit),
      this.formatValue(row.indic_valide),
      this.formatValue(row.code_cip13),
      this.formatValue(row.nom_presentation),
      this.formatValue(row.nom_substance),
      this.formatValue(row.dosage_libra),
      this.formatValue(row.classe_acp_lib_court),
      this.formatValue(row.date_extract)
    ].join(',')})`;
  }

  async extract(): Promise<void> {
    let connectionTarget; // connectionSource est supprimé
    try {
      logger.info('Debut de l\'extraction des donnees pour le dashboard RS5');
      
      connectionTarget = await this.targetPool.getConnection(); // Seulement pour targetPool (MySQL)

      // Vidage de la table
      await truncateTable(this.targetPool, 'dashboard_rs5');
      
      // Récupération de la date/heure actuelle
      const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      // Récupération des codes VU
      const codeVURows = await this.sourcePool.query(getDashboardRs5CodeVUQuery()); // Utilise directement sourcePool
      const codeVUs = codeVURows.map((row: { codeVU: string }) => row.codeVU);
      
      // Traitement par lots (pour la récupération des données)
      const batches = this.chunkArray(codeVUs, this.initialBatchSize);
      let actualTotalInserted = 0; // Compteur réel des lignes insérées
      let lastLoggedCount = 0; // Pour suivre le dernier log de progression
      const logFrequency = parseInt(process.env.NB_LIGNES_DEBUG_DASHBOARDRS5 || '1000'); // Frequence de log

      for (const batch of batches) {
        const rows = await this.sourcePool.query(getDashboardRs5Query(batch as string[])); // Utilise directement sourcePool
        
        if (rows.length > 0) {
          // Traitement des résultats par lots (pour l'insertion)
          const rowBatches = this.chunkArray(rows, this.insertionBatchSize); // Utilisation de insertionBatchSize
          
          for (const rowBatch of rowBatches) {
            const values = rowBatch.map((row: unknown) => {
              const rowWithDate = {
                ...(row as DashboardRs5Data),
                date_extract: currentDate
              };
              return this.formatRow(rowWithDate);
            });

            // Chunk the formatted values for SQL insertion using this.logFrequency
            const sqlInsertChunks = this.chunkArray(values, this.logFrequency); // logFrequency sera la taille des chunks SQL

            for (const sqlInsertChunk of sqlInsertChunks) {
              const query = insertDashboardRs5Query(sqlInsertChunk as string[]);
              await connectionTarget.query(query);
              
              actualTotalInserted += sqlInsertChunk.length; // Incrémente le compteur réel
              
              // Log de progression selon la fréquence configurée
              // On log si actualTotalInserted a franchi un nouveau seuil de logFrequency
              if (Math.floor(actualTotalInserted / logFrequency) > Math.floor(lastLoggedCount / logFrequency)) {
                const now = new Date();
                const dateStr = now.toLocaleString('fr-FR', { hour12: false });
                console.log(`[${dateStr}] ${actualTotalInserted} lignes inserees dans dashboard_rs5...`);
                lastLoggedCount = actualTotalInserted;
              }
            }
          }
        }
      }
      
      // Assurer que le dernier total inséré est toujours logué si le total n'est pas un multiple exact
      if (actualTotalInserted > lastLoggedCount) {
        const now = new Date();
        const dateStr = now.toLocaleString('fr-FR', { hour12: false });
        console.log(`[${dateStr}] ${actualTotalInserted} lignes inserees dans dashboard_rs5...`);
      }
      
      logger.info(`Extraction terminee. Total: ${actualTotalInserted} lignes inserees dans dashboard_rs5`);
    } catch (error) {
      logger.error('Erreur lors de l\'extraction des donnees pour le dashboard RS5:', error); // Log complet de l'objet erreur
      if (error instanceof Error && error.stack) {
        logger.error('Stack trace:', error.stack);
      }
      throw error;
    } finally {
      // if (connectionSource) connectionSource.release(); // Supprimé
      if (connectionTarget) connectionTarget.release();
    }
  }
}
