import 'reflect-metadata'; // Required for TypeGraphQL and TypeORM
import 'dotenv/config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import connectToDatabase from './database/createConnection';
import { Container } from 'typedi'; // required for TypeGraphQL's dependency injection (Services won't be injected in resolvers without it)
import cors from 'cors'; // to allow client and server to run in different ports during development.

import { GameResolver } from './games/resolver';
import { UserResolver } from './users/resolver';

// We wrap our code in a main() function to be able to use async/await (used in TypeGraphQL's buildSchema)
const main = async (): Promise<void> => {

  connectToDatabase()
    .catch(err => console.log(err));

  const app = express();

  app.use(cors());

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [GameResolver, UserResolver],
      // validate: false, // validation using class-validator is enabled by default, we can disable it if we want to use a different method.
      dateScalarMode: "timestamp", // Change date format from the default ISO to timestamps (for IGDB database fields)
      container: Container,
      emitSchemaFile: true // allows TypeGraphQL to generate a schema.gql file at build-time
    }),
    // mocks: true,
  });

  // Initialize Apollo Server (with applyMiddleWare for Express integration) https://www.apollographql.com/docs/apollo-server/integrations/middleware/#applying-middleware
  // This creates a GraphQL endpoint on Express, which we can access trhough localhost:PORT/graphql
  apolloServer.applyMiddleware({ app });


  const PORT = process.env.PORT;

  app.listen(PORT || 3000, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

main()
  .catch((err) => {
    console.log(err);
  });

