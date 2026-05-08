import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AtivosEntity } from '../../entities/ativos.entity';
import { ErrorUtil } from '../../../../utils/error';
import { CotacaoResponseDto } from '../../dtos/response/cotacao.response';

@Injectable()
export class AtualizarCotacaoAtivoRepository {
  private readonly logger = new Logger(AtualizarCotacaoAtivoRepository.name);

  constructor(
    @InjectRepository(AtivosEntity)
    private readonly ativosRepository: Repository<AtivosEntity>,
  ) {}

  public async execute(cotacao: CotacaoResponseDto): Promise<boolean> {
    try {
      const ativo = await this.ativosRepository.findOne({ where: { simbolo: cotacao.simbolo } });

      if (!ativo) {
        throw new ErrorUtil('ATIVO_INDISPONIVEL', `Não foi possível encontrar o ativo com o símbolo ${cotacao.simbolo}.`);
      }

      await this.ativosRepository.update(ativo.id, { cotacao: cotacao.preco, horario_cotacao: new Date(cotacao.dataCotacao) });

      return true;
    } catch (error) {
      if (error instanceof ErrorUtil) {
        throw error;
      }

      this.logger.error(`Erro inesperado ao atualizar a cotação do ativo ${cotacao.simbolo}.`, error);
      throw new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno ao atualizar a cotação do ativo.');
    }
  }
}
