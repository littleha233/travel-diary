export type AIMemory = {
  id: string;
  tripId: string;
  title: string;
  summary: string;
  content: string;
  shareText: string;
  style: string;
  photoUrls: string[];
  spotIds: string[];
  status?: 'queued' | 'generating' | 'completed' | 'failed';
  generatedAt?: string;
};
