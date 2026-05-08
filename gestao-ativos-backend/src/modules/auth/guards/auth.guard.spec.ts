import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { EnvService } from '../../../config/env.service';
import { ErrorUtil } from '../../../utils/error';
import { ExecutionContext } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let reflector: Reflector;
  let envService: EnvService;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockEnvService = {
    read: jest.fn().mockReturnValue({ JWT_SECRET: 'test-secret' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: JwtService, useValue: mockJwtService },
        { provide: Reflector, useValue: mockReflector },
        { provide: EnvService, useValue: mockEnvService },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    reflector = module.get<Reflector>(Reflector);
    envService = module.get<EnvService>(EnvService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('deve permitir a instanciação manual para cobertura do construtor (Linhas 12-14)', () => {
    const manualGuard = new AuthGuard(jwtService, reflector, envService);
    expect(manualGuard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockContext: any;

    beforeEach(() => {
      mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            headers: {},
          }),
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      };
    });

    it('should return true if the route is marked as public', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(true);

      const result = await guard.canActivate(mockContext as ExecutionContext);

      expect(result).toBe(true);
      expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
    });

    it('should throw TOKEN_AUSENTE if no authorization header is provided', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);

      await expect(guard.canActivate(mockContext as ExecutionContext)).rejects.toThrow(
        new ErrorUtil('TOKEN_AUSENTE', 'Token de autenticação não fornecido.'),
      );
    });

    it('should throw TOKEN_AUSENTE if authorization header is not a Bearer token', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
      mockContext.switchToHttp().getRequest().headers.authorization = 'Basic some-token';

      await expect(guard.canActivate(mockContext as ExecutionContext)).rejects.toThrow(
        new ErrorUtil('TOKEN_AUSENTE', 'Token de autenticação não fornecido.'),
      );
    });

    it('should throw TOKEN_INVALIDO if jwt verification fails', async () => {
      mockReflector.getAllAndOverride.mockReturnValue(false);
      mockContext.switchToHttp().getRequest().headers.authorization = 'Bearer invalid-token';
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await expect(guard.canActivate(mockContext as ExecutionContext)).rejects.toThrow(
        new ErrorUtil('TOKEN_INVALIDO', 'Token inválido ou expirado.'),
      );
    });

    it('should return true and attach user payload to request if token is valid', async () => {
      const payload = { sub: 'user-id', email: 'user@test.com' };
      const mockRequest: any = { headers: { authorization: 'Bearer valid-token' } };

      mockReflector.getAllAndOverride.mockReturnValue(false);
      mockContext.switchToHttp().getRequest.mockReturnValue(mockRequest);
      mockJwtService.verifyAsync.mockResolvedValue(payload);

      const result = await guard.canActivate(mockContext as ExecutionContext);

      expect(result).toBe(true);
      expect(mockRequest['user']).toEqual(payload);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('valid-token', {
        secret: 'test-secret',
      });
    });
  });
});
