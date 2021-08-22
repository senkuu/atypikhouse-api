import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { OfferType } from "./OfferType";
import { OfferCriteria } from "./OfferCriteria";

export enum CriteriaTypes {
  STRING = "string",
  INT = "int",
  BOOLEAN = "boolean",
}

@ObjectType()
@Entity()
export class Criteria extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  name!: string;

  @Field()
  @Column()
  additional: string;

  @Field()
  @Column({
    type: "enum",
    enum: CriteriaTypes,
    default: CriteriaTypes.INT,
  })
  criteriaType!: CriteriaTypes;

  @ManyToMany(() => OfferType, (offerType) => offerType.criterias)
  @JoinTable()
  offerTypes: OfferType[];

  @Field(() => [OfferCriteria])
  @OneToMany(() => OfferCriteria, (offerCriteria) => offerCriteria.criteria)
  offerCriterias: OfferCriteria[];
}
