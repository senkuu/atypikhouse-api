import { Field, ObjectType } from "type-graphql";
import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  BaseEntity,
} from "typeorm";

@ObjectType()
@Entity()
export class Offer extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column({ type: "text" })
  description!: string;

  @Field()
  @Column()
  location!: string;
}
