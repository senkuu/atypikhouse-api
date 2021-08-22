import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { Offer } from "./Offer";
import { Booking } from "./Booking";
import { City } from "./City";
import { Review } from "./Review";
import { Notice } from "./Notice";

export enum UserTypes {
  DEFAULT = "default",
  OWNER = "owner",
  CERTIFIED_OWNER = "certifiedOwner",
  MODERATOR = "moderator",
  ADMIN = "admin",
  TECHNICAL = "technical",
}

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Field()
  @Column()
  name!: string;

  @Field()
  @Column()
  surname!: string;

  @Column()
  password!: string;

  @Field(() => [Offer])
  @OneToMany(() => Offer, (offer) => offer.owner)
  offers: Offer[];

  @Field(() => [Booking])
  @OneToMany(() => Booking, (booking) => booking.occupant)
  bookings: Booking[];

  @Field(() => City)
  @ManyToOne(() => City, (city) => city.users)
  city!: City;

  @Field(() => [Review])
  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @Field(() => [Notice])
  @OneToMany(() => Notice, (notice) => notice.user)
  notices: Notice[];

  @Field(() => [Notice])
  @OneToMany(() => Notice, (notice) => notice.linkedUser)
  linkedNotices: Notice[];

  @Field()
  @Column({
    type: "enum",
    enum: UserTypes,
    default: UserTypes.DEFAULT,
  })
  userType!: UserTypes;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
