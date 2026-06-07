import { Achievement } from '@/types/achievement';
import { AIMemory } from '@/types/aiMemory';
import { CheckInRecord } from '@/types/checkIn';
import { City } from '@/types/city';
import { ThemeQuest } from '@/types/quest';
import { Spot } from '@/types/spot';
import { Trip } from '@/types/trip';
import { TravelUser } from '@/types/user';
import { apiClient } from './apiClient';
import { cloneInitialTravelData, mockTravelService, syncDerivedTravelData } from './mockTravelService';
import { CheckInMutationResult, LightUpSpotOptions, TravelData, TravelDataService } from './types';

type AchievementsResponse = {
  achievements: Achievement[];
  quests: ThemeQuest[];
};

type TripDetailResponse = {
  trip: Trip;
  checkIns?: CheckInRecord[];
  aiMemory?: AIMemory | null;
};

type CheckInResponse = {
  checkIn?: CheckInRecord;
};

function toQuery(params: Record<string, string | number | boolean | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();

  return query ? `?${query}` : '';
}

function uniqueById<T extends { id: string }>(items: T[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

async function loadTripDetails(trips: Trip[]) {
  const details = await Promise.all(
    trips.map((trip) =>
      apiClient.get<TripDetailResponse>(`/trips/${trip.id}${toQuery({ include: 'checkIns,aiMemory' })}`)
    )
  );

  return {
    trips: details.map((detail) => detail.trip),
    checkIns: uniqueById(details.flatMap((detail) => detail.checkIns ?? [])),
    aiMemories: uniqueById(details.flatMap((detail) => (detail.aiMemory ? [detail.aiMemory] : []))),
  };
}

async function loadInitialData(): Promise<TravelData> {
  const fallback = cloneInitialTravelData();
  const [user, cities, spots, trips, achievementData] = await Promise.all([
    apiClient.get<TravelUser>('/users/me'),
    apiClient.get<City[]>(`/cities${toQuery({ pageSize: 100, includeStats: true })}`),
    apiClient.get<Spot[]>(`/spots${toQuery({ pageSize: 100, includeCity: true })}`),
    apiClient.get<Trip[]>(`/trips${toQuery({ pageSize: 100 })}`),
    apiClient.get<AchievementsResponse>(`/achievements${toQuery({ includeQuests: true })}`),
  ]);
  const tripDetails = await loadTripDetails(trips);

  return syncDerivedTravelData({
    user,
    cities,
    spots,
    plans: fallback.plans,
    quests: achievementData.quests,
    trips: tripDetails.trips,
    checkIns: tripDetails.checkIns,
    aiMemories: tripDetails.aiMemories,
    achievements: achievementData.achievements,
  });
}

async function createCheckIn(spotId: string, options: LightUpSpotOptions, current: TravelData): Promise<CheckInMutationResult> {
  const response = await apiClient.post<CheckInResponse>('/check-ins', {
    spotId,
    tripId: current.trips[0]?.id,
    type: options.type === 'gps' ? 'gps' : 'manual',
    moodText: options.moodText,
    location: options.location,
    photoIds: [],
    clientRequestId: `client-${Date.now()}`,
  });
  const data = await loadInitialData();

  return {
    checkIn: response.checkIn,
    data,
  };
}

async function generateAIMemory(tripId: string): Promise<{ memory?: AIMemory; data: TravelData }> {
  const memory = await apiClient.post<AIMemory>(`/trips/${tripId}/ai-memories`, {
    style: '自然日记',
    forceRegenerate: false,
    source: {
      includeMoodText: true,
    },
  });
  const data = await loadInitialData();

  return {
    memory,
    data,
  };
}

export const realApiService: TravelDataService = {
  loadInitialData,
  createCheckIn,
  createWeekendPlan: async (current) => mockTravelService.createWeekendPlan(current),
  generateAIMemory,
};
