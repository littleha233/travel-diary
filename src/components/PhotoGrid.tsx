import { Image, StyleSheet, View } from 'react-native';
import { theme } from '@/theme/theme';

type PhotoGridProps = {
  photos: string[];
};

export function PhotoGrid({ photos }: PhotoGridProps) {
  return (
    <View style={styles.grid}>
      {photos.map((photo) => (
        <Image key={photo} source={{ uri: photo }} style={styles.photo} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  photo: {
    aspectRatio: 1,
    borderRadius: theme.radius.md,
    flexBasis: '31.8%',
    flexGrow: 1,
  },
});
