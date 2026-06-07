import { render } from '@testing-library/react-native';
import { MapPreview } from '@/components/MapPreview';
import { cities, quests, spots } from '@/mock';

describe('MapPreview', () => {
  it('renders a compact city map snapshot', async () => {
    const { toJSON } = await render(<MapPreview compact cities={cities.slice(0, 4)} spots={spots} quests={quests} />);

    expect(toJSON()).toMatchSnapshot();
  });

  it('renders the spot layer with nearby POI information', async () => {
    const { getAllByText, getByText } = await render(
      <MapPreview cities={cities} spots={spots} quests={quests} focusCityId="hangzhou" initialLayer="spot" />
    );

    expect(getByText('杭州景点点位')).toBeTruthy();
    expect(getAllByText('西湖').length).toBeGreaterThan(0);
    expect(getAllByText('断桥残雪').length).toBeGreaterThan(0);
  });
});
