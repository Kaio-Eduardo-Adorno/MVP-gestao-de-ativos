export class OrdemResponseDto {
  id!: string;
  simbolo!: string;
  tipo!: string;
  quantidade!: number;
  valorUnitario!: number;
  valorTotal!: number;
  status!: string;
  criadoEm!: Date;
  atualizadoEm!: Date;
}
