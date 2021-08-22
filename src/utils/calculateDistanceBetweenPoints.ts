import { Position } from "geojson";

export function calculateDistanceBetweenPoints(
  point1: Position,
  point2: Position
) {
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
