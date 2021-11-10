import { Field, ObjectType } from 'type-graphql';

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


@ObjectType()
export class RankingElement {
  @Field()
  igdb_game_id: number;

  @Field()
  average_rating: string;
}