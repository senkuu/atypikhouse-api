import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity, OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import {Offer} from "./Offer";
import {Booking} from "./Booking";

export enum UserTypes {
  DEFAULT = "default",
  OWNER = "owner",
  CERTIFIED_OWNER = "certifiedOwner",
  MODERATOR = "moderator",
  ADMIN = "admin",
  TECHNICAL = "technical"
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

  //@Field()
  @OneToMany(() => Offer, offer => offer.owner)
  offers: Offer[];

  //@Field()
  @OneToMany(() => Booking, booking => booking.occupant)
  bookings: Booking[];

  @Field()
  @Column({
    type: "enum",
    enum: UserTypes,
    default: UserTypes.DEFAULT
  })
  userType!: UserTypes;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
