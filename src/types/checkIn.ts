import { GeoPoint } from './spot';

export type CheckInRecord = {
  id: string;
  cityId: string;
  spotId: string;
  tripId: string;
  createdAt: string;
  moodText: string;
  type: 'mock-gps' | 'gps' | 'manual';
  photoUri?: string;
  cachedPhotoUri?: string;
  location?: GeoPoint;
  distanceMeters?: number;
};
