package app.travelaround.core;

import java.time.Instant;
import java.time.LocalDate;

public final class TravelStoreRuntimeRows {
    private TravelStoreRuntimeRows() {
    }

    public static class TripRow {
        private String id;
        private String userId;
        private String title;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer days;
        private Integer photoCount;
        private String coverUrl;
        private String aiMemoryId;
        private String summary;
        private String visibility;
        private Instant createdAt;
        private Instant updatedAt;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public LocalDate getStartDate() {
            return startDate;
        }

        public void setStartDate(LocalDate startDate) {
            this.startDate = startDate;
        }

        public LocalDate getEndDate() {
            return endDate;
        }

        public void setEndDate(LocalDate endDate) {
            this.endDate = endDate;
        }

        public Integer getDays() {
            return days;
        }

        public void setDays(Integer days) {
            this.days = days;
        }

        public Integer getPhotoCount() {
            return photoCount;
        }

        public void setPhotoCount(Integer photoCount) {
            this.photoCount = photoCount;
        }

        public String getCoverUrl() {
            return coverUrl;
        }

        public void setCoverUrl(String coverUrl) {
            this.coverUrl = coverUrl;
        }

        public String getAiMemoryId() {
            return aiMemoryId;
        }

        public void setAiMemoryId(String aiMemoryId) {
            this.aiMemoryId = aiMemoryId;
        }

        public String getSummary() {
            return summary;
        }

        public void setSummary(String summary) {
            this.summary = summary;
        }

        public String getVisibility() {
            return visibility;
        }

        public void setVisibility(String visibility) {
            this.visibility = visibility;
        }

        public Instant getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(Instant createdAt) {
            this.createdAt = createdAt;
        }

        public Instant getUpdatedAt() {
            return updatedAt;
        }

        public void setUpdatedAt(Instant updatedAt) {
            this.updatedAt = updatedAt;
        }
    }

    public static class TripJoinRow {
        private String tripId;
        private String itemId;

        public String getTripId() {
            return tripId;
        }

        public void setTripId(String tripId) {
            this.tripId = tripId;
        }

        public String getItemId() {
            return itemId;
        }

        public void setItemId(String itemId) {
            this.itemId = itemId;
        }
    }

    public static class CheckInRow {
        private String id;
        private String userId;
        private String cityId;
        private String spotId;
        private String tripId;
        private String type;
        private Instant visitedAt;
        private String moodText;
        private Double lat;
        private Double lng;
        private Integer distanceMeters;
        private String photoIds;
        private String clientRequestId;
        private Instant createdAt;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getCityId() {
            return cityId;
        }

        public void setCityId(String cityId) {
            this.cityId = cityId;
        }

        public String getSpotId() {
            return spotId;
        }

        public void setSpotId(String spotId) {
            this.spotId = spotId;
        }

        public String getTripId() {
            return tripId;
        }

        public void setTripId(String tripId) {
            this.tripId = tripId;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public Instant getVisitedAt() {
            return visitedAt;
        }

        public void setVisitedAt(Instant visitedAt) {
            this.visitedAt = visitedAt;
        }

        public String getMoodText() {
            return moodText;
        }

        public void setMoodText(String moodText) {
            this.moodText = moodText;
        }

        public Double getLat() {
            return lat;
        }

        public void setLat(Double lat) {
            this.lat = lat;
        }

        public Double getLng() {
            return lng;
        }

        public void setLng(Double lng) {
            this.lng = lng;
        }

        public Integer getDistanceMeters() {
            return distanceMeters;
        }

        public void setDistanceMeters(Integer distanceMeters) {
            this.distanceMeters = distanceMeters;
        }

        public String getPhotoIds() {
            return photoIds;
        }

        public void setPhotoIds(String photoIds) {
            this.photoIds = photoIds;
        }

        public String getClientRequestId() {
            return clientRequestId;
        }

        public void setClientRequestId(String clientRequestId) {
            this.clientRequestId = clientRequestId;
        }

        public Instant getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(Instant createdAt) {
            this.createdAt = createdAt;
        }
    }
}
