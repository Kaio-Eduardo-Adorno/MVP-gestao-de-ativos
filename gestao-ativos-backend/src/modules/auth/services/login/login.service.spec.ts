import { Test, TestingModule } from '@nestjs/testing';
import { LoginService } from './login.service';
import { LoginRepository } from '../../repository/login/login.repository';
import { LoginRequestDto } from '../../dtos/request/login.request';
import { LoginResponseDto } from '../../dtos/response/login.response';

describe('LoginService', () => {
  let service: LoginService;
  let repository: LoginRepository;

  const mockLoginRequest: LoginRequestDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockLoginResponse: LoginResponseDto = {
    token: 'jwt-token-mock',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginService,
        {
          provide: LoginRepository,
          useValue: {
            execute: jest.fn().mockResolvedValue(mockLoginResponse),
          },
        },
      ],
    }).compile();

    service = module.get<LoginService>(LoginService);
    repository = module.get<LoginRepository>(LoginRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call loginRepository.execute with correct parameters and return the result', async () => {
    const result = await service.execute(mockLoginRequest);

    expect(repository.execute).toHaveBeenCalledWith(mockLoginRequest);
    expect(repository.execute).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockLoginResponse);
  });
});
