import { AtualizarStatusOrdemRepository } from './atualizarStatusOrdem/atualizarStatusOrdem.repository';
import { BuscarOrdemPorIdRepository } from './buscarOrdemPorId/buscarOrdemPorId.repository';
import { BuscarAtivosPorUsuarioRepository } from './buscarOrdensPorUsuario/buscarOrdensPorUsuario.repository';
import { CriarOrdemRepository } from './criarOrdem/criarOrdem.repository';

export * from './atualizarStatusOrdem/atualizarStatusOrdem.repository';
export * from './buscarOrdemPorId/buscarOrdemPorId.repository';
export * from './buscarOrdensPorUsuario/buscarOrdensPorUsuario.repository';
export * from './criarOrdem/criarOrdem.repository';

export const ORDENS_REPOSITORIES = [
  AtualizarStatusOrdemRepository,
  BuscarOrdemPorIdRepository,
  BuscarAtivosPorUsuarioRepository,
  CriarOrdemRepository,
];
