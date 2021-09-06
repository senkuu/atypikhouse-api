import { Field, InputType } from "type-graphql";
import { UserStatuses, UserTypes } from "../../entities/User";

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
  userType?: UserTypes;
  @Field({ nullable: true })
  status?: UserStatuses;
}
