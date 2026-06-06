import { Achievement } from '@/types/achievement';

export const achievements: Achievement[] = [
  {
    id: 'first-departure',
    title: '初次出发',
    description: '完成第 1 次城市点亮',
    unlocked: true,
    unlockedAt: '2024-04-12',
    tone: 'mint',
  },
  {
    id: 'city-wanderer',
    title: '城市漫游者',
    description: '点亮 5 座城市',
    unlocked: true,
    unlockedAt: '2024-09-01',
    tone: 'purple',
  },
  {
    id: 'west-lake-first',
    title: '西湖初印象',
    description: '打卡任意 1 个西湖十景',
    unlocked: true,
    unlockedAt: '2026-05-01',
    tone: 'gold',
  },
  {
    id: 'west-lake-collector',
    title: '西湖收集家',
    description: '完成西湖十景 10/10',
    unlocked: false,
    tone: 'blue',
  },
];
