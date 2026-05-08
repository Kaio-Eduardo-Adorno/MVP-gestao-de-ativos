import { HttpStatus } from '@nestjs/common';

export const ErrorType = {
  USUARIO_NAO_ENCONTRADO: {
    name: 'UsuarioNaoEncontrado',
    statusCode: HttpStatus.NOT_FOUND,
  },

  SENHA_INCORRETA: {
    name: 'SenhaIncorreta',
    statusCode: HttpStatus.UNAUTHORIZED,
  },

  ERRO_INTERNO: {
    name: 'ErroInterno',
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  },

  SALDO_NAO_ENCONTRADO: {
    name: 'SaldoNaoEncontrado',
    statusCode: HttpStatus.NOT_FOUND,
  },

  SALDO_INSUFICIENTE: {
    name: 'SaldoInsuficiente',
    statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  },

  ATIVO_INDISPONIVEL: {
    name: 'AtivoIndisponivel',
    statusCode: HttpStatus.NOT_FOUND,
  },

  ORDEM_NAO_ENCONTRADA: {
    name: 'OrdemNaoEncontrada',
    statusCode: HttpStatus.NOT_FOUND,
  },

  ORDEM_INVALIDA: {
    name: 'OrdemInvalida',
    statusCode: HttpStatus.BAD_REQUEST,
  },

  ORDEM_JA_EXECUTADA: {
    name: 'OrdemJaExecutada',
    statusCode: HttpStatus.BAD_REQUEST,
  },

  ORDEM_JA_CANCELADA: {
    name: 'OrdemJaCancelada',
    statusCode: HttpStatus.BAD_REQUEST,
  },

  ORDEM_NAO_PODE_SER_CANCELADA: {
    name: 'OrdemNaoPodeSerCancelada',
    statusCode: HttpStatus.BAD_REQUEST,
  },

  ORDEM_NAO_PODE_SER_PROCESSADA: {
    name: 'OrdemNaoPodeSerProcessada',
    statusCode: HttpStatus.BAD_REQUEST,
  },

  ORDEM_NAO_PODE_SER_EXECUTADA: {
    name: 'OrdemNaoPodeSerExecutada',
    statusCode: HttpStatus.BAD_REQUEST,
  },

  ORDEM_NAO_PODE_SER_REJEITADA: {
    name: 'OrdemNaoPodeSerRejeitada',
    statusCode: HttpStatus.BAD_REQUEST,
  },

  USUARIO_NAO_POSSUI_ESTE_ATIVO: {
    name: 'UsuarioNaoPossuiEsteAtivo',
    statusCode: HttpStatus.BAD_REQUEST,
  },

  COTACAO_NAO_ENCONTRADA: {
    name: 'CotacaoNaoEncontrada',
    statusCode: HttpStatus.NOT_FOUND,
  },

  DADOS_INVALIDOS: {
    name: 'DadosInvalidos',
    statusCode: HttpStatus.BAD_REQUEST,
  },

  ATIVOS_INSUFICIENTES: {
    name: 'AtivosInsuficientes',
    statusCode: HttpStatus.BAD_REQUEST,
  },

  TOKEN_AUSENTE: {
    name: 'TokenAusente',
    statusCode: HttpStatus.UNAUTHORIZED,
  },

  TOKEN_INVALIDO: {
    name: 'TokenInvalido',
    statusCode: HttpStatus.UNAUTHORIZED,
  },

  EXTERNAL_API_ERROR: {
    name: 'ExternalApiError',
    statusCode: HttpStatus.BAD_GATEWAY,
  },
} as const;

export type ErrorKey = keyof typeof ErrorType;
