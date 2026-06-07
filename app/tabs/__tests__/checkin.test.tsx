import { act } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as Location from 'expo-location';
import CheckInScreen from '../checkin';
import { cities, spots } from '@/mock';

const lightUpSpot = jest.fn();
const retry = jest.fn();
const mockState = {
  status: 'ready',
  errorMessage: undefined,
  cities,
  spots,
  lightUpSpot,
  retry,
};

jest.mock('@/store/travelStore', () => ({
  useTravelStore: (selector: (state: typeof mockState) => unknown) => selector(mockState),
}));

describe('CheckInScreen permission fallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(Location.requestForegroundPermissionsAsync).mockResolvedValue({
      canAskAgain: true,
      expires: 'never',
      granted: false,
      status: Location.PermissionStatus.DENIED,
    });
  });

  it('keeps manual check-in available after location permission is denied', async () => {
    const { getAllByText, getByText } = await render(<CheckInScreen />);

    await act(async () => {
      fireEvent.press(getAllByText('开始定位')[0]);
    });

    await waitFor(() => {
      expect(getByText('定位权限已拒绝，可以再次尝试或手动补卡。')).toBeTruthy();
    });
    expect(getByText('手动补卡')).toBeTruthy();
    expect(getAllByText('补卡').length).toBeGreaterThan(0);
  });
});
