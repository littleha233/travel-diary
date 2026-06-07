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
import { TravelPlan } from '@/types/plan';
import { ThemeQuest } from '@/types/quest';
import { TravelUser } from '@/types/user';
import { AIMemoryDraft, AIMemoryGenerationInput, CheckInMutationResult, LightUpSpotOptions, TravelData, TravelDataService } from './types';

const defaultTripId = 'hangzhou-3-days';

export function cloneInitialTravelData(): TravelData {
  return {
    user: { ...initialUser },
    cities: initialCities.map((city) => ({ ...city, coordinates: { ...city.coordinates }, spotIds: [...city.spotIds], tags: [...city.tags] })),
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

export function syncDerivedTravelData(state: TravelData): TravelData {
  const normalizedCities = state.cities.map((city) => {
    const fallbackCity = initialCities.find((item) => item.id === city.id);

    return {
      ...city,
      coordinates: city.coordinates ?? fallbackCity?.coordinates ?? { latitude: 30.5928, longitude: 114.3055 },
    };
  });
  const normalizedTrips = state.trips.map((trip) => ({
    ...trip,
    photoCount: trip.photoCount ?? trip.photoUrls.length,
  }));
  const litSpotIds = new Set(state.spots.filter((spot) => spot.status === 'lit').map((spot) => spot.id));
  const litCityIds = new Set(normalizedCities.filter((city) => city.lit).map((city) => city.id));
  const provinceCount = new Set(normalizedCities.filter((city) => city.lit).map((city) => city.province)).size;

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

  const achievements = state.achievements.map((achievement) => updateAchievement(achievement, normalizedCities, state.spots, quests));

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
    cities: normalizedCities,
    user,
    trips: normalizedTrips,
    plans,
    quests,
    achievements,
  };
}

function updateAchievement(achievement: Achievement, cities: TravelData['cities'], spots: TravelData['spots'], quests: ThemeQuest[]) {
  const litCityIds = new Set(cities.filter((city) => city.lit).map((city) => city.id));

  if (achievement.id === 'first-departure') {
    return { ...achievement, unlocked: litCityIds.size >= 1, unlockedAt: achievement.unlockedAt ?? new Date().toISOString() };
  }
  if (achievement.id === 'city-wanderer') {
    return { ...achievement, unlocked: litCityIds.size >= 5, unlockedAt: achievement.unlockedAt ?? new Date().toISOString() };
  }
  if (achievement.id === 'west-lake-first') {
    const hasWestLakeSpot = spots.some((spot) => spot.questIds.includes('west-lake-ten') && spot.status === 'lit');
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
}

function createLocalCheckIn(current: TravelData, spotId: string, options: LightUpSpotOptions = {}): CheckInMutationResult {
  const targetSpot = current.spots.find((spot) => spot.id === spotId);
  if (!targetSpot) {
    throw new Error('没有找到这个景点');
  }

  if (targetSpot.status === 'lit') {
    return {
      data: syncDerivedTravelData(current),
    };
  }

  const now = new Date().toISOString();
  const moodText = options.moodText?.trim() || `我点亮了 ${targetSpot.name}，新的旅行光点已经同步到地图。`;
  const checkIn: CheckInRecord = {
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
          photoIds: checkInPhotoUri ? Array.from(new Set([...spot.photoIds, `local-photo-${checkIn.id}`])) : spot.photoIds,
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

  const checkIns = [...current.checkIns, checkIn];
  const trips = current.trips.map((trip) =>
    trip.id === defaultTripId
      ? {
          ...trip,
          spotIds: Array.from(new Set([...trip.spotIds, spotId])),
          checkInIds: Array.from(new Set([...trip.checkInIds, checkIn.id])),
          photoUrls: checkInPhotoUri ? Array.from(new Set([...trip.photoUrls, checkInPhotoUri])) : trip.photoUrls,
          photoCount: checkInPhotoUri ? (trip.photoCount ?? trip.photoUrls.length) + 1 : trip.photoCount ?? trip.photoUrls.length,
          summary: `${trip.days} 天 · ${trip.cityIds.length} 座城市 · ${Array.from(new Set([...trip.spotIds, spotId])).length} 个景点 · ${
            checkInPhotoUri ? (trip.photoCount ?? trip.photoUrls.length) + 1 : trip.photoCount ?? trip.photoUrls.length
          } 张照片`,
        }
      : trip
  );

  return {
    checkIn,
    data: syncDerivedTravelData({
      ...current,
      spots,
      cities,
      checkIns,
      trips,
    }),
  };
}

function createLocalWeekendPlan(current: TravelData) {
  const existing = current.plans.find((plan) => plan.id === 'hangzhou-westlake-active');
  if (existing) {
    return { plan: existing, data: current };
  }

  const plan: TravelPlan = {
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

  return {
    plan,
    data: syncDerivedTravelData({
      ...current,
      plans: [...current.plans, plan],
    }),
  };
}

const unsafePromptPatterns = [
  /仇恨|歧视|暴力|自残|色情|违法/,
  /hate|violent|self-harm|sexual|illegal/i,
];

function hasUnsafePrompt(input: string) {
  return unsafePromptPatterns.some((pattern) => pattern.test(input));
}

function getTripContext(current: TravelData, tripId: string) {
  const trip = current.trips.find((item) => item.id === tripId);
  if (!trip) {
    throw new Error('没有找到可生成回忆的旅行记录');
  }

  const tripSpots = current.spots.filter((spot) => trip.spotIds.includes(spot.id));
  const tripCities = current.cities.filter((city) => trip.cityIds.includes(city.id));
  const tripCheckIns = current.checkIns.filter((checkIn) => checkIn.tripId === trip.id);

  return {
    trip,
    tripCities,
    tripSpots,
    tripCheckIns,
  };
}

function generateFallbackDraft(input: AIMemoryGenerationInput, current: TravelData): AIMemoryDraft {
  const { trip, tripCities, tripSpots } = getTripContext(current, input.tripId);
  const generatedAt = new Date().toISOString();

  return {
    tripId: trip.id,
    title: `${tripCities[0]?.name ?? '这趟旅行'}的安静片段`,
    summary: `${trip.days} 天，${tripCities.length} 座城市，${tripSpots.length} 个景点，${trip.photoCount ?? trip.photoUrls.length} 张照片。`,
    content:
      '这趟旅行的记录已经整理完成。为了保持内容安全和稳定，系统先生成了一版克制的旅行回忆：它保留城市、日期、景点和照片数量，把重点放在真实行程本身。你可以继续编辑这段文字，再保存为自己的 AI 回忆。',
    shareText: `${trip.title} 已整理成一段旅行回忆，记录 ${tripSpots.length} 个被点亮的地点。`,
    style: input.style,
    photoUrls: trip.photoUrls,
    spotIds: trip.spotIds,
    generatedAt,
    safetyFallback: true,
  };
}

function generateLocalAIMemoryDraft(input: AIMemoryGenerationInput, current: TravelData): AIMemoryDraft {
  const { trip, tripCities, tripSpots, tripCheckIns } = getTripContext(current, input.tripId);
  const unsafeSource = `${input.extraPrompt} ${tripCheckIns.map((checkIn) => checkIn.moodText).join(' ')}`;

  if (hasUnsafePrompt(unsafeSource)) {
    return generateFallbackDraft(input, current);
  }

  const generatedAt = new Date().toISOString();
  const cityNames = tripCities.map((city) => city.name).join('、') || '这座城市';
  const spotNames = tripSpots.map((spot) => spot.name).join('、') || '沿途地点';
  const moodTexts = tripCheckIns
    .map((checkIn) => checkIn.moodText)
    .filter(Boolean)
    .slice(-3)
    .join(' / ');
  const userNote = input.extraPrompt.trim();
  const photoCount = trip.photoCount ?? trip.photoUrls.length;
  const styleTone = input.style || '自然日记';
  const noteSentence = userNote ? `你补充的线索是：“${userNote}”。` : '没有额外补充，于是这版文字更像一篇自然日记。';
  const moodSentence = moodTexts ? `当时留下的心情包括：${moodTexts}。` : '这趟旅行没有太多刻意记录的心情，但地点本身已经留下了足够清晰的轮廓。';

  return {
    tripId: trip.id,
    title: `在${cityNames}，把时间走成故事`,
    summary: `${trip.startDate} 到 ${trip.endDate}，${trip.days} 天，${tripCities.length} 座城市，${tripSpots.length} 个景点，${photoCount} 张照片。`,
    content: `这次${trip.title}从 ${trip.startDate} 走到 ${trip.endDate}，地图上亮起了 ${spotNames}。${moodSentence}${noteSentence}照片没有参与识别，但 ${photoCount} 张照片的数量像一串坐标，提醒这趟路不是空泛的计划，而是真实抵达过的现场。用“${styleTone}”的方式回看，它更像一段慢慢展开的城市笔记：先是出发，后来是停留，最后把景点、心情和日期收束成一段可以分享的回忆。`,
    shareText: `${trip.title}：${trip.days} 天点亮 ${tripSpots.length} 个地点，用${styleTone}写下一段旅行回忆。`,
    style: styleTone,
    photoUrls: trip.photoUrls,
    spotIds: trip.spotIds,
    generatedAt,
  };
}

function saveLocalAIMemory(current: TravelData, draft: AIMemoryDraft) {
  const trip = current.trips.find((item) => item.id === draft.tripId);
  if (!trip) {
    throw new Error('没有找到可保存回忆的旅行记录');
  }

  const memory: AIMemory = {
    id: `memory-${draft.tripId}-${Date.now()}`,
    tripId: draft.tripId,
    title: draft.title,
    summary: draft.summary,
    content: draft.content,
    shareText: draft.shareText,
    style: draft.style,
    photoUrls: draft.photoUrls,
    spotIds: draft.spotIds,
    status: 'completed',
    generatedAt: draft.generatedAt ?? new Date().toISOString(),
  };

  const aiMemories = [...current.aiMemories.filter((item) => item.id !== memory.id), memory];
  const trips = current.trips.map((item) => (item.id === draft.tripId ? { ...item, aiMemoryId: memory.id } : item));

  return {
    memory,
    data: syncDerivedTravelData({
      ...current,
      aiMemories,
      trips,
    }),
  };
}

export const mockTravelService: TravelDataService = {
  loadInitialData: async () => syncDerivedTravelData(cloneInitialTravelData()),
  createCheckIn: async (spotId, options, current) => createLocalCheckIn(current, spotId, options),
  createWeekendPlan: async (current) => createLocalWeekendPlan(current),
  generateAIMemoryDraft: async (input, current) => generateLocalAIMemoryDraft(input, current),
  saveAIMemory: async (draft, current) => saveLocalAIMemory(current, draft),
};
