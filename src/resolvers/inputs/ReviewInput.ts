import { Field, InputType } from "type-graphql";

@InputType()
export class CreateReviewInput {
  @Field()
  bookingId: number;
  @Field()
  text: string;
  @Field()
  rating: number;
}

@InputType()
export class UpdateReviewInput {
  @Field({ nullable: true })
  text?: string;
  @Field({ nullable: true })
  rating?: number;
}
