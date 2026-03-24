import { DatabaseConfig, OdbcConfig } from '../types/database.js';

// base de cible pour les extractions
export function getCodexExtractConfig(): DatabaseConfig {
  const host = process.env.CODEX_extract_HOST || process.env.CODEX_EXTRACT_HOST;
  const user = process.env.CODEX_extract_USER || process.env.CODEX_EXTRACT_USER;
  const password = process.env.CODEX_extract_PASSWORD || process.env.CODEX_EXTRACT_PASSWORD;
  const database = process.env.CODEX_extract_DATABASE || process.env.CODEX_EXTRACT_DATABASE;
  const port = process.env.CODEX_extract_PORT || process.env.CODEX_EXTRACT_PORT || '3306';
  const charset = process.env.CODEX_extract_CHARSET || process.env.CODEX_EXTRACT_CHARSET || 'utf8mb4';

  if (!host || !user || !password || !database) {
    console.error('ERREUR: Variables d\'environnement MySQL de destination manquantes (CODEX_extract_...)');
  }

  return {
    host: host!,
    port: parseInt(port, 10),
    database: database!,
    charset: charset!,
    user: user!,
    password: password!,
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
    charset: process.env.BNPV_MIROIR_CHARSET!,
    connectionLimit: 10,
  };
}

export function getCodexOdbcConfig(): OdbcConfig {
  return {
    host: process.env.CODEX_HOST || '',
    port: parseInt(process.env.CODEX_PORT || '8000', 10),
    database: process.env.CODEX_DATABASE || '',
    user: process.env.CODEX_USER!,
    dsn: process.env.CODEX_DSN!,
    uid: process.env.CODEX_USER!,
    pwd: process.env.CODEX_PASSWORD!,
    charset: 'UTF8',
  };
}

export function getMocatorOdbcConfig(): OdbcConfig {
  return {
    host: process.env.MOCATOR_HOST || '',
    port: parseInt(process.env.MOCATOR_PORT || '8000', 10),
    database: process.env.MOCATOR_DATABASE || '',
    user: process.env.MOCATOR_USER!,
    dsn: process.env.MOCATOR_DSN!,
    uid: process.env.MOCATOR_USER!,
    pwd: process.env.MOCATOR_PASSWORD!,
    charset: 'UTF8',
  };
}
