import { StyleSheet, View } from 'react-native';
import { CircleAlert } from 'lucide-react-native';
import { AppButton } from './AppButton';
import { AppText } from './AppText';
import { theme } from '@/theme/theme';

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = '加载失败',
  message = '旅行数据暂时没有回来，可以稍后再试。',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.state}>
      <CircleAlert size={32} color={theme.colors.danger} />
      <AppText variant="h3">{title}</AppText>
      <AppText variant="body" style={styles.message}>
        {message}
      </AppText>
      {onRetry ? <AppButton label="重试" variant="secondary" onPress={onRetry} /> : null}
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
