import { GeoPoint } from './spot';

export type City = {
  id: string;
  name: string;
  province: string;
  lit: boolean;
  manuallyLit?: boolean;
  wished?: boolean;
  visitedAt?: string;
  coordinates: GeoPoint;
  mapX: number;
  mapY: number;
  coverUrl: string;
  description: string;
  spotIds: string[];
  tags: string[];
};
