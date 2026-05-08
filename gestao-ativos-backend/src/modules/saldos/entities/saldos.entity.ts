import { UsersEntity } from '../../../modules/auth/entities/user.entity';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('saldos')
export class SaldosEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  saldo!: number;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'id_usuario' })
  user!: UsersEntity;

  @Column({ type: 'uuid' })
  id_usuario!: string;
}
