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
import { Field, ObjectType, registerEnumType } from "type-graphql";
import { Offer } from "./Offer";
import { Booking } from "./Booking";
import { Notice } from "./Notice";
import { Photo } from "./Photo";
import { Planning } from "./Planning";
import { City } from "./City";

export enum UserTypes {
  DEFAULT = "default",
  OWNER = "owner",
  CERTIFIED_OWNER = "certifiedOwner",
  MODERATOR = "moderator",
  ADMIN = "admin",
  TECHNICAL = "technical",
}

export enum UserStatuses {
  ACTIVATION_PENDING = "activationPending",
  ACTIVATED = "activated",
  DISABLED = "disabled",
  CLOSED = "closed",
}

registerEnumType(UserTypes, {
  name: "UserTypes",
});

registerEnumType(UserStatuses, {
  name: "UserStatus",
});

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

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  website: string;

  @Field(() => [Offer], { nullable: true })
  @OneToMany(() => Offer, (offer) => offer.owner, { nullable: true })
  offers: Offer[];

  @Field(() => [Booking], { nullable: true })
  @OneToMany(() => Booking, (booking) => booking.occupant, { nullable: true })
  bookings: Booking[];

  @Field(() => City, { nullable: true })
  @ManyToOne(() => City, (city) => city.users, { nullable: true })
  city: City;

  @Field(() => [Notice], { nullable: true })
  @OneToMany(() => Notice, (notice) => notice.user, { nullable: true })
  notices: Notice[];

  @Field(() => [Notice], { nullable: true })
  @OneToMany(() => Notice, (notice) => notice.linkedUser, { nullable: true })
  linkedNotices: Notice[];

  // Photo de profil
  @Field(() => Photo, { nullable: true })
  @OneToOne(() => Photo, (photo) => photo.user, { nullable: true })
  @JoinColumn()
  photo: Photo;

  @Field(() => [Planning], { nullable: true })
  @OneToMany(() => Planning, (planning) => planning.owner, { nullable: true })
  planningData: Planning[];

  @Field()
  @Column({
    type: "enum",
    enum: UserTypes,
    default: UserTypes.DEFAULT,
  })
  userType!: UserTypes;

  @Field()
  @Column({
    type: "enum",
    enum: UserStatuses,
    default: UserStatuses.ACTIVATION_PENDING,
  })
  status!: UserStatuses;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
