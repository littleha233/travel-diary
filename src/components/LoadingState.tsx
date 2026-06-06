import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { theme } from '@/theme/theme';

export function LoadingState({ label = '正在加载旅行地图...' }: { label?: string }) {
  return (
    <View style={styles.state}>
      <ActivityIndicator color={theme.colors.mint} />
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  state: {
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
  },
});
