package app.travelaround.image;

import app.travelaround.common.web.ApiResponse;
import app.travelaround.core.TravelStore;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Map;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/v1")
public class ImageController {
    private final TravelStore store;

    public ImageController(TravelStore store) {
        this.store = store;
    }

    @PostMapping("/images/upload-url")
    ApiResponse<Map<String, Object>> uploadUrl(@RequestBody UploadUrlRequest request) {
        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        return ApiResponse.ok(store.uploadTarget(request.fileName(), request.contentType(), baseUrl));
    }

    @PutMapping("/uploads/{imageId}")
    void upload(@PathVariable String imageId, HttpServletRequest request) throws IOException {
        byte[] bytes = StreamUtils.copyToByteArray(request.getInputStream());
        store.markUploaded(imageId, bytes.length);
    }

    @PostMapping("/images/{imageId}/confirm")
    ApiResponse<Map<String, Object>> confirm(@PathVariable String imageId, @RequestBody ConfirmImageRequest request) {
        return ApiResponse.ok(store.confirmImage(imageId, request.linkedType()));
    }

    record UploadUrlRequest(String fileName, String contentType, String linkedType) {
    }

    record ConfirmImageRequest(String linkedType) {
    }
}
