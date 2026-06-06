import { Search } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { AppCard, AppText, CommunityCard, Screen, StatusChip } from '@/components';
import { communityPosts } from '@/mock';
import { theme } from '@/theme/theme';

export default function CommunityScreen() {
  return (
    <Screen>
      <View style={styles.top}>
        <View>
          <AppText variant="title">社区</AppText>
          <AppText variant="caption">发现别人点亮世界的方式</AppText>
        </View>
      </View>
      <AppCard style={styles.search}>
        <Search size={19} color={theme.colors.muted} />
        <AppText variant="body">搜索城市、路线、主题任务</AppText>
      </AppCard>
      <View style={styles.chips}>
        {['推荐路线', '城市攻略', '点亮地图', 'AI 游记'].map((label, index) => (
          <StatusChip key={label} label={label} tone={index === 0 ? 'mint' : 'gray'} />
        ))}
      </View>
      <View style={styles.grid}>
        {communityPosts.map((post) => (
          <CommunityCard key={post.id} post={post} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    marginBottom: theme.spacing.lg,
  },
  search: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
});
