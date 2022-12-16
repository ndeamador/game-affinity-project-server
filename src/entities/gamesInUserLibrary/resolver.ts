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

  // Add Game to Library.
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

  // Update rating.
  // ----------------------------------
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

  // Remove game from library.
  // ----------------------------------
  @Mutation(_returns => ID)
  @UseMiddleware(isUserAuthenticated) // https://typegraphql.com/docs/0.16.0/middlewares.html#attaching-middlewares
  async removeGameFromLibrary(
    @Ctx() { req }: Context,
    @Arg('igdb_game_id', _type => Int) igdb_game_id: number
  ) {
    const { userId } = req.session;
    if (!userId) throw Error;
    return this.gameInUserLibraryService.delete(userId, igdb_game_id);
  }

  // Get IDs of all games in Library.
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

  // Get ranked games (All users).
  // ----------------------------------
  @Query(_returns => [RankingElement])
  async getAverageRatings() {
    return this.gameInUserLibraryService.getAverageRatings();
  }
}
