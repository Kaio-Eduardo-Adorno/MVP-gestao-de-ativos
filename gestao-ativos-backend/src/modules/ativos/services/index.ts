import { BuscarAtivosService } from './buscarAtivos/buscarAtivos.service';
import { BuscarAtivosPorUsuarioService } from './buscarAtivosPorUsuario/buscarAtivosPorUsuario.service';

export * from './buscarAtivos/buscarAtivos.service';
export * from './buscarAtivosPorUsuario/buscarAtivosPorUsuario.service';

export const ATIVOS_SERVICES = [BuscarAtivosService, BuscarAtivosPorUsuarioService];
