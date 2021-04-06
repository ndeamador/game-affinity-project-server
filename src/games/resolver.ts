import { Arg, Int, Query, Resolver } from 'type-graphql';
import Game from '../games/typeDef';
import { GameService } from './service';
import { Service } from 'typedi';


// The @Resolver() decorator makes this class behave like a controller from classic REST frameworks
// Here, we use the Service() decorator in order to inject the MovieService as a dependency to the resolver class,
@Service()
@Resolver(_of => Game)
export class GameResolver {

  constructor(private readonly gameService: GameService) { }

  @Query(_returns => String)
  gameHello() {
    return 'hi from GameResolver';
  }

  @Query(_returns => [Game], { nullable: true })
  async findGames(
    @Arg('name', { nullable: true }) name: string,
    @Arg('id', () => [Int], { nullable: true }) id: number[],
    @Arg('maxResults', () => Int, { nullable: true }) maxResults: number
  ): Promise<Game[]> {
    console.log('======================================================');
    console.log('Finding games...\n------------------------------------------------------');

    if (!name && !id) {
      throw new Error('An argument is required.');
    }
    else if (name) {
      console.log(`Looking for games containing "${name}"...`);
    }
    else if (id) {
      console.log(`Searching game with id "${id}"...`);
    }
    return await this.gameService.findGamesInIGDB(name, id, maxResults);
  }
}
