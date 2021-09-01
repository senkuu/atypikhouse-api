import { Arg, Mutation, Query, Resolver } from "type-graphql";

import { Booking, BookingStatuses, CancelReasons } from "../entities/Booking";
import { Offer } from "../entities/Offer";
import { User } from "../entities/User";
import { FindConditions, Not } from "typeorm";
import { Planning } from "../entities/Planning";

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

    let existingBookings = await this.bookings(offerId, true);

    if (
      existingBookings !== null &&
      existingBookings.some(
        (booking) => booking.endDate > startDate && booking.startDate < endDate
      )
    ) {
      return null;
    }

    let planningData: Planning[] = [];

    let offerPlanningData = await Planning.find({ where: { offer: offer } });
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

  // TODO : Faire la vérification de dates comme sur createBooking
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

    let startDateSave = booking.startDate;
    let endDateSave = booking.endDate;

    if (typeof startDate !== "undefined") {
      booking.startDate = startDate;
    }
    if (typeof endDate !== "undefined") {
      booking.endDate = endDate;
    }

    if (endDate < startDate) {
      booking.startDate = startDateSave;
      booking.endDate = endDateSave;
    }

    let existingBookings = await this.bookings(booking.offer.id, true);

    if (
      existingBookings !== null &&
      existingBookings.some(
        (booking) => booking.endDate > startDate && booking.startDate < endDate
      )
    ) {
      booking.startDate = startDateSave;
      booking.endDate = endDateSave;
    }

    let planningData: Planning[] = [];

    let offerPlanningData = await Planning.find({
      where: { offer: booking.offer },
    });
    if (offerPlanningData !== null) {
      planningData.push(...offerPlanningData);
    }

    let ownerPlanningData = await Planning.find({
      where: { owner: booking.offer.owner },
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
      booking.startDate = startDateSave;
      booking.endDate = endDateSave;
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
