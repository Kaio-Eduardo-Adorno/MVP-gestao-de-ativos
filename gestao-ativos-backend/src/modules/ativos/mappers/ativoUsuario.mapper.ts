import { AtivoUsuarioResponseDto } from '../dtos/response/ativoUsuario.response';
import { AtivosUsuariosEntity } from '../entities/ativosUsuarios.entity';

export class AtivoUsuarioMapper {
  static entityToDto(entity: AtivosUsuariosEntity): AtivoUsuarioResponseDto {
    const dto = new AtivoUsuarioResponseDto();
    dto.nome = entity.ativo.nome;
    dto.simbolo = entity.ativo.simbolo;
    dto.quantidade = entity.quantidade;
    dto.cotacaoAtual = entity.ativo.cotacao;
    dto.horarioCotacao = entity.ativo.horario_cotacao;
    return dto;
  }

  static entityListToDtoList(entities: AtivosUsuariosEntity[]): AtivoUsuarioResponseDto[] {
    return entities.map((entity) => this.entityToDto(entity));
  }
}
