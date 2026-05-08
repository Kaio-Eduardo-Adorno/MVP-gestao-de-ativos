import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdensEntity } from '../../entities/ordens.entity';
import { OrdemResponseDto } from '../../dtos/response/ordem.response';
import { OrdemMapper } from '../../mappers/ordem.mapper';
import { ErrorUtil } from '../../../../utils/error';
import { BuscarAtivosPorUsuarioRepository } from './buscarOrdensPorUsuario.repository';

describe('BuscarAtivosPorUsuarioRepository', () => {
  let repository: BuscarAtivosPorUsuarioRepository;
  let typeOrmRepository: Repository<OrdensEntity>;

  const mockIdUsuario = 'user-uuid-123';

  // Mock de uma entidade retornada pelo banco
  const mockOrdensEntityList = [
    {
      id: 'ordem-1',
      id_usuario: mockIdUsuario,
      simbolo: 'ITUB4',
      ativo: { id: 'ativo-1', simbolo: 'ITUB4', nome: 'Itau', cotacao: 32.8, horario_cotacao: new Date() },
      criado_em: new Date(),
    },
  ] as unknown as OrdensEntity[];

  // Mock do DTO retornado pelo Mapper
  const mockResponseDtoList = [
    {
      id: 'ordem-1',
      simbolo: 'ITUB4',
      status: 'EXECUTADA',
    } as OrdemResponseDto,
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuscarAtivosPorUsuarioRepository,
        {
          provide: getRepositoryToken(OrdensEntity),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<BuscarAtivosPorUsuarioRepository>(BuscarAtivosPorUsuarioRepository);
    typeOrmRepository = module.get<Repository<OrdensEntity>>(getRepositoryToken(OrdensEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(repository).toBeDefined();
  });

  it('deve permitir a instanciação manual para cobertura total do cabeçalho (Linha 15)', () => {
    const manualRepo = new BuscarAtivosPorUsuarioRepository(typeOrmRepository);
    expect(manualRepo).toBeDefined();
  });

  describe('execute', () => {
    it('deve buscar as ordens com as relações corretas e mapear para DTO', async () => {
      // Intercepta a chamada ao banco
      jest.spyOn(typeOrmRepository, 'find').mockResolvedValueOnce(mockOrdensEntityList);

      // Intercepta a chamada ao método estático do Mapper
      const mapperSpy = jest.spyOn(OrdemMapper, 'entityListToResponseDtoList').mockReturnValueOnce(mockResponseDtoList);

      const result = await repository.execute(mockIdUsuario);

      // Verifica se a query do TypeORM foi montada corretamente
      expect(typeOrmRepository.find).toHaveBeenCalledWith({
        where: { id_usuario: mockIdUsuario },
        relations: ['ativo'],
        order: { criado_em: 'DESC' },
      });
      expect(typeOrmRepository.find).toHaveBeenCalledTimes(1);

      // Verifica se o mapper foi chamado com os dados do banco
      expect(mapperSpy).toHaveBeenCalledWith(mockOrdensEntityList);

      // Verifica o retorno final
      expect(result).toEqual(mockResponseDtoList);
    });

    it('deve repassar um ErrorUtil caso ele seja lançado dentro do try', async () => {
      const erroExistente = new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno!');

      jest.spyOn(typeOrmRepository, 'find').mockResolvedValueOnce(mockOrdensEntityList);
      jest.spyOn(OrdemMapper, 'entityListToResponseDtoList').mockImplementationOnce(() => {
        throw erroExistente;
      });

      await expect(repository.execute(mockIdUsuario)).rejects.toThrow(erroExistente);
    });

    it('deve capturar erros genéricos do banco, logar e lançar um ErrorUtil padronizado', async () => {
      const erroGenerico = new Error('Database timeout');
      jest.spyOn(typeOrmRepository, 'find').mockRejectedValueOnce(erroGenerico);

      // Espiona o Logger privado para garantir que o log de erro foi gerado
      const loggerSpy = jest.spyOn(repository['logger'], 'error').mockImplementation();

      await expect(repository.execute(mockIdUsuario)).rejects.toThrow(ErrorUtil);
      await expect(repository.execute(mockIdUsuario)).rejects.toMatchObject({
        errorName: 'ErroInterno',
        message: 'Ocorreu um erro interno ao buscar as ordens do usuário.',
      });

      expect(loggerSpy).toHaveBeenCalledWith(`Erro ao buscar ordens do usuário ${mockIdUsuario}.`, erroGenerico);
    });
  });
});
