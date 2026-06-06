import { Bell, LocateFixed } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { AppText, MapPreview, Screen } from '@/components';
import { theme } from '@/theme/theme';

export default function HomeScreen() {
  return (
    <Screen dark scroll={false}>
      <View style={styles.content}>
        <View style={styles.top}>
          <View>
            <AppText variant="title" color={theme.colors.white}>Travel Map</AppText>
            <AppText variant="caption" color="#C7C4EA">像开放世界一样点亮真实旅行地图</AppText>
          </View>
          <View style={styles.icons}>
            <LocateFixed size={22} color={theme.colors.white} />
            <Bell size={22} color={theme.colors.white} />
          </View>
        </View>
        <MapPreview />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: theme.spacing.page,
    paddingBottom: theme.components.tabHeight + theme.spacing.lg,
  },
  top: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  icons: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
});
