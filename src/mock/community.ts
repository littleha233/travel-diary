import { CommunityPost } from '@/types/community';

export const communityPosts: CommunityPost[] = [
  {
    id: 'route-hangzhou',
    type: 'route',
    title: '杭州 3 日探索路线',
    subtitle: '7 个打卡点 · 3 天 · 2.1k 收藏',
    author: 'Nicola',
    linkedId: 'hangzhou-3-days',
    actionLabel: '加入我的计划',
    progress: 86,
  },
  {
    id: 'memory-post-hangzhou',
    type: 'ai-memory',
    title: '在杭州，把时间走慢',
    subtitle: '36 张照片 · AI 回忆',
    author: '小森',
    imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80',
    linkedId: 'memory-hangzhou',
  },
  {
    id: 'quest-west-lake',
    type: 'quest',
    title: '西湖十景继续收集',
    subtitle: '4 / 10 已点亮 · 完成解锁徽章',
    author: 'TravelAround',
    linkedId: 'west-lake-ten',
    actionLabel: '查看任务',
    progress: 40,
  },
  {
    id: 'achievement-west-lake',
    type: 'achievement',
    title: '小森完成了「西湖十景」',
    subtitle: '10 / 10 已点亮 · 成就分享',
    author: '小森',
    linkedId: 'west-lake-collector',
    actionLabel: '查看成就',
    progress: 100,
  },
];
