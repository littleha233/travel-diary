import { Text, TextProps, StyleSheet } from 'react-native';
import { theme } from '@/theme/theme';

type AppTextProps = TextProps & {
  variant?: 'title' | 'h2' | 'h3' | 'body' | 'caption';
  color?: string;
};

export function AppText({ variant = 'body', color, style, children, ...props }: AppTextProps) {
  return (
    <Text style={[styles[variant], color ? { color } : null, style]} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  h2: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  h3: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textSoft,
  },
  caption: {
    ...theme.typography.caption,
    color: theme.colors.muted,
  },
});
