import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
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

  @Field({ nullable: true })
  @Column({ nullable: true })
  additional: string;

  @Field()
  @Column({ default: false })
  isGlobal: boolean;

  @Field()
  @Column({
    type: "enum",
    enum: CriteriaTypes,
    default: CriteriaTypes.INT,
  })
  criteriaType!: CriteriaTypes;

  @Field(() => [OfferType], { nullable: true })
  @ManyToMany(() => OfferType, (offerType) => offerType.criterias, {
    nullable: true,
  })
  @JoinTable()
  offerTypes: OfferType[];

  @Field(() => [OfferCriteria], { nullable: true })
  @OneToMany(() => OfferCriteria, (offerCriteria) => offerCriteria.criteria, {
    nullable: true,
  })
  offerCriterias: OfferCriteria[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
