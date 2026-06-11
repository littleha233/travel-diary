package app.travelaround.image;

import app.travelaround.common.error.ApiException;
import app.travelaround.common.error.ErrorCode;
import io.minio.BucketExistsArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.SetBucketPolicyArgs;
import io.minio.http.Method;
import java.net.URI;
import java.time.LocalDate;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class ObjectStorageService {
    private final String provider;
    private final String endpoint;
    private final String publicEndpoint;
    private final String accessKey;
    private final String secretKey;
    private final String bucket;
    private final int presignExpirySeconds;
    private MinioClient minioClient;
    private boolean bucketReady;

    public ObjectStorageService(
        @Value("${travelaround.storage.provider}") String provider,
        @Value("${travelaround.storage.endpoint}") String endpoint,
        @Value("${travelaround.storage.public-endpoint}") String publicEndpoint,
        @Value("${travelaround.storage.access-key}") String accessKey,
        @Value("${travelaround.storage.secret-key}") String secretKey,
        @Value("${travelaround.storage.bucket}") String bucket,
        @Value("${travelaround.storage.presign-expiry-seconds}") int presignExpirySeconds
    ) {
        this.provider = provider;
        this.endpoint = trimTrailingSlash(endpoint);
        this.publicEndpoint = trimTrailingSlash(publicEndpoint);
        this.accessKey = accessKey;
        this.secretKey = secretKey;
        this.bucket = bucket;
        this.presignExpirySeconds = presignExpirySeconds;
    }

    public UploadTarget createUploadTarget(String imageId, String fileName, String baseUrl) {
        String objectKey = objectKey(imageId, fileName);
        if (!"minio".equalsIgnoreCase(provider)) {
            String uploadUrl = baseUrl + "/v1/uploads/" + imageId;
            return new UploadTarget(imageId, objectKey, uploadUrl, uploadUrl, "PUT", Map.of(), true);
        }

        try {
            ensureBucket();
            String uploadUrl = minioClient().getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                    .method(Method.PUT)
                    .bucket(bucket)
                    .object(objectKey)
                    .expiry(presignExpirySeconds, TimeUnit.SECONDS)
                    .build()
            );
            String publicUploadUrl = replaceEndpoint(uploadUrl, publicEndpoint);
            String publicUrl = publicEndpoint + "/" + bucket + "/" + objectKey;
            return new UploadTarget(imageId, objectKey, publicUploadUrl, publicUrl, "PUT", Map.of(), false);
        } catch (Exception exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR, "Failed to create image upload URL.");
        }
    }

    private void ensureBucket() throws Exception {
        if (bucketReady) {
            return;
        }
        MinioClient client = minioClient();
        boolean exists = client.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
        if (!exists) {
            client.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
        }
        client.setBucketPolicy(SetBucketPolicyArgs.builder().bucket(bucket).config(publicReadPolicy()).build());
        bucketReady = true;
    }

    private String publicReadPolicy() {
        return """
            {
              "Version": "2012-10-17",
              "Statement": [
                {
                  "Effect": "Allow",
                  "Principal": {"AWS": ["*"]},
                  "Action": ["s3:GetObject"],
                  "Resource": ["arn:aws:s3:::%s/*"]
                }
              ]
            }
            """.formatted(bucket);
    }

    private MinioClient minioClient() {
        if (minioClient == null) {
            minioClient = MinioClient.builder().endpoint(endpoint).credentials(accessKey, secretKey).build();
        }
        return minioClient;
    }

    private String objectKey(String imageId, String fileName) {
        String extension = extension(fileName);
        LocalDate today = LocalDate.now();
        return "check-ins/%d/%02d/%02d/%s%s".formatted(today.getYear(), today.getMonthValue(), today.getDayOfMonth(), imageId, extension);
    }

    private String extension(String fileName) {
        if (fileName == null) {
            return ".jpg";
        }
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == fileName.length() - 1) {
            return ".jpg";
        }
        String extension = fileName.substring(dotIndex).toLowerCase();
        return extension.matches("\\.(jpg|jpeg|png|webp|heic|heif)") ? extension : ".jpg";
    }

    private String replaceEndpoint(String url, String replacementEndpoint) {
        try {
            URI source = URI.create(url);
            URI replacement = URI.create(replacementEndpoint);
            URI rewritten = new URI(
                replacement.getScheme(),
                replacement.getUserInfo(),
                replacement.getHost(),
                replacement.getPort(),
                source.getPath(),
                source.getQuery(),
                source.getFragment()
            );
            return rewritten.toString();
        } catch (Exception ignored) {
            return url;
        }
    }

    private String trimTrailingSlash(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
