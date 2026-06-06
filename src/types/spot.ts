export type SpotStatus = 'available' | 'lit' | 'locked' | 'wishlist';

export type Spot = {
  id: string;
  cityId: string;
  name: string;
  distance: string;
  radius: number;
  status: SpotStatus;
  canCheckIn: boolean;
  coverUrl: string;
  description: string;
  tags: string[];
  questIds: string[];
  photoIds: string[];
};
