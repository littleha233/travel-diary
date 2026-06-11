package app.travelaround.aimemory;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import org.springframework.stereotype.Component;

@Component
public class AiDraftParser {
    private final ObjectMapper objectMapper;

    public AiDraftParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public AiMemoryDraft parse(String raw, AiMemoryGenerateInput input) {
        try {
            JsonNode json = objectMapper.readTree(extractJson(raw));
            String style = input.style() == null || input.style().isBlank() ? "自然日记" : input.style();
            return new AiMemoryDraft(
                input.tripId(),
                text(json, "title", "这趟旅行的回忆"),
                text(json, "content", "这趟旅行已经整理成回忆草稿，你可以继续编辑后保存。"),
                text(json, "summary", "%s 至 %s，%d 天旅行回忆。".formatted(input.startDate(), input.endDate(), input.days())),
                text(json, "shareText", (input.tripTitle() == null ? "旅行" : input.tripTitle()) + " 已生成一段新的旅行回忆。"),
                style,
                input.photoUrls(),
                input.spotIds(),
                Instant.now().toString(),
                false
            );
        } catch (Exception exception) {
            throw new AiMemoryProviderException("AI provider returned malformed draft JSON.", exception);
        }
    }

    private String extractJson(String raw) {
        if (raw == null) {
            throw new AiMemoryProviderException("AI provider returned empty content.");
        }
        String trimmed = raw.trim();
        int start = trimmed.indexOf('{');
        int end = trimmed.lastIndexOf('}');
        if (start < 0 || end < start) {
            throw new AiMemoryProviderException("AI provider content does not contain JSON.");
        }
        return trimmed.substring(start, end + 1);
    }

    private String text(JsonNode json, String field, String fallback) {
        String value = json.path(field).asText("");
        return value.isBlank() ? fallback : value.trim();
    }
}
