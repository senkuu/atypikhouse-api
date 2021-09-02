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

  @Field(() => User, { nullable: true })
  @OneToOne(() => User, (user) => user.photo, { nullable: true })
  user: User;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string;

  @Field(() => Booking, { nullable: true })
  @OneToOne(() => Booking, { nullable: true })
  @JoinColumn()
  booking: Booking;

  @Field(() => Offer, { nullable: true })
  @ManyToOne(() => Offer, (offer) => offer.photos, { nullable: true })
  offer: Offer;

  @Field(() => PhotoType)
  @OneToOne(() => PhotoType)
  @JoinColumn()
  photoType!: PhotoType;
}
