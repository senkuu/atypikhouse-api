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
  description: string;

  @Field()
  @Column({ nullable: true })
  address: string;

  // // TODO: Implémenter les coordonnées en tant que champ
  //@Field(() => GeoJSONPoint)
  @Index({ spatial: true })
  @Column({
    type: "geography",
    spatialFeatureType: "Point",
    srid: 4326,
  })
  coordinates: Point;

  @Field({ nullable: true })
  latitude: number;

  @Field({ nullable: true })
  longitude: number;

  @Field()
  @Column({ type: "decimal", nullable: true }) // Vérifier si type ok
  touristTax!: number; // = Taxe de séjour

  @Field()
  @Column({ type: "decimal", nullable: true })
  basePriceHT!: number;

  @Field({ nullable: true })
  distance: number;

  @Field({ nullable: true })
  sortScore: number;

  @Field({ nullable: true })
  averageRating: number;

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
