import { StyleSheet, View } from 'react-native';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { router } from 'expo-router';
import { cities as fallbackCities } from '@/mock';
import { City } from '@/types/city';
import { theme } from '@/theme/theme';
import { GlowPoint } from './GlowPoint';
import { AppText } from './AppText';

type MapPreviewProps = {
  compact?: boolean;
  cities?: City[];
  litCityCount?: number;
  provinceCount?: number;
  exploredSpotCount?: number;
};

export function MapPreview({ compact = false, cities = fallbackCities, litCityCount, provinceCount, exploredSpotCount }: MapPreviewProps) {
  const visibleCities = compact ? cities.slice(0, 7) : cities;
  const dynamicLitCityCount = litCityCount ?? cities.filter((city) => city.lit).length;
  const dynamicProvinceCount = provinceCount ?? new Set(cities.filter((city) => city.lit).map((city) => city.province)).size;

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
      {visibleCities.map((city, index) => (
        <GlowPoint
          key={city.id}
          x={city.mapX}
          y={city.mapY}
          tone={!city.lit ? 'gray' : index % 7 === 0 ? 'gold' : index % 5 === 0 ? 'blue' : 'mint'}
          onPress={() => router.push(`/city/${city.id}`)}
        />
      ))}
      {!compact ? (
        <>
          <View style={[styles.label, { left: '47%', top: '31%' }]}>
            <AppText variant="caption" color={theme.colors.white}>
              Beijing
            </AppText>
          </View>
          <View style={[styles.label, { left: '56%', top: '62%' }]}>
            <AppText variant="caption" color={theme.colors.white}>
              Hangzhou
            </AppText>
          </View>
          <View style={styles.controls}>
            <AppText variant="h3" color={theme.colors.white}>＋</AppText>
            <AppText variant="h3" color={theme.colors.white}>－</AppText>
            <AppText variant="h3" color={theme.colors.white}>◎</AppText>
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
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    position: 'absolute',
  },
});
