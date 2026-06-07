import { useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import {
  AchievementBadge,
  AppCard,
  AppText,
  DetailHeader,
  ErrorState,
  ProgressBar,
  Screen,
  SectionHeader,
  SpotCard,
  StatusChip,
} from '@/components';
import { useTravelStore } from '@/store/travelStore';
import { getProgressPercent } from '@/utils/travelStats';
import { theme } from '@/theme/theme';

export default function QuestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { achievements, quests, spots } = useTravelStore(
    useShallow((state) => ({
      achievements: state.achievements,
      quests: state.quests,
      spots: state.spots,
    }))
  );
  const quest = quests.find((item) => item.id === id);

  if (!quest) {
    return (
      <Screen>
        <DetailHeader title="主题任务" />
        <ErrorState title="没有找到这个主题任务" />
      </Screen>
    );
  }

  const questSpots = spots.filter((spot) => quest.spotIds.includes(spot.id));
  const reward = achievements.find((achievement) => achievement.id === quest.rewardAchievementId) ?? achievements[0];

  return (
    <Screen>
      <DetailHeader title={quest.title} subtitle="主题任务详情" />
      <Image source={{ uri: quest.coverUrl }} style={styles.cover} />
      <AppCard style={styles.card}>
        <View style={styles.row}>
          <StatusChip label={quest.subtitle} tone="gold" />
          <AppText variant="caption">{getProgressPercent(quest.progress, quest.total)}%</AppText>
        </View>
        <AppText variant="body">{quest.description}</AppText>
        <ProgressBar value={getProgressPercent(quest.progress, quest.total)} />
      </AppCard>
      <SectionHeader title="奖励徽章" />
      <View style={styles.badgeWrap}>
        <AchievementBadge achievement={reward} />
      </View>
      <SectionHeader title="任务地点" />
      <View style={styles.list}>
        {questSpots.length ? (
          questSpots.map((spot) => <SpotCard key={spot.id} spot={spot} />)
        ) : (
          <AppCard>
            <AppText variant="body">地点列表将在后续版本接入更多城市数据。</AppText>
          </AppCard>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cover: {
    borderRadius: theme.radius.xl,
    height: 210,
    marginBottom: theme.spacing.md,
    width: '100%',
  },
  card: {
    gap: theme.spacing.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badgeWrap: {
    flexDirection: 'row',
  },
  list: {
    gap: theme.spacing.md,
  },
});
