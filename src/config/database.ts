import { DatabaseConfig, OdbcConfig } from '../types/database.js';


// base de cible pour les extractions
export function getCodexExtractConfig(): DatabaseConfig {
  return {
    host: process.env.CODEX_EXTRACT_HOST!,
    port: parseInt(process.env.CODEX_EXTRACT_PORT || '3306', 10),
    database: process.env.CODEX_EXTRACT_DATABASE!,
    user: process.env.CODEX_EXTRACT_USER!,
    password: process.env.CODEX_EXTRACT_PASSWORD!,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  };
}

export function getDbBnpvMiroirConfig(): DatabaseConfig {
  return {
    host: process.env.BNPV_MIROIR_HOST!,
    port: parseInt(process.env.BNPV_MIROIR_PORT || '3306', 10),
    user: process.env.BNPV_MIROIR_USER!,
    password: process.env.BNPV_MIROIR_PASSWORD!,
    database: process.env.BNPV_MIROIR_DATABASE!,
    connectionLimit: 10, // Ou une valeur appropriée
  };
}

export function getCodexOdbcConfig(): OdbcConfig {
  return {
    host: process.env.CODEX_HOST || '', // Ou une valeur par défaut pertinente si non utilisé avec DSN
    port: parseInt(process.env.CODEX_PORT || '8000', 10), // Port par défaut pour Sybase/SQL Server
    database: process.env.CODEX_DATABASE || '', // Ou une valeur par défaut pertinente
    user: process.env.CODEX_USER!,
    dsn: process.env.CODEX_DSN!,
    uid: process.env.CODEX_USER!,
    pwd: process.env.CODEX_PASSWORD!,
    charset: 'UTF8',
  };
}

export function getMocatorOdbcConfig(): OdbcConfig {
  return {
    host: process.env.MOCATOR_HOST || '', // Ou une valeur par défaut pertinente si non utilisé avec DSN
    port: parseInt(process.env.MOCATOR_PORT || '8000', 10), // Port par défaut pour Sybase/SQL Server
    database: process.env.MOCATOR_DATABASE || '', // Ou une valeur par défaut pertinente
    user: process.env.MOCATOR_USER!,
    dsn: process.env.MOCATOR_DSN!,
    uid: process.env.MOCATOR_USER!,
    pwd: process.env.MOCATOR_PASSWORD!,
    charset: 'UTF8',
  };
}