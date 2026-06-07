import { Image, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { City } from '@/types/city';
import { AppText } from './AppText';
import { StatusChip } from './StatusChip';
import { theme } from '@/theme/theme';

type CityCardProps = {
  city: City;
};

export function CityCard({ city }: CityCardProps) {
  return (
    <Pressable style={styles.card} onPress={() => router.push(`/city/${city.id}`)}>
      <Image source={{ uri: city.coverUrl }} style={styles.image} />
      <View style={styles.body}>
        <View style={styles.row}>
          <AppText variant="h3">{city.name}</AppText>
          <StatusChip label={city.lit ? '已点亮' : '想去'} tone={city.lit ? 'mint' : 'gray'} />
        </View>
        <AppText variant="caption">
          {city.province} · {city.tags.join(' / ')}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderColor: 'rgba(255,255,255,0.8)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    ...theme.shadow.soft,
  },
  image: {
    borderRadius: theme.radius.md,
    height: 64,
    width: 64,
  },
  body: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
