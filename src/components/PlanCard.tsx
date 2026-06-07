import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { TravelPlan } from '@/types/plan';
import { AppText } from './AppText';
import { ProgressBar } from './ProgressBar';
import { StatusChip } from './StatusChip';
import { theme } from '@/theme/theme';
import { getProgressPercent } from '@/utils/travelStats';

type PlanCardProps = {
  plan: TravelPlan;
};

export function PlanCard({ plan }: PlanCardProps) {
  return (
    <Pressable onPress={() => router.push(`/plan/${plan.id}`)}>
      <ImageBackground source={{ uri: plan.coverUrl }} style={styles.cover} imageStyle={styles.image}>
        <View style={styles.overlay} />
        <View style={styles.content}>
          <StatusChip label="Next Mission" />
          <View>
            <AppText variant="h2" color={theme.colors.white}>
              {plan.title}
            </AppText>
            <AppText variant="caption" color="#D8D4F4">
              {plan.days} 天 · {plan.total} 个待点亮地点 · 进度 {plan.progress} / {plan.total}
            </AppText>
          </View>
          <ProgressBar value={getProgressPercent(plan.progress, plan.total)} />
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cover: {
    borderRadius: theme.radius.xl,
    height: 190,
    overflow: 'hidden',
  },
  image: {
    borderRadius: theme.radius.xl,
  },
  overlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'rgba(27,31,58,0.34)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
});
