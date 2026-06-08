import { Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { AppCard, AppText, CommunityCard, Screen, StatusChip } from '@/components';
import { useTravelStore } from '@/store/travelStore';
import { theme } from '@/theme/theme';

const filters = ['全部', '推荐路线', 'AI 游记', '主题任务', '成就'];
const typeLabels = {
  route: '推荐路线',
  'ai-memory': 'AI 游记',
  quest: '主题任务',
  achievement: '成就',
};

export default function CommunityScreen() {
  const { communityPosts } = useTravelStore(
    useShallow((state) => ({
      communityPosts: state.communityPosts,
    }))
  );
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(filters[0]);
  const filteredPosts = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return communityPosts.filter((post) => {
      const matchesFilter = filter === '全部' || typeLabels[post.type] === filter;
      const matchesQuery = !keyword || `${post.title} ${post.subtitle} ${post.author}`.toLowerCase().includes(keyword);

      return matchesFilter && matchesQuery;
    });
  }, [communityPosts, filter, query]);

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
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="搜索城市、路线、主题任务"
          placeholderTextColor={theme.colors.muted}
          style={styles.searchInput}
        />
      </AppCard>
      <View style={styles.chips}>
        {filters.map((label) => (
          <Pressable key={label} onPress={() => setFilter(label)}>
            <StatusChip label={label} tone={filter === label ? 'mint' : 'gray'} />
          </Pressable>
        ))}
      </View>
      <View style={styles.grid}>
        {filteredPosts.map((post) => (
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
  searchInput: {
    color: theme.colors.text,
    flex: 1,
    minHeight: 42,
    ...theme.typography.body,
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
