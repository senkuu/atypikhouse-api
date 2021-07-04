import {
    BaseEntity,
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToMany,
    JoinTable,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { OfferType } from "./OfferType";

export enum CriteriaTypes {
    STRING = "string",
    INT = "int",
    BOOLEAN = "boolean"
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

    @Field()
    @Column()
    additional: string;

    @Field()
    @Column({
        type: "enum",
        enum: CriteriaTypes,
        default: CriteriaTypes.INT
    })
    criteriaType!: CriteriaTypes;

    //@ManyToMany(type => OfferType, { cascade: true })
    //@Field()
    @ManyToMany(() => OfferType, offerType => offerType.criterias, { cascade: true })
    @JoinTable()
    offerTypes: OfferType[];
}
