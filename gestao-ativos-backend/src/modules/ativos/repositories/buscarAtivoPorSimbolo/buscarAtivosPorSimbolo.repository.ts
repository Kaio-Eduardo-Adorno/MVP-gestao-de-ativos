import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AtivosEntity } from '../../entities/ativos.entity';
import { ErrorUtil } from '../../../../utils/error';
import { AtivoMapper } from '../../mappers/ativo.mapper';
import { AtivoResponseDto } from '../../dtos/response/ativo.response';

@Injectable()
export class BuscarAtivoPorSimboloRepository {
  private readonly logger = new Logger(BuscarAtivoPorSimboloRepository.name);

  constructor(
    @InjectRepository(AtivosEntity)
    private readonly repository: Repository<AtivosEntity>,
  ) {}

  public async execute(simbolo: string): Promise<AtivoResponseDto> {
    try {
      const ativo = await this.repository.findOne({ where: { simbolo: simbolo } });

      if (!ativo) {
        throw new ErrorUtil('ATIVO_INDISPONIVEL', `Não foi possível encontrar o ativo com o símbolo ${simbolo}.`);
      }

      return AtivoMapper.entityToDto(ativo);
    } catch (error) {
      if (error instanceof ErrorUtil) {
        throw error;
      }

      this.logger.error(`Erro inesperado ao buscar o ativo ${simbolo}`, error);
      throw new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno ao buscar o ativo.');
    }
  }
}
