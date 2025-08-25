import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LogoutResponseObject {
  @Field()
  message: string;
}
