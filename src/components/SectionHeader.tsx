import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { theme } from '@/theme/theme';

type SectionHeaderProps = {
  title: string;
  action?: string;
  dark?: boolean;
  onAction?: () => void;
};

export function SectionHeader({ title, action, dark, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <AppText variant="h3" color={dark ? theme.colors.white : theme.colors.text}>
        {title}
      </AppText>
      {action ? (
        <Pressable onPress={onAction} disabled={!onAction} hitSlop={8}>
          <AppText variant="caption" color={dark ? theme.colors.mintLight : '#7E6DD8'}>
            {action}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
});
