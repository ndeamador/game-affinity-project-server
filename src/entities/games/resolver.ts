import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';
import Game from './typeDef';
import { GameService } from './service';
import { Service } from 'typedi';
import { Context } from '../../types';


// The @Resolver() decorator makes this class behave like a controller from classic REST frameworks
// Here, we use the Service() decorator in order to inject the GameService as a dependency to the resolver class,
@Service()
@Resolver(_of => Game)
export class GameResolver {

  constructor(private readonly gameService: GameService) { }

  @Query(_returns => [Game], { nullable: true })
  async findGames(
    @Arg('name', { nullable: true }) name: string,
    @Arg('id', () => [Int], { nullable: true }) id: number[],
    @Arg('maxResults', () => Int, { nullable: true }) maxResults: number,
    @Ctx() { igdb_access_token }: Context,
  ): Promise<Game[]> {
    return await this.gameService.findGamesInIGDB(igdb_access_token, name, id, maxResults);
  }
}
