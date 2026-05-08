import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AtivosController } from './controller/ativos.controller';
import { ATIVOS_SERVICES } from './services';
import { ATIVOS_REPOSITORIES, BuscarCotacaoAtualRepository } from './repositories';
import { AtivosEntity } from './entities/ativos.entity';
import { AtivosUsuariosEntity } from './entities/ativosUsuarios.entity';
import { HttpModule } from '@nestjs/axios';
import { EnvModule } from '../../config/env.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ATIVOS_WORKERS } from './workers';
import { AtualizarCotacaoAtivoRepository } from './repositories/atualizarCotacaoAtivo/atualizarCotacaoAtivo.repository';

@Module({
  imports: [EnvModule, HttpModule, ScheduleModule.forRoot(), TypeOrmModule.forFeature([AtivosEntity, AtivosUsuariosEntity])],
  controllers: [AtivosController],
  providers: [
    ...ATIVOS_SERVICES,
    ...ATIVOS_REPOSITORIES,
    ...ATIVOS_WORKERS,
    AtualizarCotacaoAtivoRepository,
    BuscarCotacaoAtualRepository,
  ],
})
export class AtivosModule {}
