import { useMemo, useState } from 'react';
import { Image, Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Check, CircleAlert, ImagePlus, LocateFixed, MapPin, Navigation, PencilLine, RotateCcw, Sparkles, X } from 'lucide-react-native';
import { AppButton, AppCard, AppText, EmptyState, ErrorState, LoadingState, Screen, SectionHeader, SpotCard, StatusChip } from '@/components';
import { useTravelStore } from '@/store/travelStore';
import { GeoPoint, Spot } from '@/types/spot';
import { formatDistance, getDistanceMeters } from '@/utils/geo';
import { theme } from '@/theme/theme';

type CapabilityStatus = 'idle' | 'requesting' | 'granted' | 'limited' | 'denied' | 'failed' | 'unsupported';

type LocatedSpot = Spot & {
  computedDistanceLabel: string;
  computedDistanceMeters?: number;
  isWithinRadius: boolean;
};

type SelectedPhoto = {
  uri: string;
  cachedUri?: string;
  fileName?: string;
};

const locationTimeoutMs = 12000;

function withLocationTimeout<T>(promise: Promise<T>) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('定位超时，请稍后重试或手动补卡。')), locationTimeoutMs);
    }),
  ]);
}

function getPhotoExtension(asset: ImagePicker.ImagePickerAsset) {
  const sourceName = asset.fileName || asset.uri.split('?')[0];
  const extension = sourceName.match(/\.(heic|heif|jpg|jpeg|png|webp)$/i)?.[0];

  return extension ? extension.toLowerCase() : '.jpg';
}

async function cachePickedPhoto(asset: ImagePicker.ImagePickerAsset) {
  if (Platform.OS === 'web') {
    return asset.uri;
  }

  if (!FileSystem.documentDirectory) {
    return asset.uri;
  }

  const cacheDir = `${FileSystem.documentDirectory}travelaround-checkins/`;
  await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true }).catch(() => undefined);

  const fileName = `checkin-${Date.now()}-${Math.random().toString(36).slice(2)}${getPhotoExtension(asset)}`;
  const cachedUri = `${cacheDir}${fileName}`;
  await FileSystem.copyAsync({ from: asset.uri, to: cachedUri });

  return cachedUri;
}

function createLocatedSpots(spots: Spot[], currentLocation: GeoPoint | null): LocatedSpot[] {
  return spots
    .map((spot) => {
      if (!currentLocation) {
        return {
          ...spot,
          computedDistanceLabel: spot.distance,
          computedDistanceMeters: undefined,
          isWithinRadius: false,
        };
      }

      const computedDistanceMeters = getDistanceMeters(currentLocation, spot.coordinates);

      return {
        ...spot,
        computedDistanceLabel: formatDistance(computedDistanceMeters),
        computedDistanceMeters,
        isWithinRadius: computedDistanceMeters <= spot.radius,
      };
    })
    .sort((a, b) => (a.computedDistanceMeters ?? Number.MAX_SAFE_INTEGER) - (b.computedDistanceMeters ?? Number.MAX_SAFE_INTEGER));
}

