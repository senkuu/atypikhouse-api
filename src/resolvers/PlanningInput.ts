import { Field, InputType } from "type-graphql";

@InputType()
export class PlanningInput {
  @Field({ nullable: true })
  ownerId?: number;
  @Field({ nullable: true })
  offerId?: number;
}
