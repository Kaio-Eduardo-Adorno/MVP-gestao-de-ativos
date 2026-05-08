import { Injectable } from '@nestjs/common';
import { BuscarAtivosPorUsuarioRepository } from '../../repositories';
import { AtivoUsuarioResponseDto } from '../../dtos/response/ativoUsuario.response';

@Injectable()
export class BuscarAtivosPorUsuarioService {
  constructor(private readonly buscarAtivosPorUsuarioRepository: BuscarAtivosPorUsuarioRepository) {}

  async execute(id: string): Promise<AtivoUsuarioResponseDto[]> {
    const entity = await this.buscarAtivosPorUsuarioRepository.execute(id);

    return entity;
  }
}
