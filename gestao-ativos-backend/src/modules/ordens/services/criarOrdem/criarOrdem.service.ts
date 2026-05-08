import { Injectable } from '@nestjs/common';
import { OrdemRequestDto } from '../../dtos/request/ordem.request';
import { CriarOrdemRepository } from '../../repositories';
import { BuscarAtivoPorSimboloRepository } from '../../../ativos/repositories/buscarAtivoPorSimbolo/buscarAtivosPorSimbolo.repository';
import { BuscarSaldoPorUsuarioRepository } from 'src/modules/saldos/repositories';
import { ErrorUtil } from 'src/utils/error';
import { OrdemTipoEnum } from '../../enums/ordemTipo.enum';
import { BuscarAtivoUsuarioPorSimboloRepository } from 'src/modules/ativos/repositories';

@Injectable()
export class CriarOrdemService {
  constructor(
    private readonly criarOrdemRepository: CriarOrdemRepository,
    private readonly buscarAtivoPorSimboloRepository: BuscarAtivoPorSimboloRepository,
    private readonly buscarSaldoPorUsuarioRepository: BuscarSaldoPorUsuarioRepository,
    private readonly buscarAtivoUsuarioPorSimboloRepository: BuscarAtivoUsuarioPorSimboloRepository,
  ) {}

  async execute(idUsuario: string, chaveIdempotencia: string, ordem: OrdemRequestDto): Promise<boolean> {
    const ativo = await this.buscarAtivoPorSimboloRepository.execute(ordem.simbolo);

    if (ordem.tipo === OrdemTipoEnum.COMPRA) {
      const saldoUsuario = await this.buscarSaldoPorUsuarioRepository.execute(idUsuario);
      if (ordem.quantidade * Number(ativo.cotacao) > Number(saldoUsuario.saldo))
        throw new ErrorUtil('SALDO_INSUFICIENTE', 'Saldo insuficiente para efetuar a compra.');
    }
    if (ordem.tipo === OrdemTipoEnum.VENDA) {
      const ativoUsuario = await this.buscarAtivoUsuarioPorSimboloRepository.execute(idUsuario, ordem.simbolo);
      if (ordem.quantidade > ativoUsuario.quantidade)
        throw new ErrorUtil('ATIVOS_INSUFICIENTES', 'Ativos insuficientes para efetuar a venda.');
    }

    return await this.criarOrdemRepository.execute(idUsuario, chaveIdempotencia, ordem, ativo);
  }
}
