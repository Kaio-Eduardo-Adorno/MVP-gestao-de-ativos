import { Controller, Get, Param } from '@nestjs/common';
import { BuscarSaldoPorUsuarioService } from '../services';

@Controller('/saldos')
export class SaldosController {
  constructor(private readonly buscarSaldoPorUsuarioService: BuscarSaldoPorUsuarioService) {}

  @Get('/usuario/:idUsuario')
  buscarSaldo(@Param('idUsuario') idUsuario: string) {
    return this.buscarSaldoPorUsuarioService.execute(idUsuario);
  }
}
