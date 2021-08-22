import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { Departement } from "./Departement";
import { Offer } from "./Offer";
import { User } from "./User";

@ObjectType()
@Entity()
export class City extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  name!: string;

  @Field(() => Departement)
  @ManyToOne(() => Departement, (departement) => departement.cities)
  departement!: Departement;

  @Field(() => [Offer])
  @OneToMany(() => Offer, (offer) => offer.city)
  offers: Offer[];

  @Field()
  @Column({ nullable: true })
  intercommunalite: number;

  @Field()
  @Column()
  population!: number;

  @Field(() => [User])
  @OneToMany(() => User, (user) => user.city)
  users: User[];
}
