import {
  Arg,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";

import { Offer, OfferStatuses } from "../entities/Offer";
import { OfferType } from "../entities/OfferType";
import { User, UserStatuses } from "../entities/User";
import { Criteria } from "../entities/Criteria";
import { CriteriaInput } from "./CriteriaInput";
import { OfferCriteria } from "../entities/OfferCriteria";
import { BooleanValues } from "./CriteriaInput";
import { CoordinatesInput } from "./inputs/CoordinatesInput";
import { Point, Position } from "geojson";
import { City } from "../entities/City";
import {
  calculateOfferDistances,
  calculateOfferScore,
  sortOffersByDistance,
} from "../utils/sortOffers";
import { ReadStream } from "fs";
import { FieldError } from "./FieldError";
import { CreateOfferInput, UpdateOfferInput } from "./inputs/OfferInput";
import { validateOffer } from "../utils/validations/validateOffer";
import { getErrorFields } from "../utils/getErrorFields";
import { createEntity } from "../utils/createEntity";
import { updateEntity } from "../utils/updateEntity";

export type File = {
  filename: string;
  mimetype: string;
  encoding: string;
  stream?: ReadStream;
};

// key : criteria id / value : value to use
/*export interface criteriaValue {
  [id: number]: string;
}*/

@ObjectType()
class SearchOfferResponse {
  @Field(() => [Offer])
  offers: Offer[];
}

@ObjectType()
class OfferResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Offer, { nullable: true })
  offer?: Offer;
}

@Resolver()
export class OfferResolver {
  // Récupération des offres : le tri est réalisé géographiquement. Si des coordonnées valides sont indiquées en argument, celles-ci sont prioritaires sur l'argument cityId. getCities permet de récupérer les communes dans la requête GraphQL en y précisant ensuite les champs voulus.
  // / cityId : tri par proximité en fonction du code ville INSEE renseigné
  // / ownerId : filtre les offres appartenant à un propriétaire
  @Query(() => SearchOfferResponse)
  async offers(
    @Arg("coordinates", { nullable: true }) coordinates: CoordinatesInput,
    @Arg("cityId", { nullable: true }) cityId: number,
    @Arg("getCities", { nullable: true }) getCities: boolean,
    @Arg("getDepartements", { nullable: true }) getDepartements: boolean,
    @Arg("ownerId", { nullable: true }) ownerId: number,
    @Arg("status", { nullable: true }) status: OfferStatuses,
    @Arg("getOffersFromNotActivatedOwners", { nullable: true })
    getOffersFromNotActivatedOwners: boolean
  ): Promise<{ offers: Offer[] }> {
    let offersQuery = Offer.createQueryBuilder("offer")
      .innerJoinAndSelect("offer.owner", "owner")
      .innerJoinAndSelect("offer.bookings", "booking")
      .innerJoinAndSelect("offer.offerType", "offerType")
      .leftJoinAndSelect("offer.offerCriterias", "criterias")
      .leftJoinAndSelect("booking.review", "review")
      .leftJoinAndSelect("offer.photos", "photo");

    if (
      (typeof getCities !== "undefined" && getCities) ||
      (typeof getDepartements !== "undefined" && getDepartements) ||
      typeof cityId !== "undefined"
    ) {
      offersQuery.innerJoinAndSelect("booking.city", "city");

      if (typeof getDepartements !== "undefined" && getDepartements) {
        offersQuery.innerJoinAndSelect("city.departement", "departement");
      }
    }

    if (
      typeof getOffersFromNotActivatedOwners === "undefined" ||
      !getOffersFromNotActivatedOwners
    ) {
      offersQuery.where("owner.status = :status", {
        status: UserStatuses.ACTIVATED,
      });
    }

    if (typeof ownerId !== "undefined") {
      let owner = await User.findOne(ownerId);
      if (owner !== null) {
        offersQuery.andWhere("owner.id = :owner", { owner: owner!.id });
      }
    }
    if (
      typeof status !== "undefined" &&
      Object.values(OfferStatuses).includes(status)
    ) {
      offersQuery.andWhere("status = :status", { status });
    }

    let offers = await offersQuery.getMany();

    offers.forEach((offer) => {
      if (offer.coordinates !== null) {
        [offer.latitude, offer.longitude] = offer.coordinates.coordinates;
      }
    });

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
      offers = calculateOfferDistances(originPoint, offers);
      offers = sortOffersByDistance(offers);

      offers = cityFound
        ? calculateOfferScore(offers, true, cityId)
        : calculateOfferScore(offers, true);
    } else {
      calculateOfferScore(offers, false);
    }

