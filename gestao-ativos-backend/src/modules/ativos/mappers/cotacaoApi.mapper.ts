import { CotacaoResponseDto } from '../dtos/response/cotacao.response';
import { CotacaoApiResponseDto } from '../dtos/response/cotacaoApi.response';

export class CotacaoApiMapper {
  static apiResponsetoResponseDto(ativo: CotacaoApiResponseDto): CotacaoResponseDto {
    const response = new CotacaoResponseDto();
    response.simbolo = ativo.symbol;
    response.nome = ativo.name;
    response.preco = ativo.price;
    response.dataCotacao = ativo.timestamp;
    return response;
  }

  static toResponseDtoList(ativos: CotacaoApiResponseDto[]): CotacaoResponseDto[] {
    return ativos.map((ativo) => this.apiResponsetoResponseDto(ativo));
  }
}
