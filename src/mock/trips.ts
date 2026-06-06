import { Trip } from '@/types/trip';

export const trips: Trip[] = [
  {
    id: 'hangzhou-3-days',
    title: '杭州 3 日游',
    cityIds: ['hangzhou'],
    startDate: '2026-05-01',
    endDate: '2026-05-03',
    days: 3,
    spotIds: ['west-lake', 'leifeng-pagoda', 'broken-bridge', 'sudi'],
    checkInIds: ['ci-west-lake', 'ci-leifeng-pagoda'],
    photoUrls: [
      'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=500&q=80',
    ],
    photoCount: 36,
    coverUrl: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=80',
    aiMemoryId: 'memory-hangzhou',
    summary: '3 天 · 1 座城市 · 7 个景点 · 36 张照片',
  },
];
