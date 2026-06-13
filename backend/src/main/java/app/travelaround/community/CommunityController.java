package app.travelaround.community;

import app.travelaround.common.security.CurrentUser;
import app.travelaround.common.web.ApiResponse;
import app.travelaround.core.TravelStore;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
        List<Map<String, Object>> items = store.communityPosts(CurrentUser.id(), keyword);
        return ApiResponse.page(items, 1, items.size(), items.size());
    }

    @PostMapping("/posts/{postId}/like")
    ApiResponse<Map<String, Object>> like(@PathVariable String postId) {
        return ApiResponse.ok(store.likeCommunityPost(CurrentUser.id(), postId, true));
    }

    @DeleteMapping("/posts/{postId}/like")
    ApiResponse<Map<String, Object>> unlike(@PathVariable String postId) {
        return ApiResponse.ok(store.likeCommunityPost(CurrentUser.id(), postId, false));
    }

    @PostMapping("/posts/{postId}/save")
    ApiResponse<Map<String, Object>> save(@PathVariable String postId) {
        return ApiResponse.ok(store.saveCommunityPost(CurrentUser.id(), postId, true));
    }

    @DeleteMapping("/posts/{postId}/save")
    ApiResponse<Map<String, Object>> unsave(@PathVariable String postId) {
        return ApiResponse.ok(store.saveCommunityPost(CurrentUser.id(), postId, false));
    }

    @GetMapping("/posts/{postId}/comments")
    ApiResponse<List<Map<String, Object>>> comments(@PathVariable String postId) {
        List<Map<String, Object>> items = store.communityComments(postId);
        return ApiResponse.page(items, 1, items.size(), items.size());
    }

    @PostMapping("/posts/{postId}/comments")
    ApiResponse<Map<String, Object>> comment(@PathVariable String postId, @Valid @RequestBody CommentRequest request) {
        return ApiResponse.ok(store.createCommunityComment(CurrentUser.id(), postId, request.body()));
    }

    record CommentRequest(@NotBlank String body) {
    }
}
