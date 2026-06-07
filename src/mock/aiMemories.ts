import { AIMemory } from '@/types/aiMemory';
import { trips } from './trips';

export const aiMemories: AIMemory[] = [
  {
    id: 'memory-hangzhou',
    tripId: 'hangzhou-3-days',
    title: '在杭州，把时间走慢',
    summary: '3 天，1 座城市，7 个景点，36 张照片。',
    content:
      '清晨的西湖像一张安静的地图，断桥、苏堤和远处的山影被一点点点亮。后来去到湖边和老街，风里有水汽，也有很淡的茶香。这趟杭州旅行没有急着抵达什么，更多是在一步一步把城市走成自己的回忆。',
    shareText: '杭州 3 日游：把西湖、断桥和茶香写进一段慢下来的旅行回忆。',
    style: '自然日记',
    photoUrls: trips[0].photoUrls,
    spotIds: trips[0].spotIds,
    status: 'completed',
  },
];
