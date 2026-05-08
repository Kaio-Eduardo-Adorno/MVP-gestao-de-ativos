import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaldosEntity } from '../../entities/saldos.entity';
import { SaldoResponseDto } from '../../dtos/response/saldo.response';
import { ErrorUtil } from '../../../../utils/error';
import { SaldoMapper } from '../../mappers/saldo.mapper';

@Injectable()
export class BuscarSaldoPorUsuarioRepository {
  private readonly logger = new Logger(BuscarSaldoPorUsuarioRepository.name);

  constructor(
    @InjectRepository(SaldosEntity)
    private readonly saldosRepository: Repository<SaldosEntity>,
  ) {}

  public async execute(idUsuario: string): Promise<SaldoResponseDto> {
    try {
      const saldoUsuario = await this.saldosRepository.findOne({ where: { id_usuario: idUsuario } });

      if (!saldoUsuario) {
        const dto = new SaldoResponseDto();
        dto.saldo = 0;
        return dto;
      }

      return SaldoMapper.entityToResponseDto(saldoUsuario);
    } catch (error) {
      if (error instanceof ErrorUtil) {
        throw error;
      }

      this.logger.error(`Erro inesperado ao buscar o saldo do usuário ${idUsuario}`, error);
      throw new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno ao buscar o saldo do usuário.');
    }
  }
}
