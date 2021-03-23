import { Arg, Query, Resolver } from 'type-graphql';
import Game from '../games/typeDef';
import { GameService } from './service';
import { Service } from 'typedi';


// The @Resolver() decorator makes this class behave like a controller from classic REST frameworks
// Here, we use the Service() decorator in order to inject the MovieService as a dependency to the resolver class,
@Service()
@Resolver(_of => Game)
export class GameResolver {

  constructor(private readonly gameService: GameService) { }

  @Query(() => String)
  gameHello() {
    return 'hi from GameResolver';
  }

  @Query(_returns => [Game], { nullable: true })
  async findGames(
    @Arg('name') name: string
  ): Promise<Game[]> {
    console.log(`Looking for games containing "${name}"...`);
    return await this.gameService.findGamesInIGDB(name);
  }
}
