import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { BookOpen, Sparkles } from 'lucide-react-native';
import { AppButton, AppCard, AppText, DetailHeader, ErrorState, PhotoGrid, Screen, SectionHeader, SpotCard, StatusChip } from '@/components';
import { trips, spots } from '@/mock';
import { theme } from '@/theme/theme';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
          <Stat value="36" label="照片" />
        </View>
      </AppCard>
      <SectionHeader title="已打卡景点" />
      <View style={styles.list}>
        {tripSpots.map((spot) => (
          <SpotCard key={spot.id} spot={spot} />
        ))}
      </View>
      <SectionHeader title="照片墙" />
      <PhotoGrid photos={trip.photoUrls} />
      <SectionHeader title="AI 回忆" />
      <AppCard style={styles.memory}>
        <BookOpen size={26} color={theme.colors.purple} />
        <View style={styles.memoryText}>
          <AppText variant="h3">在杭州，把时间走慢</AppText>
          <AppText variant="caption">已生成 · 自然日记风格</AppText>
        </View>
        <AppButton
          label="查看"
          icon={<Sparkles size={16} color={theme.colors.mapDarkAlt} />}
          onPress={() => router.push(`/ai-memory/${trip.aiMemoryId}`)}
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
});
