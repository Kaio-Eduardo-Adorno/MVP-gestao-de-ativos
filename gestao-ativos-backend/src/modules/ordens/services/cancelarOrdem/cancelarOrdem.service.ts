import { Injectable } from '@nestjs/common';
import { AtualizarStatusOrdemRepository } from '../../repositories';
import { OrdemStatusEnum } from '../../enums/ordemStatus.enum';

@Injectable()
export class CancelarOrdemService {
  constructor(private readonly atualizarStatusOrdemRepository: AtualizarStatusOrdemRepository) {}

  async execute(idOrdem: string): Promise<boolean> {
    return await this.atualizarStatusOrdemRepository.execute(idOrdem, OrdemStatusEnum.CANCELADA);
  }
}
