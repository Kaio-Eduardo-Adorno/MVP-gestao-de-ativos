import { Test, TestingModule } from '@nestjs/testing';
import { SaldosController } from './saldos.controller';
import { BuscarSaldoPorUsuarioService, AtualizarSaldoService } from '../services';
import { SaldoResponseDto } from '../dtos/response/saldo.response';

describe('SaldosController', () => {
  let controller: SaldosController;
  let buscarService: BuscarSaldoPorUsuarioService;

  const mockSaldoResponse: SaldoResponseDto = {
    saldo: 1000.5,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SaldosController],
      providers: [
        {
          provide: BuscarSaldoPorUsuarioService,
          useValue: {
            execute: jest.fn().mockResolvedValue(mockSaldoResponse),
          },
        },
        {
          provide: AtualizarSaldoService,
          useValue: {
            execute: jest.fn().mockResolvedValue({ ...mockSaldoResponse, saldo: 1500.0 }),
          },
        },
      ],
    }).compile();

    controller = module.get<SaldosController>(SaldosController);
    buscarService = module.get<BuscarSaldoPorUsuarioService>(BuscarSaldoPorUsuarioService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('buscarSaldo', () => {
    it('deve chamar o serviço de busca com o idUsuario correto', async () => {
      const idUsuario = 'user-123';
      const spy = jest.spyOn(buscarService, 'execute');

      const result = await controller.buscarSaldo(idUsuario);

      expect(spy).toHaveBeenCalledWith(idUsuario);
      expect(result).toEqual(mockSaldoResponse);
    });
  });
});
