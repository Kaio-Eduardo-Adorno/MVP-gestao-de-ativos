import { AtivoUsuarioResponseDto } from './ativoUsuario.response';

describe('AtivoUsuarioResponseDto', () => {
  it('deve garantir que o objeto de custódia do usuário possua a estrutura de dados correta', () => {
    const dto = new AtivoUsuarioResponseDto();
    const mockDate = new Date();

    dto.simbolo = 'ITUB4';
    dto.nome = 'Itaú Unibanco';
    dto.quantidade = 250;
    dto.cotacaoAtual = 33.1;
    dto.horarioCotacao = mockDate;

    expect(dto).toBeDefined();
    expect(dto.simbolo).toBe('ITUB4');
    expect(dto.nome).toBe('Itaú Unibanco');
    expect(dto.quantidade).toBe(250);
    expect(dto.cotacaoAtual).toBe(33.1);
    expect(dto.horarioCotacao).toBe(mockDate);
  });
});
