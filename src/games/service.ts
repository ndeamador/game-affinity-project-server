import { Service } from 'typedi';
import Game from './typeDef';
import fetch from 'node-fetch';

interface IGDBCredentials {
  access_token: string,
  expires_in: number,
  token_type: string
}

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

  findGamesInIGDB = async (name: string, id: number): Promise<Game[]> => {

    const { access_token } = await this.requestIGDBCredentials();

    let requestBody = `
      fields name, first_release_date, summary;
    `;
    if (name) {
      requestBody += `
        limit 6;
        search "${name}";
      `;
    }
    else if (id) {
      requestBody += `
        where id = ${id};
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

    const games: Game[] = await response.json();

    if (games.length === 0) {
      console.log(`No games found.`);
      return games;
    }

    console.log('GAMES: ', games);

    return games;

  };
}