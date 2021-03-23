import { Length, IsEmail } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { DoesEmailAlreadyExist } from '../utils/customClassValidators';

@InputType() // Creates an input GraphQL type.
export class UserRegisterInput {

  // USERNAME
  @Field()
  @Length(1, 30)
  username: string;

  // EMAIL
  @Field()
  @IsEmail()
  @DoesEmailAlreadyExist({ message: 'email already in use'})
  email: string;

  // PASSWORD
  @Field()
  password: string;
}