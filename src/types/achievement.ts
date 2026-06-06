export type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  tone: 'mint' | 'purple' | 'gold' | 'blue';
};
