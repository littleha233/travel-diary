package app.travelaround.place;

import app.travelaround.common.security.CurrentUser;
import app.travelaround.common.web.ApiResponse;
import app.travelaround.core.TravelStore;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1")
public class PlaceController {
    private final TravelStore store;

    public PlaceController(TravelStore store) {
        this.store = store;
    }

    @GetMapping("/cities")
    ApiResponse<List<Map<String, Object>>> cities(
        @RequestParam(required = false, defaultValue = "all") String status,
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false, defaultValue = "1") int page,
        @RequestParam(required = false, defaultValue = "100") int pageSize
    ) {
        List<Map<String, Object>> items = store.listCities(CurrentUser.id(), status, keyword);
        return ApiResponse.page(page(items, page, pageSize), page, pageSize, items.size());
    }

    @GetMapping("/cities/{cityId}")
    ApiResponse<Map<String, Object>> city(@PathVariable String cityId) {
        return ApiResponse.ok(Map.of("city", store.city(CurrentUser.id(), cityId)));
    }

    @GetMapping("/spots")
    ApiResponse<List<Map<String, Object>>> spots(
        @RequestParam(required = false) String cityId,
        @RequestParam(required = false, defaultValue = "all") String status,
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false, defaultValue = "1") int page,
        @RequestParam(required = false, defaultValue = "100") int pageSize
    ) {
        List<Map<String, Object>> items = store.listSpots(CurrentUser.id(), cityId, status, keyword);
        return ApiResponse.page(page(items, page, pageSize), page, pageSize, items.size());
    }

    @GetMapping("/spots/{spotId}")
    ApiResponse<Map<String, Object>> spot(@PathVariable String spotId) {
        return ApiResponse.ok(Map.of("spot", store.spot(CurrentUser.id(), spotId)));
    }

    @GetMapping("/spots/nearby")
    ApiResponse<List<Map<String, Object>>> nearby(
        @RequestParam double latitude,
        @RequestParam double longitude,
        @RequestParam(required = false, defaultValue = "5000") int radiusMeters
    ) {
        return ApiResponse.ok(store.nearbySpots(CurrentUser.id(), latitude, longitude, radiusMeters));
    }

    private List<Map<String, Object>> page(List<Map<String, Object>> items, int page, int pageSize) {
        int safePage = Math.max(page, 1);
        int safeSize = Math.min(Math.max(pageSize, 1), 100);
        int from = Math.min((safePage - 1) * safeSize, items.size());
        int to = Math.min(from + safeSize, items.size());
        return items.subList(from, to);
    }
}
