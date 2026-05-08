import { OrdemMapper } from './ordem.mapper';
import { OrdensEntity } from '../entities/ordens.entity';
import { AtivosEntity } from '../../ativos/entities/ativos.entity';

describe('OrdemMapper', () => {
  const mockDate = new Date();

  const createMockEntity = (id: string, simbolo: string): OrdensEntity => {
    const entity = new OrdensEntity();
    entity.id = id;
    entity.tipo = 'COMPRA';
    entity.quantidade = 10;
    entity.valor_unitario = 35.5;
    entity.valor_total = 355.0;
    entity.status = 'PENDENTE';
    entity.criado_em = mockDate;
    entity.atualizado_em = mockDate;

    // Simulando o carregamento do relacionamento 'ativo'
    entity.ativo = new AtivosEntity();
    entity.ativo.simbolo = simbolo;

    return entity;
  };

  describe('entityToResponseDto', () => {
    it('deve mapear corretamente os campos da entidade para o DTO de resposta', () => {
      const entity = createMockEntity('uuid-123', 'PETR4');

      const result = OrdemMapper.entityToResponseDto(entity);

      expect(result.id).toBe(entity.id);
      expect(result.simbolo).toBe('PETR4');
      expect(result.tipo).toBe(entity.tipo);
      expect(result.quantidade).toBe(entity.quantidade);
      expect(result.valorUnitario).toBe(35.5);
      expect(result.valorTotal).toBe(355.0);
      expect(result.status).toBe(entity.status);
      expect(result.criadoEm).toBe(mockDate);
      expect(result.atualizadoEm).toBe(mockDate);
    });

    it('deve garantir que valores decimais vindos como string sejam convertidos para number', () => {
      const entity = createMockEntity('uuid-123', 'PETR4');
      // Simula o comportamento do driver pg que retorna Numeric como string
      (entity as any).valor_unitario = '35.50';
      (entity as any).valor_total = '355.00';

      const result = OrdemMapper.entityToResponseDto(entity);

      expect(typeof result.valorUnitario).toBe('number');
      expect(result.valorUnitario).toBe(35.5);
      expect(typeof result.valorTotal).toBe('number');
      expect(result.valorTotal).toBe(355);
    });
  });

  describe('entityListToResponseDtoList', () => {
    it('deve mapear uma lista de entidades para uma lista de DTOs', () => {
      const entities = [createMockEntity('1', 'PETR4'), createMockEntity('2', 'VALE3')];

      const result = OrdemMapper.entityListToResponseDtoList(entities);

      expect(result).toHaveLength(2);
      expect(result[0].simbolo).toBe('PETR4');
      expect(result[1].simbolo).toBe('VALE3');
    });
  });
});
