import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { achievements as initialAchievements } from '@/mock/achievements';
import { aiMemories as initialAiMemories } from '@/mock/aiMemories';
import { checkIns as initialCheckIns } from '@/mock/checkIns';
import { cities as initialCities } from '@/mock/cities';
import { plans as initialPlans } from '@/mock/plans';
import { quests as initialQuests } from '@/mock/quests';
import { spots as initialSpots } from '@/mock/spots';
import { trips as initialTrips } from '@/mock/trips';
import { mockUser as initialUser } from '@/mock/user';
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

type LightUpSpotOptions = {
  type?: CheckInRecord['type'];
  moodText?: string;
  photoUri?: string;
  cachedPhotoUri?: string;
  location?: CheckInRecord['location'];
  distanceMeters?: number;
};

type TravelStoreState = {
  status: StoreStatus;
  errorMessage?: string;
  user: TravelUser;
  cities: City[];
  spots: Spot[];
  plans: TravelPlan[];
  quests: ThemeQuest[];
  trips: Trip[];
  checkIns: CheckInRecord[];
  aiMemories: AIMemory[];
  achievements: Achievement[];
  hydrateComplete: () => void;
  setError: (message: string) => void;
  lightUpSpot: (spotId: string, options?: LightUpSpotOptions) => CheckInRecord | undefined;
  createWeekendPlan: () => TravelPlan;
  generateAIMemory: (tripId: string) => AIMemory | undefined;
  resetLocalProgress: () => void;
};

type TravelData = Pick<
  TravelStoreState,
  'user' | 'cities' | 'spots' | 'plans' | 'quests' | 'trips' | 'checkIns' | 'aiMemories' | 'achievements'
>;

const defaultTripId = 'hangzhou-3-days';

function cloneInitialState() {
  return {
    user: { ...initialUser },
    cities: initialCities.map((city) => ({ ...city, spotIds: [...city.spotIds], tags: [...city.tags] })),
    spots: initialSpots.map((spot) => ({
      ...spot,
      coordinates: { ...spot.coordinates },
      tags: [...spot.tags],
      questIds: [...spot.questIds],
      photoIds: [...spot.photoIds],
    })),
    plans: initialPlans.map((plan) => ({
      ...plan,
      cityIds: [...plan.cityIds],
      spotIds: [...plan.spotIds],
      wishlistCityIds: [...plan.wishlistCityIds],
    })),
    quests: initialQuests.map((quest) => ({
      ...quest,
      spotIds: [...quest.spotIds],
      cityIds: [...quest.cityIds],
    })),
    trips: initialTrips.map((trip) => ({
      ...trip,
      cityIds: [...trip.cityIds],
      spotIds: [...trip.spotIds],
      checkInIds: [...trip.checkInIds],
      photoUrls: [...trip.photoUrls],
      photoCount: trip.photoCount,
    })),
    checkIns: initialCheckIns.map((checkIn) => ({ ...checkIn })),
    aiMemories: initialAiMemories.map((memory) => ({
      ...memory,
      photoUrls: [...memory.photoUrls],
      spotIds: [...memory.spotIds],
    })),
    achievements: initialAchievements.map((achievement) => ({ ...achievement })),
  };
}

