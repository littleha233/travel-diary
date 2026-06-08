import { useLocalSearchParams } from 'expo-router';
import { Share, StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { AppButton, AppCard, AppText, DetailHeader, ErrorState, PhotoGrid, Screen, StatusChip } from '@/components';
import { useTravelStore } from '@/store/travelStore';
import { theme } from '@/theme/theme';

export default function ShareCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { achievements, trips, user } = useTravelStore(
    useShallow((state) => ({
      achievements: state.achievements,
      trips: state.trips,
      user: state.user,
    }))
  );
  const trip = trips.find((item) => item.id === id);
  const achievement = achievements.find((item) => item.id === id || `achievement-${item.id}` === id);
  const title = trip?.title ?? achievement?.title;
  const subtitle = trip?.summary ?? achievement?.description;
  const shareText = trip
    ? `${user.nickname} 的旅行卡片：${trip.title}，${trip.summary}`
    : `${user.nickname} 解锁旅行成就：${achievement?.title ?? '旅行成就'}`;

  if (!trip && !achievement) {
    return (
      <Screen>
        <DetailHeader title="分享卡片" />
        <ErrorState title="没有找到可分享内容" />
      </Screen>
    );
  }

  return (
    <Screen>
      <DetailHeader title="分享卡片" subtitle="预览并调用系统分享" />
      <AppCard style={styles.card}>
        <StatusChip label={trip ? '旅行卡片' : '成就卡片'} tone="gold" />
        <View style={styles.header}>
          <AppText variant="title">{title}</AppText>
          <AppText variant="body">{subtitle}</AppText>
        </View>
        {trip ? <PhotoGrid photos={trip.photoUrls.slice(0, 3)} /> : null}
        <View style={styles.stats}>
          <Stat value={`${user.litCityCount}`} label="城市" />
          <Stat value={`${user.exploredSpotCount}`} label="景点" />
          <Stat value={`${user.achievementCount}`} label="徽章" />
        </View>
        <AppText variant="caption">TravelAround · {user.nickname}</AppText>
      </AppCard>
      <AppButton label="系统分享" fullWidth onPress={() => Share.share({ message: shareText })} />
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
  card: {
    gap: theme.spacing.lg,
  },
  header: {
    gap: theme.spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  stat: {
    flex: 1,
    gap: theme.spacing.xs,
  },
});
