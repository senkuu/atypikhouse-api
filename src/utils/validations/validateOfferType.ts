import { FieldError } from "../../resolvers/FieldError";
import {
  CreateOfferTypeInput,
  UpdateOfferTypeInput,
} from "../../resolvers/inputs/OfferTypeInput";

export const validateOfferType = (
  options: CreateOfferTypeInput | UpdateOfferTypeInput
): FieldError[] => {
  const errors: FieldError[] = [];

  if (
    options instanceof CreateOfferTypeInput &&
    typeof options.name === "undefined"
  ) {
    errors.push({
      field: "name",
      message: "Le nom n'est pas défini",
    });
  }

  if (typeof options.name !== "undefined" && options.name.length > 64) {
    errors.push({
      field: "name",
      message: "Le nom est limité à 64 caractères",
    });
  }

  return errors;
};
