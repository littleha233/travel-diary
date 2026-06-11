package app.travelaround.user;

import app.travelaround.common.security.CurrentUser;
import app.travelaround.common.web.ApiResponse;
import app.travelaround.core.TravelStore;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/users")
public class UserController {
    private final TravelStore store;

    public UserController(TravelStore store) {
        this.store = store;
    }

    @GetMapping("/me")
    ApiResponse<Map<String, Object>> me() {
        return ApiResponse.ok(store.user(CurrentUser.id()));
    }
}
