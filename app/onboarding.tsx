import { router } from 'expo-router';
import { Compass } from 'lucide-react-native';
import { AppButton, AppText, MapPreview, Screen } from '@/components';
import { theme } from '@/theme/theme';
import { StyleSheet, View } from 'react-native';

export default function OnboardingScreen() {
  return (
    <Screen dark>
      <View style={styles.hero}>
        <AppText variant="title" color={theme.colors.white}>
          像开放世界一样探索真实世界
        </AppText>
        <AppText variant="body" color="#D8D4F4">
          点亮城市、收集景点、把旅行变成可以长期保存的个人地图。
        </AppText>
      </View>
      <MapPreview compact />
      <AppButton
        label="开始点亮"
        icon={<Compass size={18} color={theme.colors.mapDarkAlt} />}
        onPress={() => router.replace('/login')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
});
