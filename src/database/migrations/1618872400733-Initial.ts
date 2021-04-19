import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1618872400733 implements MigrationInterface {
  name = 'Initial1618872400733';

  // Up contains the code to perform the migration
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying, "email" character varying NOT NULL, "password" character varying NOT NULL, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "game_in_user_library" ("id" SERIAL NOT NULL, "igdb_game_id" integer NOT NULL, "rating" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_ecd7d6de68c5c7a425810813e90" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_69f1b2098bcd2834b8918ac374" ON "game_in_user_library" ("igdb_game_id", "userId") `);
    await queryRunner.query(`ALTER TABLE "game_in_user_library" ADD CONSTRAINT "FK_a1a308da95298c7ca2dcbafc9ce" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  // Down has the code to revert whatever up changed. It changes the last migration.
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "game_in_user_library" DROP CONSTRAINT "FK_a1a308da95298c7ca2dcbafc9ce"`);
    await queryRunner.query(`DROP INDEX "IDX_69f1b2098bcd2834b8918ac374"`);
    await queryRunner.query(`DROP TABLE "game_in_user_library"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }

}
