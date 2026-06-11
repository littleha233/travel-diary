package app.travelaround.aimemory;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@ConditionalOnProperty(name = "travelaround.ai.provider", havingValue = "deepseek")
public class DeepSeekAiMemoryProvider implements AiMemoryProvider {
    private final RestClient restClient;
    private final AiPromptBuilder promptBuilder;
    private final AiDraftParser draftParser;
    private final String apiKey;
    private final String endpoint;
    private final String model;
    private final int maxTokens;

    public DeepSeekAiMemoryProvider(
        RestClient.Builder restClientBuilder,
        AiPromptBuilder promptBuilder,
        AiDraftParser draftParser,
        @Value("${travelaround.ai.api-key}") String apiKey,
        @Value("${travelaround.ai.endpoint}") String endpoint,
        @Value("${travelaround.ai.model}") String model,
        @Value("${travelaround.ai.max-tokens}") int maxTokens,
        @Value("${travelaround.ai.timeout-seconds}") long timeoutSeconds
    ) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(timeoutSeconds));
        requestFactory.setReadTimeout(Duration.ofSeconds(timeoutSeconds));
        this.restClient = restClientBuilder.requestFactory(requestFactory).build();
        this.promptBuilder = promptBuilder;
        this.draftParser = draftParser;
        this.apiKey = apiKey;
        this.endpoint = endpoint == null || endpoint.isBlank() ? "https://api.deepseek.com/chat/completions" : endpoint;
        this.model = model == null || model.isBlank() || model.startsWith("claude-") ? "deepseek-v4-flash" : model;
        this.maxTokens = maxTokens;
    }

    @Override
    public AiMemoryDraft generate(AiMemoryGenerateInput input) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new AiMemoryProviderException("DEEPSEEK_API_KEY is required when travelaround.ai.provider=deepseek.");
        }
        Map<String, Object> body = Map.of(
            "model", model,
            "max_tokens", maxTokens,
            "response_format", Map.of("type", "json_object"),
            "messages", List.of(
                Map.of("role", "system", "content", promptBuilder.systemPrompt()),
                Map.of("role", "user", "content", promptBuilder.userPrompt(input))
            )
        );

        JsonNode response = restClient.post()
            .uri(endpoint)
            .contentType(MediaType.APPLICATION_JSON)
            .header("Authorization", "Bearer " + apiKey)
            .body(body)
            .retrieve()
            .body(JsonNode.class);

        String content = response == null ? "" : response.path("choices").path(0).path("message").path("content").asText("");
        return draftParser.parse(content, input);
    }
}
