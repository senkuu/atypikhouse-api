import { Field, InputType } from "type-graphql";
import { CoordinatesInput } from "./CoordinatesInput";
import { DeleteReasons } from "../../entities/DeleteReasons";
import { OfferStatuses } from "../../entities/Offer";

@InputType()
export class CreateOfferInput {
  @Field()
  title: string;
  @Field()
  description: string;
  @Field(() => CoordinatesInput, { nullable: true })
  coordinates?: CoordinatesInput;
  @Field({ nullable: true })
  address?: string;
  @Field()
  touristTax: number;
  @Field()
  priceHT: number;
  @Field()
  priceTTC: number;
  @Field()
  cityId: number;
  @Field()
  ownerId: number;
  @Field({ nullable: true })
  offerTypeId?: number;
  /*@Field(() => criteriaValue, { nullable: true })
  criterias?: criteriaValue;*/
  @Field({ nullable: true })
  deleteReason?: DeleteReasons;
  @Field()
  status: OfferStatuses;
}

@InputType()
export class UpdateOfferInput {
  @Field({ nullable: true })
  title?: string;
  @Field({ nullable: true })
  description?: string;
  @Field(() => CoordinatesInput, { nullable: true })
  coordinates?: CoordinatesInput | null;
  @Field({ nullable: true })
  address?: string;
  @Field({ nullable: true })
  touristTax?: number;
  @Field({ nullable: true })
  priceHT?: number;
  @Field({ nullable: true })
  priceTTC?: number;
  @Field({ nullable: true })
  cityId?: number;
  @Field({ nullable: true })
  ownerId?: number;
  @Field({ nullable: true })
  offerTypeId?: number;
  /*@Field(() => criteriaValue, { nullable: true })
  criterias?: criteriaValue;*/
  @Field({ nullable: true })
  deleteReason?: DeleteReasons;
  @Field({ nullable: true })
  status?: OfferStatuses;
}
