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
}