import { Test, TestingModule } from '@nestjs/testing';
import { AtivosController } from './ativos.controller';
import { BuscarAtivosService, BuscarAtivosPorUsuarioService } from '../services';

describe('AtivosController', () => {
  let controller: AtivosController;
  let buscarAtivosService: BuscarAtivosService;
  let buscarAtivosPorUsuarioService: BuscarAtivosPorUsuarioService;

  const mockAtivosResponse = [
    { simbolo: 'ITUB4', cotacao: 32.8 },
    { simbolo: 'BTC', cotacao: 350000.0 },
  ];

  const mockAtivosUsuarioResponse = [{ simbolo: 'ITUB4', quantidade: 100 }];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AtivosController],
      providers: [
        {
          provide: BuscarAtivosService,
          useValue: {
            execute: jest.fn().mockResolvedValue(mockAtivosResponse),
          },
        },
        {
          provide: BuscarAtivosPorUsuarioService,
          useValue: {
            execute: jest.fn().mockResolvedValue(mockAtivosUsuarioResponse),
          },
        },
      ],
    }).compile();

    controller = module.get<AtivosController>(AtivosController);
    buscarAtivosService = module.get<BuscarAtivosService>(BuscarAtivosService);
    buscarAtivosPorUsuarioService = module.get<BuscarAtivosPorUsuarioService>(BuscarAtivosPorUsuarioService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('buscarAtivos', () => {
    it('deve chamar o serviço BuscarAtivosService e retornar a lista de ativos do mercado', async () => {
      const spyExecute = jest.spyOn(buscarAtivosService, 'execute');

      const result = await controller.buscarAtivos();

      expect(spyExecute).toHaveBeenCalledTimes(1);

      expect(result).toEqual(mockAtivosResponse);
    });
  });

  describe('buscarAtivosPorUsuario', () => {
    it('deve chamar o serviço BuscarAtivosPorUsuarioService repassando o ID da URL', async () => {
      const idUsuario = 'user-uuid-123';
      const spyExecute = jest.spyOn(buscarAtivosPorUsuarioService, 'execute');

      const result = await controller.buscarAtivosPorUsuario(idUsuario);

      expect(spyExecute).toHaveBeenCalledWith(idUsuario);
      expect(spyExecute).toHaveBeenCalledTimes(1);

      expect(result).toEqual(mockAtivosUsuarioResponse);
    });
  });
});
