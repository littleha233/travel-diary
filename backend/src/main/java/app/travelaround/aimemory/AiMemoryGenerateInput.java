package app.travelaround.aimemory;

import java.util.List;

public record AiMemoryGenerateInput(
    String tripId,
    String tripTitle,
    List<String> cityNames,
    String startDate,
    String endDate,
    int days,
    List<String> spotNames,
    List<String> moodTexts,
    int photoCount,
    List<String> photoUrls,
    List<String> spotIds,
    String style,
    String extraPrompt
) {
}
