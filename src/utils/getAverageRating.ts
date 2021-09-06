import { Offer } from "../entities/Offer";

export function getAverageRating(offer: Offer) {
  if (offer.bookings.length === 0) {
    return offer;
  }

  let bookings = offer.bookings.filter((booking) => booking.review !== null);

  if (bookings.length === 0) {
    return offer;
  }

  let ratings = bookings.map((booking) => booking.review.rating);

  let reducer = (total: number, currentValue: number) => total + currentValue;
  let sum = ratings.reduce(reducer);
  offer.averageRating = sum / ratings.length;
  return offer;
}
