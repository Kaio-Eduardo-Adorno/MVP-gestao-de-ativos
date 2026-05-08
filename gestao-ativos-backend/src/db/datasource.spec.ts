import { DataSource } from 'typeorm';
import { dataSourceOptions } from './datasource';
import dataSource from './datasource';

jest.mock('../config/env.service', () => ({
  EnvService: jest.fn().mockImplementation(() => ({
    read: jest.fn().mockReturnValue({
      ATIVOS_DB_TYPE: 'postgres',
      ATIVOS_DB_HOST: 'localhost',
      ATIVOS_DB_PORT: 5432,
      ATIVOS_DB_USER: 'test_user',
      ATIVOS_DB_PASSWORD: 'test_password',
      ATIVOS_DB_NAME: 'test_db',
      ATIVOS_DB_SYNCHRONIZE: false,
    }),
  })),
}));

describe('Datasource Configuration', () => {
  it('deve exportar dataSourceOptions com os valores mapeados do EnvService', () => {
    expect(dataSourceOptions).toMatchObject({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'test_user',
      password: 'test_password',
      database: 'test_db',
      synchronize: false,
    });
  });

  it('deve conter as configurações estáticas de schema e migrations', () => {
    expect(dataSourceOptions.schema).toBe('ativos_schema');
    expect(dataSourceOptions.migrationsTableName).toBe('migrations');
  });

  it('deve exportar uma instância de DataSource como default', () => {
    expect(dataSource).toBeInstanceOf(DataSource);
  });
});
