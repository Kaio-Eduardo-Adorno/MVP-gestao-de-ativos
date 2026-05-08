import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { AtualizarCotacaoAtivoRepository } from '../../repositories/atualizarCotacaoAtivo/atualizarCotacaoAtivo.repository';
import { BuscarCotacaoAtualRepository } from '../../repositories';
import { ErrorUtil } from '../../../../utils/error';

@Injectable()
export class AtualizarCotacaoWorker {
  private readonly logger = new Logger(AtualizarCotacaoWorker.name);

  constructor(
    private readonly atualizarCotacaoAtivoRepository: AtualizarCotacaoAtivoRepository,
    private readonly buscarCotacaoAtualRepository: BuscarCotacaoAtualRepository,
  ) {}

  @Interval(5000)
  async handleInterval() {
    try {
      this.logger.debug('Iniciando ciclo de processamento do Worker...');

      const cotacoes = await this.buscarCotacaoAtualRepository.execute();

      const promisesDeAtualizacao = cotacoes.map((cotacao) => this.atualizarCotacaoAtivoRepository.execute(cotacao));

      const resultados = await Promise.allSettled(promisesDeAtualizacao);

      resultados.forEach((resultado, index) => {
        if (resultado.status === 'rejected') {
          const error: unknown = resultado.reason;
          const simboloFalho = cotacoes[index].simbolo;

          if (error instanceof ErrorUtil) {
            this.logger.error(`[${error.errorName} - ${error.statusCode}] Falha ao atualizar ${simboloFalho}: ${error.message}`);
          } else {
            this.logger.error(`Erro inesperado ao atualizar ${simboloFalho}:`, error);
          }
        }
      });
      this.logger.debug('Ciclo finalizado com sucesso.');
    } catch (error) {
      if (error instanceof ErrorUtil) {
        this.logger.error(`[${error.errorName} - ${error.statusCode}] Falha no Worker: ${error.message}`, error.stack);
      } else {
        this.logger.error(`Erro inesperado no Worker:`, error);
      }
    }
  }
}
