import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { AppText } from './AppText';
import { theme } from '@/theme/theme';

type DetailHeaderProps = {
  title: string;
  subtitle?: string;
  dark?: boolean;
};

export function DetailHeader({ title, subtitle, dark }: DetailHeaderProps) {
  return (
    <View style={styles.row}>
      <Pressable style={[styles.back, dark && styles.backDark]} onPress={() => router.back()}>
        <ChevronLeft size={22} color={dark ? theme.colors.white : theme.colors.text} />
      </Pressable>
      <View style={styles.text}>
        <AppText variant="h2" color={dark ? theme.colors.white : theme.colors.text}>{title}</AppText>
        {subtitle ? <AppText variant="caption" color={dark ? '#C7C4EA' : theme.colors.muted}>{subtitle}</AppText> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  back: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: theme.radius.md,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  backDark: {
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  text: {
    flex: 1,
  },
});
