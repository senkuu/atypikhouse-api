import { Field, InputType } from "type-graphql";
import { CreateDatesInput, UpdateDatesInput } from "./DatesInput";

@InputType()
export class SearchPlanningDataInput {
  @Field({ nullable: true })
  ownerId?: number;
  @Field({ nullable: true })
  offerId?: number;
}

@InputType()
export class AddPlanningDataInput extends CreateDatesInput {
  @Field({ nullable: true })
  ownerId?: number;
  @Field({ nullable: true })
  offerId?: number;
  @Field()
  startDate: Date;
  @Field()
  endDate: Date;
}

@InputType()
export class UpdatePlanningDataInput extends UpdateDatesInput {}
