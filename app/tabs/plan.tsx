import { Heart, MapPinned } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import {
  AppButton,
  AppCard,
  AppText,
  EmptyState,
  ErrorState,
  LoadingState,
  PlanCard,
  Screen,
  SectionHeader,
  ThemeQuestCard,
} from '@/components';
import { useTravelStore } from '@/store/travelStore';
import { theme } from '@/theme/theme';

export default function PlanScreen() {
  const { status, errorMessage, cities, plans, quests, createWeekendPlan, retry } = useTravelStore(
    useShallow((state) => ({
      status: state.status,
      errorMessage: state.errorMessage,
      cities: state.cities,
      plans: state.plans,
      quests: state.quests,
      createWeekendPlan: state.createWeekendPlan,
      retry: state.retry,
    }))
  );
  const plan = plans[0];
  const wishlist = plan ? cities.filter((city) => plan.wishlistCityIds.includes(city.id)) : [];

  if (status === 'loading') {
    return (
      <Screen dark>
        <LoadingState label="正在恢复旅行计划..." />
      </Screen>
    );
  }

  if (status === 'error') {
    return (
      <Screen dark>
        <ErrorState message={errorMessage} onRetry={retry} />
      </Screen>
    );
  }

  return (
    <Screen dark>
      <View style={styles.top}>
        <View>
          <AppText variant="title" color={theme.colors.white}>
            旅行计划
          </AppText>
          <AppText variant="caption" color="#C7C4EA">
            Next Mission · 规划下一次点亮
          </AppText>
        </View>
        <AppButton label="＋ 新计划" variant="secondary" onPress={createWeekendPlan} />
      </View>
      {plan ? (
        <PlanCard plan={plan} />
      ) : (
        <EmptyState
          title="还没有旅行计划"
          message="创建一个周末探索计划，先把想去的地点收起来。"
          action="创建计划"
          onAction={createWeekendPlan}
        />
      )}
      <SectionHeader title="心愿地图" action="管理" dark />
      <AppCard variant="dark" style={styles.wishlist}>
        <MapPinned size={26} color={theme.colors.mint} />
        <View style={styles.wishlistText}>
          <AppText variant="h3" color={theme.colors.white}>
            Wishlist Map
          </AppText>
          <AppText variant="caption" color="#C7C4EA">
            {wishlist.map((city) => city.name).join(' · ')} · 中国五岳
          </AppText>
        </View>
        <Heart size={22} color={theme.colors.gold} />
      </AppCard>
      <SectionHeader title="主题探索" action="全部" dark />
      {quests.length ? (
        <View style={styles.list}>
          {quests.map((quest) => (
            <ThemeQuestCard key={quest.id} quest={quest} />
          ))}
        </View>
      ) : (
        <EmptyState title="暂无主题任务" message="后续会从本地 mock 数据恢复任务进度。" />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  wishlist: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  wishlistText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  list: {
    gap: theme.spacing.md,
  },
});
