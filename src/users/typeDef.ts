import { Field, ID, ObjectType } from "type-graphql";
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, UpdateDateColumn } from "typeorm";

// Extending BaseEntity allows us to use User.find or User.create
// There is no need to create the database table manually, TypeORM generates it automatically

@ObjectType()
@Entity()
class User extends BaseEntity {

  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ unique: true, nullable: true })
  username: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  // We don't want to expose the password to GraphQL, so we don't add the @Field decorator
  @Column()
  password!: string;

  @CreateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @UpdateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

export default User;