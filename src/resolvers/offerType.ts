import { Query, Resolver, Arg, Mutation } from "type-graphql";
import {OfferType} from "../entities/OfferType";
import {Criteria} from "../entities/Criteria";

@Resolver()
export class OfferTypeResolver {
  @Query(() => [OfferType])
  offerTypes(): Promise<OfferType[]> {
    return OfferType.find();
  }

  @Query(() => OfferType, { nullable: true })
  offerType(@Arg("id") id: number): Promise<OfferType | undefined> {
    return OfferType.findOne(id);
  }

  @Mutation(() => OfferType)
  async createOfferType(
    @Arg("name") name: string,
    @Arg("criteriaIds", () => [Number], { nullable: true }) criteriaIds: number[],
  ): Promise<OfferType | null> {
    if(typeof name === "undefined")
    {
      return null;
    }

    let criterias: Criteria[] = [];
    if (typeof criteriaIds !== 'undefined' && criteriaIds.length > 0) {
      criteriaIds.forEach(async id => {
        let criteria = await Criteria.findOne(id);
        if (criteria) {
          criterias.push(criteria);
        }
      });
    }

    return OfferType.create({ name, criterias }).save();
  }

  @Mutation(() => OfferType, { nullable: true })
  async updateOfferType(
    @Arg("id") id: number,
    @Arg("name", () => String, { nullable: true }) name: string,
    @Arg("criteriaIds", () => [Number], { nullable: true }) criteriaIds: number[]
  ): Promise<OfferType | null> {
    const offerType = await OfferType.findOne(id);
    if (!offerType) {
      return null;
    }
    if (typeof name !== "undefined") {
      offerType.name = name;
    }
    if (typeof criteriaIds !== 'undefined' && criteriaIds.length > 0) {
      let criterias: Criteria[] = [];

      criteriaIds.forEach(async id => {
        let criteria = await Criteria.findOne(id);
        if (criteria) {
          criterias.push(criteria);
        }
      });

      offerType.criterias = criterias;
    }

    OfferType.update({ id }, { ...offerType });
    return offerType;
  }

  @Mutation(() => OfferType, { nullable: true })
  async addOfferTypeCriterias(
      @Arg("id") id: number,
      @Arg("criteriaIds", () => [Number], { nullable: true }) criteriaIds: number[]
  ): Promise<OfferType | null> {
    const offerType = await OfferType.findOne(id);
    if (!offerType) {
      return null;
    }

    if (typeof criteriaIds !== 'undefined' && criteriaIds.length > 0) {
      criteriaIds.forEach(async id => {
        let criteria = await Criteria.findOne(id);
        if (criteria) {
          offerType.criterias.push(criteria);
        }
      });
    }

    OfferType.update({ id }, { ...offerType });
    return offerType;
  }

  @Mutation(() => OfferType, { nullable: true })
  async removeOfferTypeCriterias(
      @Arg("id") id: number,
      @Arg("criteriaIds", () => [Number], { nullable: true }) criteriaIds: number[]
  ): Promise<OfferType | null> {
    const offerType = await OfferType.findOne(id);
    if (!offerType) {
      return null;
    }

    if (typeof criteriaIds !== 'undefined' && criteriaIds.length > 0) {
      criteriaIds.forEach(async id => {
        let criteriaIndex = offerType.criterias.findIndex(criteria => criteria.id == id);
        if(criteriaIndex > -1)
        {
          offerType.criterias.splice(criteriaIndex, 1);
        }
      });
    }

    OfferType.update({ id }, { ...offerType });
    return offerType;
  }

  @Mutation(() => Boolean)
  async deleteOfferType(@Arg("id") id: number): Promise<boolean> {
    await OfferType.delete(id);
    return true;
  }
}
