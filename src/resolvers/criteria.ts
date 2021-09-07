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
import { BooleanValues, CriteriaInput } from "./CriteriaInput";
import { Offer } from "../entities/Offer";
import { OfferCriteria } from "../entities/OfferCriteria";
import { OfferResponse } from "./offer";

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
  criterias(
    @Arg("offerTypeId", { nullable: true }) offerTypeId: number
  ): Promise<Criteria[]> {
    let criteriasQuery = Criteria.createQueryBuilder(
      "criteria"
    ).innerJoinAndSelect("criteria.offerTypes", "offerType");

    if (typeof offerTypeId !== "undefined") {
      if (!OfferType.findOne(offerTypeId)) {
        return Promise.resolve([]);
      }

      criteriasQuery = criteriasQuery
        .where("offerType.id = :offerType", { offerType: offerTypeId })
        .orWhere("criteria.isGlobal = true");
    }

    return criteriasQuery.getMany();
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
    const criteria = await Criteria.findOne(id, { relations: ["offerTypes"] });
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
          if (criteria.offerTypes.find((offerType) => offerType.id === id)) {
            errors.push({
              field: "offerTypeIds",
              message: `Le type d'offre ${id} (${offerType.name}) est déjà présent dans la liste`,
            });
          } else {
            criteria.offerTypes.push(offerType);
          }
        } else {
          errors.push({
            field: "offerTypeIds",
            message: `Le type d'offre ${id} est introuvable`,
          });
        }
      });
    }

    await Criteria.save(criteria);
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

    await Criteria.save(criteria);
    return { errors, criteria };
  }

  @Mutation(() => OfferResponse)
  async addOfferCriterias(
    @Arg("offerId") id: number,
    @Arg("criterias", () => [CriteriaInput])
    criterias: CriteriaInput[]
  ): Promise<OfferResponse> {
    let offer = await Offer.findOne(id, {
      relations: ["offerCriterias", "offerType"],
    });
    if (!offer) {
      return {
        errors: [{ field: "offerId", message: "L'offre est introuvable" }],
      };
    }

    console.log(offer);

    const errors: FieldError[] = [];

    let compatibleCriterias = await this.criterias(offer.offerType.id);

    if (typeof criterias !== "undefined" && criterias.length > 0) {
      criterias.forEach(async (offerCriteria) => {
        if (
          offer!.offerCriterias.find(
            (existingCriteria) =>
              existingCriteria.criteria.id === offerCriteria.id
          )
        ) {
          errors.push({
            field: "criterias",
            message: `Le critère ${offerCriteria.id} est déjà défini sur l'offre`,
          });
        } else {
          let criteria = await Criteria.findOne(offerCriteria.id, {
            relations: ["offerTypes"],
          });
          if (criteria) {
            if (
              compatibleCriterias.find(
                (criteria) => criteria.id === offerCriteria.id
              )
            ) {
              if (
                (criteria.criteriaType === "int" &&
                  offerCriteria.value.match(/^\d+$/)) ||
                (criteria.criteriaType === "boolean" &&
                  Object.values(BooleanValues).includes(offerCriteria.value)) ||
                criteria.criteriaType === "string"
              ) {
                try {
                  await OfferCriteria.create({
                    offer: offer,
                    criteria: criteria,
                    value: offerCriteria.value,
                  }).save();
                } catch (err) {
                  console.log(err.code + " " + err.detail);
                  errors.push({
                    field: "unknown",
                    message:
                      "Erreur inconnue, veuillez contacter l'administrateur",
                  });
                }
              } else {
                errors.push({
                  field: "criterias",
                  message: `La valeur pour le critère ${offerCriteria.id} (${criteria.name}) ne correspond pas au type de critère`,
                });
              }
            } else {
              errors.push({
                field: "criterias",
                message: `Le critère ${offerCriteria.id} (${criteria.name}) est incompatible avec le type d'offre`,
              });
            }
          } else {
            errors.push({
              field: "criterias",
              message: `Le critère ${offerCriteria.id} est introuvable`,
            });
          }
        }
      });

      await new Promise((r) => setTimeout(r, 20)); // Pas le choix pour afficher les éléments mis à jour

      let updatedOffer = await Offer.findOne(id, {
        relations: ["offerCriterias"],
      });

      return { errors, offer: updatedOffer };
    } else {
      return {
        errors: [
          { field: "criterias", message: "Il n'y a aucun critère à ajouter" },
        ],
      };
    }
  }

  @Mutation(() => OfferResponse)
  async removeOfferCriterias(
    @Arg("offerId") id: number,
    @Arg("criteriaIds", () => [Number])
    criteriaIds: number[]
  ): Promise<OfferResponse> {
    let offer = await Offer.findOne(id, { relations: ["offerCriterias"] });
    if (!offer) {
      return {
        errors: [{ field: "offerId", message: "L'offre est introuvable" }],
      };
    }

    const errors: FieldError[] = [];

    if (typeof criteriaIds !== "undefined" && criteriaIds.length > 0) {
      criteriaIds.forEach(async (criteriaId) => {
        let foundOfferCriteria = offer!.offerCriterias.find(
          (offerCriteria) => offerCriteria.criteria.id == criteriaId
        );

        if (typeof foundOfferCriteria !== "undefined") {
          await OfferCriteria.remove(foundOfferCriteria);
        } else {
          errors.push({
            field: "criterias",
            message: `Le critère ${criteriaId} est introuvable sur cette offre`,
          });
        }
      });

      await new Promise((r) => setTimeout(r, 20)); // Pas le choix pour afficher les éléments mis à jour

      let updatedOffer = await Offer.findOne(id, {
        relations: ["offerCriterias"],
      });

      return Promise.resolve({ errors, offer: updatedOffer });
    } else {
      return {
        errors: [
          { field: "criterias", message: "Il n'y a aucun critère à supprimer" },
        ],
      };
    }
  }

  @Mutation(() => Boolean)
  async deleteCriteria(@Arg("id") id: number): Promise<boolean> {
    await Criteria.delete(id);
    return true;
  }
}
