import {
  Arg,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { Planning } from "../entities/Planning";
import { Offer } from "../entities/Offer";
import { User } from "../entities/User";
import {
  AddPlanningDataInput,
  SearchPlanningDataInput,
  UpdatePlanningDataInput,
} from "./inputs/PlanningInput";
import { FieldError } from "./FieldError";
import { checkDatesAvailability } from "../utils/checkDatesAvailability";
import { createEntity } from "../utils/createEntity";
import { validatePlanningData } from "../utils/validations/validatePlanningData";
import { getErrorFields } from "../utils/getErrorFields";
import { updateEntity } from "../utils/updateEntity";

@ObjectType()
class PlanningDataResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Planning, { nullable: true })
  planningData?: Planning;
}

@Resolver()
export class PlanningResolver {
  // Si offerId est renseigné, affiche les indisponibilités hors réservations liées à cette offre. Si ownerId est renseigné seul (sans offerId) : n'affiche que les indisponibilités concernant l'intégralité des hébergements du propriétaire, et pas celles spécifiques à un lieu
  @Query(() => [Planning])
  async plannings(
    @Arg("options") options: SearchPlanningDataInput
  ): Promise<Planning[]> {
    if (typeof options.offerId !== "undefined") {
      const offer = await Offer.findOne(options.offerId);
      if (!offer) {
        return [];
      }

      return Planning.find({
        where: { offer },
        relations: ["offer"],
      });
    } else if (typeof options.ownerId !== "undefined") {
      const owner = await User.findOne(options.ownerId);
      if (!owner) {
        return [];
      }

      return Planning.find({
        where: { owner },
        relations: ["owner", "owner.offers"],
      });
    }

    return [];
  }

  // Si offerId est renseigné, ownerId est ignoré
  @Mutation(() => PlanningDataResponse)
  async addPlanningData(
    @Arg("options") options: AddPlanningDataInput
  ): Promise<PlanningDataResponse> {
    const errors: FieldError[] = validatePlanningData(options);

    let offer: Offer | undefined;
    let owner: User | undefined;
    if (typeof options.offerId !== "undefined") {
      offer = await Offer.findOne(options.offerId, { relations: ["owner"] });
      if (!offer) {
        errors.push({
          field: "offer",
          message: "L'offre est introuvable",
        });
      }
    } else if (typeof options.ownerId !== "undefined") {
      owner = await User.findOne(options.ownerId);
      if (!owner) {
        errors.push({
          field: "owner",
          message: "Le propriétaire est introuvable",
        });
      }
    }

    if (errors.length > 0) {
      return { errors };
    }

    const checkDatesErrors = await checkDatesAvailability(
      null,
      options.startDate,
      options.endDate,
      offer,
      owner
    );
    errors.push(...checkDatesErrors);

    if (errors.length > 0) {
      return { errors };
    }

    let planningData: Planning;
    try {
      planningData = await createEntity(
        options,
        "Planning",
        ["offerId", "ownerId"],
        {
          offer: offer,
          owner: owner,
        }
      );

      return { errors, planningData };
    } catch (err) {
      console.log(err.code + " " + err.detail);
      errors.push({
        field: "unknown",
        message: "Erreur inconnue, veuillez contacter l'administrateur",
      });

      return { errors };
    }
  }

  @Mutation(() => PlanningDataResponse, { nullable: true })
  async updatePlanningData(
    @Arg("id") id: number,
    @Arg("options") options: UpdatePlanningDataInput
  ): Promise<PlanningDataResponse> {
    let planningData = await Planning.findOne(id, {
      relations: ["offer", "owner", "offer.owner"],
    });
    if (!planningData) {
      return {
        errors: [
          { field: "id", message: "L'élément de planning est introuvable" },
        ],
      };
    }

    const errors: FieldError[] = validatePlanningData(options, planningData);
    let errorFields = getErrorFields(errors);

    if (errorFields.includes("startDate") || errorFields.includes("endDate")) {
      options.startDate = planningData.startDate;
      options.endDate = planningData.endDate;
    } else {
      if (typeof options.startDate === "undefined") {
        options.startDate = planningData.startDate;
      }
      if (typeof options.endDate === "undefined") {
        options.endDate = planningData.endDate;
      }

      const checkDatesErrors = await checkDatesAvailability(
        planningData,
        options.startDate,
        options.endDate,
        planningData.offer,
        planningData.owner
      );
      errors.push(...checkDatesErrors);
    }

    planningData = await updateEntity(planningData, options, errors);
    planningData = await Planning.save(planningData);

    return { errors, planningData };
  }

  @Mutation(() => Boolean)
  async removePlanningData(@Arg("id") id: number): Promise<boolean> {
    await Planning.delete(id);
    return true;
  }
}
