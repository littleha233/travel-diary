package app.travelaround.plan;

import app.travelaround.common.security.CurrentUser;
import app.travelaround.common.web.ApiResponse;
import app.travelaround.core.TravelStore;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/plans")
public class PlanController {
    private final TravelStore store;

    public PlanController(TravelStore store) {
        this.store = store;
    }

    @GetMapping
    ApiResponse<List<Map<String, Object>>> plans() {
        List<Map<String, Object>> items = store.listPlans(CurrentUser.id());
        return ApiResponse.page(items, 1, items.size(), items.size());
    }

    @GetMapping("/{planId}")
    ApiResponse<Map<String, Object>> plan(@PathVariable String planId) {
        return ApiResponse.ok(Map.of("plan", store.plan(CurrentUser.id(), planId)));
    }

    @PostMapping("/weekend-template")
    ApiResponse<Map<String, Object>> weekendTemplate() {
        return ApiResponse.ok(store.createWeekendPlan(CurrentUser.id()));
    }

    @DeleteMapping("/{planId}")
    ApiResponse<Map<String, Object>> delete(@PathVariable String planId) {
        return ApiResponse.ok(store.deletePlan(CurrentUser.id(), planId));
    }
}
