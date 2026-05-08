import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersEntity } from '../../entities/user.entity';
import { LoginRequestDto } from '../../dtos/request/login.request';
import { LoginResponseDto } from '../../dtos/response/login.response';
import { ErrorUtil } from '../../../../utils/error';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LoginRepository {
  private readonly logger = new Logger(LoginRepository.name);

  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
    private readonly jwt: JwtService,
  ) {}

  public async execute({ email, password }: LoginRequestDto): Promise<LoginResponseDto> {
    try {
      const user = await this.usersRepository.findOne({ where: { email } });

      if (!user) {
        throw new ErrorUtil('USUARIO_NAO_ENCONTRADO', `Usuário com este email não encontrado.`);
      }

      const isPasswordValid: boolean = bcrypt.compareSync(password, user.password);

      if (!isPasswordValid) {
        throw new ErrorUtil('SENHA_INCORRETA', `Senha incorreta.`);
      }

      const token: string = this.jwt.sign({ id: user.id, nome: user.nome, email: user.email });

      return { token };
    } catch (error) {
      if (error instanceof ErrorUtil) {
        throw error;
      }

      this.logger.error(`Erro inesperado no login para o email ${email}`, error);
      throw new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno ao tentar realizar o login.');
    }
  }
}
