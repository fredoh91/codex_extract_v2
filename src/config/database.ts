// import { ConnectionConfig } from 'mysql2/promise';
import { SybaseConfig, DatabaseConfig } from '../types/database.js';

export const sourceConfig: SybaseConfig = {
  host: process.env.SOURCE_HOST || 'localhost',
  port: parseInt(process.env.SOURCE_PORT || '5000'),
  database: process.env.SOURCE_DATABASE || 'source_db',
  user: process.env.SOURCE_USER || 'user',
  password: process.env.SOURCE_PASSWORD || 'password',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

export const targetConfig: DatabaseConfig = {
  host: process.env.TARGET_HOST || 'localhost',
  port: parseInt(process.env.TARGET_PORT || '3306'),
  database: process.env.TARGET_DATABASE || 'target_db',
  user: process.env.TARGET_USER || 'user',
  password: process.env.TARGET_PASSWORD || 'password',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}; 