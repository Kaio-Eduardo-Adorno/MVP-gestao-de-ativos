import { ArgumentsHost } from '@nestjs/common';
import { ErrorUtil } from 'src/utils/error';
import { AppExceptionFilter } from './exception.filter';
import { Response } from 'express';

describe('AppExceptionFilter', () => {
  let filter: AppExceptionFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    filter = new AppExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: jest.fn(),
      }),
    } as unknown as ArgumentsHost;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(filter).toBeDefined();
  });

  it('deve formatar a resposta corretamente e NÃO logar erros de negócio (statusCode < 500)', () => {
    const loggerSpy = jest.spyOn(filter['logger'], 'error').mockImplementation();

    const mockException = {
      statusCode: 400,
      errorName: 'SaldoInsuficiente',
      message: 'O usuário não possui saldo para esta operação.',
      stack: 'Error: stack trace fictício...',
    } as ErrorUtil;

    filter.catch(mockException, mockArgumentsHost);

    expect(loggerSpy).not.toHaveBeenCalled();

    expect(mockResponse.status).toHaveBeenCalledWith(400);

    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      error: 'SaldoInsuficiente',
      message: 'O usuário não possui saldo para esta operação.',
      timestamp: expect.any(String),
    });
  });

  it('deve formatar a resposta e LOGAR o erro caso seja uma falha de infraestrutura (statusCode >= 500)', () => {
    const loggerSpy = jest.spyOn(filter['logger'], 'error').mockImplementation();

    const mockException = {
      statusCode: 500,
      errorName: 'ErroBancoDados',
      message: 'Conexão recusada na porta 5432.',
      stack: 'Error: timeout at Object.connect...',
    } as ErrorUtil;

    filter.catch(mockException, mockArgumentsHost);

    expect(loggerSpy).toHaveBeenCalledWith(`[ErroBancoDados] Conexão recusada na porta 5432.`, mockException.stack);

    expect(mockResponse.status).toHaveBeenCalledWith(500);

    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 500,
      error: 'ErroBancoDados',
      message: 'Conexão recusada na porta 5432.',
      timestamp: expect.any(String),
    });
  });
});
