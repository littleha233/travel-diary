import { Pressable, StyleSheet, View } from 'react-native';
import { MapPointState } from '@/services/map/types';
import { theme } from '@/theme/theme';

type GlowPointProps = {
  x: number;
  y: number;
  tone?: 'mint' | 'blue' | 'gold' | 'gray' | 'purple';
  state?: MapPointState;
  label?: string;
  onPress?: () => void;
};

function getToneFromState(state?: MapPointState): GlowPointProps['tone'] {
  if (state === 'lit') {
    return 'mint';
  }
  if (state === 'wishlist') {
    return 'gold';
  }
  if (state === 'theme-task') {
    return 'purple';
  }
  if (state === 'unlit') {
    return 'gray';
  }

  return undefined;
}

export function GlowPoint({ x, y, tone, state, label, onPress }: GlowPointProps) {
  const resolvedTone = tone ?? getToneFromState(state) ?? 'mint';

  return (
    <Pressable
      onPress={onPress}
      style={[styles.wrap, { left: `${x}%`, top: `${y}%` }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.glow, styles[resolvedTone]]}>
        <View style={styles.core} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 36,
    marginLeft: -18,
    marginTop: -18,
    position: 'absolute',
    width: 36,
    zIndex: theme.zIndex.floating,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    alignItems: 'center',
    borderRadius: 999,
    height: 16,
    justifyContent: 'center',
    width: 16,
  },
  core: {
    backgroundColor: theme.colors.white,
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  mint: {
    backgroundColor: theme.colors.mint,
    shadowColor: theme.colors.mint,
    shadowOpacity: 0.8,
    shadowRadius: 18,
  },
  blue: {
    backgroundColor: theme.colors.blue,
    shadowColor: theme.colors.blue,
    shadowOpacity: 0.7,
    shadowRadius: 18,
  },
  gold: {
    backgroundColor: theme.colors.gold,
    shadowColor: theme.colors.gold,
    shadowOpacity: 0.7,
    shadowRadius: 18,
  },
  purple: {
    backgroundColor: theme.colors.purple,
    shadowColor: theme.colors.purple,
    shadowOpacity: 0.72,
    shadowRadius: 18,
  },
  gray: {
    backgroundColor: '#8388AA',
    shadowColor: '#8388AA',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
});
