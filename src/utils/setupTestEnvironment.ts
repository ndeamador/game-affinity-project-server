/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/unbound-method */
import 'dotenv/config';
import { ApolloServer } from 'apollo-server-express';
import connectToDatabase from '../database/createConnection';
import buildApolloSchema from './buildApolloSchema';
import { createTestClient } from 'apollo-server-testing';
import { requestIGDBCredentials } from './fetchIGDBCredentials';


// let server: any, query: any, mutate: any;
let server: ApolloServer;
let query: any;
let mutate: any;

export { server, query, mutate };

const setupTestEnvironment = async () => {
  const access_token = await requestIGDBCredentials();

  await connectToDatabase();
  const schema = await buildApolloSchema();

  if (schema) {
    const server = new ApolloServer({
      schema,
      context: ({ req, res }) => ({
        req: {
          ...req,
          session: {
            userId: '1',
            cookie: {
              path: '/',
              // _expires: 2031-04-19T02:41:56.059Z,
              // originalMaxAge: 315360000000,
              httpOnly: true,
              secure: false,
              sameSite: 'lax'
            }
          }
        },
        res,
        igdb_access_token: access_token,
      }),
    });

    const testClient = createTestClient(server);
    query = testClient.query;
    mutate = testClient.mutate;
  }
  else {
    throw new Error('Failed to create test client (missing schema).');
  }
};

export default setupTestEnvironment;

