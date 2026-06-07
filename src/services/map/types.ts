import { City } from '@/types/city';
import { ThemeQuest } from '@/types/quest';
import { GeoPoint, Spot } from '@/types/spot';

export type MapLayer = 'country' | 'city' | 'spot';

export type MapPointState = 'lit' | 'unlit' | 'wishlist' | 'theme-task';

export type MapPointKind = 'city' | 'spot';

export type MapPoint = {
  id: string;
  kind: MapPointKind;
  label: string;
  subtitle: string;
  state: MapPointState;
  coordinates: GeoPoint;
  x: number;
  y: number;
  href: `/city/${string}` | `/spot/${string}`;
  relatedQuestIds: string[];
};

export type NearbySpot = {
  spot: Spot;
  distanceMeters: number;
  distanceLabel: string;
};

export type BuildCountryPointsInput = {
  cities: City[];
  quests: ThemeQuest[];
};

export type BuildCityPointsInput = {
  cities: City[];
  quests: ThemeQuest[];
  focusCityId?: string;
};

export type BuildSpotPointsInput = {
  city: City;
  spots: Spot[];
  quests: ThemeQuest[];
};

export type FindNearbySpotsInput = {
  origin: GeoPoint;
  spots: Spot[];
  limit?: number;
};

export type MapProvider = {
  id: 'mock' | 'amap' | 'tencent' | 'mapbox';
  buildCountryPoints: (input: BuildCountryPointsInput) => MapPoint[];
  buildCityPoints: (input: BuildCityPointsInput) => MapPoint[];
  buildSpotPoints: (input: BuildSpotPointsInput) => MapPoint[];
  findNearbySpots: (input: FindNearbySpotsInput) => NearbySpot[];
};
