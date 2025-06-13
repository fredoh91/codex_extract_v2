import { pino } from 'pino';
import path from 'path';
import fs from 'fs';

// Creation du dossier logs s'il n'existe pas
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Fonction pour obtenir le nom du fichier de log du mois courant
const getLogFileName = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `app-${year}-${month}.log`;
};

// Configuration du niveau de log base sur l'environnement
const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// Creation du logger avec le format personnalise
export const logger = pino({
  level: logLevel,
  transport: {
    targets: [
      // Log dans la console
      {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'dd/mm/yyyy HH:MM:ss',
          ignore: 'pid,hostname'
        }
      },
      // Log dans un fichier
      {
        target: 'pino/file',
        options: {
          destination: path.join(logsDir, getLogFileName()),
          mkdir: true
        }
      }
    ]
  },
  timestamp: () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `,"time":"${day}/${month}/${year} ${hours}:${minutes}:${seconds}"`;
  }
});

// Fonction pour fermer proprement le logger
export const flushAndExit = async (code: number = 0): Promise<void> => {
  await new Promise<void>((resolve) => {
    logger.flush(() => {
      resolve();
    });
  });
  process.exit(code);
}; 