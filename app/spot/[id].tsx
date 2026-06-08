import { router, useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { Heart, MapPin, Sparkles } from 'lucide-react-native';
import {
  AppButton,
  AppCard,
  AppText,
  DetailHeader,
  ErrorState,
  PhotoGrid,
  Screen,
  SectionHeader,
  StatusChip,
} from '@/components';
import { useTravelStore } from '@/store/travelStore';
import { theme } from '@/theme/theme';

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cities, spots, trips, toggleWishlistSpot } = useTravelStore(
    useShallow((state) => ({
      cities: state.cities,
      spots: state.spots,
      trips: state.trips,
      toggleWishlistSpot: state.toggleWishlistSpot,
    }))
  );
  const spot = spots.find((item) => item.id === id);

  if (!spot) {
    return (
      <Screen>
        <DetailHeader title="景点详情" />
        <ErrorState title="没有找到这个景点" />
      </Screen>
    );
  }

  const city = cities.find((item) => item.id === spot.cityId);
  const isLit = spot.status === 'lit';
  const primaryTrip = trips.find((trip) => trip.spotIds.includes(spot.id)) ?? trips[0];
  const tripPhotos = primaryTrip?.photoUrls.slice(0, 3) ?? [];

  return (
    <Screen>
      <DetailHeader title={spot.name} subtitle={`${city?.name ?? '城市'} · 景点详情`} />
      <Image source={{ uri: spot.coverUrl }} style={styles.cover} />
      <AppCard style={styles.card}>
        <View style={styles.row}>
          <View style={styles.title}>
            <AppText variant="h2">{spot.name}</AppText>
            <AppText variant="caption">
              {spot.distance} · 打卡半径 {spot.radius}m
            </AppText>
          </View>
          <StatusChip label={isLit ? '已点亮' : spot.canCheckIn ? '可点亮' : '想去'} tone={isLit ? 'gray' : 'mint'} />
        </View>
        <AppText variant="body">{spot.description}</AppText>
        <View style={styles.actions}>
          <AppButton
            label={isLit ? (primaryTrip ? '查看旅行记录' : '暂无旅行记录') : '去打卡页点亮'}
            icon={
              isLit ? (
                <Sparkles size={18} color={theme.colors.mapDarkAlt} />
              ) : (
                <MapPin size={18} color={theme.colors.mapDarkAlt} />
              )
            }
            onPress={() => {
              if (isLit && primaryTrip) {
                router.push(`/trip/${primaryTrip.id}`);
                return;
              }
              router.push('/tabs/checkin');
            }}
            disabled={isLit && !primaryTrip}
          />
          {!isLit ? (
            <AppButton
              label={spot.status === 'wishlist' ? '移出心愿' : '加入心愿'}
              variant="secondary"
              icon={<Heart size={17} color={theme.colors.text} />}
              onPress={() => toggleWishlistSpot(spot.id)}
            />
          ) : null}
        </View>
      </AppCard>
      <SectionHeader title="用户照片" />
      {isLit && tripPhotos.length ? (
        <PhotoGrid photos={tripPhotos} />
      ) : (
        <AppCard>
          <AppText variant="body">{isLit ? '这次旅行暂无照片。' : '点亮后可以在这里看到你的旅行照片。'}</AppText>
        </AppCard>
      )}
      <SectionHeader title="相关主题" />
      <AppCard>
        <AppText variant="h3">{spot.questIds.includes('west-lake-ten') ? '西湖十景' : '暂无主题任务'}</AppText>
        <AppText variant="caption">后续会根据景点自动同步主题任务进度。</AppText>
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cover: {
    borderRadius: theme.radius.xl,
    height: 220,
    marginBottom: theme.spacing.md,
    width: '100%',
  },
  card: {
    gap: theme.spacing.lg,
  },
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
});
