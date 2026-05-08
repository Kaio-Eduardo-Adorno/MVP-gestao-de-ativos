import { Injectable } from '@nestjs/common';
import { BuscarSaldoPorUsuarioRepository } from '../../repositories';
import { SaldoResponseDto } from '../../dtos/response/saldo.response';

@Injectable()
export class BuscarSaldoPorUsuarioService {
  constructor(private readonly buscarSaldoPorUsuarioRepository: BuscarSaldoPorUsuarioRepository) {}

  async execute(idUsuario: string): Promise<SaldoResponseDto> {
    return await this.buscarSaldoPorUsuarioRepository.execute(idUsuario);
  }
}
