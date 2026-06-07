import { cloneInitialTravelData, mockTravelService, syncDerivedTravelData } from '@/services/mockTravelService';

describe('mockTravelService core state sync', () => {
  it('lights a spot and updates the owning city', async () => {
    const current = syncDerivedTravelData(cloneInitialTravelData());
    const chengduBefore = current.cities.find((city) => city.id === 'chengdu');

    expect(chengduBefore?.lit).toBe(false);

    const result = await mockTravelService.createCheckIn(
      'kuanzhai',
      {
        type: 'manual',
        moodText: '补记一次成都巷子散步。',
      },
      current
    );
    const chengduAfter = result.data.cities.find((city) => city.id === 'chengdu');
    const spotAfter = result.data.spots.find((spot) => spot.id === 'kuanzhai');

    expect(chengduAfter?.lit).toBe(true);
    expect(chengduAfter?.spotIds).toContain('kuanzhai');
    expect(spotAfter?.status).toBe('lit');
    expect(result.checkIn?.type).toBe('manual');
  });

  it('recalculates theme quest progress after a successful check-in', async () => {
    const current = syncDerivedTravelData(cloneInitialTravelData());
    const questBefore = current.quests.find((quest) => quest.id === 'west-lake-ten');

    const result = await mockTravelService.createCheckIn(
      'broken-bridge',
      {
        type: 'gps',
        moodText: '断桥边的风很轻。',
      },
      current
    );
    const questAfter = result.data.quests.find((quest) => quest.id === 'west-lake-ten');
    const tripAfter = result.data.trips.find((trip) => trip.id === 'hangzhou-3-days');

    expect(questAfter?.progress).toBe((questBefore?.progress ?? 0) + 1);
    expect(questAfter?.subtitle).toContain(`${questAfter?.progress} / ${questAfter?.total}`);
    expect(tripAfter?.spotIds).toContain('broken-bridge');
    expect(result.data.user.exploredSpotCount).toBeGreaterThan(current.user.exploredSpotCount);
  });
});
