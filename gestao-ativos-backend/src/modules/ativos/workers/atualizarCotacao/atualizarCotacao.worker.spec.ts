import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { AtualizarCotacaoWorker } from './atualizarCotacao.worker';
import { AtualizarCotacaoAtivoRepository } from '../../repositories/atualizarCotacaoAtivo/atualizarCotacaoAtivo.repository';
import { BuscarCotacaoAtualRepository } from '../../repositories';
import { ErrorUtil } from '../../../../utils/error';

describe('AtualizarCotacaoWorker', () => {
  let worker: AtualizarCotacaoWorker;
  let atualizarRepo: AtualizarCotacaoAtivoRepository;
  let buscarRepo: BuscarCotacaoAtualRepository;
  let loggerErrorSpy: jest.SpyInstance;
  let loggerDebugSpy: jest.SpyInstance;

  const mockCotacoes = [
    { simbolo: 'PETR4', preco: 35.0, dataCotacao: '2023-10-27T10:00:00Z' },
    { simbolo: 'VALE3', preco: 70.0, dataCotacao: '2023-10-27T10:00:00Z' },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AtualizarCotacaoWorker,
        {
          provide: AtualizarCotacaoAtivoRepository,
          useValue: { execute: jest.fn() },
        },
        {
          provide: BuscarCotacaoAtualRepository,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    worker = module.get<AtualizarCotacaoWorker>(AtualizarCotacaoWorker);
    atualizarRepo = module.get<AtualizarCotacaoAtivoRepository>(AtualizarCotacaoAtivoRepository);
    buscarRepo = module.get<BuscarCotacaoAtualRepository>(BuscarCotacaoAtualRepository);

    // Spies para validar os logs sem poluir a saída do terminal
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    loggerDebugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(worker).toBeDefined();
  });

  describe('handleInterval', () => {
    it('deve processar todas as atualizações com sucesso', async () => {
      jest.spyOn(buscarRepo, 'execute').mockResolvedValue(mockCotacoes as any);
      jest.spyOn(atualizarRepo, 'execute').mockResolvedValue(true);

      await worker.handleInterval();

      expect(buscarRepo.execute).toHaveBeenCalledTimes(1);
      expect(atualizarRepo.execute).toHaveBeenCalledTimes(2);
      expect(loggerDebugSpy).toHaveBeenCalledWith(expect.stringContaining('Ciclo finalizado com sucesso'));
    });

    it('deve lidar com falhas parciais (allSettled) e logar erros específicos', async () => {
      jest.spyOn(buscarRepo, 'execute').mockResolvedValue(mockCotacoes as any);

      // O primeiro ativo (PETR4) falha com ErrorUtil, o segundo (VALE3) tem sucesso
      const errorUtil = new ErrorUtil('ATIVO_INDISPONIVEL', 'Ativo não encontrado');
      jest.spyOn(atualizarRepo, 'execute').mockRejectedValueOnce(errorUtil).mockResolvedValueOnce(true);

      await worker.handleInterval();

      expect(atualizarRepo.execute).toHaveBeenCalledTimes(2);
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Falha ao atualizar PETR4: Ativo não encontrado'),
      );
    });

    it('deve logar erro inesperado quando uma promessa falha sem ser ErrorUtil', async () => {
      jest.spyOn(buscarRepo, 'execute').mockResolvedValue([mockCotacoes[0]] as any);
      const genericError = new Error('Banco explodiu');
      jest.spyOn(atualizarRepo, 'execute').mockRejectedValue(genericError);

      await worker.handleInterval();

      expect(loggerErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Erro inesperado ao atualizar PETR4:'), genericError);
    });

    it('deve capturar falhas críticas no início do ciclo (ex: falha ao buscar cotações)', async () => {
      const criticalError = new ErrorUtil('ERRO_INTERNO', 'Servidor de cotações fora do ar');
      jest.spyOn(buscarRepo, 'execute').mockRejectedValue(criticalError);

      await worker.handleInterval();

      expect(atualizarRepo.execute).not.toHaveBeenCalled();
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Falha no Worker: Servidor de cotações fora do ar'),
        criticalError.stack,
      );
    });

    it('deve permitir a instanciação manual para cobertura total do construtor', () => {
      const manualWorker = new AtualizarCotacaoWorker(atualizarRepo, buscarRepo);
      expect(manualWorker).toBeDefined();
    });

    it('deve logar erro inesperado no Worker quando uma falha genérica ocorre (Linhas 41-43)', async () => {
      const genericError = new Error('Falha de conexão com a infraestrutura');
      jest.spyOn(buscarRepo, 'execute').mockRejectedValue(genericError);

      await worker.handleInterval();

      expect(atualizarRepo.execute).not.toHaveBeenCalled();
      expect(loggerErrorSpy).toHaveBeenCalledWith('Erro inesperado no Worker:', genericError);
    });
  });
});