export default function CheckInScreen() {
  const { status, errorMessage, cities, spots, lightUpSpot } = useTravelStore((state) => ({
    status: state.status,
    errorMessage: state.errorMessage,
    cities: state.cities,
    spots: state.spots,
    lightUpSpot: state.lightUpSpot,
  }));
  const [currentLocation, setCurrentLocation] = useState<GeoPoint | null>(null);
  const [locationStatus, setLocationStatus] = useState<CapabilityStatus>('idle');
  const [locationMessage, setLocationMessage] = useState('点击定位后，TravelAround 会请求一次前台定位权限。');
  const [photoStatus, setPhotoStatus] = useState<CapabilityStatus>('idle');
  const [photoMessage, setPhotoMessage] = useState('照片可选；跳过后也能完成纯文字打卡。');
  const [selectedSpot, setSelectedSpot] = useState<LocatedSpot | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<SelectedPhoto | null>(null);
  const [note, setNote] = useState('');
  const [isPickingPhoto, setIsPickingPhoto] = useState(false);
  const [previewPhotoUri, setPreviewPhotoUri] = useState<string | null>(null);
  const [successSpot, setSuccessSpot] = useState<LocatedSpot | null>(null);

  const locatedSpots = useMemo(() => createLocatedSpots(spots, currentLocation), [currentLocation, spots]);
  const nearbySpots = locatedSpots.filter((spot) => spot.status !== 'lit' && spot.isWithinRadius);
  const manualSpots = locatedSpots.filter((spot) => spot.status !== 'lit').slice(0, 6);
  const nearestCity = currentLocation
    ? cities.find((city) => city.id === locatedSpots[0]?.cityId)
    : cities.find((city) => city.id === 'hangzhou');
  const scanLabel = currentLocation
    ? nearbySpots.length
      ? `发现 ${nearbySpots.length} 个探索点 · ${nearestCity?.name ?? '当前位置'}`
      : `当前位置附近暂无 mock 景点 · 可手动补卡`
    : '尚未扫描当前位置';

  const requestLocation = async () => {
    setLocationStatus('requesting');
    setLocationMessage('正在请求前台定位权限...');

    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.geolocation) {
        setLocationStatus('unsupported');
        setLocationMessage('当前浏览器不支持定位能力，可以继续使用手动补卡。');
        return;
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setLocationStatus('denied');
        setLocationMessage(permission.canAskAgain ? '定位权限已拒绝，可以再次尝试或手动补卡。' : '定位权限已被系统限制，请到设置中开启；现在仍可手动补卡。');
        return;
      }

      if (Platform.OS !== 'web') {
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          setLocationStatus('failed');
          setLocationMessage('系统定位服务未开启，请开启后重试，或先手动补卡。');
          return;
        }
      }

      setLocationMessage('正在读取当前位置...');
      const position = await withLocationTimeout(
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
      );
      const nextLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setCurrentLocation(nextLocation);
      setLocationStatus('granted');
      setLocationMessage(`定位成功：${nextLocation.latitude.toFixed(4)}, ${nextLocation.longitude.toFixed(4)}。`);
    } catch (error) {
      setLocationStatus('failed');
      setLocationMessage(error instanceof Error ? error.message : '定位失败，请稍后重试或手动补卡。');
    }
  };

  const openCheckInModal = (spot: LocatedSpot) => {
    setSelectedSpot(spot);
    setSelectedPhoto(null);
    setNote('');
    setPhotoStatus('idle');
    setPhotoMessage('照片可选；跳过后也能完成纯文字打卡。');
  };

  const pickPhoto = async () => {
    setIsPickingPhoto(true);
    setPhotoStatus('requesting');
    setPhotoMessage('正在请求相册权限...');

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync(false);
      if (!permission.granted) {
        setPhotoStatus('denied');
        setPhotoMessage(permission.canAskAgain ? '相册权限已拒绝，本次可以不选照片继续打卡。' : '相册权限已被系统限制，请到设置中开启；本次可纯文字打卡。');
        return;
      }

      setPhotoStatus(permission.accessPrivileges === 'limited' ? 'limited' : 'granted');
      setPhotoMessage(permission.accessPrivileges === 'limited' ? '当前只能访问部分照片，仍可选择已授权的图片。' : '相册权限已允许，可以选择一张旅行照片。');

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        mediaTypes: ['images'],
        quality: 0.85,
      });

      if (result.canceled || !result.assets[0]) {
        setPhotoMessage('没有选择照片，可以继续纯文字打卡。');
        return;
      }

      const asset = result.assets[0];
      const cachedUri = await cachePickedPhoto(asset).catch(() => undefined);
      setSelectedPhoto({
        uri: asset.uri,
        cachedUri,
        fileName: asset.fileName ?? undefined,
      });
      setPhotoMessage(cachedUri && cachedUri !== asset.uri ? '照片已缓存到本地沙盒，打卡时会记录缓存路径。' : '照片已选择，可预览或移除。');
    } catch (error) {
      setPhotoStatus('failed');
      setPhotoMessage(error instanceof Error ? error.message : '相册打开失败，本次可以继续纯文字打卡。');
    } finally {
      setIsPickingPhoto(false);
    }
  };

  const confirmCheckIn = () => {
    if (!selectedSpot) {
      return;
    }

    const checkInType = currentLocation && selectedSpot.isWithinRadius ? 'gps' : 'manual';
    lightUpSpot(selectedSpot.id, {
      type: checkInType,
      moodText: note,
      photoUri: selectedPhoto?.uri,
      cachedPhotoUri: selectedPhoto?.cachedUri,
      location: currentLocation ?? undefined,
      distanceMeters: selectedSpot.computedDistanceMeters,
    });
    setSuccessSpot(selectedSpot);
    setSelectedSpot(null);
  };

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
          <AppText variant="caption" color="#C7C4EA">定位、照片和手动补卡都只保存在本地</AppText>
        </View>
        <Pressable style={styles.iconButton} onPress={requestLocation} disabled={locationStatus === 'requesting'}>
          {locationStatus === 'requesting' ? <RotateCcw size={22} color={theme.colors.mintLight} /> : <LocateFixed size={22} color={theme.colors.mintLight} />}
        </Pressable>
      </View>

      <View style={styles.scanZone}>
        <View style={styles.orbit}>
          <MapPin size={32} color={theme.colors.mapDarkAlt} />
        </View>
        <AppText variant="h3" color={theme.colors.white}>
          {locationStatus === 'requesting' ? '正在扫描附近可点亮地点' : '扫描附近可点亮地点'}
        </AppText>
        <AppText variant="caption" color="#C7C4EA" style={styles.center}>{scanLabel}</AppText>
        <AppButton
          label={locationStatus === 'granted' ? '重新定位' : '开始定位'}
          icon={<Navigation size={17} color={theme.colors.mapDarkAlt} />}
          onPress={requestLocation}
          fullWidth
          disabled={locationStatus === 'requesting'}
        />
      </View>

      <AppCard variant="dark" style={styles.permissionCard}>
        <View style={styles.permissionTitle}>
          <StatusChip
            label={
              locationStatus === 'granted'
                ? '定位已开启'
                : locationStatus === 'idle'
                  ? '未请求定位'
                  : locationStatus === 'requesting'
                    ? '请求中'
                    : '可手动补卡'
            }
            tone={locationStatus === 'granted' ? 'mint' : 'gold'}
          />
          {locationStatus === 'denied' || locationStatus === 'failed' || locationStatus === 'unsupported' ? (
            <CircleAlert size={18} color={theme.colors.gold} />
          ) : null}
        </View>
        <AppText variant="body" color="#D8D4F4">{locationMessage}</AppText>
      </AppCard>

      <AppCard variant="dark" style={styles.cityCard}>
        <View>
          <AppText variant="h3" color={theme.colors.white}>当前城市识别：{nearestCity?.name ?? '未识别'}</AppText>
          <AppText variant="caption" color="#C7C4EA">{currentLocation ? '基于最近 mock 景点推断' : '定位后会按距离重新识别'}</AppText>
        </View>
        <StatusChip label={currentLocation ? '已扫描' : '待定位'} tone={currentLocation ? 'mint' : 'gray'} />
      </AppCard>

      <SectionHeader title="可点亮地点" dark />
      {locationStatus === 'requesting' ? (
        <LoadingState label="正在读取系统定位..." />
      ) : nearbySpots.length ? (
        <View style={styles.list}>
          {nearbySpots.map((spot) => (
            <SpotCard
              key={spot.id}
              spot={{ ...spot, distance: spot.computedDistanceLabel, canCheckIn: true, status: spot.status === 'wishlist' ? 'available' : spot.status }}
              onLightUp={() => openCheckInModal(spot)}
            />
          ))}
        </View>
      ) : (
        <EmptyState
          title={currentLocation ? '附近暂无可点亮地点' : '还没有定位扫描'}
          message={currentLocation ? '当前位置没有落入 mock 景点半径，仍然可以手动补卡。' : '点击定位后会计算你和 mock 景点的距离；也可以直接手动补卡。'}
          action={currentLocation ? '重新定位' : '开始定位'}
          onAction={requestLocation}
        />
      )}

      <SectionHeader title="手动补卡" action="无需定位权限" dark />
      <View style={styles.manualList}>
        {manualSpots.map((spot) => (
          <AppCard key={spot.id} variant="dark" style={styles.manualRow}>
            <View style={styles.manualInfo}>
              <AppText variant="h3" color={theme.colors.white}>{spot.name}</AppText>
              <AppText variant="caption" color="#C7C4EA">
                {spot.computedDistanceLabel} · {spot.tags.join(' / ')}
              </AppText>
            </View>
            <AppButton
              label="补卡"
              variant="secondary"
              icon={<PencilLine size={15} color={theme.colors.text} />}
              onPress={() => openCheckInModal(spot)}
            />
          </AppCard>
        ))}
      </View>

      <Modal visible={Boolean(selectedSpot)} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <AppCard style={styles.modal}>
            <View style={styles.modalHeader}>
              <StatusChip label={selectedSpot?.isWithinRadius ? 'GPS 打卡' : '手动补卡'} />
              <Pressable onPress={() => setSelectedSpot(null)} style={styles.closeButton}>
                <X size={18} color={theme.colors.text} />
              </Pressable>
            </View>
            <AppText variant="h2">{selectedSpot?.name}</AppText>
            <AppText variant="body">
              {selectedSpot?.isWithinRadius
                ? `已进入 ${selectedSpot.radius}m 打卡半径，距离约 ${selectedSpot.computedDistanceLabel}。`
                : '未使用定位或不在打卡半径内，本次将作为手动补卡保存。'}
            </AppText>

            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="写一句此刻的旅行心情（可选）"
              placeholderTextColor={theme.colors.muted}
              multiline
              style={styles.noteInput}
            />

            <View style={styles.photoBox}>
              <View style={styles.photoBoxHeader}>
                <View>
                  <AppText variant="h3">打卡照片</AppText>
                  <AppText variant="caption">{photoMessage}</AppText>
                </View>
                <StatusChip label={photoStatus === 'denied' ? '已跳过' : selectedPhoto ? '已选择' : '可选'} tone={selectedPhoto ? 'mint' : 'gray'} />
              </View>
              {selectedPhoto ? (
                <Pressable onPress={() => setPreviewPhotoUri(selectedPhoto.cachedUri ?? selectedPhoto.uri)} style={styles.photoPreview}>
                  <Image source={{ uri: selectedPhoto.cachedUri ?? selectedPhoto.uri }} style={styles.photoImage} />
                  <View style={styles.photoActions}>
                    <AppText variant="caption" color={theme.colors.white}>点击预览</AppText>
                    <Pressable onPress={() => setSelectedPhoto(null)} style={styles.removePhoto}>
                      <X size={16} color={theme.colors.white} />
                    </Pressable>
                  </View>
                </Pressable>
              ) : null}
              <AppButton
                label={selectedPhoto ? '更换照片' : '选择照片'}
                variant="secondary"
                icon={<ImagePlus size={17} color={theme.colors.text} />}
                onPress={pickPhoto}
                disabled={isPickingPhoto}
                fullWidth
              />
            </View>

            <AppButton
              label={selectedSpot?.isWithinRadius ? '确认点亮' : '完成补卡'}
              icon={<Sparkles size={18} color={theme.colors.mapDarkAlt} />}
              fullWidth
              onPress={confirmCheckIn}
            />
            <AppButton label="稍后再说" variant="ghost" fullWidth onPress={() => setSelectedSpot(null)} />
          </AppCard>
        </View>
      </Modal>

      <Modal visible={Boolean(previewPhotoUri)} transparent animationType="fade">
        <View style={styles.previewBackdrop}>
          <Pressable onPress={() => setPreviewPhotoUri(null)} style={styles.previewClose}>
            <X size={22} color={theme.colors.white} />
          </Pressable>
          {previewPhotoUri ? <Image source={{ uri: previewPhotoUri }} style={styles.previewImage} resizeMode="contain" /> : null}
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
              你点亮了 {nearestCity?.name ?? '旅行地图'} · {successSpot?.name}，记录已保存在本地。
            </AppText>
            <StatusChip label={successSpot?.isWithinRadius ? 'GPS 打卡已保存' : '手动补卡已保存'} tone="gold" />
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
  iconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.16)',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
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
  permissionCard: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  permissionTitle: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  manualList: {
    gap: theme.spacing.md,
  },
  manualRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  manualInfo: {
    flex: 1,
    gap: theme.spacing.xs,
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
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(142,148,184,0.12)',
    borderRadius: theme.radius.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  noteInput: {
    backgroundColor: 'rgba(183,156,255,0.1)',
    borderColor: theme.colors.line,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.text,
    minHeight: 86,
    padding: theme.spacing.md,
    textAlignVertical: 'top',
    ...theme.typography.body,
  },
  photoBox: {
    backgroundColor: theme.colors.surfaceWarm,
    borderColor: 'rgba(183,156,255,0.14)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    gap: theme.spacing.md,
    padding: theme.spacing.md,
  },
  photoBoxHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  photoPreview: {
    borderRadius: theme.radius.md,
    height: 176,
    overflow: 'hidden',
  },
  photoImage: {
    height: '100%',
    width: '100%',
  },
  photoActions: {
    alignItems: 'center',
    backgroundColor: 'rgba(17,20,39,0.42)',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    padding: theme.spacing.sm,
    position: 'absolute',
    right: 0,
  },
  removePhoto: {
    alignItems: 'center',
    backgroundColor: 'rgba(17,20,39,0.56)',
    borderRadius: theme.radius.pill,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  previewBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(17,20,39,0.9)',
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  previewClose: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: theme.radius.pill,
    height: 44,
    justifyContent: 'center',
    position: 'absolute',
    right: theme.spacing.xl,
    top: theme.spacing.xxl,
    width: 44,
    zIndex: theme.zIndex.modal,
  },
  previewImage: {
    height: '82%',
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
