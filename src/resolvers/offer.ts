import { Arg, Mutation, Query, Resolver } from "type-graphql";

import { DeleteReasons, Offer, OfferStatuses } from "../entities/Offer";
import { OfferType } from "../entities/OfferType";
import { User } from "../entities/User";
import { Criteria } from "../entities/Criteria";
import { CriteriaInput } from "./CriteriaInput";
import { OfferCriteria } from "../entities/OfferCriteria";
import { BooleanValues } from "./CriteriaInput";
import { CoordinatesInput } from "./CoordinatesInput";
import { Point, Position } from "geojson";
import { City } from "../entities/City";
import {
  calculateOfferDistances,
  calculateOfferScores,
  sortOffersByDistance,
} from "../utils/sortOffers";

@Resolver()
export class OfferResolver {
  // Récupération des offres : le tri est réalisé géographiquement. Si des coordonnées valides sont indiquées en argument, celles-ci sont prioritaires sur l'argument cityId. getCities permet de récupérer les communes dans la requête GraphQL en y précisant ensuite les champs voulus
  @Query(() => [Offer])
  async offers(
    @Arg("coordinates", { nullable: true }) coordinates: CoordinatesInput,
    @Arg("cityId", { nullable: true }) cityId: number,
    @Arg("getCities", { nullable: true }) getCities: boolean,
    @Arg("getDepartements", { nullable: true }) getDepartements: boolean
  ): Promise<Offer[]> {
    let relations = [
      "owner",
      "bookings",
      "offerType",
      "offerCriterias",
      "bookings.review",
    ];

    if (
      (typeof getCities !== "undefined" && getCities) ||
      (typeof getDepartements !== "undefined" && getDepartements)
    ) {
      relations.push("city");

      if (typeof getDepartements !== "undefined" && getDepartements) {
        relations.push("city.departement");
      }
    }

    let offers = await Offer.find({ relations });

    //TODO: Trouver une manière plus propre ?
    offers.forEach((offer) => {
      offer.latitude = offer.coordinates.coordinates[0];
      offer.longitude = offer.coordinates.coordinates[1];
    });

    console.log(offers);

    let calculateDistances = false;
    let cityFound = false;
    let originPoint: Position = [];
    if (
      typeof coordinates !== "undefined" &&
      coordinates.latitude >= -90 &&
      coordinates.latitude <= 90 &&
      coordinates.longitude >= -180 &&
      coordinates.longitude <= 180
    ) {
      originPoint = [coordinates.latitude, coordinates.longitude];
      calculateDistances = true;
    } else if (typeof cityId !== "undefined") {
      const city = await City.findOne(cityId);
      if (city) {
        originPoint = city.coordinates.coordinates;
        calculateDistances = true;
        cityFound = true;
      }
    }

    if (calculateDistances) {
      console.log("CALC DISTANCES");
      offers = calculateOfferDistances(originPoint, offers);
      offers = sortOffersByDistance(offers);

      offers = cityFound
        ? calculateOfferScores(offers, true, cityId)
        : calculateOfferScores(offers, true);
    }

    return offers;
  }

  @Query(() => Offer, { nullable: true })
  async offer(@Arg("id") id: number): Promise<Offer | undefined> {
    return await Offer.findOne(id, {
      relations: [
        "owner",
        "bookings",
        "offerType",
        "offerCriterias",
        "city",
        "city.departement",
      ],
    });
  }

  @Mutation(() => Offer)
  async createOffer(
    @Arg("title") title: string,
    @Arg("description") description: string,
    @Arg("coordinates", () => CoordinatesInput, { nullable: true })
    coordinates: CoordinatesInput,
    @Arg("address", { nullable: true }) address: string,
    @Arg("cityId") cityId: number,
    @Arg("ownerId") ownerId: number,
    @Arg("offerTypeId") offerTypeId: number,
    //@Arg("criteriaIds", () => [Number], { nullable: true })
    //criteriaIds: number[],
    @Arg("deleteReasons") deleteReason: DeleteReasons,
    @Arg("status") status: OfferStatuses
  ): Promise<Offer | null> {
    const owner = await User.findOne(ownerId);
    if (!owner) {
      console.log("SORTIE 1");
      return null;
    }

    const offerType = await OfferType.findOne(offerTypeId);
    if (!offerType) {
      console.log("SORTIE 2");
      return null;
    }

    // Faire des vérifications supplémentaires sur la validité ici ?
    if (typeof title === "undefined" || typeof description === "undefined") {
      console.log("SORTIE 3");
      return null;
    }

    // Préparation de la définition des coordonnées
    // ATTENTION : Coordonnées temporairement obligatoires !
    let formattedCoordinates: Point | null;
    // TODO : A commenter et continuer pour la définition des coordonnées, de l'adresse et de la commune
    if (
      typeof coordinates === "undefined" ||
      coordinates.latitude < -90 ||
      coordinates.latitude > 90 ||
      coordinates.longitude < -180 ||
      coordinates.longitude > 180
    ) {
      return null;
      /*let geoData = null;
      if (typeof address !== "undefined" && typeof city !== "undefined") {
        await fetch(
          "https://api-adresse.data.gouv.fr/search/?q=" +
            encodeURI(address) +
            ",+" +
            encodeURI(city)
        ).then(async (result) => {
          if (result.ok) {
            geoData = await result.json();
          }
        });

        if (geoData === null || geoData.features.length === 0) {
          return null;
        }

        formattedCoordinates = geoData.features[0].geometry;
      }

      formattedCoordinates = null;*/ // TODO : vérifier si fonctionnel (erreur obtenue : Cannot return null for non-nullable field Mutation.createOffer.)
    } else {
      formattedCoordinates = {
        type: "Point",
        coordinates: [coordinates.latitude, coordinates.longitude],
      };
    }

    // TODO : A modifier lorsque l'exploitation des coordonnées sera entièrement fonctionnelle, pour relier les vérifications entre les deux
    // Enregistrement de la ville (l'ID doit d'abord être récupéré via cities)
    // ATTENTION : champ ville temporairement obligatoire en attendant la gestion des coordonnées
    const city = await City.findOne(cityId);
    if (!city) {
      return null;
    }
    /*let city: City | null;
    if (typeof cityId !== "undefined") {
      let foundCity = await City.findOne(cityId);
      if (typeof foundCity === "undefined") {
        city = null;
      }
    }*/

    // TODO : Même chose que pour la ville
    // Enregistrement simple de l'adresse
    /*if (typeof address === "undefined") {
      address = null;
    }*/

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

    console.log("MAIN SORTIE");
    return Offer.create({
      title,
      description,
      coordinates: formattedCoordinates,
      city,
      address,
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
    @Arg("coordinates", () => CoordinatesInput, { nullable: true })
    coordinates: CoordinatesInput,
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
    if (
      typeof coordinates !== "undefined" &&
      coordinates.latitude >= -90 &&
      coordinates.latitude <= 90 &&
      coordinates.longitude >= -180 &&
      coordinates.longitude <= 180
    ) {
      offer.coordinates = {
        type: "Point",
        coordinates: [coordinates.latitude, coordinates.longitude],
      };
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
