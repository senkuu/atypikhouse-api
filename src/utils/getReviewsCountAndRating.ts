import { Offer } from "../entities/Offer";

export function getAverageRating(offer: Offer) {
  let ratings = offer.bookings.map((booking) => booking.review.rating);
  if (ratings.length === 0) {
    return offer;
  }

  let reducer = (total: number, currentValue: number) => total + currentValue;
  let sum = ratings.reduce(reducer);
  offer.averageRating = sum / ratings.length;
  return offer;
}
