import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { Departement } from "./Departement";

@ObjectType()
@Entity()
export class Region extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  name!: string;

  @Field(() => [Departement], { nullable: true })
  @OneToMany(() => Departement, (departement) => departement.region, {
    nullable: true,
  })
  departements: Departement[];
}
