import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AtualizarCotacaoAtivoRepository } from './atualizarCotacaoAtivo.repository';
import { AtivosEntity } from '../../entities/ativos.entity';
import { CotacaoResponseDto } from '../../dtos/response/cotacao.response';
import { ErrorUtil } from '../../../../utils/error';
import { Logger } from '@nestjs/common';

describe('AtualizarCotacaoAtivoRepository', () => {
  let repository: AtualizarCotacaoAtivoRepository;
  let ativosRepository: Repository<AtivosEntity>;

  const mockCotacao: CotacaoResponseDto = {
    id: 'cot-123',
    simbolo: 'PETR4',
    nome: 'Petrobras',
    preco: 35.8,
    dataCotacao: '2023-10-27T10:00:00Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AtualizarCotacaoAtivoRepository,
        {
          provide: getRepositoryToken(AtivosEntity),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<AtualizarCotacaoAtivoRepository>(AtualizarCotacaoAtivoRepository);
    ativosRepository = module.get<Repository<AtivosEntity>>(getRepositoryToken(AtivosEntity));

    // Evita poluição de logs nos testes
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  it('deve estar definido', () => {
    expect(repository).toBeDefined();
  });

  describe('execute', () => {
    it('deve atualizar a cotação e retornar true quando o ativo existe', async () => {
      const mockAtivo = { id: 'uuid-ativo-1', simbolo: 'PETR4' } as AtivosEntity;
      jest.spyOn(ativosRepository, 'findOne').mockResolvedValue(mockAtivo);
      jest.spyOn(ativosRepository, 'update').mockResolvedValue(undefined as any);

      const result = await repository.execute(mockCotacao);

      expect(ativosRepository.findOne).toHaveBeenCalledWith({ where: { simbolo: 'PETR4' } });
      expect(result).toBe(true);
      expect(ativosRepository.update).toHaveBeenCalledWith('uuid-ativo-1', {
        cotacao: 35.8,
        horario_cotacao: new Date('2023-10-27T10:00:00Z'),
      });
    });

    it('deve lançar ATIVO_INDISPONIVEL se o símbolo não for encontrado', async () => {
      jest.spyOn(ativosRepository, 'findOne').mockResolvedValue(null);

      await expect(repository.execute(mockCotacao)).rejects.toThrow(
        new ErrorUtil('ATIVO_INDISPONIVEL', 'Não foi possível encontrar o ativo com o símbolo PETR4.'),
      );
    });

    it('deve lançar ERRO_INTERNO e logar o erro se houver falha no banco de dados', async () => {
      const dbError = new Error('Connection timeout');
      jest.spyOn(ativosRepository, 'findOne').mockRejectedValue(dbError);
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(repository.execute(mockCotacao)).rejects.toThrow(
        new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno ao atualizar a cotação do ativo.'),
      );

      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('PETR4'), dbError);
    });
  });
});
