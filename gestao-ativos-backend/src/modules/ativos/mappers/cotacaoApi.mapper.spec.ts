import { CotacaoApiMapper } from './cotacaoApi.mapper';
import { CotacaoApiResponseDto } from '../dtos/response/cotacaoApi.response';

describe('CotacaoApiMapper', () => {
  it('deve mapear a resposta da API externa para o DTO de resposta interna', () => {
    const apiDto = new CotacaoApiResponseDto();
    apiDto.symbol = 'AAPL';
    apiDto.name = 'Apple Inc.';
    apiDto.price = 180.5;
    apiDto.timestamp = '2023-10-27T15:00:00Z';

    const result = CotacaoApiMapper.apiResponsetoResponseDto(apiDto);

    expect(result.simbolo).toBe('AAPL');
    expect(result.nome).toBe('Apple Inc.');
    expect(result.preco).toBe(180.5);
    expect(result.dataCotacao).toBe('2023-10-27T15:00:00Z');
  });

  it('deve converter listas de cotações da API', () => {
    const apiDto = new CotacaoApiResponseDto();
    apiDto.symbol = 'MSFT';
    apiDto.name = 'Microsoft';
    apiDto.price = 330.2;
    apiDto.timestamp = '2023-10-27T15:00:00Z';

    const result = CotacaoApiMapper.toResponseDtoList([apiDto]);

    expect(result).toHaveLength(1);
    expect(result[0].simbolo).toBe('MSFT');
  });
});
