import { Image, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import { Spot } from '@/types/spot';
import { AppButton } from './AppButton';
import { AppText } from './AppText';
import { StatusChip } from './StatusChip';
import { theme } from '@/theme/theme';

type SpotCardProps = {
  spot: Spot;
  onLightUp?: (spot: Spot) => void;
};

export function SpotCard({ spot, onLightUp }: SpotCardProps) {
  const isLit = spot.status === 'lit';

  return (
    <Pressable style={[styles.card, spot.canCheckIn && !isLit ? styles.glow : null]} onPress={() => router.push(`/spot/${spot.id}`)}>
      <Image source={{ uri: spot.coverUrl }} style={styles.image} />
      <View style={styles.body}>
        <AppText variant="h3">{spot.name}</AppText>
        <AppText variant="caption">{spot.distance} · {spot.tags.join(' / ')}</AppText>
        <StatusChip label={isLit ? '已点亮' : spot.canCheckIn ? 'GPS 可点亮' : '心愿'} tone={isLit ? 'gray' : 'mint'} />
      </View>
      {onLightUp && !isLit ? (
        <AppButton
          label="点亮"
          icon={<MapPin size={15} color={theme.colors.mapDarkAlt} />}
          onPress={(event) => {
            event.stopPropagation();
            onLightUp(spot);
          }}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderColor: 'rgba(255,255,255,0.78)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    ...theme.shadow.soft,
  },
  glow: {
    borderColor: 'rgba(120,230,214,0.44)',
  },
  image: {
    borderRadius: theme.radius.md,
    height: 62,
    width: 62,
  },
  body: {
    flex: 1,
    gap: theme.spacing.xs,
  },
});
