import { Query, Resolver, Arg, Mutation } from "type-graphql";

import {Offer/*, OfferStatuses*/} from "../entities/Offer";
import {OfferType} from "../entities/OfferType";
import {User} from "../entities/User";
import {Criteria} from "../entities/Criteria";

@Resolver()
export class OfferResolver {
  @Query(() => [Offer])
  offers(): Promise<Offer[]> {
    return Offer.find();
  }

  @Query(() => Offer, { nullable: true })
  offer(@Arg("id") id: number): Promise<Offer | undefined> {
    return Offer.findOne(id);
  }

  @Mutation(() => Offer)
  async createOffer(
    @Arg("title") title: string,
    @Arg("description") description: string,
    @Arg("latitude") latitude: number,
    @Arg("longitude") longitude: number,
    @Arg("ownerId") ownerId: number,
    @Arg("offerTypeId") offerTypeId: number,
    @Arg("criteriaIds", () => [Number], { nullable: true }) criteriaIds: number[],
    //@Arg("status", type => OfferStatuses) status: OfferStatuses,
  ): Promise<Offer | null> {
    const owner = await User.findOne(ownerId);
    if (!owner) {
      return null;
    }

    const offerType = await OfferType.findOne(offerTypeId);
    if (!offerType) {
      return null;
    }

    // Faire des vérifications supplémentaires sur la validité ici ?
    if(typeof title === "undefined" || typeof description === "undefined" || typeof latitude === "undefined" || typeof longitude === "undefined")
    {
      return null;
    }

    let criterias: Criteria[] = [];
    if (typeof criteriaIds !== 'undefined' && criteriaIds.length > 0) {
      criteriaIds.forEach(async id => {
        let criteria = await Criteria.findOne(id);
        if (criteria) {
          criterias.push(criteria);
        }
      });
    }

    // Faire vérifications sur les enums lorsque le fonctionnement sera confirmé

    return Offer.create({ title, description, latitude, longitude, owner, offerType, criterias/*, status*/ }).save();
  }

  @Mutation(() => Offer, { nullable: true })
  async updateOffer(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Arg("description", () => String, { nullable: true }) description: string,
    @Arg("latitude", () => Number, { nullable: true }) latitude: number,
    @Arg("longitude", () => Number, { nullable: true }) longitude: number,
    @Arg("ownerId", () => Number, { nullable: true }) ownerId: number,
    @Arg("offerTypeId", () => Number, { nullable: true }) offerTypeId: number,
    @Arg("criteriaIds", () => [Number], { nullable: true }) criteriaIds: number[]
    // Voir comment gérer les enums dans les arguments ici (status et deleteReason)
  ): Promise<Offer | null> {
    const offer = await Offer.findOne(id);
    if (!offer) {
      return null;
    }
    if (typeof title !== "undefined") {
      offer.title = title;
    }
    if (typeof description !== "undefined") {
      offer.description = description;
    }
    if (typeof latitude !== "undefined") {
      offer.latitude = latitude;
    }
    if (typeof longitude !== "undefined") {
      offer.longitude = longitude;
    }
    if (typeof ownerId !== "undefined") {
      const owner = await User.findOne(ownerId);
      if (owner) {
        offer.owner = owner;
      }
    }
    if (typeof offerTypeId !== "undefined") {
      const offerType = await OfferType.findOne(offerTypeId);
      if (offerType) {
        offer.offerType = offerType;
      }
    }
    if (typeof criteriaIds !== 'undefined' && criteriaIds.length > 0) {
      let criterias: Criteria[] = [];

      criteriaIds.forEach(async id => {
        let criteria = await Criteria.findOne(id);
        if (criteria) {
          criterias.push(criteria);
        }
      });

      offer.criterias = criterias;
    }

    // Faire vérifications sur les enums lorsque le fonctionnement sera confirmé

    Offer.update({ id }, { ...offer });
    return offer;
  }

  @Mutation(() => Offer, { nullable: true })
  async addOfferCriterias(
      @Arg("id") id: number,
      @Arg("criteriaIds", () => [Number], { nullable: true }) criteriaIds: number[]
  ): Promise<Offer | null> {
    const offer = await Offer.findOne(id);
    if (!offer) {
      return null;
    }

    if (typeof criteriaIds !== 'undefined' && criteriaIds.length > 0) {
      criteriaIds.forEach(async id => {
        let criteria = await Criteria.findOne(id);
        if (criteria) {
          offer.criterias.push(criteria);
        }
      });
    }

    Offer.update({ id }, { ...offer });
    return offer;
  }

  @Mutation(() => Offer, { nullable: true })
  async removeOfferCriterias(
      @Arg("id") id: number,
      @Arg("criteriaIds", () => [Number], { nullable: true }) criteriaIds: number[]
  ): Promise<Offer | null> {
    const offer = await Offer.findOne(id);
    if (!offer) {
      return null;
    }

    if (typeof criteriaIds !== 'undefined' && criteriaIds.length > 0) {
      criteriaIds.forEach(async id => {
        let criteriaIndex = offer.criterias.findIndex(criteria => criteria.id == id);
        if(criteriaIndex > -1)
        {
          offer.criterias.splice(criteriaIndex, 1);
        }
      });
    }

    Offer.update({ id }, { ...offer });
    return offer;
  }

  @Mutation(() => Boolean)
  async deleteOffer(@Arg("id") id: number): Promise<boolean> {
    await Offer.delete(id);
    return true;
  }
}
