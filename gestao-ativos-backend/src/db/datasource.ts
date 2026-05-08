import { DataSource, DataSourceOptions } from 'typeorm';
import { EnvService } from '../config/env.service';

const envService = new EnvService();
const config = envService.read();

export const dataSourceOptions: DataSourceOptions = {
  type: config.ATIVOS_DB_TYPE,
  host: config.ATIVOS_DB_HOST,
  port: config.ATIVOS_DB_PORT,
  username: config.ATIVOS_DB_USER,
  password: config.ATIVOS_DB_PASSWORD,
  database: config.ATIVOS_DB_NAME,
  schema: 'ativos_schema',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  migrationsRun: false,
  synchronize: config.ATIVOS_DB_SYNCHRONIZE,
  extra: {
    connectionLimit: 10,
  },
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
