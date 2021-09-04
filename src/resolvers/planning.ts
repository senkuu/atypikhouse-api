import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { Planning } from "../entities/Planning";
import { Offer } from "../entities/Offer";
import { User } from "../entities/User";
import { Booking, BookingStatuses } from "../entities/Booking";
import { FindConditions, Not } from "typeorm";
import { PlanningInput } from "./inputs/PlanningInput";

@Resolver()
export class PlanningResolver {
  // Si offerId est renseigné, affiche les indisponibilités hors réservations liées à cette offre. Si ownerId est renseigné seul (sans offerId) : n'affiche que les indisponibilités concernant l'intégralité des hébergements du propriétaire, et pas celles spécifiques à un lieu
  @Query(() => [Planning], { nullable: true })
  async plannings(
    @Arg("options") options: PlanningInput
  ): Promise<Planning[] | null> {
    if (typeof options.offerId !== "undefined") {
      const offer = await Offer.findOne(options.offerId, {
        relations: ["owner"],
      });
      if (!offer) {
        return null;
      }

      if (
        typeof options.ownerId !== "undefined" &&
        offer.owner.id !== options.ownerId
      ) {
        return null;
      }

      return Planning.find({
        where: { offer: offer },
      });
    } else if (typeof options.ownerId !== "undefined") {
      const owner = await User.findOne(options.ownerId);
      if (!owner) {
        return null;
      }

      return Planning.find({
        where: { offer: null, user: owner },
      });
    }

    return null;
  }

  // Si offerId est renseigné, ownerId est ignoré
  @Mutation(() => Planning)
  async addPlanningData(
    @Arg("options") options: PlanningInput,
    @Arg("startDate")
    startDate: Date,
    @Arg("endDate") endDate: Date
  ): Promise<Planning | null> {
    let offer: Offer | undefined;
    let owner: User | undefined;
    if (typeof options.offerId !== "undefined") {
      offer = await Offer.findOne(options.offerId);
      if (!offer) {
        return null;
      }
      owner = undefined;
      options.ownerId = undefined;
    } else if (typeof options.ownerId !== "undefined") {
      owner = await User.findOne(options.ownerId);
      if (!owner) {
        return null;
      }
      offer = undefined;
      options.offerId = undefined;
    } else {
      return null;
    }

    // Vérifier si utile, et le cas échéant si fonctionnel
    if (typeof startDate === "undefined" || typeof endDate === "undefined") {
      return null;
    }

    if (startDate > endDate) {
      return null;
    }

    let existingPlanningData = (await this.plannings(options)) ?? [];

    if (offer !== undefined) {
      let existingUserGlobalPlanningData = await this.plannings({
        ownerId: offer.owner.id,
      });
      if (existingUserGlobalPlanningData !== null) {
        existingPlanningData.push(...existingUserGlobalPlanningData);
      }
    }

    if (
      existingPlanningData !== null &&
      existingPlanningData.some(
        (data) => data.endDate > startDate && data.startDate < endDate
      )
    ) {
      return null;
    }

    let bookings: Booking[];
    if (typeof offer !== "undefined") {
      bookings = await Booking.find({
        where: { offer: offer, status: Not(BookingStatuses.CANCELLED) },
      });
    } else {
      bookings = await Booking.find({
        where: {
          offer: { owner: owner },
          status: Not(BookingStatuses.CANCELLED),
        },
      });
    }

    if (
      bookings !== null &&
      bookings.some(
        (booking) => booking.endDate > startDate && booking.startDate < endDate
      )
    ) {
      return null;
    }

    return Planning.create({
      offer,
      owner,
      startDate,
      endDate,
    }).save();
  }

  @Mutation(() => Planning, { nullable: true })
  async updatePlanningData(
    @Arg("id") id: number,
    @Arg("startDate", () => Date, { nullable: true }) startDate: Date,
    @Arg("endDate", () => Date, { nullable: true }) endDate: Date
  ): Promise<Planning | null> {
    const planningData = await Planning.findOne(id, { relations: ["owner"] });
    if (!planningData) {
      return null;
    }
    let startDateSave = planningData.startDate;
    let endDateSave = planningData.endDate;
    if (typeof startDate !== "undefined" && typeof endDate !== "undefined") {
      if (startDate < endDate) {
        planningData.startDate = startDate;
        planningData.endDate = endDate;
      }
    } else if (
      typeof startDate !== "undefined" &&
      startDate < planningData.endDate
    ) {
      planningData.startDate = startDate;
    } else if (
      typeof endDate !== "undefined" &&
      endDate > planningData.startDate
    ) {
      planningData.endDate = endDate;
    }

    // TODO: Expliciter
    let ownerId = planningData.owner
      ? planningData.owner.id
      : planningData.offer.owner.id;
    let existingPlanningData: Planning[] = [];

    let userGlobalPlanningData = await this.plannings({ ownerId: ownerId });
    if (userGlobalPlanningData !== null) {
      existingPlanningData.push(...userGlobalPlanningData);
    }

    if (planningData.offer !== null) {
      let offerPlanningData = await this.plannings({
        offerId: planningData.offer.id,
      });
      if (offerPlanningData !== null) {
        existingPlanningData.push(...offerPlanningData);
      }
    }

    if (existingPlanningData !== null) {
      // TODO : A optimiser
      existingPlanningData.filter((data) => data !== planningData);

      if (
        existingPlanningData.some(
          (data) => data.endDate > startDate && data.startDate < endDate
        )
      ) {
        planningData.startDate = startDateSave;
        planningData.endDate = endDateSave;
        return planningData;
      }
    }

    let findCondition: FindConditions<Booking> = planningData.offer
      ? { offer: planningData.offer }
      : { offer: { owner: planningData.owner } };
    findCondition["status"] = Not(BookingStatuses.CANCELLED);

    // Array dans where = condition OR
    let existingBookings = await Booking.find({
      relations: ["offer", "offer.owner"],
      where: findCondition,
    });

    if (existingBookings !== null) {
      if (
        existingBookings.some(
          (booking) =>
            booking.endDate > startDate && booking.startDate < endDate
        )
      ) {
        planningData.startDate = startDateSave;
        planningData.endDate = endDateSave;
        return planningData;
      }
    }

    Planning.update({ id }, { ...planningData });
    return planningData;
  }

  @Mutation(() => Boolean)
  async removePlanningData(@Arg("id") id: number): Promise<boolean> {
    await Planning.delete(id);
    return true;
  }
}
