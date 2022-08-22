:construction::construction::construction::construction: Work in Progress :construction::construction::construction::construction:

<br>


[View client repository](https://github.com/ndeamador/game-affinity-project-client)

<br>

If running locally on a Windows system, you will need to run a Redis instance on a Docker container.
The easiest way to do this is to install Docker and run the command:
```
docker run --name redis -p 6379:6379 -d redis
```

<br>

## NPM COMMANDS
### Start the program in production environment
---
```
npm start
```
> Requires the test database specified in the environmental variable `POSTGRES_DB` to be created beforehand.

> Requires a Redis store to be running.

> Runs the compiled `.js` files in folder `/build`

<br>

### Start the program in development environment
---
```
npm run dev
```
> Requires the test database specified in the environmental variable `POSTGRES_DEV_DB` to be created beforehand.

> Requires a Redis store to be running.

> Runs the compiled `.js` files in folder `/build`

<br>

### Start the program in test environment
---
```
npm run start:test
```
> Requires the test database specified in the environmental variable `POSTGRES_TEST_DB` to be created beforehand.

> Redis session is mocked in `/src/utils/setupTestEnvironment.ts`

> Runs the compiled `.js` files in folder `/build`

<br>

### Compile TypeScript code
---
```
npm run tsc
```
> Compiles files to folder `/build`

<br>

### Enable hot reloading
---
```
npm run watch
```
> Runs tsc on watch mode, automatically compiling the project when changes to code are detected.

> Run in in a separate window alongside `npm run dev`. Could use `ts-node` instead, but it is slower.

<br>

### Build
---
```
npm run build
```
> Deletes the current `/build` folder and then compiles just like above.

<br>

### Lint
---
```
npm run lint
```
<br>

### Run tests
---
```
npm test
```
> Requires that the application is running on the test environment (`npm run start:test`).

<br><br><br>

## ENVIRONMENTAL VARIABLES
```yaml
# Twitch credentials to use the IGDB API
# https://api-docs.igdb.com/#account-creation
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=

# Postgres database variables
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
POSTGRES_DEV_DB=
POSTGRES_TEST_DB=
POSTGRES_PORT= # 5432
POSTGRES_HOST_DEV= # localhost
POSTGRES_HOST_PROD= # In my case, the name of the postgres service in docker-compose.

# express-session secret to be used alongside connect-redis
SESSION_SECRET=
# Redis password (only used in production by docker-compose)
REDIS_PASSWORD=

# Socket address of our frontend (for instance, http://localhost:3000)
CORS_ORIGIN=
```

> Note that if you use different user/password for postgres in your local machine and in production, you will need to either add extra variables here and in `.env` and `src/database/createConnection.ts` or specify a different user and/or password when running a script through the command line. For instance:

```
POSTGRES_PASSWORD=yourlocalpassword npm run start:test
```

### Github environmental variables
The GitHub Actions pipeline includes the optional pipeline of deploying a Docker image to Docker Hub, for which the following secrets must be set up in the GitHub repository:
`DOCKERHUB_USERNAME`
`DOCKERHUB_TOKEN`

In order for the pipeline to publish to Docker Hub, the text `#dockerhub-push` must be included in the title of the merge request with the main branch.

## MISC
* To generate a new migration file after making changes in the TypeORM schemas, the command `npx typeorm migration:generate -n initial --pretty` can be run.