import { cities, spots } from '@/mock';

export function getCityById(id: string) {
  return cities.find((city) => city.id === id);
}

export function getSpotById(id: string) {
  return spots.find((spot) => spot.id === id);
}

export function getSpotsByCity(cityId: string) {
  return spots.filter((spot) => spot.cityId === cityId);
}

export function getProgressPercent(progress: number, total: number) {
  if (!total) {
    return 0;
  }

  return Math.min(100, Math.round((progress / total) * 100));
}
