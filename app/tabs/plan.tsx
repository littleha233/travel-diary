import { router } from 'expo-router';
import { Heart, MapPinned, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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
  const { status, errorMessage, cities, plans, quests, createWeekendPlan, retry, toggleWishlistCity } = useTravelStore(
    useShallow((state) => ({
      status: state.status,
      errorMessage: state.errorMessage,
      cities: state.cities,
      plans: state.plans,
      quests: state.quests,
      createWeekendPlan: state.createWeekendPlan,
      retry: state.retry,
      toggleWishlistCity: state.toggleWishlistCity,
    }))
  );
  const [manageWishlist, setManageWishlist] = useState(false);
  const plan = plans[0];
  const wishlist = cities.filter((city) => city.wished || plan?.wishlistCityIds.includes(city.id));

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
        <AppButton label="＋ 新旅行" variant="secondary" onPress={() => router.push('/create-trip')} />
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
      <SectionHeader
        title="心愿地图"
        action={manageWishlist ? '完成' : '管理'}
        dark
        onAction={() => setManageWishlist((value) => !value)}
      />
      <AppCard variant="dark" style={styles.wishlist}>
        <MapPinned size={26} color={theme.colors.mint} />
        <View style={styles.wishlistText}>
          <AppText variant="h3" color={theme.colors.white}>
            Wishlist Map
          </AppText>
          <AppText variant="caption" color="#C7C4EA">
            {wishlist.length ? wishlist.map((city) => city.name).join(' · ') : '还没有心愿城市'}
          </AppText>
        </View>
        <Heart size={22} color={theme.colors.gold} />
      </AppCard>
      {manageWishlist ? (
        <View style={styles.wishlistList}>
          {cities.slice(0, 10).map((city) => (
            <Pressable key={city.id} style={styles.wishlistRow} onPress={() => toggleWishlistCity(city.id)}>
              <View style={styles.wishlistText}>
                <AppText variant="h3" color={theme.colors.white}>
                  {city.name}
                </AppText>
                <AppText variant="caption" color="#C7C4EA">
                  {city.province} · {city.wished ? '已加入心愿单' : '点击加入心愿单'}
                </AppText>
              </View>
              {city.wished ? <X size={18} color={theme.colors.gold} /> : <Heart size={18} color={theme.colors.mint} />}
            </Pressable>
          ))}
        </View>
      ) : null}
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
  wishlistList: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  wishlistRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  list: {
    gap: theme.spacing.md,
  },
});
