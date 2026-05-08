import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { EnvService } from '../../../../config/env.service';
import { firstValueFrom, retry, timeout, timer } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import { ExternalApiValidator } from '../../utils/validations/externalApi.validator';
import { CotacaoApiResponseDto } from '../../dtos/response/cotacaoApi.response';
import { CotacaoApiMapper } from '../../mappers/cotacaoApi.mapper';
import { CotacaoResponseDto } from '../../dtos/response/cotacao.response';
import { ErrorUtil } from '../../../../utils/error';

@Injectable()
export class BuscarCotacaoAtualRepository {
  private readonly logger = new Logger(BuscarCotacaoAtualRepository.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly envService: EnvService,
  ) {}

  public async execute(): Promise<CotacaoResponseDto[]> {
    try {
      const config = this.envService.read();
      const apiUrl = `${config.COTACAO_API_URL}/quotations`;

      const { data } = await firstValueFrom(
        this.httpService.get<{ data: unknown }>(apiUrl).pipe(
          timeout(5000),
          retry({
            count: 2,
            delay: (error, retryCount) => timer(retryCount * 1000),
          }),
        ),
      );

      const rawDataArray = data?.data;

      if (!rawDataArray || !Array.isArray(rawDataArray)) {
        throw new ErrorUtil('COTACAO_NAO_ENCONTRADA', 'Nenhuma cotação foi encontrada na corretora.');
      }

      const ativosMapeados = plainToInstance(CotacaoApiResponseDto, rawDataArray, { excludeExtraneousValues: true });

      for (const ativo of ativosMapeados) {
        await ExternalApiValidator.validateDto(ativo, 'A lista da corretora contém dados com formato inválido.');
      }

      return ativosMapeados.map((ativo) => CotacaoApiMapper.apiResponsetoResponseDto(ativo));
    } catch (error) {
      if (error instanceof ErrorUtil) {
        throw error;
      }

      this.logger.error('Falha ao buscar a lista de cotações.', error);
      throw new ErrorUtil('ERRO_INTERNO', 'Ocorreu um erro interno ao buscar a lista de cotações.');
    }
  }
}
