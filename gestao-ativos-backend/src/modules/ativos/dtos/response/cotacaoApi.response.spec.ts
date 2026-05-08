import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CotacaoApiResponseDto } from './cotacaoApi.response';

describe('CotacaoApiResponseDto', () => {
  it('deve transformar o preço de string para number e validar com sucesso', async () => {
    const plain = {
      symbol: 'PETR4',
      name: 'Petrobras',
      price: '33.77',
      timestamp: '2023-10-27T10:00:00Z',
    };

    const instance = plainToInstance(CotacaoApiResponseDto, plain);
    const errors = await validate(instance);

    expect(errors.length).toBe(0);
    expect(instance.price).toBe(33.77);
    expect(typeof instance.price).toBe('number');
  });

  it('deve falhar na validação se campos obrigatórios estiverem ausentes ou inválidos', async () => {
    const plain = {
      symbol: '',
      name: 'Petrobras',
      price: 'texto-invalido',
      timestamp: 'data-invalida',
    };

    const instance = plainToInstance(CotacaoApiResponseDto, plain);
    const errors = await validate(instance);

    const errorProperties = errors.map((e) => e.property);

    expect(errorProperties).toContain('symbol');
    expect(errorProperties).toContain('price');
    expect(errorProperties).toContain('timestamp');
  });
});
