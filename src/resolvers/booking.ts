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
import { CreateBookingInput, UpdateBookingInput } from "./inputs/BookingInput";
import { FieldError } from "./FieldError";
import { getErrorFields } from "../utils/getErrorFields";
import { validateBooking } from "../utils/validations/validateBooking";
import { createEntity } from "../utils/createEntity";
import { updateEntity } from "../utils/updateEntity";
import { checkDatesAvailability } from "../utils/checkDatesAvailability";

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
    @Arg("occupantId", { nullable: true }) occupantId?: number,
    @Arg("ownerId", { nullable: true }) ownerId?: number,
    @Arg("hideCancelled", { nullable: true }) hideCancelled?: boolean
  ): Promise<Booking[] | null> {
    let bookings = Booking.createQueryBuilder("booking")
      .innerJoinAndSelect("booking.offer", "offer")
      .innerJoinAndSelect("booking.occupant", "occupant")
      .innerJoinAndSelect("offer.owner", "owner")
      .leftJoinAndSelect("booking.review", "review");

    if (hideCancelled) {
      bookings = bookings.where("booking.status != :status", {
        status: BookingStatuses.CANCELLED,
      });
    }

    if (typeof offerId !== "undefined") {
      const offer = await Offer.findOne(offerId);
      if (!offer) {
        return [];
      }

      bookings = bookings.andWhere("offer.id = :offer", { offer: offer.id });
    }

    if (typeof occupantId !== "undefined") {
      const occupant = await User.findOne(occupantId);
      if (!occupant) {
        return [];
      }

      bookings = bookings.andWhere("occupant.id = :occupant", {
        occupant: occupant.id,
      });
    }

    if (typeof ownerId !== "undefined") {
      const owner = await User.findOne(ownerId);
      if (!owner) {
        return [];
      }

      bookings = bookings.andWhere("owner.id = :owner", { owner: owner.id });
    }

    return bookings.getMany();
  }

  @Query(() => Booking, { nullable: true })
  booking(@Arg("id") id: number): Promise<Booking | undefined> {
    return Booking.findOne(id, {
      relations: ["offer", "occupant", "offer.owner", "review"],
    });
  }

  @Mutation(() => BookingResponse)
  async createBooking(
    @Arg("options") options: CreateBookingInput
  ): Promise<BookingResponse> {
    const errors: FieldError[] = validateBooking(options);
    let errorFields = getErrorFields(errors);

    let offer: Offer | undefined;
    if (typeof options.offerId !== "undefined") {
      offer = await Offer.findOne(options.offerId, { relations: ["owner"] });
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
      const checkDatesErrors = await checkDatesAvailability(
        null,
        options.startDate,
        options.endDate,
        offer
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

    if (booking.status === BookingStatuses.CANCELLED) {
      return {
        errors: [
          {
            field: "id",
            message:
              "Impossible de modifier les informations d'une réservation annulée",
          },
        ],
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

      const checkDatesErrors = await checkDatesAvailability(
        booking,
        options.startDate,
        options.endDate,
        booking.offer
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
