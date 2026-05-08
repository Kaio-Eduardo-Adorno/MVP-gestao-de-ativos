import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { BuscarAtivosRepository } from './buscarAtivos.repository';
import { AtivosEntity } from '../../entities/ativos.entity';
import { ErrorUtil } from 'src/utils/error';

describe('BuscarAtivosRepository', () => {
  let repository: BuscarAtivosRepository;
  let ativosRepository: Repository<AtivosEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuscarAtivosRepository,
        {
          provide: getRepositoryToken(AtivosEntity),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<BuscarAtivosRepository>(BuscarAtivosRepository);
    ativosRepository = module.get<Repository<AtivosEntity>>(getRepositoryToken(AtivosEntity));

    // Mock do logger para manter o console limpo durante os testes
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(repository).toBeDefined();
  });

  it('deve permitir a instanciação manual do repositório', () => {
    const manualRepo = new BuscarAtivosRepository(ativosRepository);
    expect(manualRepo).toBeDefined();
  });

  describe('execute', () => {
    it('deve retornar uma lista de ativos mapeados para DTO quando existirem registros', async () => {
      const mockAtivos = [
        { id: '1', simbolo: 'PETR4', nome: 'Petrobras', cotacao: 30.0, horario_cotacao: new Date() },
        { id: '2', simbolo: 'VALE3', nome: 'Vale', cotacao: 70.0, horario_cotacao: new Date() },
      ] as AtivosEntity[];

      jest.spyOn(ativosRepository, 'find').mockResolvedValue(mockAtivos);

      const result = await repository.execute();

      // Garante que o TypeORM foi chamado com o parâmetro de ordenação esperado
      expect(ativosRepository.find).toHaveBeenCalledWith({ order: { simbolo: 'ASC' } });
      expect(result).toHaveLength(2);
      expect(result[0].simbolo).toBe('PETR4');
      expect(result[1].simbolo).toBe('VALE3');
    });

    it('deve retornar um array vazio se a busca retornar falsy (null)', async () => {
      jest.spyOn(ativosRepository, 'find').mockResolvedValue(null as any);

      const result = await repository.execute();

      expect(result).toEqual([]);
    });

    it('deve repassar a exceção caso ela já seja uma instância verdadeira do ErrorUtil', async () => {
      // Usamos uma chave válida do seu ErrorType (SCREAMING_SNAKE_CASE)
      const errorUtil = new ErrorUtil('DADOS_INVALIDOS', 'Erro customizado de validação');
      jest.spyOn(ativosRepository, 'find').mockRejectedValue(errorUtil);

      await expect(repository.execute()).rejects.toThrow(errorUtil);
    });

    it('deve lançar ERRO_INTERNO e logar o erro em caso de falha inesperada (ex: banco de dados)', async () => {
      const dbError = new Error('Query timeout');
      jest.spyOn(ativosRepository, 'find').mockRejectedValue(dbError);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(repository.execute()).rejects.toThrow(ErrorUtil);
      await expect(repository.execute()).rejects.toMatchObject({
        // Valida que a classe converteu a chave ERRO_INTERNO para a propriedade PascalCase
        errorName: 'ErroInterno',
        message: 'Ocorreu um erro interno ao buscar ativos.',
      });

      expect(loggerSpy).toHaveBeenCalledWith('Erro inesperado ao buscar ativos', dbError);
    });
  });
});
