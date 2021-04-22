import "reflect-metadata";
import { buildSchema } from 'type-graphql';
import Container from 'typedi';
import { GameResolver } from '../entities/games/resolver';
import { GameInUserLibraryResolver } from '../entities/gamesInUserLibrary/resolver';
import { UserResolver } from '../entities/users/resolver';

const buildApolloSchema = () => buildSchema({
  resolvers: [GameResolver, UserResolver, GameInUserLibraryResolver],
  // validate: false, // validation using class-validator is enabled by default, we can disable it if we want to use a different method.
  dateScalarMode: "timestamp", // Change date format from the default ISO to timestamps (for IGDB database fields)
  container: Container,
  emitSchemaFile: true // allows TypeGraphQL to generate a schema.gql file at build-time
});

export default buildApolloSchema;