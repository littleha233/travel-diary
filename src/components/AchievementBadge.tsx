import { StyleSheet, View } from 'react-native';
import { Award } from 'lucide-react-native';
import { Achievement } from '@/types/achievement';
import { AppText } from './AppText';
import { theme } from '@/theme/theme';

type AchievementBadgeProps = {
  achievement: Achievement;
};

const toneColor = {
  mint: theme.colors.mint,
  purple: theme.colors.purple,
  gold: theme.colors.gold,
  blue: theme.colors.blue,
};

export function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const color = toneColor[achievement.tone];

  return (
    <View style={[styles.card, !achievement.unlocked && styles.locked]}>
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Award size={24} color={theme.colors.mapDarkAlt} />
      </View>
      <AppText variant="caption" style={styles.title}>{achievement.title}</AppText>
      <AppText variant="caption" style={styles.desc}>{achievement.unlocked ? '已解锁' : achievement.description}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderColor: 'rgba(255,255,255,0.78)',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flex: 1,
    gap: theme.spacing.sm,
    minWidth: '30%',
    padding: theme.spacing.md,
    ...theme.shadow.soft,
  },
  locked: {
    opacity: 0.45,
  },
  badge: {
    alignItems: 'center',
    borderRadius: theme.radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  title: {
    color: theme.colors.text,
    textAlign: 'center',
  },
  desc: {
    textAlign: 'center',
  },
});
