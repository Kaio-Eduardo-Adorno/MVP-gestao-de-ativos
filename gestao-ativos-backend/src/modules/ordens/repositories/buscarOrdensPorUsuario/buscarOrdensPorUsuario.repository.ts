import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdensEntity } from '../../entities/ordens.entity';
import { OrdemResponseDto } from '../../dtos/response/ordem.response';
import { OrdemMapper } from '../../mappers/ordem.mapper';
import { ErrorUtil } from '../../../../utils/error';

@Injectable()
export class BuscarAtivosPorUsuarioRepository {
  private readonly logger = new Logger(BuscarAtivosPorUsuarioRepository.name);

  constructor(
    @InjectRepository(OrdensEntity)
    private readonly ordensRepository: Repository<OrdensEntity>,
  ) {}

  public async execute(idUsuario: string): Promise<OrdemResponseDto[]> {
    try {
      const ordensUsuario = await this.ordensRepository.find({
        where: { id_usuario: idUsuario },
        relations: ['ativo'],
        order: { criado_em: 'DESC' },
      });

      return OrdemMapper.entityListToResponseDtoList(ordensUsuario);
    } catch (error) {
      if (error instanceof ErrorUtil) {
        throw error;
      }

      this.logger.error(`Erro ao buscar ordens do usuário ${idUsuario}.`, error);
      throw new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno ao buscar as ordens do usuário.');
    }
  }
}
