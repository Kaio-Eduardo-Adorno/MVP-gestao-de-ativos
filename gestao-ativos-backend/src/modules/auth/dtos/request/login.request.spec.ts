import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginRequestDto } from './login.request';

describe('LoginRequestDto', () => {
  it('deve validar com sucesso um request de login válido', async () => {
    const plain = {
      email: 'usuario@exemplo.com',
      password: 'password123',
    };

    const instance = plainToInstance(LoginRequestDto, plain);
    const errors = await validate(instance);

    expect(errors.length).toBe(0);
  });

  it('deve falhar na validação se o email for inválido', async () => {
    const plain = {
      email: 'email-invalido',
      password: 'password123',
    };

    const instance = plainToInstance(LoginRequestDto, plain);
    const errors = await validate(instance);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('deve falhar na validação se a senha for menor que 8 caracteres', async () => {
    const plain = {
      email: 'usuario@exemplo.com',
      password: '123',
    };

    const instance = plainToInstance(LoginRequestDto, plain);
    const errors = await validate(instance);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });

  it('deve falhar na validação se os campos obrigatórios estiverem ausentes', async () => {
    const instance = plainToInstance(LoginRequestDto, {});
    const errors = await validate(instance);

    expect(errors.length).toBe(2);
  });
});
