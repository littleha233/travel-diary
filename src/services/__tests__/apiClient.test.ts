import { getAccessToken } from '@/services/authSession';
import { apiClient } from '@/services/apiClient';

jest.mock('@/services/authSession', () => ({
  getAccessToken: jest.fn(),
}));

function makeResponse(data: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ data }),
  } as Response;
}

describe('apiClient auth headers', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('adds Authorization when an access token is available', async () => {
    const fetchMock = jest.fn().mockResolvedValue(makeResponse({ id: 'u-nicola' }));
    (getAccessToken as jest.Mock).mockResolvedValue('guest-token');
    global.fetch = fetchMock;

    await apiClient.get('/users/me');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer guest-token');
  });
});
