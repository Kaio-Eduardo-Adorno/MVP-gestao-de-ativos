import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AtivosUsuariosEntity } from './ativosUsuarios.entity';

@Entity('ativos')
export class AtivosEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ unique: true })
  simbolo!: string;

  @Column()
  nome!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  cotacao!: number;

  @Column()
  horario_cotacao!: Date;

  @OneToMany(() => AtivosUsuariosEntity, (ativoUsuario) => ativoUsuario.ativo)
  usuarios!: AtivosUsuariosEntity[];
}
