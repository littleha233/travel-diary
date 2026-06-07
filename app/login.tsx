import { router } from 'expo-router';
import { MapPin, Sparkles } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppButton, AppCard, AppText, Screen } from '@/components';
import { theme } from '@/theme/theme';

export default function LoginScreen() {
  return (
    <Screen dark>
      <View style={styles.logoWrap}>
        <LinearGradient colors={[theme.colors.mintLight, theme.colors.mint, theme.colors.purple]} style={styles.logo}>
          <MapPin size={40} color={theme.colors.mapDarkAlt} />
        </LinearGradient>
        <AppText variant="title" color={theme.colors.white}>
          TravelAround
        </AppText>
        <AppText variant="body" color="#D8D4F4" style={styles.center}>
          点亮你去过的每一个地方。
        </AppText>
      </View>
      <AppCard variant="dark" style={styles.card}>
        <AppText variant="h2" color={theme.colors.white}>
          游客模式体验
        </AppText>
        <AppText variant="body" color="#C7C4EA">
          本阶段不接真实登录，进入后使用 Nicola 的 mock 旅行档案。
        </AppText>
        <AppButton
          label="进入旅行地图"
          icon={<Sparkles size={18} color={theme.colors.mapDarkAlt} />}
          onPress={() => router.replace('/tabs/home')}
          fullWidth
        />
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logoWrap: {
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.xxl,
  },
  logo: {
    alignItems: 'center',
    borderRadius: 999,
    height: 94,
    justifyContent: 'center',
    width: 94,
    ...theme.shadow.glow,
  },
  center: {
    textAlign: 'center',
  },
  card: {
    gap: theme.spacing.lg,
  },
});
