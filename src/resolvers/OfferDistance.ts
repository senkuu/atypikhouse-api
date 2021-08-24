import { Offer } from "../entities/Offer";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class OfferDistance extends Offer {
  @Field({ nullable: true })
  distance: number;
}
