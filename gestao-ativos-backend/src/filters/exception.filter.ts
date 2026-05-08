import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ErrorUtil } from '../utils/error';

// O filtro agora captura EXCLUSIVAMENTE a nossa classe genérica
@Catch(ErrorUtil)
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: ErrorUtil, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception.statusCode >= 500) {
      this.logger.error(`[${exception.errorName}] ${exception.message}`, exception.stack);
    }

    response.status(exception.statusCode).json({
      statusCode: exception.statusCode,
      error: exception.errorName,
      message: exception.message,
      timestamp: new Date().toISOString(),
    });
  }
}
