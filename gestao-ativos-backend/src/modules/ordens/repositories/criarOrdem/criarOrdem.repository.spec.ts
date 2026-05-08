import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CriarOrdemRepository } from './criarOrdem.repository';
import { OrdensEntity } from '../../entities/ordens.entity';
import { ErrorUtil } from '../../../../utils/error';
import { OrdemRequestDto } from '../../dtos/request/ordem.request';
import { AtivoResponseDto } from '../../../../modules/ativos/dtos/response/ativo.response';
import { OrdemTipoEnum } from '../../enums/ordemTipo.enum';

describe('CriarOrdemRepository', () => {
  let repository: CriarOrdemRepository;
  let ordensRepository: Repository<OrdensEntity>;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CriarOrdemRepository,
        {
          provide: getRepositoryToken(OrdensEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<CriarOrdemRepository>(CriarOrdemRepository);
    ordensRepository = module.get<Repository<OrdensEntity>>(getRepositoryToken(OrdensEntity));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    // Silencia o logger para evitar poluição no console de testes
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(repository).toBeDefined();
  });

  it('deve permitir a instanciação manual via construtor para cobertura do cabeçalho', () => {
    const manualRepo = new CriarOrdemRepository(eventEmitter, ordensRepository);
    expect(manualRepo).toBeDefined();
  });

  describe('execute', () => {
    const mockIdUsuario = 'user-uuid-123';
    const mockChaveIdempotencia = 'chave-idemp-123';

    const mockOrdemRequest = {
      simbolo: 'PETR4',
      quantidade: 10,
      tipo: OrdemTipoEnum.COMPRA,
    } as OrdemRequestDto;

    const mockAtivoResponse: AtivoResponseDto = {
      id: 'ativo-uuid-123',
      simbolo: 'PETR4',
      nome: 'Petrobras',
      cotacao: 35.5,
      horarioCotacao: new Date(),
    };

    it('deve retornar true e não salvar nem emitir evento se a ordem já existir (idempotência)', async () => {
      jest.spyOn(ordensRepository, 'findOne').mockResolvedValue({ id: 'ordem-existente' } as OrdensEntity);

      const result = await repository.execute(mockIdUsuario, mockChaveIdempotencia, mockOrdemRequest, mockAtivoResponse);

      expect(ordensRepository.findOne).toHaveBeenCalledWith({
        where: { chave_idempotencia: mockChaveIdempotencia },
        relations: ['ativo'],
      });
      expect(ordensRepository.save).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('deve salvar uma nova ordem e emitir o evento ordem.criada se a ordem for inédita', async () => {
      jest.spyOn(ordensRepository, 'findOne').mockResolvedValue(null);

      const mockOrdemSalva = {
        id: 'nova-ordem-123',
        id_usuario: mockIdUsuario,
        id_ativo: mockAtivoResponse.id,
      } as OrdensEntity;

      jest.spyOn(ordensRepository, 'save').mockResolvedValue(mockOrdemSalva);

      const result = await repository.execute(mockIdUsuario, mockChaveIdempotencia, mockOrdemRequest, mockAtivoResponse);

      expect(ordensRepository.save).toHaveBeenCalledWith({
        id_usuario: mockIdUsuario,
        id_ativo: mockAtivoResponse.id,
        quantidade: mockOrdemRequest.quantidade,
        tipo: mockOrdemRequest.tipo,
        valor_unitario: mockAtivoResponse.cotacao,
        valor_total: 355.0, // 35.5 * 10
        status: 'PENDENTE',
        chave_idempotencia: mockChaveIdempotencia,
      });

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'ordem.criada',
        mockOrdemSalva.id,
        mockOrdemSalva.id_usuario,
        mockOrdemSalva.id_ativo,
      );

      expect(result).toBe(true);
    });

    it('deve repassar o erro caso ele já seja uma instância do ErrorUtil verdadeiro', async () => {
      const customError = new ErrorUtil('ORDEM_INVALIDA', 'Ordem inválida');
      jest.spyOn(ordensRepository, 'findOne').mockRejectedValue(customError);

      await expect(repository.execute(mockIdUsuario, mockChaveIdempotencia, mockOrdemRequest, mockAtivoResponse)).rejects.toThrow(
        customError,
      );
    });

    it('deve lançar ERRO_INTERNO e logar a falha em caso de erro genérico no banco de dados', async () => {
      const dbError = new Error('Database connection failed');
      jest.spyOn(ordensRepository, 'findOne').mockRejectedValue(dbError);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(repository.execute(mockIdUsuario, mockChaveIdempotencia, mockOrdemRequest, mockAtivoResponse)).rejects.toThrow(
        ErrorUtil,
      );

      await expect(
        repository.execute(mockIdUsuario, mockChaveIdempotencia, mockOrdemRequest, mockAtivoResponse),
      ).rejects.toMatchObject({
        errorName: 'ErroInterno', // Validado corretamente pelo ErrorUtil original!
        message: 'Ocorreu um erro interno ao criar a ordem.',
      });

      expect(loggerSpy).toHaveBeenCalledWith('Erro inesperado ao criar a ordem', dbError);
    });
  });
});
