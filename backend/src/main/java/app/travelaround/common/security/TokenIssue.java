package app.travelaround.common.security;

public record TokenIssue(String accessToken, String expiresAt) {
}
