import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { AtualizarQuantidadeAtivoUsuarioRepository } from './atualizarQuantidadeAtivoUsuario.repository';
import { AtivosUsuariosEntity } from '../../entities/ativosUsuarios.entity';
import { ErrorUtil } from '../../../../utils/error';

describe('AtualizarQuantidadeAtivoUsuarioRepository', () => {
  let repository: AtualizarQuantidadeAtivoUsuarioRepository;
  let typeOrmRepository: Repository<AtivosUsuariosEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AtualizarQuantidadeAtivoUsuarioRepository,
        {
          provide: getRepositoryToken(AtivosUsuariosEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<AtualizarQuantidadeAtivoUsuarioRepository>(AtualizarQuantidadeAtivoUsuarioRepository);
    typeOrmRepository = module.get<Repository<AtivosUsuariosEntity>>(getRepositoryToken(AtivosUsuariosEntity));

    // Silencia o logger global para evitar sujeira no console durante os testes
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(repository).toBeDefined();
  });

  it('deve permitir a instanciação manual via construtor para cobertura do cabeçalho', () => {
    const manualRepo = new AtualizarQuantidadeAtivoUsuarioRepository(typeOrmRepository);
    expect(manualRepo).toBeDefined();
  });

  describe('execute', () => {
    const mockIdUsuario = 'user-uuid-123';
    const mockIdAtivo = 'ativo-uuid-456';
    const mockQuantidade = 10;

    it('deve criar um novo registro (save) se o usuário ainda não possuir o ativo na carteira', async () => {
      jest.spyOn(typeOrmRepository, 'findOne').mockResolvedValue(null);

      const result = await repository.execute(mockIdUsuario, mockIdAtivo, mockQuantidade);

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id_usuario: mockIdUsuario, id_ativo: mockIdAtivo },
        relations: ['ativo'],
      });
      expect(typeOrmRepository.save).toHaveBeenCalledWith({
        id_usuario: mockIdUsuario,
        id_ativo: mockIdAtivo,
        quantidade: mockQuantidade,
      });
      expect(typeOrmRepository.update).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('deve atualizar a quantidade somando o valor (update) se o registro já existir', async () => {
      const ativoExistente = { id: 'registro-uuid-789', quantidade: 50 } as AtivosUsuariosEntity;
      jest.spyOn(typeOrmRepository, 'findOne').mockResolvedValue(ativoExistente);

      const result = await repository.execute(mockIdUsuario, mockIdAtivo, mockQuantidade);

      expect(typeOrmRepository.update).toHaveBeenCalledWith('registro-uuid-789', {
        quantidade: 60, // 50 + 10
      });
      expect(typeOrmRepository.save).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('deve repassar o erro se ele já for uma instância de ErrorUtil', async () => {
      const expectedError = new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno!');
      jest.spyOn(typeOrmRepository, 'findOne').mockRejectedValue(expectedError);

      await expect(repository.execute(mockIdUsuario, mockIdAtivo, mockQuantidade)).rejects.toThrow(expectedError);
    });

    it('deve logar e lançar ERRO_INTERNO ao encontrar falhas genéricas do banco', async () => {
      const genericError = new Error('Falha de conexão com o banco de dados');
      jest.spyOn(typeOrmRepository, 'findOne').mockRejectedValue(genericError);
      const loggerSpy = jest.spyOn(repository['logger'], 'error').mockImplementation();

      await expect(repository.execute(mockIdUsuario, mockIdAtivo, mockQuantidade)).rejects.toMatchObject({
        errorName: 'ErroInterno',
        message: 'Ocorreu um erro interno ao buscar o ativo do usuário.',
      });

      expect(loggerSpy).toHaveBeenCalledWith('Erro inesperado ao buscar o ativo do usuário', genericError);
    });
  });
});
