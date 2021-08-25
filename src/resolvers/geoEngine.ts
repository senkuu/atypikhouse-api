import { Arg, Query, Resolver } from "type-graphql";
import { City } from "../entities/City";
import { BaseEntity } from "typeorm";
import { Departement } from "../entities/Departement";
import { Region } from "../entities/Region";

@Resolver()
export class GeoEngineResolver {
  @Query(() => [[City], [Departement], [Region]], { nullable: true }) // Type de retour non fonctionnel (propose uniquement les champs de City en autocomplétion)
  async places(
    @Arg("name", { nullable: true }) name: string,
    @Arg("orderCitiesBy", { nullable: true }) orderCitiesBy: string
  ): Promise<BaseEntity[][] | undefined> {
    if (typeof name === "undefined") {
      return undefined;
    }

    let cities = City.createQueryBuilder("city");
    let departements = Departement.createQueryBuilder("departement");
    let regions = Region.createQueryBuilder("region");

    cities.where("LOWER(city.name) like LOWER(:name)", {
      name: `${name}%`,
    });

    departements
      .where("LOWER(departement.name) like LOWER(:name)", {
        name: `${name}%`,
      })
      .orderBy("departement.name");

    regions
      .where("LOWER(region.name) like LOWER(:name)", {
        name: `${name}%`,
      })
      .orderBy("region.name");

    if (typeof orderCitiesBy !== "undefined" && orderCitiesBy === "name") {
      cities = cities.orderBy("city.name");
    } else {
      cities = cities.orderBy("city.population", "DESC");
    }

    let results: BaseEntity[][] = [];

    results.push(await cities.getMany());
    results.push(await departements.getMany());
    results.push(await regions.getMany());

    return results;
  }
}
