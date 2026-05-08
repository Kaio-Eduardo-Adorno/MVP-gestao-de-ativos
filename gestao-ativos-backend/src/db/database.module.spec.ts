import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from './database.module';

// Mockamos o TypeOrmModule para evitar conexões reais com o banco durante os testes unitários
jest.mock('@nestjs/typeorm', () => ({
  TypeOrmModule: {
    forRoot: jest.fn().mockReturnValue({
      module: class MockTypeOrmModule {},
      providers: [],
    }),
  },
}));

describe('DatabaseModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [DatabaseModule],
    }).compile();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido (módulo compilado com sucesso)', () => {
    expect(module).toBeDefined();
  });
});
