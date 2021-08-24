import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { Offer } from "./Offer";

//TODO: Resolver à faire
@ObjectType()
@Entity()
export class Planning extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => Offer)
  @ManyToOne(() => Offer, (offer) => offer.planningData)
  offer: Offer;

  @Field()
  @Column()
  name!: string;

  @Field()
  @Column({ nullable: true })
  description: string;

  @Field()
  @Column({ type: "timestamp" })
  startDate!: Date;

  @Field()
  @Column({ type: "timestamp" })
  endDate!: Date;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
