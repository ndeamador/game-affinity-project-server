import { createConnection, ConnectionOptions } from 'typeorm';

const {
  DB_USERNAME,
  DB_PASSWORD,
  DB_PROD_DATABASE,
  DB_DEV_DATABASE,
  DB_PORT,
  DB_HOST,
  NODE_ENV
} = process.env;

const connectionOptions: ConnectionOptions = {
  type: 'postgres',
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: NODE_ENV === 'production' ? DB_PROD_DATABASE : DB_DEV_DATABASE,
  synchronize: NODE_ENV === 'production' ? false : true, // automatically updates the db tables/generates db schemas when running the application. Shouldn't be used in production.
  logging: false,
  entities: ['build/entities/**/typeDef.js'],
  migrations: ['build/database/migrations/*.js'],
  cli: {
    migrationsDir: 'src/database/migrations/'
  }
};

// Create connection to our database with TypeORM
// Connection settings are in "ormconfig.js"
const connectToDatabase = async (): Promise<void> => {
  try {
    await createConnection(connectionOptions);
    console.log('Database successfully initialized');
  } catch (error) {
    console.log(`Database failed to connect: ${error.message}`);
  }
};

export default connectToDatabase;