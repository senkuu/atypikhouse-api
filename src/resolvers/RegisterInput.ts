import { Field, InputType } from "type-graphql";
import { UserTypes } from "../entities/User";

@InputType()
export class RegisterInput {
  @Field()
  name: string;
  @Field()
  surname: string;
  @Field()
  email: string;
  @Field()
  password: string;
  @Field({ nullable: true })
  userType: UserTypes;
}
