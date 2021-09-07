import { Field, InputType } from "type-graphql";
import { CriteriaTypes } from "../../entities/Criteria";

@InputType()
export class CreateCriteriaInput {
  @Field()
  name: string;
  @Field({ nullable: true })
  additional?: string;
  @Field()
  criteriaType: CriteriaTypes;
  @Field()
  isGlobal: boolean;
}

@InputType()
export class UpdateCriteriaInput {
  @Field({ nullable: true })
  name?: string;
  @Field({ nullable: true })
  additional?: string;
  @Field({ nullable: true })
  isGlobal?: boolean;
}
