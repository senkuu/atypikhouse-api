import { Offer } from "../entities/Offer";
import { Position } from "geojson";

export function distanceBetweenPoints(point1: Position, point2: Position) {
  let radLat1 = (Math.PI * point1[0]) / 180;
  let radLat2 = (Math.PI * point2[0]) / 180;
  let theta = point1[1] - point2[1];
  let radTheta = (Math.PI * theta) / 180;
  let dist =
    Math.sin(radLat1) * Math.sin(radLat2) +
    Math.cos(radLat1) * Math.cos(radLat2) * Math.cos(radTheta);
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  return dist * 60 * 1.1515 * 1.609344;
}

export function calculateOfferDistances(
  originPoint: Position,
  offers: Offer[]
) {
  const processedOffers = offers.slice();

  offers.forEach((offer) => {
    offer.distance = distanceBetweenPoints(
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
