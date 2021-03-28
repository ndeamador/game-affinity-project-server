import 'reflect-metadata'; // Required for TypeGraphQL and TypeORM
import 'dotenv/config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import connectToDatabase from './database/createConnection';
import { Container } from 'typedi'; // required for TypeGraphQL's dependency injection (Services won't be injected in resolvers without it)
import cors from 'cors'; // to allow client and server to run in different ports during development.

// Resolvers
import { GameResolver } from './games/resolver';
import { UserResolver } from './users/resolver';

// For sessions
import redis, { RedisClient } from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { COOKIE_NAME } from './constants';


// We wrap our code in a main() function to be able to use async/await (used in TypeGraphQL's buildSchema)
const main = async (): Promise<void> => {

  connectToDatabase()
    .catch(err => console.log(err));

  const app = express();

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true
    })
  );

  // Redis for sessions
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

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
        httpOnly: true, // Prevents JS in the frontend from accessing the cookie.
        secure: app.get('env') === 'production' ? true : false, // Cookie only works in https
        sameSite: 'lax',
      },
      saveUninitialized: false, // Prevents that empty sessions are created.
      secret: process.env.SESSION_SECRET,
      resave: false, // False to prevent constant pinging to Redis
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [GameResolver, UserResolver],
      // validate: false, // validation using class-validator is enabled by default, we can disable it if we want to use a different method.
      dateScalarMode: "timestamp", // Change date format from the default ISO to timestamps (for IGDB database fields)
      container: Container,
      emitSchemaFile: true // allows TypeGraphQL to generate a schema.gql file at build-time
    }),
    // Context is an object accessible by all resolvers.
    context: ({ req, res }) => ({
      req, // Express middleware-specific context field: https://www.apollographql.com/docs/apollo-server/api/apollo-server/#middleware-specific-context-fields
      res // Express middleware-specific context field: https://www.apollographql.com/docs/apollo-server/api/apollo-server/#middleware-specific-context-fields
    }),
    // mocks: true,
  });

  // Initialize Apollo Server (with applyMiddleWare for Express integration) https://www.apollographql.com/docs/apollo-server/integrations/middleware/#applying-middleware
  // This creates a GraphQL endpoint on Express, which we can access trhough localhost:PORT/graphql
  apolloServer.applyMiddleware({
    app,
    // cors: { origin: 'http://localhost:3000' }
    cors: { origin: false }
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

