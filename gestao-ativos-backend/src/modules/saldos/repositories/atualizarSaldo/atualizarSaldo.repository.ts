import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaldosEntity } from '../../entities/saldos.entity';
import { ErrorUtil } from '../../../../utils/error';

@Injectable()
export class AtualizarSaldoRepository {
  private readonly logger = new Logger(AtualizarSaldoRepository.name);

  constructor(
    @InjectRepository(SaldosEntity)
    private readonly saldosRepository: Repository<SaldosEntity>,
  ) {}

  public async execute(idUsuario: string, valor: number): Promise<boolean> {
    try {
      const saldoUsuario = await this.saldosRepository.findOne({ where: { id_usuario: idUsuario } });

      if (!saldoUsuario) {
        if (valor < 0) throw new ErrorUtil('SALDO_NAO_ENCONTRADO', `Saldo não encontrado para este usuário.`);
        await this.saldosRepository.save({ id_usuario: idUsuario, saldo: valor });
        return true;
      }

      const novoSaldo = Number(valor) + Number(saldoUsuario.saldo);

      if (novoSaldo < 0) {
        throw new ErrorUtil('SALDO_INSUFICIENTE', 'O usuário não possui saldo suficiente para realizar a operação.');
      }

      await this.saldosRepository.update(saldoUsuario.id, { saldo: novoSaldo });

      return true;
    } catch (error) {
      if (error instanceof ErrorUtil) {
        throw error;
      }

      this.logger.error(`Erro inesperado ao atualizar o saldo para o usuário ${idUsuario}`, error);
      throw new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno ao atualizar o saldo.');
    }
  }
}
