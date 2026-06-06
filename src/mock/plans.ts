import { TravelPlan } from '@/types/plan';

export const plans: TravelPlan[] = [
  {
    id: 'hangzhou-weekend',
    title: '杭州周末探索',
    cityIds: ['hangzhou'],
    days: 3,
    progress: 2,
    total: 8,
    coverUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
    startHint: '下次出发 · Next Mission',
    spotIds: ['broken-bridge', 'sudi', 'lingyin-temple', 'leifeng-pagoda'],
    wishlistCityIds: ['chengdu', 'beijing', 'nanjing'],
  },
];
