import { AtivoUsuarioMapper } from './ativoUsuario.mapper';
import { AtivosUsuariosEntity } from '../entities/ativosUsuarios.entity';
import { AtivosEntity } from '../entities/ativos.entity';

describe('AtivoUsuarioMapper', () => {
  it('deve mapear a entidade de custódia buscando informações da entidade de ativo relacionada', () => {
    const mockDate = new Date();

    const ativoEntity = new AtivosEntity();
    ativoEntity.simbolo = 'ITUB4';
    ativoEntity.nome = 'Itaú';
    ativoEntity.cotacao = 33.5;
    ativoEntity.horario_cotacao = mockDate;

    const entity = new AtivosUsuariosEntity();
    entity.quantidade = 100;
    entity.ativo = ativoEntity;

    const result = AtivoUsuarioMapper.entityToDto(entity);

    expect(result.simbolo).toBe('ITUB4');
    expect(result.nome).toBe('Itaú');
    expect(result.quantidade).toBe(100);
    expect(result.cotacaoAtual).toBe(33.5);
    expect(result.horarioCotacao).toBe(mockDate);
  });

  it('deve mapear listas de custódia corretamente', () => {
    const entity = new AtivosUsuariosEntity();
    entity.quantidade = 10;
    entity.ativo = new AtivosEntity();
    entity.ativo.simbolo = 'ABC';

    const result = AtivoUsuarioMapper.entityListToDtoList([entity]);

    expect(result).toHaveLength(1);
    expect(result[0].simbolo).toBe('ABC');
  });
});
