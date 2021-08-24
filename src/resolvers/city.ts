import { Arg, Query, Resolver } from "type-graphql";
import { City } from "../entities/City";
import { getRepository } from "typeorm";

@Resolver()
export class CityResolver {
  @Query(() => [City], { nullable: true })
  async cities(
    @Arg("name", { nullable: true }) name: string,
    @Arg("getDepartements", { nullable: true }) getDepartements: boolean,
    @Arg("getRegions", { nullable: true }) getRegions: boolean,
    @Arg("getOffers", { nullable: true }) getOffers: boolean,
    @Arg("orderBy", { nullable: true }) orderBy: string,
    @Arg("departements", () => [Number], { nullable: true })
    departements: number[],
    @Arg("regions", () => [Number], { nullable: true }) regions: number[]
  ): Promise<City[] | undefined> {
    let searches = 0;
    let cities = getRepository(City).createQueryBuilder("city");

    if (getOffers) {
      cities = cities.leftJoinAndSelect("city.offers", "offer");
    }

    if (
      getDepartements ||
      getRegions ||
      (typeof departements !== "undefined" && departements.length > 0) ||
      (typeof regions !== "undefined" && regions.length > 0)
    ) {
      cities = cities.leftJoinAndSelect("city.departement", "departement");

      if (
        getRegions ||
        (typeof regions !== "undefined" && regions.length > 0)
      ) {
        cities = cities.leftJoinAndSelect("departement.region", "region");
      }

      if (typeof departements !== "undefined" && departements.length > 0) {
        // Pas le choix de l'intégrer de cette manière, sinon les valeurs du tableau sont mises entre guillemets et ne peuvent pas être traitées en tant que number
        cities = cities.where("departement.id IN (" + departements + ")");
        searches++;
      } else if (
        getRegions &&
        typeof regions !== "undefined" &&
        regions.length > 0
      ) {
        // Pas le choix de l'intégrer de cette manière, sinon les valeurs du tableau sont mises entre guillemets et ne peuvent pas être traitées en tant que number
        cities = cities.where("region.id IN (" + regions + ")");
        searches++;
      }
    }

    if (typeof name !== "undefined") {
      if (searches > 0) {
        cities.andWhere("LOWER(city.name) like LOWER(:name)", {
          name: `${name}%`,
        });
      } else {
        cities.where("LOWER(city.name) like LOWER(:name)", {
          name: `${name}%`,
        });
      }
    }

    if (typeof orderBy !== "undefined" && orderBy === "name") {
      cities = cities.orderBy("city.name");
    } else {
      cities = cities.orderBy("city.population", "DESC");
    }

    return await cities.getMany();
  }

  @Query(() => City, { nullable: true })
  city(
    @Arg("id") id: number,
    @Arg("getDepartement", { nullable: true }) getDepartement: boolean,
    @Arg("getRegion", { nullable: true }) getRegion: boolean,
    @Arg("getOffers", { nullable: true }) getOffers: boolean,
    @Arg("getUsers", { nullable: true }) getUsers: boolean
  ): Promise<City | undefined> | null {
    let city = getRepository(City).createQueryBuilder("city");

    if (getUsers) {
      city = city.leftJoinAndSelect("city.users", "user");
    }

    if (getOffers) {
      city = city.leftJoinAndSelect("city.offers", "offer");
    }

    if (getDepartement || getRegion) {
      city = city.leftJoinAndSelect("city.departement", "departement");

      if (getRegion) {
        city = city.leftJoinAndSelect("departement.region", "region");
      }
    }

    return city.where("city.id = :id", { id: id }).getOne();
  }
}
