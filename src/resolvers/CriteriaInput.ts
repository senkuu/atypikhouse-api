import { Field, InputType } from "type-graphql";

// Valeurs considérées comme valides dans la string récupérée, dans le cadre de critères booléens
export enum BooleanValues {
  "true",
  "false",
}

@InputType()
export class CriteriaInput {
  @Field()
  id: number;
  @Field()
  value: string;
}
