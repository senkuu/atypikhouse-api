import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { User } from "./User";
import { NoticeType } from "./NoticeType";

// TODO: Indiquer des types d'URL
export enum UrlType {
  DEFAULT = "DEFAULT",
}

//TODO: Resolver à faire
@ObjectType()
@Entity()
export class Notice extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.notices)
  user!: User;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.linkedNotices, { nullable: true })
  linkedUser: User;

  @Field()
  @Column({ nullable: true })
  placeholder1: string;

  @Field()
  @Column({ nullable: true })
  placeholder2: string;

  @Field()
  @Column({ nullable: true })
  placeholder3: string;

  @Field()
  @Column({ nullable: true })
  placeholder4: string;

  @Field()
  @Column({ nullable: true })
  placeholder5: string;

  @Field()
  @Column({ nullable: true })
  url: string;

  @Field()
  @Column({
    type: "enum",
    enum: UrlType,
    default: UrlType.DEFAULT,
  })
  urlType!: UrlType;

  @Field(() => NoticeType)
  @OneToOne(() => NoticeType)
  @JoinColumn()
  noticeType: NoticeType;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;
}
