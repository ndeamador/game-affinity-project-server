import { Service } from 'typedi';
import { Rating } from '../../types';
import Game from './typeDef';
import GameInUserLibrary from './typeDef';
import User from '../users/typeDef';


@Service()
export class GameInUserLibraryService {

  async create(userId: number, gameId: number, rating?: Rating): Promise<GameInUserLibrary> {
    console.log(`\nAdding game to library (id: ${gameId} - rating: ${rating})...\n------------------------------------------------`);

    try {
      const foundUser = await User.findOneOrFail({ where: { id: userId } });

      const gameInLibrary = new GameInUserLibrary();
      gameInLibrary.user = foundUser;
      gameInLibrary.igdb_game_id = gameId;

      if (rating) gameInLibrary.rating = rating;

      const savedGameInLibrary = await gameInLibrary.save();

      console.log('Game saved to library: \n', savedGameInLibrary);

      return savedGameInLibrary;
    }
    catch (err) {
      throw new Error(`Failed to add game to library: ${err}`);
    }
  }


  async updateRating(userId: number, igdb_game_id: number, rating: Rating): Promise<GameInUserLibrary> {
    console.log(`\nUpdating rating (igdb_game_id: ${igdb_game_id})...\n------------------------------------------------`);

    try {

      const updateResponse = await GameInUserLibrary.update({ igdb_game_id: igdb_game_id, user: { id: userId } }, { rating: rating });
      console.log('Update response: ', updateResponse);

      if (updateResponse.affected === 0) throw Error;
      const updatedGame = await GameInUserLibrary.findOne({ igdb_game_id: igdb_game_id, user: { id: userId } });
      // console.log('updated game: ', updatedGame || 'fail');
      if (!updatedGame) throw Error;
      return updatedGame;
    }
    catch (err) {
      console.log(`Failed to update rating: ${err}`);
      throw new Error(`Failed to update rating.`);
    }
  }


}