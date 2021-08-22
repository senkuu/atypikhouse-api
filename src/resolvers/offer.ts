import { Arg, Mutation, Query, Resolver } from "type-graphql";

import { DeleteReasons, Offer, OfferStatuses } from "../entities/Offer";
import { OfferType } from "../entities/OfferType";
import { User } from "../entities/User";
import { Criteria } from "../entities/Criteria";
import { CriteriaInput } from "./CriteriaInput";
import { OfferCriteria } from "../entities/OfferCriteria";
import { BooleanValues } from "./CriteriaInput";

@Resolver()
export class OfferResolver {
  @Query(() => [Offer])
  offers(): Promise<Offer[]> {
    let offers = Offer.find({
      relations: ["owner", "bookings", "offerType", "criterias"],
    });
    console.log(offers);
    return offers;
  }

  @Query(() => Offer, { nullable: true })
  offer(@Arg("id") id: number): Promise<Offer | undefined> {
    return Offer.findOne(id, {
      relations: ["owner", "bookings", "offerType", "criterias"],
    });
  }

  @Mutation(() => Offer)
  async createOffer(
    @Arg("title") title: string,
    @Arg("description") description: string,
    @Arg("latitude") latitude: number,
    @Arg("longitude") longitude: number,
    @Arg("ownerId") ownerId: number,
    @Arg("offerTypeId") offerTypeId: number,
    //@Arg("criteriaIds", () => [Number], { nullable: true })
    //criteriaIds: number[],
    @Arg("deleteReasons") deleteReason: DeleteReasons,
    @Arg("status") status: OfferStatuses
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
    if (
      typeof title === "undefined" ||
      typeof description === "undefined" ||
      typeof latitude === "undefined" ||
      typeof longitude === "undefined"
    ) {
      return null;
    }

    let offerCriterias: OfferCriteria[] = [];
    // TODO : Supprimé car la gestion de l'ajout des critères est complexe. Voir si call de la fonction d'ajout à faire ici une fois l'entité sauvegardée, ou si on appelle la création des critères en front une fois l'offre créée
    /*if (typeof criteriaIds !== "undefined" && criteriaIds.length > 0) {
      criteriaIds.forEach(async (id) => {
        let criteria = await Criteria.findOne(id);
        if (criteria) {
          criterias.push(criteria);
        }
      });
    }*/

    if (typeof deleteReason === "string") {
      if (!Object.values(DeleteReasons).includes(deleteReason)) {
        deleteReason = DeleteReasons.UNKNOWN;
      }
    } else {
      deleteReason = DeleteReasons.UNKNOWN;
    }

    if (typeof status === "string") {
      if (!Object.values(OfferStatuses).includes(status)) {
        status = OfferStatuses.WAITING_APPROVAL;
      }
    } else {
      status = OfferStatuses.WAITING_APPROVAL;
    }

    return Offer.create({
      title,
      description,
      latitude,
      longitude,
      owner,
      offerType,
      offerCriterias,
      status,
      deleteReason,
    }).save();
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
    //@Arg("criteriaIds", () => [Number], { nullable: true })
    //criteriaIds: number[],
    @Arg("status", { nullable: true }) status: OfferStatuses,
    @Arg("deleteReason", { nullable: true }) deleteReason: DeleteReasons
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
    // TODO : Supprimé car la gestion de l'ajout des critères est complexe. Voir si call de la fonction d'ajout à faire ici, ou si on appelle la création des critères en front une fois l'offre créée
    /*if (typeof criteriaIds !== "undefined" && criteriaIds.length > 0) {
      let criterias: Criteria[] = [];

      criteriaIds.forEach(async (id) => {
        let criteria = await Criteria.findOne(id);
        if (criteria) {
          criterias.push(criteria);
        }
      });

      offer.criterias = criterias;
    }*/
    if (typeof status === "string") {
      if (Object.values(OfferStatuses).includes(status)) {
        offer.status = status;
      }
    }
    if (typeof deleteReason === "string") {
      if (Object.values(DeleteReasons).includes(deleteReason)) {
        offer.deleteReason = deleteReason;
      }
    }

    Offer.update({ id }, { ...offer });
    return offer;
  }

  @Mutation(() => Offer, { nullable: true })
  async addOfferCriterias(
    @Arg("offerId") id: number,
    @Arg("criterias", () => [CriteriaInput], { nullable: true })
    criterias: CriteriaInput[] // TODO : Voir comment faire mieux
  ): Promise<Offer | null> {
    let offer = await Offer.findOne(id, {
      relations: ["offerCriterias", "offerType"],
    });
    if (!offer) {
      return null;
    }

    if (typeof criterias !== "undefined" && criterias.length > 0) {
      criterias.forEach(async (offerCriteria) => {
        let criteria = await Criteria.findOne(offerCriteria.id, {
          relations: ["offerTypes"],
        });
        if (
          criteria &&
          criteria.offerTypes.find(
            (offerType) => offerType.id === offer!.offerType.id
          )
        ) {
          // TODO : afficher des erreurs distinctes lorsque le critère n'existe pas, lorsqu'il ne correspond pas au type d'offre
          if (
            (criteria.criteriaType === "int" &&
              !isNaN(parseInt(offerCriteria.value))) ||
            (criteria.criteriaType === "boolean" &&
              Object.values(BooleanValues).includes(offerCriteria.value)) ||
            criteria.criteriaType === "string"
          ) {
            try {
              await OfferCriteria.create({
                offer: offer,
                criteria: criteria,
                value: offerCriteria.value,
              }).save();
            } catch (err) {
              if (
                err.code === "23505" ||
                err.detail.includes("already exists")
              ) {
                /*return {
                  errors: [
                    { field: "name", message: "This criteria is already set" },
                  ],
                };*/
              } else {
                console.log(err.code + " " + err.detail);
              }
            }
          }
        }
        //return; // TODO: Retourner une valeur explicite
      });

      await new Promise((r) => setTimeout(r, 20)); // Pas le choix pour afficher les éléments mis à jour

      let updatedOffer = await Offer.findOne(id, {
        relations: ["offerCriterias"],
      });

      return updatedOffer!;
    }

    return null;
  }

  @Mutation(() => Offer, { nullable: true })
  async removeOfferCriterias(
    @Arg("offerId") id: number,
    @Arg("criteriaIds", () => [Number], { nullable: true })
    criteriaIds: number[]
  ): Promise<Offer | null> {
    let offer = await Offer.findOne(id, { relations: ["offerCriterias"] });
    if (!offer) {
      return null;
    }

    if (typeof criteriaIds !== "undefined" && criteriaIds.length > 0) {
      criteriaIds.forEach(async (criteriaId) => {
        let foundOfferCriteria = offer!.offerCriterias.find(
          (offerCriteria) => offerCriteria.criteria.id == criteriaId
        );

        if (typeof foundOfferCriteria !== "undefined") {
          await OfferCriteria.remove(foundOfferCriteria);
        }
      });

      await new Promise((r) => setTimeout(r, 20)); // Pas le choix pour afficher les éléments mis à jour

      let updatedOffer = await Offer.findOne(id, {
        relations: ["offerCriterias"],
      });
      return updatedOffer!;
    }

    return null;
  }

  @Mutation(() => Boolean)
  async deleteOffer(@Arg("id") id: number): Promise<boolean> {
    await Offer.delete(id);
    return true;
  }
}
