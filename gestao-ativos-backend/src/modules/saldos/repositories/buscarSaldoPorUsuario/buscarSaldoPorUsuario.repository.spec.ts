import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BuscarSaldoPorUsuarioRepository } from './buscarSaldoPorUsuario.repository';
import { SaldosEntity } from '../../entities/saldos.entity';
import { ErrorUtil } from '../../../../utils/error';
import { Logger } from '@nestjs/common';

describe('BuscarSaldoPorUsuarioRepository', () => {
  let repository: BuscarSaldoPorUsuarioRepository;
  let saldosRepository: Repository<SaldosEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuscarSaldoPorUsuarioRepository,
        {
          provide: getRepositoryToken(SaldosEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<BuscarSaldoPorUsuarioRepository>(BuscarSaldoPorUsuarioRepository);
    saldosRepository = module.get<Repository<SaldosEntity>>(getRepositoryToken(SaldosEntity));

    // Silencia o logger para manter o console de testes limpo
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(repository).toBeDefined();
  });

  it('deve permitir a instanciação manual via construtor', () => {
    const manualRepo = new BuscarSaldoPorUsuarioRepository(saldosRepository);
    expect(manualRepo).toBeInstanceOf(BuscarSaldoPorUsuarioRepository);
  });

  describe('execute', () => {
    const idUsuario = 'user-uuid-123';

    it('deve retornar um DTO com saldo 0 quando o registro não for encontrado no banco', async () => {
      jest.spyOn(saldosRepository, 'findOne').mockResolvedValue(null);

      const result = await repository.execute(idUsuario);

      expect(saldosRepository.findOne).toHaveBeenCalledWith({ where: { id_usuario: idUsuario } });
      expect(result.saldo).toBe(0);
    });

    it('deve retornar o saldo mapeado corretamente quando o registro existir', async () => {
      const mockEntity = {
        id_usuario: idUsuario,
        saldo: 150.75,
      } as SaldosEntity;

      jest.spyOn(saldosRepository, 'findOne').mockResolvedValue(mockEntity);

      const result = await repository.execute(idUsuario);

      expect(result.saldo).toBe(150.75);
    });

    it('deve repassar o erro caso ele já seja uma instância de ErrorUtil', async () => {
      const errorUtil = new ErrorUtil('SALDO_NAO_ENCONTRADO', 'Erro customizado');
      jest.spyOn(saldosRepository, 'findOne').mockRejectedValue(errorUtil);

      await expect(repository.execute(idUsuario)).rejects.toThrow(errorUtil);
    });

    it('deve lançar ERRO_INTERNO e logar a falha em caso de erro inesperado no banco de dados', async () => {
      const dbError = new Error('Database connection failed');
      jest.spyOn(saldosRepository, 'findOne').mockRejectedValue(dbError);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(repository.execute(idUsuario)).rejects.toThrow(
        new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno ao buscar o saldo do usuário.'),
      );

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Erro inesperado ao buscar o saldo do usuário ${idUsuario}`),
        dbError,
      );
    });
  });
});
