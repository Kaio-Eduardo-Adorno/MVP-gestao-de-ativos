import { Test, TestingModule } from '@nestjs/testing';
import { BuscarAtivosPorUsuarioService } from './buscarAtivosPorUsuario.service';
import { BuscarAtivosPorUsuarioRepository } from '../../repositories';
import { AtivoUsuarioResponseDto } from '../../dtos/response/ativoUsuario.response';

describe('BuscarAtivosPorUsuarioService', () => {
  let service: BuscarAtivosPorUsuarioService;
  let repository: BuscarAtivosPorUsuarioRepository;

  const mockResponse: AtivoUsuarioResponseDto[] = [
    {
      simbolo: 'ITUB4',
      nome: 'Itaú Unibanco',
      quantidade: 50,
      cotacaoAtual: 33.1,
      horarioCotacao: new Date(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuscarAtivosPorUsuarioService,
        {
          provide: BuscarAtivosPorUsuarioRepository,
          useValue: {
            execute: jest.fn().mockResolvedValue(mockResponse),
          },
        },
      ],
    }).compile();

    service = module.get<BuscarAtivosPorUsuarioService>(BuscarAtivosPorUsuarioService);
    repository = module.get<BuscarAtivosPorUsuarioRepository>(BuscarAtivosPorUsuarioRepository);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    it('deve chamar o repositório com o ID do usuário e retornar a lista de ativos', async () => {
      const idUsuario = 'user-uuid-123';
      const result = await service.execute(idUsuario);

      expect(repository.execute).toHaveBeenCalledWith(idUsuario);
      expect(repository.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });
  });
});