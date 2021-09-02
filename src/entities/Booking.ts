import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from "typeorm";
import { Field, ObjectType, registerEnumType } from "type-graphql";
import { Offer } from "./Offer";
import { User } from "./User";
import { Review } from "./Review";

export enum BookingStatuses {
  WAITING_APPROVAL = "WAITING_APPROVAL",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

export enum CancelReasons {
  UNKNOWN = "UNKNOWN",
  OWNER_CANCELLATION = "OWNER_CANCELLATION",
  OCCUPANT_CANCELLATION = "OCCUPANT_CANCELLATION",
  PAYMENT_REFUSED = "PAYMENT_REFUSED",
  STAFF_CANCELLATION = "STAFF_CANCELLATION",
}

registerEnumType(BookingStatuses, {
  name: "BookingStatuses",
});

registerEnumType(CancelReasons, {
  name: "CancelReasons",
});

@ObjectType()
@Entity()
export class Booking extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => Offer)
  @ManyToOne(() => Offer, (offer) => offer.bookings)
  offer!: Offer;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.bookings)
  occupant!: User;

  @Field(() => Review, { nullable: true })
  @OneToOne(() => Review, (review) => review.booking, { nullable: true })
  review: Review;

  @Field()
  @Column({ default: 1 })
  adults!: number;

  @Field()
  @Column({ default: 0 })
  children!: number;

  @Field()
  @Column({ type: "decimal" })
  priceHT!: number;

  @Field()
  @Column({ type: "decimal" })
  priceTTC!: number;

  @Field()
  @Column({ type: "timestamp" })
  startDate!: Date;

  @Field()
  @Column({ type: "timestamp" })
  endDate!: Date;

  @Field(/*type => BookingStatuses*/)
  @Column({
    type: "enum",
    enum: BookingStatuses,
    default: BookingStatuses.WAITING_APPROVAL,
  })
  status!: BookingStatuses;

  @Field(/*() => CancelReasons*/)
  @Column({
    type: "enum",
    enum: CancelReasons,
    default: CancelReasons.UNKNOWN,
  })
  cancelReason!: CancelReasons;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
