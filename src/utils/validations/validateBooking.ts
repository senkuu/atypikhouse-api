import { FieldError } from "../../resolvers/FieldError";
import {
  CreateBookingInput,
  UpdateBookingInput,
} from "../../resolvers/inputs/BookingInput";
import { ceilNumber } from "../ceilNumber";
import {
  Booking,
  BookingStatuses,
  CancelReasons,
} from "../../entities/Booking";
import { validateCreateDates, validateDates } from "./validateDates";

export const validateBooking = (
  options: CreateBookingInput | UpdateBookingInput,
  entity?: Booking
): FieldError[] => {
  const errors: FieldError[] = [];

  if (options instanceof CreateBookingInput) {
    if (typeof options.offerId === "undefined") {
      errors.push({
        field: "offer",
        message: "L'offre n'est pas renseignée",
      });
    }

    if (typeof options.occupantId === "undefined") {
      errors.push({
        field: "occupant",
        message: "Le compte voyageur n'est pas renseigné",
      });
    }

    if (typeof options.adults === "undefined") {
      errors.push({
        field: "adults",
        message: "Le nombre d'adultes n'est pas défini",
      });
    }

    if (typeof options.children === "undefined") {
      errors.push({
        field: "children",
        message: "Le nombre d'enfants n'est pas défini",
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

    errors.push(...validateCreateDates(options));

    if (typeof options.status === "undefined") {
      errors.push({
        field: "status",
        message: "Le statut n'est pas renseigné",
      });
    }
  }

  const adultsLimit = 16;
  if (typeof options.adults !== "undefined") {
    if (options.adults < 1) {
      errors.push({
        field: "adults",
        message: "Il doit y avoir au minimum 1 adulte",
      });
    } else if (options.adults > adultsLimit) {
      errors.push({
        field: "adults",
        message: "Le nombre d'adultes est limité à " + adultsLimit,
      });
    }
  }

  const childrenLimit = 16;
  if (typeof options.children !== "undefined") {
    if (options.children > childrenLimit || options.children < 0) {
      errors.push({
        field: "children",
        message: "Le nombre d'enfants est limité à " + childrenLimit,
      });
    }
  }

  const maxPriceHT = 100000;
  if (typeof options.priceHT !== "undefined") {
    if (options.priceHT > maxPriceHT) {
      errors.push({
        field: "priceHT",
        message: `Le prix hors taxe est limité à ${maxPriceHT}€`,
      });
    } else if (options.priceHT < 0) {
      errors.push({
        field: "priceHT",
        message: "Le prix hors taxe ne peut être négatif",
      });
    }
  }

  const maxPriceTTC = maxPriceHT * 1.2;
  if (typeof options.priceTTC !== "undefined") {
    if (options.priceTTC > maxPriceTTC) {
      errors.push({
        field: "priceTTC",
        message: `Le prix TTC est limité à ${maxPriceTTC}€`,
      });
    } else if (options.priceTTC < 0) {
      errors.push({
        field: "priceTTC",
        message: "Le prix TTC ne peut être négatif",
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

  errors.push(...validateDates(options, entity));

  // TODO : Vérifier la touristTax dans booking.ts avec les informations de l'offre, pour vérifier si le calcul taxe offre*nb personnes = taxe résa
  if (typeof options.touristTax !== "undefined") {
    if (options.touristTax !== 0 && options.touristTax < 0.2) {
      errors.push({
        field: "touristTax",
        message:
          "La taxe de séjour doit être égale à zéro ou être au minimum de 0.20€",
      });
    }
  }

  if (typeof options.cancelReason !== "undefined") {
    if (!Object.values(CancelReasons).includes(options.cancelReason)) {
      errors.push({
        field: "cancelReason",
        message: "La raison d'annulation est incorrecte",
      });
    }
  }

  if (typeof options.status !== "undefined") {
    if (!Object.values(BookingStatuses).includes(options.status)) {
      errors.push({
        field: "status",
        message: "Le statut est incorrect",
      });
    }
  }

  return errors;
};
