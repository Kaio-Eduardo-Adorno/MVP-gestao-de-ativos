import { validate } from 'class-validator';
import { Logger } from '@nestjs/common';
import { ErrorUtil } from '../../../../utils/error';

export class ExternalApiValidator {
  private static readonly logger = new Logger(ExternalApiValidator.name);

  static async validateDto<T extends object>(
    dto: T,
    mensagemErro: string = 'A API externa retornou dados em um formato inválido.',
  ): Promise<void> {
    const errors = await validate(dto);

    if (errors.length > 0) {
      this.logger.error(`Falha na validação do DTO [${dto.constructor.name}]:`, errors);

      throw new ErrorUtil('DADOS_INVALIDOS', mensagemErro);
    }
  }
}
