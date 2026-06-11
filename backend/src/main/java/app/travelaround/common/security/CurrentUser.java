package app.travelaround.common.security;

import app.travelaround.common.error.ApiException;
import app.travelaround.common.error.ErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class CurrentUser {
    private CurrentUser() {
    }

    public static String id() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, ErrorCode.AUTH_REQUIRED, "Authentication is required.");
        }
        return String.valueOf(authentication.getPrincipal());
    }
}
