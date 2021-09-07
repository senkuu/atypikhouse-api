import { FieldError } from "../../resolvers/FieldError";
import {
  CreateCriteriaInput,
  UpdateCriteriaInput,
} from "../../resolvers/inputs/CriteriaInput";
import { Criteria, CriteriaTypes } from "../../entities/Criteria";
import { getErrorFields } from "../getErrorFields";

export const validateCriteria = (
  options: CreateCriteriaInput | UpdateCriteriaInput,
  entity?: Criteria
): FieldError[] => {
  const errors: FieldError[] = [];

  if (options instanceof CreateCriteriaInput) {
    if (typeof options.name === "undefined") {
      errors.push({
        field: "name",
        message: "Le nom n'est pas renseigné",
      });
    }

    // Voir si fonctionnel lorsque la case n'est pas cochée
    if (typeof options.isGlobal === "undefined") {
      errors.push({
        field: "isGlobal",
        message:
          "La condition d'application à tous les types d'offres n'est pas précisée",
      });
    }

    if (typeof options.criteriaType === "undefined") {
      errors.push({
        field: "criteriaType",
        message: "Le type de critère n'est pas renseigné",
      });
    } else if (!Object.values(CriteriaTypes).includes(options.criteriaType)) {
      errors.push({
        field: "criteriaType",
        message: "Le type de critère est incorrect",
      });
    }
  }

  const nameLimit = 32;
  if (typeof options.name !== "undefined") {
    if (options.name.length > nameLimit) {
      errors.push({
        field: "name",
        message: `Le nom est limité à ${nameLimit} caractères`,
      });
    } else if (options.name.length === 0) {
      errors.push({
        field: "name",
        message: `Un nom est nécessaire (${nameLimit} caractères maximum)`,
      });
    }
  }

  let errorFields = getErrorFields(errors);

  const additionalLimit = 32;
  if (typeof options.additional !== "undefined") {
    if (options.additional.length > additionalLimit) {
      errors.push({
        field: "additional",
        message: `Le texte additionnel est limité à ${additionalLimit} caractères`,
      });
    } else if (
      options.additional.length > 0 &&
      ((options instanceof UpdateCriteriaInput &&
        entity!.criteriaType === CriteriaTypes.BOOLEAN) ||
        (options instanceof CreateCriteriaInput &&
          !errorFields.includes("criteriaType") &&
          options.criteriaType === "boolean"))
    ) {
      errors.push({
        field: "additional",
        message: `Il ne peut pas y avoir de texte additionnel sur un critère booléen`,
      });
    }
  }

  return errors;
};
