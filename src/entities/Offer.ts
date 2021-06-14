import {
    BaseEntity,
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { OfferType } from "./OfferType";
import {User} from "./User";
import {Booking} from "./Booking";
import {Criteria} from "./Criteria";

export enum OfferStatuses {
    WAITING_APPROVAL,
    MODIFICATIONS_NEEDED,
    REJECTED,
    AVAILABLE,
    DISABLED,
    DELETED
}

export enum DeleteReasons {
    UNKNOWN,
    TC_NON_COMPLIANT, // Non conforme aux CGU
    NOT_DISCLOSABLE,
    STAFF_UNILATERAL,
    OWNER_UNILATERAL,
    DISPUTE
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
    description!: string;

    @Field()
    @Column({ type: "decimal" }) // Vérifier si type ok
    latitude!: number;

    @Field()
    @Column({ type: "decimal" }) // Vérifier si type ok
    longitude!: number;

    //@Field()
    @ManyToOne(() => User, user => user.offers)
    owner!: User;

    //@Field()
    @ManyToOne(() => OfferType, offerType => offerType.offers)
    offerType!: OfferType;

    //@Field()
    @OneToMany(() => Booking, booking => booking.offer)
    bookings: Booking[];

    //@ManyToMany(type => Criteria, { cascade: true })
    //@Field()
    @ManyToMany(() => Criteria, { cascade: true })
    @JoinTable()
    criterias: Criteria[];

    /*@Field()
    @Column({
        type: "enum",
        enum: OfferStatuses,
        default: OfferStatuses.WAITING_APPROVAL
    })
    status!: OfferStatuses;

    @Field()
    @Column({
        type: "enum",
        enum: DeleteReasons,
        default: DeleteReasons.UNKNOWN
    })
    deleteReason: DeleteReasons;*/

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}
