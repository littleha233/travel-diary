import { StyleSheet, View } from 'react-native';
import { Bell, Image, Lock, MapPin, User } from 'lucide-react-native';
import { AppCard, AppText, DetailHeader, Screen, StatusChip } from '@/components';
import { theme } from '@/theme/theme';

const items = [
  { label: '账号资料', value: 'Nicola · 游客体验', icon: User },
  { label: '定位权限', value: 'v0.1 使用 mock 定位', icon: MapPin },
  { label: '相册权限', value: '暂不请求真实相册', icon: Image },
  { label: '隐私设置', value: '旅行记录默认仅自己可见', icon: Lock },
  { label: '通知提醒', value: '后续版本接入', icon: Bell },
];

export default function SettingsScreen() {
  return (
    <Screen>
      <DetailHeader title="设置" subtitle="账号、隐私、权限" />
      <View style={styles.list}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <AppCard key={item.label} style={styles.item}>
              <Icon size={22} color={theme.colors.purple} />
              <View style={styles.text}>
                <AppText variant="h3">{item.label}</AppText>
                <AppText variant="caption">{item.value}</AppText>
              </View>
              <StatusChip label="Mock" tone="gray" />
            </AppCard>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: theme.spacing.md,
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  text: {
    flex: 1,
  },
});
