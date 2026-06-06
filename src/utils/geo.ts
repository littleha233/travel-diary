import { GeoPoint } from '@/types/spot';

const earthRadiusMeters = 6371000;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function getDistanceMeters(from: GeoPoint, to: GeoPoint) {
  const deltaLatitude = toRadians(to.latitude - from.latitude);
  const deltaLongitude = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);

  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(deltaLongitude / 2) ** 2;

  return Math.round(earthRadiusMeters * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)));
}

export function formatDistance(distanceMeters: number) {
  if (distanceMeters < 1000) {
    return `${distanceMeters}m`;
  }

  return `${(distanceMeters / 1000).toFixed(distanceMeters < 10000 ? 1 : 0)}km`;
}
