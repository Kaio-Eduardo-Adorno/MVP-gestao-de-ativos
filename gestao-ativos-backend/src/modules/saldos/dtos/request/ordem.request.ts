import { IsNumber } from 'class-validator';

export class AtualizarSaldoRequestDto {
  @IsNumber({}, { message: 'O valor deve ser um número.' })
  valor!: number;
}
