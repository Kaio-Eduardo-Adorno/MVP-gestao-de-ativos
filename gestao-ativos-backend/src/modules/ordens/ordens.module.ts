import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdensController } from './controller/ordens.controller';
import { ORDENS_SERVICES } from './services';
import { ORDENS_REPOSITORIES } from './repositories';
import { OrdensEntity } from './entities/ordens.entity';
import { AtivosEntity } from '../ativos/entities/ativos.entity';
import { HttpModule } from '@nestjs/axios';
import { AtualizarSaldoRepository, BuscarSaldoPorUsuarioRepository } from '../saldos/repositories';
import { BuscarAtivoPorSimboloRepository } from '../ativos/repositories/buscarAtivoPorSimbolo/buscarAtivosPorSimbolo.repository';
import { ORDENS_WORKERS } from './workers';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SaldosEntity } from '../saldos/entities/saldos.entity';
import { AtualizarQuantidadeAtivoUsuarioRepository, BuscarAtivoUsuarioPorSimboloRepository } from '../ativos/repositories';
import { AtivosUsuariosEntity } from '../ativos/entities/ativosUsuarios.entity';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    HttpModule,
    TypeOrmModule.forFeature([OrdensEntity, AtivosEntity, AtivosUsuariosEntity, SaldosEntity]),
  ],
  controllers: [OrdensController],
  providers: [
    ...ORDENS_SERVICES,
    ...ORDENS_REPOSITORIES,
    ...ORDENS_WORKERS,
    AtualizarSaldoRepository,
    BuscarSaldoPorUsuarioRepository,
    AtualizarQuantidadeAtivoUsuarioRepository,
    BuscarAtivoPorSimboloRepository,
    BuscarAtivoUsuarioPorSimboloRepository,
  ],
})
export class OrdensModule {}
