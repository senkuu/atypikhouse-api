import { Field, InputType } from "type-graphql";
import { BookingStatuses, CancelReasons } from "../../entities/Booking";
import { CreateDatesInput, UpdateDatesInput } from "./DatesInput";

@InputType()
export class CreateBookingInput extends CreateDatesInput {
  @Field()
  offerId: number;
  @Field()
  occupantId: number;
  @Field()
  adults: number;
  @Field()
  children: number;
  @Field()
  priceHT: number;
  @Field()
  priceTTC: number;
  @Field()
  touristTax: number;
  @Field()
  startDate: Date;
  @Field()
  endDate: Date;
  @Field()
  status: BookingStatuses;
  @Field({ nullable: true })
  cancelReason?: CancelReasons;
}

@InputType()
export class UpdateBookingInput extends UpdateDatesInput {
  @Field({ nullable: true })
  adults?: number;
  @Field({ nullable: true })
  children?: number;
  @Field({ nullable: true })
  priceHT?: number;
  @Field({ nullable: true })
  priceTTC?: number;
  @Field({ nullable: true })
  touristTax?: number;
  @Field({ nullable: true })
  startDate?: Date;
  @Field({ nullable: true })
  endDate?: Date;
  @Field({ nullable: true })
  status?: BookingStatuses;
  @Field({ nullable: true })
  cancelReason?: CancelReasons;
}
