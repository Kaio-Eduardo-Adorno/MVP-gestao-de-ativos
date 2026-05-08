import { Injectable } from '@nestjs/common';
import { AtualizarSaldoRepository, BuscarSaldoPorUsuarioRepository } from '../../repositories';
import { SaldoResponseDto } from '../../dtos/response/saldo.response';

@Injectable()
export class AtualizarSaldoService {
  constructor(
    private readonly atualizarSaldoRepository: AtualizarSaldoRepository,
    private readonly buscarSaldoPorUsuarioRepository: BuscarSaldoPorUsuarioRepository,
  ) {}

  async execute(idUsuario: string, valor: number): Promise<SaldoResponseDto> {
    await this.atualizarSaldoRepository.execute(idUsuario, valor);
    return await this.buscarSaldoPorUsuarioRepository.execute(idUsuario);
  }
}
