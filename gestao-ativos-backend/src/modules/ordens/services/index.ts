import { BuscarOrdemPorIdService } from './buscarOrdemPorId/buscarOrdemPorId.service';
import { BuscarOrdensPorUsuarioService } from './buscarOrdensPorUsuario/buscarOrdensPorUsuario.service';
import { CancelarOrdemService } from './cancelarOrdem/cancelarOrdem.service';
import { CriarOrdemService } from './criarOrdem/criarOrdem.service';

export * from './buscarOrdemPorId/buscarOrdemPorId.service';
export * from './buscarOrdensPorUsuario/buscarOrdensPorUsuario.service';
export * from './cancelarOrdem/cancelarOrdem.service';
export * from './criarOrdem/criarOrdem.service';

export const ORDENS_SERVICES = [BuscarOrdemPorIdService, BuscarOrdensPorUsuarioService, CancelarOrdemService, CriarOrdemService];
