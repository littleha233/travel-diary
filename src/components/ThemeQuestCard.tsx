import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ThemeQuest } from '@/types/quest';
import { AppText } from './AppText';
import { ProgressBar } from './ProgressBar';
import { StatusChip } from './StatusChip';
import { getProgressPercent } from '@/utils/travelStats';
import { theme } from '@/theme/theme';

type ThemeQuestCardProps = {
  quest: ThemeQuest;
};

export function ThemeQuestCard({ quest }: ThemeQuestCardProps) {
  return (
    <Pressable style={styles.card} onPress={() => router.push(`/quest/${quest.id}`)}>
      <View style={styles.ring}>
        <AppText variant="caption" color={theme.colors.white}>
          {quest.progress}/{quest.total}
        </AppText>
      </View>
      <View style={styles.body}>
        <AppText variant="h3">{quest.title}</AppText>
        <AppText variant="caption">{quest.subtitle}</AppText>
        <ProgressBar value={getProgressPercent(quest.progress, quest.total)} />
      </View>
      <StatusChip label={quest.progress ? '继续' : '加入'} tone={quest.progress ? 'gold' : 'mint'} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderColor: 'rgba(255,255,255,0.78)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    ...theme.shadow.soft,
  },
  ring: {
    alignItems: 'center',
    backgroundColor: theme.colors.purple,
    borderRadius: 999,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  body: {
    flex: 1,
    gap: theme.spacing.sm,
  },
});
