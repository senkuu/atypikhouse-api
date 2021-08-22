import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { Offer } from "./Offer";
import { Booking } from "./Booking";
import { City } from "./City";
import { Notice } from "./Notice";
import { Photo } from "./Photo";

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

  @Field(() => [Notice])
  @OneToMany(() => Notice, (notice) => notice.user)
  notices: Notice[];

  @Field(() => [Notice])
  @OneToMany(() => Notice, (notice) => notice.linkedUser)
  linkedNotices: Notice[];

  // Photo de profil
  @Field(() => Photo)
  @OneToOne(() => Photo, (photo) => photo.user)
  @JoinColumn()
  photo!: Photo;

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
