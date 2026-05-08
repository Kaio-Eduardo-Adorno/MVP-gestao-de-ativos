import { AtivoResponseDto } from '../dtos/response/ativo.response';
import { AtivosEntity } from '../entities/ativos.entity';

export class AtivoMapper {
  static entityToDto(entity: AtivosEntity): AtivoResponseDto {
    const dto = new AtivoResponseDto();
    dto.id = entity.id;
    dto.simbolo = entity.simbolo;
    dto.nome = entity.nome;
    dto.cotacao = entity.cotacao;
    dto.horarioCotacao = entity.horario_cotacao;
    return dto;
  }

  static entityListToDtoList(entities: AtivosEntity[]): AtivoResponseDto[] {
    return entities.map((entity) => this.entityToDto(entity));
  }
}