    return { offers: offers };
  }

  @Query(() => Offer, { nullable: true })
  async offer(
    @Arg("id") id: number,
    @Arg("showOfferEvenIfOwnerIsNotActivated", { nullable: true })
    showOfferEvenIfOwnerIsNotActivated: boolean
  ): Promise<Offer | undefined> {
    let offerQuery = Offer.createQueryBuilder("offer")
      .innerJoinAndSelect("offer.owner", "owner")
      .innerJoinAndSelect("offer.bookings", "booking")
      .innerJoinAndSelect("offer.offerType", "offerType")
      .leftJoinAndSelect("offer.offerCriterias", "criterias")
      .leftJoinAndSelect("booking.review", "review")
      .leftJoinAndSelect("offer.photos", "photo")
      .innerJoinAndSelect("booking.city", "city")
      .innerJoinAndSelect("city.departement", "departement")
      .where("offer.id = :offer", { offer: id });

    if (
      typeof showOfferEvenIfOwnerIsNotActivated === "undefined" ||
      !showOfferEvenIfOwnerIsNotActivated
    ) {
      offerQuery.andWhere("owner.status = :status", {
        status: UserStatuses.ACTIVATED,
      });
    }

    let offer: Offer | undefined = await offerQuery.getOne();

    if (typeof offer !== "undefined" && offer.coordinates !== null) {
      [offer.latitude, offer.longitude] = offer.coordinates.coordinates;
    }

    return offer;
  }

  @Mutation(() => OfferResponse)
  async createOffer(
    @Arg("options") options: CreateOfferInput
  ): Promise<OfferResponse> {
    const errors: FieldError[] = validateOffer(options);
    let errorFields = getErrorFields(errors);

    let owner: User | undefined;
    if (typeof options.ownerId !== "undefined") {
      owner = await User.findOne(options.ownerId);
      if (!owner) {
        errors.push({
          field: "owner",
          message: "Le propriétaire est introuvable",
        });
      }
    }

    let offerType: OfferType | undefined;
    if (typeof options.offerTypeId !== "undefined") {
      offerType = await OfferType.findOne(options.offerTypeId);
      if (!offerType) {
        errors.push({
          field: "offerType",
          message: "Le type d'offre est introuvable",
        });
      }
    }

    // Préparation de la définition des coordonnées
    let formattedCoordinates: Point | null = null;
    // TODO : A commenter et continuer pour la définition des coordonnées, de l'adresse et de la commune
    if (
      typeof options.coordinates !== "undefined" &&
      options.coordinates !== null
    ) {
      if (!errorFields.includes("coordinates")) {
        formattedCoordinates = {
          type: "Point",
          coordinates: [
            options.coordinates.latitude,
            options.coordinates.longitude,
          ],
        };
      } else {
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

        formattedCoordinates = null;*/
      }
    }

    // TODO : A modifier lorsque l'exploitation des coordonnées sera entièrement fonctionnelle, pour lier les vérifications commune/adresse/coordonnées
    // Enregistrement de la ville (l'ID doit d'abord être récupéré via cities)
    // ATTENTION : champ ville temporairement obligatoire en attendant la gestion des coordonnées
    let city: City | undefined;
    if (typeof options.cityId !== "undefined") {
      city = await City.findOne(options.cityId);
      if (!city) {
        errors.push({
          field: "city",
          message: "La commune est introuvable",
        });
      }
    }

    /*let criterias: Criteria[] = [];
    if (
      typeof options.criteriaIds !== "undefined" &&
      options.criteriaIds.length > 0
    ) {
      let criteriasCheck = await generateCriteriasList(options.criteriaIds);
      errors.push(...criteriasCheck.errors);
      criterias = criteriasCheck.criterias;
    }*/

    if (errors.length > 0) {
      return { errors };
    }

    let offer: Offer;
    try {
      offer = await createEntity(
        options,
        "Offer",
        ["coordinates", "cityId", "ownerId", "offerTypeId" /*, "criterias"*/],
        {
          coordinates: formattedCoordinates,
          city: city,
          owner: owner,
          offerType: offerType,
        }
      );

      /*if (criterias.length > 0) {
        for (const index in criterias) {
          await OfferCriteria.create({ offer, criteria: criterias[index] });
        }

        offer = <Offer>await this.offer(offer.id);
      }*/

      return { errors, offer };
    } catch (err) {
      if (err.code === "23505" || err.detail.includes("already exists")) {
        errors.push({ field: "name", message: "L'offre existe déjà" });
      } else {
        console.log(err.code + " " + err.detail);
        errors.push({
          field: "unknown",
          message: "Erreur inconnue, veuillez contacter l'administrateur",
        });
      }

      return { errors };
    }
  }

  @Mutation(() => OfferResponse)
  async updateOffer(
    @Arg("id") id: number,
    @Arg("options") options: UpdateOfferInput
  ): Promise<OfferResponse> {
    let offer = await Offer.findOne(id);
    if (!offer) {
      return {
        errors: [{ field: "id", message: "L'offre est introuvable" }],
      };
    }

    const errors: FieldError[] = validateOffer(options);

    let owner: User | undefined = offer.owner;
    if (typeof options.ownerId !== "undefined") {
      owner = await User.findOne(options.ownerId);
      if (!owner) {
        errors.push({
          field: "owner",
          message: "Le propriétaire est introuvable",
        });
      }
    }

    let offerType: OfferType | undefined = offer.offerType;
    if (typeof options.offerTypeId !== "undefined") {
      offerType = await OfferType.findOne(options.offerTypeId);
      if (!offerType) {
        errors.push({
          field: "offerType",
          message: "Le type d'offre est introuvable",
        });
      }
    }

    // TODO: Voir todo sur les coordonnées dans createOffer
    let formattedCoordinates: Point | null = offer.coordinates;
    if (
      typeof options.coordinates !== "undefined" &&
      !getErrorFields(errors).includes("coordinates")
    ) {
      if (options.coordinates === null) {
        formattedCoordinates = null;
      } else {
        formattedCoordinates = {
          type: "Point",
          coordinates: [
            options.coordinates.latitude,
            options.coordinates.longitude,
          ],
        };
      }
    }

    // TODO : Voir todo sur city dans createOffer
    let city: City | undefined = offer.city;
    if (typeof options.cityId !== "undefined") {
      city = await City.findOne(options.cityId);
      if (!city) {
        errors.push({
          field: "city",
          message: "La commune est introuvable",
        });
      }
    }

    // TODO : Supprimé car la gestion de l'ajout des critères est complexe. Voir si call de la fonction d'ajout à faire ici, ou si on appelle la création des critères en front une fois l'offre créée
    /*if (
      typeof options.criteriaIds !== "undefined" &&
      options.criteriaIds.length > 0
    ) {
      let criteriasCheck = await generateCriteriasList(options.criteriaIds);
      errors.push(...criteriasCheck.errors);

      if (criteriasCheck.criterias.length > 0) {
        for (const index in criteriasCheck.criterias) {
          await OfferCriteria.create({
            offer,
            criteria: criteriasCheck.criterias[index],
          });
        }

        offer = <Offer>await this.offer(offer.id);
      }
    }*/

    offer = await updateEntity(
      offer,
      options,
      errors,
      ["coordinates", "cityId", "ownerId", "offerTypeId" /*, "criterias"*/],
      {
        coordinates: formattedCoordinates,
        city: city,
        owner: owner,
        offerType: offerType,
      }
    );

    offer = await Offer.save(offer);
    return { errors, offer };
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
