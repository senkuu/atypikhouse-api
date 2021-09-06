import { FieldError } from "../../resolvers/FieldError";
import {
  CreateReviewInput,
  UpdateReviewInput,
} from "../../resolvers/inputs/ReviewInput";

export const validateReview = (
  options: CreateReviewInput | UpdateReviewInput
): FieldError[] => {
  const errors: FieldError[] = [];

  if (options instanceof CreateReviewInput) {
    if (typeof options.bookingId === "undefined") {
      errors.push({
        field: "booking",
        message: "La réservation n'est pas renseignée",
      });
    }

    if (typeof options.text === "undefined") {
      errors.push({
        field: "text",
        message: "Le texte de l'avis n'est pas défini",
      });
    }

    if (typeof options.rating === "undefined") {
      errors.push({
        field: "rating",
        message: "La note n'est pas définie",
      });
    }
  }

  const textLimit = 1000;
  if (typeof options.text !== "undefined") {
    if (options.text.length > textLimit) {
      errors.push({
        field: "text",
        message: `Le texte de l'avis est limité à ${textLimit} caractères`,
      });
    } else if (options.text.length === 0) {
      errors.push({
        field: "text",
        message: `Un texte est nécessaire (${textLimit} caractères maximum)`,
      });
    }
  }

  const ratingLimit = 5;
  if (typeof options.rating !== "undefined") {
    if (options.rating > ratingLimit || options.rating < 1) {
      errors.push({
        field: "rating",
        message: "La note doit être comprise entre 1 et " + ratingLimit,
      });
    }

    if (!Number.isInteger(options.rating)) {
      errors.push({
        field: "rating",
        message: "La note doit être un nombre entier",
      });
    }
  }

  return errors;
};
