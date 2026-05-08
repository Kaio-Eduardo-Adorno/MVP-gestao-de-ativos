import { CotacaoResponseDto } from './cotacao.response';

describe('CotacaoResponseDto', () => {
  it('deve garantir que o DTO de cotação simplificada armazene os valores corretamente', () => {
    const dto = new CotacaoResponseDto();
    const mockDataIso = '2023-10-27T10:00:00Z';

    dto.id = 'cot-123';
    dto.simbolo = 'VALE3';
    dto.nome = 'Vale S.A.';
    dto.preco = 68.45;
    dto.dataCotacao = mockDataIso;

    expect(dto.id).toBe('cot-123');
    expect(dto.simbolo).toBe('VALE3');
    expect(dto.nome).toBe('Vale S.A.');
    expect(dto.preco).toBe(68.45);
    expect(dto.dataCotacao).toBe(mockDataIso);
  });
});
