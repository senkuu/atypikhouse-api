import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { Notice } from "./Notice";

//TODO: Resolver à faire
@ObjectType()
@Entity()
export class NoticeType extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  name!: string;

  @Field()
  @Column()
  defaultText!: string;

  @Field(() => [Notice], { nullable: true })
  @OneToMany(() => Notice, (notice) => notice.noticeType, { nullable: true })
  notices: Notice[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
