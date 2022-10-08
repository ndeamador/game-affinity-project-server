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
    console.log(`Arguments:  maxResults -> ${maxResults} || ${ids && ids.length > 1 ? `batch size: ${ids.length} || ids-> ${ids}` : `name-> ${name}`}`);

    if (maxResults < 1) return [];
    if (!name && (!ids || ids.length === 0)) {
      throw new Error('An argument is required.');
    }
    if (maxResults > 100) {
      throw new Error('Too many requests'); // IGDB only allows 4 requests pers second. Just a basic workaroudn to limit requests.
    }

    // Note that 'cover', 'genres', 'platforms', etc. are a different entities with their own endpoint, but we can use IGDB expander feature to query, forinstance, cover.url instead of having to query two different endpoints
    // https://api-docs.igdb.com/#expander
    const generateRequestBody = (name?: string, ids?: number[]): string => {
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
        limit ${Math.max(maxResults, 10)};
        search "${name}";
      `;
      }
      else if (ids) {
        requestBody += `
        where id = (${ids});
      `;
      }
      return requestBody;
    };

    const callAPI = async (requestBody: string) => {

      const response = fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        body: requestBody,
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Client-ID': `${process.env.TWITCH_CLIENT_ID}`
        }
      });
      // console.log('type in callapi', typeof(response))
      return response;
    };

    let games: Game[] = [];
    // Since we are querying several endpoints (game, platform, genre...) from IGDB, it's considered a 'multi-query' and the request is limited to 10 results
    // We make several requests in batches of 10 as a workaround
    // https://api-docs.igdb.com/#multi-query
    if (ids && maxResults > 10) {
      const splitInGroupsOfN = async (n: number, data: any[]): Promise<any> => {
        const promises: Promise<any>[] = [];

        for (let i = 0; i < data.length; i += n) {
          const currentIdBatch = data.slice(i, i + n)
          promises.push(callAPI(generateRequestBody(undefined, currentIdBatch)));
        }

        return Promise.all(promises);
      };

      const allApiResponses: object[] = await splitInGroupsOfN(10, ids);

      const parsedBatches = await Promise.all(
        allApiResponses.map(async (response: any) => {
          if (!response.ok) throw new Error(`Unable to retrieve games from IGDB.`);
          const parsedBatch = await response.json() as Game[];
          return parsedBatch;
        })
      );

      const mergedResponses: Game[] = [];
      parsedBatches.forEach(elem => mergedResponses.push(...elem));

      // console.log('multiple responses', mergedResponses.map(elem => elem.name));
      games = mergedResponses;
    }
    else {
      const requestBody = generateRequestBody(name, ids);
      const response = await callAPI(requestBody);

      // const response = await fetch('https://api.igdb.com/v4/games', {
      //   method: 'POST',
      //   body: requestBody,
      //   headers: {
      //     'Authorization': `Bearer ${access_token}`,
      //     'Client-ID': `${process.env.TWITCH_CLIENT_ID}`
      //   }
      // });


      if (!response.ok) {
        const responseError = await response.json() as IGDBGameQueryError[];
        console.log(`Error retrieving games from IGDB:`);
        console.log(responseError);

        throw new Error(`Unable to retrieve games from IGDB.`);
      }

      games = await response.json() as Game[];
    }

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

    return slicedGames;
  };


  async getRankedGames(igdb_access_token: string): Promise<Game[]> {
    console.log('\nGetting Ranked Games...\n------------------------------------------------------');
    try {
      const averageRatings = await this.gameInUserLibraryService.getAverageRatings();
      const gamesIdsToFetch = averageRatings.filter(game => game.average_rating > 0).map(game => game.igdb_game_id);

      if (gamesIdsToFetch.length == 0) return [];

      const fetchedGames = await this.findGamesInIGDB(igdb_access_token, undefined, gamesIdsToFetch, 100);

      const gamesWithAverageRatings: Game[] = fetchedGames.map(game => {
        const averageRatingsInfo = averageRatings.find(rating => rating.igdb_game_id === game.id);

        const gameWithyAvgRatingInfo = {
          ...game,
          average_rating: averageRatingsInfo?.average_rating,
          number_of_ratings: averageRatingsInfo?.number_of_ratings
        } as Game;

        return gameWithyAvgRatingInfo;
      }).sort((a, b) => a.average_rating < b.average_rating ? 1 : -1);

      return gamesWithAverageRatings;
    }
    catch (err) {
      console.log(`Failed to fetch ranking: ${err}`);
      throw new Error(`Failed to fetch ranking.`);
    }
  }
}