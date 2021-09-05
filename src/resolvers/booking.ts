import { Arg, Mutation, Query, Resolver } from "type-graphql";

import { Booking, BookingStatuses, CancelReasons } from "../entities/Booking";
import { Offer } from "../entities/Offer";
import { User } from "../entities/User";

@Resolver()
export class BookingResolver {
  @Query(() => [Booking], { nullable: true })
  async bookings(
    @Arg("offerId", { nullable: true }) offerId?: number,
    @Arg("occupantId", { nullable: true }) occupantId?: number,
    @Arg("ownerId", { nullable: true }) ownerId?: number,
    @Arg("hideCancelled", { nullable: true }) hideCancelled?: boolean
  ): Promise<Booking[] | null> {
    let bookings = await Booking.createQueryBuilder("booking")
      .innerJoinAndSelect("booking.offer", "offer")
      .innerJoinAndSelect("booking.occupant", "occupant")
      .innerJoinAndSelect("offer.owner", "owner");

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
    return Booking.findOne(id, { relations: ["offer", "occupant"] });
  }

  @Mutation(() => Booking)
  async createBooking(
    @Arg("offerId") offerId: number,
    @Arg("occupantId") occupantId: number,
    @Arg("adults") adults: number,
    @Arg("children") children: number,
    @Arg("priceHT") priceHT: number,
    @Arg("priceTTC") priceTTC: number,
    @Arg("startDate")
    startDate: Date,
    @Arg("endDate") endDate: Date,
    @Arg("status") status: BookingStatuses,
    @Arg("cancelReason") cancelReason: CancelReasons
  ): Promise<Booking | null> {
    const offer = await Offer.findOne(offerId);
    if (!offer) {
      return null;
    }

    const occupant = await User.findOne(occupantId);
    if (!occupant) {
      return null;
    }

    // Vérifier si utile, et le cas échéant si fonctionnel
    if (typeof startDate === "undefined" || typeof endDate === "undefined") {
      return null;
    }

    if (typeof adults === "undefined" || typeof children === "undefined") {
      return null;
    }

    if (typeof priceHT === "undefined" || typeof priceTTC === "undefined") {
      return null;
    }

    // TODO: Erreur explicite à indiquer
    if (endDate < startDate) {
      return null;
    }

    if (typeof status === "string") {
      if (!Object.values(BookingStatuses).includes(status)) {
        status = BookingStatuses.WAITING_APPROVAL;
      }
    } else {
      status = BookingStatuses.WAITING_APPROVAL;
    }

    if (typeof cancelReason === "string") {
      if (!Object.values(CancelReasons).includes(cancelReason)) {
        cancelReason = CancelReasons.UNKNOWN;
      }
    } else {
      cancelReason = CancelReasons.UNKNOWN;
    }

    return Booking.create({
      offer,
      occupant,
      adults,
      children,
      priceHT,
      priceTTC,
      startDate,
      endDate,
      status,
      cancelReason,
    }).save();
  }

  @Mutation(() => Booking, { nullable: true })
  async updateBooking(
    @Arg("id") id: number,
    @Arg("startDate", () => Date, { nullable: true }) startDate: Date,
    @Arg("endDate", () => Date, { nullable: true }) endDate: Date,
    @Arg("status", { nullable: true }) status: BookingStatuses,
    @Arg("cancelReason", { nullable: true }) cancelReason: CancelReasons
  ): Promise<Booking | null> {
    const booking = await Booking.findOne(id);
    if (!booking) {
      return null;
    }
    if (typeof startDate !== "undefined") {
      booking.startDate = startDate;
    }
    if (typeof endDate !== "undefined") {
      booking.endDate = endDate;
    }
    if (typeof status === "string") {
      if (Object.values(BookingStatuses).includes(status)) {
        booking.status = status;
      }
    }
    if (typeof cancelReason === "string") {
      if (Object.values(CancelReasons).includes(cancelReason)) {
        booking.cancelReason = cancelReason;
      }
    }

    Booking.update({ id }, { ...booking });
    return booking;
  }

  @Mutation(() => Boolean)
  async deleteBooking(@Arg("id") id: number): Promise<boolean> {
    await Booking.delete(id);
    return true;
  }
}
