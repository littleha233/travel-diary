import { fireEvent, render, userEvent, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import AIMemoryScreen from '../[id]';
import { trips } from '@/mock/trips';
import { AIMemoryDraft } from '@/services/types';

const generatedDraft: AIMemoryDraft = {
  tripId: 'hangzhou-3-days',
  title: '在杭州，把时间走慢',
  content: '这是一段重试后生成的旅行回忆草稿，可以继续编辑后保存。',
  summary: '3 天，1 座城市，7 个景点，36 张照片。',
  shareText: '杭州 3 日游生成了一段新的旅行回忆。',
  style: '自然日记',
  photoUrls: trips[0].photoUrls,
  spotIds: trips[0].spotIds,
};

const generateAIMemoryDraft = jest.fn();
const saveAIMemory = jest.fn();
const mockState = {
  aiMemories: [],
  errorMessage: undefined as string | undefined,
  generateAIMemoryDraft,
  saveAIMemory,
  trips,
};

jest.mock('@/store/travelStore', () => {
  const useTravelStore = (selector: (state: typeof mockState) => unknown) => selector(mockState);
  useTravelStore.getState = () => mockState;

  return {
    useTravelStore,
  };
});

describe('AIMemoryScreen generation retry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState.errorMessage = undefined;
    jest.mocked(useLocalSearchParams).mockReturnValue({ id: 'hangzhou-3-days' });
  });

  it('preserves input and allows retry after generation failure', async () => {
    generateAIMemoryDraft.mockImplementationOnce(async () => {
      mockState.errorMessage = '后端 AI 生成失败，请稍后重试。';
      return undefined;
    });
    generateAIMemoryDraft.mockResolvedValueOnce(generatedDraft);

    const { getAllByText, getByDisplayValue, getByPlaceholderText, getByText } = await render(<AIMemoryScreen />);
    const user = userEvent.setup();

    fireEvent.changeText(getByPlaceholderText('比如：想突出断桥边的风、和朋友散步的轻松感。'), '突出轻松散步。');
    await user.press(getAllByText('生成 AI 回忆').at(-1)!);

    await waitFor(() => {
      expect(getByText('生成失败，可重试')).toBeTruthy();
    });
    expect(getByDisplayValue('突出轻松散步。')).toBeTruthy();

    await user.press(getAllByText('生成 AI 回忆').at(-1)!);

    await waitFor(() => {
      expect(getByDisplayValue('在杭州，把时间走慢')).toBeTruthy();
    });
    expect(generateAIMemoryDraft).toHaveBeenCalledTimes(2);
  });
});
