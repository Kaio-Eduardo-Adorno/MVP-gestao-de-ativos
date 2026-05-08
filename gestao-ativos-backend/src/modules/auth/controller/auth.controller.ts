import { Body, Controller, Post } from '@nestjs/common';
import { LoginService } from '../services';
import { LoginRequestDto } from '../dtos/request/login.request';
import { Public } from '../decorators/public.decorator';

@Controller('/auth')
export class AuthController {
  constructor(private readonly loginService: LoginService) {}

  @Public()
  @Post('/login')
  login(@Body() login: LoginRequestDto) {
    return this.loginService.execute(login);
  }
}
