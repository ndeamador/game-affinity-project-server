import { Field, ObjectType, ID } from "type-graphql";
import { Cover, Genre, InvolvedCompany, Platform } from '../minorEntities/typeDef';

@ObjectType()
class Game {

  @Field(_type => ID)
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  summary: string;

  @Field({ nullable: true })
  first_release_date: number;

  @Field({ nullable: true })
  cover: Cover;

  @Field(_type => [Platform], { nullable: true })
  platforms: Platform[];

  @Field(_type => [Genre], { nullable: true })
  genres: Genre[];

  @Field()
  total_rating_count: number;

  @Field(_type => [InvolvedCompany], { nullable: true })
  involved_companies: InvolvedCompany[];
}

@ObjectType()
export class RatedGame extends Game {
  @Field()
  // @Field(_type => Number)
  average_rating: number;
}

export default Game;