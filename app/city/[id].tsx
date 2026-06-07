import { useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import {
  AppCard,
  AppText,
  DetailHeader,
  ErrorState,
  MapPreview,
  Screen,
  SectionHeader,
  SpotCard,
  StatusChip,
  ThemeQuestCard,
} from '@/components';
import { useTravelStore } from '@/store/travelStore';
import { theme } from '@/theme/theme';

export default function CityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cities, spots, quests, trips } = useTravelStore(
    useShallow((state) => ({
      cities: state.cities,
      spots: state.spots,
      quests: state.quests,
      trips: state.trips,
    }))
  );
  const city = cities.find((item) => item.id === id);

  if (!city) {
    return (
      <Screen>
        <DetailHeader title="城市详情" />
        <ErrorState title="没有找到这座城市" />
      </Screen>
    );
  }

  const citySpots = spots.filter((spot) => spot.cityId === city.id);
  const relatedQuests = quests.filter((quest) => quest.cityIds.includes(city.id));
  const litCount = citySpots.filter((spot) => spot.status === 'lit').length;
  const cityPhotoCount = trips
    .filter((trip) => trip.cityIds.includes(city.id))
    .reduce((total, trip) => total + (trip.photoCount ?? trip.photoUrls.length), 0);

  return (
    <Screen>
      <DetailHeader title={city.name} subtitle={`${city.province} · 城市详情`} />
      <Image source={{ uri: city.coverUrl }} style={styles.cover} />
      <AppCard style={styles.summary}>
        <View style={styles.row}>
          <View>
            <AppText variant="h2">{city.name}</AppText>
            <AppText variant="caption">{city.description}</AppText>
          </View>
          <StatusChip label={city.lit ? '已点亮' : '点亮城市'} tone={city.lit ? 'mint' : 'gray'} />
        </View>
        <View style={styles.stats}>
          <Stat value={`${litCount}/${citySpots.length || city.spotIds.length}`} label="景点进度" />
          <Stat value={city.visitedAt ? '1' : '0'} label="旅行次数" />
          <Stat value={`${cityPhotoCount}`} label="照片" />
        </View>
      </AppCard>
      <SectionHeader title="城市点位地图" />
      <MapPreview
        cities={cities}
        spots={spots}
        quests={quests}
        focusCityId={city.id}
        initialLayer="spot"
        litCityCount={cities.filter((item) => item.lit).length}
        provinceCount={new Set(cities.filter((item) => item.lit).map((item) => item.province)).size}
        exploredSpotCount={spots.filter((item) => item.status === 'lit').length}
      />
      <SectionHeader title="景点列表" action="全部" />
      <View style={styles.list}>
        {citySpots.map((spot) => (
          <SpotCard key={spot.id} spot={spot} />
        ))}
      </View>
      {relatedQuests.length ? (
        <>
          <SectionHeader title="相关主题任务" />
          <View style={styles.list}>
            {relatedQuests.map((quest) => (
              <ThemeQuestCard key={quest.id} quest={quest} />
            ))}
          </View>
        </>
      ) : null}
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <AppText variant="h2">{value}</AppText>
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    borderRadius: theme.radius.xl,
    height: 210,
    marginBottom: theme.spacing.md,
    width: '100%',
  },
  summary: {
    gap: theme.spacing.lg,
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  stats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  stat: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  list: {
    gap: theme.spacing.md,
  },
});
