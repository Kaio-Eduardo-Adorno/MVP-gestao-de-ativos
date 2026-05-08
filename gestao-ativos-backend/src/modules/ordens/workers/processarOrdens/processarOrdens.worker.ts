import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { setTimeout } from 'timers/promises';
import { ErrorUtil } from '../../../../utils/error';
import { AtualizarStatusOrdemRepository, BuscarOrdemPorIdRepository } from '../../repositories';
import { OrdemStatusEnum } from '../../enums/ordemStatus.enum';
import { AtualizarSaldoRepository, BuscarSaldoPorUsuarioRepository } from '../../../saldos/repositories';
import { AtualizarQuantidadeAtivoUsuarioRepository, BuscarAtivoUsuarioPorSimboloRepository } from '../../../ativos/repositories';

@Injectable()
export class ProcessarOrdensWorker {
  private readonly logger = new Logger(ProcessarOrdensWorker.name);

  constructor(
    private readonly buscarOrdemRepository: BuscarOrdemPorIdRepository,
    private readonly atualizarStatusOrdemRepository: AtualizarStatusOrdemRepository,
    private readonly buscarAtivoUsuarioPorSimboloRepository: BuscarAtivoUsuarioPorSimboloRepository,
    private readonly atualizarQuantidadeAtivoUsuarioRepository: AtualizarQuantidadeAtivoUsuarioRepository,
    private readonly buscarSaldoPorUsuarioRepository: BuscarSaldoPorUsuarioRepository,
    private readonly atualizarSaldoRepository: AtualizarSaldoRepository,
  ) {}

  @OnEvent('ordem.criada', { async: true })
  async handleOrdemCriadaEvent(idOrdem: string, idUsuario: string, idAtivo: string) {
    try {
      this.logger.debug(`Iniciando processamento da ordem ID: ${idOrdem}`);

      let retries: number = 0;

      await setTimeout(10000);

      try {
        const ordem = await this.buscarOrdemRepository.execute(idOrdem);

        await this.atualizarStatusOrdemRepository.execute(idOrdem, OrdemStatusEnum.PROCESSANDO);
        await setTimeout(5000);
        for (retries = 0; retries < 3; retries++) {
          try {
            const saldoUsuario = await this.buscarSaldoPorUsuarioRepository.execute(idUsuario);

            if (ordem.tipo === 'COMPRA') {
              if (Number(ordem.valorTotal) < Number(saldoUsuario.saldo)) {
                await this.atualizarSaldoRepository.execute(idUsuario, Number(-ordem.valorTotal));
                await this.atualizarQuantidadeAtivoUsuarioRepository.execute(idUsuario, idAtivo, ordem.quantidade);
                await this.atualizarStatusOrdemRepository.execute(ordem.id, OrdemStatusEnum.EXECUTADA);
              }
            } else if (ordem.tipo === 'VENDA') {
              const ativoUsuario = await this.buscarAtivoUsuarioPorSimboloRepository.execute(idUsuario, ordem.simbolo);

              // Permite venda total (<=) e credita o dinheiro recebido (+)
              if (ativoUsuario && ordem.quantidade <= ativoUsuario.quantidade) {
                await this.atualizarSaldoRepository.execute(idUsuario, Number(ordem.valorTotal));
                await this.atualizarQuantidadeAtivoUsuarioRepository.execute(idUsuario, idAtivo, -ordem.quantidade);
                await this.atualizarStatusOrdemRepository.execute(ordem.id, OrdemStatusEnum.EXECUTADA);
              }
            }
            retries = 3;
          } catch (error) {
            this.logger.error(`Erro ao processar a ordem ${idOrdem}.`, error);
          }
        }
        if (retries >= 3) await this.atualizarStatusOrdemRepository.execute(idOrdem, OrdemStatusEnum.REJEITADA);
      } catch (error) {
        await this.atualizarStatusOrdemRepository.execute(idOrdem, OrdemStatusEnum.REJEITADA);
        if (error instanceof ErrorUtil) {
          throw error;
        }

        throw new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno ao processar a ordem.');
      }

      this.logger.debug(`Ordem ${idOrdem} processada com sucesso.`);
    } catch (error) {
      this.logger.error(`Erro inesperado ao processar a ordem ${idOrdem}.`, error);
    }
  }
}
