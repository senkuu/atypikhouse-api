import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { Offer } from "./Offer";
import { Criteria } from "./Criteria";

@ObjectType()
@Entity()
@Unique(["offer", "criteria"])
export class OfferCriteria extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  value!: string;

  @Field(() => Offer)
  @ManyToOne(() => Offer, (offer) => offer.offerCriterias, { eager: true })
  offer: Offer;

  @Field(() => Criteria)
  @ManyToOne(() => Criteria, (criteria) => criteria.offerCriterias, {
    eager: true,
  })
  criteria: Criteria;
}
