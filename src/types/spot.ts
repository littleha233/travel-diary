export type SpotStatus = 'available' | 'lit' | 'locked' | 'wishlist';

export type GeoPoint = {
  latitude: number;
  longitude: number;
};

export type Spot = {
  id: string;
  cityId: string;
  name: string;
  distance: string;
  radius: number;
  coordinates: GeoPoint;
  status: SpotStatus;
  canCheckIn: boolean;
  coverUrl: string;
  description: string;
  tags: string[];
  questIds: string[];
  photoIds: string[];
};