function syncDerivedState(state: TravelData): TravelData {
  const normalizedTrips = state.trips.map((trip) => ({
    ...trip,
    photoCount: trip.photoCount ?? trip.photoUrls.length,
  }));
  const litSpotIds = new Set(state.spots.filter((spot) => spot.status === 'lit').map((spot) => spot.id));
  const litCityIds = new Set(state.cities.filter((city) => city.lit).map((city) => city.id));
  const provinceCount = new Set(state.cities.filter((city) => city.lit).map((city) => city.province)).size;

  const quests = state.quests.map((quest) => {
    if (!quest.spotIds.length) {
      return quest;
    }

    const progress = quest.spotIds.filter((spotId) => litSpotIds.has(spotId)).length;

    return {
      ...quest,
      progress,
      subtitle: `${progress} / ${quest.total} 已点亮`,
    };
  });

  const plans = state.plans.map((plan) => {
    const planProgress = plan.spotIds.filter((spotId) => litSpotIds.has(spotId)).length;

    return {
      ...plan,
      progress: planProgress,
    };
  });

  const achievements = state.achievements.map((achievement) => {
    if (achievement.id === 'first-departure') {
      return { ...achievement, unlocked: litCityIds.size >= 1, unlockedAt: achievement.unlockedAt ?? new Date().toISOString() };
    }
    if (achievement.id === 'city-wanderer') {
      return { ...achievement, unlocked: litCityIds.size >= 5, unlockedAt: achievement.unlockedAt ?? new Date().toISOString() };
    }
    if (achievement.id === 'west-lake-first') {
      const hasWestLakeSpot = state.spots.some((spot) => spot.questIds.includes('west-lake-ten') && spot.status === 'lit');
      return { ...achievement, unlocked: hasWestLakeSpot, unlockedAt: achievement.unlockedAt ?? new Date().toISOString() };
    }
    if (achievement.id === 'west-lake-collector') {
      const westLakeQuest = quests.find((quest) => quest.id === 'west-lake-ten');
      return {
        ...achievement,
        unlocked: Boolean(westLakeQuest && westLakeQuest.progress >= westLakeQuest.total),
        unlockedAt: achievement.unlockedAt,
      };
    }
    return achievement;
  });

  const user: TravelUser = {
    ...state.user,
    litCityCount: litCityIds.size,
    exploredSpotCount: litSpotIds.size,
    aiMemoryCount: state.aiMemories.length,
    achievementCount: achievements.filter((achievement) => achievement.unlocked).length,
    provinceCount,
    tripCount: state.trips.length,
  };

  return {
    ...state,
    user,
    trips: normalizedTrips,
    plans,
    quests,
    achievements,
  };
}

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

