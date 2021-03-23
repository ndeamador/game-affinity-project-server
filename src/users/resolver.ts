import { Arg, Query, Resolver, Mutation } from 'type-graphql';
import bcrypt from 'bcrypt';
import User from './typeDef';
import { Service } from 'typedi';
import { UserRegisterInput } from './registerInput';

@Service() // Seems required even when not using a service in a different file when using "Container" in the creation of the Apollo Server.
@Resolver(_of => User)
export class UserResolver {
  @Query(() => String)
  userHello() {
    return 'hi from UserResolver';
  }

  // REGISTER USER
  @Mutation(() => User)
  async registerNewUser(
    @Arg('inputData') { username, email, password }: UserRegisterInput
  ): Promise<User> {

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser: Promise<User> = await User.create({
      username,
      password: hashedPassword,
      email
    })
      .save()
      .catch(err => console.log(err));

    console.log("NEW USER: ", newUser);

    return newUser;
  }
}