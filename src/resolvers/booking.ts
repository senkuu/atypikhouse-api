import { Query, Resolver, Arg, Mutation } from "type-graphql";

import { Booking } from "../entities/Booking";
//import {BookingStatuses, CancelReasons} from "../entities/Booking";
import {Offer} from "../entities/Offer";
import {User} from "../entities/User";

@Resolver()
export class BookingResolver {
  @Query(() => [Booking])
  bookings(): Promise<Booking[]> {
    return Booking.find();
  }

  @Query(() => Booking, { nullable: true })
  booking(@Arg("id") id: number): Promise<Booking | undefined> {
    return Booking.findOne(id);
  }

  @Mutation(() => Booking)
  async createBooking(
    @Arg("offer") offerId: number,
    @Arg("occupant") occupantId: number,
    @Arg("startDate") startDate: Date,
    @Arg("endDate") endDate: Date,
    /*@Arg("status", type => BookingStatuses) status: BookingStatuses,
    @Arg("cancelReason", type => CancelReasons) cancelReason: CancelReasons,*/

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
    if(typeof startDate === "undefined" || typeof endDate === "undefined")
    {
      return null;
    }

    // Faire vérifications sur les enums lorsque le fonctionnement sera confirmé

    return Booking.create({ offer, occupant, startDate, endDate/*, status, cancelReason*/ }).save();
  }

  @Mutation(() => Booking, { nullable: true })
  async updateBooking(
    @Arg("id") id: number,
    @Arg("startDate", () => Date, { nullable: true }) startDate: Date,
    @Arg("endDate", () => Date, { nullable: true }) endDate: Date,
    // Voir comment gérer les enums dans les arguments ici (status et cancelReason)
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
    // Voir ici comment gérer les MaJ d'enums
    Booking.update({ id }, { ...booking });
    return booking;
  }

  @Mutation(() => Boolean)
  async deleteBooking(@Arg("id") id: number): Promise<boolean> {
    await Booking.delete(id);
    return true;
  }
}
