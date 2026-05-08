import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AtivosEntity } from './ativos.entity';

@Entity('ativos_usuarios')
export class AtivosUsuariosEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column()
  id_usuario!: string;

  @ManyToOne(() => AtivosEntity, { eager: true })
  @JoinColumn({ name: 'id_ativo' })
  ativo!: AtivosEntity;

  @Column({ type: 'uuid' })
  id_ativo!: string;

  @Column()
  quantidade!: number;
}
