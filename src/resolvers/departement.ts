import { Arg, Query, Resolver } from "type-graphql";
import { getRepository } from "typeorm";
import { Departement } from "../entities/Departement";

@Resolver()
export class DepartementResolver {
  @Query(() => [Departement], { nullable: true })
  async departements(
    @Arg("name", { nullable: true }) name: string,
    @Arg("getRegions", { nullable: true }) getRegions: boolean,
    @Arg("getCities", { nullable: true }) getCities: boolean,
    @Arg("getOffers", { nullable: true }) getOffers: boolean,
    @Arg("orderBy", { nullable: true }) orderBy: string
  ): Promise<Departement[] | undefined> {
    let departements = getRepository(Departement).createQueryBuilder(
      "departement"
    );

    if (getRegions) {
      departements = departements.leftJoinAndSelect(
        "departement.region",
        "region"
      );
    }

    if (getOffers || getCities) {
      departements = departements.leftJoinAndSelect(
        "departement.cities",
        "city"
      );

      if (getOffers) {
        departements = departements.leftJoinAndSelect("city.offers", "offer");
      }
    }

    if (typeof name !== "undefined") {
      departements.where("LOWER(departement.name) like LOWER(:name)", {
        name: `${name}%`,
      });
    }

    if (typeof orderBy !== "undefined" && orderBy === "name") {
      departements = departements.orderBy("departement.name");
    } else {
      departements = departements.orderBy("departement.number");
    }

    return await departements.getMany();
  }

  @Query(() => Departement, { nullable: true })
  departement(
    @Arg("id", { nullable: true }) id: number,
    @Arg("number", { nullable: true }) number: string,
    @Arg("getRegion", { nullable: true }) getRegion: boolean,
    @Arg("getCities", { nullable: true }) getCities: boolean,
    @Arg("getOffers", { nullable: true }) getOffers: boolean,
    @Arg("getUsers", { nullable: true }) getUsers: boolean
  ): Promise<Departement | undefined> | null {
    if (typeof id === "undefined" && typeof number === "undefined") {
      return null;
    }

    let departement = getRepository(Departement).createQueryBuilder(
      "departement"
    );

    if (getRegion) {
      departement = departement.leftJoinAndSelect(
        "departement.region",
        "region"
      );
    }

    if (getOffers || getCities || getUsers) {
      departement = departement.leftJoinAndSelect("departement.cities", "city");

      if (getOffers) {
        departement = departement.leftJoinAndSelect("city.offers", "offer");
      }

      if (getUsers) {
        departement = departement.leftJoinAndSelect("city.users", "user");
      }
    }

    if (typeof id !== "undefined") {
      departement = departement.where("departement.id = :id", { id: id });
    } else if (typeof number !== "undefined") {
      departement = departement.where("departement.number = :number", {
        number: number,
      });
    }

    return departement.getOne();
  }
}
