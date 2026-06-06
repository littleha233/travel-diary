import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { BookOpen, Sparkles } from 'lucide-react-native';
import { AppButton, AppCard, AppText, DetailHeader, EmptyState, ErrorState, PhotoGrid, Screen, SectionHeader, SpotCard, StatusChip } from '@/components';
import { useTravelStore } from '@/store/travelStore';
import { theme } from '@/theme/theme';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { aiMemories, checkIns, trips, spots } = useTravelStore(useShallow((state) => ({
    aiMemories: state.aiMemories,
    checkIns: state.checkIns,
    trips: state.trips,
    spots: state.spots,
  })));
  const trip = trips.find((item) => item.id === id);

  if (!trip) {
    return (
      <Screen>
        <DetailHeader title="旅行详情" />
        <ErrorState title="没有找到这次旅行" />
      </Screen>
    );
  }

  const tripSpots = spots.filter((spot) => trip.spotIds.includes(spot.id));
  const tripCheckIns = checkIns.filter((checkIn) => checkIn.tripId === trip.id);
  const latestMemory = aiMemories.find((memory) => memory.id === trip.aiMemoryId) ?? aiMemories.find((memory) => memory.tripId === trip.id);

  return (
    <Screen>
      <DetailHeader title={trip.title} subtitle={`${trip.startDate} - ${trip.endDate}`} />
      <AppCard style={styles.hero}>
        <StatusChip label="旅行记录" />
        <AppText variant="title">{trip.title}</AppText>
        <AppText variant="body">{trip.summary}</AppText>
        <View style={styles.stats}>
          <Stat value={`${trip.days}`} label="天" />
          <Stat value={`${trip.cityIds.length}`} label="城市" />
          <Stat value={`${trip.spotIds.length}`} label="景点" />
          <Stat value={`${trip.photoCount ?? trip.photoUrls.length}`} label="照片" />
        </View>
      </AppCard>
      <SectionHeader title="已打卡景点" />
      {tripSpots.length ? (
        <View style={styles.list}>
          {tripSpots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} />
          ))}
        </View>
      ) : (
        <EmptyState title="暂无打卡景点" message="完成一次点亮后，这里会出现新的旅行记录。" />
      )}
      <SectionHeader title="本地打卡记录" />
      <View style={styles.list}>
        {tripCheckIns.map((checkIn) => {
          const spot = spots.find((item) => item.id === checkIn.spotId);
          return (
            <AppCard key={checkIn.id} style={styles.checkIn}>
              <StatusChip label={checkIn.type === 'mock-gps' ? 'Mock GPS' : '手动补卡'} />
              <View style={styles.memoryText}>
                <AppText variant="h3">{spot?.name ?? '未知景点'}</AppText>
                <AppText variant="caption">{new Date(checkIn.createdAt).toLocaleString()} · {checkIn.moodText}</AppText>
              </View>
            </AppCard>
          );
        })}
      </View>
      <SectionHeader title="照片墙" />
      <PhotoGrid photos={trip.photoUrls} />
      <SectionHeader title="AI 回忆" />
      <AppCard style={styles.memory}>
        <BookOpen size={26} color={theme.colors.purple} />
        <View style={styles.memoryText}>
          <AppText variant="h3">{latestMemory?.title ?? '生成一篇新的旅行回忆'}</AppText>
          <AppText variant="caption">{latestMemory ? `已生成 · ${latestMemory.style}` : '尚未生成本地 AI 回忆'}</AppText>
        </View>
        <AppButton
          label={latestMemory ? '查看' : '生成'}
          icon={<Sparkles size={16} color={theme.colors.mapDarkAlt} />}
          onPress={() => router.push(`/ai-memory/${latestMemory?.id ?? trip.id}`)}
        />
      </AppCard>
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
  hero: {
    gap: theme.spacing.md,
  },
  stats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  stat: {
    flex: 1,
  },
  list: {
    gap: theme.spacing.md,
  },
  memory: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  memoryText: {
    flex: 1,
  },
  checkIn: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
});
