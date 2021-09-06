import {
  Arg,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { OfferType } from "../entities/OfferType";
import { Criteria } from "../entities/Criteria";
import { FieldError } from "./FieldError";
import { validateOfferType } from "../utils/validations/validateOfferType";
import {
  addCriteriasInList,
  generateCriteriasList,
  removeCriteriasFromList,
} from "../utils/processCriteriasList";
import { updateEntity } from "../utils/updateEntity";
import { createEntity } from "../utils/createEntity";
import {
  CreateOfferTypeInput,
  UpdateOfferTypeInput,
} from "./inputs/OfferTypeInput";

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
    return OfferType.find({ relations: ["criterias"] });
  }

  @Query(() => OfferType, { nullable: true })
  offerType(@Arg("id") id: number): Promise<OfferType | undefined> {
    return OfferType.findOne(id, { relations: ["criterias"] });
  }

  @Mutation(() => OfferTypeResponse)
  async createOfferType(
    @Arg("options") options: CreateOfferTypeInput
  ): Promise<OfferTypeResponse> {
    const errors: FieldError[] = validateOfferType(options);

    if (errors.length > 0) {
      return {
        errors,
      };
    }

    let criterias: Criteria[] = [];
    if (
      typeof options.criteriaIds !== "undefined" &&
      options.criteriaIds.length > 0
    ) {
      let criteriasCheck = await generateCriteriasList(options.criteriaIds);
      errors.push(...criteriasCheck.errors);
      criterias = criteriasCheck.criterias;
    }

    let offerType: OfferType;
    try {
      offerType = await createEntity(options, "OfferType", ["criteriaIds"]);

      if (criterias.length > 0) {
        offerType.criterias = criterias;
        offerType = await OfferType.save(offerType);
      }

      return { errors, offerType };
    } catch (err) {
      if (err.code === "23505" || err.detail.includes("already exists")) {
        errors.push({ field: "name", message: "Le type d'offre existe déjà" });
      } else {
        console.log(err.code + " " + err.detail);
        errors.push({
          field: "unknown",
          message: "Erreur inconnue, veuillez contacter l'administrateur",
        });
      }

      return { errors };
    }
  }

  @Mutation(() => OfferTypeResponse)
  async updateOfferType(
    @Arg("id") id: number,
    @Arg("options") options: UpdateOfferTypeInput
  ): Promise<OfferTypeResponse> {
    let offerType = await OfferType.findOne(id, { relations: ["criterias"] });
    if (!offerType) {
      return {
        errors: [{ field: "id", message: "Le type d'offre est introuvable" }],
      };
    }

    const errors: FieldError[] = validateOfferType(options);

    offerType = updateEntity(offerType, options, errors, ["criteriaIds"]);

    if (
      typeof options.criteriaIds !== "undefined" &&
      options.criteriaIds.length > 0
    ) {
      let criteriasCheck = await generateCriteriasList(options.criteriaIds);
      errors.push(...criteriasCheck.errors);
      offerType.criterias = criteriasCheck.criterias;
    }

    offerType = await OfferType.save(offerType);
    return { errors, offerType };
  }

  @Mutation(() => OfferTypeResponse, { nullable: true })
  async addOfferTypeCriterias(
    @Arg("id") id: number,
    @Arg("criteriaIds", () => [Number])
    criteriaIds: number[]
  ): Promise<OfferTypeResponse> {
    let offerType = await OfferType.findOne(id, { relations: ["criterias"] });
    if (!offerType) {
      return {
        errors: [{ field: "id", message: "Le type d'offre est introuvable" }],
      };
    }

    const errors: FieldError[] = [];

    if (typeof criteriaIds !== "undefined" && criteriaIds.length > 0) {
      let criteriasCheck = await addCriteriasInList(
        offerType.criterias,
        criteriaIds
      );
      errors.push(...criteriasCheck.errors);
      offerType.criterias = criteriasCheck.criterias;
    }

    await OfferType.save(offerType!);
    return { errors, offerType };
  }

  @Mutation(() => OfferTypeResponse, { nullable: true })
  async removeOfferTypeCriterias(
    @Arg("id") id: number,
    @Arg("criteriaIds", () => [Number])
    criteriaIds: number[]
  ): Promise<OfferTypeResponse> {
    let offerType = await OfferType.findOne(id, { relations: ["criterias"] });
    if (!offerType) {
      return {
        errors: [{ field: "id", message: "Le type d'offre est introuvable" }],
      };
    }

    const errors: FieldError[] = [];

    if (typeof criteriaIds !== "undefined" && criteriaIds.length > 0) {
      let criteriasCheck = removeCriteriasFromList(
        offerType.criterias,
        criteriaIds
      );
      errors.push(...criteriasCheck.errors);
      offerType.criterias = criteriasCheck.criterias;
    }

    offerType = await OfferType.save(offerType);
    return { errors, offerType };
  }

  @Mutation(() => Boolean)
  async deleteOfferType(@Arg("id") id: number): Promise<boolean> {
    await OfferType.delete(id);
    return true;
  }
}
