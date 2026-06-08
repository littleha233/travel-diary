import { router } from 'expo-router';
import { Bell, CalendarPlus, Compass, Map, MapPin, Sparkles } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import {
  AppButton,
  AppCard,
  AppText,
  EmptyState,
  ErrorState,
  LoadingState,
  MapPreview,
  Screen,
  SectionHeader,
  SpotCard,
  StatusChip,
} from '@/components';
import { useTravelStore } from '@/store/travelStore';
import { theme } from '@/theme/theme';

export default function HomeScreen() {
  const { status, errorMessage, cities, spots, quests, trips, user, retry } = useTravelStore(
    useShallow((state) => ({
      status: state.status,
      errorMessage: state.errorMessage,
      cities: state.cities,
      spots: state.spots,
      quests: state.quests,
      trips: state.trips,
      user: state.user,
      retry: state.retry,
    }))
  );
  const latestTrip = trips[0];
  const recommendedSpots = spots.filter((spot) => spot.status !== 'lit').slice(0, 3);
  const activeQuest = quests.find((quest) => quest.progress < quest.total) ?? quests[0];

  if (status === 'loading') {
    return (
      <Screen dark>
        <LoadingState label="正在恢复首页数据..." />
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
            首页
          </AppText>
          <AppText variant="caption" color="#C7C4EA">
            今日旅行概览与下一步行动
          </AppText>
        </View>
        <Pressable style={styles.iconButton} onPress={() => router.push('/achievements')}>
          <Bell size={22} color={theme.colors.white} />
        </Pressable>
      </View>

      <View style={styles.stats}>
        <DashboardStat value={`${user.litCityCount}`} label="点亮城市" />
        <DashboardStat value={`${user.exploredSpotCount}`} label="景点" />
        <DashboardStat value={`${user.provinceCount}`} label="省份" />
        <DashboardStat value={`${user.tripCount}`} label="旅行" />
      </View>

      <SectionHeader title="最近旅行" action="新建" dark onAction={() => router.push('/create-trip')} />
      {latestTrip ? (
        <AppCard variant="dark" style={styles.tripCard}>
          <StatusChip label="最近记录" tone="gold" />
          <View style={styles.tripText}>
            <AppText variant="h2" color={theme.colors.white}>
              {latestTrip.title}
            </AppText>
            <AppText variant="caption" color="#C7C4EA">
              {latestTrip.startDate} - {latestTrip.endDate} · {latestTrip.summary}
            </AppText>
          </View>
          <AppButton label="查看" variant="secondary" onPress={() => router.push(`/trip/${latestTrip.id}`)} />
        </AppCard>
      ) : (
        <EmptyState
          title="还没有旅行记录"
          message="创建第一段旅行后，打卡会关联到对应行程。"
          action="创建旅行"
          onAction={() => router.push('/create-trip')}
        />
      )}

      <SectionHeader title="地图摘要" action="打开地图" dark onAction={() => router.push('/tabs/map')} />
      <MapPreview
        compact
        cities={cities}
        spots={spots}
        quests={quests}
        litCityCount={user.litCityCount}
        provinceCount={user.provinceCount}
        exploredSpotCount={user.exploredSpotCount}
      />

      <SectionHeader title="推荐任务" action="计划" dark onAction={() => router.push('/tabs/plan')} />
      <AppCard variant="dark" style={styles.questCard}>
        <Sparkles size={24} color={theme.colors.mint} />
        <View style={styles.tripText}>
          <AppText variant="h3" color={theme.colors.white}>
            {activeQuest?.title ?? '继续点亮附近地点'}
          </AppText>
          <AppText variant="caption" color="#C7C4EA">
            {activeQuest?.subtitle ?? '从一个未点亮景点开始，完善你的旅行地图。'}
          </AppText>
        </View>
      </AppCard>

      <View style={styles.quickGrid}>
        <QuickAction
          label="创建旅行"
          icon={<CalendarPlus size={20} color={theme.colors.mapDarkAlt} />}
          href="/create-trip"
        />
        <QuickAction label="去打卡" icon={<MapPin size={20} color={theme.colors.mapDarkAlt} />} href="/tabs/checkin" />
        <QuickAction label="旅行计划" icon={<Compass size={20} color={theme.colors.mapDarkAlt} />} href="/tabs/plan" />
        <QuickAction label="地图搜索" icon={<Map size={20} color={theme.colors.mapDarkAlt} />} href="/tabs/map" />
      </View>

      <SectionHeader title="可继续点亮" dark />
      <View style={styles.list}>
        {recommendedSpots.map((spot) => (
          <SpotCard key={spot.id} spot={spot} />
        ))}
      </View>
    </Screen>
  );
}

function DashboardStat({ value, label }: { value: string; label: string }) {
  return (
    <AppCard variant="dark" style={styles.stat}>
      <AppText variant="h2" color={theme.colors.white}>
        {value}
      </AppText>
      <AppText variant="caption" color="#C7C4EA">
        {label}
      </AppText>
    </AppCard>
  );
}

function QuickAction({ label, icon, href }: { label: string; icon: React.ReactNode; href: string }) {
  return (
    <Pressable style={styles.quickAction} onPress={() => router.push(href)}>
      <View style={styles.quickIcon}>{icon}</View>
      <AppText variant="caption" color={theme.colors.white}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  stat: {
    flexBasis: '22%',
    flexGrow: 1,
    gap: theme.spacing.xs,
  },
  tripCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  tripText: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  questCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  quickAction: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  quickIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.mint,
    borderRadius: theme.radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  list: {
    gap: theme.spacing.md,
  },
});
