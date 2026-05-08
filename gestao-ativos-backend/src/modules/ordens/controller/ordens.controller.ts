import { Body, Controller, Get, Headers, Param, Patch, Post } from '@nestjs/common';
import { BuscarOrdemPorIdService, BuscarOrdensPorUsuarioService, CancelarOrdemService, CriarOrdemService } from '../services';
import { OrdemRequestDto } from '../dtos/request/ordem.request';

@Controller('/ordens')
export class OrdensController {
  constructor(
    private readonly buscarOrdemPorIdService: BuscarOrdemPorIdService,
    private readonly buscarOrdensPorUsuarioService: BuscarOrdensPorUsuarioService,
    private readonly cancelarOrdemService: CancelarOrdemService,
    private readonly criarOrdemService: CriarOrdemService,
  ) {}

  @Get('/:idOrdem')
  buscarOrdemPorId(@Param('idOrdem') idOrdem: string) {
    return this.buscarOrdemPorIdService.execute(idOrdem);
  }

  @Get('/usuario/:idUsuario')
  buscarOrdensPorUsuario(@Param('idUsuario') idUsuario: string) {
    return this.buscarOrdensPorUsuarioService.execute(idUsuario);
  }

  @Patch('/:idOrdem/cancelar')
  cancelarOrdem(@Param('idOrdem') idOrdem: string) {
    return this.cancelarOrdemService.execute(idOrdem);
  }

  @Post('/:idUsuario')
  criarOrdem(
    @Headers('idempotency-key') chaveIdempotencia: string,
    @Param('idUsuario') idUsuario: string,
    @Body() ordem: OrdemRequestDto,
  ) {
    return this.criarOrdemService.execute(idUsuario, chaveIdempotencia, ordem);
  }
}
