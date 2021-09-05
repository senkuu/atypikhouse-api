import {
  CreateDatesInput,
  UpdateDatesInput,
} from "../../resolvers/inputs/DatesInput";
import { FieldError } from "../../resolvers/FieldError";
import { DatesEntity } from "../../entities/DatesEntity";

export const validateCreateDates = (
  options: CreateDatesInput
): FieldError[] => {
  const errors: FieldError[] = [];

  if (typeof options.startDate === "undefined") {
    errors.push({
      field: "startDate",
      message: "La date de début n'est pas défiinie",
    });
  }

  if (typeof options.endDate === "undefined") {
    errors.push({
      field: "endDate",
      message: "La date de fin n'est pas définie",
    });
  }

  return errors;
};

export const validateDates = (
  options: CreateDatesInput | UpdateDatesInput,
  entity?: DatesEntity
): FieldError[] => {
  const errors: FieldError[] = [];

  if (typeof options.startDate !== "undefined") {
    if (isNaN(options.startDate.getTime())) {
      errors.push({
        field: "startDate",
        message: "La date de début est incorrecte",
      });
      options.startDate = undefined;
    }
  }
  if (typeof options.endDate !== "undefined") {
    if (isNaN(options.endDate.getTime())) {
      errors.push({
        field: "endDate",
        message: "La date de fin est incorrecte",
      });
      options.endDate = undefined;
    }
  }

  if (
    typeof options.startDate !== "undefined" &&
    typeof options.endDate !== "undefined"
  ) {
    if (options.endDate <= options.startDate) {
      errors.push({
        field: "startDate",
        message: "La date de début doit se situer avant la date de fin",
      });
      errors.push({
        field: "endDate",
        message: "La date de fin doit se situer après la date de début",
      });
    }
  } else if (options instanceof UpdateDatesInput) {
    if (typeof options.startDate !== "undefined") {
      if (typeof entity === "undefined") {
        errors.push({
          field: "startDate",
          message:
            "Impossible de vérifier la validité de la date de début : veuillez contacter un administrateur",
        });
      } else if (entity.endDate <= options.startDate) {
        errors.push({
          field: "startDate",
          message: "La date de début doit se situer avant la date de fin",
        });
      }
    } else if (typeof options.endDate !== "undefined") {
      if (typeof entity === "undefined") {
        errors.push({
          field: "endDate",
          message:
            "Impossible de vérifier la validité de la date de fin : veuillez contacter un administrateur",
        });
      } else if (options.endDate <= entity.startDate) {
        errors.push({
          field: "endDate",
          message: "La date de fin doit se situer après la date de début",
        });
      }
    }
  }

  return errors;
};
