import { BuscarSaldoPorUsuarioRepository } from './buscarSaldoPorUsuario/buscarSaldoPorUsuario.repository';
import { AtualizarSaldoRepository } from './atualizarSaldo/atualizarSaldo.repository';

export * from './buscarSaldoPorUsuario/buscarSaldoPorUsuario.repository';
export * from './atualizarSaldo/atualizarSaldo.repository';

export const SALDOS_REPOSITORIES = [BuscarSaldoPorUsuarioRepository, AtualizarSaldoRepository];
