import { ReactNode } from 'react';
import { Pressable, PressableProps, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from './AppText';
import { theme } from '@/theme/theme';

type AppButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({ label, variant = 'primary', icon, fullWidth, style, ...props }: AppButtonProps) {
  const content = (
    <View style={styles.content}>
      {icon}
      <AppText
        variant="caption"
        color={variant === 'primary' ? theme.colors.mapDarkAlt : theme.colors.text}
        style={styles.label}
      >
        {label}
      </AppText>
    </View>
  );

  return (
    <Pressable style={[styles.pressable, fullWidth && styles.fullWidth, style]} {...props}>
      {variant === 'primary' ? (
        <LinearGradient colors={[theme.colors.mint, theme.colors.purple]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primary}>
          {content}
        </LinearGradient>
      ) : (
        <View style={[styles.flat, variant === 'secondary' ? styles.secondary : styles.ghost]}>{content}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: theme.radius.md,
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    minHeight: theme.components.buttonHeight,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    ...theme.shadow.glow,
  },
  flat: {
    minHeight: theme.components.buttonHeight,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
  },
  secondary: {
    backgroundColor: 'rgba(183,156,255,0.16)',
    borderColor: 'rgba(183,156,255,0.24)',
  },
  ghost: {
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderColor: 'rgba(111,103,165,0.1)',
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
  },
  label: {
    fontWeight: '900',
  },
});
