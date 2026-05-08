import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1778205179854 implements MigrationInterface {
  name = 'Migration1778205179854';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ativos_schema"."users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ativos_schema"."saldos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "saldo" numeric(10,2) NOT NULL, "id_usuario" uuid NOT NULL, CONSTRAINT "PK_a8878506d98a58cf1ac9b6d3ee2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ativos_schema"."ativos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "simbolo" character varying NOT NULL, "nome" character varying NOT NULL, "cotacao" numeric(10,2) NOT NULL, "horario_cotacao" TIMESTAMP NOT NULL, CONSTRAINT "UQ_2f9a255ec6416946d3386657cbf" UNIQUE ("simbolo"), CONSTRAINT "PK_1bcce554b739402d724b85c129a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ativos_schema"."ativos_usuarios" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "id_usuario" character varying NOT NULL, "id_ativo" uuid NOT NULL, "quantidade" integer NOT NULL, CONSTRAINT "PK_d470c8a9e0e4d2912332ed04636" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ativos_schema"."ordens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "id_usuario" uuid NOT NULL, "id_ativo" uuid NOT NULL, "tipo" character varying NOT NULL, "quantidade" integer NOT NULL, "valor_unitario" numeric(10,2) NOT NULL, "valor_total" numeric(10,2) NOT NULL, "status" character varying NOT NULL, "chave_idempotencia" character varying NOT NULL, "criado_em" TIMESTAMP NOT NULL DEFAULT now(), "atualizado_em" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_25ae6d57dddf1521c1d012c2d1a" UNIQUE ("chave_idempotencia"), CONSTRAINT "PK_84c82c8c2ef8cf042c12d260e23" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "ativos_schema"."saldos" ADD CONSTRAINT "FK_5b7029f2734428784f1540831c1" FOREIGN KEY ("id_usuario") REFERENCES "ativos_schema"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ativos_schema"."ativos_usuarios" ADD CONSTRAINT "FK_7bea7b3a93a26de6b971004cd5a" FOREIGN KEY ("id_ativo") REFERENCES "ativos_schema"."ativos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ativos_schema"."ordens" ADD CONSTRAINT "FK_c473f27e48a751b23ddb104d994" FOREIGN KEY ("id_usuario") REFERENCES "ativos_schema"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ativos_schema"."ordens" ADD CONSTRAINT "FK_8c51e12f42dac42f9079ba1b171" FOREIGN KEY ("id_ativo") REFERENCES "ativos_schema"."ativos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ativos_schema"."ordens" DROP CONSTRAINT "FK_8c51e12f42dac42f9079ba1b171"`);
    await queryRunner.query(`ALTER TABLE "ativos_schema"."ordens" DROP CONSTRAINT "FK_c473f27e48a751b23ddb104d994"`);
    await queryRunner.query(`ALTER TABLE "ativos_schema"."ativos_usuarios" DROP CONSTRAINT "FK_7bea7b3a93a26de6b971004cd5a"`);
    await queryRunner.query(`ALTER TABLE "ativos_schema"."saldos" DROP CONSTRAINT "FK_5b7029f2734428784f1540831c1"`);
    await queryRunner.query(`DROP TABLE "ativos_schema"."ordens"`);
    await queryRunner.query(`DROP TABLE "ativos_schema"."ativos_usuarios"`);
    await queryRunner.query(`DROP TABLE "ativos_schema"."ativos"`);
    await queryRunner.query(`DROP TABLE "ativos_schema"."saldos"`);
    await queryRunner.query(`DROP TABLE "ativos_schema"."users"`);
  }
}
