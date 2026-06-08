import { router } from 'expo-router';
import { MapPin, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppButton, AppCard, AppText, Screen } from '@/components';
import { ensureAuthSession } from '@/services/authSession';
import { serviceConfig } from '@/services/config';
import { theme } from '@/theme/theme';

export default function LoginScreen() {
  const [isEntering, setIsEntering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const enterApp = async () => {
    setIsEntering(true);
    setErrorMessage(undefined);

    try {
      if (serviceConfig.dataSource === 'api') {
        await ensureAuthSession();
      }
      router.replace('/tabs/home');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '进入失败，请稍后重试。');
    } finally {
      setIsEntering(false);
    }
  };

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
          {serviceConfig.dataSource === 'api'
            ? 'API 模式会先创建游客会话，再同步真实后端旅行数据。'
            : 'Mock 模式使用 Nicola 的本地旅行档案。'}
        </AppText>
        {errorMessage ? (
          <AppText variant="caption" color={theme.colors.gold}>
            {errorMessage}
          </AppText>
        ) : null}
        <AppButton
          label={isEntering ? '进入中...' : '进入旅行地图'}
          icon={<Sparkles size={18} color={theme.colors.mapDarkAlt} />}
          onPress={enterApp}
          disabled={isEntering}
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
