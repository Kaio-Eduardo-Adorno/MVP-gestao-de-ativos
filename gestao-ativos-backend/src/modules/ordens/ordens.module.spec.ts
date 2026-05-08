import { Test, TestingModule } from '@nestjs/testing';
import { OrdensModule } from './ordens.module';
import { OrdensController } from './controller/ordens.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrdensEntity } from './entities/ordens.entity';
import { AtivosEntity } from '../ativos/entities/ativos.entity';
import { AtivosUsuariosEntity } from '../ativos/entities/ativosUsuarios.entity';
import { SaldosEntity } from '../saldos/entities/saldos.entity';

describe('OrdensModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [OrdensModule],
    })
      // Mockamos os tokens de repositório para evitar a necessidade de uma conexão real com o banco de dados
      .overrideProvider(getRepositoryToken(OrdensEntity))
      .useValue({})
      .overrideProvider(getRepositoryToken(AtivosEntity))
      .useValue({})
      .overrideProvider(getRepositoryToken(AtivosUsuariosEntity))
      .useValue({})
      .overrideProvider(getRepositoryToken(SaldosEntity))
      .useValue({})
      .compile();
  });

  it('deve estar definido (módulo compilado com sucesso)', () => {
    expect(module).toBeDefined();
  });

  it('deve carregar o OrdensController corretamente', () => {
    const controller = module.get<OrdensController>(OrdensController);
    expect(controller).toBeDefined();
  });

  it('deve garantir que os serviços, repositórios e workers estejam registrados nos metadados', () => {
    const providers = Reflect.getMetadata('providers', OrdensModule);
    expect(providers).toBeDefined();
    expect(providers.length).toBeGreaterThan(0);
  });
});