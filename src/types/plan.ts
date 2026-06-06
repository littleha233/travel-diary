export type TravelPlan = {
  id: string;
  title: string;
  cityIds: string[];
  days: number;
  progress: number;
  total: number;
  coverUrl: string;
  startHint: string;
  spotIds: string[];
  wishlistCityIds: string[];
};
