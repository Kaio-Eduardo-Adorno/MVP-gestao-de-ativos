import { Injectable } from '@nestjs/common';
import { BuscarAtivosPorUsuarioRepository } from '../../repositories';
import { OrdemResponseDto } from '../../dtos/response/ordem.response';

@Injectable()
export class BuscarOrdensPorUsuarioService {
  constructor(private readonly buscarAtivosPorUsuarioRepository: BuscarAtivosPorUsuarioRepository) {}

  async execute(idUsuario: string): Promise<OrdemResponseDto[]> {
    const entity = await this.buscarAtivosPorUsuarioRepository.execute(idUsuario);

    return entity;
  }
}
