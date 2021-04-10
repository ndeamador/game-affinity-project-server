import { Field, ID, ObjectType } from 'type-graphql';
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

// https://api-docs.igdb.com/#cover
@ObjectType()
export class Cover {

  @Field()
  id: number;

  @Field({ nullable: true, description: 'Cover id in IGDB' })
  image_id: string;	// The ID of the image used to construct an IGDB image link
}


// https://api-docs.igdb.com/#genre
@ObjectType()
export class Genre {

  @Field()
  id: number;

  @Field()
  name: string;
}

// https://api-docs.igdb.com/#platform
@ObjectType()
export class Platform {

  @Field()
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  platform_family: number; //  Nintendo: 5 - Linux: 4 - Sega: 3 = Xbox: 2 - PlayStation: 1

  @Field({ nullable: true })
  category: number; // console	1  arcade	2  platform	3  operating_system	4  portable_console	5  computer	6
}


// https://api-docs.igdb.com/#involved-company
@ObjectType()
export class Company {

  @Field()
  id: number;

  @Field({ nullable: true })
  name: string;
}


// https://api-docs.igdb.com/#involved-company
@ObjectType()
export class InvolvedCompany {

  @Field()
  id: number;

  @Field({ nullable: true })
  developer: boolean;

  @Field({ nullable: true })
  company: Company;
}










// // https://api-docs.igdb.com/#cover
// @ObjectType()
// @Entity()
// export class Cover extends BaseEntity {

//   @PrimaryGeneratedColumn()
//   @Field(_type => ID)
//   id: string;

//   @Column({ nullable: true })
//   @Field({ nullable: true, description: 'Cover id in IGDB'  })
//   image_id: string;	// The ID of the image used to construct an IGDB image link

//   @Column({ nullable: true })
//   @Field({ nullable: true })
//   alpha_channel: boolean;

//   @Column({ nullable: true })
//   @Field({ nullable: true })
//   animated: boolean;

//   @Column({ nullable: true })
//   @Field({ nullable: true })
//   checksum: string;	// Hash of the object

//   @Column({ nullable: true })
//   @Field({ nullable: true })
//   height: number;	// The height of the image in pixels

//   @Column({ nullable: true })
//   @Field({ nullable: true })
//   url: string;	// The website address(URL) of the item

//   @Column({ nullable: true })
//   @Field({ nullable: true })
//   width: number;	// The width of the image in pixels

//   @CreateDateColumn({ name: 'updated_at' })
//   updatedAt: Date;

//   @UpdateDateColumn({ name: 'created_at' })
//   createdAt: Date;
// }
