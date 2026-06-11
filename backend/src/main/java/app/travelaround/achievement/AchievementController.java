package app.travelaround.achievement;

import app.travelaround.common.web.ApiResponse;
import app.travelaround.core.TravelStore;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/achievements")
public class AchievementController {
    private final TravelStore store;

    public AchievementController(TravelStore store) {
        this.store = store;
    }

    @GetMapping
    ApiResponse<Map<String, Object>> achievements() {
        return ApiResponse.ok(store.achievementsWithQuests());
    }
}
