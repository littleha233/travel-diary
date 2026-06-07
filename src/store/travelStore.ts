import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { serviceConfig, TravelDataSource } from '@/services/config';
import { cloneInitialTravelData, syncDerivedTravelData } from '@/services/mockTravelService';
import { travelDataService } from '@/services/travelDataService';
import { LightUpSpotOptions, TravelData } from '@/services/types';
import { Achievement } from '@/types/achievement';
import { AIMemory } from '@/types/aiMemory';
import { CheckInRecord } from '@/types/checkIn';
import { City } from '@/types/city';
import { TravelPlan } from '@/types/plan';
import { ThemeQuest } from '@/types/quest';
import { Spot } from '@/types/spot';
import { Trip } from '@/types/trip';
import { TravelUser } from '@/types/user';

type StoreStatus = 'loading' | 'ready' | 'error';

type TravelStoreState = TravelData & {
  status: StoreStatus;
  errorMessage?: string;
  dataSource: TravelDataSource;
  hydrateComplete: () => void;
  loadInitialData: (options?: { forceMockReset?: boolean }) => Promise<void>;
  retry: () => Promise<void>;
  setError: (message: string) => void;
  lightUpSpot: (spotId: string, options?: LightUpSpotOptions) => Promise<CheckInRecord | undefined>;
  createWeekendPlan: () => Promise<TravelPlan | undefined>;
  generateAIMemory: (tripId: string) => Promise<AIMemory | undefined>;
  resetLocalProgress: () => Promise<void>;
};

const initialData = syncDerivedTravelData(cloneInitialTravelData());

function pickTravelData(state: TravelData): TravelData {
  return {
    user: state.user,
    cities: state.cities,
    spots: state.spots,
    plans: state.plans,
    quests: state.quests,
    trips: state.trips,
    checkIns: state.checkIns,
    aiMemories: state.aiMemories,
    achievements: state.achievements,
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '旅行数据加载失败，请稍后重试。';
}

export const useTravelStore = create<TravelStoreState>()(
  persist(
    (set, get) => ({
      status: 'loading',
      errorMessage: undefined,
      dataSource: serviceConfig.dataSource,
      ...initialData,
      hydrateComplete: () => set({ status: 'ready', errorMessage: undefined }),
      loadInitialData: async (options = {}) => {
        set({ status: 'loading', errorMessage: undefined });

        try {
          if (serviceConfig.dataSource === 'mock' && !options.forceMockReset) {
            set({
              ...syncDerivedTravelData(pickTravelData(get())),
              status: 'ready',
              errorMessage: undefined,
            });
            return;
          }

          const data = await travelDataService.loadInitialData();
          set({
            ...data,
            status: 'ready',
            errorMessage: undefined,
          });
        } catch (error) {
          set({
            status: 'error',
            errorMessage: getErrorMessage(error),
          });
        }
      },
      retry: async () => {
        await get().loadInitialData();
      },
      setError: (message) => set({ status: 'error', errorMessage: message }),
      lightUpSpot: async (spotId, options = {}) => {
        set({ status: 'loading', errorMessage: undefined });

        try {
          const result = await travelDataService.createCheckIn(spotId, options, pickTravelData(get()));
          set({
            ...result.data,
            status: 'ready',
            errorMessage: undefined,
          });

          return result.checkIn;
        } catch (error) {
          set({
            status: 'error',
            errorMessage: getErrorMessage(error),
          });
          return undefined;
        }
      },
      createWeekendPlan: async () => {
        set({ status: 'loading', errorMessage: undefined });

        try {
          const result = await travelDataService.createWeekendPlan(pickTravelData(get()));
          set({
            ...result.data,
            status: 'ready',
            errorMessage: undefined,
          });

          return result.plan;
        } catch (error) {
          set({
            status: 'error',
            errorMessage: getErrorMessage(error),
          });
          return undefined;
        }
      },
      generateAIMemory: async (tripId) => {
        set({ status: 'loading', errorMessage: undefined });

        try {
          const result = await travelDataService.generateAIMemory(tripId, pickTravelData(get()));
          set({
            ...result.data,
            status: 'ready',
            errorMessage: undefined,
          });

          return result.memory;
        } catch (error) {
          set({
            status: 'error',
            errorMessage: getErrorMessage(error),
          });
          return undefined;
        }
      },
      resetLocalProgress: async () => {
        const data = await travelDataService.loadInitialData();
        set({
          ...data,
          status: 'ready',
          errorMessage: undefined,
        });
      },
    }),
    {
      name: 'travelaround-local-loop-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        cities: state.cities,
        spots: state.spots,
        plans: state.plans,
        quests: state.quests,
        trips: state.trips,
        checkIns: state.checkIns,
        aiMemories: state.aiMemories,
        achievements: state.achievements,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          state?.setError('本地旅行数据恢复失败');
          return;
        }
        void state?.loadInitialData();
      },
    }
  )
);
