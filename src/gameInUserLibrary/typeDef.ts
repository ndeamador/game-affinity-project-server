import { Field, ID, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import Game from '../games/typeDef';
import User from '../users/typeDef';

@ObjectType()
@Entity()
@Index(['igdb_game_id', 'user'], { unique: true }) // Create composite key with two foreign keys. Prevents that several rows with the same game and user are created.
class GameInUserLibrary extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(_type => ID)
  id!: number;

  @ManyToOne(() => User, user => user.GamesInLibrary)
  public user!: User;

  // For now we are not going to store games in our database, so we remove the connection to the Game entity.
  // @ManyToOne(() => Game, game => game.GamesInLibrary)
  // public game!: Game;

  // Instead I'll use a regular column for now.
  @Column({ nullable: false })
  @Field(_type => Int, { nullable: false })
  igdb_game_id: number;



  // @Column({ type: 'smallint', nullable: true })
  // @Field({ nullable: true })
  // rating: number;

  // @Column({ nullable: true })
  // @Field({ nullable: true })
  // review: string;

  // @Column({ nullable: true })
  // @Field({ nullable: true })
  // in_collection: boolean;

  // @Column({ nullable: true })
  // @Field({ nullable: true })
  // played: boolean;

  // @Column({ nullable: true })
  // @Field({ nullable: true })
  // wishlist: boolean;

  @UpdateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

export default GameInUserLibrary;
