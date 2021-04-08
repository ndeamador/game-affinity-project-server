import { Service } from 'typedi';
import Game from './typeDef';
import fetch from 'node-fetch';
import { Cover, Genre, Platform } from '../minorEntities/typeDef';

interface IGDBCredentials {
  access_token: string,
  expires_in: number,
  token_type: string
}

// interface IGDBPlatform{
//   id: number,
//   name: string,
// }

// interface IGDBGenre{
//   id: number,
//   name: string,
// }

// interface IGDBCompany{
//   id: number,
//   name: string,
//   country: number,
//   description: string,
//   developed: number[],
//   start_date: Date,
// }

// interface IGDBInvolvedCompany{
//   id: number,
//   company: number,
//   developer: boolean,
//   publisher: boolean,
// }

// interface IGDBGame {
//   id: number,
//   name: string,
//   first_release_date: Date,
//   summary: string,
//   // genres: Genre[],
//   // platforms: Platform[],
//   // involved_companies:,
//   cover: Cover,
// }

@Service()
export class GameService {

  requestIGDBCredentials = async (): Promise<IGDBCredentials> => {
    const response = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`
      , {
        method: 'post',
      });

    if (response.ok) {

      const isCredentials = (uncheckedCredentials: any): uncheckedCredentials is IGDBCredentials => {
        return
      };

      const credentials: IGDBCredentials = await response.json();
      // console.log(credentials);
      return credentials;
    }
    else {
      const errorMessage = `Error: ${response.statusText} (Code: ${response.status})`;
      console.log(errorMessage);
      throw new Error(errorMessage);
    }

  };

  findGamesInIGDB = async (name: string, id: number[], maxResults = 6): Promise<Game[]> => {
    console.log('======================================================');
    console.log('Finding games in IGDB...\n------------------------------------------------------');
    console.log(`Arguments: name-> ${name}, id-> ${id}, maxResults -> ${maxResults}`);

    const { access_token } = await this.requestIGDBCredentials();

    // Note that 'cover' is a different entity with it's own endpoint, but we can use IGDB expander feature to query cover.url instead of having to query two different endpoints
    // https://api-docs.igdb.com/#expander
    let requestBody = `
      fields name, first_release_date, summary, cover.image_id;
    `;
    if (name) {
      requestBody += `
        limit ${maxResults};
        search "${name}";
      `;
    }
    // else if (id) {
    //   requestBody += `
    //     where id = ${id};
    //   `;
    // }
    else if (id) {
      requestBody += `
        where id = (${id});
      `;
    }


    // const requestBody = `
    //   fields name, first_release_date, summary;
    //   limit 10;
    //   search "${name}";
    //   `;

    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      body: requestBody,
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Client-ID': process.env.TWITCH_CLIENT_ID
      }
    });

    if (!response.ok) {
      throw new Error('Unable to retrieve games from IGDB.');
    }

    const games = await response.json() as Game[];

    if (games.length === 0) {
      console.log(`No games found.`);
      return [];
    }

    console.log('GAMES: ', games.map(game => `${game.name}`));
    console.log('FIRST GAME: ', games[0]);


    // const games = unformattedGames.map(game => ({
    //   // id: game.id,
    //   // name: game.name,
    //   // summary: game.summary,
    //   // cover: game.cover,
    //   ...game,
    //   firstReleaseDate: game.first_release_date,
    //   // genres: Genre[],
    //   // platforms: Platform[],
    //   // involved_companies:,
    // }));
    // console.log('UNFORMATTED: ', unformattedGames);
    // console.log('FORMATTED: ', games);

    return games;
  };
}