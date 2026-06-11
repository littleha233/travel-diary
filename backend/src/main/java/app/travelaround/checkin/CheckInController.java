package app.travelaround.checkin;

import app.travelaround.common.security.CurrentUser;
import app.travelaround.common.web.ApiResponse;
import app.travelaround.core.TravelStore;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/check-ins")
public class CheckInController {
    private final TravelStore store;

    public CheckInController(TravelStore store) {
        this.store = store;
    }

    @PostMapping
    ApiResponse<Map<String, Object>> create(@Valid @RequestBody CreateCheckInRequest request) {
        return ApiResponse.ok(store.createCheckIn(
            CurrentUser.id(),
            request.spotId(),
            request.tripId(),
            request.type(),
            request.moodText(),
            request.location(),
            request.photoIds() == null ? new ArrayList<>() : request.photoIds(),
            request.visitedAt(),
            request.clientRequestId()
        ));
    }

    record CreateCheckInRequest(
        @NotBlank String spotId,
        String tripId,
        String type,
        String visitedAt,
        String moodText,
        Map<String, Object> location,
        List<String> photoIds,
        String clientRequestId
    ) {
    }
}
