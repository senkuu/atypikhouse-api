import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { OfferType } from "./OfferType";
import { User } from "./User";
import { Booking } from "./Booking";
import { OfferCriteria } from "./OfferCriteria";
import { City } from "./City";
import { Photo } from "./Photo";
import { Planning } from "./Planning";
//import { CoordinatesInput } from "../resolvers/CoordinatesInput";
import { Point } from "geojson";
import { GraphQLInputObjectType } from "graphql";

const geoSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

export enum OfferStatuses {
  WAITING_APPROVAL = "WAITING_APPROVAL",
  MODIFICATIONS_NEEDED = "MODIFICATIONS_NEEDED",
  REJECTED = "REJECTED",
  AVAILABLE = "AVAILABLE",
  DISABLED = "DISABLED",
  DELETED = "DELETED",
}

export enum DeleteReasons {
  UNKNOWN = "UNKNOWN",
  TC_NON_COMPLIANT = "TC_NON_COMPLIANT", // Non conforme aux CGU
  NOT_DISCLOSABLE = "NOT_DISCLOSABLE",
  STAFF_UNILATERAL = "STAFF_UNILATERAL",
  OWNER_UNILATERAL = "OWNER_UNILATERAL",
  DISPUTE = "DISPUTE",
}

@ObjectType()
@Entity()
export class Offer extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  title!: string;

  @Field()
  @Column({ type: "text" })
  description: string;

  @Field()
  @Column({ nullable: true })
  address: string;

  @Field(() => GraphQLInputObjectType)
  @Index({ spatial: true })
  @Column({
    type: "geography",
    spatialFeatureType: "Point",
    srid: 4326,
    nullable: true,
  })
  coordinates: Point;

  @Field()
  @Column({ type: "decimal", nullable: true }) // Vérifier si type ok
  touristTax!: number; // = Taxe de séjour

  @Field()
  @ManyToOne(() => City, (city) => city.offers)
  city!: City;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.offers)
  owner!: User;

  @Field(() => OfferType)
  @ManyToOne(() => OfferType, (offerType) => offerType.offers)
  offerType!: OfferType;

  @Field(() => [Booking])
  @OneToMany(() => Booking, (booking) => booking.offer)
  bookings: Booking[];

  @Field(() => [Photo])
  @OneToMany(() => Photo, (photo) => photo.offer)
  photos: Photo[];

  @Field(() => [OfferCriteria])
  @OneToMany(() => OfferCriteria, (offerCriteria) => offerCriteria.offer, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  offerCriterias: OfferCriteria[];

  @Field(() => [Planning])
  @OneToMany(() => Planning, (planning) => planning.offer)
  planningData: Planning[];

  @Field()
  @Column({
    type: "enum",
    enum: OfferStatuses,
    default: OfferStatuses.WAITING_APPROVAL,
  })
  status!: OfferStatuses;

  @Field()
  @Column({
    type: "enum",
    enum: DeleteReasons,
    default: DeleteReasons.UNKNOWN,
  })
  deleteReason!: DeleteReasons;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
