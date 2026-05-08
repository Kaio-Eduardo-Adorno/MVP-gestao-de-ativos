import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { BuscarAtivoPorSimboloRepository } from './buscarAtivosPorSimbolo.repository';
import { AtivosEntity } from '../../entities/ativos.entity';
import { ErrorUtil } from '../../../../utils/error';

describe('BuscarAtivoPorSimboloRepository', () => {
  let repository: BuscarAtivoPorSimboloRepository;
  let ativosRepository: Repository<AtivosEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuscarAtivoPorSimboloRepository,
        {
          provide: getRepositoryToken(AtivosEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<BuscarAtivoPorSimboloRepository>(BuscarAtivoPorSimboloRepository);
    ativosRepository = module.get<Repository<AtivosEntity>>(getRepositoryToken(AtivosEntity));

    // Evita a poluição do console durante a execução dos testes
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  it('deve estar definido', () => {
    expect(repository).toBeDefined();
  });

  describe('execute', () => {
    const simbolo = 'PETR4';

    it('deve retornar o ativo mapeado para DTO quando encontrado no banco', async () => {
      const mockAtivo = {
        id: 'uuid-123',
        simbolo: 'PETR4',
        nome: 'Petrobras',
        cotacao: 35.5,
        horario_cotacao: new Date(),
      } as AtivosEntity;

      jest.spyOn(ativosRepository, 'findOne').mockResolvedValue(mockAtivo);

      const result = await repository.execute(simbolo);

      expect(ativosRepository.findOne).toHaveBeenCalledWith({ where: { simbolo: simbolo } });
      expect(result.simbolo).toBe(simbolo);
      expect(result.id).toBe(mockAtivo.id);
    });

    it('deve lançar erro ATIVO_INDISPONIVEL quando o símbolo não existir', async () => {
      jest.spyOn(ativosRepository, 'findOne').mockResolvedValue(null);

      await expect(repository.execute(simbolo)).rejects.toThrow(
        new ErrorUtil('ATIVO_INDISPONIVEL', `Não foi possível encontrar o ativo com o símbolo ${simbolo}.`),
      );
    });

    it('deve lançar ERRO_INTERNO e logar a falha em caso de erro no banco de dados', async () => {
      const dbError = new Error('Database connection failed');
      jest.spyOn(ativosRepository, 'findOne').mockRejectedValue(dbError);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(repository.execute(simbolo)).rejects.toThrow(
        new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno ao buscar o ativo.'),
      );

      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining(simbolo), dbError);
    });
  });
});
