import { validate } from 'class-validator';
import { Logger } from '@nestjs/common';
import { ExternalApiValidator } from './externalApi.validator';
import { ErrorUtil } from 'src/utils/error';

// Mockamos o class-validator para controlar o resultado da validação de forma isolada
jest.mock('class-validator', () => ({
  validate: jest.fn(),
}));

describe('ExternalApiValidator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateDto', () => {
    it('deve resolver com sucesso quando a validação do class-validator não encontrar erros', async () => {
      // Arrange
      (validate as jest.Mock).mockResolvedValue([]);
      const mockDto = { symbol: 'PETR4', price: 30 };

      // Act & Assert
      await expect(ExternalApiValidator.validateDto(mockDto)).resolves.toBeUndefined();
      expect(validate).toHaveBeenCalledWith(mockDto);
    });

    it('deve lançar ErrorUtil e realizar log quando a validação encontrar erros no DTO', async () => {
      // Arrange
      const mockErrors = [
        {
          property: 'price',
          constraints: { isNumber: 'price must be a number' },
        },
      ];
      (validate as jest.Mock).mockResolvedValue(mockErrors);

      const loggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
      const mockDto = { symbol: 'PETR4', price: 'invalid' };
      const customMessage = 'Dados da API de cotação inválidos';

      // Act & Assert
      await expect(ExternalApiValidator.validateDto(mockDto, customMessage)).rejects.toThrow(
        new ErrorUtil('DADOS_INVALIDOS', customMessage),
      );

      expect(loggerSpy).toHaveBeenCalled();
      expect(validate).toHaveBeenCalledWith(mockDto);
    });

    it('deve utilizar a mensagem de erro padrão quando o segundo parâmetro for omitido', async () => {
      (validate as jest.Mock).mockResolvedValue([{ property: 'any' }]);
      jest.spyOn(Logger.prototype, 'error').mockImplementation();

      await expect(ExternalApiValidator.validateDto({})).rejects.toThrow(
        new ErrorUtil('DADOS_INVALIDOS', 'A API externa retornou dados em um formato inválido.'),
      );
    });
  });
});
