export type City = {
  id: string;
  name: string;
  province: string;
  lit: boolean;
  wished?: boolean;
  visitedAt?: string;
  mapX: number;
  mapY: number;
  coverUrl: string;
  description: string;
  spotIds: string[];
  tags: string[];
};
