import { Length, IsEmail } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { DoesEmailAlreadyExist } from '../../utils/customClassValidators';

@InputType() // Creates an input GraphQL type (We use @InputType instead of @Args)
export class UserLoginDetails {

  // // USERNAME
  // @Field()
  // @Length(1, 30)
  // username: string;

  // EMAIL
  @Field()
  @IsEmail()
  // @DoesEmailAlreadyExist({ message: 'email already in use'}) // A custom validator.
  email: string;

  // PASSWORD
  @Field()
  @Length(8, 64)
  password: string;
}