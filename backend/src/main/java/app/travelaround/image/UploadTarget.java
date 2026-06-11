package app.travelaround.image;

import java.util.Map;

public record UploadTarget(
    String imageId,
    String objectKey,
    String uploadUrl,
    String publicUrl,
    String method,
    Map<String, String> headers,
    boolean local
) {
}
