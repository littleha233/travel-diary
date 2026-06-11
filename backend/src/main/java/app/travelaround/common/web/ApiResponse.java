package app.travelaround.common.web;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

public record ApiResponse<T>(T data, Map<String, Object> meta, Pagination pagination) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(data, createMeta(), null);
    }

    public static <T> ApiResponse<T> page(T data, int page, int pageSize, int total) {
        return new ApiResponse<>(data, createMeta(), new Pagination(page, pageSize, total, page * pageSize < total));
    }

    public static Map<String, Object> createMeta() {
        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("requestId", "req_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12));
        meta.put("serverTime", Instant.now().toString());
        return meta;
    }
}
