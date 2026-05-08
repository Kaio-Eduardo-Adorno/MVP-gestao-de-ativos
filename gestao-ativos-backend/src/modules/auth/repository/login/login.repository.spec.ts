import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { LoginRepository } from './login.repository';
import { UsersEntity } from '../../entities/user.entity';
import { ErrorUtil } from '../../../../utils/error';

// 1. Mock bcrypt entirely before anything else loads
jest.mock('bcryptjs', () => ({
  compareSync: jest.fn(),
}));

describe('LoginRepository', () => {
  let loginRepository: LoginRepository;
  let usersRepository: Repository<UsersEntity>;
  let jwtService: JwtService;

  // 3. Setup mock values
  const mockUser = {
    id: 'uuid-usuario-123',
    nome: 'Usuário de Teste',
    email: 'test@test.com',
    password: 'hashedPassword123',
  } as UsersEntity;

  const mockLoginRequest = {
    email: 'test@test.com',
    password: 'plainPassword123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginRepository,
        {
          provide: getRepositoryToken(UsersEntity),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn() },
        },
      ],
    }).compile();

    loginRepository = module.get<LoginRepository>(LoginRepository);
    usersRepository = module.get(getRepositoryToken(UsersEntity));
    jwtService = module.get(JwtService);

    // Spy on logger to avoid actual console logs during tests
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(loginRepository).toBeDefined();
  });

  it('deve permitir a instanciação manual para cobrir o construtor', () => {
    const manualRepo = new LoginRepository(usersRepository, jwtService);
    expect(manualRepo).toBeDefined();
  });

  describe('execute', () => {
    it('deve retornar um token quando as credenciais forem válidas', async () => {
      // Arrange
      const expectedToken = 'jwt-token-123';
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue(expectedToken);

      // Act
      const result = await loginRepository.execute(mockLoginRequest);

      // Assert
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockLoginRequest.email },
      });
      expect(bcrypt.compareSync).toHaveBeenCalledWith(mockLoginRequest.password, mockUser.password);
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: mockUser.id,
        nome: mockUser.nome,
        email: mockUser.email,
      });
      expect(result).toEqual({ token: expectedToken });
    });

    it('deve lançar USUARIO_NAO_ENCONTRADO se o usuário não existir', async () => {
      // Arrange
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(loginRepository.execute(mockLoginRequest)).rejects.toThrow(
        new ErrorUtil('USUARIO_NAO_ENCONTRADO', 'Usuário com este email não encontrado.'),
      );

      // Ensure it stops executing before checking password
      expect(bcrypt.compareSync).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('deve lançar SENHA_INCORRETA se a senha não conferir', async () => {
      // Arrange
      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(mockUser);
      (bcrypt.compareSync as jest.Mock).mockReturnValue(false); // Wrong password

      // Act & Assert
      await expect(loginRepository.execute(mockLoginRequest)).rejects.toThrow(
        new ErrorUtil('SENHA_INCORRETA', 'Senha incorreta.'),
      );

      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('deve lançar ERRO_INTERNO e logar o erro caso ocorra uma falha inesperada no banco', async () => {
      // Arrange
      const unexpectedError = new Error('Database connection failed');
      jest.spyOn(usersRepository, 'findOne').mockRejectedValue(unexpectedError);

      const loggerSpy = jest.spyOn(Logger.prototype, 'error');

      // Act & Assert
      await expect(loginRepository.execute(mockLoginRequest)).rejects.toThrow(
        new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno ao tentar realizar o login.'),
      );

      // Ensure the error was logged properly for debugging
      expect(loggerSpy).toHaveBeenCalledWith(`Erro inesperado no login para o email ${mockLoginRequest.email}`, unexpectedError);
    });
  });
});
