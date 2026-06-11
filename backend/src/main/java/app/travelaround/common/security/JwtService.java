package app.travelaround.common.security;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private final byte[] secret;
    private final long ttlSeconds;

    public JwtService(
        @Value("${travelaround.jwt.secret}") String secret,
        @Value("${travelaround.jwt.ttl-seconds}") long ttlSeconds
    ) {
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.ttlSeconds = ttlSeconds;
    }

    public TokenIssue issue(String userId) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(ttlSeconds);
        Map<String, Object> header = new LinkedHashMap<>();
        header.put("alg", "HS256");
        header.put("typ", "JWT");
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sub", userId);
        payload.put("iat", now.getEpochSecond());
        payload.put("exp", expiresAt.getEpochSecond());

        String unsigned = encodeJson(header) + "." + encodeJson(payload);
        String token = unsigned + "." + sign(unsigned);
        return new TokenIssue(token, expiresAt.toString());
    }

    public String verify(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return null;
            }
            String unsigned = parts[0] + "." + parts[1];
            if (!constantTimeEquals(sign(unsigned), parts[2])) {
                return null;
            }
            Map<String, Object> payload = OBJECT_MAPPER.readValue(
                Base64.getUrlDecoder().decode(parts[1]),
                new TypeReference<>() {}
            );
            Number exp = (Number) payload.get("exp");
            if (exp == null || Instant.ofEpochSecond(exp.longValue()).isBefore(Instant.now())) {
                return null;
            }
            Object subject = payload.get("sub");
            return subject == null ? null : String.valueOf(subject);
        } catch (Exception ignored) {
            return null;
        }
    }

    private String encodeJson(Map<String, Object> value) {
        try {
            return Base64.getUrlEncoder().withoutPadding().encodeToString(OBJECT_MAPPER.writeValueAsBytes(value));
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to encode JWT.", exception);
        }
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to sign JWT.", exception);
        }
    }

    private boolean constantTimeEquals(String expected, String actual) {
        byte[] left = expected.getBytes(StandardCharsets.UTF_8);
        byte[] right = actual.getBytes(StandardCharsets.UTF_8);
        if (left.length != right.length) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < left.length; i += 1) {
            result |= left[i] ^ right[i];
        }
        return result == 0;
    }
}
