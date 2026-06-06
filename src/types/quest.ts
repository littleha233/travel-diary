export type ThemeQuest = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  progress: number;
  total: number;
  coverUrl: string;
  rewardAchievementId: string;
  spotIds: string[];
  cityIds: string[];
};
