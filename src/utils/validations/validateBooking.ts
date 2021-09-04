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
import { Offer } from "../../entities/Offer";
import { Planning } from "../../entities/Planning";

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

    if (typeof options.status === "undefined") {
      errors.push({
        field: "status",
        message: "Le statut n'est pas renseigné",
      });
    }
  }

  // Faire la récup owner, offerType et city dans createOffer après la vérif
  // Traiter description et titre

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
  } else if (options instanceof UpdateBookingInput) {
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

export const checkBookingDates = async (
  offer: Offer,
  startDate: Date,
  endDate: Date,
  existingBookings: Booking[] | null
): Promise<FieldError[]> => {
  const errors: FieldError[] = [];
  let notAvailable = false;

  if (
    existingBookings !== null &&
    existingBookings.some(
      (booking) => booking.endDate > startDate && booking.startDate < endDate
    )
  ) {
    notAvailable = true;
  }

  let planningData: Planning[] = [];

  let offerPlanningData = await Planning.find({
    where: { offer },
  });
  if (offerPlanningData !== null) {
    planningData.push(...offerPlanningData);
  }

  let ownerPlanningData = await Planning.find({
    where: { owner: offer.owner },
  });
  if (ownerPlanningData !== null) {
    planningData.push(...ownerPlanningData);
  }

  if (
    planningData !== null &&
    planningData.some(
      (data) => data.endDate > startDate && data.startDate < endDate
    )
  ) {
    notAvailable = true;
  }

  if (notAvailable) {
    errors.push({
      field: "startDate",
      message: "L'offre n'est pas disponible aux dates sélectionnées",
    });
    errors.push({
      field: "endDate",
      message: "L'offre n'est pas disponible aux dates sélectionnées",
    });
  }

  return errors;
};
