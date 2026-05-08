import { Test, TestingModule } from '@nestjs/testing';
import { BuscarSaldoPorUsuarioRepository } from '../../repositories';
import { SaldoResponseDto } from '../../dtos/response/saldo.response';
import { ErrorUtil } from '../../../../utils/error';
import { BuscarSaldoPorUsuarioService } from './buscarSaldoPorUsuario.service';

describe('BuscarSaldoPorUsuarioService', () => {
  let service: BuscarSaldoPorUsuarioService;
  let repository: BuscarSaldoPorUsuarioRepository;

  // Mock dos dados de resposta
  const mockSaldoResponse: SaldoResponseDto = {
    saldo: 1500.5,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuscarSaldoPorUsuarioService,
        {
          provide: BuscarSaldoPorUsuarioRepository,
          useValue: {
            execute: jest.fn().mockResolvedValue(mockSaldoResponse),
          },
        },
      ],
    }).compile();

    service = module.get<BuscarSaldoPorUsuarioService>(BuscarSaldoPorUsuarioService);
    repository = module.get<BuscarSaldoPorUsuarioRepository>(BuscarSaldoPorUsuarioRepository);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('deve chamar o repositório com o ID do usuário correto', async () => {
      const idUsuario = '77b092d5-d2f2-4536-9587-67e4a38b874a';
      const spy = jest.spyOn(repository, 'execute');

      await service.execute(idUsuario);

      expect(spy).toHaveBeenCalledWith(idUsuario);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('deve retornar o saldo corretamente quando o repositório tiver sucesso', async () => {
      const result = await service.execute('77b092d5-d2f2-4536-9587-67e4a38b874a');

      expect(result).toEqual(mockSaldoResponse);
      expect(result.saldo).toBe(1500.5);
    });

    it('deve repassar a exceção caso o repositório falhe', async () => {
      // Configura o mock para falhar nesta execução específica
      jest.spyOn(repository, 'execute').mockRejectedValueOnce(new ErrorUtil('ERRO_INTERNO', 'Falha no banco de dados'));

      await expect(service.execute('77b092d5-d2f2-4536-9587-67e4a38b874a')).rejects.toThrow(ErrorUtil);
    });
  });
});
