import { Field, InputType } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsString()
  email: string;

  @Field()
  @IsString()
  @MinLength(8)
  password: string;
}
