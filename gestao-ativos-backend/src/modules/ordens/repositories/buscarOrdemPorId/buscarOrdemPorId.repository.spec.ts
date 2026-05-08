import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { BuscarOrdemPorIdRepository } from './buscarOrdemPorId.repository';
import { OrdemResponseDto } from '../../dtos/response/ordem.response';
import { OrdensEntity } from '../../entities/ordens.entity';
import { OrdemMapper } from '../../mappers/ordem.mapper';
import { ErrorUtil } from '../../../../utils/error';
import { AtivosEntity } from '../../../../modules/ativos/entities/ativos.entity';

describe('BuscarOrdemPorIdRepository', () => {
  let repository: BuscarOrdemPorIdRepository;
  let ordensRepository: Repository<OrdensEntity>;

  const mockOrdemResponse: OrdemResponseDto = {
    id: 'ordem-uuid-123',
    simbolo: 'ITUB4',
    quantidade: 100,
    valorTotal: 3280.0,
    tipo: 'COMPRA',
    status: 'PENDENTE',
    criadoEm: new Date(),
  } as OrdemResponseDto;

  const mockOrdemEntity: OrdensEntity = {
    id: 'ordem-uuid-123',
    id_usuario: 'user-uuid',
    id_ativo: 'ativo-uuid',
    tipo: 'COMPRA',
    quantidade: 100,
    valor_unitario: 32.8,
    valor_total: 3280.0,
    status: 'PENDENTE',
    chave_idempotencia: 'chave-idemp-123',
    criado_em: new Date(),
    atualizado_em: new Date(),
    ativo: { simbolo: 'ITUB4', nome: 'Itaú' } as AtivosEntity, // Mock parcial do ativo
  } as OrdensEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuscarOrdemPorIdRepository,
        {
          provide: getRepositoryToken(OrdensEntity),
          useValue: {
            execute: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<BuscarOrdemPorIdRepository>(BuscarOrdemPorIdRepository);
    ordensRepository = module.get<Repository<OrdensEntity>>(getRepositoryToken(OrdensEntity));

    // Silencia o logger para evitar poluição no console de testes
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Limpa o histórico de chamadas dos mocks após cada teste
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(repository).toBeDefined();
  });

  it('deve permitir a instanciação manual via construtor para cobertura', () => {
    const manualRepo = new BuscarOrdemPorIdRepository(ordensRepository);
    expect(manualRepo).toBeDefined();
  });

  describe('execute', () => {
    const idOrdem = 'ordem-uuid-123';

    it('deve retornar a ordem mapeada para DTO quando encontrada', async () => {
      jest.spyOn(ordensRepository, 'findOne').mockResolvedValue(mockOrdemEntity);
      jest.spyOn(OrdemMapper, 'entityToResponseDto').mockReturnValue(mockOrdemResponse);

      const result = await repository.execute(idOrdem);

      expect(ordensRepository.findOne).toHaveBeenCalledWith({ where: { id: idOrdem }, relations: ['ativo'] });
      expect(OrdemMapper.entityToResponseDto).toHaveBeenCalledWith(mockOrdemEntity);
      expect(result).toEqual(mockOrdemResponse);
    });

    it('deve lançar ORDEM_NAO_ENCONTRADA quando a ordem não existir', async () => {
      jest.spyOn(ordensRepository, 'findOne').mockResolvedValue(null);

      await expect(repository.execute(idOrdem)).rejects.toThrow(
        new ErrorUtil('ORDEM_NAO_ENCONTRADA', 'Ordem não encontrada.'),
      );
    });

    it('deve repassar o erro caso ele já seja uma instância de ErrorUtil', async () => {
      const customError = new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno!');
      jest.spyOn(ordensRepository, 'findOne').mockRejectedValue(customError);

      await expect(repository.execute(idOrdem)).rejects.toThrow(customError);
    });

    it('deve lançar ERRO_INTERNO e logar a falha em caso de erro genérico no banco de dados', async () => {
      const dbError = new Error('Database connection failed');
      jest.spyOn(ordensRepository, 'findOne').mockRejectedValue(dbError);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(repository.execute(idOrdem)).rejects.toThrow(ErrorUtil);
      await expect(repository.execute(idOrdem)).rejects.toMatchObject({
        errorName: 'ErroInterno',
        message: 'Ocorreu um erro interno ao buscar a ordem.',
      });

      expect(loggerSpy).toHaveBeenCalledWith(`Erro inesperado ao buscar a ordem`, dbError);
    });
  });
});
