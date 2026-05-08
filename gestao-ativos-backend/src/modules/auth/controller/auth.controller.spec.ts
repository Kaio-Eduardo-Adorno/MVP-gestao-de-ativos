import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { LoginService } from '../services';
import { LoginRequestDto } from '../dtos/request/login.request';

describe('AuthController', () => {
  let controller: AuthController;
  let loginService: LoginService;

  const mockLoginResponse = { token: 'mock-jwt-token' };
  const mockLoginRequest: LoginRequestDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: LoginService,
          useValue: {
            execute: jest.fn().mockResolvedValue(mockLoginResponse),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    loginService = module.get<LoginService>(LoginService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call loginService.execute and return the result', async () => {
      const result = await controller.login(mockLoginRequest);

      expect(loginService.execute).toHaveBeenCalledWith(mockLoginRequest);
      expect(loginService.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockLoginResponse);
    });
  });
});