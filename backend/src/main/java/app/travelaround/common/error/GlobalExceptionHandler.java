package app.travelaround.common.error;

import app.travelaround.common.web.ApiResponse;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ApiException.class)
    ResponseEntity<Map<String, Object>> handleApiException(ApiException exception) {
        return ResponseEntity.status(exception.status()).body(error(exception.code(), exception.getMessage(), exception.details()));
    }

    @ExceptionHandler({BadCredentialsException.class})
    ResponseEntity<Map<String, Object>> handleAuth(Exception exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error(ErrorCode.AUTH_REQUIRED, "Authentication is required.", null));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException exception) {
        return ResponseEntity.badRequest().body(error(ErrorCode.VALIDATION_ERROR, "Request body is invalid.", null));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, Object>> handleUnexpected(Exception exception) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(error(ErrorCode.INTERNAL_ERROR, "Unexpected server error.", null));
    }

    private Map<String, Object> error(ErrorCode code, String message, Object details) {
        Map<String, Object> body = new LinkedHashMap<>();
        Map<String, Object> error = new LinkedHashMap<>();
        error.put("code", code.name());
        error.put("message", message);
        if (details != null) {
            error.put("details", details);
        }
        body.put("error", error);
        body.put("meta", ApiResponse.createMeta());
        return body;
    }
}
