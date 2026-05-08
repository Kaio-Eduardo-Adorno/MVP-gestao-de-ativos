import { Test, TestingModule } from '@nestjs/testing';
import { CriarOrdemService } from './criarOrdem.service';
import { CriarOrdemRepository } from '../../repositories';
import { BuscarAtivoPorSimboloRepository } from '../../../ativos/repositories/buscarAtivoPorSimbolo/buscarAtivosPorSimbolo.repository';
import { OrdemRequestDto } from '../../dtos/request/ordem.request';
import { ErrorUtil } from '../../../../utils/error';
import { OrdemTipoEnum } from '../../enums/ordemTipo.enum';
import { BuscarSaldoPorUsuarioRepository } from 'src/modules/saldos/repositories';
import { BuscarAtivoUsuarioPorSimboloRepository } from 'src/modules/ativos/repositories';
import { AtivoResponseDto } from 'src/modules/ativos/dtos/response/ativo.response';

describe('CriarOrdemService', () => {
  let service: CriarOrdemService;
  let criarOrdemRepository: CriarOrdemRepository;
  let buscarAtivoPorSimboloRepository: BuscarAtivoPorSimboloRepository;
  let buscarSaldoPorUsuarioRepository: BuscarSaldoPorUsuarioRepository;
  let buscarAtivoUsuarioPorSimboloRepository: BuscarAtivoUsuarioPorSimboloRepository;

  // Mocks de dados
  const mockOrdemRequest: OrdemRequestDto = {
    simbolo: 'ITUB4',
    quantidade: 100,
    tipo: OrdemTipoEnum.COMPRA, // Default para os testes
  };

  const mockAtivo = {
    id: 'ativo-uuid',
    simbolo: 'ITUB4',
    cotacao: 32.8,
  } as AtivoResponseDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CriarOrdemService,
        {
          provide: CriarOrdemRepository,
          useValue: {
            execute: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: BuscarAtivoPorSimboloRepository,
          useValue: {
            execute: jest.fn().mockResolvedValue(mockAtivo),
          },
        },
        {
          provide: BuscarSaldoPorUsuarioRepository,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: BuscarAtivoUsuarioPorSimboloRepository,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CriarOrdemService>(CriarOrdemService);
    criarOrdemRepository = module.get<CriarOrdemRepository>(CriarOrdemRepository);
    buscarAtivoPorSimboloRepository = module.get<BuscarAtivoPorSimboloRepository>(BuscarAtivoPorSimboloRepository);
    buscarSaldoPorUsuarioRepository = module.get<BuscarSaldoPorUsuarioRepository>(BuscarSaldoPorUsuarioRepository);
    buscarAtivoUsuarioPorSimboloRepository = module.get<BuscarAtivoUsuarioPorSimboloRepository>(
      BuscarAtivoUsuarioPorSimboloRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    const idUsuario = 'user-uuid';
    const chaveIdempotencia = 'chave-unica-123';

    it('deve criar uma ordem de COMPRA com sucesso quando o saldo for suficiente', async () => {
      // Arrange: Simula que o usuário tem saldo de 5000, e a ordem custa 3280 (100 * 32.8)
      jest.spyOn(buscarSaldoPorUsuarioRepository, 'execute').mockResolvedValue({ saldo: 5000 });

      // Act
      const spyBuscarAtivo = jest.spyOn(buscarAtivoPorSimboloRepository, 'execute');
      const spyCriarOrdem = jest.spyOn(criarOrdemRepository, 'execute');

      const result = await service.execute(idUsuario, chaveIdempotencia, mockOrdemRequest);

      // 1. Verifica se buscou o ativo usando o símbolo contido na requisição
      expect(spyBuscarAtivo).toHaveBeenCalledWith(mockOrdemRequest.simbolo);

      // 2. Verifica se o saldo foi consultado
      expect(buscarSaldoPorUsuarioRepository.execute).toHaveBeenCalledWith(idUsuario);

      // 3. Verifica se repassou todos os parâmetros corretos para o repositório de criação, incluindo o ativo encontrado
      expect(spyCriarOrdem).toHaveBeenCalledWith(idUsuario, chaveIdempotencia, mockOrdemRequest, mockAtivo);

      // 4. Verifica se a resposta booleana foi retornada
      expect(result).toBe(true);
    });

    it('deve criar uma ordem de VENDA com sucesso quando o usuário possuir ativos suficientes', async () => {
      // Arrange: Simula que o usuário tem 150 ações e quer vender 100
      const ordemVenda = { ...mockOrdemRequest, tipo: OrdemTipoEnum.VENDA };
      jest.spyOn(buscarAtivoUsuarioPorSimboloRepository, 'execute').mockResolvedValue({ quantidade: 150 } as any);

      // Act
      const result = await service.execute(idUsuario, chaveIdempotencia, ordemVenda);

      // Assert
      expect(buscarAtivoUsuarioPorSimboloRepository.execute).toHaveBeenCalledWith(idUsuario, ordemVenda.simbolo);
      expect(criarOrdemRepository.execute).toHaveBeenCalledWith(idUsuario, chaveIdempotencia, ordemVenda, mockAtivo);
      expect(result).toBe(true);
    });

    it('deve lançar SALDO_INSUFICIENTE para uma ordem de COMPRA sem saldo', async () => {
      // Arrange: Ordem custa 3280, mas usuário só tem 1000 de saldo
      jest.spyOn(buscarSaldoPorUsuarioRepository, 'execute').mockResolvedValue({ saldo: 1000 });

      // Act & Assert
      await expect(service.execute(idUsuario, chaveIdempotencia, mockOrdemRequest)).rejects.toThrow(
        new ErrorUtil('SALDO_INSUFICIENTE', 'Saldo insuficiente para efetuar a compra.'),
      );
      expect(criarOrdemRepository.execute).not.toHaveBeenCalled();
    });

    it('deve lançar ATIVOS_INSUFICIENTES para uma ordem de VENDA sem ativos na carteira', async () => {
      // Arrange: Usuário quer vender 100, mas só tem 50
      const ordemVenda = { ...mockOrdemRequest, tipo: OrdemTipoEnum.VENDA };
      jest.spyOn(buscarAtivoUsuarioPorSimboloRepository, 'execute').mockResolvedValue({ quantidade: 50 } as any);

      // Act & Assert
      await expect(service.execute(idUsuario, chaveIdempotencia, ordemVenda)).rejects.toThrow(
        new ErrorUtil('ATIVOS_INSUFICIENTES', 'Ativos insuficientes para efetuar a venda.'),
      );
      expect(criarOrdemRepository.execute).not.toHaveBeenCalled();
    });

    it('deve interromper o fluxo e repassar o erro se o ativo não for encontrado', async () => {
      // Simulamos a falha na busca do ativo
      jest
        .spyOn(buscarAtivoPorSimboloRepository, 'execute')
        .mockRejectedValueOnce(new ErrorUtil('ATIVO_INDISPONIVEL', 'Ativo não existe'));

      const spyCriarOrdem = jest.spyOn(criarOrdemRepository, 'execute');

      await expect(service.execute(idUsuario, chaveIdempotencia, mockOrdemRequest)).rejects.toThrow(ErrorUtil);

      // Garante que o repositório de criação NUNCA seja chamado se o ativo for inválido
      expect(spyCriarOrdem).not.toHaveBeenCalled();
    });

    it('deve repassar o erro se a criação da ordem falhar (ex: chave de idempotência duplicada)', async () => {
      // Garantimos que a validação de saldo seja aprovada antes de chegar no repositório de criação
      jest.spyOn(buscarSaldoPorUsuarioRepository, 'execute').mockResolvedValue({ saldo: 5000 });

      // Simulamos uma falha na hora de salvar no banco
      jest
        .spyOn(criarOrdemRepository, 'execute')
        .mockRejectedValueOnce(new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno!'));

      await expect(service.execute(idUsuario, chaveIdempotencia, mockOrdemRequest)).rejects.toThrow(ErrorUtil);
    });
  });
});
