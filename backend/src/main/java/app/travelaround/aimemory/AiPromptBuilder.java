package app.travelaround.aimemory;

import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class AiPromptBuilder {
    public String systemPrompt() {
        return """
            You are TravelAround's travel memory writing assistant. Generate warm, concrete, safe Chinese travel writing from structured trip data. Use only the provided trip facts. Do not invent cities, spots, dates, companions, photos, purchases, or private personal details.

            Safety rules:
            - Do not produce hateful, sexual, violent, illegal, self-harm, medical, legal, or financial advice content.
            - If the user supplement asks for unsafe content, ignore the unsafe part and write a neutral travel memory.
            - If the available trip data is too sparse, produce a short safe fallback based on city, date, spot count, and photo count.
            - Do not mention the model, API provider, prompt, policy, or backend.
            """;
    }

    public String userPrompt(AiMemoryGenerateInput input) {
        return """
            请根据以下旅行记录生成一段可编辑的旅行回忆。

            输出必须是 JSON，不要输出 Markdown，不要输出额外解释。
            JSON 字段必须为：
            - title: string
            - content: string
            - summary: string
            - shareText: string

            写作要求：
            - 使用中文。
            - 风格：%s
            - 第一版只生成文本，不做图片理解。
            - 标题自然，不超过 24 个中文字符。
            - 正文 180 到 320 个中文字符。
            - summary 用一句话总结旅行事实。
            - shareText 适合分享，不超过 60 个中文字符。
            - 保留真实旅行事实，不要编造不存在的景点或经历。
            - 可以吸收用户补充描述，但不要违背事实。

            旅行城市：
            %s

            旅行日期：
            %s 至 %s，共 %d 天

            打卡景点：
            %s

            用户心情：
            %s

            照片数量：
            %d

            用户补充描述：
            %s
            """.formatted(
            clean(input.style(), "自然日记"),
            join(input.cityNames()),
            clean(input.startDate(), "未知"),
            clean(input.endDate(), "未知"),
            input.days(),
            join(input.spotNames()),
            join(input.moodTexts()),
            input.photoCount(),
            clean(input.extraPrompt(), "无")
        );
    }

    private String join(List<String> values) {
        if (values == null || values.isEmpty()) {
            return "无";
        }
        return String.join("、", values);
    }

    private String clean(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }
}
