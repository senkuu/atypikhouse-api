import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { Offer } from "./Offer";
import { User } from "./User";
import { DatesEntity } from "./DatesEntity";

@ObjectType()
@Entity()
export class Planning extends DatesEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => Offer, { nullable: true })
  @ManyToOne(() => Offer, (offer) => offer.planningData, { nullable: true })
  offer: Offer;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.planningData, { nullable: true })
  owner: User;

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
