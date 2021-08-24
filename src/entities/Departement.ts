import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { City } from "./City";
import { Region } from "./Region";

@ObjectType()
@Entity()
export class Departement extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  name!: string;

  @Field()
  @Column()
  number!: string;

  @Field(() => Region)
  @ManyToOne(() => Region, (region) => region.departements, { eager: true })
  region!: Region;

  @Field(() => [City])
  @OneToMany(() => City, (city) => city.departement)
  cities: City[];
}
