import { Arg, Query, Resolver, Mutation, Ctx, Int } from 'type-graphql';
import bcrypt from 'bcrypt';
import User from './typeDef';
import { Service } from 'typedi';
import { UserLoginDetails } from './registerInput';
import { Context } from '../../types';
import { COOKIE_NAME } from '../../constants';

@Service() // Seems required even when not using a service in a different file when using "Container" in the creation of the Apollo Server.
@Resolver(_of => User)
export class UserResolver {
  @Query(() => String)
  userHello() {
    return 'hi from UserResolver';
  }

  // ----------------------------------
  // REGISTER USER
  // ----------------------------------
  @Mutation(_returns => User)
  async registerNewUser(
    @Arg('loginDetails') { email, password }: UserLoginDetails,
    @Ctx() { req }: Context
  ): Promise<User> {
    console.log('Registering new user...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      email,
      password: hashedPassword
    })
      .save()
      .catch(err => { throw new Error(err); });

    console.log("NEW USER: ", newUser);

    // This command sets a cookie for the user in the browswer.
    // We add this here if we want to log the user in automatically after registration (create a session)
    req.session.userId = newUser.id;

    return newUser;
  }


  // ----------------------------------
  // LOGIN
  // ----------------------------------
  @Mutation(_returns => User)
  async login(
    @Arg('loginDetails') { email, password }: UserLoginDetails,
    @Ctx() { req }: Context
  ): Promise<User> {
    console.log('Logging in...');

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


  // ----------------------------------
  // ME QUERY
  // ----------------------------------
  @Query(_returns => User, { nullable: true }) // if the user is not logged in, return null
  async me(
    @Ctx() { req }: Context
  ) {
    console.log('In me query');
    if (!req.session.userId) {
      console.log('No session');
      return null;
    }
    console.log('In session');

    const currentUser = await User.findOne({ where: { id: req.session.userId }, relations: ['gamesInLibrary'] });

    // const libraryRepository = getRepository(GameInUserLibrary);
    // const gamesPopulatedWithUser = await libraryRepository.find({ relations: ['user'] });
    // console.log('gamesPopulatedWithUser ===========================\n ', gamesPopulatedWithUser);

    // const userRepository = getRepository(User);
    // const userPopulatedWithGames = await userRepository.find({ relations: ['gamesInLibrary'] });
    // console.log('userswithgamesinside ===========================\n ', userPopulatedWithGames);

    return currentUser;
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

    try {
      if (!userId && !email) throw new Error(`You must provide the user's id or email`);

      const response = await User.delete(userId ? { id: userId } : { email: email });
      console.log('response: ', response);

      return response.affected === 0 ? false : true;
    }
    catch (err) {
      throw new Error(`Failed to delete user: ${err}`);
    }
  }
}