import { SaldoResponseDto } from '../dtos/response/saldo.response';
import { SaldosEntity } from '../entities/saldos.entity';

export class SaldoMapper {
  static entityToResponseDto(entity: SaldosEntity): SaldoResponseDto {
    const response = new SaldoResponseDto();
    response.saldo = entity.saldo;
    return response;
  }
}
