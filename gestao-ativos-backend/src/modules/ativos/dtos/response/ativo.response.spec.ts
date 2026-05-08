import { AtivoResponseDto } from './ativo.response';

describe('AtivoResponseDto', () => {
  it('deve garantir que o objeto de resposta do ativo possa ser instanciado e populado corretamente', () => {
    const dto = new AtivoResponseDto();
    const mockDate = new Date();

    dto.id = 'ativo-uuid';
    dto.simbolo = 'PETR4';
    dto.nome = 'Petrobras';
    dto.cotacao = 35.8;
    dto.horarioCotacao = mockDate;

    expect(dto).toBeDefined();
    expect(dto.id).toBe('ativo-uuid');
    expect(dto.simbolo).toBe('PETR4');
    expect(dto.nome).toBe('Petrobras');
    expect(dto.cotacao).toBe(35.8);
    expect(dto.horarioCotacao).toBe(mockDate);
  });
});
