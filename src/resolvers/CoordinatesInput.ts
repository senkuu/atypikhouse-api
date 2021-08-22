import { Field, InputType } from "type-graphql";

@InputType()
export class CoordinatesInput {
  @Field()
  latitude!: number;
  @Field()
  longitude!: number;
}