export const useTravelStore = create<TravelStoreState>()(
  persist(
    (set, get) => ({
      status: 'loading',
      errorMessage: undefined,
      ...syncDerivedState(cloneInitialState()),
      hydrateComplete: () => set({ status: 'ready', errorMessage: undefined }),
      setError: (message) => set({ status: 'error', errorMessage: message }),
      lightUpSpot: (spotId, options = {}) => {
        let createdCheckIn: CheckInRecord | undefined;

        set((current) => {
          const targetSpot = current.spots.find((spot) => spot.id === spotId);
          if (!targetSpot) {
            return { ...current, status: 'error', errorMessage: '没有找到这个景点' };
          }
          if (targetSpot.status === 'lit') {
            return {
              ...syncDerivedState(pickTravelData(current)),
              status: 'ready',
              errorMessage: undefined,
            };
          }

          const now = new Date().toISOString();
          const moodText = options.moodText?.trim() || `我点亮了 ${targetSpot.name}，新的旅行光点已经同步到地图。`;
          createdCheckIn = {
            id: `ci-${spotId}-${Date.now()}`,
            cityId: targetSpot.cityId,
            spotId,
            tripId: defaultTripId,
            createdAt: now,
            moodText,
            type: options.type ?? 'mock-gps',
            photoUri: options.photoUri,
            cachedPhotoUri: options.cachedPhotoUri,
            location: options.location,
            distanceMeters: options.distanceMeters,
          };
          const checkInPhotoUri = options.cachedPhotoUri ?? options.photoUri;

          const spots = current.spots.map((spot) =>
            spot.id === spotId
              ? {
                  ...spot,
                  status: 'lit' as const,
                  canCheckIn: false,
                  tags: Array.from(new Set([...spot.tags.filter((tag) => tag !== '可点亮' && tag !== '心愿'), '已点亮'])),
                  photoIds: checkInPhotoUri
                    ? Array.from(new Set([...spot.photoIds, `local-photo-${createdCheckIn!.id}`]))
                    : spot.photoIds,
                }
              : spot
          );

          const cities = current.cities.map((city) =>
            city.id === targetSpot.cityId
              ? {
                  ...city,
                  lit: true,
                  visitedAt: city.visitedAt ?? now.slice(0, 10),
                  spotIds: Array.from(new Set([...city.spotIds, spotId])),
                }
              : city
          );

          const checkIns = [...current.checkIns, createdCheckIn];
          const trips = current.trips.map((trip) =>
            trip.id === defaultTripId
              ? {
                  ...trip,
                  spotIds: Array.from(new Set([...trip.spotIds, spotId])),
                  checkInIds: Array.from(new Set([...trip.checkInIds, createdCheckIn!.id])),
                  photoUrls: checkInPhotoUri ? Array.from(new Set([...trip.photoUrls, checkInPhotoUri])) : trip.photoUrls,
                  photoCount: checkInPhotoUri ? (trip.photoCount ?? trip.photoUrls.length) + 1 : trip.photoCount ?? trip.photoUrls.length,
                  summary: `${trip.days} 天 · ${trip.cityIds.length} 座城市 · ${Array.from(new Set([...trip.spotIds, spotId])).length} 个景点 · ${
                    checkInPhotoUri ? (trip.photoCount ?? trip.photoUrls.length) + 1 : trip.photoCount ?? trip.photoUrls.length
                  } 张照片`,
                }
              : trip
          );

          return {
            ...syncDerivedState({
              ...pickTravelData(current),
              spots,
              cities,
              checkIns,
              trips,
            }),
            status: 'ready',
            errorMessage: undefined,
          };
        });

        return createdCheckIn;
      },
      createWeekendPlan: () => {
        const existing = get().plans.find((plan) => plan.id === 'hangzhou-westlake-active');
        if (existing) {
          return existing;
        }

        const newPlan: TravelPlan = {
          id: 'hangzhou-westlake-active',
          title: '西湖十景补完计划',
          cityIds: ['hangzhou'],
          days: 2,
          progress: 0,
          total: 4,
          coverUrl: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=80',
          startHint: '本地新建 · Mock Plan',
          spotIds: ['broken-bridge', 'sudi', 'leifeng-pagoda', 'lingyin-temple'],
          wishlistCityIds: ['chengdu', 'beijing', 'nanjing'],
        };

        set((current) =>
          ({
            ...syncDerivedState({
              ...pickTravelData(current),
              plans: [...current.plans, newPlan],
            }),
            status: 'ready',
            errorMessage: undefined,
          })
        );

        return get().plans.find((plan) => plan.id === newPlan.id) ?? newPlan;
      },
      generateAIMemory: (tripId) => {
        const trip = get().trips.find((item) => item.id === tripId);
        if (!trip) {
          set({ status: 'error', errorMessage: '没有找到可生成回忆的旅行记录' });
          return undefined;
        }

        const tripSpots = get().spots.filter((spot) => trip.spotIds.includes(spot.id));
        const generatedAt = new Date().toISOString();
        const title = `把 ${tripSpots[0]?.name ?? '旅途'} 走成一段回忆`;
        const spotNames = tripSpots.map((spot) => spot.name).join('、');
        const content = `这次 ${trip.title} 一共 ${trip.days} 天，地图上又亮起了 ${tripSpots.length} 个地点：${spotNames}。最清晰的是刚刚点亮的新节点，它让这趟旅程不再只是计划里的名字，而是变成了旅行记录里真实的一步。照片、地点和心情被整理成这段 mock AI 回忆，等待下一次出发继续延伸。`;

        const memory: AIMemory = {
          id: `memory-${tripId}-${Date.now()}`,
          tripId,
          title,
          summary: `${trip.days} 天，${trip.cityIds.length} 座城市，${tripSpots.length} 个景点，${trip.photoCount ?? trip.photoUrls.length} 张照片。`,
          content,
          style: '自然日记',
          photoUrls: trip.photoUrls,
          spotIds: trip.spotIds,
          generatedAt,
        };

        set((current) => {
          const aiMemories = [...current.aiMemories, memory];
          const trips = current.trips.map((item) => (item.id === tripId ? { ...item, aiMemoryId: memory.id } : item));

          return {
            ...syncDerivedState({
              ...pickTravelData(current),
              aiMemories,
              trips,
            }),
            status: 'ready',
            errorMessage: undefined,
          };
        });

        return memory;
      },
      resetLocalProgress: () =>
        set({
          ...syncDerivedState(cloneInitialState()),
          status: 'ready',
          errorMessage: undefined,
        }),
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
        state?.hydrateComplete();
      },
    }
  )
);
