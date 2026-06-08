import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { Save, Sparkles } from 'lucide-react-native';
import {
  AppButton,
  AppCard,
  AppText,
  DetailHeader,
  ErrorState,
  PhotoGrid,
  Screen,
  SectionHeader,
  StatusChip,
} from '@/components';
import { AIMemoryDraft } from '@/services/types';
import { useTravelStore } from '@/store/travelStore';
import { theme } from '@/theme/theme';

const styleOptions = ['自然日记', '朋友圈文案', '小红书风格', '文艺风格', '简洁总结'];

export default function AIMemoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { aiMemories, errorMessage, generateAIMemoryDraft, saveAIMemory, trips } = useTravelStore(
    useShallow((state) => ({
      aiMemories: state.aiMemories,
      errorMessage: state.errorMessage,
      generateAIMemoryDraft: state.generateAIMemoryDraft,
      saveAIMemory: state.saveAIMemory,
      trips: state.trips,
    }))
  );
  const trip = trips.find((item) => item.id === id);
  const memory = aiMemories.find((item) => item.id === id) ?? aiMemories.find((item) => item.tripId === trip?.id);
  const activeTrip = trip ?? trips.find((item) => item.id === memory?.tripId);
  const photoUrls = memory?.photoUrls ?? activeTrip?.photoUrls ?? [];
  const [style, setStyle] = useState(memory?.style ?? '自然日记');
  const [extraPrompt, setExtraPrompt] = useState('');
  const [title, setTitle] = useState(memory?.title ?? '');
  const [content, setContent] = useState(memory?.content ?? '');
  const [summary, setSummary] = useState(memory?.summary ?? '');
  const [shareText, setShareText] = useState(memory?.shareText ?? '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generationError, setGenerationError] = useState<string>();
  const [safetyFallback, setSafetyFallback] = useState(false);

  useEffect(() => {
    setStyle(memory?.style ?? '自然日记');
    setTitle(memory?.title ?? '');
    setContent(memory?.content ?? '');
    setSummary(memory?.summary ?? '');
    setShareText(memory?.shareText ?? '');
    setSafetyFallback(false);
  }, [memory?.content, memory?.id, memory?.shareText, memory?.style, memory?.summary, memory?.title]);

  const canSave = Boolean(activeTrip && title.trim() && content.trim() && summary.trim() && shareText.trim());
  const statusLabel = useMemo(() => {
    if (isGenerating) {
      return '后端代理生成中';
    }
    if (generationError) {
      return '生成失败，可重试';
    }
    if (title.trim()) {
      return safetyFallback ? '已生成安全兜底草稿' : '已生成可编辑草稿';
    }
    return '等待生成';
  }, [generationError, isGenerating, safetyFallback, title]);

  if (!memory && !trip) {
    return (
      <Screen dark>
        <DetailHeader title="AI 回忆" dark />
        <ErrorState title="没有找到这段回忆" />
      </Screen>
    );
  }

  const applyDraft = (draft: AIMemoryDraft) => {
    setTitle(draft.title);
    setContent(draft.content);
    setSummary(draft.summary);
    setShareText(draft.shareText);
    setStyle(draft.style);
    setSafetyFallback(Boolean(draft.safetyFallback));
  };

  const buildDraftFromForm = (): AIMemoryDraft | undefined => {
    if (!activeTrip) {
      return undefined;
    }

    return {
      tripId: activeTrip.id,
      title: title.trim(),
      content: content.trim(),
      summary: summary.trim(),
      shareText: shareText.trim(),
      style,
      photoUrls: activeTrip.photoUrls,
      spotIds: activeTrip.spotIds,
      generatedAt: memory?.generatedAt ?? new Date().toISOString(),
    };
  };

  const handleGenerate = async () => {
    if (!activeTrip || isGenerating) {
      return;
    }

    setIsGenerating(true);
    setGenerationError(undefined);

    const draft = await generateAIMemoryDraft({
      tripId: activeTrip.id,
      style,
      extraPrompt,
    });

    if (draft) {
      applyDraft(draft);
    } else {
      setGenerationError(
        useTravelStore.getState().errorMessage ?? errorMessage ?? 'AI 回忆生成失败，请保留输入后重试。'
      );
    }

    setIsGenerating(false);
  };

  const handleSave = async () => {
    const draft = buildDraftFromForm();
    if (!draft || !canSave || isSaving) {
      return;
    }

    setIsSaving(true);
    setGenerationError(undefined);
    const nextMemory = await saveAIMemory(draft);
    setIsSaving(false);

    if (nextMemory) {
      router.replace(`/ai-memory/${nextMemory.id}`);
    } else {
      setGenerationError(useTravelStore.getState().errorMessage ?? 'AI 回忆保存失败，请稍后重试。');
    }
  };

  return (
    <Screen dark>
      <DetailHeader title="生成 AI 回忆" subtitle="AI Memory · 把旅途整理成故事" dark />
      <AppCard variant="dark" style={styles.card}>
        <AppText variant="h3" color={theme.colors.white}>
          {activeTrip?.title ?? '杭州周末探索'}
        </AppText>
        <View style={styles.chips}>
          {[
            `${activeTrip?.spotIds.length ?? 0} 个景点`,
            `${activeTrip ? (activeTrip.photoCount ?? activeTrip.photoUrls.length) : photoUrls.length} 张照片`,
            `${activeTrip?.days ?? 0} 天行程`,
            memory?.style ?? '自然日记',
          ].map((label, index) => (
            <StatusChip key={label} label={label} tone={index === 0 ? 'mint' : 'gray'} />
          ))}
        </View>
        <PhotoGrid photos={photoUrls.slice(0, 3)} />
      </AppCard>
      <SectionHeader title="生成输入" dark />
      <AppCard variant="dark" style={styles.card}>
        <AppText variant="h3" color={theme.colors.white}>
          文案风格
        </AppText>
        <View style={styles.styleGrid}>
          {styleOptions.map((option) => {
            const selected = option === style;
            return (
              <Pressable
                key={option}
                onPress={() => setStyle(option)}
                style={[styles.styleOption, selected && styles.styleOptionActive]}
              >
                <AppText variant="caption" color={selected ? theme.colors.mapDarkAlt : theme.colors.white}>
                  {option}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        <Field
          label="补充描述"
          value={extraPrompt}
          onChangeText={setExtraPrompt}
          placeholder="比如：想突出断桥边的风、和朋友散步的轻松感。"
          dark
          minHeight={88}
        />
      </AppCard>
      <SectionHeader title="生成状态" dark />
      <AppCard variant="dark" style={styles.status}>
        <Sparkles size={30} color={theme.colors.mint} />
        <View>
          <AppText variant="h3" color={theme.colors.white}>
            {statusLabel}
          </AppText>
          <AppText variant="caption" color="#C7C4EA">
            {generationError ?? '前端只提交 tripId、style 和 extraPrompt，由后端代理生成文本。'}
          </AppText>
        </View>
      </AppCard>
      <SectionHeader title="生成结果" dark />
      <AppCard style={styles.paper}>
        <StatusChip label={safetyFallback ? '安全兜底' : '可编辑草稿'} />
        <Field label="标题" value={title} onChangeText={setTitle} placeholder="生成后可编辑标题" />
        <Field label="正文" value={content} onChangeText={setContent} placeholder="生成后可编辑正文" minHeight={150} />
        <Field
          label="旅行总结"
          value={summary}
          onChangeText={setSummary}
          placeholder="生成后可编辑总结"
          minHeight={80}
        />
        <Field
          label="分享文案"
          value={shareText}
          onChangeText={setShareText}
          placeholder="生成后可编辑分享文案"
          minHeight={80}
        />
      </AppCard>
      <View style={styles.actions}>
        <AppButton
          label={title ? '重新生成' : '生成 AI 回忆'}
          fullWidth
          disabled={isGenerating || isSaving}
          onPress={handleGenerate}
        />
        <AppButton
          label={isSaving ? '保存中' : '保存为 AI Memory'}
          variant="secondary"
          icon={<Save size={16} color={theme.colors.text} />}
          fullWidth
          disabled={!canSave || isGenerating || isSaving}
          onPress={handleSave}
        />
      </View>
    </Screen>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  dark = false,
  minHeight = 52,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  dark?: boolean;
  minHeight?: number;
}) {
  return (
    <View style={styles.field}>
      <AppText variant="caption" color={dark ? '#C7C4EA' : theme.colors.muted}>
        {label}
      </AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={dark ? 'rgba(255,255,255,0.44)' : theme.colors.muted}
        multiline
        textAlignVertical="top"
        style={[
          styles.input,
          dark && styles.inputDark,
          {
            minHeight,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  status: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  styleOption: {
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  styleOptionActive: {
    backgroundColor: theme.colors.mint,
    borderColor: theme.colors.mint,
  },
  paper: {
    gap: theme.spacing.md,
  },
  field: {
    gap: theme.spacing.sm,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderColor: theme.colors.line,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  inputDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.16)',
    color: theme.colors.white,
  },
  actions: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
});
