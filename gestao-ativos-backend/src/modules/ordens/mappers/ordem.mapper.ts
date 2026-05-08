import { OrdemResponseDto } from '../dtos/response/ordem.response';
import { OrdensEntity } from '../entities/ordens.entity';

export class OrdemMapper {
  static entityToResponseDto(entity: OrdensEntity): OrdemResponseDto {
    const dto = new OrdemResponseDto();
    dto.id = entity.id;
    dto.simbolo = entity.ativo.simbolo;
    dto.tipo = entity.tipo;
    dto.quantidade = entity.quantidade;
    dto.valorUnitario = Number(entity.valor_unitario);
    dto.valorTotal = Number(entity.valor_total);
    dto.status = entity.status;
    dto.criadoEm = entity.criado_em;
    dto.atualizadoEm = entity.atualizado_em;

    return dto;
  }

  static entityListToResponseDtoList(entities: OrdensEntity[]): OrdemResponseDto[] {
    return entities.map((entity) => this.entityToResponseDto(entity));
  }
}
