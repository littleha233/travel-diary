import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { theme } from '@/theme/theme';

type AppCardProps = PropsWithChildren<ViewProps> & {
  variant?: 'light' | 'dark' | 'warm';
};

export function AppCard({ children, style, variant = 'light', ...props }: AppCardProps) {
  return (
    <View style={[styles.base, styles[variant], style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...theme.shadow.soft,
  },
  light: {
    backgroundColor: theme.colors.card,
    borderColor: 'rgba(255,255,255,0.84)',
  },
  warm: {
    backgroundColor: theme.colors.surfaceWarm,
    borderColor: 'rgba(183,156,255,0.14)',
  },
  dark: {
    backgroundColor: theme.colors.darkGlass,
    borderColor: 'rgba(255,255,255,0.16)',
  },
});
