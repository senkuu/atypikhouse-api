import { ObjectType } from "type-graphql";
import { BaseEntity, Entity } from "typeorm";

@ObjectType()
@Entity()
export class DatesEntity extends BaseEntity {
  startDate!: Date;
  endDate!: Date;
}
