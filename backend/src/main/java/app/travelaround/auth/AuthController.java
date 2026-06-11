package app.travelaround.auth;

import app.travelaround.common.security.JwtService;
import app.travelaround.common.security.TokenIssue;
import app.travelaround.common.web.ApiResponse;
import app.travelaround.core.TravelStore;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/auth")
public class AuthController {
    private final TravelStore store;
    private final JwtService jwtService;

    public AuthController(TravelStore store, JwtService jwtService) {
        this.store = store;
        this.jwtService = jwtService;
    }

    @PostMapping("/guest")
    ApiResponse<Map<String, Object>> guest() {
        Map<String, Object> user = store.ensureGuestUser();
        TokenIssue token = jwtService.issue(String.valueOf(user.get("id")));
        return ApiResponse.ok(Map.of(
            "accessToken", token.accessToken(),
            "tokenType", "Bearer",
            "expiresAt", token.expiresAt(),
            "user", user
        ));
    }

    @PostMapping("/sms/code")
    ApiResponse<Map<String, Object>> smsCode(@Valid @RequestBody SmsCodeRequest request) {
        return ApiResponse.ok(store.sendSmsCode(request.phone()));
    }

    @PostMapping("/login")
    ApiResponse<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        Map<String, Object> user = store.loginByPhone(request.phone(), request.code());
        TokenIssue token = jwtService.issue(String.valueOf(user.get("id")));
        return ApiResponse.ok(Map.of(
            "accessToken", token.accessToken(),
            "tokenType", "Bearer",
            "expiresAt", token.expiresAt(),
            "user", user
        ));
    }

    record SmsCodeRequest(@NotBlank String phone) {
    }

    record LoginRequest(@NotBlank String phone, @NotBlank String code) {
    }
}
