import { Arg, Ctx, ID, Int, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { Service } from 'typedi';
import GameInUserLibrary from './typeDef';
import { Context, Rating } from '../../types';
import { isUserAuthenticated } from '../../middleware/isUserAuthenticated';
import User from '../users/typeDef';
import { GameService } from '../games/service';
import Game from '../games/typeDef';
import { RankingElement } from '../minorEntities/typeDef';
import { GameInUserLibraryService } from './service';

@Service()
@Resolver(_of => GameInUserLibrary)
export class GameInUserLibraryResolver {
  // Using service of Game in GameInUserLibrary, check if it's safe to do so.
  // constructor(private readonly gameService: GameService) { }


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
    // console.log(`\nAdding game to library (id: ${gameId} - rating: ${rating})...\n------------------------------------------------`);

    // try {
    //   const { userId } = req.session;

    //   const foundUser = await User.findOneOrFail({ where: { id: userId } });

    //   const gameInLibrary = new GameInUserLibrary();
    //   gameInLibrary.user = foundUser;
    //   gameInLibrary.igdb_game_id = gameId;
    //   // console.log('founduser: ', foundUser);
    //   // console.log('gameInLibrary: ', gameInLibrary);


    //   if (rating) gameInLibrary.rating = rating;
    //   // gameInLibrary.rating = rating;


    //   // const savedGameInLibrary = await getConnection().manager.save(gameInLibrary);
    //   const savedGameInLibrary = await gameInLibrary.save();

    //   // console.log('Game saved to library: ', savedGameInLibrary.igdb_game_id);
    //   console.log('Game saved to library: \n', savedGameInLibrary);


    //   return savedGameInLibrary;
    // }
    // catch (err) {
    //   throw new Error(`Failed to add game to library: ${err}`);
    // }

    const { userId } = req.session;
    if (!userId) throw Error;
    return this.gameInUserLibraryService.create(userId, gameId, rating)
  }


  // ==================================
  // Update rating
  // ==================================
  // @Mutation(_returns => Boolean) // For the version that does not return the updated object
  @Mutation(_returns => GameInUserLibrary) // For the version that returns the updated object
  @UseMiddleware(isUserAuthenticated)
  async updateRating(
    @Ctx() { req }: Context,
    @Arg('igdb_game_id', _type => Int) igdb_game_id: number,
    @Arg('rating', _type => Int, { nullable: true }) rating: Rating,
  ) {

    console.log(`\nUpdating rating (igdb_game_id: ${igdb_game_id})...\n------------------------------------------------`);
    // console.log('updating, game rating', igdb_game_id, rating);

    try {
      const { userId } = req.session;

      // const gameInLibrary = await GameInUserLibrary.findOne({ igdb_game_id: igdb_game_id, user: { id: userId } });
      // console.log('UPDATED GAME: ', gameInLibrary);

      // // Temporary upsert workaround.
      // if (!gameInLibrary) {

      //   const foundUser = await User.findOneOrFail({ where: { id: userId } });

      //   const gameInLibrary = new GameInUserLibrary();
      //   console.log('is this async?', gameInLibrary);
      //   gameInLibrary.user = foundUser;
      //   gameInLibrary.igdb_game_id = igdb_game_id;
      //   gameInLibrary.rating = rating;

      //   const savedGameInLibrary = await gameInLibrary.save();
      //   console.log('savedgame:', savedGameInLibrary);
      //   return savedGameInLibrary;
      // }

      const updateResponse = await GameInUserLibrary.update({ igdb_game_id: igdb_game_id, user: { id: userId } }, { rating: rating });
      console.log('Update response: ', updateResponse);
      if (updateResponse.affected === 0) throw Error;
      // if (savedGameInLibrary.affected === 0) throw Error;
      const updatedGame = await GameInUserLibrary.findOne({ igdb_game_id: igdb_game_id, user: { id: userId } });
      console.log('updated game: ', updatedGame || 'fail');
      return updatedGame;
      // return savedGameInLibrary.affected === 1 ? true : false; // return only success/failure
    }
    catch (err) {
      console.log(`Failed to update rating: ${err}`);
      throw new Error(`Failed to update rating.`);
    }
  }


  // ----------------------------------
  // REMOVE GAME FROM LIBRARY
  // ----------------------------------
  // @Mutation(_returns => Boolean)
  @Mutation(_returns => ID)
  @UseMiddleware(isUserAuthenticated) // https://typegraphql.com/docs/0.16.0/middlewares.html#attaching-middlewares
  async removeGameFromLibrary(
    @Ctx() { req }: Context,
    @Arg('igdb_game_id', _type => Int) igdb_game_id: number
  ) {
    console.log(`\nRemoving game (id: ${igdb_game_id} from library...\n------------------------------------------------`);
    const { userId } = req.session;

    const gameToDelete = await GameInUserLibrary.findOne({ igdb_game_id: igdb_game_id, user: { id: userId } });
    console.log('find game before deletion: ', gameToDelete);

    if (!gameToDelete) return 0;

    // const response = await GameInUserLibrary.delete({ igdb_game_id: igdb_game_id, user: { id: userId } });
    const response = await GameInUserLibrary.delete({ igdb_game_id: igdb_game_id, user: { id: userId } });

    // TEMP
    console.log('delete response: ', response); // TEMP
    // const updatedGame = await GameInUserLibrary.findOne({ igdb_game_id: igdb_game_id, user: { id: userId }});
    // console.log('TRY GAME: ', updatedGame);

    return response.affected === 1 ? gameToDelete.id : 0;
    // return response.affected === 0 ? false : true;
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
  async getRanking() {
    console.log('======================================================');
    console.log('\nGetting all Average Ratings...\n------------------------------------------------------');
    try {
      /*
      Target SQL query:
            SELECT igdb_game_id,
                ROUND(AVG(rating),1) AS average_rating
            FROM game_in_user_library
            WHERE rating IS NOT NULL
            GROUP BY igdb_game_id;
            ORDER BY average_rating DESC
      */

      const averageRatings = await GameInUserLibrary
        .createQueryBuilder('gameInUserLibrary')
        .select(['igdb_game_id', 'ROUND(AVG(rating), 1) AS average_rating'])
        .where('rating IS NOT NULL')
        .groupBy('igdb_game_id')
        .orderBy('average_rating', 'DESC')
        .getRawMany()

      console.log('grouped:', averageRatings);

      return averageRatings;
    }
    catch (err) {
      console.log(`Failed to get average ratins: ${err}`);
      throw new Error(`Failed to get average ratins.`);
    }
  }
}