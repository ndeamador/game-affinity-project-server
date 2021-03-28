import { Arg, Query, Resolver, Mutation, Ctx, ObjectType, Field } from 'type-graphql';
import bcrypt from 'bcrypt';
import User from './typeDef';
import { Service } from 'typedi';
import { UserLoginDetails } from './registerInput';
import { Context } from '../types';
import { COOKIE_NAME } from '../constants';

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
  @Mutation(() => User)
  async registerNewUser(
    @Arg('loginDetails') { email, password }: UserLoginDetails,
    @Ctx() { req }: Context
  ): Promise<User> {

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser: Promise<User> = await User.create({
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
  @Mutation(() => User)
  async login(
    @Arg('loginDetails') { email, password }: UserLoginDetails,
    @Ctx() { req }: Context
  ): Promise<User> {

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
    console.log('in me query');
    if (!req.session.userId) {
      console.log('no session');
      return null;
    }

    console.log('session');

    const currentUser = await User.findOne({ id: req.session.userId });
    return currentUser;
  }

  // ----------------------------------
  // LOGOUT
  // ----------------------------------
  @Mutation(() => Boolean)
  async logout(
    @Ctx() { req, res }: Context
  ) {
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
}