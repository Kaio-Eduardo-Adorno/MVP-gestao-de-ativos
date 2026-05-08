import { Injectable } from '@nestjs/common';
import { LoginRepository } from '../../repository/login/login.repository';
import { LoginResponseDto } from '../../dtos/response/login.response';
import { LoginRequestDto } from '../../dtos/request/login.request';

@Injectable()
export class LoginService {
  constructor(private readonly loginRepository: LoginRepository) {}

  async execute(loginRequest: LoginRequestDto): Promise<LoginResponseDto> {
    return await this.loginRepository.execute(loginRequest);
  }
}
