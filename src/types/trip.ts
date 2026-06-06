export type Trip = {
  id: string;
  title: string;
  cityIds: string[];
  startDate: string;
  endDate: string;
  days: number;
  spotIds: string[];
  checkInIds: string[];
  photoUrls: string[];
  coverUrl: string;
  aiMemoryId?: string;
  summary: string;
};
