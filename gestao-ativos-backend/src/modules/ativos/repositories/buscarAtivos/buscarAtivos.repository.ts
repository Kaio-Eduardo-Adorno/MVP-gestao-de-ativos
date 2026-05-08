import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorUtil } from '../../../../utils/error';
import { AtivosEntity } from '../../entities/ativos.entity';
import { AtivoMapper } from '../../mappers/ativo.mapper';
import { AtivoResponseDto } from '../../dtos/response/ativo.response';

@Injectable()
export class BuscarAtivosRepository {
  private readonly logger = new Logger(BuscarAtivosRepository.name);

  constructor(
    @InjectRepository(AtivosEntity)
    private readonly repository: Repository<AtivosEntity>,
  ) {}

  public async execute(): Promise<AtivoResponseDto[]> {
    try {
      const ativos = await this.repository.find({ order: { simbolo: 'ASC' } });

      if (!ativos) {
        return [];
      }

      return AtivoMapper.entityListToDtoList(ativos);
    } catch (error) {
      if (error instanceof ErrorUtil) {
        throw error;
      }

      this.logger.error(`Erro inesperado ao buscar ativos`, error);
      throw new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno ao buscar ativos.');
    }
  }
}
