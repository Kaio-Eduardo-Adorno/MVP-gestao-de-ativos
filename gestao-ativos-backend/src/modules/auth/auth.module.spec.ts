import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { AuthController } from './controller/auth.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersEntity } from './entities/user.entity';
import { EnvService } from '../../config/env.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { EnvModule } from '../../config/env.module';

describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AuthModule, EnvModule],
      providers: [
        {
          provide: EnvService,
          useValue: { read: jest.fn().mockReturnValue({ JWT_SECRET: 'test-secret' }) },
        },
      ],
    })
      .overrideProvider(getRepositoryToken(UsersEntity))
      .useValue({})
      .compile();
  });

  it('deve estar definido (módulo compilado com sucesso)', () => {
    expect(module).toBeDefined();
  });

  it('deve permitir a instanciação manual da classe do módulo', () => {
    const authModule = new AuthModule();
    expect(authModule).toBeDefined();
  });

  it('deve carregar o AuthController corretamente', () => {
    const controller = module.get<AuthController>(AuthController);
    expect(controller).toBeDefined();
  });

  it('deve garantir que o AuthGuard esteja registrado como APP_GUARD nos metadados', () => {
    const providers = Reflect.getMetadata('providers', AuthModule);
    const appGuard = providers.find((p: any) => p.provide === APP_GUARD);

    expect(appGuard).toBeDefined();
    expect(appGuard.useClass).toBe(AuthGuard);
  });
});
