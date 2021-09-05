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
import { Field, ObjectType, registerEnumType } from "type-graphql";
import { OfferType } from "./OfferType";
import { User } from "./User";
import { Booking } from "./Booking";
import { OfferCriteria } from "./OfferCriteria";
import { City } from "./City";
import { Photo } from "./Photo";
import { Planning } from "./Planning";
//import { CoordinatesInput } from "../resolvers/CoordinatesInput";
import { Point } from "geojson";
import { DeleteReasons } from "./DeleteReasons";

export enum OfferStatuses {
  WAITING_APPROVAL = "WAITING_APPROVAL",
  MODIFICATIONS_NEEDED = "MODIFICATIONS_NEEDED",
  REJECTED = "REJECTED",
  AVAILABLE = "AVAILABLE",
  DISABLED = "DISABLED",
  DELETED = "DELETED",
}

registerEnumType(DeleteReasons, {
  name: "DeleteReasons",
});

@ObjectType()
@Entity()
export class Offer extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column({ type: "text" })
  description!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  address: string;

  // TODO: Implémenter les coordonnées en tant que champ
  //@Field(() => GeoJSONPoint)
  @Index({ spatial: true })
  @Column({
    type: "geography",
    spatialFeatureType: "Point",
    srid: 4326,
    nullable: true,
  })
  coordinates: Point;

  @Field({ nullable: true })
  latitude: number;

  @Field({ nullable: true })
  longitude: number;

  @Field()
  @Column({ type: "decimal" }) // Vérifier si type ok
  touristTax!: number; // = Taxe de séjour

  @Field()
  @Column({ type: "decimal" })
  priceHT!: number;

  @Field()
  @Column({ type: "decimal" })
  priceTTC!: number;

  @Field({ nullable: true })
  distance: number;

  @Field({ nullable: true })
  sortScore: number;

  @Field({ nullable: true })
  averageRating: number;

  // Temporarily nullable
  @Field({ nullable: true })
  @ManyToOne(() => City, (city) => city.offers, { nullable: true })
  city: City;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.offers)
  owner!: User;

  @Field(() => OfferType)
  @ManyToOne(() => OfferType, (offerType) => offerType.offers)
  offerType!: OfferType;

  @Field(() => [Booking], { nullable: true })
  @OneToMany(() => Booking, (booking) => booking.offer, { nullable: true })
  bookings: Booking[];

  @Field(() => [Photo], { nullable: true })
  @OneToMany(() => Photo, (photo) => photo.offer, { nullable: true })
  photos: Photo[];

  @Field(() => [OfferCriteria], { nullable: true })
  @OneToMany(() => OfferCriteria, (offerCriteria) => offerCriteria.offer, {
    nullable: true,
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  offerCriterias: OfferCriteria[];

  @Field(() => [Planning], { nullable: true })
  @OneToMany(() => Planning, (planning) => planning.offer, { nullable: true })
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
