import { Injectable } from '@nestjs/common';
import { BuscarOrdemPorIdRepository } from '../../repositories';
import { OrdemResponseDto } from '../../dtos/response/ordem.response';

@Injectable()
export class BuscarOrdemPorIdService {
  constructor(private readonly buscarOrdemPorIdRepository: BuscarOrdemPorIdRepository) {}

  async execute(idOrdem: string): Promise<OrdemResponseDto | null> {
    const entity = await this.buscarOrdemPorIdRepository.execute(idOrdem);

    return entity;
  }
}
