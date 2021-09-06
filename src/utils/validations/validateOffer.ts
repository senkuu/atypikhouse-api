import { FieldError } from "../../resolvers/FieldError";
import {
  CreateOfferInput,
  UpdateOfferInput,
} from "../../resolvers/inputs/OfferInput";
import { DeleteReasons } from "../../entities/DeleteReasons";
import { OfferStatuses } from "../../entities/Offer";
import { ceilNumber } from "../ceilNumber";

export const validateOffer = (
  options: CreateOfferInput | UpdateOfferInput
): FieldError[] => {
  const errors: FieldError[] = [];

  if (options instanceof CreateOfferInput) {
    if (typeof options.title === "undefined") {
      errors.push({
        field: "title",
        message: "Le titre n'est pas défini",
      });
    }

    if (typeof options.description === "undefined") {
      errors.push({
        field: "description",
        message: "La description n'est pas définie",
      });
    }

    if (typeof options.touristTax === "undefined") {
      errors.push({
        field: "touristTax",
        message: "La taxe de séjour n'est pas définie",
      });
    }

    if (typeof options.priceHT === "undefined") {
      errors.push({
        field: "priceHT",
        message: "Le prix hors taxe n'est pas défini",
      });
    }

    if (typeof options.priceTTC === "undefined") {
      errors.push({
        field: "priceTTC",
        message: "Le prix TTC n'est pas défini",
      });
    }

    if (typeof options.cityId === "undefined") {
      errors.push({
        field: "city",
        message: "La ville n'est pas renseignée",
      });
    }

    if (typeof options.ownerId === "undefined") {
      errors.push({
        field: "owner",
        message: "Le propriétaire n'est pas renseigné",
      });
    }

    if (typeof options.offerTypeId === "undefined") {
      errors.push({
        field: "offerType",
        message: "Le type d'offre n'est pas renseigné",
      });
    }

    if (typeof options.status === "undefined") {
      errors.push({
        field: "status",
        message: "Le statut n'est pas renseigné",
      });
    }
  }

  const titleLimit = 64;
  if (typeof options.title !== "undefined") {
    if (options.title.length > titleLimit) {
      errors.push({
        field: "title",
        message: `Le titre est limité à ${titleLimit} caractères`,
      });
    } else if (options.title.length === 0) {
      errors.push({
        field: "title",
        message: `Un titre est nécessaire (${titleLimit} caractères maximum)`,
      });
    }
  }

  const descriptionLimit = 2000;
  if (typeof options.description !== "undefined") {
    if (options.description.length > descriptionLimit) {
      errors.push({
        field: "description",
        message: `La description est limitée à ${descriptionLimit} caractères`,
      });
    } else if (options.description.length === 0) {
      errors.push({
        field: "description",
        message: `Une description est nécessaire (${descriptionLimit} caractères maximum)`,
      });
    }
  }

  if (
    typeof options.coordinates !== "undefined" &&
    options.coordinates !== null &&
    "latitude" in options.coordinates &&
    "longitude" in options.coordinates
  ) {
    if (
      options.coordinates.latitude < -90 ||
      options.coordinates.latitude > 90 ||
      options.coordinates.longitude < -180 ||
      options.coordinates.longitude > 180
    ) {
      errors.push({
        field: "coordinates",
        message: "Les coordonnées sont incorrectes",
      });
    }
  }

  const addressLimit = 64;
  if (typeof options.address !== "undefined") {
    if (options.address.length > addressLimit) {
      errors.push({
        field: "address",
        message: `L'adresse est limitée à ${addressLimit} caractères`,
      });
    }
  }

  if (typeof options.touristTax !== "undefined") {
    if (
      !(
        (options.touristTax >= 0.2 && options.touristTax <= 4.2) ||
        options.touristTax === 0
      )
    ) {
      errors.push({
        field: "touristTax",
        message:
          "La taxe de séjour doit être égale à zéro ou entre 0.20€ et 4.20€",
      });
    }
  }

  const minPriceHT = 20;
  if (typeof options.priceHT !== "undefined") {
    if (options.priceHT < minPriceHT) {
      errors.push({
        field: "priceHT",
        message: `Le prix hors taxe doit être au minimum de ${minPriceHT}€`,
      });
    }
  }

  const minPriceTTC = minPriceHT * 1.2;
  if (typeof options.priceTTC !== "undefined") {
    if (options.priceTTC < minPriceTTC) {
      errors.push({
        field: "priceTTC",
        message: `Le prix TTC doit être au minimum de ${minPriceTTC}€`,
      });
    }
  }

  if (
    typeof options.priceHT !== "undefined" &&
    typeof options.priceTTC !== "undefined"
  ) {
    if (ceilNumber(options.priceHT * 1.2, 2) !== options.priceTTC) {
      errors.push({
        field: "priceHT",
        message: "Le prix hors taxe ne correspond pas au prix TTC",
      });

      errors.push({
        field: "priceTTC",
        message: "Le prix TTC ne correspond pas au prix hors taxe",
      });
    }
  }

  if (typeof options.deleteReason !== "undefined") {
    if (!Object.values(DeleteReasons).includes(options.deleteReason)) {
      errors.push({
        field: "deleteReason",
        message: "La raison de suppression est incorrecte",
      });
    }
  }

  if (typeof options.status !== "undefined") {
    if (!Object.values(OfferStatuses).includes(options.status)) {
      errors.push({
        field: "status",
        message: "Le statut est incorrect",
      });
    }
  }

  return errors;
};
