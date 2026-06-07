import { Achievement } from '@/types/achievement';
import { AIMemory } from '@/types/aiMemory';
import { CheckInRecord } from '@/types/checkIn';
import { City } from '@/types/city';
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
};

export type LightUpSpotOptions = {
  type?: CheckInRecord['type'];
  moodText?: string;
  photoUri?: string;
  cachedPhotoUri?: string;
  location?: CheckInRecord['location'];
  distanceMeters?: number;
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
  generateAIMemoryDraft: (input: AIMemoryGenerationInput, current: TravelData) => Promise<AIMemoryDraft>;
  saveAIMemory: (draft: AIMemoryDraft, current: TravelData) => Promise<{ memory: AIMemory; data: TravelData }>;
};
