import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AtivosUsuariosEntity } from '../../entities/ativosUsuarios.entity';
import { AtivoUsuarioMapper } from '../../mappers/ativoUsuario.mapper';
import { AtivoUsuarioResponseDto } from '../../dtos/response/ativoUsuario.response';
import { ErrorUtil } from '../../../../utils/error';

@Injectable()
export class BuscarAtivoUsuarioPorSimboloRepository {
  private logger = new Logger(BuscarAtivoUsuarioPorSimboloRepository.name);

  constructor(
    @InjectRepository(AtivosUsuariosEntity)
    private readonly repository: Repository<AtivosUsuariosEntity>,
  ) {}

  public async execute(idUsuario: string, simbolo: string): Promise<AtivoUsuarioResponseDto> {
    try {
      const ativoUsuario = await this.repository.findOne({
        where: { id_usuario: idUsuario, ativo: { simbolo: simbolo } },
        relations: ['ativo'],
      });

      if (!ativoUsuario) {
        throw new ErrorUtil('USUARIO_NAO_POSSUI_ESTE_ATIVO', 'O usuário não possui este ativo.');
      }

      return AtivoUsuarioMapper.entityToDto(ativoUsuario);
    } catch (error) {
      if (error instanceof ErrorUtil) {
        throw error;
      }

      this.logger.error(`Erro inesperado ao buscar o ativo do usuário`, error);
      throw new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno ao buscar o ativo do usuário.');
    }
  }
}
