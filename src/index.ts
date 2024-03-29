import 'reflect-metadata'; // Required for TypeGraphQL and TypeORM
import 'dotenv/config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import connectToDatabase from './database/createConnection';
import cors from 'cors'; // to allow client and server to run in different ports during development.
// import { getConnection } from 'typeorm';

// Redis/sessions
import redis/* , { RedisClient } */ from 'redis';
import connectRedis from 'connect-redis';
import session from 'express-session'; // required by connect-redis
import { COOKIE_NAME, GUEST_ACCOUNTS_LIMIT } from './constants';

// IGDB API
import requestIGDBCredentialsOrRetry from './utils/fetchIGDBCredentials';
import { IGDBCredentials } from './types';

// TESTING
import testingRouter from './controllers/testing';
import createApolloSchema from './utils/buildApolloSchema';

// We wrap our code in a main() function to be able to use async/await (used in TypeGraphQL's buildSchema)
const main = async (): Promise<void> => {

  await connectToDatabase({ attempts: 10 })
    .catch(err => console.log(err));

  // await getConnection().runMigrations(); // Only run migrations that have not been run yet.


  const app = express();

  // Initialize redis sessions server
  const redisConfig = app.get('env') === 'production' ? { host: 'redis' } : undefined; // Change host from default to the name of the docker service (redis) when in production
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient(redisConfig); // This would take the connection parameters, but we leave the default values: https://redislabs.com/lp/node-js-redis/
  redisClient.on('error', (err) => { console.log('Redis Client Error', err); throw new Error(`Redis Client Error: ${err}`) });
  redisClient.set('test_account_limit', `${GUEST_ACCOUNTS_LIMIT}`);
  redisClient.set('test_account_current', '0');

  // Tell express that we have a proxy in front of our app so that sessions work when using Nginx: http://expressjs.com/en/guide/behind-proxies.html#express-behind-proxies
  if (app.get('env') === 'production') app.set("trust proxy", 1);

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redisClient,
        disableTTL: true, // TTL: time to live, how long the session is active, if we wan't our sessions to be active permanently until manually disabled.
        disableTouch: true, // Prevent that the TTL is reset every time a user interacts with the server.
      }),
      cookie: { // Hover properties for descriptions.
        maxAge: 10 * 365 * 24 * 60 * 60 * 1000, // How long in miliseconds until the cookie expires (10 years)
        httpOnly: app.get('env') === 'production', // Prevents JS in the frontend from accessing the cookie.
        secure: app.get('env') === 'production', // Cookie only works in https
        // domain: app.get('env') === 'production' ? 'gap-server.nicodeamador.com' : undefined,
        sameSite: 'lax',
      },
      saveUninitialized: false, // Prevents that empty sessions are created.
      secret: `${process.env.SESSION_SECRET}`,
      resave: false, // False to prevent constant pinging to Redis
    })
  );




  // Fetch and refresh IGDB access-token
  let access_token: string;

  const fetchAndRefreshIgdbToken = async () => {
    try {
      const { access_token: refreshedToken, expires_in } = await requestIGDBCredentialsOrRetry() as IGDBCredentials;
      access_token = refreshedToken;
      console.log('IGDB Token fetched.|| Expires in', (expires_in / 1000 / 60).toFixed(1), 'minutes.');

      return new Promise(resolve => setTimeout(() => {
        resolve(fetchAndRefreshIgdbToken());
      }, expires_in - 60000)); // refresh 10 minutes ahead of token expiry
    }
    catch (err) { throw new Error(err); }
  };

  void fetchAndRefreshIgdbToken();




  // Define Apollo GraphQL server
  const apolloServer = new ApolloServer({
    schema: await createApolloSchema(),
    // Context is an object accessible by all resolvers.
    context: ({ req, res }) => ({
      req, // Express middleware-specific context field: https://www.apollographql.com/docs/apollo-server/api/apollo-server/#middleware-specific-context-fields
      res, // Express middleware-specific context field: https://www.apollographql.com/docs/apollo-server/api/apollo-server/#middleware-specific-context-fields
      igdb_access_token: access_token,
      redis_client: redisClient,
    }),
    // mocks: true,
  });


  // Testing conditional endpoint
  if (process.env.NODE_ENV === 'test') {
    app.use('/api/testing', testingRouter);
    console.log('Added testing endpoint');
  }

  app.use('/api/ping', express.Router().get('/', (_request, response) => {
    response.status(200).send('pong');
  }));



  // Initialize Apollo Server (with applyMiddleWare for Express integration) https://www.apollographql.com/docs/apollo-server/integrations/middleware/#applying-middleware
  // This creates a GraphQL endpoint on Express, which we can access trhough localhost:PORT/graphql
  apolloServer.applyMiddleware({
    app,
    // cors: { origin: 'http://localhost:3000' }
    cors: false // We use the actual cors package above instead of this built in Apollo implementation.
  });


  const PORT = process.env.PORT;

  app.listen(PORT || 4000, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

main()
  .catch((err) => {
    console.log(err);
  });

