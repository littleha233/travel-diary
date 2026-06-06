import { CheckInRecord } from '@/types/checkIn';

export const checkIns: CheckInRecord[] = [
  {
    id: 'ci-west-lake',
    cityId: 'hangzhou',
    spotId: 'west-lake',
    tripId: 'hangzhou-3-days',
    createdAt: '2026-05-01T09:20:00.000Z',
    moodText: '清晨的西湖很安静，像一张慢慢亮起来的地图。',
    type: 'mock-gps',
  },
  {
    id: 'ci-leifeng-pagoda',
    cityId: 'hangzhou',
    spotId: 'leifeng-pagoda',
    tripId: 'hangzhou-3-days',
    createdAt: '2026-05-02T17:48:00.000Z',
    moodText: '黄昏的塔影很适合被收进旅行回忆。',
    type: 'mock-gps',
  },
];
