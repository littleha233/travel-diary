import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Camera, ChevronRight, Settings } from 'lucide-react-native';
import { AchievementBadge, AppCard, AppText, MapPreview, Screen, SectionHeader, StatusChip } from '@/components';
import { achievements, mockUser, trips } from '@/mock';
import { theme } from '@/theme/theme';

export default function ProfileScreen() {
  return (
    <Screen dark>
      <View style={styles.top}>
        <View>
          <AppText variant="title" color={theme.colors.white}>Travel Profile</AppText>
          <AppText variant="caption" color="#C7C4EA">个人旅行档案</AppText>
        </View>
        <Pressable onPress={() => router.push('/settings')}>
          <Settings size={24} color={theme.colors.white} />
        </Pressable>
      </View>
      <AppCard variant="dark" style={styles.profile}>
        <Image source={{ uri: mockUser.avatarUrl }} style={styles.avatar} />
        <View style={styles.profileText}>
          <AppText variant="h2" color={theme.colors.white}>{mockUser.nickname}</AppText>
          <AppText variant="caption" color="#C7C4EA">{mockUser.level} {mockUser.title} · City Wanderer</AppText>
          <StatusChip label="数字旅行护照已同步" tone="gold" />
        </View>
      </AppCard>
      <View style={styles.stats}>
        {[
          ['18', '已点亮城市'],
          ['72', '探索景点'],
          ['11', 'AI 回忆'],
          ['14', '解锁徽章'],
        ].map(([value, label]) => (
          <AppCard key={label} variant="dark" style={styles.stat}>
            <AppText variant="h2" color={theme.colors.white}>{value}</AppText>
            <AppText variant="caption" color="#C7C4EA">{label}</AppText>
          </AppCard>
        ))}
      </View>
      <SectionHeader title="个人地图摘要" action="查看" dark />
      <MapPreview compact />
      <SectionHeader title="徽章墙" action="全部" dark />
      <View style={styles.badges}>
        {achievements.slice(0, 3).map((achievement) => (
          <AchievementBadge key={achievement.id} achievement={achievement} />
        ))}
      </View>
      <View style={styles.entries}>
        <Entry label="我的旅行" value={trips[0].title} onPress={() => router.push(`/trip/${trips[0].id}`)} />
        <Entry label="我的照片" value="36 张旅行照片" icon={<Camera size={20} color={theme.colors.mint} />} />
        <Entry label="设置" value="隐私与账号" onPress={() => router.push('/settings')} />
      </View>
    </Screen>
  );
}

function Entry({ label, value, icon, onPress }: { label: string; value: string; icon?: React.ReactNode; onPress?: () => void }) {
  return (
    <Pressable style={styles.entry} onPress={onPress}>
      {icon}
      <View style={styles.entryText}>
        <AppText variant="h3" color={theme.colors.white}>{label}</AppText>
        <AppText variant="caption" color="#C7C4EA">{value}</AppText>
      </View>
      <ChevronRight size={20} color="#C7C4EA" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  profile: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  avatar: {
    borderColor: theme.colors.mint,
    borderRadius: 999,
    borderWidth: 2,
    height: 72,
    width: 72,
  },
  profileText: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  stat: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: theme.spacing.xs,
  },
  badges: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  entries: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  entry: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  entryText: {
    flex: 1,
  },
});
