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

  @Field(() => [Offer], { nullable: true })
  @OneToMany(() => Offer, (offer) => offer.offerType, { nullable: true })
  offers: Offer[];

  @Field(() => [Criteria], { nullable: true })
  @ManyToMany(() => Criteria, (criteria) => criteria.offerTypes, {
    nullable: true,
  })
  criterias: Criteria[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
