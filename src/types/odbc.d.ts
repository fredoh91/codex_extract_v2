declare module 'odbc' {
  export interface Pool {
    query(sql: string, params?: any[]): Promise<any>;
    close(): void;
  }

  export function pool(config: {
    connectionString: string;
    connectionTimeout?: number;
    loginTimeout?: number;
  }): Promise<Pool>;
} 