import { serviceConfig } from './config';

type ApiMeta = {
  requestId?: string;
  serverTime?: string;
};

type ApiEnvelope<T> = {
  data: T;
  meta?: ApiMeta;
};

type ApiErrorEnvelope = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  timeoutMs?: number;
};

export class ApiClientError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor({
    code,
    message,
    status,
    details,
  }: {
    code: string;
    message: string;
    status: number;
    details?: unknown;
  }) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

function buildUrl(path: string) {
  const baseUrl = serviceConfig.apiBaseUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs ?? serviceConfig.requestTimeoutMs);

  try {
    const response = await fetch(buildUrl(path), {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: controller.signal,
    });

    const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T> & ApiErrorEnvelope;

    if (!response.ok) {
      throw new ApiClientError({
        code: payload.error?.code ?? 'HTTP_ERROR',
        message: payload.error?.message ?? `Request failed with status ${response.status}`,
        status: response.status,
        details: payload.error?.details,
      });
    }

    return payload.data as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    throw new ApiClientError({
      code: error instanceof DOMException && error.name === 'AbortError' ? 'REQUEST_TIMEOUT' : 'NETWORK_ERROR',
      message:
        error instanceof DOMException && error.name === 'AbortError'
          ? '请求超时，请稍后重试。'
          : '网络请求失败，请检查连接后重试。',
      status: 0,
      details: error,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => apiRequest<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(path, { ...options, method: 'POST', body }),
};
