import { Arg, Query, Resolver, Mutation, Ctx, Int } from 'type-graphql';
import bcrypt from 'bcrypt';
import User from './typeDef';
import { Service } from 'typedi';
import { Context } from '../../types';
import { COOKIE_NAME } from '../../constants';

@Service() // Seems required even when not using a service in a different file when using "Container" in the creation of the Apollo Server.
@Resolver(_of => User)
export class UserResolver {

  // ----------------------------------
  // REGISTER USER
  // ----------------------------------
  @Mutation(_returns => User)
  async registerNewUser(
    @Arg('email', _type => String, { nullable: false }) email: string,
    @Arg('password', _type => String, { nullable: false }) password: string,
    @Ctx() { req }: Context
  ): Promise<User> {
    console.log('Registering new user...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      const newUser = await User.create({
        email: email.toLowerCase(),
        password: hashedPassword
      }).save();

      // This command sets a cookie for the user in the browswer.
      // We add this here if we want to log the user in automatically after registration (create a session)
      req.session.userId = newUser.id;
      return newUser;
    }
    catch (err) {
      throw new Error(err);
    }
    // const newUser = await User.create({
    //   email,
    //   password: hashedPassword
    // })
    //   .save()
    //   .catch(err => { throw new Error(err); });

    // // This command sets a cookie for the user in the browswer.
    // // We add this here if we want to log the user in automatically after registration (create a session)
    // req.session.userId = newUser.id;

    // return newUser;
  }


  // // ----------------------------------
  // // LOGIN
  // // ----------------------------------
  // @Mutation(_returns => User)
  // async login(
  //   @Arg('email', _type => String, { nullable: false }) email: string,
  //   @Arg('password', _type => String, { nullable: false }) password: string,
  //   @Ctx() { req }: Context
  // ): Promise<User> {
  //   console.log('Logging in...');

  //   const user = await User.findOne({ where: { email: email.toLowerCase() } });
  //   if (!user) {
  //     throw new Error('User not found.');
  //   }

  //   const validPassword = await bcrypt.compare(password, user.password);
  //   if (!validPassword) {
  //     throw new Error('Incorrect password');
  //   }

  //   // remember to set "request.credentials": "include" in GraphQL playground for the queries to work
  //   // this command sets a cookie for the user on the browser.
  //   req.session.userId = user.id;

  //   return user;
  // }


  // ----------------------------------
  // LOGIN
  // ----------------------------------
  @Mutation(_returns => User)
  async login(
    @Arg('email', _type => String, { nullable: false }) email: string,
    @Arg('password', _type => String, { nullable: false }) password: string,
    @Arg('guest', _type => Boolean, { nullable: true }) guest: boolean,
    @Ctx() { req, redis_client }: Context
  ): Promise<User> {
    console.log('Logging in...');
    try {
      // A bit of last minute ducktape to handle guest accounts
      if (guest/* email == 'test-account@gap.com' */) {
        const redisResponse: string[] = await new Promise((resolve, reject) => {
          redis_client.mget(['test_account_limit', 'test_account_current'], (err, data) => {
            if (err) {
              reject(`Failed to get guest account state from Redis: ${err}`);
              // throw new Error(`Failed to get guest account state from Redis: ${err}`);
            }
            resolve(data);
          });
        });
        const guestLimit = parseInt(redisResponse[0]);
        const guestCurrent = parseInt(redisResponse[1]);

        console.log('redis response', guestLimit, guestCurrent);

        if (guestCurrent < guestLimit) {
          await redis_client.set('test_account_current', `${guestCurrent + 1}`);
          email = `guest-account-${guestCurrent + 1}@gap.com`;
        }
        else {
          await redis_client.set('test_account_current', '0');
          email = `guest-account-0@gap.com`;
        }
      }


      const user = await User.findOne({ where: { email: email.toLowerCase() } });
      if (!user) {
        throw new Error('User not found.');
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new Error('Incorrect password');
      }

      // remember to set "request.credentials": "include" in GraphQL playground for the queries to work
      // this command sets a cookie for the user on the browser.
      req.session.userId = user.id;

      return user;
    }
    catch (err) {
      throw new Error(`Failed to login: ${err}`);

    }

  }


  // ----------------------------------
  // ME QUERY
  // ----------------------------------
  @Query(_returns => User, { nullable: true }) // if the user is not logged in, return null
  async me(
    @Ctx() { req }: Context
  ) {
    console.log('In me query');
    // console.log('test req:', req.session);
    console.log('session id: ', req.sessionID);

    if (!req.session.userId) {
      console.log('No session');
      return null;
    }
    console.log('In session');

    try {
      const currentUser = await User.findOne({ where: { id: req.session.userId }, relations: ['gamesInLibrary'] });
      // console.log('currentUser', currentUser);

      // const libraryRepository = getRepository(GameInUserLibrary);
      // const gamesPopulatedWithUser = await libraryRepository.find({ relations: ['user'] });
      // console.log('gamesPopulatedWithUser ===========================\n ', gamesPopulatedWithUser);

      // const userRepository = getRepository(User);
      // const userPopulatedWithGames = await userRepository.find({ relations: ['gamesInLibrary'] });
      // console.log('userswithgamesinside ===========================\n ', userPopulatedWithGames);
      return currentUser;
    }
    catch (err) {
      throw new Error(`Failed to populate user: ${err}`);
    }
  }

  // ----------------------------------
  // LOGOUT
  // ----------------------------------
  @Mutation(_returns => Boolean)
  async logout(
    @Ctx() { req, res }: Context
  ) {
    console.log('Logging out...');
    // Remove the session from Redis (renamed res to res_redis to prevent conflict with the res above):
    return new Promise((res_redis) => {

      req.session.destroy((err) => {
        if (err) {
          console.log(err);
          res_redis(false);
          return;
        }

        // Clear cookie from browser (will be destroyed even if we can't destroy the session in Redis)
        res.clearCookie(COOKIE_NAME);

        res_redis(true);
      });
    });
  }


  // ----------------------------------
  // DELETE USER FROM DATABASE
  // ----------------------------------
  @Mutation(_returns => Boolean)
  async deleteUser(
    @Arg('userId', _type => Int, { nullable: true }) userId: number,
    @Arg('email', _type => String, { nullable: true }) email: string
  ) {
    console.log(`Deleting user...\n------------------------------------------------`);
    if (!userId && !email) throw new Error(`You must provide the user's id or email`);

    try {
      const response = await User.delete(userId ? { id: userId } : { email: email });
      return response.affected === 0 ? false : true;
    }
    catch (err) {
      throw new Error(err);
    }
  }
}