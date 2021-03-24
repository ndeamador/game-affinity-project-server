import { Arg, Query, Resolver, Mutation, Ctx, ObjectType, Field } from 'type-graphql';
import bcrypt from 'bcrypt';
import User from './typeDef';
import { Service } from 'typedi';
import { UserLoginDetails } from './registerInput';
import { Context } from '../types';

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

    // With this line we can log the user in automatically after registration (create a session)
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
    req.session.userId = user.id;

    return user;
  }


  @Query(_returns => User, { nullable: true }) // if the user is not logged in, return null
  async me(
    @Ctx() { req }: Context
  ) {
    if (!req.session.userId) {
      return null;
    }

    const currentUser = await User.findOne({ id: req.session.userId });
    return currentUser;
  }
}