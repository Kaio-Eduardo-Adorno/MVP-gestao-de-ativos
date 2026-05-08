import { AtualizarQuantidadeAtivoUsuarioRepository } from './atualizarQuantidadeAtivoUsuario/atualizarQuantidadeAtivoUsuario.repository';
import { BuscarAtivosRepository } from './buscarAtivos/buscarAtivos.repository';
import { BuscarAtivosPorUsuarioRepository } from './buscarAtivosPorUsuario/buscarAtivosPorUsuario.repository';
import { BuscarAtivoUsuarioPorSimboloRepository } from './buscarAtivoUsuarioPorSimbolo/buscarAtivoUsuarioPorSimbolo.repository';

export * from './atualizarQuantidadeAtivoUsuario/atualizarQuantidadeAtivoUsuario.repository';
export * from './buscarAtivos/buscarAtivos.repository';
export * from './buscarAtivosPorUsuario/buscarAtivosPorUsuario.repository';
export * from './buscarAtivoUsuarioPorSimbolo/buscarAtivoUsuarioPorSimbolo.repository';
export * from './buscarCotacaoAtual/buscarCotacaoAtual.repository';

export const ATIVOS_REPOSITORIES = [
  AtualizarQuantidadeAtivoUsuarioRepository,
  BuscarAtivosRepository,
  BuscarAtivosPorUsuarioRepository,
  BuscarAtivoUsuarioPorSimboloRepository,
];
