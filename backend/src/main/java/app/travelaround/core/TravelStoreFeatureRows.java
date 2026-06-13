package app.travelaround.core;

import java.time.Instant;
import java.time.LocalDate;

public final class TravelStoreFeatureRows {
    private TravelStoreFeatureRows() {
    }

    public static class ImageRow {
        private String id;
        private String userId;
        private String url;
        private String thumbnailUrl;
        private String contentType;
        private Long byteSize;
        private String linkedType;
        private String linkedId;
        private String status;
        private Instant createdAt;
        private Instant updatedAt;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }
        public String getContentType() { return contentType; }
        public void setContentType(String contentType) { this.contentType = contentType; }
        public Long getByteSize() { return byteSize; }
        public void setByteSize(Long byteSize) { this.byteSize = byteSize; }
        public String getLinkedType() { return linkedType; }
        public void setLinkedType(String linkedType) { this.linkedType = linkedType; }
        public String getLinkedId() { return linkedId; }
        public void setLinkedId(String linkedId) { this.linkedId = linkedId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
        public Instant getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class AiMemoryRow {
        private String id;
        private String tripId;
        private String userId;
        private String title;
        private String summary;
        private String content;
        private String shareText;
        private String style;
        private String status;
        private Instant generatedAt;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTripId() { return tripId; }
        public void setTripId(String tripId) { this.tripId = tripId; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getShareText() { return shareText; }
        public void setShareText(String shareText) { this.shareText = shareText; }
        public String getStyle() { return style; }
        public void setStyle(String style) { this.style = style; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Instant getGeneratedAt() { return generatedAt; }
        public void setGeneratedAt(Instant generatedAt) { this.generatedAt = generatedAt; }
    }

    public static class PlanRow {
        private String id;
        private String userId;
        private String title;
        private Integer days;
        private Integer progress;
        private Integer total;
        private String coverUrl;
        private String startHint;
        private Instant createdAt;
        private Instant updatedAt;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public Integer getDays() { return days; }
        public void setDays(Integer days) { this.days = days; }
        public Integer getProgress() { return progress; }
        public void setProgress(Integer progress) { this.progress = progress; }
        public Integer getTotal() { return total; }
        public void setTotal(Integer total) { this.total = total; }
        public String getCoverUrl() { return coverUrl; }
        public void setCoverUrl(String coverUrl) { this.coverUrl = coverUrl; }
        public String getStartHint() { return startHint; }
        public void setStartHint(String startHint) { this.startHint = startHint; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
        public Instant getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class JoinRow {
        private String ownerId;
        private String itemId;

        public String getOwnerId() { return ownerId; }
        public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
        public String getItemId() { return itemId; }
        public void setItemId(String itemId) { this.itemId = itemId; }
    }

    public static class AchievementRow {
        private String id;
        private String title;
        private String description;
        private String tone;
        private Boolean unlocked;
        private LocalDate unlockedAt;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getTone() { return tone; }
        public void setTone(String tone) { this.tone = tone; }
        public Boolean getUnlocked() { return unlocked; }
        public void setUnlocked(Boolean unlocked) { this.unlocked = unlocked; }
        public LocalDate getUnlockedAt() { return unlockedAt; }
        public void setUnlockedAt(LocalDate unlockedAt) { this.unlockedAt = unlockedAt; }
    }

    public static class QuestRow {
        private String id;
        private String title;
        private String subtitle;
        private String description;
        private Integer total;
        private String coverUrl;
        private String rewardAchievementId;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getSubtitle() { return subtitle; }
        public void setSubtitle(String subtitle) { this.subtitle = subtitle; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Integer getTotal() { return total; }
        public void setTotal(Integer total) { this.total = total; }
        public String getCoverUrl() { return coverUrl; }
        public void setCoverUrl(String coverUrl) { this.coverUrl = coverUrl; }
        public String getRewardAchievementId() { return rewardAchievementId; }
        public void setRewardAchievementId(String rewardAchievementId) { this.rewardAchievementId = rewardAchievementId; }
    }
}
