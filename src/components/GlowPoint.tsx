import { Pressable, StyleSheet, View } from 'react-native';
import { theme } from '@/theme/theme';

type GlowPointProps = {
  x: number;
  y: number;
  tone?: 'mint' | 'blue' | 'gold' | 'gray';
  onPress?: () => void;
};

export function GlowPoint({ x, y, tone = 'mint', onPress }: GlowPointProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.wrap, { left: `${x}%`, top: `${y}%` }]}
      accessibilityRole="button"
    >
      <View style={[styles.glow, styles[tone]]}>
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
  gray: {
    backgroundColor: '#8388AA',
    shadowColor: '#8388AA',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
});
