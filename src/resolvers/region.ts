import { Arg, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { Region } from "../entities/Region";

// TODO: Tri des départements et villes par nombre d'offres si activé, puis des départements dans l'ordre alphabétique et des villes par population
@Resolver()
export class RegionResolver {
  @Query(() => [Region], { nullable: true })
  async regions(
    @Arg("name", { nullable: true }) name: string,
    @Arg("getDepartements", { nullable: true }) getDepartements: boolean,
    @Arg("getCities", { nullable: true }) getCities: boolean,
    @Arg("getOffers", { nullable: true }) getOffers: boolean
  ): Promise<Region[] | undefined> {
    let regions = getRepository(Region).createQueryBuilder("region");

    if (getOffers || getCities || getDepartements) {
      regions = regions.leftJoinAndSelect("region.departements", "departement");

      if (getOffers || getCities) {
        regions = regions.leftJoinAndSelect("departement.cities", "city");

        if (getOffers) {
          regions = regions.leftJoinAndSelect("city.offers", "offer");
        }
      }
    }

    if (typeof name !== "undefined") {
      regions.where("LOWER(region.name) like LOWER(:name)", {
        name: `${name}%`,
      });
    }

    return await regions.orderBy("region.name").getMany();
  }

  @Query(() => Region, { nullable: true })
  region(
    @Arg("id") id: number,
    @Arg("getDepartements", { nullable: true }) getDepartements: boolean,
    @Arg("getCities", { nullable: true }) getCities: boolean,
    @Arg("getOffers", { nullable: true }) getOffers: boolean,
    @Arg("getUsers", { nullable: true }) getUsers: boolean
  ): Promise<Region | undefined> | null {
    if (typeof id === "undefined") {
      return null;
    }

    let region = getRepository(Region).createQueryBuilder("region");

    if (getOffers || getCities || getDepartements || getUsers) {
      region = region.leftJoinAndSelect("region.departements", "departement");

      if (getOffers || getCities || getUsers) {
        region = region.leftJoinAndSelect("departement.cities", "city");

        if (getOffers) {
          region = region.leftJoinAndSelect("city.offers", "offer");
        }

        if (getUsers) {
          region = region.leftJoinAndSelect("city.users", "user");
        }
      }
    }

    region = region.where("region.id = :id", { id: id });

    return region.getOne();
  }
}
