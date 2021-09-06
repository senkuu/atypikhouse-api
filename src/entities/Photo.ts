import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { Offer } from "./Offer";

@ObjectType()
@Entity()
export class Photo extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  filename: string;

  @Field()
  @Column()
  url!: string;

  @Field()
  @Column()
  mimetype!: string;

  /*@Field(() => User, { nullable: true })
  @OneToOne(() => User, (user) => user.photo, { nullable: true })
  user: User;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string;

  @Field(() => Booking, { nullable: true })
  @OneToOne(() => Booking, { nullable: true })
  @JoinColumn()
  booking: Booking;*/

  @Field(() => Offer, { nullable: true })
  @ManyToOne(() => Offer, (offer) => offer.photos, { nullable: true })
  offer: Offer;

  /*@Field(() => PhotoType)
  @OneToOne(() => PhotoType)
  @JoinColumn()
  photoType!: PhotoType;*/
}
