package app.travelaround.aimemory;

import java.time.Instant;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "travelaround.ai.provider", havingValue = "mock", matchIfMissing = true)
public class MockAiMemoryProvider implements AiMemoryProvider {
    @Override
    public AiMemoryDraft generate(AiMemoryGenerateInput input) {
        String title = input.tripTitle() == null || input.tripTitle().isBlank() ? "这趟旅行的回忆" : "AI 旅行回忆：" + input.tripTitle();
        String style = input.style() == null || input.style().isBlank() ? "自然日记" : input.style();
        String content = "这是一段由后端 AI Provider 生成的旅行回忆草稿。当前 provider 为 mock。你可以继续编辑后保存。"
            + (input.extraPrompt() == null || input.extraPrompt().isBlank() ? "" : " 补充要求：" + input.extraPrompt());
        String summary = "%s 至 %s，%d 天，%d 个景点，%d 张照片。".formatted(input.startDate(), input.endDate(), input.days(), input.spotNames().size(), input.photoCount());
        String shareText = (input.tripTitle() == null || input.tripTitle().isBlank() ? "旅行" : input.tripTitle()) + " 已生成一段新的旅行回忆。";

        return new AiMemoryDraft(input.tripId(), title, content, summary, shareText, style, input.photoUrls(), input.spotIds(), Instant.now().toString(), false);
    }
}
