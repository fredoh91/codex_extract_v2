import { Pool as MysqlPool } from 'mysql2/promise';
import { Pool as OdbcPool } from 'odbc';
import { truncateTable } from '../truncateTable.js';

export abstract class BaseExtractor {
  protected sourceConnection: OdbcPool;
  protected targetConnection: MysqlPool;
  protected tableName: string;

  constructor(
    sourceConnection: OdbcPool,
    targetConnection: MysqlPool,
    tableName: string
  ) {
    this.sourceConnection = sourceConnection;
    this.targetConnection = targetConnection;
    this.tableName = tableName;
  }

  /**
   * Méthode abstraite que chaque extracteur doit implémenter
   * pour définir sa logique d'extraction spécifique
   */
  abstract extract(): Promise<void>;

  /**
   * Méthode utilitaire pour vider la table cible
   */
  protected async truncateTable(): Promise<void> {
    await truncateTable(this.targetConnection, this.tableName);
  }

  /**
   * Méthode utilitaire pour logger les informations d'extraction
   */
  protected logExtraction(count: number): void {
    console.log(`Extraction terminée pour ${this.tableName}: ${count} lignes traitées`);
  }
} 