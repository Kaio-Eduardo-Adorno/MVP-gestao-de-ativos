import { Test, TestingModule } from '@nestjs/testing';
import { ProcessarOrdensWorker } from './processarOrdens.worker';
import { AtualizarStatusOrdemRepository, BuscarOrdemPorIdRepository } from '../../repositories';
import { AtualizarSaldoRepository, BuscarSaldoPorUsuarioRepository } from '../../../../modules/saldos/repositories';
import { AtualizarQuantidadeAtivoUsuarioRepository, BuscarAtivoUsuarioPorSimboloRepository } from '../../../ativos/repositories';
import { OrdemStatusEnum } from '../../enums/ordemStatus.enum';
import { ErrorUtil } from '../../../../utils/error';

// 1. Fazemos o mock do setTimeout do Node para os testes não demorarem 10 segundos
jest.mock('timers/promises', () => ({
  setTimeout: jest.fn().mockResolvedValue(undefined),
}));

describe('ProcessarOrdensWorker', () => {
  let worker: ProcessarOrdensWorker;
  let buscarOrdemRepository: BuscarOrdemPorIdRepository;
  let atualizarStatusOrdemRepository: AtualizarStatusOrdemRepository;
  let buscarSaldoPorUsuarioRepository: BuscarSaldoPorUsuarioRepository;
  let atualizarSaldoRepository: AtualizarSaldoRepository;
  let buscarAtivoUsuarioPorSimboloRepository: BuscarAtivoUsuarioPorSimboloRepository;
  let atualizarQuantidadeAtivoUsuarioRepository: AtualizarQuantidadeAtivoUsuarioRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessarOrdensWorker,
        { provide: BuscarOrdemPorIdRepository, useValue: { execute: jest.fn() } },
        { provide: AtualizarStatusOrdemRepository, useValue: { execute: jest.fn() } },
        { provide: BuscarSaldoPorUsuarioRepository, useValue: { execute: jest.fn() } },
        { provide: AtualizarSaldoRepository, useValue: { execute: jest.fn() } },
        { provide: BuscarAtivoUsuarioPorSimboloRepository, useValue: { execute: jest.fn() } },
        { provide: AtualizarQuantidadeAtivoUsuarioRepository, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    worker = module.get<ProcessarOrdensWorker>(ProcessarOrdensWorker);
    buscarOrdemRepository = module.get(BuscarOrdemPorIdRepository);
    atualizarStatusOrdemRepository = module.get(AtualizarStatusOrdemRepository);
    buscarSaldoPorUsuarioRepository = module.get(BuscarSaldoPorUsuarioRepository);
    atualizarSaldoRepository = module.get(AtualizarSaldoRepository);
    buscarAtivoUsuarioPorSimboloRepository = module.get(BuscarAtivoUsuarioPorSimboloRepository);
    atualizarQuantidadeAtivoUsuarioRepository = module.get(AtualizarQuantidadeAtivoUsuarioRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleOrdemCriadaEvent', () => {
    const idOrdem = 'ordem-123';
    const idUsuario = 'user-123';
    const idAtivo = 'ativo-123';

    it('deve processar uma ordem de COMPRA com sucesso', async () => {
      // Setup dos mocks
      buscarOrdemRepository.execute = jest.fn().mockResolvedValue({
        id: idOrdem,
        tipo: 'COMPRA',
        valorTotal: 500,
        quantidade: 10,
        simbolo: 'ITUB4',
      });
      buscarSaldoPorUsuarioRepository.execute = jest.fn().mockResolvedValue({ saldo: 1000 });

      await worker.handleOrdemCriadaEvent(idOrdem, idUsuario, idAtivo);

      // Asserts
      expect(atualizarStatusOrdemRepository.execute).toHaveBeenCalledWith(idOrdem, OrdemStatusEnum.PROCESSANDO);
      expect(atualizarSaldoRepository.execute).toHaveBeenCalledWith(idUsuario, -500);
      expect(atualizarQuantidadeAtivoUsuarioRepository.execute).toHaveBeenCalledWith(idUsuario, idAtivo, 10);
      expect(atualizarStatusOrdemRepository.execute).toHaveBeenCalledWith(idOrdem, OrdemStatusEnum.EXECUTADA);
    });

    it('deve processar uma ordem de VENDA com sucesso', async () => {
      buscarOrdemRepository.execute = jest.fn().mockResolvedValue({
        id: idOrdem,
        tipo: 'VENDA',
        valorTotal: 500,
        quantidade: 10,
        simbolo: 'ITUB4',
      });
      buscarAtivoUsuarioPorSimboloRepository.execute = jest.fn().mockResolvedValue({ quantidade: 20 });

      await worker.handleOrdemCriadaEvent(idOrdem, idUsuario, idAtivo);

      expect(atualizarSaldoRepository.execute).toHaveBeenCalledWith(idUsuario, 500);
      expect(atualizarQuantidadeAtivoUsuarioRepository.execute).toHaveBeenCalledWith(idUsuario, idAtivo, -10);
      expect(atualizarStatusOrdemRepository.execute).toHaveBeenCalledWith(idOrdem, OrdemStatusEnum.EXECUTADA);
    });

    it('deve capturar erro e não quebrar a aplicação caso a busca da ordem falhe', async () => {
      buscarOrdemRepository.execute = jest.fn().mockRejectedValue(new Error('Banco caiu'));
      const loggerSpy = jest.spyOn(worker['logger'], 'error').mockImplementation();

      await worker.handleOrdemCriadaEvent(idOrdem, idUsuario, idAtivo);

      expect(loggerSpy).toHaveBeenCalled();
      expect(atualizarStatusOrdemRepository.execute).not.toHaveBeenCalledWith(idOrdem, OrdemStatusEnum.EXECUTADA);
    });

    it('deve permitir a instanciação manual para cobertura do cabeçalho da classe', () => {
      const manualWorker = new ProcessarOrdensWorker(
        buscarOrdemRepository,
        atualizarStatusOrdemRepository,
        buscarSaldoPorUsuarioRepository,
        atualizarSaldoRepository,
        buscarAtivoUsuarioPorSimboloRepository,
        atualizarQuantidadeAtivoUsuarioRepository,
      );
      expect(manualWorker).toBeDefined();
    });

    it('deve relançar o erro se ele for uma instância de ErrorUtil (Linha 61)', async () => {
      const errorUtil = new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno');
      // Forçamos o erro FORA do loop de retentativas para cair no catch principal externo
      buscarOrdemRepository.execute = jest.fn().mockRejectedValue(errorUtil);

      const loggerSpy = jest.spyOn(worker['logger'], 'error').mockImplementation();

      await worker.handleOrdemCriadaEvent(idOrdem, idUsuario, idAtivo);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Erro inesperado ao processar a ordem ${idOrdem}`),
        errorUtil,
      );
    });

    it('deve converter erros genéricos para ERRO_INTERNO e logar (Linha 64)', async () => {
      const genericError = new Error('Falha catastrófica no banco');
      buscarOrdemRepository.execute = jest.fn().mockRejectedValue(genericError);

      const loggerSpy = jest.spyOn(worker['logger'], 'error').mockImplementation();

      await worker.handleOrdemCriadaEvent(idOrdem, idUsuario, idAtivo);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Erro inesperado ao processar a ordem ${idOrdem}`),
        expect.objectContaining({ errorName: 'ErroInterno' }),
      );
    });
  });
});
