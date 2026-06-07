import { StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { AchievementBadge, AppCard, AppText, DetailHeader, ProgressBar, Screen, SectionHeader } from '@/components';
import { useTravelStore } from '@/store/travelStore';
import { theme } from '@/theme/theme';
import { getProgressPercent } from '@/utils/travelStats';

export default function AchievementsScreen() {
  const { achievements, quests } = useTravelStore(
    useShallow((state) => ({
      achievements: state.achievements,
      quests: state.quests,
    }))
  );

  return (
    <Screen>
      <DetailHeader title="成就页" subtitle="徽章、主题任务、完成度" />
      <AppCard style={styles.hero}>
        <AppText variant="title">Lv.12 城市漫游者</AppText>
        <AppText variant="body">已解锁 14 枚徽章，下一枚高光成就是「西湖收集家」。</AppText>
      </AppCard>
      <SectionHeader title="徽章墙" />
      <View style={styles.grid}>
        {achievements.map((achievement) => (
          <AchievementBadge key={achievement.id} achievement={achievement} />
        ))}
      </View>
      <SectionHeader title="主题任务进度" />
      <View style={styles.list}>
        {quests.map((quest) => (
          <AppCard key={quest.id} style={styles.quest}>
            <AppText variant="h3">{quest.title}</AppText>
            <AppText variant="caption">{quest.subtitle}</AppText>
            <ProgressBar value={getProgressPercent(quest.progress, quest.total)} />
          </AppCard>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  list: {
    gap: theme.spacing.md,
  },
  quest: {
    gap: theme.spacing.sm,
  },
});
