import { Arg, Ctx, Int, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { Service } from 'typedi';
import GameInUserLibrary from './typeDef';
import { Context, TypeORMDeleteResponse } from '../types';
import { isUserAuthenticated } from '../middleware/isUserAuthenticated';
import User from '../users/typeDef';
import { GameResolver } from '../games/resolver';
import { GameService } from '../games/service';
import Game from '../games/typeDef';
import { DeleteResult, getConnection, getManager } from 'typeorm';


@Service()
@Resolver(_of => GameInUserLibrary)
export class GameInUserLibraryResolver {
  // Using service of Game in GameInUserLibrary, check if it's safe to do so.
  constructor(private readonly gameService: GameService) { }


  @Query(_returns => String)
  GameInUserLibraryHello() {
    return 'Hello from UserGameResolver!';
  }

  // ----------------------------------
  // ADD GAME TO LIBRARY
  // ----------------------------------
  @Mutation(_returns => GameInUserLibrary)
  @UseMiddleware(isUserAuthenticated) // https://typegraphql.com/docs/0.16.0/middlewares.html#attaching-middlewares
  async addGameToLibrary(
    @Ctx() { req }: Context,
    @Arg('gameId', _type => Int) gameId: number
  ) {
    console.log('Adding game to library...');

    const { userId } = req.session;
    const foundUser = await User.findOneOrFail({ where: { id: userId } });

    const gameInLibrary = new GameInUserLibrary();
    gameInLibrary.user = foundUser;
    gameInLibrary.igdb_game_id = gameId;

    // const savedGameInLibrary = await getConnection().manager.save(gameInLibrary);
    const savedGameInLibrary = await gameInLibrary.save();

    console.log('Game saved to library: ', savedGameInLibrary);

    return savedGameInLibrary;
  }


  // ----------------------------------
  // REMOVE GAME FROM LIBRARY
  // ----------------------------------
  @Mutation(_returns => Boolean)
  @UseMiddleware(isUserAuthenticated) // https://typegraphql.com/docs/0.16.0/middlewares.html#attaching-middlewares
  async removeGameFromLibrary(
    @Ctx() { req }: Context,
    @Arg('igdb_game_id', _type => Int) igdb_game_id: number
  ) {
    console.log(`Removing game from library...\n------------------------------------------------`);
    const { userId } = req.session;

    const response = await GameInUserLibrary.delete({ igdb_game_id: igdb_game_id, user: { id: userId } });
    console.log('response: ', response);

    return response.affected === 0 ? false : true;
  }


  // ----------------------------------
  // GET IDS OF ALL GAMES IN LIBRARY
  // ----------------------------------
  @Query(_returns => [GameInUserLibrary])
  // @UseMiddleware(isUserAuthenticated) // https://typegraphql.com/docs/0.16.0/middlewares.html#attaching-middlewares
  async getLibraryIds(
    @Ctx() { req }: Context,
  ) {
    console.log('Getting library game ids...');
    const { userId } = req.session;
    const library = await GameInUserLibrary.find({ where: { user: userId } });
    // console.log(library);

    return library;
  }

  // ----------------------------------
  // GET ALL GAMES IN LIBRARY
  // ----------------------------------
  @Query(_returns => [Game])
  // @UseMiddleware(isUserAuthenticated) // https://typegraphql.com/docs/0.16.0/middlewares.html#attaching-middlewares
  async getLibrary(
    @Ctx() { req }: Context,
  ) {
    console.log('======================================================');
    console.log('Getting library...\n------------------------------------------------------');
    const { userId } = req.session;
    console.log('USER ID: ', userId);

    const libraryItems = await GameInUserLibrary.find({ where: { user: userId } });
    const onlyIds = libraryItems.map(item => item.igdb_game_id);
    console.log('onlyids:', onlyIds, typeof onlyIds, 'length: ', onlyIds.length);

    if (onlyIds.length === 0) return;

    const library = await this.gameService.findGamesInIGDB('', onlyIds, 30);
    console.log('library response (only names)', library.map(game => game.name));
    return library;
  }
}