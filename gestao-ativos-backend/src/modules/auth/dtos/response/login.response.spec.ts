import { LoginResponseDto } from './login.response';

describe('LoginResponseDto', () => {
  it('deve garantir que o DTO de resposta de login armazene o token corretamente', () => {
    const dto = new LoginResponseDto();
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

    dto.token = mockToken;

    expect(dto).toBeDefined();
    expect(dto.token).toBe(mockToken);
  });
});
