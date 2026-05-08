import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { BuscarCotacaoAtualRepository } from './buscarCotacaoAtual.repository';
import { EnvService } from 'src/config/env.service';
import { ExternalApiValidator } from '../../utils/validations/externalApi.validator';
import { ErrorUtil } from 'src/utils/error';

describe('BuscarCotacaoAtualRepository', () => {
  let repository: BuscarCotacaoAtualRepository;
  let httpService: HttpService;
  let envService: EnvService;

  const mockConfig = { COTACAO_API_URL: 'http://api-teste.com' };

  const mockAtivoApi = {
    symbol: 'PETR4',
    name: 'Petrobras',
    price: 35.5,
    timestamp: '2023-10-27T10:00:00Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuscarCotacaoAtualRepository,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: EnvService,
          useValue: {
            read: jest.fn().mockReturnValue(mockConfig),
          },
        },
      ],
    }).compile();

    repository = module.get<BuscarCotacaoAtualRepository>(BuscarCotacaoAtualRepository);
    httpService = module.get<HttpService>(HttpService);
    envService = module.get<EnvService>(EnvService);

    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  it('deve estar definido', () => {
    expect(repository).toBeDefined();
  });

  it('deve permitir a instanciação manual para cobertura das dependências privadas (Linhas 17-18)', () => {
    const manualRepo = new BuscarCotacaoAtualRepository(httpService, envService);
    expect(manualRepo).toBeDefined();
  });

  describe('execute', () => {
    it('deve retornar a lista de cotações mapeadas com sucesso', async () => {
      const mockResponse = {
        data: { data: [mockAtivoApi] },
      };

      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse) as any);
      jest.spyOn(ExternalApiValidator, 'validateDto').mockResolvedValue(undefined);

      const result = await repository.execute();

      expect(envService.read).toHaveBeenCalled();
      expect(httpService.get).toHaveBeenCalledWith('http://api-teste.com/quotations');
      expect(result).toHaveLength(1);
      expect(result[0].simbolo).toBe('PETR4');
      expect(result[0].preco).toBe(35.5);
    });

    it('deve lançar COTACAO_NAO_ENCONTRADA quando o campo data da API estiver vazio ou inválido', async () => {
      const mockResponse = { data: { data: null } };
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse) as any);

      await expect(repository.execute()).rejects.toThrow(
        new ErrorUtil('COTACAO_NAO_ENCONTRADA', 'Nenhuma cotação foi encontrada na corretora.'),
      );
    });

    it('deve lançar erro se a validação do DTO falhar para algum item da lista', async () => {
      const mockResponse = { data: { data: [mockAtivoApi] } };
      jest.spyOn(httpService, 'get').mockReturnValue(of(mockResponse) as any);

      const validationError = new ErrorUtil('DADOS_INVALIDOS', 'Erro de validação');
      jest.spyOn(ExternalApiValidator, 'validateDto').mockRejectedValue(validationError);

      await expect(repository.execute()).rejects.toThrow(validationError);
    });

    it('deve lançar ERRO_INTERNO e logar a falha em caso de erro de rede ou timeout', async () => {
      const networkError = new Error('Connection refused');
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => networkError));
      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(repository.execute()).rejects.toThrow(
        new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno ao buscar a lista de cotações.'),
      );

      expect(loggerSpy).toHaveBeenCalledWith('Falha ao buscar a lista de cotações.', networkError);
    });

    it('deve repassar o erro caso ele já seja uma instância de ErrorUtil', async () => {
      const customError = new ErrorUtil('ERRO_INTERNO', 'Erro na api externa!');
      jest.spyOn(httpService, 'get').mockReturnValue(throwError(() => customError));

      await expect(repository.execute()).rejects.toThrow(customError);
    });
  });
});
