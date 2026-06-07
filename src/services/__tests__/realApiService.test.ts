import { cloneInitialTravelData, syncDerivedTravelData } from '@/services/mockTravelService';
import { realApiService } from '@/services/realApiService';

function makeResponse({ ok, status, data, error }: { ok: boolean; status: number; data?: unknown; error?: unknown }) {
  return {
    ok,
    status,
    json: async () => (ok ? { data } : { error }),
  } as Response;
}

describe('realApiService AI generation', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('retries transient AI draft generation failures', async () => {
    const current = syncDerivedTravelData(cloneInitialTravelData());
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(
        makeResponse({ ok: false, status: 500, error: { code: 'AI_PROVIDER_ERROR', message: 'AI failed' } })
      )
      .mockResolvedValueOnce(
        makeResponse({ ok: false, status: 429, error: { code: 'RATE_LIMITED', message: 'Try later' } })
      )
      .mockResolvedValueOnce(
        makeResponse({
          ok: true,
          status: 200,
          data: {
            tripId: 'hangzhou-3-days',
            title: '在杭州，把时间走慢',
            content: '这是一段由后端代理生成的旅行回忆草稿。',
            summary: '3 天，1 座城市，7 个景点，36 张照片。',
            shareText: '杭州 3 日游生成了一段新的旅行回忆。',
            style: '自然日记',
            photoUrls: current.trips[0].photoUrls,
            spotIds: current.trips[0].spotIds,
          },
        })
      );
    global.fetch = fetchMock;

    const draft = await realApiService.generateAIMemoryDraft(
      {
        tripId: 'hangzhou-3-days',
        style: '自然日记',
        extraPrompt: '突出轻松的散步感。',
      },
      current
    );

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0][0]).toContain('/ai-memories/generate');
    expect(draft.title).toBe('在杭州，把时间走慢');
    expect(draft.shareText).toContain('杭州');
  });
});
