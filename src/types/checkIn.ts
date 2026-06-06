export type CheckInRecord = {
  id: string;
  cityId: string;
  spotId: string;
  tripId: string;
  createdAt: string;
  moodText: string;
  type: 'mock-gps' | 'manual';
};
