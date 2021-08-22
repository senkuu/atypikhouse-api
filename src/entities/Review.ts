import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { User } from "./User";
import { Booking } from "./Booking";

//TODO: Resolver à faire (si besoin)
@ObjectType()
@Entity()
export class Review extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.reviews)
  user!: User;

  @Field()
  @Column()
  text!: string;

  @Field(() => Booking)
  @OneToOne(() => Booking)
  @JoinColumn()
  booking!: Booking;

  @Field()
  @Column()
  rating!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
