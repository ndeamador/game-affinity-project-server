import { Arg, Ctx, Int, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { Service } from 'typedi';
import GameInUserLibrary from './typeDef';
import { Context } from '../types';
import { isUserAuthenticated } from '../middleware/isUserAuthenticated';
import User from '../users/typeDef';


@Service()
@Resolver(_of => GameInUserLibrary)
export class GameInUserLibraryResolver {

  @Query(_returns => String)
  GameInUserLibraryHello() {
    return 'Hello from UserGameResolver!';
  }

  // ----------------------------------
  // ADD GAME TO COLLECTION
  // ----------------------------------
  @Mutation(_returns => GameInUserLibrary)
  @UseMiddleware(isUserAuthenticated) // https://typegraphql.com/docs/0.16.0/middlewares.html#attaching-middlewares
  async addGameToLibrary(
    @Ctx() { req }: Context,
    @Arg('gameId', _type => Int) gameId: number
  ) {
    const { userId } = req.session;
    const foundUser = await User.findOneOrFail({ where: { id: userId } });

    const gameInCollection = new GameInUserLibrary();
    gameInCollection.user = foundUser;
    gameInCollection.igdb_game_id = gameId;

    const savedGameInCollection = await gameInCollection.save();

    console.log('Game saved to collection: ', savedGameInCollection);

    return savedGameInCollection;
  }


  // ----------------------------------
  // REMOVE GAME FROM COLLECTION
  // ----------------------------------
  @Mutation(_returns => GameInUserLibrary)
  @UseMiddleware(isUserAuthenticated) // https://typegraphql.com/docs/0.16.0/middlewares.html#attaching-middlewares
  async removeGameFromLibrary(
    @Ctx() { req }: Context,
    @Arg('gameId', _type => Int) gameId: number
  ) {
    const { userId } = req.session;
    const foundGame = await GameInUserLibrary.findOneOrFail({ where: [{ user: userId }, { igdb_game_id: gameId }] });
    console.log(foundGame);
    // GameInUserLibrary.softRemove()

    return await GameInUserLibrary.remove(foundGame);
  }


  // ----------------------------------
  // GET ALL GAMES IN LIBRARY
  // ----------------------------------
  @Query(_returns => [GameInUserLibrary])
  @UseMiddleware(isUserAuthenticated) // https://typegraphql.com/docs/0.16.0/middlewares.html#attaching-middlewares
  async getLibrary(
    @Ctx() { req }: Context,
  ) {
    const { userId } = req.session;
    const library = await GameInUserLibrary.find({ where: { user: userId } });
    console.log(library);

    return library;
  }
}