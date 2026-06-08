import { Achievement } from '@/types/achievement';
import { AIMemory } from '@/types/aiMemory';
import { CheckInRecord } from '@/types/checkIn';
import { City } from '@/types/city';
import { ThemeQuest } from '@/types/quest';
import { Spot } from '@/types/spot';
import { Trip } from '@/types/trip';
import { TravelUser } from '@/types/user';
import { ApiClientError, apiClient } from './apiClient';
import { cloneInitialTravelData, mockTravelService, syncDerivedTravelData } from './mockTravelService';
import {
  AIMemoryDraft,
  AIMemoryGenerationInput,
  CheckInMutationResult,
  CreateTripInput,
  LightUpSpotOptions,
  TravelData,
  TravelDataService,
} from './types';

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

type SaveAIMemoryRequest = {
  tripId: string;
  title: string;
  content: string;
  summary: string;
  shareText: string;
  style: string;
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
    communityPosts: fallback.communityPosts,
  });
}

async function createCheckIn(
  spotId: string,
  options: LightUpSpotOptions,
  current: TravelData
): Promise<CheckInMutationResult> {
  const response = await apiClient.post<CheckInResponse>('/check-ins', {
    spotId,
    tripId: options.tripId ?? current.trips[0]?.id,
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

async function createTrip(input: CreateTripInput, current: TravelData) {
  return mockTravelService.createTrip(input, current);
}

function isTransientApiError(error: unknown) {
  return error instanceof ApiClientError && (error.status === 0 || error.status === 429 || error.status >= 500);
}

async function withGenerationRetry<T>(request: () => Promise<T>, retries = 2): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
      if (!isTransientApiError(error) || attempt === retries) {
        break;
      }
    }
  }

  throw lastError;
}

function normalizeDraft(input: AIMemoryGenerationInput, draft: AIMemoryDraft, current: TravelData): AIMemoryDraft {
  const trip = current.trips.find((item) => item.id === input.tripId);

  return {
    tripId: draft.tripId || input.tripId,
    title: draft.title?.trim() || '这趟旅行的回忆',
    content: draft.content?.trim() || '这趟旅行已经整理成回忆草稿，你可以继续编辑后保存。',
    summary: draft.summary?.trim() || `${trip?.days ?? 0} 天旅行回忆。`,
    shareText: draft.shareText?.trim() || `${trip?.title ?? '旅行'} 已生成一段新的回忆。`,
    style: draft.style?.trim() || input.style,
    photoUrls: draft.photoUrls ?? trip?.photoUrls ?? [],
    spotIds: draft.spotIds ?? trip?.spotIds ?? [],
    generatedAt: draft.generatedAt ?? new Date().toISOString(),
    safetyFallback: draft.safetyFallback,
  };
}

async function generateAIMemoryDraft(input: AIMemoryGenerationInput, current: TravelData): Promise<AIMemoryDraft> {
  const draft = await withGenerationRetry(() =>
    apiClient.post<AIMemoryDraft>('/ai-memories/generate', {
      tripId: input.tripId,
      style: input.style,
      extraPrompt: input.extraPrompt,
    })
  );

  return normalizeDraft(input, draft, current);
}

async function saveAIMemory(draft: AIMemoryDraft): Promise<{ memory: AIMemory; data: TravelData }> {
  const request: SaveAIMemoryRequest = {
    tripId: draft.tripId,
    title: draft.title,
    content: draft.content,
    summary: draft.summary,
    shareText: draft.shareText,
    style: draft.style,
  };
  const memory = await apiClient.post<AIMemory>('/ai-memories', request);
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
  createTrip,
  toggleCityManualLight: async (cityId, current) => mockTravelService.toggleCityManualLight(cityId, current),
  toggleWishlistCity: async (cityId, current) => mockTravelService.toggleWishlistCity(cityId, current),
  toggleWishlistSpot: async (spotId, current) => mockTravelService.toggleWishlistSpot(spotId, current),
  generateAIMemoryDraft,
  saveAIMemory,
};
