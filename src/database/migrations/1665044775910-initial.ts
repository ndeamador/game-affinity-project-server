import { MigrationInterface, QueryRunner } from "typeorm";
import { GUEST_ACCOUNTS_LIMIT } from '../../constants';

export class initial1665044775910 implements MigrationInterface {
  name = 'initial1665044775910'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "user" (
                "id" SERIAL NOT NULL,
                "username" character varying,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"),
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "game_in_user_library" (
                "id" SERIAL NOT NULL,
                "igdb_game_id" integer NOT NULL,
                "rating" integer,
                "subrating" integer,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" integer,
                CONSTRAINT "PK_ecd7d6de68c5c7a425810813e90" PRIMARY KEY ("id")
            )
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_69f1b2098bcd2834b8918ac374" ON "game_in_user_library" ("igdb_game_id", "userId")
        `);
    await queryRunner.query(`
            ALTER TABLE "game_in_user_library"
            ADD CONSTRAINT "FK_a1a308da95298c7ca2dcbafc9ce" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
        do $$
        declare
           counter integer := 0;
           insertedAccountId integer;
        begin
           while counter < ${GUEST_ACCOUNTS_LIMIT} loop
              raise notice 'Counter %', counter;
            INSERT INTO public.user (email, password)
            VALUES (CONCAT('guest-account-', counter, '@gap.com'), '$2b$10$OZcpVs9QSxf4VaRdvQQY6OIinYg.iaBYJqsjVqUtCF2LAi3J9XcgC') RETURNING id INTO insertedAccountId;
            INSERT INTO public.game_in_user_library (igdb_game_id, rating, "userId")
            VALUES (8227,	4, insertedAccountId),
             (20,	3, insertedAccountId),
             (654,	4, insertedAccountId),
             (36,	3, insertedAccountId),
             (734,	4, insertedAccountId),
             (39,	3, insertedAccountId),
             (18918,	0, insertedAccountId),
             (853,	4, insertedAccountId),
             (355,	2, insertedAccountId),
             (7042,	3, insertedAccountId),
             (25951,	4, insertedAccountId),
             (1318,	4, insertedAccountId),
             (653,	2, insertedAccountId),
             (7046,	2, insertedAccountId),
             (62,	2, insertedAccountId),
             (10637,	2, insertedAccountId),
             (337,	0, insertedAccountId),
             (111651,	1, insertedAccountId),
             (2033,	1, insertedAccountId),
             (132,	4, insertedAccountId),
             (123,	3, insertedAccountId),
             (132621,	0, insertedAccountId),
             (1904,	0, insertedAccountId),
             (436,	0, insertedAccountId),
             (18,	3, insertedAccountId),
             (289,	0, insertedAccountId),
             (16664,	3, insertedAccountId);
            counter := counter + 1;
           end loop;
        end$$;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "game_in_user_library" DROP CONSTRAINT "FK_a1a308da95298c7ca2dcbafc9ce"
        `);
    await queryRunner.query(`
            DROP INDEX "IDX_69f1b2098bcd2834b8918ac374"
        `);
    await queryRunner.query(`
            DROP TABLE "game_in_user_library"
        `);
    await queryRunner.query(`
            DROP TABLE "user"
        `);
  }

}
