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
  private readonly batchSize: number;
  protected sourcePool: OdbcPool;
  protected targetPool: MysqlPool;

  constructor(sourcePool: OdbcPool, targetPool: MysqlPool, batchSize: number = 100) {
    super(sourcePool, targetPool, 'dashboard_rs5');
    this.batchSize = batchSize;
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
    try {
      logger.info('Debut de l\'extraction des donnees pour le dashboard RS5');
      
      // Vidage de la table
      await truncateTable(this.targetPool, 'dashboard_rs5');
      
      // Récupération de la date/heure actuelle
      const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      // Récupération des codes VU
      const codeVURows = await this.sourcePool.query(getDashboardRs5CodeVUQuery());
      const codeVUs = codeVURows.map((row: { codeVU: string }) => row.codeVU);
      
      // Traitement par lots
      const batches = this.chunkArray(codeVUs, this.batchSize);
      let totalInserted = 0;
      
      for (const batch of batches) {
        const rows = await this.sourcePool.query(getDashboardRs5Query(batch as string[]));
        
        if (rows.length > 0) {
          // Traitement des résultats par lots de 100 lignes
          const rowBatches = this.chunkArray(rows, this.batchSize);
          
          for (const rowBatch of rowBatches) {
            const values = rowBatch.map((row: unknown) => {
              const rowWithDate = {
                ...(row as DashboardRs5Data),
                date_extract: currentDate
              };
              return this.formatRow(rowWithDate);
            });
            const query = insertDashboardRs5Query(values);
            await this.targetPool.query(query);
            totalInserted += rowBatch.length;
            logger.info(`${rowBatch.length} lignes inserees dans dashboard_rs5`);
          }
        }
      }
      
      logger.info(`Extraction terminee. Total: ${totalInserted} lignes inserees dans dashboard_rs5`);
    } catch (error) {
      logger.error('Erreur lors de l\'extraction des donnees pour le dashboard RS5:', error);
      throw error;
    }
  }
} 