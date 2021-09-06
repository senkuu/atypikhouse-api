import {
  Arg,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";

import { Booking } from "../entities/Booking";
import { Offer } from "../entities/Offer";
import { User } from "../entities/User";
import { FieldError } from "./FieldError";
import { createEntity } from "../utils/createEntity";
import { updateEntity } from "../utils/updateEntity";
import { Review } from "../entities/Review";
import { FindConditions } from "typeorm";
import { CreateReviewInput, UpdateReviewInput } from "./inputs/ReviewInput";
import { validateReview } from "../utils/validations/validateReview";

@ObjectType()
class ReviewResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => Review, { nullable: true })
  review?: Review;
}

// If offerId has a value, ownerId will be ignored
// / occupantId is compatible with offerId or ownerId
@Resolver()
export class ReviewResolver {
  @Query(() => [Review], { nullable: true })
  async reviews(
    @Arg("offerId", { nullable: true }) offerId?: number,
    @Arg("ownerId", { nullable: true }) ownerId?: number,
    @Arg("occupantId", { nullable: true }) occupantId?: number
  ): Promise<Review[] | null> {
    let reviews = await Review.createQueryBuilder("review")
      .innerJoinAndSelect("review.booking", "booking")
      .innerJoinAndSelect("booking.offer", "offer")
      .innerJoinAndSelect("booking.occupant", "occupant")
      .innerJoinAndSelect("offer.owner", "owner");

    if (typeof ownerId !== "undefined") {
      const owner = await User.findOne(ownerId);
      if (!owner) {
        return [];
      }

      reviews = reviews.where("owner.id = :owner", {
        owner: owner.id,
      });
    }
    if (typeof offerId !== "undefined") {
      const offer = await Offer.findOne(offerId);
      if (!offer) {
        return [];
      }

      // "where" method is ignoring previous "where" (done on purpose)
      reviews = reviews.where("offer.id = :offer", { offer: offer.id });
    }

    if (typeof occupantId !== "undefined") {
      const occupant = await User.findOne(occupantId);
      if (!occupant) {
        return [];
      }

      reviews = reviews.andWhere("occupant.id = :occupant", {
        occupant: occupant.id,
      });
    }

    return reviews.getMany();
  }

  @Query(() => Review, { nullable: true })
  async review(
    @Arg("id") id: number,
    @Arg("bookingId", { nullable: true }) bookingId?: number
  ): Promise<Review | undefined | null> {
    let findCondition: FindConditions<Review> = {};
    if (typeof bookingId !== "undefined") {
      const booking = await Booking.findOne(bookingId);
      if (!booking) {
        return Promise.resolve(null);
      }

      findCondition = { booking };
    }

    return Review.findOne(id, {
      relations: [
        "booking",
        "booking.occupant",
        "booking.offer",
        "offer.owner",
      ],
      where: findCondition,
    });
  }

  @Mutation(() => ReviewResponse)
  async createReview(
    @Arg("options") options: CreateReviewInput
  ): Promise<ReviewResponse> {
    const errors: FieldError[] = validateReview(options);

    let booking: Booking | undefined;
    if (typeof options.bookingId !== "undefined") {
      booking = await Booking.findOne(options.bookingId);
      if (!booking) {
        errors.push({
          field: "booking",
          message: "La réservation est introuvable",
        });
      }
    }

    // TODO: Check if admin or if user calling method is the occupant linked to the booking

    if (errors.length > 0) {
      return { errors };
    }

    let review: Review;
    try {
      review = await createEntity(options, "Booking", ["bookingId"], {
        booking: booking,
      });

      return { errors, review };
    } catch (err) {
      console.log(err.code + " " + err.detail);
      errors.push({
        field: "unknown",
        message: "Erreur inconnue, veuillez contacter l'administrateur",
      });

      return { errors };
    }
  }

  @Mutation(() => ReviewResponse, { nullable: true })
  async updateReview(
    @Arg("id") id: number,
    @Arg("options") options: UpdateReviewInput
  ): Promise<ReviewResponse> {
    let review = await this.review(id);
    if (!review) {
      return {
        errors: [{ field: "id", message: "L'avis est introuvable" }],
      };
    }

    const errors: FieldError[] = validateReview(options);

    review = await updateEntity(review, options, errors);
    review = await Review.save(review);

    return { errors, review };
  }

  @Mutation(() => Boolean)
  async deleteReview(@Arg("id") id: number): Promise<boolean> {
    await Review.delete(id);
    return true;
  }
}
