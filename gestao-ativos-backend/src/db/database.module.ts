import { Module, Global, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './datasource';

function DatabaseOrmModule(): DynamicModule {
  return TypeOrmModule.forRoot(dataSourceOptions);
}

@Global()
@Module({
  imports: [DatabaseOrmModule()],
})
export class DatabaseModule {}
