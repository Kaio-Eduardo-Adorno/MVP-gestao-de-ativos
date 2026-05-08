import { Test, TestingModule } from '@nestjs/testing';
import { BuscarOrdemPorIdService } from './buscarOrdemPorId.service';
import { BuscarOrdemPorIdRepository } from '../../repositories';
import { OrdemResponseDto } from '../../dtos/response/ordem.response';
import { ErrorUtil } from '../../../../utils/error';

describe('BuscarOrdemPorIdService', () => {
  let service: BuscarOrdemPorIdService;
  let buscarOrdemPorIdRepository: BuscarOrdemPorIdRepository;

  // Mock de uma ordem válida
  const mockOrdemResponse: OrdemResponseDto = {
    id: 'ordem-uuid-123',
    simbolo: 'ITUB4',
    quantidade: 100,
    valorTotal: 3280.0,
    tipo: 'COMPRA',
    status: 'PENDENTE',
    criadoEm: new Date(),
  } as OrdemResponseDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuscarOrdemPorIdService,
        {
          provide: BuscarOrdemPorIdRepository,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BuscarOrdemPorIdService>(BuscarOrdemPorIdService);
    buscarOrdemPorIdRepository = module.get<BuscarOrdemPorIdRepository>(BuscarOrdemPorIdRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    const idOrdem = 'ordem-uuid-123';

    it('deve retornar os dados da ordem quando ela for encontrada', async () => {
      // Configuramos o mock para retornar sucesso
      jest.spyOn(buscarOrdemPorIdRepository, 'execute').mockResolvedValueOnce(mockOrdemResponse);

      const result = await service.execute(idOrdem);

      // Verificamos se o repositório foi chamado com o parâmetro correto
      expect(buscarOrdemPorIdRepository.execute).toHaveBeenCalledWith(idOrdem);
      expect(buscarOrdemPorIdRepository.execute).toHaveBeenCalledTimes(1);

      // Verificamos o retorno
      expect(result).toEqual(mockOrdemResponse);
      expect(result?.id).toBe(idOrdem);
    });

    it('deve retornar null quando a ordem não existir', async () => {
      // Configuramos o mock para simular que o banco não encontrou nada
      jest.spyOn(buscarOrdemPorIdRepository, 'execute').mockResolvedValueOnce(null);

      const result = await service.execute('id-inexistente');

      expect(buscarOrdemPorIdRepository.execute).toHaveBeenCalledWith('id-inexistente');
      expect(result).toBeNull();
    });

    it('deve repassar o erro caso o repositório falhe', async () => {
      // Simulamos uma queda no banco de dados ou erro de infraestrutura
      jest
        .spyOn(buscarOrdemPorIdRepository, 'execute')
        .mockRejectedValueOnce(new ErrorUtil('ERRO_INTERNO', 'Falha na conexão com o banco de dados'));

      // O serviço não deve tentar tratar o erro e sim deixar subir para o controller/filtro
      await expect(service.execute(idOrdem)).rejects.toThrow(ErrorUtil);
    });
  });
});
