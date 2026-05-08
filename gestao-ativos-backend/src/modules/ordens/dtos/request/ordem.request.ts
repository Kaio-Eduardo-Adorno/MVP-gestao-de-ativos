import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { OrdemTipoEnum } from '../../enums/ordemTipo.enum';

export class OrdemRequestDto {
  @IsNotEmpty({ message: 'O simbolo do ativo é obrigatório.' })
  simbolo!: string;

  @IsNumber({}, { message: 'A quantidade deve ser um número.' })
  @IsPositive({ message: 'A quantidade deve ser maior que zero.' })
  @IsNotEmpty({ message: 'A quantidade é obrigatória.' })
  quantidade!: number;

  @IsEnum(OrdemTipoEnum, { message: 'O tipo deve ser exclusivamente COMPRA ou VENDA.' })
  @IsNotEmpty({ message: 'O tipo da ordem é obrigatório.' })
  tipo!: OrdemTipoEnum;
}
