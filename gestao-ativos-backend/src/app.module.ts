import { Module } from '@nestjs/common';
import { DatabaseModule } from './db/database.module';
import { AtivosModule } from './modules/ativos/ativos.module';
import { OrdensModule } from './modules/ordens/ordens.module';
import { AuthModule } from './modules/auth/auth.module';
import { SaldosModule } from './modules/saldos/saldos.module';

@Module({
  imports: [DatabaseModule, AuthModule, AtivosModule, OrdensModule, SaldosModule],
})
export class AppModule {}
