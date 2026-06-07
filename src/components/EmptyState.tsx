import { StyleSheet, View } from 'react-native';
import { Map } from 'lucide-react-native';
import { AppButton } from './AppButton';
import { AppText } from './AppText';
import { theme } from '@/theme/theme';

type EmptyStateProps = {
  title: string;
  message: string;
  action?: string;
  onAction?: () => void;
};

export function EmptyState({ title, message, action, onAction }: EmptyStateProps) {
  return (
    <View style={styles.state}>
      <Map size={34} color={theme.colors.purple} />
      <AppText variant="h3">{title}</AppText>
      <AppText variant="body" style={styles.message}>
        {message}
      </AppText>
      {action ? <AppButton label={action} variant="secondary" onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  state: {
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
  },
  message: {
    textAlign: 'center',
  },
});
