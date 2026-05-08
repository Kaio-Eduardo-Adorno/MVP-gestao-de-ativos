import { BuscarSaldoPorUsuarioService } from './buscarSaldoPorUsuario/buscarSaldoPorUsuario.service';
import { AtualizarSaldoService } from './atualizarSaldo/atualizarSaldo.service';

export * from './buscarSaldoPorUsuario/buscarSaldoPorUsuario.service';
export * from './atualizarSaldo/atualizarSaldo.service';

export const SALDOS_SERVICES = [BuscarSaldoPorUsuarioService, AtualizarSaldoService];
