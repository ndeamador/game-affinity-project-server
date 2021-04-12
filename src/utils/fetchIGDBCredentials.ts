import fetch from 'node-fetch';
import { IGDBCredentials } from '../types';

export const requestIGDBCredentials = async () => {
  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`
    , {
      method: 'post',
    });

  if (response.ok) {
    return response;
  }
  else {
    const errorMessage = `Error: ${response.statusText} (Code: ${response.status})`;
    console.log(errorMessage);
    throw new Error(`Failed to fetch credentials from IGDB: ${errorMessage}`);
  }
};



// A recursive function to keep retrying to fetch IGDB authentication credentials
const requestIGDBCredentialsOrRetry = async (initialDelay = 250, maxDelay = 1000 * 10): Promise<IGDBCredentials | void> => {

  try {
    const response = await requestIGDBCredentials();

    if (response.ok) {
      const parsedResponse = await response.json() as IGDBCredentials;
      return parsedResponse;
    }
    else if (!response.ok) {
      return new Promise(resolve => setTimeout(() => {
        resolve(requestIGDBCredentialsOrRetry(initialDelay <= maxDelay / 2 ? initialDelay * 2 : maxDelay));
      }, initialDelay));
    }
    else {
      // console.log(response);
      throw new Error(`Something went wrong retrying to authenticate in IGDB: ${response}`);
    }
  }
  catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

export default requestIGDBCredentialsOrRetry;