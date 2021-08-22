import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { User } from "./User";
import { Booking } from "./Booking";
import { Offer } from "./Offer";
import { PhotoType } from "./PhotoType";

//TODO: Resolver à faire
@ObjectType()
@Entity()
export class Photo extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  url!: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.reviews)
  user!: User;

  @Field()
  @Column({ nullable: true })
  description: string;

  @Field(() => Booking)
  @OneToOne(() => Booking, { nullable: true })
  @JoinColumn()
  booking: Booking;

  @Field(() => Offer)
  @ManyToOne(() => Offer, (offer) => offer.photos, { nullable: true })
  offer: Offer;

  @Field(() => PhotoType)
  @OneToOne(() => PhotoType)
  @JoinColumn()
  photoType: PhotoType;
}
