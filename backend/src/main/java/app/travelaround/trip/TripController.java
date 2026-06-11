package app.travelaround.trip;

import app.travelaround.common.security.CurrentUser;
import app.travelaround.common.web.ApiResponse;
import app.travelaround.core.TravelStore;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/trips")
public class TripController {
    private final TravelStore store;

    public TripController(TravelStore store) {
        this.store = store;
    }

    @GetMapping
    ApiResponse<List<Map<String, Object>>> trips(
        @RequestParam(required = false, defaultValue = "1") int page,
        @RequestParam(required = false, defaultValue = "100") int pageSize
    ) {
        List<Map<String, Object>> items = store.listTrips(CurrentUser.id());
        int from = Math.min((Math.max(page, 1) - 1) * Math.max(pageSize, 1), items.size());
        int to = Math.min(from + Math.min(Math.max(pageSize, 1), 100), items.size());
        return ApiResponse.page(items.subList(from, to), page, pageSize, items.size());
    }

    @GetMapping("/{tripId}")
    ApiResponse<Map<String, Object>> trip(@PathVariable String tripId) {
        return ApiResponse.ok(store.tripDetail(CurrentUser.id(), tripId));
    }

    @PostMapping
    ApiResponse<Map<String, Object>> createTrip(@Valid @RequestBody CreateTripRequest request) {
        return ApiResponse.ok(store.createTrip(CurrentUser.id(), request.title(), request.cityId(), request.startDate(), request.endDate(), request.visibility()));
    }

    record CreateTripRequest(@NotBlank String title, @NotBlank String cityId, @NotBlank String startDate, @NotBlank String endDate, String visibility) {
    }
}
