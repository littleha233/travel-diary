import { router } from 'expo-router';
import { Bell, LocateFixed, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { AppText, ErrorState, LoadingState, MapPreview, Screen } from '@/components';
import { useTravelStore } from '@/store/travelStore';
import { theme } from '@/theme/theme';

export default function MapScreen() {
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
  const [query, setQuery] = useState('');
  const searchResult = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) {
      return {
        cities,
        spots,
        quests,
      };
    }

    const matchedSpots = spots.filter((spot) =>
      `${spot.name} ${spot.description} ${spot.tags.join(' ')}`.toLowerCase().includes(keyword)
    );
    const matchedSpotCityIds = new Set(matchedSpots.map((spot) => spot.cityId));
    const matchedCities = cities.filter(
      (city) =>
        matchedSpotCityIds.has(city.id) ||
        `${city.name} ${city.province} ${city.description} ${city.tags.join(' ')}`.toLowerCase().includes(keyword)
    );
    const matchedQuests = quests.filter((quest) => `${quest.title} ${quest.subtitle}`.toLowerCase().includes(keyword));

    return {
      cities: matchedCities,
      spots: matchedSpots,
      quests: matchedQuests,
    };
  }, [cities, query, quests, spots]);
  const hasQuery = Boolean(query.trim());
  const resultCount = searchResult.cities.length + searchResult.spots.length + searchResult.quests.length;

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
            <Pressable style={styles.iconButton} onPress={() => router.push('/tabs/checkin')}>
              <LocateFixed size={22} color={theme.colors.white} />
            </Pressable>
            <Pressable style={styles.iconButton} onPress={() => router.push('/achievements')}>
              <Bell size={22} color={theme.colors.white} />
            </Pressable>
          </View>
        </View>
        <View style={styles.search}>
          <Search size={18} color={theme.colors.mintLight} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="搜索城市、景点、主题任务"
            placeholderTextColor="#C7C4EA"
            returnKeyType="search"
            style={styles.searchInput}
          />
        </View>
        {hasQuery ? (
          <AppText variant="caption" color="#C7C4EA" style={styles.resultLabel}>
            命中 {resultCount} 项：{searchResult.cities.length} 座城市 · {searchResult.spots.length} 个景点 ·{' '}
            {searchResult.quests.length} 个主题
          </AppText>
        ) : null}
        <MapPreview
          cities={searchResult.cities}
          spots={searchResult.spots}
          quests={searchResult.quests}
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
    gap: theme.spacing.sm,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  search: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  searchInput: {
    color: theme.colors.white,
    flex: 1,
    minHeight: 44,
    ...theme.typography.body,
  },
  resultLabel: {
    marginBottom: theme.spacing.md,
  },
});
