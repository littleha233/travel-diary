package app.travelaround.aimemory;

import app.travelaround.common.error.ApiException;
import app.travelaround.common.error.ErrorCode;
import app.travelaround.core.TravelStore;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class AiMemoryGenerationService {
    private static final List<String> UNSAFE_TERMS = List.of("自杀", "仇恨", "色情", "暴力", "违法", "毒品", "诈骗");
    private final TravelStore store;
    private final AiMemoryProvider provider;

    public AiMemoryGenerationService(TravelStore store, AiMemoryProvider provider) {
        this.store = store;
        this.provider = provider;
    }

    public AiMemoryDraft generate(String userId, String tripId, String style, String extraPrompt) {
        AiMemoryGenerateInput input = store.aiMemoryInput(userId, tripId, style, extraPrompt);
        if (containsUnsafeText(extraPrompt)) {
            return fallback(input, true);
        }

        RuntimeException lastError = null;
        for (int attempt = 0; attempt < 3; attempt += 1) {
            try {
                AiMemoryDraft draft = provider.generate(input);
                if (containsUnsafeText(draft.title()) || containsUnsafeText(draft.content()) || containsUnsafeText(draft.summary()) || containsUnsafeText(draft.shareText())) {
                    return fallback(input, true);
                }
                return draft;
            } catch (RuntimeException exception) {
                lastError = exception;
            }
        }

        throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR, "AI memory provider failed.", lastError == null ? null : lastError.getMessage());
    }

    private boolean containsUnsafeText(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }
        return UNSAFE_TERMS.stream().anyMatch(value::contains);
    }

    private AiMemoryDraft fallback(AiMemoryGenerateInput input, boolean safetyFallback) {
        String title = input.tripTitle() == null || input.tripTitle().isBlank() ? "这趟旅行的回忆" : input.tripTitle();
        String summary = "%s 至 %s，%d 天，%d 个景点，%d 张照片。".formatted(input.startDate(), input.endDate(), input.days(), input.spotNames().size(), input.photoCount());
        String content = "这趟旅行已经整理成一段安全的回忆草稿。"
            + "从" + String.join("、", input.cityNames()) + "出发，沿着" + String.join("、", input.spotNames())
            + "留下了真实的旅行足迹。你可以继续补充细节，让这段记忆更贴近当时的心情。";
        String shareText = title + "：新的旅行回忆已生成。";
        String resolvedStyle = input.style() == null || input.style().isBlank() ? "自然日记" : input.style();
        return new AiMemoryDraft(input.tripId(), title, content, summary, shareText, resolvedStyle, input.photoUrls(), input.spotIds(), Instant.now().toString(), safetyFallback);
    }
}
