import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { BuscarAtivosPorUsuarioRepository } from './buscarAtivosPorUsuario.repository';
import { AtivosUsuariosEntity } from '../../entities/ativosUsuarios.entity';
import { ErrorUtil } from 'src/utils/error';
import { AtivosEntity } from '../../entities/ativos.entity';

describe('BuscarAtivosPorUsuarioRepository', () => {
  let repository: BuscarAtivosPorUsuarioRepository;
  let ativosUsuariosRepo: Repository<AtivosUsuariosEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuscarAtivosPorUsuarioRepository,
        {
          provide: getRepositoryToken(AtivosUsuariosEntity),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<BuscarAtivosPorUsuarioRepository>(BuscarAtivosPorUsuarioRepository);
    ativosUsuariosRepo = module.get<Repository<AtivosUsuariosEntity>>(getRepositoryToken(AtivosUsuariosEntity));

    // Silencia o logger para manter o console de testes limpo
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(repository).toBeDefined();
  });

  it('deve permitir a instanciação manual via construtor para cobertura', () => {
    const manualRepo = new BuscarAtivosPorUsuarioRepository(ativosUsuariosRepo);
    expect(manualRepo).toBeDefined();
  });

  describe('execute', () => {
    const idUsuario = 'user-uuid-123';

    it('deve retornar a lista de ativos do usuário mapeada para DTO', async () => {
      const mockAtivo = { simbolo: 'PETR4', nome: 'Petrobras', cotacao: 35.0 } as AtivosEntity;
      const mockAtivosUsuarios = [
        {
          id: '1',
          id_usuario: idUsuario,
          quantidade: 100,
          ativo: mockAtivo,
        },
      ] as AtivosUsuariosEntity[];

      jest.spyOn(ativosUsuariosRepo, 'find').mockResolvedValue(mockAtivosUsuarios);

      const result = await repository.execute(idUsuario);

      expect(ativosUsuariosRepo.find).toHaveBeenCalledWith({
        where: { id_usuario: idUsuario },
        relations: ['ativo'],
        order: { ativo: { simbolo: 'ASC' } },
      });
      expect(result).toHaveLength(1);
      expect(result[0].simbolo).toBe('PETR4');
      expect(result[0].quantidade).toBe(100);
    });

    it('deve retornar um array vazio se a busca não retornar dados (falsy)', async () => {
      // Simulamos um retorno nulo para cobrir o branch "if (!ativosUsuarios)"
      jest.spyOn(ativosUsuariosRepo, 'find').mockResolvedValue(null as any);

      const result = await repository.execute(idUsuario);

      expect(result).toEqual([]);
    });

    it('deve repassar o erro caso ele já seja uma instância de ErrorUtil', async () => {
      const customError = new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno!');
      jest.spyOn(ativosUsuariosRepo, 'find').mockRejectedValue(customError);

      await expect(repository.execute(idUsuario)).rejects.toMatchObject({
        errorName: 'ErroInterno',
      });
    });

    it('deve lançar ERRO_INTERNO e logar a falha em caso de erro genérico no banco de dados', async () => {
      const dbError = new Error('Database connection failed');
      jest.spyOn(ativosUsuariosRepo, 'find').mockRejectedValue(dbError);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(repository.execute(idUsuario)).rejects.toMatchObject({
        errorName: 'ErroInterno',
        message: 'Ocorreu um erro interno ao buscar os ativos do usuario.',
      });

      expect(loggerSpy).toHaveBeenCalledWith(`Erro inesperado ao buscar os ativos do usuario ${idUsuario}`, dbError);
    });
  });
});
