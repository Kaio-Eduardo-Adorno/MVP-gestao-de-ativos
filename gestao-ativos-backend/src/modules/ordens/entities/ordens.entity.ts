import { AtivosEntity } from '../../ativos/entities/ativos.entity';
import { UsersEntity } from '../../auth/entities/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('ordens')
export class OrdensEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'id_usuario' })
  user!: UsersEntity;

  @Column({ type: 'uuid' })
  id_usuario!: string;

  @ManyToOne(() => AtivosEntity, { eager: true })
  @JoinColumn({ name: 'id_ativo' })
  ativo!: AtivosEntity;

  @Column({ type: 'uuid' })
  id_ativo!: string;

  @Column()
  tipo!: string;

  @Column()
  quantidade!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  valor_unitario!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  valor_total!: number;

  @Column()
  status!: string;

  @Column({ unique: true })
  chave_idempotencia!: string;

  @CreateDateColumn()
  criado_em!: Date;

  @UpdateDateColumn()
  atualizado_em!: Date;
}
