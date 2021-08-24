import { Position } from "geojson";
import { Offer } from "../entities/Offer";
import { calculateDistanceBetweenPoints } from "./calculateDistanceBetweenPoints";
import { getAverageRating } from "./getReviewsCountAndRating";

export function calculateOfferDistances(
  originPoint: Position,
  offers: Offer[]
) {
  const processedOffers = offers.slice();

  offers.forEach((offer) => {
    offer.distance = calculateDistanceBetweenPoints(
      originPoint,
      offer.coordinates.coordinates
    );
  });

  return processedOffers;
}

export function sortOffersByDistance(offers: Offer[]) {
  const sortedOffers = offers.slice();

  sortedOffers.sort(function (offer1, offer2) {
    return offer1.distance - offer2.distance;
  });

  return sortedOffers;
}

export function calculateOfferScores(
  offers: Offer[],
  useDistances: boolean,
  cityId?: number
) {
  let scoredOffers = offers.slice();

  scoredOffers.forEach((offer) => {
    offer.sortScore = 0;
  });

  if (useDistances) {
    if (typeof cityId !== "undefined") {
      scoredOffers.forEach((offer) => {
        if (offer.city.id === cityId) {
          offer.sortScore++;
        }
      });
    }

    let distanceScoreLevels = [5, 10, 20, 30, 50];
    scoredOffers.forEach((offer) => {
      let distanceScore = 4;

      for (const [level, maxDistance] of distanceScoreLevels.entries()) {
        if (offer.distance < maxDistance) {
          offer.sortScore += distanceScore;

          if (level === 0) {
            offer.sortScore += 1 - offer.distance / maxDistance;
          } else {
            let coeff = distanceScore >= 1 ? 1 : distanceScore;

            offer.sortScore +=
              coeff -
              ((offer.distance - distanceScoreLevels[level - 1]) /
                (maxDistance - distanceScoreLevels[level - 1])) *
                coeff;
          }

          break;
        }

        if (distanceScore > 1) {
          distanceScore--;
        } else {
          distanceScore /= 2;
        }
      }

      if (
        offer.distance >= distanceScoreLevels[distanceScoreLevels.length - 1] &&
        offer.distance < 1000
      ) {
        let coeff = distanceScore >= 1 ? 1 : distanceScore;

        offer.sortScore +=
          coeff -
          ((offer.distance -
            distanceScoreLevels[distanceScoreLevels.length - 1]) /
            (1000 - distanceScoreLevels[distanceScoreLevels.length - 1])) *
            coeff;
      }
    });
  }

  // Score sur 2 pour la moyenne des notes
  scoredOffers.forEach((offer) => {
    offer = getAverageRating(offer);

    if (typeof offer.averageRating !== "undefined") {
      offer.sortScore += Math.ceil((offer.averageRating / 5) * 10) / 5;
    }
  });

  // Score sur 2 pour le nombre d'avis laissés
  let reviewsCount = 0;
  let reviewsScoreLevels = { 10: 0.25, 25: 0.6, 50: 1, 100: 1.4, 500: 1.75 };
  scoredOffers.forEach((offer) => {
    offer.bookings.forEach((booking) => {
      if (typeof booking.review !== "undefined") {
        reviewsCount++;
      }
    });

    if (reviewsCount >= 5) {
      for (const [maxReviews, score] of Object.entries(reviewsScoreLevels)) {
        if (reviewsCount < parseInt(maxReviews)) {
          offer.sortScore += score;
          break;
        }
      }

      if (
        reviewsCount >=
        parseInt(
          Object.keys(reviewsScoreLevels)[
            Object.keys(reviewsScoreLevels).length
          ]
        )
      ) {
        offer.sortScore += 2;
      }
    }
  });

  if (useDistances) {
    let nearOffers: Offer[] = [];
    let otherOffers: Offer[] = [];

    scoredOffers.forEach((offer) => {
      if (offer.distance < 50) {
        nearOffers.push(offer);
      } else {
        otherOffers.push(offer);
      }
    });

    nearOffers = nearOffers.sort(function (offer1, offer2) {
      return offer2.sortScore - offer1.sortScore;
    });

    return [...nearOffers, ...otherOffers];
  }

  return scoredOffers;
}

/*
export function sortOffersByDistance(origin: Position, offers: Offer[]) {
  const sortedOffers = offers.slice();

  sortedOffers.sort(function (offer1, offer2) {
    let distanceOriginPoint1 = distanceBetweenPoints(
      origin,
      offer1.coordinates.coordinates
    );
    let distanceOriginPoint2 = distanceBetweenPoints(
      origin,
      offer2.coordinates.coordinates
    );

    let distanceDiff =
      distanceBetweenPoints(origin, offer1.coordinates.coordinates) -
      distanceBetweenPoints(origin, offer2.coordinates.coordinates);

    console.log(distanceOriginPoint1 + " / " + distanceOriginPoint2);

    return distanceDiff;
  });

  return sortedOffers;
}
*/
