import {
  Query,
  Resolver,
  Arg,
  Mutation,
  ObjectType,
  Field,
} from "type-graphql";
import { OfferType } from "../entities/OfferType";
import { Criteria } from "../entities/Criteria";
import { FieldError } from "./FieldError";
import { validateOfferType } from "../utils/validateOfferType";

@ObjectType()
class OfferTypeResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => OfferType, { nullable: true })
  offerType?: OfferType;
}

@Resolver()
export class OfferTypeResolver {
  @Query(() => [OfferType])
  offerTypes(): Promise<OfferType[]> {
    return OfferType.find({ relations: ["criterias"] }); // Fonctionnel (vérifié en console.log)
  }

  @Query(() => OfferType, { nullable: true })
  offerType(@Arg("id") id: number): Promise<OfferType | undefined> {
    return OfferType.findOne(id, { relations: ["criterias"] }); // Fonctionnel (vérifié en console.log)
  }

  @Mutation(() => OfferTypeResponse)
  async createOfferType(
    @Arg("name") name: string,
    @Arg("criteriaIds", () => [Number], { nullable: true })
    criteriaIds: number[]
  ): Promise<OfferTypeResponse> {
    const errors: FieldError[] = validateOfferType(name /*, criteriaIds*/);

    if (errors.length > 0) {
      return {
        errors,
      };
    }

    // Voir comment tester ce bloc
    let criterias: Criteria[] = [];
    if (typeof criteriaIds !== "undefined" && criteriaIds.length > 0) {
      criteriaIds.forEach(async (id) => {
        let criteria = await Criteria.findOne(id);
        if (criteria) {
          console.log("-- Critère " + criteria.name + " trouvé");
          criterias.push(criteria);
        }
      });
    }

    let offerType;
    try {
      offerType = await OfferType.create({
        name: name,
        criterias: criterias,
      }).save({});
    } catch (err) {
      if (err.code === "23505" || err.detail.includes("already exists")) {
        return {
          errors: [{ field: "name", message: "Offer type already exists" }],
        };
      } else {
        console.log(err.code + " " + err.detail);
      }
    }

    criterias.forEach(function (item, index) {
      console.log(item, index);
    });
    return { offerType };
  }

  @Mutation(() => OfferType, { nullable: true })
  async updateOfferType(
    @Arg("id") id: number,
    @Arg("name", () => String, { nullable: true }) name: string,
    @Arg("criteriaIds", () => [Number], { nullable: true })
    criteriaIds: number[]
  ): Promise<OfferType | null> {
    const offerType = await OfferType.findOne(id);
    if (!offerType) {
      return null;
    }
    if (typeof name !== "undefined") {
      offerType.name = name;
    }
    if (typeof criteriaIds !== "undefined" && criteriaIds.length > 0) {
      let criterias: Criteria[] = [];

      criteriaIds.forEach(async (id) => {
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
    @Arg("criteriaIds", () => [Number], { nullable: true })
    criteriaIds: number[]
  ): Promise<OfferType | null> {
    let offerType = await OfferType.findOne(id, { relations: ["criterias"] });

    if (!offerType) {
      return null;
    }

    if (typeof criteriaIds !== "undefined" && criteriaIds.length > 0) {
      criteriaIds.forEach(async (criteriaId) => {
        let criteria = await Criteria.findOne(criteriaId);

        if (
          criteria &&
          !offerType!.criterias.find((criteria) => criteria.id === criteriaId)
        ) {
          offerType!.criterias.push(criteria);
        }
      });
    }

    await OfferType.save(offerType!);
    return offerType!;
  }

  @Mutation(() => OfferType, { nullable: true })
  async removeOfferTypeCriterias(
    @Arg("id") id: number,
    @Arg("criteriaIds", () => [Number], { nullable: true })
    criteriaIds: number[]
  ): Promise<OfferType | null> {
    let offerType = await OfferType.findOne(id, { relations: ["criterias"] });
    if (!offerType && typeof offerType) {
      return null;
    }

    if (typeof criteriaIds !== "undefined" && criteriaIds.length > 0) {
      criteriaIds.forEach(async (id) => {
        let criteriaIndex = offerType!.criterias.findIndex(
          (criteria) => criteria.id == id
        );
        if (criteriaIndex > -1) {
          offerType!.criterias.splice(criteriaIndex, 1);
        }
      });
    }

    OfferType.save(offerType!);
    return offerType!;
  }

  @Mutation(() => Boolean)
  async deleteOfferType(@Arg("id") id: number): Promise<boolean> {
    await OfferType.delete(id);
    return true;
  }
}
