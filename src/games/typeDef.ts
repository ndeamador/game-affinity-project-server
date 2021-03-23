import { Field, ObjectType, ID } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

// The @ObjectType decorator marks the class as the type known from GraphQL SDL or GraphQLObjectType from graphql-js
// Extending BaseEntity allows us to use User.find or User.create, among other useful methods.
// There is no need to create the database table manually, TypeORM generates it automatically

@ObjectType()
@Entity()
class Game extends BaseEntity {

  // The @Field decorator marks the class properties as GraphQL fields.
  @PrimaryGeneratedColumn()
  @Field(_type => ID)
  id: string;

  @Column()
  @Field({ description: 'testing description' })
  name: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  summary: string;

  @Column({ nullable: true, name: 'first_release_date' })
  @Field({ nullable: true })
  firstReleaseDate: Date;

  @Column({ nullable: true})
  @Field({ nullable: true})
  cover: string;

  @CreateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @UpdateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

export default Game;