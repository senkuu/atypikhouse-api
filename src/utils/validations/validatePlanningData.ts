import { FieldError } from "../../resolvers/FieldError";
import { validateCreateDates, validateDates } from "./validateDates";
import {
  AddPlanningDataInput,
  UpdatePlanningDataInput,
} from "../../resolvers/inputs/PlanningInput";
import { Planning } from "../../entities/Planning";

export const validatePlanningData = (
  options: AddPlanningDataInput | UpdatePlanningDataInput,
  entity?: Planning
): FieldError[] => {
  const errors: FieldError[] = [];

  if (options instanceof AddPlanningDataInput) {
    if (
      typeof options.offerId === "undefined" &&
      typeof options.ownerId === "undefined"
    ) {
      errors.push({
        field: "offer",
        message:
          "L'offre et le propriétaire ne sont pas renseignés : merci d'indiquer l'une des deux informations",
      });

      errors.push({
        field: "owner",
        message:
          "L'offre et le propriétaire ne sont pas renseignés : merci d'indiquer l'une des deux informations",
      });
    }

    errors.push(...validateCreateDates(options));
  }

  errors.push(...validateDates(options, entity));

  return errors;
};
