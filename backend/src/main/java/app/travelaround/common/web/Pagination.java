package app.travelaround.common.web;

public record Pagination(int page, int pageSize, int total, boolean hasMore) {
}
