import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdensEntity } from '../../entities/ordens.entity';
import { OrdemRequestDto } from '../../dtos/request/ordem.request';
import { ErrorUtil } from '../../../../utils/error';
import { AtivoResponseDto } from '../../../../modules/ativos/dtos/response/ativo.response';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CriarOrdemRepository {
  private readonly logger = new Logger(CriarOrdemRepository.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(OrdensEntity)
    private readonly ordensRepository: Repository<OrdensEntity>,
  ) {}

  public async execute(
    idUsuario: string,
    chaveIdempotencia: string,
    ordem: OrdemRequestDto,
    ativo: AtivoResponseDto,
  ): Promise<boolean> {
    try {
      const ordemIgual = await this.ordensRepository.findOne({
        where: { chave_idempotencia: chaveIdempotencia },
        relations: ['ativo'],
      });

      if (ordemIgual) {
        return true;
      }

      const ordemCriada = await this.ordensRepository.save({
        id_usuario: idUsuario,
        id_ativo: ativo.id,
        quantidade: ordem.quantidade,
        tipo: ordem.tipo,
        valor_unitario: ativo.cotacao,
        valor_total: ativo.cotacao * ordem.quantidade,
        status: 'PENDENTE',
        chave_idempotencia: chaveIdempotencia,
      });

      this.eventEmitter.emit('ordem.criada', ordemCriada.id, ordemCriada.id_usuario, ordemCriada.id_ativo);

      return true;
    } catch (error) {
      if (error instanceof ErrorUtil) {
        throw error;
      }

      this.logger.error(`Erro inesperado ao criar a ordem`, error);
      throw new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno ao criar a ordem.');
    }
  }
}
