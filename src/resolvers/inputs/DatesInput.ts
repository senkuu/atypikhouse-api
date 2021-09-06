import { Field, InputType } from "type-graphql";

@InputType()
export class CreateDatesInput {
  @Field()
  startDate: Date;
  @Field()
  endDate?: Date;
}

@InputType()
export class UpdateDatesInput {
  @Field({ nullable: true })
  startDate?: Date;
  @Field({ nullable: true })
  endDate?: Date;
}
