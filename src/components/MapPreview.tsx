import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { router } from 'expo-router';
import { Map, Minus, Plus } from 'lucide-react-native';
import { cities as fallbackCities, quests as fallbackQuests, spots as fallbackSpots } from '@/mock';
import { mockMapProvider } from '@/services/map/mockMapProvider';
import { MapLayer, MapPoint, MapPointState } from '@/services/map/types';
import { City } from '@/types/city';
import { ThemeQuest } from '@/types/quest';
import { Spot } from '@/types/spot';
import { theme } from '@/theme/theme';
import { GlowPoint } from './GlowPoint';
import { AppText } from './AppText';
import { StatusChip } from './StatusChip';

type MapPreviewProps = {
  compact?: boolean;
  cities?: City[];
  spots?: Spot[];
  quests?: ThemeQuest[];
  focusCityId?: string;
  initialLayer?: MapLayer;
  litCityCount?: number;
  provinceCount?: number;
  exploredSpotCount?: number;
};

const layerOrder: MapLayer[] = ['country', 'city', 'spot'];

const layerLabels: Record<MapLayer, string> = {
  country: '全国',
  city: '城市',
  spot: '景点',
};

const stateLabels: Record<MapPointState, string> = {
  lit: '已点亮',
  unlit: '未点亮',
  wishlist: '心愿单',
  'theme-task': '主题任务',
};

