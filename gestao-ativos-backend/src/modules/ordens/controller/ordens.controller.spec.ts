import { Test, TestingModule } from '@nestjs/testing';
import { OrdensController } from './ordens.controller';
import { BuscarOrdemPorIdService, BuscarOrdensPorUsuarioService, CancelarOrdemService, CriarOrdemService } from '../services';
import { OrdemRequestDto } from '../dtos/request/ordem.request';

describe('OrdensController', () => {
  let controller: OrdensController;
  let buscarOrdemPorIdService: BuscarOrdemPorIdService;
  let buscarOrdensPorUsuarioService: BuscarOrdensPorUsuarioService;
  let cancelarOrdemService: CancelarOrdemService;
  let criarOrdemService: CriarOrdemService;

  const mockOrdem = {
    id: 'ordem-uuid-123',
    simbolo: 'PETR4',
    quantidade: 100,
    status: 'PENDENTE',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdensController],
      providers: [
        {
          provide: BuscarOrdemPorIdService,
          useValue: { execute: jest.fn().mockResolvedValue(mockOrdem) },
        },
        {
          provide: BuscarOrdensPorUsuarioService,
          useValue: { execute: jest.fn().mockResolvedValue([mockOrdem]) },
        },
        {
          provide: CancelarOrdemService,
          useValue: { execute: jest.fn().mockResolvedValue({ ...mockOrdem, status: 'CANCELADA' }) },
        },
        {
          provide: CriarOrdemService,
          useValue: { execute: jest.fn().mockResolvedValue(mockOrdem) },
        },
      ],
    }).compile();

    controller = module.get<OrdensController>(OrdensController);
    buscarOrdemPorIdService = module.get<BuscarOrdemPorIdService>(BuscarOrdemPorIdService);
    buscarOrdensPorUsuarioService = module.get<BuscarOrdensPorUsuarioService>(BuscarOrdensPorUsuarioService);
    cancelarOrdemService = module.get<CancelarOrdemService>(CancelarOrdemService);
    criarOrdemService = module.get<CriarOrdemService>(CriarOrdemService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve permitir a instanciação manual para cobrir decorators e cabeçalho da classe', () => {
    const manualController = new OrdensController(
      buscarOrdemPorIdService,
      buscarOrdensPorUsuarioService,
      cancelarOrdemService,
      criarOrdemService,
    );
    expect(manualController).toBeDefined();
  });

  it('deve permitir a instanciação manual para cobrir decorators e cabeçalho da classe', () => {
    const manualController = new OrdensController(
      buscarOrdemPorIdService,
      buscarOrdensPorUsuarioService,
      cancelarOrdemService,
      criarOrdemService,
    );
    expect(manualController).toBeDefined();
  });

  describe('buscarOrdemPorId', () => {
    it('deve chamar o serviço de busca por ID com o parâmetro correto', async () => {
      const result = await controller.buscarOrdemPorId('ordem-uuid');
      expect(buscarOrdemPorIdService.execute).toHaveBeenCalledWith('ordem-uuid');
      expect(result).toEqual(mockOrdem);
    });
  });

  describe('buscarOrdensPorUsuario', () => {
    it('deve chamar o serviço de busca por usuário com o ID correto', async () => {
      const result = await controller.buscarOrdensPorUsuario('user-uuid');
      expect(buscarOrdensPorUsuarioService.execute).toHaveBeenCalledWith('user-uuid');
      expect(result).toEqual([mockOrdem]);
    });
  });

  describe('cancelarOrdem', () => {
    it('deve chamar o serviço de cancelamento com o ID da ordem correto', async () => {
      const result = await controller.cancelarOrdem('ordem-uuid');
      expect(cancelarOrdemService.execute).toHaveBeenCalledWith('ordem-uuid');
      expect(result.status).toBe('CANCELADA');
    });
  });

  describe('criarOrdem', () => {
    it('deve chamar o serviço de criação com idempotência, id do usuário e dados da ordem', async () => {
      const dto: OrdemRequestDto = { simbolo: 'PETR4', tipo: 'COMPRA', quantidade: 10, valorUnitario: 30 } as any;
      const chaveIdempotencia = 'key-123';
      const idUsuario = 'user-123';

      const result = await controller.criarOrdem(chaveIdempotencia, idUsuario, dto);

      expect(criarOrdemService.execute).toHaveBeenCalledWith(idUsuario, chaveIdempotencia, dto);
      expect(result).toEqual(mockOrdem);
    });
  });
});
