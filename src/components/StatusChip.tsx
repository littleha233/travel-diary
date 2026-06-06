import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { theme } from '@/theme/theme';

type StatusChipProps = {
  label: string;
  tone?: 'mint' | 'purple' | 'gold' | 'gray';
};

export function StatusChip({ label, tone = 'mint' }: StatusChipProps) {
  return (
    <View style={[styles.base, styles[tone]]}>
      <AppText variant="caption" color={tone === 'gray' ? theme.colors.muted : theme.colors.text}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 5,
  },
  mint: {
    backgroundColor: 'rgba(120,230,214,0.18)',
  },
  purple: {
    backgroundColor: 'rgba(183,156,255,0.18)',
  },
  gold: {
    backgroundColor: 'rgba(255,214,110,0.24)',
  },
  gray: {
    backgroundColor: 'rgba(142,148,184,0.14)',
  },
});
