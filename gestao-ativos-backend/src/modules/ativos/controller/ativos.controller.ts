import { Controller, Get, Param } from '@nestjs/common';
import { BuscarAtivosService, BuscarAtivosPorUsuarioService } from '../services';

@Controller('/ativos')
export class AtivosController {
  constructor(
    private readonly buscarAtivosService: BuscarAtivosService,
    private readonly buscarAtivosPorUsuarioService: BuscarAtivosPorUsuarioService,
  ) {}

  @Get()
  buscarAtivos() {
    return this.buscarAtivosService.execute();
  }

  @Get('/usuario/:id')
  buscarAtivosPorUsuario(@Param('id') id: string) {
    return this.buscarAtivosPorUsuarioService.execute(id);
  }
}
