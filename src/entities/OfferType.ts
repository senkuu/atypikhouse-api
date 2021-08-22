import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { Offer } from "./Offer";
import { Criteria } from "./Criteria";

@ObjectType()
@Entity()
export class OfferType extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  name!: string;

  @Field(() => [Offer])
  @OneToMany(() => Offer, (offer) => offer.offerType)
  offers: Offer[];

  @Field(() => [Criteria])
  @ManyToMany(() => Criteria, (criteria) => criteria.offerTypes)
  criterias: Criteria[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
