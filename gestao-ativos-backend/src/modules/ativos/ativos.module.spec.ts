import { Test, TestingModule } from '@nestjs/testing';
import { AtivosModule } from './ativos.module';
import { AtivosController } from './controller/ativos.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AtivosEntity } from './entities/ativos.entity';
import { AtivosUsuariosEntity } from './entities/ativosUsuarios.entity';

describe('AtivosModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AtivosModule],
    })
      .overrideProvider(getRepositoryToken(AtivosEntity))
      .useValue({})
      .overrideProvider(getRepositoryToken(AtivosUsuariosEntity))
      .useValue({})
      .compile();
  });

  it('deve estar definido (módulo compilado com sucesso)', () => {
    expect(module).toBeDefined();
  });

  it('deve carregar o AtivosController corretamente', () => {
    const controller = module.get<AtivosController>(AtivosController);
    expect(controller).toBeDefined();
  });

  it('deve garantir que os serviços e repositórios estejam registrados nos metadados', () => {
    const providers = Reflect.getMetadata('providers', AtivosModule);
    expect(providers).toBeDefined();
    expect(providers.length).toBeGreaterThan(0);
  });
});
