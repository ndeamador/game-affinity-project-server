import { Service } from 'typedi';
import Game from './typeDef';
import fetch from 'node-fetch';
import { IGDBGameQueryError } from '../../types';
import { GameInUserLibraryService } from '../gamesInUserLibrary/service';


@Service()
export class GameService {

  constructor(private readonly gameInUserLibraryService: GameInUserLibraryService) { }

  findGamesInIGDB = async (access_token: string, name?: string, ids?: number[], maxResults = 6): Promise<Game[]> => {
    console.log('======================================================');
    console.log('Finding games in IGDB...\n------------------------------------------------------');
    console.log(`Arguments: name-> ${name}, ids-> ${ids}, maxResults -> ${maxResults}`);

    // This is already checked by the resolver:
    // if (maxResults < 1) return [];
    // if (!name && (!id || id.length === 0)) {
    //   throw new Error('An argument is required.');
    // }

    if (!name && (!ids || ids.length === 0)) {
      throw new Error('An argument is required.');
    }


    // Note that 'cover', 'genres', 'platforms', etc. are a different entities with their own endpoint, but we can use IGDB expander feature to query, forinstance, cover.url instead of having to query two different endpoints
    // https://api-docs.igdb.com/#expander
    let requestBody = `
      fields
        total_rating_count,
        name,
        first_release_date,
        summary,
        cover.image_id,
        platforms.id,
        platforms.name,
        platforms.platform_family,
        platforms.category,
        genres.id,
        genres.name,
        involved_companies.id,
        involved_companies.company.name,
        involved_companies.developer;
      `;
    if (name) {
      requestBody += `
        limit ${Math.max(maxResults, 20)};
        search "${name}";
      `;
    }
    else if (ids) {
      requestBody += `
        where id = (${ids});
      `;
    }

    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      body: requestBody,
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Client-ID': `${process.env.TWITCH_CLIENT_ID}`
      }
    });


    if (!response.ok) {
      const responseError = await response.json() as IGDBGameQueryError[];
      console.log(`Error retrieving games from IGDB:`);
      console.log(responseError);

      throw new Error(`Unable to retrieve games from IGDB.`);
    }

    const games = await response.json() as Game[];

    if (games.length === 0) {
      console.log(`No games found.`);
      return [];
    }

    const onlyRatedGames = games.filter(game => game.total_rating_count);
    let requiredGames = onlyRatedGames;

    if (onlyRatedGames.length === 0) {
      // if no games have ratings, return the response as is.
      return games;
    }
    else if (onlyRatedGames.length > 0) {
      // sort the games with ratings by number of ratings
      requiredGames.sort((a, b) => b.total_rating_count - a.total_rating_count);

      // If there are not enough rated games to fulfil maxResults, fill the response with unrated games:
      if (requiredGames.length < maxResults) {
        const onlyUnratedGames = games.filter(game => !game.total_rating_count);

        requiredGames = requiredGames.concat(onlyUnratedGames.slice(0, maxResults - requiredGames.length));
      }
    }


    // limit response size to maxResults
    const slicedGames = requiredGames.slice(0, maxResults);
    console.log('\nGames sent: ', slicedGames.length, slicedGames.map(game => `${game.name} - ${game.total_rating_count}`));

    return slicedGames;
  };


  async getRankedGames(igdb_access_token: string): Promise<Game[]> {
    console.log('\nGetting Ranked Games...\n------------------------------------------------------');
    try {
      const averageRatings = await this.gameInUserLibraryService.getAverageRatings();
      const gamesIdsToFetch = averageRatings.filter(game => game.average_rating > 0).map(game => game.igdb_game_id)
      const fetchedGames = await this.findGamesInIGDB(igdb_access_token, undefined, gamesIdsToFetch, 30)

      const gamesWithAverageRatings: Game[] = fetchedGames.map(game => {
        const average_rating = averageRatings.find(rating => rating.igdb_game_id === game.id)?.average_rating;

        const gameWithyAvgRating = {
          ...game,
          average_rating
        } as Game;

        return gameWithyAvgRating
      }).sort((a, b) => a.average_rating < b.average_rating ? 1 : -1);

      console.log('game', gamesWithAverageRatings.map(game => game.average_rating));

      return gamesWithAverageRatings;
    }
    catch (err) {
      console.log(`Failed to get fetch ranking: ${err}`);
      throw new Error(`Failed to get fetch ranking.`);
    }
  }

}