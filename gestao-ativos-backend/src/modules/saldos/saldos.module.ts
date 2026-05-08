import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaldosController } from './controller/saldos.controller';
import { SALDOS_SERVICES } from './services';
import { SALDOS_REPOSITORIES } from './repositories';
import { SaldosEntity } from './entities/saldos.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SaldosEntity])],
  controllers: [SaldosController],
  providers: [...SALDOS_SERVICES, ...SALDOS_REPOSITORIES],
})
export class SaldosModule {}
