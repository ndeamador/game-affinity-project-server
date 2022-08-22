import { Service } from 'typedi';
import { Rating } from '../../types';
import GameInUserLibrary from './typeDef';
import User from '../users/typeDef';
import { RankingElement } from '../minorEntities/typeDef';


@Service()
export class GameInUserLibraryService {

  async create(userId: number, gameId: number, rating?: Rating): Promise<GameInUserLibrary> {
    console.log(`\nAdding game to library (id: ${gameId} - rating: ${rating})...\n------------------------------------------------`);

    try {
      const foundUser = await User.findOneOrFail({ where: { id: userId } });

      const gameInLibrary = new GameInUserLibrary();
      gameInLibrary.user = foundUser;
      gameInLibrary.igdb_game_id = gameId;

      if (rating || rating === 0) gameInLibrary.rating = rating; // rating === 0 workaround to prevent that "thumbs-down" ratings are passed as !rating.
      const savedGameInLibrary = await gameInLibrary.save();

      console.log('Game saved to library: \n', savedGameInLibrary);
      return savedGameInLibrary;
    }
    catch (err) {
      throw new Error(`Failed to add game to library: ${err}`);
    }
  }


  async updateRating(userId: number, igdb_game_id: number, rating: Rating, subrating: number): Promise<GameInUserLibrary> {
    console.log(`\nUpdating rating (igdb_game_id: ${igdb_game_id} || subrating: ${subrating})...\n------------------------------------------------`);

    try {
      // BaseEntity.update({id}, {values to update})
      const updateResponse = await GameInUserLibrary.update({ igdb_game_id: igdb_game_id, user: { id: userId } }, { rating: rating, subrating: subrating });

      if (updateResponse.affected === 0) throw Error;
      const updatedGame = await GameInUserLibrary.findOne({ igdb_game_id: igdb_game_id, user: { id: userId } });
      if (!updatedGame) throw Error;
      return updatedGame;
    }
    catch (err) {
      console.log(`Failed to update rating: ${err}`);
      throw new Error(`Failed to update rating.`);
    }
  }


  async delete(userId: number, igdb_game_id: number): Promise<number> {
    console.log(`\nRemoving game (id: ${igdb_game_id} from library...\n------------------------------------------------`);

    try {
      const gameToDelete = await GameInUserLibrary.findOne({ igdb_game_id: igdb_game_id, user: { id: userId } });
      if (!gameToDelete) return 0;
      const response = await GameInUserLibrary.delete({ igdb_game_id: igdb_game_id, user: { id: userId } });

      return response.affected === 1 ? gameToDelete.id : 0;
    }
    catch (err) {
      throw new Error(`Failed to delete game.`);
    }
  }


  async getAverageRatings(): Promise<[RankingElement]> {
    console.log('\nGetting all Average Ratings...\n------------------------------------------------------');
    try {
      /*
      Target SQL query:
            SELECT igdb_game_id,
                ROUND(AVG(rating),1) AS average_rating
            FROM game_in_user_library
            WHERE rating > 0
            GROUP BY igdb_game_id
            ORDER BY average_rating DESC
      */

      const averageRatings = await GameInUserLibrary
        .createQueryBuilder('gameInUserLibrary')
        .select(['igdb_game_id', 'ROUND(AVG(rating), 1)::real AS average_rating']) // added ::real to counter the JS-incompatible DB numeric type (bigint?) getting casted into a string.
        // .where('rating IS NOT NULL')
        .where('rating > 0')
        .groupBy('igdb_game_id')
        .orderBy('average_rating', 'DESC')
        .getRawMany()

      if (!averageRatings) throw Error;
      return averageRatings as [RankingElement];
    }
    catch (err) {
      console.log(`Failed to get average ratins: ${err}`);
      throw new Error(`Failed to get average ratings.`);
    }
  }


}