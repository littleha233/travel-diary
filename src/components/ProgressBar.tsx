import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/theme/theme';

type ProgressBarProps = {
  value: number;
};

export function ProgressBar({ value }: ProgressBarProps) {
  return (
    <View style={styles.track}>
      <LinearGradient
        colors={[theme.colors.mint, theme.colors.purple]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.fill, { width: `${Math.min(100, Math.max(0, value))}%` }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: 'rgba(142,148,184,0.18)',
    borderRadius: theme.radius.pill,
    height: 8,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: theme.radius.pill,
    height: '100%',
  },
});
