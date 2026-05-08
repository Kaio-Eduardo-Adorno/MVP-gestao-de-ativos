import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EnvService } from './config/env.service';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap(): Promise<void> {
  const config = new EnvService().read();
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(config.ATIVOS_PORT);
}

void bootstrap();
