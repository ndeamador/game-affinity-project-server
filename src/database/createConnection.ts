import { createConnection, ConnectionOptions } from 'typeorm';

const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POSTGRES_DEV_DB,
  POSTGRES_TEST_DB,
  POSTGRES_PORT,
  POSTGRES_HOST_DEV,
  POSTGRES_HOST_PROD,
  NODE_ENV,
} = process.env;

const connectionOptions: ConnectionOptions = {
  type: 'postgres',
  host: NODE_ENV === 'production' ? POSTGRES_HOST_PROD : POSTGRES_HOST_DEV,
  port: Number(POSTGRES_PORT),
  username: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: NODE_ENV === 'production' ? POSTGRES_DB : NODE_ENV === 'development' ? POSTGRES_DEV_DB : POSTGRES_TEST_DB,
  synchronize: !(NODE_ENV === 'production'), // automatically updates the db tables/generates db schemas when running the application. Shouldn't be used in production.
  migrationsRun: NODE_ENV === 'production',
  dropSchema: NODE_ENV === 'test',
  // url: NODE_ENV === 'production' ? POSTGRES_URL : `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${NODE_ENV === 'development' ? POSTGRES_DEV_DB : POSTGRES_TEST_DB}`,
  logging: false,
  entities: ['build/entities/**/typeDef.js'],
  migrations: ['build/database/migrations/*.js'],
  cli: {
    migrationsDir: 'src/database/migrations/'
  }
};

// console.log(connectionOptions);

// Create connection to our database with TypeORM
const connectToDatabase = async ({ attempts = 1 }): Promise<void> => {
  while (attempts) {
    console.log(`Connecting to database (${attempts} attempts left)...`);
    try {
      await createConnection(connectionOptions);
      console.log('Database successfully initialized');
      break; // Leave the while loop to prevent reconnections if the connection is successful.
    } catch (error) {
      attempts -= 1;
      if (attempts > 0) {
        console.log(`Failed to connect to database: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, attempts > 5 ? 1000 : attempts > 10 ? 2000 : attempts > 20 ? 5000 : 10000));
      }
      else if (attempts === 0) {
        throw new Error(`Unable to connect to database: ${error.message}`);
      }
    }
  }
};

export default connectToDatabase;