import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { AtualizarStatusOrdemRepository } from './atualizarStatusOrdem.repository';
import { OrdensEntity } from '../../entities/ordens.entity';
import { OrdemStatusEnum } from '../../enums/ordemStatus.enum';

describe('AtualizarStatusOrdemRepository', () => {
  let repository: AtualizarStatusOrdemRepository;
  let ordensRepository: Repository<OrdensEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AtualizarStatusOrdemRepository,
        {
          provide: getRepositoryToken(OrdensEntity),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<AtualizarStatusOrdemRepository>(AtualizarStatusOrdemRepository);
    ordensRepository = module.get<Repository<OrdensEntity>>(getRepositoryToken(OrdensEntity));

    // Silencia o logger para manter o console do Jest limpo
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(repository).toBeDefined();
  });

  it('deve permitir a instanciação manual via construtor para cobertura', () => {
    const manualRepo = new AtualizarStatusOrdemRepository(ordensRepository);
    expect(manualRepo).toBeDefined();
  });

  describe('execute', () => {
    const idOrdem = 'ordem-uuid-123';

    it('deve atualizar o status para PROCESSANDO com sucesso se a ordem estiver PENDENTE', async () => {
      jest.spyOn(ordensRepository, 'findOne').mockResolvedValue({ status: OrdemStatusEnum.PENDENTE.toString() } as OrdensEntity);
      jest.spyOn(ordensRepository, 'update').mockResolvedValue(undefined as any);

      const result = await repository.execute(idOrdem, OrdemStatusEnum.PROCESSANDO);

      expect(ordensRepository.findOne).toHaveBeenCalledWith({ where: { id: idOrdem } });
      expect(ordensRepository.update).toHaveBeenCalledWith({ id: idOrdem }, { status: OrdemStatusEnum.PROCESSANDO.toString() });
      expect(result).toBe(true);
    });

    it('deve lançar erro ORDEM_NAO_ENCONTRADA se a ordem não existir', async () => {
      jest.spyOn(ordensRepository, 'findOne').mockResolvedValue(null);

      await expect(repository.execute(idOrdem, OrdemStatusEnum.CANCELADA)).rejects.toMatchObject({
        errorName: 'OrdemNaoEncontrada',
      });
    });

    it('deve lançar erro se tentar CANCELAR uma ordem que não está PENDENTE', async () => {
      jest
        .spyOn(ordensRepository, 'findOne')
        .mockResolvedValue({ status: OrdemStatusEnum.PROCESSANDO.toString() } as OrdensEntity);
      await expect(repository.execute(idOrdem, OrdemStatusEnum.CANCELADA)).rejects.toMatchObject({
        errorName: 'OrdemNaoPodeSerCancelada',
      });
    });

    it('deve lançar erro se tentar PROCESSAR uma ordem que não está PENDENTE', async () => {
      jest.spyOn(ordensRepository, 'findOne').mockResolvedValue({ status: OrdemStatusEnum.EXECUTADA.toString() } as OrdensEntity);
      await expect(repository.execute(idOrdem, OrdemStatusEnum.PROCESSANDO)).rejects.toMatchObject({
        errorName: 'OrdemNaoPodeSerProcessada',
      });
    });

    it('deve lançar erro se tentar EXECUTAR uma ordem que não está PROCESSANDO', async () => {
      jest.spyOn(ordensRepository, 'findOne').mockResolvedValue({ status: OrdemStatusEnum.PENDENTE.toString() } as OrdensEntity);
      await expect(repository.execute(idOrdem, OrdemStatusEnum.EXECUTADA)).rejects.toMatchObject({
        errorName: 'OrdemNaoPodeSerExecutada',
      });
    });

    it('deve lançar erro se tentar REJEITAR uma ordem que não está PROCESSANDO', async () => {
      jest.spyOn(ordensRepository, 'findOne').mockResolvedValue({ status: OrdemStatusEnum.PENDENTE.toString() } as OrdensEntity);
      await expect(repository.execute(idOrdem, OrdemStatusEnum.REJEITADA)).rejects.toMatchObject({
        errorName: 'OrdemNaoPodeSerRejeitada',
      });
    });

    it('deve converter erros genéricos do banco para ERRO_INTERNO e logar', async () => {
      const genericError = new Error('Falha no Postgres');
      jest.spyOn(ordensRepository, 'findOne').mockRejectedValue(genericError);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(repository.execute(idOrdem, OrdemStatusEnum.CANCELADA)).rejects.toMatchObject({ errorName: 'ErroInterno' });
      expect(loggerSpy).toHaveBeenCalledWith('Erro inesperado ao atualizar o status da ordem', genericError);
    });
  });
});
