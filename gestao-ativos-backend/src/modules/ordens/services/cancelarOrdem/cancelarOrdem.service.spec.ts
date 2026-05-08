import { Test, TestingModule } from '@nestjs/testing';
import { CancelarOrdemService } from './cancelarOrdem.service';
import { AtualizarStatusOrdemRepository } from '../../repositories';
import { OrdemStatusEnum } from '../../enums/ordemStatus.enum';
import { ErrorUtil } from '../../../../utils/error';

describe('CancelarOrdemService', () => {
  let service: CancelarOrdemService;
  let atualizarStatusOrdemRepository: AtualizarStatusOrdemRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelarOrdemService,
        {
          provide: AtualizarStatusOrdemRepository,
          useValue: {
            execute: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<CancelarOrdemService>(CancelarOrdemService);
    atualizarStatusOrdemRepository = module.get<AtualizarStatusOrdemRepository>(AtualizarStatusOrdemRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    const idOrdem = 'ordem-uuid-123';

    it('deve chamar o repositório passando o ID e o status fixo CANCELADA', async () => {
      const spyAtualizarStatus = jest.spyOn(atualizarStatusOrdemRepository, 'execute');

      const result = await service.execute(idOrdem);

      // Garante que o serviço injetou o ENUM correto na chamada
      expect(spyAtualizarStatus).toHaveBeenCalledWith(idOrdem, OrdemStatusEnum.CANCELADA);
      expect(spyAtualizarStatus).toHaveBeenCalledTimes(1);

      // Verifica o retorno de sucesso
      expect(result).toBe(true);
    });

    it('deve repassar exceções geradas pelo repositório (ex: Ordem não encontrada)', async () => {
      // Simula uma falha na camada de banco de dados
      jest
        .spyOn(atualizarStatusOrdemRepository, 'execute')
        .mockRejectedValueOnce(new ErrorUtil('ORDEM_NAO_ENCONTRADA', 'A ordem não existe ou não pode ser cancelada'));

      // O serviço não deve mascarar o erro, deve repassá-lo para cima
      await expect(service.execute(idOrdem)).rejects.toThrow(ErrorUtil);
    });
  });
});
