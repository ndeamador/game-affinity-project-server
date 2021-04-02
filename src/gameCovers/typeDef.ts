import { Field, ID, ObjectType } from 'type-graphql';
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

// https://api-docs.igdb.com/#cover

@ObjectType()
@Entity()
class Cover extends BaseEntity {

  @PrimaryGeneratedColumn()
  @Field(_type => ID)
  id: string;

  @Column({ nullable: true })
  @Field({ nullable: true, description: 'Cover id in IGDB'  })
  image_id: string;	// The ID of the image used to construct an IGDB image link

  @Column({ nullable: true })
  @Field({ nullable: true })
  alpha_channel: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  animated: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  checksum: string;	// Hash of the object

  @Column({ nullable: true })
  @Field({ nullable: true })
  height: number;	// The height of the image in pixels

  @Column({ nullable: true })
  @Field({ nullable: true })
  url: string;	// The website address(URL) of the item

  @Column({ nullable: true })
  @Field({ nullable: true })
  width: number;	// The width of the image in pixels

  @CreateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @UpdateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

export default Cover;