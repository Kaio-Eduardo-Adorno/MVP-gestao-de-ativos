import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { BuscarAtivoUsuarioPorSimboloRepository } from './buscarAtivoUsuarioPorSimbolo.repository';
import { AtivosUsuariosEntity } from '../../entities/ativosUsuarios.entity';
import { AtivosEntity } from '../../entities/ativos.entity';
import { ErrorUtil } from 'src/utils/error';

describe('BuscarAtivoUsuarioPorSimboloRepository', () => {
  let repository: BuscarAtivoUsuarioPorSimboloRepository;
  let ativosUsuariosRepo: Repository<AtivosUsuariosEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuscarAtivoUsuarioPorSimboloRepository,
        {
          provide: getRepositoryToken(AtivosUsuariosEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<BuscarAtivoUsuarioPorSimboloRepository>(BuscarAtivoUsuarioPorSimboloRepository);
    ativosUsuariosRepo = module.get<Repository<AtivosUsuariosEntity>>(getRepositoryToken(AtivosUsuariosEntity));

    // Silencia o logger para evitar poluição no console de testes
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  it('deve estar definido', () => {
    expect(repository).toBeDefined();
  });

  describe('execute', () => {
    const idUsuario = 'user-uuid-123';
    const simbolo = 'PETR4';

    it('deve retornar o ativo do usuário mapeado para DTO quando encontrado', async () => {
      const mockAtivo = { simbolo: 'PETR4', nome: 'Petrobras', cotacao: 35.0 } as AtivosEntity;
      const mockAtivoUsuario = {
        id: 'record-1',
        id_usuario: idUsuario,
        quantidade: 50,
        ativo: mockAtivo,
      } as AtivosUsuariosEntity;

      jest.spyOn(ativosUsuariosRepo, 'findOne').mockResolvedValue(mockAtivoUsuario);

      const result = await repository.execute(idUsuario, simbolo);

      expect(ativosUsuariosRepo.findOne).toHaveBeenCalledWith({
        where: { id_usuario: idUsuario, ativo: { simbolo: simbolo } },
        relations: ['ativo'],
      });
      expect(result.simbolo).toBe('PETR4');
      expect(result.quantidade).toBe(50);
      expect(result.nome).toBe('Petrobras');
    });

    it('deve lançar erro USUARIO_NAO_POSSUI_ESTE_ATIVO quando o registro não for encontrado', async () => {
      jest.spyOn(ativosUsuariosRepo, 'findOne').mockResolvedValue(null);

      await expect(repository.execute(idUsuario, simbolo)).rejects.toThrow(
        new ErrorUtil('USUARIO_NAO_POSSUI_ESTE_ATIVO', 'O usuário não possui este ativo.'),
      );
    });

    it('deve lançar ERRO_INTERNO e logar a falha em caso de erro inesperado no banco', async () => {
      const dbError = new Error('Database connection lost');
      jest.spyOn(ativosUsuariosRepo, 'findOne').mockRejectedValue(dbError);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(repository.execute(idUsuario, simbolo)).rejects.toThrow(
        new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno ao buscar o ativo do usuário.'),
      );

      expect(loggerSpy).toHaveBeenCalledWith('Erro inesperado ao buscar o ativo do usuário', dbError);
    });
  });
});