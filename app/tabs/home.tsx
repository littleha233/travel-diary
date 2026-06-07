import { Bell, LocateFixed } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { AppText, ErrorState, LoadingState, MapPreview, Screen } from '@/components';
import { useTravelStore } from '@/store/travelStore';
import { theme } from '@/theme/theme';

export default function HomeScreen() {
  const { status, errorMessage, cities, spots, quests, user, retry } = useTravelStore(
    useShallow((state) => ({
      status: state.status,
      errorMessage: state.errorMessage,
      cities: state.cities,
      spots: state.spots,
      quests: state.quests,
      user: state.user,
      retry: state.retry,
    }))
  );

  if (status === 'loading') {
    return (
      <Screen dark scroll={false}>
        <LoadingState label="正在恢复本地旅行地图..." />
      </Screen>
    );
  }

  if (status === 'error') {
    return (
      <Screen dark>
        <ErrorState message={errorMessage} onRetry={retry} />
      </Screen>
    );
  }

  return (
    <Screen dark scroll={false}>
      <View style={styles.content}>
        <View style={styles.top}>
          <View>
            <AppText variant="title" color={theme.colors.white}>
              Travel Map
            </AppText>
            <AppText variant="caption" color="#C7C4EA">
              像开放世界一样点亮真实旅行地图
            </AppText>
          </View>
          <View style={styles.icons}>
            <LocateFixed size={22} color={theme.colors.white} />
            <Bell size={22} color={theme.colors.white} />
          </View>
        </View>
        <MapPreview
          cities={cities}
          spots={spots}
          quests={quests}
          litCityCount={user.litCityCount}
          provinceCount={user.provinceCount}
          exploredSpotCount={user.exploredSpotCount}
        />
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
