import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { AppButton, AppCard, AppText, DetailHeader, ErrorState, Screen, StatusChip } from '@/components';
import { CreateTripInput } from '@/services/types';
import { useTravelStore } from '@/store/travelStore';
import { theme } from '@/theme/theme';

const privacyOptions: CreateTripInput['privacy'][] = ['private', 'friends', 'public'];
const privacyLabels: Record<CreateTripInput['privacy'], string> = {
  private: '仅自己',
  friends: '好友可见',
  public: '公开',
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function CreateTripScreen() {
  const { cities, createTrip, errorMessage } = useTravelStore(
    useShallow((state) => ({
      cities: state.cities,
      createTrip: state.createTrip,
      errorMessage: state.errorMessage,
    }))
  );
  const [title, setTitle] = useState('');
  const [cityId, setCityId] = useState(cities[0]?.id ?? '');
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(today());
  const [privacy, setPrivacy] = useState<CreateTripInput['privacy']>('private');
  const [localError, setLocalError] = useState<string>();
  const selectedCity = cities.find((city) => city.id === cityId);
  const canSubmit = Boolean(title.trim() && cityId && startDate && endDate);
  const dateIsValid = useMemo(() => new Date(endDate).getTime() >= new Date(startDate).getTime(), [endDate, startDate]);

  const handleSubmit = async () => {
    setLocalError(undefined);

    if (!canSubmit) {
      setLocalError('请补全标题、城市和日期。');
      return;
    }
    if (!dateIsValid) {
      setLocalError('结束日期不能早于开始日期。');
      return;
    }

    const trip = await createTrip({
      title,
      cityId,
      startDate,
      endDate,
      privacy,
    });

    if (trip) {
      router.replace(`/trip/${trip.id}`);
      return;
    }

    setLocalError(useTravelStore.getState().errorMessage ?? errorMessage ?? '创建旅行失败，请稍后重试。');
  };

  return (
    <Screen>
      <DetailHeader title="创建旅行" subtitle="标题、城市、日期与隐私" />
      <AppCard style={styles.card}>
        <Field label="旅行标题" value={title} onChangeText={setTitle} placeholder="例如：杭州周末探索" />
        <View style={styles.field}>
          <AppText variant="caption">目的城市</AppText>
          <View style={styles.cityGrid}>
            {cities.slice(0, 12).map((city) => {
              const selected = city.id === cityId;
              return (
                <Pressable
                  key={city.id}
                  onPress={() => setCityId(city.id)}
                  style={[styles.cityOption, selected && styles.cityOptionActive]}
                >
                  <AppText variant="caption" color={selected ? theme.colors.mapDarkAlt : theme.colors.text}>
                    {city.name}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={styles.dateRow}>
          <Field label="开始日期" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" />
          <Field label="结束日期" value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" />
        </View>
        <View style={styles.field}>
          <AppText variant="caption">隐私</AppText>
          <View style={styles.privacyRow}>
            {privacyOptions.map((option) => {
              const selected = option === privacy;
              return (
                <Pressable
                  key={option}
                  onPress={() => setPrivacy(option)}
                  style={[styles.privacyOption, selected && styles.cityOptionActive]}
                >
                  <AppText variant="caption" color={selected ? theme.colors.mapDarkAlt : theme.colors.text}>
                    {privacyLabels[option]}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
        {selectedCity ? <StatusChip label={`${selectedCity.name} · ${selectedCity.province}`} tone="mint" /> : null}
        {localError ? <ErrorState title="无法创建旅行" message={localError} /> : null}
        <AppButton label="创建旅行记录" fullWidth onPress={handleSubmit} disabled={!canSubmit || !dateIsValid} />
      </AppCard>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.field}>
      <AppText variant="caption">{label}</AppText>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} style={styles.input} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.lg,
  },
  field: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderColor: theme.colors.line,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.text,
    minHeight: 48,
    paddingHorizontal: theme.spacing.md,
    ...theme.typography.body,
  },
  cityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  cityOption: {
    borderColor: theme.colors.line,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  cityOptionActive: {
    backgroundColor: theme.colors.mint,
    borderColor: theme.colors.mint,
  },
  dateRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  privacyRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  privacyOption: {
    borderColor: theme.colors.line,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
});
