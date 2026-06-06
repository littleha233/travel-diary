import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { Check, LocateFixed, MapPin, Sparkles } from 'lucide-react-native';
import { AppButton, AppCard, AppText, EmptyState, ErrorState, LoadingState, Screen, SectionHeader, SpotCard, StatusChip } from '@/components';
import { useTravelStore } from '@/store/travelStore';
import { Spot } from '@/types/spot';
import { theme } from '@/theme/theme';

export default function CheckInScreen() {
  const { status, errorMessage, spots, lightUpSpot } = useTravelStore((state) => ({
    status: state.status,
    errorMessage: state.errorMessage,
    spots: state.spots,
    lightUpSpot: state.lightUpSpot,
  }));
  const nearbySpots = spots.filter((spot) => spot.cityId === 'hangzhou').slice(1, 5);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [successSpot, setSuccessSpot] = useState<Spot | null>(null);

  if (status === 'loading') {
    return (
      <Screen dark>
        <LoadingState label="正在恢复附近探索点..." />
      </Screen>
    );
  }

  if (status === 'error') {
    return (
      <Screen dark>
        <ErrorState message={errorMessage} />
      </Screen>
    );
  }

  return (
    <Screen dark>
      <View style={styles.top}>
        <View>
          <AppText variant="title" color={theme.colors.white}>附近探索点</AppText>
          <AppText variant="caption" color="#C7C4EA">点亮你所在的位置</AppText>
        </View>
        <LocateFixed size={25} color={theme.colors.mintLight} />
      </View>
      <View style={styles.scanZone}>
        <View style={styles.orbit}>
          <MapPin size={32} color={theme.colors.mapDarkAlt} />
        </View>
        <AppText variant="h3" color={theme.colors.white}>正在扫描附近可点亮地点</AppText>
        <AppText variant="caption" color="#C7C4EA">发现 3 个探索点 · 杭州西湖区</AppText>
      </View>
      <AppCard variant="dark" style={styles.cityCard}>
        <View>
          <AppText variant="h3" color={theme.colors.white}>当前城市识别：杭州</AppText>
          <AppText variant="caption" color="#C7C4EA">城市已加入旅行地图</AppText>
        </View>
        <StatusChip label="已点亮" />
      </AppCard>
      <SectionHeader title="可点亮地点" action="重新定位" dark />
      {nearbySpots.length ? (
        <View style={styles.list}>
          {nearbySpots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} onLightUp={spot.status === 'lit' ? undefined : setSelectedSpot} />
          ))}
        </View>
      ) : (
        <EmptyState title="附近暂无可点亮地点" message="你仍然可以通过手动搜索补卡。" />
      )}
      <AppCard variant="dark" style={styles.search}>
        <AppText variant="body" color="#D8D4F4">搜索地点 / 手动补卡</AppText>
      </AppCard>
      <Modal visible={Boolean(selectedSpot)} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <AppCard style={styles.modal}>
            <StatusChip label="打卡确认" />
            <AppText variant="h2">{selectedSpot?.name}</AppText>
            <AppText variant="body">使用 mock 定位确认你已到达附近。当前阶段不请求真实 GPS，也不上传真实照片。</AppText>
            <AppButton
              label="确认点亮"
              icon={<Sparkles size={18} color={theme.colors.mapDarkAlt} />}
              fullWidth
              onPress={() => {
                if (selectedSpot) {
                  lightUpSpot(selectedSpot.id);
                }
                setSuccessSpot(selectedSpot);
                setSelectedSpot(null);
              }}
            />
            <AppButton label="稍后再说" variant="ghost" fullWidth onPress={() => setSelectedSpot(null)} />
          </AppCard>
        </View>
      </Modal>
      <Modal visible={Boolean(successSpot)} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <AppCard variant="dark" style={styles.modal}>
            <View style={styles.successNode}>
              <Check size={48} color={theme.colors.mapDarkAlt} />
            </View>
            <AppText variant="title" color={theme.colors.white} style={styles.center}>点亮成功</AppText>
            <AppText variant="body" color="#D8D4F4" style={styles.center}>
              你点亮了 杭州 · {successSpot?.name}，新的旅行光点已加入地图。
            </AppText>
            <StatusChip label="解锁新徽章：西湖初印象" tone="gold" />
            <AppButton label="继续点亮" fullWidth onPress={() => setSuccessSpot(null)} />
          </AppCard>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  scanZone: {
    alignItems: 'center',
    backgroundColor: 'rgba(183,156,255,0.16)',
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
  },
  orbit: {
    alignItems: 'center',
    backgroundColor: theme.colors.mint,
    borderRadius: 999,
    height: 88,
    justifyContent: 'center',
    width: 88,
    ...theme.shadow.glow,
  },
  cityCard: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  list: {
    gap: theme.spacing.md,
  },
  search: {
    marginTop: theme.spacing.lg,
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(17,20,39,0.62)',
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  modal: {
    gap: theme.spacing.lg,
    width: '100%',
  },
  successNode: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: theme.colors.mint,
    borderRadius: 999,
    height: 128,
    justifyContent: 'center',
    width: 128,
    ...theme.shadow.glow,
  },
  center: {
    textAlign: 'center',
  },
});
