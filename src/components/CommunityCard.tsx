import { Image, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Route, Sparkles, Trophy } from 'lucide-react-native';
import { CommunityPost } from '@/types/community';
import { AppButton } from './AppButton';
import { AppText } from './AppText';
import { MapPreview } from './MapPreview';
import { ProgressBar } from './ProgressBar';
import { StatusChip } from './StatusChip';
import { theme } from '@/theme/theme';

type CommunityCardProps = {
  post: CommunityPost;
};

export function CommunityCard({ post }: CommunityCardProps) {
  function openPost() {
    if (post.type === 'route') {
      router.push(`/trip/${post.linkedId}`);
      return;
    }
    if (post.type === 'ai-memory') {
      router.push(`/ai-memory/${post.linkedId}`);
      return;
    }
    if (post.type === 'quest') {
      router.push(`/quest/${post.linkedId}`);
      return;
    }
    router.push('/achievements');
  }

  return (
    <Pressable style={[styles.card, post.type === 'route' && styles.wide]} onPress={openPost}>
      {post.type === 'route' ? <MapPreview compact /> : null}
      {post.imageUrl ? <Image source={{ uri: post.imageUrl }} style={styles.image} /> : null}
      {post.type === 'achievement' || post.type === 'quest' ? (
        <View style={styles.iconPanel}>
          {post.type === 'achievement' ? (
            <Trophy size={34} color={theme.colors.gold} />
          ) : (
            <Sparkles size={34} color={theme.colors.mint} />
          )}
        </View>
      ) : null}
      <View style={styles.body}>
        <StatusChip
          label={
            post.type === 'route'
              ? '路线地图卡'
              : post.type === 'ai-memory'
                ? 'AI 游记'
                : post.type === 'quest'
                  ? '主题任务'
                  : '成就分享'
          }
          tone={post.type === 'achievement' ? 'gold' : 'mint'}
        />
        <AppText variant="h3">{post.title}</AppText>
        <AppText variant="caption">{post.subtitle}</AppText>
        {typeof post.progress === 'number' ? <ProgressBar value={post.progress} /> : null}
        {post.actionLabel ? (
          <AppButton
            label={post.actionLabel}
            variant="secondary"
            icon={<Route size={15} color={theme.colors.text} />}
            onPress={openPost}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderColor: 'rgba(255,255,255,0.78)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flex: 1,
    minWidth: '47%',
    overflow: 'hidden',
    ...theme.shadow.soft,
  },
  wide: {
    flexBasis: '100%',
  },
  image: {
    height: 126,
    width: '100%',
  },
  iconPanel: {
    alignItems: 'center',
    backgroundColor: 'rgba(183,156,255,0.14)',
    height: 116,
    justifyContent: 'center',
  },
  body: {
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
});
