import { Injectable } from '@nestjs/common';
import { BuscarAtivosRepository } from '../../repositories';
import { AtivoResponseDto } from '../../dtos/response/ativo.response';

@Injectable()
export class BuscarAtivosService {
  constructor(private readonly buscarAtivosRepository: BuscarAtivosRepository) {}

  async execute(): Promise<AtivoResponseDto[]> {
    return await this.buscarAtivosRepository.execute();
  }
}
