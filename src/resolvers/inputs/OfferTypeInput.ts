import { Field, InputType } from "type-graphql";

@InputType()
export class CreateOfferTypeInput {
  @Field()
  name: string;
  @Field(() => [Number], { nullable: true })
  criteriaIds: number[];
}

@InputType()
export class UpdateOfferTypeInput {
  @Field({ nullable: true })
  name: string;
  @Field(() => [Number], { nullable: true })
  criteriaIds: number[];
}
