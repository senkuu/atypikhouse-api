import {
  Arg,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { Criteria } from "../entities/Criteria";
import { OfferType } from "../entities/OfferType";
import {
  CreateCriteriaInput,
  UpdateCriteriaInput,
} from "./inputs/CriteriaInput";
import { FieldError } from "./FieldError";
import { validateCriteria } from "../utils/validations/validateCriteria";
import { createEntity } from "../utils/createEntity";
import { updateEntity } from "../utils/updateEntity";

@ObjectType()
class CriteriaResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Criteria, { nullable: true })
  criteria?: Criteria;
}

@Resolver()
export class CriteriaResolver {
  @Query(() => [Criteria])
  criterias(): Promise<Criteria[]> {
    return Criteria.find({ relations: ["offerTypes"] });
  }

  @Query(() => Criteria, { nullable: true })
  criteria(@Arg("id") id: number): Promise<Criteria | undefined> {
    return Criteria.findOne(id, { relations: ["offerTypes"] });
  }

  @Mutation(() => CriteriaResponse)
  async createCriteria(
    @Arg("options") options: CreateCriteriaInput
  ): Promise<CriteriaResponse> {
    const errors: FieldError[] = validateCriteria(options);

    if (errors.length > 0) {
      return { errors };
    }

    let criteria: Criteria;
    try {
      criteria = await createEntity(options, "Criteria");

      return { errors, criteria };
    } catch (err) {
      console.log(err.code + " " + err.detail);
      errors.push({
        field: "unknown",
        message: "Erreur inconnue, veuillez contacter l'administrateur",
      });

      return { errors };
    }
  }

  @Mutation(() => CriteriaResponse, { nullable: true })
  async updateCriteria(
    @Arg("id") id: number,
    @Arg("options") options: UpdateCriteriaInput
  ): Promise<CriteriaResponse> {
    let criteria = await Criteria.findOne(id);
    if (!criteria) {
      return {
        errors: [{ field: "id", message: "Le critère est introuvable" }],
      };
    }

    const errors: FieldError[] = validateCriteria(options, criteria);

    criteria = await updateEntity(criteria, options, errors);
    criteria = await Criteria.save(criteria);

    return { errors, criteria };
  }

  @Mutation(() => CriteriaResponse)
  async addCriteriaOfferTypes(
    @Arg("id") id: number,
    @Arg("offerTypeIds", () => [Number])
    offerTypeIds: number[]
  ): Promise<CriteriaResponse> {
    const criteria = await Criteria.findOne(id);
    if (!criteria) {
      return {
        errors: [{ field: "id", message: "Le critère est introuvable" }],
      };
    }

    const errors: FieldError[] = [];

    if (typeof offerTypeIds !== "undefined" && offerTypeIds.length > 0) {
      offerTypeIds.forEach(async (id) => {
        let offerType = await OfferType.findOne(id);
        if (offerType) {
          criteria.offerTypes.push(offerType);
        } else {
          errors.push({
            field: "offerTypeIds",
            message: `Le type d'offre ${id} est introuvable`,
          });
        }
      });
    }

    Criteria.update({ id }, { ...criteria });
    return { errors, criteria };
  }

  @Mutation(() => CriteriaResponse)
  async removeCriteriaOfferTypes(
    @Arg("id") id: number,
    @Arg("offerTypeIds", () => [Number])
    offerTypeIds: number[]
  ): Promise<CriteriaResponse> {
    const criteria = await Criteria.findOne(id, { relations: ["offerTypes"] });
    if (!criteria) {
      return {
        errors: [{ field: "id", message: "Le critère est introuvable" }],
      };
    }

    const errors: FieldError[] = [];

    if (typeof offerTypeIds !== "undefined" && offerTypeIds.length > 0) {
      offerTypeIds.forEach(async (id) => {
        let offerTypeIndex = criteria.offerTypes.findIndex(
          (offerType) => offerType.id == id
        );
        if (offerTypeIndex > -1) {
          criteria.offerTypes.splice(offerTypeIndex, 1);
        } else {
          errors.push({
            field: "offerTypeIds",
            message: `Le type d'offre ${id} est introuvable sur ce critère`,
          });
        }
      });
    }

    Criteria.update({ id }, { ...criteria });
    return { errors, criteria };
  }

  @Mutation(() => Boolean)
  async deleteCriteria(@Arg("id") id: number): Promise<boolean> {
    await Criteria.delete(id);
    return true;
  }
}
