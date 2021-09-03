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
  getRepository,
  getConnection
} from "typeorm";
import { Field, ObjectType, registerEnumType } from "type-graphql";
import { OfferType } from "./OfferType";
import { User } from "./User";
import { Booking } from "./Booking";
import { OfferCriteria } from "./OfferCriteria";
import { City } from "./City";
import { Photo } from "./Photo";
import { Planning } from "./Planning";
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

  @Field()
  @ManyToOne(() => City, (city) => city.offers)
  city!: City;

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

  static getOrderedAndPaginatedOffersFromCityId(
    cityId: number = 75056,
    limit: number = 25,
    cursor: number = 0
  ) {
    const result = getRepository(Offer)
      .createQueryBuilder("offer")
      .orderBy("distance(:cityId, offer.id)")
      .setParameters({ cityId })
      .take(limit)
      .skip(cursor * limit)
      .getMany();
    return result;
  }

  static async getDistanceFrom(cityId: number, orderId: number): Promise<number> {
    const test = await getConnection()
      .query("SELECT distance($1, offer.id) FROM offer WHERE offer.id = $2", [cityId, orderId]);
    return await test[0].distance;
  }
}
