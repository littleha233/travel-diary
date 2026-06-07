import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { AppButton, AppCard, AppText, DetailHeader, ErrorState, PlanCard, Screen, SectionHeader, SpotCard } from '@/components';
import { useTravelStore } from '@/store/travelStore';
import { theme } from '@/theme/theme';

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plans, spots } = useTravelStore(useShallow((state) => ({
    plans: state.plans,
    spots: state.spots,
  })));
  const plan = plans.find((item) => item.id === id);

  if (!plan) {
    return (
      <Screen dark>
        <DetailHeader title="旅行计划" dark />
        <ErrorState title="没有找到这个计划" />
      </Screen>
    );
  }

  const planSpots = spots.filter((spot) => plan.spotIds.includes(spot.id));

  return (
    <Screen dark>
      <DetailHeader title={plan.title} subtitle="旅行计划详情" dark />
      <PlanCard plan={plan} />
      <AppCard variant="dark" style={styles.card}>
        <AppText variant="h3" color={theme.colors.white}>计划摘要</AppText>
        <AppText variant="body" color="#D8D4F4">
          {plan.days} 天，围绕杭州西湖区安排 {plan.total} 个探索节点，当前已完成 {plan.progress} 个。
        </AppText>
        <AppButton label="继续计划" fullWidth />
      </AppCard>
      <SectionHeader title="待点亮景点" dark />
      <View style={styles.list}>
        {planSpots.map((spot) => (
          <SpotCard key={spot.id} spot={spot} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  list: {
    gap: theme.spacing.md,
  },
});
