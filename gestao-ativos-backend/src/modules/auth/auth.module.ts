import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AUTH_SERVICES } from './services';
import { AuthController } from './controller/auth.controller';
import { AUTH_REPOSITORIES } from './repository';
import { JwtModule } from '@nestjs/jwt';
import { UsersEntity } from './entities/user.entity';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import { EnvService } from '../../config/env.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        secret: envService.read().JWT_SECRET,
        signOptions: { expiresIn: '365d' },
      }),
    }),
    TypeOrmModule.forFeature([UsersEntity]),
  ],
  controllers: [AuthController],
  providers: [
    ...AUTH_SERVICES,
    ...AUTH_REPOSITORIES,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AuthModule {}
