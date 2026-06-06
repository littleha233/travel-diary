import { router } from 'expo-router';
import { Heart, MapPinned } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { AppCard, AppText, PlanCard, Screen, SectionHeader, StatusChip, ThemeQuestCard } from '@/components';
import { cities, plans, quests } from '@/mock';
import { theme } from '@/theme/theme';

export default function PlanScreen() {
  const plan = plans[0];
  const wishlist = cities.filter((city) => plan.wishlistCityIds.includes(city.id));

  return (
    <Screen dark>
      <View style={styles.top}>
        <View>
          <AppText variant="title" color={theme.colors.white}>旅行计划</AppText>
          <AppText variant="caption" color="#C7C4EA">Next Mission · 规划下一次点亮</AppText>
        </View>
        <StatusChip label="＋ 新计划" tone="purple" />
      </View>
      <PlanCard plan={plan} />
      <SectionHeader title="心愿地图" action="管理" dark />
      <AppCard variant="dark" style={styles.wishlist}>
        <MapPinned size={26} color={theme.colors.mint} />
        <View style={styles.wishlistText}>
          <AppText variant="h3" color={theme.colors.white}>Wishlist Map</AppText>
          <AppText variant="caption" color="#C7C4EA">{wishlist.map((city) => city.name).join(' · ')} · 中国五岳</AppText>
        </View>
        <Heart size={22} color={theme.colors.gold} />
      </AppCard>
      <SectionHeader title="主题探索" action="全部" dark />
      <View style={styles.list}>
        {quests.map((quest) => (
          <ThemeQuestCard key={quest.id} quest={quest} />
        ))}
      </View>
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
