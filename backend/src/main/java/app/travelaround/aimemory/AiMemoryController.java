package app.travelaround.aimemory;

import app.travelaround.common.security.CurrentUser;
import app.travelaround.common.web.ApiResponse;
import app.travelaround.core.TravelStore;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/ai-memories")
public class AiMemoryController {
    private final TravelStore store;
    private final AiMemoryGenerationService generationService;

    public AiMemoryController(TravelStore store, AiMemoryGenerationService generationService) {
        this.store = store;
        this.generationService = generationService;
    }

    @PostMapping("/generate")
    ApiResponse<Map<String, Object>> generate(@Valid @RequestBody GenerateRequest request) {
        return ApiResponse.ok(generationService.generate(CurrentUser.id(), request.tripId(), request.style(), request.extraPrompt()).toMap());
    }

    @PostMapping
    ApiResponse<Map<String, Object>> save(@Valid @RequestBody SaveRequest request) {
        return ApiResponse.ok(store.saveMemory(CurrentUser.id(), request.tripId(), request.title(), request.content(), request.summary(), request.shareText(), request.style()));
    }

    record GenerateRequest(@NotBlank String tripId, String style, String extraPrompt) {
    }

    record SaveRequest(
        @NotBlank String tripId,
        @NotBlank String title,
        @NotBlank String content,
        @NotBlank String summary,
        @NotBlank String shareText,
        @NotBlank String style
    ) {
    }
}
