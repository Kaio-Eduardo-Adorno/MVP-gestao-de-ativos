import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { EnvService } from './env.service';

jest.mock('fs');
jest.mock('dotenv');

describe('EnvService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('deve estar definido', () => {
    const service = new EnvService();
    expect(service).toBeDefined();
  });

  describe('Ambiente Local/Desenvolvimento', () => {
    it('deve usar "development" como padrão se NODE_ENV não estiver definido', () => {
      delete process.env.NODE_ENV;
      (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from(''));
      (dotenv.parse as jest.Mock).mockReturnValue({});

      const service = new EnvService();
      expect(service.read().APP_ENV).toBe('development');
    });

    it('deve carregar variáveis do arquivo .env compartilhado quando em desenvolvimento', () => {
      process.env.NODE_ENV = 'development';
      const mockVars = {
        JWT_SECRET: 'secret-do-arquivo',
        ATIVOS_DB_NAME: 'db-do-arquivo',
        APP_DEBUG: 'true',
        ATIVOS_PORT: '8080',
      };

      (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('mock content'));
      (dotenv.parse as jest.Mock).mockReturnValue(mockVars);

      const service = new EnvService();
      const config = service.read();

      expect(fs.readFileSync).toHaveBeenCalledWith('./../shared-env/development.env');
      expect(config.JWT_SECRET).toBe('secret-do-arquivo');
      expect(config.ATIVOS_DB_NAME).toBe('db-do-arquivo');
      expect(config.APP_DEBUG).toBe(true);
      expect(config.ATIVOS_PORT).toBe(8080);
      expect(service.isDev()).toBe(true);
      expect(service.isProd()).toBe(false);
    });

    it('deve usar valores padrão se a leitura do arquivo .env falhar', () => {
      process.env.NODE_ENV = 'local';
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('Erro de leitura');
      });
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const service = new EnvService();
      const config = service.read();

      expect(warnSpy).toHaveBeenCalled();
      expect(config.JWT_SECRET).toBe('dev');
      expect(config.ATIVOS_DB_PORT).toBe(5432);

      warnSpy.mockRestore();
    });
  });

  describe('Ambiente de Produção', () => {
    it('deve carregar variáveis diretamente do process.env e ignorar arquivos', () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'prod-secret';
      process.env.ATIVOS_DB_NAME = 'prod-db';
      process.env.ATIVOS_PORT = '9999';

      const service = new EnvService();
      const config = service.read();

      expect(fs.readFileSync).not.toHaveBeenCalled();
      expect(config.JWT_SECRET).toBe('prod-secret');
      expect(config.ATIVOS_DB_NAME).toBe('prod-db');
      expect(config.ATIVOS_PORT).toBe(9999);
      expect(service.isDev()).toBe(false);
      expect(service.isProd()).toBe(true);
    });
  });

  describe('Configurações de Fallback e Casos de Borda', () => {
    it('deve usar valores padrão quando variáveis não estão definidas no ambiente', () => {
      process.env.NODE_ENV = 'production';
      // Removemos variáveis para forçar o uso dos fallbacks (|| 'valor')
      delete process.env.JWT_SECRET;
      delete process.env.ATIVOS_DB_PORT;
      delete process.env.ATIVOS_HOST;

      const service = new EnvService();
      const config = service.read();

      expect(config.JWT_SECRET).toBe('dev');
      expect(config.ATIVOS_DB_PORT).toBe(5432);
      expect(config.ATIVOS_HOST).toBe('0.0.0.0');
    });

    it('deve retornar falso para isDev e isProd em ambientes desconhecidos (ex: staging)', () => {
      process.env.NODE_ENV = 'staging';
      const service = new EnvService();
      expect(service.isDev()).toBe(false);
      expect(service.isProd()).toBe(false);
    });
  });

  describe('Conversão de Tipos', () => {
    it('deve converter strings numéricas e booleanas corretamente para os tipos primitivos', () => {
      process.env.NODE_ENV = 'production';
      process.env.APP_DEBUG = 'true';
      process.env.ATIVOS_DB_SYNCHRONIZE = 'false';

      const service = new EnvService();
      const config = service.read();

      expect(config.APP_DEBUG).toBe(true);
      expect(config.ATIVOS_DB_SYNCHRONIZE).toBe(false);
    });
  });
});
