import { Field, ID, Int, ObjectType } from 'type-graphql';
import { BaseEntity, Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Rating } from '../../types';
import User from '../users/typeDef';

@ObjectType()
@Entity()
@Index(['igdb_game_id', 'user'], { unique: true }) // Create composite key with two foreign keys. Prevents that several rows with the same game and user are created.
class GameInUserLibrary extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(_type => ID)
  id!: number;

  @ManyToOne(() => User, user => user.gamesInLibrary, { onDelete: 'CASCADE' })
  @Field(_type => User)
  user!: User;

  // For now we are not going to store games in our database, so we remove the connection to the Game entity.
  // @ManyToOne(() => Game, game => game.GamesInLibrary)
  // public game!: Game;

  // Instead I'll use a regular column for now.
  @Column({ nullable: false })
  @Field(_type => Int, { nullable: false })
  igdb_game_id: number;

  // In a larger scale, real world application, rating would ideally be a separate entity to prevent null cells.
  // @Column({ nullable: true })
  @Column({ nullable: true })
  @Field(_type => Number, { nullable: true })
  rating: Rating;

  @Column({ nullable: true })
  @Field(_type => Number, { nullable: true })
  subrating: number;

  // @Column({ nullable: true })
  // @Field(_type => Number, { nullable: true })
  // total_ratings: number;

  // @Column({ nullable: true })
  // @Field(_type => Number, { nullable: true })
  // avg_rating: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export default GameInUserLibrary;
