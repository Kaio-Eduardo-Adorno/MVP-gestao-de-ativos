import { Test, TestingModule } from '@nestjs/testing';
import { SaldosModule } from './saldos.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SaldosEntity } from './entities/saldos.entity';
import { SaldosController } from './controller/saldos.controller';
import { AtualizarSaldoService, BuscarSaldoPorUsuarioService } from './services';

describe('SaldosModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    // Montamos o módulo de teste importando o módulo real
    module = await Test.createTestingModule({
      imports: [SaldosModule],
    })
      // Sobrescrevemos a injeção do TypeORM para evitar conexão com o banco
      .overrideProvider(getRepositoryToken(SaldosEntity))
      .useValue({
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
      })
      .compile();
  });

  it('deve compilar e instanciar o módulo com sucesso', () => {
    expect(module).toBeDefined();
  });

  describe('Injeção de Dependências', () => {
    it('deve resolver o SaldosController', () => {
      const controller = module.get<SaldosController>(SaldosController);
      expect(controller).toBeDefined();
    });

    it('deve resolver os Serviços do módulo', () => {
      const buscarService = module.get<BuscarSaldoPorUsuarioService>(BuscarSaldoPorUsuarioService);
      const atualizarService = module.get<AtualizarSaldoService>(AtualizarSaldoService);

      expect(buscarService).toBeDefined();
      expect(atualizarService).toBeDefined();
    });
  });
});
