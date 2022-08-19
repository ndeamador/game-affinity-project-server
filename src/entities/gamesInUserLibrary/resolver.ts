import { Arg, Ctx, ID, Int, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { Service } from 'typedi';
import GameInUserLibrary from './typeDef';
import { Context, Rating } from '../../types';
import { isUserAuthenticated } from '../../middleware/isUserAuthenticated';
import { RankingElement } from '../minorEntities/typeDef';
import { GameInUserLibraryService } from './service';

@Service()
@Resolver(_of => GameInUserLibrary)
export class GameInUserLibraryResolver {

  constructor(private readonly gameInUserLibraryService: GameInUserLibraryService) { }

  // ----------------------------------
  // ADD GAME TO LIBRARY
  // ----------------------------------
  @Mutation(_returns => GameInUserLibrary)
  @UseMiddleware(isUserAuthenticated) // https://typegraphql.com/docs/0.16.0/middlewares.html#attaching-middlewares
  async addGameToLibrary(
    @Ctx() { req }: Context,
    @Arg('gameId', _type => Int) gameId: number,
    @Arg('rating', _type => Int, { nullable: true }) rating: Rating
  ) {
    const { userId } = req.session;
    if (!userId) throw Error;
    return this.gameInUserLibraryService.create(userId, gameId, rating);
  }


  // ==================================
  // Update rating
  // ==================================
  @Mutation(_returns => GameInUserLibrary) // For the version that returns the updated object
  @UseMiddleware(isUserAuthenticated)
  async updateRating(
    @Ctx() { req }: Context,
    @Arg('igdb_game_id', _type => Int) igdb_game_id: number,
    @Arg('rating', _type => Int, { nullable: true }) rating: Rating,
    @Arg('subrating', _type => Int, { nullable: true }) subrating: number,
  ) {
    const { userId } = req.session;
    if (!userId) throw Error;
    return this.gameInUserLibraryService.updateRating(userId, igdb_game_id, rating, subrating);
  }


  // ----------------------------------
  // REMOVE GAME FROM LIBRARY
  // ----------------------------------
  @Mutation(_returns => ID)
  @UseMiddleware(isUserAuthenticated) // https://typegraphql.com/docs/0.16.0/middlewares.html#attaching-middlewares
  async removeGameFromLibrary(
    @Ctx() { req }: Context,
    @Arg('igdb_game_id', _type => Int) igdb_game_id: number
  ) {
    const { userId } = req.session;
    if (!userId) throw Error;
    return this.gameInUserLibraryService.delete(userId, igdb_game_id)
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

    return library;
  }

  // // ----------------------------------
  // // GET ALL GAMES IN LIBRARY
  // // ----------------------------------
  // @Query(_returns => [Game])
  // // @UseMiddleware(isUserAuthenticated) // https://typegraphql.com/docs/0.16.0/middlewares.html#attaching-middlewares
  // async getLibrary(
  //   @Ctx() { req, igdb_access_token }: Context,
  // ) {
  //   console.log('======================================================');
  //   console.log('\nGetting library...\n------------------------------------------------------');
  //   const { userId } = req.session;
  //   console.log('USER ID: ', userId);

  //   const libraryItems = await GameInUserLibrary.find({ where: { user: userId } });
  //   // console.log('libraryitems: ', libraryItems);
  //   const onlyIds: number[] = libraryItems.map(item => item.igdb_game_id);
  //   // console.log('onlyids:', onlyIds, typeof onlyIds, 'length: ', onlyIds.length);

  //   if (onlyIds.length === 0) return [];

  //   const library = await this.gameService.findGamesInIGDB(igdb_access_token, '', onlyIds, 30);
  //   // console.log('library response (only names)', library.map(game => game.name));
  //   return library;
  // }


  // ----------------------------------
  // GET RANKED GAMES (All users)
  // ----------------------------------
  @Query(_returns => [RankingElement])
  async getAverageRatings() {
    return this.gameInUserLibraryService.getAverageRatings()
  }
}