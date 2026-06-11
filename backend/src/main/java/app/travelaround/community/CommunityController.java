package app.travelaround.community;

import app.travelaround.common.web.ApiResponse;
import app.travelaround.core.TravelStore;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/community")
public class CommunityController {
    private final TravelStore store;

    public CommunityController(TravelStore store) {
        this.store = store;
    }

    @GetMapping("/posts")
    ApiResponse<List<Map<String, Object>>> posts(@RequestParam(required = false) String keyword) {
        List<Map<String, Object>> items = store.communityPosts(keyword);
        return ApiResponse.page(items, 1, items.size(), items.size());
    }
}
