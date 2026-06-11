package app.travelaround.aimemory;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record AiMemoryDraft(
    String tripId,
    String title,
    String content,
    String summary,
    String shareText,
    String style,
    List<String> photoUrls,
    List<String> spotIds,
    String generatedAt,
    boolean safetyFallback
) {
    public Map<String, Object> toMap() {
        return Map.of(
            "tripId", tripId,
            "title", title,
            "content", content,
            "summary", summary,
            "shareText", shareText,
            "style", style,
            "photoUrls", photoUrls,
            "spotIds", spotIds,
            "generatedAt", generatedAt == null ? Instant.now().toString() : generatedAt,
            "safetyFallback", safetyFallback
        );
    }
}
