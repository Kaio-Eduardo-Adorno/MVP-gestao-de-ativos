import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AtivosUsuariosEntity } from '../../entities/ativosUsuarios.entity';
import { AtivoUsuarioResponseDto } from '../../dtos/response/ativoUsuario.response';
import { ErrorUtil } from '../../../../utils/error';
import { AtivoUsuarioMapper } from '../../mappers/ativoUsuario.mapper';

@Injectable()
export class BuscarAtivosPorUsuarioRepository {
  private readonly logger = new Logger(BuscarAtivosPorUsuarioRepository.name);

  constructor(
    @InjectRepository(AtivosUsuariosEntity)
    private readonly repository: Repository<AtivosUsuariosEntity>,
  ) {}

  public async execute(idUsuario: string): Promise<AtivoUsuarioResponseDto[]> {
    try {
      const ativosUsuarios = await this.repository.find({
        where: { id_usuario: idUsuario },
        relations: ['ativo'],
        order: { ativo: { simbolo: 'ASC' } },
      });

      if (!ativosUsuarios) {
        return [];
      }

      return AtivoUsuarioMapper.entityListToDtoList(ativosUsuarios);
    } catch (error) {
      if (error instanceof ErrorUtil) {
        throw error;
      }

      this.logger.error(`Erro inesperado ao buscar os ativos do usuario ${idUsuario}`, error);
      throw new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno ao buscar os ativos do usuario.');
    }
  }
}
