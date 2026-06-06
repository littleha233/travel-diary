import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { AppButton, AppCard, AppText, DetailHeader, ErrorState, PhotoGrid, Screen, SectionHeader, StatusChip } from '@/components';
import { aiMemories } from '@/mock';
import { theme } from '@/theme/theme';

export default function AIMemoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const memory = aiMemories.find((item) => item.id === id);

  if (!memory) {
    return (
      <Screen dark>
        <DetailHeader title="AI 回忆" dark />
        <ErrorState title="没有找到这段回忆" />
      </Screen>
    );
  }

  return (
    <Screen dark>
      <DetailHeader title="生成 AI 回忆" subtitle="AI Memory · 把旅途整理成故事" dark />
      <AppCard variant="dark" style={styles.card}>
        <AppText variant="h3" color={theme.colors.white}>杭州周末探索</AppText>
        <View style={styles.chips}>
          {['7 个景点', '36 张照片', '3 天行程', '自然日记'].map((label, index) => (
            <StatusChip key={label} label={label} tone={index === 0 ? 'mint' : 'gray'} />
          ))}
        </View>
        <PhotoGrid photos={memory.photoUrls.slice(0, 3)} />
      </AppCard>
      <SectionHeader title="生成状态" dark />
      <AppCard variant="dark" style={styles.status}>
        <Sparkles size={30} color={theme.colors.mint} />
        <View>
          <AppText variant="h3" color={theme.colors.white}>已整理地点、照片和心情</AppText>
          <AppText variant="caption" color="#C7C4EA">mock AI 已生成一段旅行回忆</AppText>
        </View>
      </AppCard>
      <SectionHeader title="生成结果" action="重新生成" dark />
      <AppCard style={styles.paper}>
        <StatusChip label="玻璃纸张" />
        <AppText variant="h2">{memory.title}</AppText>
        <AppText variant="body">{memory.content}</AppText>
        <AppText variant="caption">{memory.summary}</AppText>
      </AppCard>
      <View style={styles.actions}>
        <AppButton label="保存回忆" fullWidth />
        <AppButton label="分享" variant="secondary" fullWidth />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  status: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  paper: {
    gap: theme.spacing.md,
  },
  actions: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
});
