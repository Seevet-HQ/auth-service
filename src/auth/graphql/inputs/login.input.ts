import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsString()
  email: string;

  @Field()
  @IsString()
  @MinLength(8)
  password: string;
}
