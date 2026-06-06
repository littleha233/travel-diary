export type CommunityContentType = 'route' | 'ai-memory' | 'quest' | 'achievement';

export type CommunityPost = {
  id: string;
  type: CommunityContentType;
  title: string;
  subtitle: string;
  author: string;
  imageUrl?: string;
  linkedId: string;
  actionLabel?: string;
  progress?: number;
};
