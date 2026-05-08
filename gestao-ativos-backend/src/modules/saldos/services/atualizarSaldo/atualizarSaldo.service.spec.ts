import { Test, TestingModule } from '@nestjs/testing';
import { AtualizarSaldoService } from '../../services';
import { AtualizarSaldoRepository, BuscarSaldoPorUsuarioRepository } from '../../repositories';
import { SaldoResponseDto } from '../../dtos/response/saldo.response';
import { ErrorUtil } from '../../../../utils/error';

describe('AtualizarSaldoService', () => {
  let service: AtualizarSaldoService;
  let atualizarSaldoRepository: AtualizarSaldoRepository;
  let buscarSaldoPorUsuarioRepository: BuscarSaldoPorUsuarioRepository;

  const mockSaldoResponse: SaldoResponseDto = {
    saldo: 200.0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AtualizarSaldoService,
        {
          provide: AtualizarSaldoRepository,
          useValue: {
            execute: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: BuscarSaldoPorUsuarioRepository,
          useValue: {
            execute: jest.fn().mockResolvedValue(mockSaldoResponse),
          },
        },
      ],
    }).compile();

    service = module.get<AtualizarSaldoService>(AtualizarSaldoService);
    atualizarSaldoRepository = module.get<AtualizarSaldoRepository>(AtualizarSaldoRepository);
    buscarSaldoPorUsuarioRepository = module.get<BuscarSaldoPorUsuarioRepository>(BuscarSaldoPorUsuarioRepository);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve permitir a instanciação manual via construtor para garantir cobertura total', () => {
    const manualService = new AtualizarSaldoService(atualizarSaldoRepository, buscarSaldoPorUsuarioRepository);
    expect(manualService).toBeInstanceOf(AtualizarSaldoService);
  });

  describe('execute', () => {
    const idUsuario = 'user-uuid';
    const valor = 50.0;

    it('deve orquestrar as chamadas de repositório na ordem correta', async () => {
      const spyUpdate = jest.spyOn(atualizarSaldoRepository, 'execute');
      const spyFind = jest.spyOn(buscarSaldoPorUsuarioRepository, 'execute');

      const result = await service.execute(idUsuario, valor);

      // Verifica se o update foi chamado com os parâmetros corretos
      expect(spyUpdate).toHaveBeenCalledWith(idUsuario, valor);

      // Verifica se a busca foi feita logo após
      expect(spyFind).toHaveBeenCalledWith(idUsuario);

      // Verifica o retorno final
      expect(result).toEqual(mockSaldoResponse);
    });

    it('deve falhar se o repositório de atualização falhar', async () => {
      jest
        .spyOn(atualizarSaldoRepository, 'execute')
        .mockRejectedValueOnce(new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno inesperado.'));

      await expect(service.execute(idUsuario, valor)).rejects.toThrow(ErrorUtil);

      // Garante que se o primeiro falhar, o segundo (busca) nem é chamado
      expect(jest.spyOn(buscarSaldoPorUsuarioRepository, 'execute')).not.toHaveBeenCalled();
    });

    it('deve falhar se a busca do saldo após atualização falhar', async () => {
      jest
        .spyOn(buscarSaldoPorUsuarioRepository, 'execute')
        .mockRejectedValueOnce(new ErrorUtil('SALDO_NAO_ENCONTRADO', 'Erro na busca'));

      await expect(service.execute(idUsuario, valor)).rejects.toThrow(ErrorUtil);
    });
  });
});
