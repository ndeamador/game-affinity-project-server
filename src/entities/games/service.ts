import { Service } from 'typedi';
import Game from './typeDef';
import fetch from 'node-fetch';
import { IGDBGameQueryError } from '../../types';


@Service()
export class GameService {

  // requestIGDBCredentials = async (): Promise<IGDBCredentials> => {

  //   const response = await fetch(
  //     `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`
  //     , {
  //       method: 'post',
  //     });

  //   if (response.ok) {

  //     const isCredentials = (uncheckedCredentials: any): uncheckedCredentials is IGDBCredentials => {
  //       return
  //     };

  //     const credentials: IGDBCredentials = await response.json();
  //     // console.log(credentials);
  //     return credentials;
  //   }
  //   else {
  //     const errorMessage = `Error: ${response.statusText} (Code: ${response.status})`;
  //     console.log(errorMessage);
  //     throw new Error(errorMessage);
  //   }

  // };

  findGamesInIGDB = async (access_token: string, name: string, id: number[], maxResults = 6): Promise<Game[]> => {
    console.log('======================================================');
    console.log('Finding games in IGDB...\n------------------------------------------------------');
    console.log(`Arguments: name-> ${name}, id-> ${id}, maxResults -> ${maxResults}`);

    // This is already checked by the resolver:
    // if (maxResults < 1) return [];
    // if (!name && (!id || id.length === 0)) {
    //   throw new Error('An argument is required.');
    // }


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
    else if (id) {
      requestBody += `
        where id = (${id});
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



    // console.log('\n\nGames received: ', games.length, games.map(game => `${game.name} - ${game.total_rating_count}`));
    // console.log('\n\nFIRST GAME: ', games[0]);


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
}