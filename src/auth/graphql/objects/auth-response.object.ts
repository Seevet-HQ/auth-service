import { Field, ObjectType } from '@nestjs/graphql';
import { UserObject } from './user.object';

@ObjectType()
export class AuthResponseObject {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => UserObject)
  user: UserObject;
}
