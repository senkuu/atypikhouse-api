import {
  Arg,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";

import { Booking, BookingStatuses } from "../entities/Booking";
import { Offer } from "../entities/Offer";
import { User } from "../entities/User";
import { FindConditions, Not } from "typeorm";
import { CreateBookingInput, UpdateBookingInput } from "./inputs/BookingInput";
import { FieldError } from "./FieldError";
import { getErrorFields } from "../utils/getErrorFields";
import {
  checkBookingDates,
  validateBooking,
} from "../utils/validations/validateBooking";
import { createEntity } from "../utils/createEntity";
import { updateEntity } from "../utils/updateEntity";

@ObjectType()
class BookingResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Booking, { nullable: true })
  booking?: Booking;
}

@Resolver()
export class BookingResolver {
  @Query(() => [Booking], { nullable: true })
  async bookings(
    @Arg("offerId", { nullable: true }) offerId?: number,
    @Arg("hideCancelled", { nullable: true }) hideCancelled?: boolean
  ): Promise<Booking[] | null> {
    let findConditions: FindConditions<Booking> = {};
    if (hideCancelled) {
      findConditions["status"] = Not(BookingStatuses.CANCELLED);
    }

    if (typeof offerId !== "undefined") {
      const offer = await Offer.findOne(offerId);
      if (!offer) {
        return null;
      }

      findConditions["offer"] = offer;
    }

    return Booking.find({
      relations: ["offer", "occupant"],
      where: findConditions,
    });
  }

  @Query(() => Booking, { nullable: true })
  booking(@Arg("id") id: number): Promise<Booking | undefined> {
    return Booking.findOne(id, { relations: ["offer", "occupant"] });
  }

  // TODO: Ignorer la vérification de dates sur des résas annulées
  @Mutation(() => BookingResponse)
  async createBooking(
    @Arg("options") options: CreateBookingInput
  ): Promise<BookingResponse> {
    const errors: FieldError[] = validateBooking(options);
    let errorFields = getErrorFields(errors);

    let offer: Offer | undefined;
    if (typeof options.offerId !== "undefined") {
      offer = await Offer.findOne(options.offerId);
      if (!offer) {
        errors.push({
          field: "offer",
          message: "L'offre est introuvable",
        });
      }
    }

    let occupant: User | undefined;
    if (typeof options.occupantId !== "undefined") {
      occupant = await User.findOne(options.occupantId);
      if (!occupant) {
        errors.push({
          field: "occupant",
          message: "Le compte voyageur est introuvable",
        });
      }
    }

    if (
      !errorFields.includes("startDate") &&
      !errorFields.includes("endDate") &&
      offer
    ) {
      const existingBookings = await this.bookings(options.offerId, true);
      const checkDatesErrors = await checkBookingDates(
        offer,
        options.startDate,
        options.endDate,
        existingBookings
      );
      errors.push(...checkDatesErrors);
    }

    if (errors.length > 0) {
      return { errors };
    }

    let booking: Booking;
    try {
      booking = await createEntity(
        options,
        "Booking",
        ["offerId", "occupantId"],
        {
          offer: offer,
          occupant: occupant,
        }
      );

      return { errors, booking };
    } catch (err) {
      console.log(err.code + " " + err.detail);
      errors.push({
        field: "unknown",
        message: "Erreur inconnue, veuillez contacter l'administrateur",
      });

      return { errors };
    }
  }

  // TODO : Faire la vérification de dates comme sur createBooking
  @Mutation(() => BookingResponse, { nullable: true })
  async updateBooking(
    @Arg("id") id: number,
    @Arg("options") options: UpdateBookingInput
  ): Promise<BookingResponse> {
    let booking = await this.booking(id);
    if (!booking) {
      return {
        errors: [{ field: "id", message: "La réservation est introuvable" }],
      };
    }

    const errors: FieldError[] = validateBooking(options, booking);
    let errorFields = getErrorFields(errors);

    if (errorFields.includes("startDate") || errorFields.includes("endDate")) {
      options.startDate = booking.startDate;
      options.endDate = booking.endDate;
    } else {
      if (typeof options.startDate === "undefined") {
        options.startDate = booking.startDate;
      }
      if (typeof options.endDate === "undefined") {
        options.endDate = booking.endDate;
      }

      const existingBookings = await this.bookings(booking.offer.id, true);
      const checkDatesErrors = await checkBookingDates(
        booking.offer,
        options.startDate,
        options.endDate,
        existingBookings
      );
      errors.push(...checkDatesErrors);
    }

    booking = await updateEntity(booking, options, errors);
    booking = await Booking.save(booking);

    return { errors, booking };
  }

  @Mutation(() => Boolean)
  async deleteBooking(@Arg("id") id: number): Promise<boolean> {
    await Booking.delete(id);
    return true;
  }
}
