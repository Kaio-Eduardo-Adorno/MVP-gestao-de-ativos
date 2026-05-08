import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AtivosUsuariosEntity } from '../../entities/ativosUsuarios.entity';
import { ErrorUtil } from '../../../../utils/error';

@Injectable()
export class AtualizarQuantidadeAtivoUsuarioRepository {
  private logger = new Logger(AtualizarQuantidadeAtivoUsuarioRepository.name);

  constructor(
    @InjectRepository(AtivosUsuariosEntity)
    private readonly repository: Repository<AtivosUsuariosEntity>,
  ) {}

  public async execute(idUsuario: string, idAtivo: string, quantidade: number): Promise<boolean> {
    try {
      const ativoUsuario = await this.repository.findOne({
        where: { id_usuario: idUsuario, id_ativo: idAtivo },
        relations: ['ativo'],
      });

      if (!ativoUsuario) {
        await this.repository.save({
          id_usuario: idUsuario,
          id_ativo: idAtivo,
          quantidade: quantidade,
        });
        return true;
      }

      await this.repository.update(ativoUsuario.id, {
        quantidade: quantidade + ativoUsuario.quantidade,
      });

      return true;
    } catch (error) {
      if (error instanceof ErrorUtil) {
        throw error;
      }

      this.logger.error(`Erro inesperado ao buscar o ativo do usuário`, error);
      throw new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno ao buscar o ativo do usuário.');
    }
  }
}
