export type TravelDataSource = 'mock' | 'api';
export type ApiAuthMode = 'guest' | 'external';

function normalizeDataSource(value?: string): TravelDataSource {
  return value === 'api' ? 'api' : 'mock';
}

export const serviceConfig = {
  dataSource: normalizeDataSource(process.env.EXPO_PUBLIC_TRAVEL_DATA_SOURCE),
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/v1',
  requestTimeoutMs: Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS ?? 12000),
  authMode: (process.env.EXPO_PUBLIC_API_AUTH_MODE === 'external' ? 'external' : 'guest') as ApiAuthMode,
};
