import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { AppButton, AppCard, AppText, DetailHeader, ErrorState, PhotoGrid, Screen, SectionHeader, StatusChip } from '@/components';
import { useTravelStore } from '@/store/travelStore';
import { theme } from '@/theme/theme';

export default function AIMemoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { aiMemories, generateAIMemory, trips } = useTravelStore((state) => ({
    aiMemories: state.aiMemories,
    generateAIMemory: state.generateAIMemory,
    trips: state.trips,
  }));
  const trip = trips.find((item) => item.id === id);
  const memory = aiMemories.find((item) => item.id === id) ?? aiMemories.find((item) => item.tripId === trip?.id);

  if (!memory && !trip) {
    return (
      <Screen dark>
        <DetailHeader title="AI 回忆" dark />
        <ErrorState title="没有找到这段回忆" />
      </Screen>
    );
  }

  const activeTrip = trip ?? trips.find((item) => item.id === memory?.tripId);
  const photoUrls = memory?.photoUrls ?? activeTrip?.photoUrls ?? [];

  return (
    <Screen dark>
      <DetailHeader title="生成 AI 回忆" subtitle="AI Memory · 把旅途整理成故事" dark />
      <AppCard variant="dark" style={styles.card}>
        <AppText variant="h3" color={theme.colors.white}>{activeTrip?.title ?? '杭州周末探索'}</AppText>
        <View style={styles.chips}>
          {[`${activeTrip?.spotIds.length ?? 0} 个景点`, `${activeTrip ? activeTrip.photoCount ?? activeTrip.photoUrls.length : photoUrls.length} 张照片`, `${activeTrip?.days ?? 0} 天行程`, memory?.style ?? '自然日记'].map((label, index) => (
            <StatusChip key={label} label={label} tone={index === 0 ? 'mint' : 'gray'} />
          ))}
        </View>
        <PhotoGrid photos={photoUrls.slice(0, 3)} />
      </AppCard>
      <SectionHeader title="生成状态" dark />
      <AppCard variant="dark" style={styles.status}>
        <Sparkles size={30} color={theme.colors.mint} />
        <View>
          <AppText variant="h3" color={theme.colors.white}>{memory ? '已整理地点、照片和心情' : '等待生成本地 mock 回忆'}</AppText>
          <AppText variant="caption" color="#C7C4EA">{memory ? 'mock AI 已生成一段旅行回忆' : '点击下方按钮后，会基于当前旅行记录生成假日记'}</AppText>
        </View>
      </AppCard>
      <SectionHeader title="生成结果" action="重新生成" dark />
      <AppCard style={styles.paper}>
        <StatusChip label="玻璃纸张" />
        <AppText variant="h2">{memory?.title ?? '尚未生成'}</AppText>
        <AppText variant="body">{memory?.content ?? '点击“生成 mock AI 回忆”，TravelAround 会基于本地旅行记录、打卡景点和照片数量生成一篇假日记。'}</AppText>
        <AppText variant="caption">{memory?.summary ?? '本阶段不接真实 AI。'}</AppText>
      </AppCard>
      <View style={styles.actions}>
        <AppButton
          label={memory ? '重新生成 mock AI 回忆' : '生成 mock AI 回忆'}
          fullWidth
          onPress={() => {
            if (!activeTrip) {
              return;
            }
            const nextMemory = generateAIMemory(activeTrip.id);
            if (nextMemory) {
              router.replace(`/ai-memory/${nextMemory.id}`);
            }
          }}
        />
        <AppButton label="分享" variant="secondary" fullWidth />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  status: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  paper: {
    gap: theme.spacing.md,
  },
  actions: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
});
