import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { Criteria, CriteriaTypes } from "../entities/Criteria";
import { OfferType } from "../entities/OfferType";

@Resolver()
export class CriteriaResolver {
  @Query(() => [Criteria])
  criterias(): Promise<Criteria[]> {
    return Criteria.find({ relations: ["offerType"] });
  }

  @Query(() => Criteria, { nullable: true })
  criteria(@Arg("id") id: number): Promise<Criteria | undefined> {
    return Criteria.findOne(id, { relations: ["offerType"] });
  }

  @Mutation(() => Criteria)
  async createCriteria(
    @Arg("name") name: string,
    @Arg("additional", { nullable: true }) additional: string,
    @Arg("offerTypeIds", () => [Number], { nullable: true })
    offerTypeIds: number[],
    @Arg("criteriaType") criteriaType: CriteriaTypes
  ): Promise<Criteria | null> {
    if (typeof name === "undefined") {
      return null;
    }

    if (typeof additional === "undefined") {
      additional = "";
    }

    let offerTypes: OfferType[] = [];
    if (typeof offerTypeIds !== "undefined" && offerTypeIds.length > 0) {
      offerTypeIds.forEach(async (id) => {
        let offerType = await OfferType.findOne(id);
        if (offerType) {
          offerTypes.push(offerType);
        }
      });
    }

    if (typeof criteriaType === "string") {
      if (!Object.values(CriteriaTypes).includes(criteriaType)) {
        criteriaType = CriteriaTypes.INT;
      }
    } else {
      criteriaType = CriteriaTypes.INT;
    }

    return Criteria.create({
      name,
      additional,
      offerTypes,
      criteriaType,
    }).save();
  }

  @Mutation(() => Criteria, { nullable: true })
  async updateCriteria(
    @Arg("id") id: number,
    @Arg("name", () => String, { nullable: true }) name: string,
    @Arg("additional", () => String, { nullable: true }) additional: string,
    @Arg("offerTypeIds", () => [Number], { nullable: true })
    offerTypeIds: number[],
    @Arg("criteriaType", { nullable: true }) criteriaType: CriteriaTypes
  ): Promise<Criteria | null> {
    const criteria = await Criteria.findOne(id);
    if (!criteria) {
      return null;
    }
    if (typeof name !== "undefined") {
      criteria.name = name;
    }
    if (typeof additional !== "undefined") {
      criteria.additional = additional;
    }
    if (typeof offerTypeIds !== "undefined" && offerTypeIds.length > 0) {
      let offerTypes: OfferType[] = [];

      offerTypeIds.forEach(async (id) => {
        let offerType = await OfferType.findOne(id);
        if (offerType) {
          offerTypes.push(offerType);
        }
      });

      criteria.offerTypes = offerTypes;
    }
    if (typeof criteriaType === "string") {
      if (Object.values(CriteriaTypes).includes(criteriaType)) {
        criteria.criteriaType = criteriaType;
      }
    }

    Criteria.update({ id }, { ...criteria });
    return criteria;
  }

  @Mutation(() => Criteria, { nullable: true })
  async addCriteriaOfferTypes(
    @Arg("id") id: number,
    @Arg("offerTypeIds", () => [Number], { nullable: true })
    offerTypeIds: number[]
  ): Promise<Criteria | null> {
    const criteria = await Criteria.findOne(id);
    if (!criteria) {
      return null;
    }

    if (typeof offerTypeIds !== "undefined" && offerTypeIds.length > 0) {
      offerTypeIds.forEach(async (id) => {
        let offerType = await OfferType.findOne(id);
        if (offerType) {
          criteria.offerTypes.push(offerType);
        }
      });
    }

    Criteria.update({ id }, { ...criteria });
    return criteria;
  }

  @Mutation(() => Criteria, { nullable: true })
  async removeCriteriaOfferTypes(
    @Arg("id") id: number,
    @Arg("offerTypeIds", () => [Number], { nullable: true })
    offerTypeIds: number[]
  ): Promise<Criteria | null> {
    const criteria = await Criteria.findOne(id);
    if (!criteria) {
      return null;
    }

    if (typeof offerTypeIds !== "undefined" && offerTypeIds.length > 0) {
      offerTypeIds.forEach(async (id) => {
        let offerTypeIndex = criteria.offerTypes.findIndex(
          (offerType) => offerType.id == id
        );
        if (offerTypeIndex > -1) {
          criteria.offerTypes.splice(offerTypeIndex, 1);
        }
      });
    }

    Criteria.update({ id }, { ...criteria });
    return criteria;
  }

  @Mutation(() => Boolean)
  async deleteCriteria(@Arg("id") id: number): Promise<boolean> {
    await Criteria.delete(id);
    return true;
  }
}
