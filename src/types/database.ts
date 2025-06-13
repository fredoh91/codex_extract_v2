export interface DbConnection {
  query(sql: string, params?: any[]): Promise<any>;
  close(): Promise<void>;
}

export interface SybaseConnection {
  query(sql: string, params?: any[]): Promise<any>;
  close(): Promise<void>;
}

export interface SybaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
  };
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  waitForConnections?: boolean;
  connectionLimit?: number;
  queueLimit?: number;
}

export interface DatabasePool {
  getConnection(): Promise<DbConnection>;
  end(): Promise<void>;
} 