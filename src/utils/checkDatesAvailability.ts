import { FieldError } from "../resolvers/FieldError";
import { User } from "../entities/User";
import { Offer } from "../entities/Offer";
import { Planning } from "../entities/Planning";
import { Booking, BookingStatuses } from "../entities/Booking";
import { FindOperator, Not } from "typeorm";

// owner should only be used for planning data management, to retrieve all planning data related to him and every booking on his offers
// / entity should only be used for update purposes
export const checkDatesAvailability = async (
  entity: Booking | Planning | null,
  startDate: Date,
  endDate: Date,
  offer: Offer | undefined,
  owner?: User
): Promise<FieldError[]> => {
  const errors: FieldError[] = [];
  let notAvailable = false;

  let bookingIdToIgnore: number = entity instanceof Booking ? entity.id : 0;
  let planningIdToIgnore: FindOperator<number> =
    entity instanceof Planning ? Not(entity.id) : Not(0);

  let existingBookings: Booking[] = [];
  if (typeof offer !== "undefined" && offer !== null) {
    existingBookings = await Booking.find({
      where: {
        offer,
        status: Not(BookingStatuses.CANCELLED),
        id: Not(bookingIdToIgnore),
      },
    });
  } else if (typeof owner !== "undefined" && owner !== null) {
    existingBookings = await Booking.createQueryBuilder("booking")
      .innerJoinAndSelect("booking.offer", "offer")
      .innerJoinAndSelect("offer.owner", "owner")
      .where("owner.id = :owner", { owner: owner.id })
      .andWhere("booking.status != :status", {
        status: BookingStatuses.CANCELLED,
      })
      .andWhere("booking.id != :id", { id: bookingIdToIgnore })
      .getMany();
  }

  if (
    existingBookings.length > 0 &&
    existingBookings.some(
      (booking) => booking.endDate > startDate && booking.startDate < endDate
    )
  ) {
    notAvailable = true;
  }

  let getAllOffersFromOwner: boolean = false;
  if (typeof owner !== "undefined" && owner !== null) {
    if (entity instanceof Planning) {
      getAllOffersFromOwner = true;
    }
  }

  if (
    (typeof owner === "undefined" || owner === null) &&
    typeof offer !== "undefined" &&
    offer !== null
  ) {
    owner = offer.owner;
  }

  let planningData = await Planning.find({
    where: [
      { offer, id: planningIdToIgnore },
      { owner, id: planningIdToIgnore },
    ],
  });

  if (getAllOffersFromOwner) {
    const ownerOffers = await Planning.createQueryBuilder("planning")
      .innerJoinAndSelect("planning.offer", "offer")
      .innerJoinAndSelect("offer.owner", "owner")
      .where("owner.id = :owner", { owner: owner!.id })
      .getMany();

    planningData.push(...ownerOffers);
  }

  if (
    planningData.length > 0 &&
    planningData.some(
      (data) => data.endDate > startDate && data.startDate < endDate
    )
  ) {
    notAvailable = true;
  }

  if (notAvailable) {
    errors.push({
      field: "startDate",
      message: "Impossible de choisir les dates sélectionnées",
    });
    errors.push({
      field: "endDate",
      message: "Impossible de choisir les dates sélectionnées",
    });
  }

  return errors;
};
