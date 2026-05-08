import { Expose, Transform } from 'class-transformer';
import { IsNumber, IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CotacaoApiResponseDto {
  @Expose()
  @IsString()
  @IsNotEmpty()
  symbol!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Expose()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  price!: number;

  @Expose()
  @IsDateString()
  timestamp!: string;
}
