import { Query, Resolver, Arg, Mutation } from "type-graphql";

import { Offer } from "../entities/Offer";

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
    @Arg("location") location: string
  ): Promise<Offer> {
    return Offer.create({ title, description, location }).save();
  }

  @Mutation(() => Offer, { nullable: true })
  async updateOffer(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Arg("description", () => String, { nullable: true }) description: string
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
    Offer.update({ id }, { ...offer });
    return offer;
  }

  @Mutation(() => Boolean)
  async deleteOffer(@Arg("id") id: number): Promise<boolean> {
    await Offer.delete(id);
    return true;
  }
}
