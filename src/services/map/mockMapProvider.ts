import { formatDistance, getDistanceMeters } from '@/utils/geo';
import { City } from '@/types/city';
import { ThemeQuest } from '@/types/quest';
import { GeoPoint, Spot } from '@/types/spot';
import {
  BuildCityPointsInput,
  BuildCountryPointsInput,
  BuildSpotPointsInput,
  FindNearbySpotsInput,
  MapPoint,
  MapPointState,
  MapProvider,
} from './types';

const chinaBounds = {
  minLatitude: 18,
  maxLatitude: 54,
  minLongitude: 73,
  maxLongitude: 135,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function projectPoint(point: GeoPoint, bounds = chinaBounds) {
  const x = ((point.longitude - bounds.minLongitude) / (bounds.maxLongitude - bounds.minLongitude)) * 100;
  const y = (1 - (point.latitude - bounds.minLatitude) / (bounds.maxLatitude - bounds.minLatitude)) * 100;

  return {
    x: clamp(x, 8, 92),
    y: clamp(y, 8, 92),
  };
}

function buildLocalBounds(points: GeoPoint[]) {
  if (!points.length) {
    return chinaBounds;
  }

  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const latitudePadding = Math.max((maxLatitude - minLatitude) * 0.32, 0.018);
  const longitudePadding = Math.max((maxLongitude - minLongitude) * 0.32, 0.018);

  return {
    minLatitude: minLatitude - latitudePadding,
    maxLatitude: maxLatitude + latitudePadding,
    minLongitude: minLongitude - longitudePadding,
    maxLongitude: maxLongitude + longitudePadding,
  };
}

function getCityQuestIds(city: City, quests: ThemeQuest[]) {
  return quests.filter((quest) => quest.cityIds.includes(city.id)).map((quest) => quest.id);
}

function getSpotQuestIds(spot: Spot, quests: ThemeQuest[]) {
  return quests.filter((quest) => quest.spotIds.includes(spot.id) || spot.questIds.includes(quest.id)).map((quest) => quest.id);
}

function getCityState(city: City, quests: ThemeQuest[]): MapPointState {
  if (city.lit) {
    return 'lit';
  }
  if (city.wished) {
    return 'wishlist';
  }
  if (getCityQuestIds(city, quests).length) {
    return 'theme-task';
  }

  return 'unlit';
}

function getSpotState(spot: Spot, quests: ThemeQuest[]): MapPointState {
  if (spot.status === 'lit') {
    return 'lit';
  }
  if (spot.status === 'wishlist') {
    return 'wishlist';
  }
  if (getSpotQuestIds(spot, quests).length) {
    return 'theme-task';
  }

  return 'unlit';
}

function cityToPoint(city: City, quests: ThemeQuest[], position = projectPoint(city.coordinates)): MapPoint {
  const relatedQuestIds = getCityQuestIds(city, quests);

  return {
    id: city.id,
    kind: 'city',
    label: city.name,
    subtitle: `${city.province} · ${city.lit ? '已点亮' : city.wished ? '心愿单' : relatedQuestIds.length ? '主题任务' : '未点亮'}`,
    state: getCityState(city, quests),
    coordinates: city.coordinates,
    x: position.x,
    y: position.y,
    href: `/city/${city.id}`,
    relatedQuestIds,
  };
}

function spotToPoint(spot: Spot, quests: ThemeQuest[], position: { x: number; y: number }): MapPoint {
  const relatedQuestIds = getSpotQuestIds(spot, quests);

  return {
    id: spot.id,
    kind: 'spot',
    label: spot.name,
    subtitle: spot.status === 'lit' ? '已点亮景点' : spot.status === 'wishlist' ? '心愿景点' : relatedQuestIds.length ? '主题任务景点' : '未点亮景点',
    state: getSpotState(spot, quests),
    coordinates: spot.coordinates,
    x: position.x,
    y: position.y,
    href: `/spot/${spot.id}`,
    relatedQuestIds,
  };
}

function buildCountryPoints({ cities, quests }: BuildCountryPointsInput) {
  return cities.map((city) => cityToPoint(city, quests));
}

function buildCityPoints({ cities, quests, focusCityId }: BuildCityPointsInput) {
  const focusCity = cities.find((city) => city.id === focusCityId) ?? cities.find((city) => city.lit) ?? cities[0];
  if (!focusCity) {
    return [];
  }

  const nearbyCities = cities
    .filter((city) => city.id !== focusCity.id)
    .map((city) => ({
      city,
      distance: getDistanceMeters(focusCity.coordinates, city.coordinates),
    }))
    .sort((left, right) => left.distance - right.distance)
    .slice(0, 5)
    .map(({ city }) => city);
  const layerCities = [focusCity, ...nearbyCities];
  const bounds = buildLocalBounds(layerCities.map((city) => city.coordinates));

  return layerCities.map((city) => cityToPoint(city, quests, projectPoint(city.coordinates, bounds)));
}

function buildSpotPoints({ city, spots, quests }: BuildSpotPointsInput) {
  const citySpots = spots.filter((spot) => spot.cityId === city.id);
  const bounds = buildLocalBounds([city.coordinates, ...citySpots.map((spot) => spot.coordinates)]);

  return citySpots.map((spot) => spotToPoint(spot, quests, projectPoint(spot.coordinates, bounds)));
}

function findNearbySpots({ origin, spots, limit = 5 }: FindNearbySpotsInput) {
  return spots
    .map((spot) => {
      const distanceMeters = getDistanceMeters(origin, spot.coordinates);

      return {
        spot,
        distanceMeters,
        distanceLabel: formatDistance(distanceMeters),
      };
    })
    .sort((left, right) => left.distanceMeters - right.distanceMeters)
    .slice(0, limit);
}

export const mockMapProvider: MapProvider = {
  id: 'mock',
  buildCountryPoints,
  buildCityPoints,
  buildSpotPoints,
  findNearbySpots,
};
