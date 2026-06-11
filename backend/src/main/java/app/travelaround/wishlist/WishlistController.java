package app.travelaround.wishlist;

import app.travelaround.common.web.ApiResponse;
import app.travelaround.core.TravelStore;
import java.util.Map;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1")
public class WishlistController {
    private final TravelStore store;

    public WishlistController(TravelStore store) {
        this.store = store;
    }

    @PostMapping("/cities/{cityId}/manual-light")
    ApiResponse<Map<String, Object>> light(@PathVariable String cityId) {
        return ApiResponse.ok(store.manualLight(cityId, true));
    }

    @DeleteMapping("/cities/{cityId}/manual-light")
    ApiResponse<Map<String, Object>> unlight(@PathVariable String cityId) {
        return ApiResponse.ok(store.manualLight(cityId, false));
    }

    @PostMapping("/wishlist/cities/{cityId}")
    ApiResponse<Map<String, Object>> wishCity(@PathVariable String cityId) {
        return ApiResponse.ok(store.wishlistCity(cityId, true));
    }

    @DeleteMapping("/wishlist/cities/{cityId}")
    ApiResponse<Map<String, Object>> unwishCity(@PathVariable String cityId) {
        return ApiResponse.ok(store.wishlistCity(cityId, false));
    }

    @PostMapping("/wishlist/spots/{spotId}")
    ApiResponse<Map<String, Object>> wishSpot(@PathVariable String spotId) {
        return ApiResponse.ok(store.wishlistSpot(spotId, true));
    }

    @DeleteMapping("/wishlist/spots/{spotId}")
    ApiResponse<Map<String, Object>> unwishSpot(@PathVariable String spotId) {
        return ApiResponse.ok(store.wishlistSpot(spotId, false));
    }
}
