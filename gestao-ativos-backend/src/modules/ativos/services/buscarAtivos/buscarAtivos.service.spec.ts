import { Test, TestingModule } from '@nestjs/testing';
import { BuscarAtivosService } from './buscarAtivos.service';
import { BuscarAtivosRepository } from '../../repositories';
import { AtivoResponseDto } from '../../dtos/response/ativo.response';

describe('BuscarAtivosService', () => {
  let service: BuscarAtivosService;
  let repository: BuscarAtivosRepository;

  const mockAtivosResponse: AtivoResponseDto[] = [
    {
      id: 'ativo-uuid-1',
      simbolo: 'PETR4',
      nome: 'Petrobras',
      cotacao: 35.8,
      horarioCotacao: new Date(),
    },
    {
      id: 'ativo-uuid-2',
      simbolo: 'VALE3',
      nome: 'Vale S.A.',
      cotacao: 72.5,
      horarioCotacao: new Date(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuscarAtivosService,
        {
          provide: BuscarAtivosRepository,
          useValue: {
            execute: jest.fn().mockResolvedValue(mockAtivosResponse),
          },
        },
      ],
    }).compile();

    service = module.get<BuscarAtivosService>(BuscarAtivosService);
    repository = module.get<BuscarAtivosRepository>(BuscarAtivosRepository);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('deve chamar o repository.execute e retornar a lista de ativos com sucesso', async () => {
      const result = await service.execute();

      expect(repository.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockAtivosResponse);
    });
  });
});
