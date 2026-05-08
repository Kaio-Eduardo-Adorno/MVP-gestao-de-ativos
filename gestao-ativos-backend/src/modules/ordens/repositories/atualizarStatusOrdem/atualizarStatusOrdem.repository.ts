import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdensEntity } from '../../entities/ordens.entity';
import { OrdemStatusEnum } from '../../enums/ordemStatus.enum';
import { ErrorUtil } from '../../../../utils/error';

@Injectable()
export class AtualizarStatusOrdemRepository {
  private readonly logger = new Logger(AtualizarStatusOrdemRepository.name);

  constructor(
    @InjectRepository(OrdensEntity)
    private readonly ordensRepository: Repository<OrdensEntity>,
  ) {}

  public async execute(idOrdem: string, status: OrdemStatusEnum): Promise<boolean> {
    try {
      const ordem = await this.ordensRepository.findOne({ where: { id: idOrdem } });

      if (!ordem) {
        throw new ErrorUtil('ORDEM_NAO_ENCONTRADA', 'Ordem não encontrada.');
      } else if (status === OrdemStatusEnum.CANCELADA && ordem.status !== OrdemStatusEnum.PENDENTE.toString()) {
        throw new ErrorUtil('ORDEM_NAO_PODE_SER_CANCELADA', 'Apenas ordens pendentes podem ser canceladas.');
      } else if (status === OrdemStatusEnum.PROCESSANDO && ordem.status !== OrdemStatusEnum.PENDENTE.toString()) {
        throw new ErrorUtil('ORDEM_NAO_PODE_SER_PROCESSADA', 'Apenas ordens pendentes podem ser processadas.');
      } else if (status === OrdemStatusEnum.EXECUTADA && ordem.status !== OrdemStatusEnum.PROCESSANDO.toString()) {
        throw new ErrorUtil('ORDEM_NAO_PODE_SER_EXECUTADA', 'Apenas ordens em processamento podem ser executadas.');
      } else if (status === OrdemStatusEnum.REJEITADA && ordem.status !== OrdemStatusEnum.PROCESSANDO.toString()) {
        throw new ErrorUtil('ORDEM_NAO_PODE_SER_REJEITADA', 'Apenas ordens em processamento podem ser rejeitadas.');
      }

      await this.ordensRepository.update({ id: idOrdem }, { status: status.toString() });

      return true;
    } catch (error) {
      if (error instanceof ErrorUtil) {
        throw error;
      }

      this.logger.error(`Erro inesperado ao atualizar o status da ordem`, error);
      throw new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno ao atualizar o status da ordem.');
    }
  }
}