export function MapPreview({
  compact = false,
  cities = fallbackCities,
  spots = fallbackSpots,
  quests = fallbackQuests,
  focusCityId,
  initialLayer,
  litCityCount,
  provinceCount,
  exploredSpotCount,
}: MapPreviewProps) {
  const defaultFocusCityId = focusCityId ?? cities.find((city) => city.lit)?.id ?? cities[0]?.id;
  const [activeLayer, setActiveLayer] = useState<MapLayer>(initialLayer ?? (focusCityId ? 'spot' : 'country'));
  const activeCity = cities.find((city) => city.id === defaultFocusCityId) ?? cities[0];
  const dynamicLitCityCount = litCityCount ?? cities.filter((city) => city.lit).length;
  const dynamicProvinceCount = provinceCount ?? new Set(cities.filter((city) => city.lit).map((city) => city.province)).size;
  const visibleLayer = compact ? 'country' : activeLayer;
  const points = useMemo(() => {
    if (visibleLayer === 'spot' && activeCity) {
      return mockMapProvider.buildSpotPoints({ city: activeCity, spots, quests });
    }
    if (visibleLayer === 'city') {
      return mockMapProvider.buildCityPoints({ cities, quests, focusCityId: activeCity?.id });
    }

    return mockMapProvider.buildCountryPoints({ cities, quests });
  }, [activeCity, cities, quests, spots, visibleLayer]);
  const visiblePoints = compact ? points.slice(0, 7) : points;
  const nearbySpots = activeCity
    ? mockMapProvider.findNearbySpots({
        origin: activeCity.coordinates,
        spots: spots.filter((spot) => spot.cityId === activeCity.id),
        limit: 3,
      })
    : [];
  const stateCounts = visiblePoints.reduce<Record<MapPointState, number>>(
    (counts, point) => ({
      ...counts,
      [point.state]: counts[point.state] + 1,
    }),
    {
      lit: 0,
      unlit: 0,
      wishlist: 0,
      'theme-task': 0,
    }
  );

  const zoom = (direction: 1 | -1) => {
    const currentIndex = layerOrder.indexOf(activeLayer);
    const nextIndex = Math.min(Math.max(currentIndex + direction, 0), layerOrder.length - 1);

    setActiveLayer(layerOrder[nextIndex]);
  };

  return (
    <View style={[styles.map, compact && styles.compact]}>
      <Svg style={StyleSheet.absoluteFill} viewBox="0 0 320 420">
        {Array.from({ length: 9 }).map((_, index) => (
          <Line
            key={`h-${index}`}
            x1="12"
            x2="308"
            y1={40 + index * 42}
            y2={40 + index * 42}
            stroke="rgba(183,156,255,0.12)"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: 7 }).map((_, index) => (
          <Line
            key={`v-${index}`}
            x1={32 + index * 44}
            x2={32 + index * 44}
            y1="24"
            y2="396"
            stroke="rgba(141,187,255,0.1)"
            strokeWidth="1"
          />
        ))}
        <Path
          d="M72 90 C105 55 173 48 218 74 C252 94 271 133 267 169 C294 188 300 231 276 254 C295 291 273 334 231 336 C214 372 166 386 132 363 C99 372 59 351 52 313 C20 293 24 244 52 225 C37 189 44 126 72 90 Z"
          fill="rgba(183,156,255,0.08)"
          stroke="rgba(183,156,255,0.34)"
          strokeWidth="1.4"
        />
        <Path
          d="M125 222 C153 205 194 210 213 238 C199 272 153 281 126 255 C116 244 116 232 125 222 Z"
          fill="rgba(120,230,214,0.14)"
          stroke="rgba(120,230,214,0.38)"
          strokeWidth="1.2"
        />
        <Path
          d="M88 182 C126 138 199 148 238 205 C203 242 145 249 105 226"
          fill="none"
          stroke="rgba(141,187,255,0.38)"
          strokeWidth="2"
        />
        <Circle cx="176" cy="190" r="3.8" fill="#FFFFFF" />
      </Svg>
      {visiblePoints.map((point) => (
        <GlowPoint
          key={`${point.kind}-${point.id}`}
          x={point.x}
          y={point.y}
          state={point.state}
          label={`${point.label} · ${stateLabels[point.state]}`}
          onPress={() => router.push(point.href)}
        />
      ))}
      {!compact ? (
        <>
          {visiblePoints.slice(0, 4).map((point) => (
            <View key={`label-${point.kind}-${point.id}`} style={[styles.label, { left: `${point.x}%`, top: `${point.y + 3}%` }]}>
              <AppText variant="caption" color={theme.colors.white}>{point.label}</AppText>
            </View>
          ))}
          <View style={styles.layerBar}>
            {layerOrder.map((layer) => (
              <Pressable
                key={layer}
                onPress={() => setActiveLayer(layer)}
                style={[styles.layerPill, activeLayer === layer && styles.layerPillActive]}
                accessibilityRole="button"
                accessibilityLabel={`切换到${layerLabels[layer]}层`}
              >
                <AppText variant="caption" color={activeLayer === layer ? theme.colors.mapDarkAlt : theme.colors.white}>
                  {layerLabels[layer]}
                </AppText>
              </Pressable>
            ))}
          </View>
          <View style={styles.controls}>
            <Pressable style={styles.controlButton} onPress={() => zoom(1)} accessibilityRole="button" accessibilityLabel="放大地图层级">
              <Plus size={18} color={theme.colors.white} />
            </Pressable>
            <Pressable style={styles.controlButton} onPress={() => zoom(-1)} accessibilityRole="button" accessibilityLabel="缩小地图层级">
              <Minus size={18} color={theme.colors.white} />
            </Pressable>
            <Pressable style={styles.controlButton} onPress={() => setActiveLayer('country')} accessibilityRole="button" accessibilityLabel="回到全国层">
              <Map size={18} color={theme.colors.white} />
            </Pressable>
          </View>
          <View style={styles.legend}>
            {(Object.keys(stateLabels) as MapPointState[]).map((state) => (
              <View key={state} style={styles.legendItem}>
                <View style={[styles.legendDot, styles[state]]} />
                <AppText variant="caption" color={theme.colors.white}>{stateLabels[state]}</AppText>
              </View>
            ))}
          </View>
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <StatusChip label={`${layerLabels[visibleLayer]}层`} tone={visibleLayer === 'spot' ? 'gold' : 'purple'} />
              <AppText variant="caption" color="#C7C4EA">
                {visibleLayer === 'spot' && activeCity ? `${activeCity.name} · ${visiblePoints.length} 个景点` : `${visiblePoints.length} 个点位`}
              </AppText>
            </View>
            <AppText variant="h3" color={theme.colors.white}>
              {visibleLayer === 'country' ? '全国城市点位' : visibleLayer === 'city' ? `${activeCity?.name ?? '城市'}周边城市` : `${activeCity?.name ?? '城市'}景点点位`}
            </AppText>
            <AppText variant="caption" color="#C7C4EA">
              已点亮 {stateCounts.lit} · 心愿 {stateCounts.wishlist} · 主题 {stateCounts['theme-task']} · 未点亮 {stateCounts.unlit}
            </AppText>
            {visibleLayer === 'spot' && nearbySpots.length ? (
              <View style={styles.nearbyList}>
                {nearbySpots.map(({ spot, distanceLabel }) => (
                  <Pressable key={spot.id} style={styles.nearbyItem} onPress={() => router.push(`/spot/${spot.id}`)}>
                    <AppText variant="caption" color={theme.colors.white}>{spot.name}</AppText>
                    <AppText variant="caption" color="#C7C4EA">{distanceLabel}</AppText>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
          <View style={styles.capsule}>
            <AppText variant="caption" color={theme.colors.white}>
              已点亮 {dynamicLitCityCount} 座城市 · {dynamicProvinceCount} 个省份 · {exploredSpotCount ?? 0} 个景点
            </AppText>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    backgroundColor: theme.colors.mapDark,
    borderColor: 'rgba(183,156,255,0.24)',
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    height: theme.components.mapHeight,
    overflow: 'hidden',
    position: 'relative',
  },
  compact: {
    borderRadius: theme.radius.lg,
    height: 160,
  },
  controls: {
    gap: theme.spacing.sm,
    position: 'absolute',
    right: theme.spacing.md,
    top: 190,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  layerBar: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    left: theme.spacing.lg,
    position: 'absolute',
    top: theme.spacing.lg,
  },
  layerPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  layerPillActive: {
    backgroundColor: theme.colors.mint,
    borderColor: theme.colors.mint,
  },
  capsule: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    bottom: theme.spacing.lg,
    left: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    position: 'absolute',
  },
  label: {
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    marginLeft: -28,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    position: 'absolute',
  },
  legend: {
    gap: theme.spacing.sm,
    left: theme.spacing.lg,
    position: 'absolute',
    top: 64,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  legendDot: {
    borderColor: 'rgba(255,255,255,0.8)',
    borderRadius: 999,
    borderWidth: 1,
    height: 9,
    width: 9,
  },
  lit: {
    backgroundColor: theme.colors.mint,
  },
  unlit: {
    backgroundColor: '#8388AA',
  },
  wishlist: {
    backgroundColor: theme.colors.gold,
  },
  'theme-task': {
    backgroundColor: theme.colors.purple,
  },
  panel: {
    backgroundColor: 'rgba(37,42,74,0.72)',
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
    left: theme.spacing.lg,
    padding: theme.spacing.md,
    position: 'absolute',
    right: theme.spacing.lg,
    top: 118,
  },
  panelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nearbyList: {
    gap: theme.spacing.sm,
  },
  nearbyItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
