package app.travelaround.common.error;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {
    private final ErrorCode code;
    private final HttpStatus status;
    private final Object details;

    public ApiException(HttpStatus status, ErrorCode code, String message) {
        this(status, code, message, null);
    }

    public ApiException(HttpStatus status, ErrorCode code, String message, Object details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }

    public ErrorCode code() {
        return code;
    }

    public HttpStatus status() {
        return status;
    }

    public Object details() {
        return details;
    }
}
