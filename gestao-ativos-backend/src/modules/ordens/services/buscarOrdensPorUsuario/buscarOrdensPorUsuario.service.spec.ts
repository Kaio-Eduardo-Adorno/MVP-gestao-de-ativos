import { Test, TestingModule } from '@nestjs/testing';
import { BuscarOrdensPorUsuarioService } from './buscarOrdensPorUsuario.service';
import { BuscarAtivosPorUsuarioRepository } from '../../repositories';
import { OrdemResponseDto } from '../../dtos/response/ordem.response';
import { ErrorUtil } from '../../../../utils/error';

describe('BuscarOrdensPorUsuarioService', () => {
  let service: BuscarOrdensPorUsuarioService;
  let buscarAtivosPorUsuarioRepository: BuscarAtivosPorUsuarioRepository;

  // Mock dos dados de resposta (Array de Ordens)
  const mockOrdensResponse: OrdemResponseDto[] = [
    {
      id: 'ordem-1',
      simbolo: 'ITUB4',
      quantidade: 100,
      valorUnitario: 32.8,
      valorTotal: 3280.0,
      tipo: 'COMPRA',
      status: 'EXECUTADA',
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    },
    {
      id: 'ordem-2',
      simbolo: 'USDC',
      quantidade: 50,
      valorUnitario: 5.5,
      valorTotal: 275.0,
      tipo: 'VENDA',
      status: 'PENDENTE',
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    },
  ] as OrdemResponseDto[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuscarOrdensPorUsuarioService,
        {
          provide: BuscarAtivosPorUsuarioRepository,
          useValue: {
            execute: jest.fn().mockResolvedValue(mockOrdensResponse),
          },
        },
      ],
    }).compile();

    service = module.get<BuscarOrdensPorUsuarioService>(BuscarOrdensPorUsuarioService);
    buscarAtivosPorUsuarioRepository = module.get<BuscarAtivosPorUsuarioRepository>(BuscarAtivosPorUsuarioRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    const idUsuario = 'user-uuid-123';

    it('deve chamar o repositório com o ID do usuário e retornar a lista de ordens', async () => {
      const spyBuscar = jest.spyOn(buscarAtivosPorUsuarioRepository, 'execute');

      const result = await service.execute(idUsuario);

      // Verifica se o parâmetro correto foi passado para a camada de dados
      expect(spyBuscar).toHaveBeenCalledWith(idUsuario);
      expect(spyBuscar).toHaveBeenCalledTimes(1);

      // Verifica se o array foi retornado intacto
      expect(result).toEqual(mockOrdensResponse);
      expect(result.length).toBe(2);
      expect(result[0].simbolo).toBe('ITUB4');
    });

    it('deve retornar um array vazio se o usuário não tiver ordens', async () => {
      // Sobrescreve o mock para simular um usuário novo sem histórico
      jest.spyOn(buscarAtivosPorUsuarioRepository, 'execute').mockResolvedValueOnce([]);

      const result = await service.execute('user-novo-456');

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('deve repassar exceções geradas pelo repositório (ex: falha no banco de dados)', async () => {
      jest
        .spyOn(buscarAtivosPorUsuarioRepository, 'execute')
        .mockRejectedValueOnce(new ErrorUtil('ERRO_INTERNO', 'Falha de conexão com o banco de dados'));

      await expect(service.execute(idUsuario)).rejects.toThrow(ErrorUtil);
    });
  });
});
