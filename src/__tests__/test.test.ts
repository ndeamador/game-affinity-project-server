/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import "reflect-metadata";
import setupTestEnvironment, { query, mutate } from '../utils/setupTestEnvironment';
import { getConnection } from 'typeorm';

describe("User Resolvers", () => {

  beforeAll(setupTestEnvironment);

  afterAll(async () => {
    const connection = getConnection();
    await connection.close();
  });

  it('Me query returns a response', async () => {

    const meQuery = `
      query {
        me {
          id
          email
          gamesInLibrary {
            igdb_game_id
            rating
          }
        }
      }
    `;

    const response = await query({ query: meQuery, variables: {} });
    console.log('ME RESPONSE: ', await response);
    expect(response.data).toBeDefined();

  });

  describe('Register Mutation', () => {

    it('returns new registered user', async () => {

      const registerMutation = `
        mutation registerUser($email:String!, $password:String!) {
          registerNewUser(email:$email, password:$password) {
            id
            email
          }
        }
      `;

      const response = await mutate({
        query: registerMutation, variables: {
          email: 'testing@test.com',
          password: 'testtest'
        }
      });
      console.log('REGISTER RESPONSE: ', await response);

      expect(response.data).toMatchObject({
        registerNewUser: { email: 'testing@test.com' }
      },);

    });

  });

});