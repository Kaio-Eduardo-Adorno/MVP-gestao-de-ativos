import { AtivoMapper } from './ativo.mapper';
import { AtivosEntity } from '../entities/ativos.entity';

describe('AtivoMapper', () => {
  const mockDate = new Date();

  const createMockEntity = (id: string, simbolo: string): AtivosEntity => {
    const entity = new AtivosEntity();
    entity.id = id;
    entity.simbolo = simbolo;
    entity.nome = `Ativo ${simbolo}`;
    entity.cotacao = 100.5;
    entity.horario_cotacao = mockDate;
    return entity;
  };

  describe('entityToDto', () => {
    it('deve mapear corretamente os campos da entidade para o DTO (incluindo conversão de datas)', () => {
      const entity = createMockEntity('uuid-123', 'PETR4');

      const result = AtivoMapper.entityToDto(entity);

      expect(result.id).toBe(entity.id);
      expect(result.simbolo).toBe(entity.simbolo);
      expect(result.nome).toBe(entity.nome);
      expect(result.cotacao).toBe(entity.cotacao);
      expect(result.horarioCotacao).toBe(entity.horario_cotacao);
    });
  });

  describe('entityListToDtoList', () => {
    it('deve mapear um array de entidades para um array de DTOs', () => {
      const entities = [createMockEntity('1', 'A'), createMockEntity('2', 'B')];

      const result = AtivoMapper.entityListToDtoList(entities);

      expect(result).toHaveLength(2);
      expect(result[0].simbolo).toBe('A');
      expect(result[1].simbolo).toBe('B');
    });
  });
});
