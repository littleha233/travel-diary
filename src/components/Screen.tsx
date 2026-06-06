import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/theme/theme';

type ScreenProps = PropsWithChildren<{
  dark?: boolean;
  scroll?: boolean;
}>;

export function Screen({ children, dark = false, scroll = true }: ScreenProps) {
  const Container = scroll ? ScrollView : View;

  return (
    <LinearGradient
      colors={
        dark
          ? [theme.colors.mapDarkAlt, theme.colors.mapDark]
          : ['#FFFDFF', theme.colors.background]
      }
      style={styles.root}
    >
      <SafeAreaView style={styles.safe}>
        <Container
          style={styles.container}
          contentContainerStyle={scroll ? [styles.content, styles.bottomSpace] : undefined}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </Container>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.page,
  },
  bottomSpace: {
    paddingBottom: theme.components.tabHeight + theme.spacing.xl,
  },
});
