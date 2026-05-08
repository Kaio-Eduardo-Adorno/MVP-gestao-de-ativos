import * as dotenv from 'dotenv';
import * as fs from 'fs';

export interface EnvData {
  // application
  APP_ENV: string;
  APP_DEBUG: boolean;

  JWT_SECRET: string;

  // ativos server
  ATIVOS_HOST: string;
  ATIVOS_PORT: number;

  // ativos database
  ATIVOS_DB_TYPE: 'mysql' | 'mariadb' | 'postgres';
  ATIVOS_DB_HOST: string;
  ATIVOS_DB_NAME: string;
  ATIVOS_DB_PORT: number;
  ATIVOS_DB_USER: string;
  ATIVOS_DB_PASSWORD: string;
  ATIVOS_DB_SYNCHRONIZE: boolean;

  // apis
  COTACAO_API_URL: string;
}

export class EnvService {
  private vars: EnvData;

  constructor() {
    const environment = process.env.NODE_ENV || 'development';
    const isLocal = environment === 'development' || environment === 'local';

    let fileData: Record<string, string> = {};

    if (isLocal) {
      try {
        fileData = dotenv.parse(fs.readFileSync(`./../shared-env/${environment}.env`));
      } catch {
        console.warn(`[EnvService] Could not read .env file for environment: ${environment}`);
      }
    }

    const getVar = (key: string): string | undefined => {
      if (!isLocal) {
        return process.env[key];
      }
      return fileData[key];
    };

    this.vars = {
      APP_ENV: environment,
      APP_DEBUG: getVar('APP_DEBUG') === 'true',

      JWT_SECRET: getVar('JWT_SECRET') || 'dev',

      ATIVOS_HOST: getVar('ATIVOS_HOST') || '0.0.0.0',
      ATIVOS_PORT: parseInt(getVar('ATIVOS_PORT') || '50054', 10),

      ATIVOS_DB_TYPE: (getVar('ATIVOS_DB_TYPE') || 'postgres') as 'mysql' | 'mariadb' | 'postgres',
      ATIVOS_DB_HOST: getVar('ATIVOS_DB_HOST') || 'localhost',
      ATIVOS_DB_NAME: getVar('ATIVOS_DB_NAME') || 'gestao_ativos_backend',
      ATIVOS_DB_PORT: parseInt(getVar('ATIVOS_DB_PORT') || '5432', 10),
      ATIVOS_DB_USER: getVar('ATIVOS_DB_USER') || 'postgres',
      ATIVOS_DB_PASSWORD: getVar('ATIVOS_DB_PASSWORD') || 'postgres',
      ATIVOS_DB_SYNCHRONIZE: getVar('ATIVOS_DB_SYNCHRONIZE') === 'true',

      COTACAO_API_URL: getVar('COTACAO_API_URL') || 'http://localhost:3001',
    };
  }

  read(): EnvData {
    return this.vars;
  }

  isDev(): boolean {
    return this.vars.APP_ENV === 'development' || this.vars.APP_ENV === 'local';
  }

  isProd(): boolean {
    return this.vars.APP_ENV === 'production';
  }
}
