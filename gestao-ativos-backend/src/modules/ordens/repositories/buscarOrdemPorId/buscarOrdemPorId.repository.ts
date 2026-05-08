import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdensEntity } from '../../entities/ordens.entity';
import { OrdemResponseDto } from '../../dtos/response/ordem.response';
import { OrdemMapper } from '../../mappers/ordem.mapper';
import { ErrorUtil } from '../../../../utils/error';

@Injectable()
export class BuscarOrdemPorIdRepository {
  private readonly logger = new Logger(BuscarOrdemPorIdRepository.name);

  constructor(
    @InjectRepository(OrdensEntity)
    private readonly ordensRepository: Repository<OrdensEntity>,
  ) {}

  public async execute(idOrdem: string): Promise<OrdemResponseDto> {
    try {
      const ordem = await this.ordensRepository.findOne({ where: { id: idOrdem }, relations: ['ativo'] });

      if (!ordem) {
        throw new ErrorUtil('ORDEM_NAO_ENCONTRADA', 'Ordem não encontrada.');
      }

      return OrdemMapper.entityToResponseDto(ordem);
    } catch (error) {
      if (error instanceof ErrorUtil) {
        throw error;
      }

      this.logger.error(`Erro inesperado ao buscar a ordem`, error);
      throw new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno ao buscar a ordem.');
    }
  }
}
