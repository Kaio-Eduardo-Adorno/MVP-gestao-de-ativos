import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { EnvService } from '../../../config/env.service';
import { ErrorUtil } from '../../../utils/error';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private envService: EnvService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new ErrorUtil('TOKEN_AUSENTE', 'Token de autenticação não fornecido.');
    }

    try {
      const payload: unknown = await this.jwtService.verifyAsync(token, {
        secret: this.envService.read().JWT_SECRET,
      });

      // Atribui o payload ao request para ser usado nas rotas protegidas
      request['user'] = payload;
    } catch {
      throw new ErrorUtil('TOKEN_INVALIDO', 'Token inválido ou expirado.');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
