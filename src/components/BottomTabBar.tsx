import { Pressable, StyleSheet, View } from 'react-native';
import { Home, Map, MapPin, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from './AppText';
import { theme } from '@/theme/theme';

const icons = {
  home: Home,
  map: Map,
  checkin: MapPin,
  profile: User,
};

const labels = {
  home: '首页',
  map: '地图',
  checkin: '点亮',
  profile: '我的',
};

type BottomTabBarProps = {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  navigation: {
    navigate: (name: string) => void;
  };
};

export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.wrap}>
      {state.routes
        .filter((route) => route.name in icons)
        .map((route, index) => {
          const focused = state.index === index;
          const name = route.name as keyof typeof icons;
          const Icon = icons[name] ?? Map;
          const isCenter = name === 'checkin';

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              onPress={() => navigation.navigate(route.name)}
              style={[styles.item, isCenter && styles.centerItem]}
            >
              {isCenter ? (
                <LinearGradient
                  colors={[theme.colors.mintLight, theme.colors.mint, theme.colors.purple]}
                  style={styles.activate}
                >
                  <Icon size={30} color={theme.colors.mapDarkAlt} />
                </LinearGradient>
              ) : (
                <Icon size={22} color={focused ? theme.colors.mint : theme.colors.muted} />
              )}
              <AppText
                variant="caption"
                color={focused || isCenter ? theme.colors.mint : theme.colors.muted}
                style={styles.label}
              >
                {labels[name]}
              </AppText>
            </Pressable>
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderColor: 'rgba(255,255,255,0.88)',
    borderRadius: 28,
    borderWidth: 1,
    bottom: 10,
    flexDirection: 'row',
    height: theme.components.tabHeight,
    justifyContent: 'space-around',
    maxWidth: theme.components.pageMaxWidth - 24,
    paddingHorizontal: theme.spacing.sm,
    position: 'absolute',
    width: '94%',
    zIndex: theme.zIndex.tab,
    ...theme.shadow.soft,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
    justifyContent: 'center',
  },
  centerItem: {
    transform: [{ translateY: -18 }],
  },
  activate: {
    alignItems: 'center',
    borderColor: 'rgba(255,255,255,0.9)',
    borderRadius: 999,
    borderWidth: 6,
    height: 66,
    justifyContent: 'center',
    width: 66,
    ...theme.shadow.glow,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
  },
});
