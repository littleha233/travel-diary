import AsyncStorage from '@react-native-async-storage/async-storage';
import { serviceConfig } from './config';

const authSessionStorageKey = 'travelaround-auth-session-v1';

export type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  tokenType?: string;
};

type AuthEnvelope = {
  data?: Partial<AuthSession> & {
    token?: string;
  };
};

function buildUrl(path: string) {
  const baseUrl = serviceConfig.apiBaseUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

function normalizeAuthSession(payload: AuthEnvelope): AuthSession {
  const accessToken = payload.data?.accessToken ?? payload.data?.token;

  if (!accessToken) {
    throw new Error('后端未返回 accessToken');
  }

  return {
    accessToken,
    refreshToken: payload.data?.refreshToken,
    expiresAt: payload.data?.expiresAt,
    tokenType: payload.data?.tokenType ?? 'Bearer',
  };
}

export async function getAuthSession() {
  const raw = await AsyncStorage.getItem(authSessionStorageKey);

  return raw ? (JSON.parse(raw) as AuthSession) : undefined;
}

export async function getAccessToken() {
  const session = await getAuthSession();

  return session?.accessToken;
}

export async function setAuthSession(session: AuthSession) {
  await AsyncStorage.setItem(authSessionStorageKey, JSON.stringify(session));
}

export async function clearAuthSession() {
  await AsyncStorage.removeItem(authSessionStorageKey);
}

export async function createGuestSession() {
  const response = await fetch(buildUrl('/auth/guest'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client: 'expo-go',
    }),
  });
  const payload = (await response.json().catch(() => ({}))) as AuthEnvelope;

  if (!response.ok) {
    throw new Error('游客会话创建失败，请检查后端鉴权接口。');
  }

  const session = normalizeAuthSession(payload);
  await setAuthSession(session);

  return session;
}

export async function ensureAuthSession() {
  const existing = await getAuthSession();
  if (existing?.accessToken || serviceConfig.authMode === 'external') {
    return existing;
  }

  return createGuestSession();
}
