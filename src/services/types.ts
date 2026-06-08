import { Achievement } from '@/types/achievement';
import { AIMemory } from '@/types/aiMemory';
import { CheckInRecord } from '@/types/checkIn';
import { City } from '@/types/city';
import { CommunityPost } from '@/types/community';
import { TravelPlan } from '@/types/plan';
import { ThemeQuest } from '@/types/quest';
import { Spot } from '@/types/spot';
import { Trip } from '@/types/trip';
import { TravelUser } from '@/types/user';

export type TravelData = {
  user: TravelUser;
  cities: City[];
  spots: Spot[];
  plans: TravelPlan[];
  quests: ThemeQuest[];
  trips: Trip[];
  checkIns: CheckInRecord[];
  aiMemories: AIMemory[];
  achievements: Achievement[];
  communityPosts: CommunityPost[];
};

export type LightUpSpotOptions = {
  type?: CheckInRecord['type'];
  moodText?: string;
  tripId?: string;
  photoUri?: string;
  cachedPhotoUri?: string;
  photoUris?: string[];
  cachedPhotoUris?: string[];
  location?: CheckInRecord['location'];
  distanceMeters?: number;
};

export type CreateTripInput = {
  title: string;
  cityId: string;
  startDate: string;
  endDate: string;
  privacy: 'private' | 'friends' | 'public';
};

export type CheckInMutationResult = {
  checkIn?: CheckInRecord;
  data: TravelData;
};

export type AIMemoryGenerationInput = {
  tripId: string;
  style: string;
  extraPrompt: string;
};

export type AIMemoryDraft = {
  tripId: string;
  title: string;
  content: string;
  summary: string;
  shareText: string;
  style: string;
  photoUrls: string[];
  spotIds: string[];
  generatedAt?: string;
  safetyFallback?: boolean;
};

export type TravelDataService = {
  loadInitialData: () => Promise<TravelData>;
  createCheckIn: (spotId: string, options: LightUpSpotOptions, current: TravelData) => Promise<CheckInMutationResult>;
  createWeekendPlan: (current: TravelData) => Promise<{ plan: TravelPlan; data: TravelData }>;
  createTrip: (input: CreateTripInput, current: TravelData) => Promise<{ trip: Trip; data: TravelData }>;
  toggleCityManualLight: (cityId: string, current: TravelData) => Promise<{ city: City; data: TravelData }>;
  toggleWishlistCity: (cityId: string, current: TravelData) => Promise<{ city: City; data: TravelData }>;
  toggleWishlistSpot: (spotId: string, current: TravelData) => Promise<{ spot: Spot; data: TravelData }>;
  generateAIMemoryDraft: (input: AIMemoryGenerationInput, current: TravelData) => Promise<AIMemoryDraft>;
  saveAIMemory: (draft: AIMemoryDraft, current: TravelData) => Promise<{ memory: AIMemory; data: TravelData }>;
};
