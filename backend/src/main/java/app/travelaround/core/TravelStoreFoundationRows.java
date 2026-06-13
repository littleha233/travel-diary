package app.travelaround.core;

import java.time.LocalDate;

public final class TravelStoreFoundationRows {
    private TravelStoreFoundationRows() {
    }

    public static class UserRow {
        private String id;
        private String nickname;
        private String avatarUrl;
        private String phone;
        private String level;
        private String title;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getNickname() {
            return nickname;
        }

        public void setNickname(String nickname) {
            this.nickname = nickname;
        }

        public String getAvatarUrl() {
            return avatarUrl;
        }

        public void setAvatarUrl(String avatarUrl) {
            this.avatarUrl = avatarUrl;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getLevel() {
            return level;
        }

        public void setLevel(String level) {
            this.level = level;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }
    }

    public static class CityRow {
        private String id;
        private String name;
        private String province;
        private Double lat;
        private Double lng;
        private Integer mapX;
        private Integer mapY;
        private String coverUrl;
        private String description;
        private String spotIds;
        private String tags;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getProvince() {
            return province;
        }

        public void setProvince(String province) {
            this.province = province;
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

        public Integer getMapX() {
            return mapX;
        }

        public void setMapX(Integer mapX) {
            this.mapX = mapX;
        }

        public Integer getMapY() {
            return mapY;
        }

        public void setMapY(Integer mapY) {
            this.mapY = mapY;
        }

        public String getCoverUrl() {
            return coverUrl;
        }

        public void setCoverUrl(String coverUrl) {
            this.coverUrl = coverUrl;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getSpotIds() {
            return spotIds;
        }

        public void setSpotIds(String spotIds) {
            this.spotIds = spotIds;
        }

        public String getTags() {
            return tags;
        }

        public void setTags(String tags) {
            this.tags = tags;
        }
    }

    public static class SpotRow {
        private String id;
        private String cityId;
        private String name;
        private Double lat;
        private Double lng;
        private Integer radius;
        private String coverUrl;
        private String description;
        private String tags;
        private String questIds;
        private String photoIds;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getCityId() {
            return cityId;
        }

        public void setCityId(String cityId) {
            this.cityId = cityId;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
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

        public Integer getRadius() {
            return radius;
        }

        public void setRadius(Integer radius) {
            this.radius = radius;
        }

        public String getCoverUrl() {
            return coverUrl;
        }

        public void setCoverUrl(String coverUrl) {
            this.coverUrl = coverUrl;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getTags() {
            return tags;
        }

        public void setTags(String tags) {
            this.tags = tags;
        }

        public String getQuestIds() {
            return questIds;
        }

        public void setQuestIds(String questIds) {
            this.questIds = questIds;
        }

        public String getPhotoIds() {
            return photoIds;
        }

        public void setPhotoIds(String photoIds) {
            this.photoIds = photoIds;
        }
    }

    public static class UserCityStateRow {
        private String userId;
        private String cityId;
        private Boolean lit;
        private Boolean manuallyLit;
        private Boolean wished;
        private LocalDate visitedAt;

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

        public Boolean getLit() {
            return lit;
        }

        public void setLit(Boolean lit) {
            this.lit = lit;
        }

        public Boolean getManuallyLit() {
            return manuallyLit;
        }

        public void setManuallyLit(Boolean manuallyLit) {
            this.manuallyLit = manuallyLit;
        }

        public Boolean getWished() {
            return wished;
        }

        public void setWished(Boolean wished) {
            this.wished = wished;
        }

        public LocalDate getVisitedAt() {
            return visitedAt;
        }

        public void setVisitedAt(LocalDate visitedAt) {
            this.visitedAt = visitedAt;
        }
    }

    public static class UserSpotStateRow {
        private String userId;
        private String spotId;
        private String status;
        private Boolean canCheckIn;

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getSpotId() {
            return spotId;
        }

        public void setSpotId(String spotId) {
            this.spotId = spotId;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Boolean getCanCheckIn() {
            return canCheckIn;
        }

        public void setCanCheckIn(Boolean canCheckIn) {
            this.canCheckIn = canCheckIn;
        }
    }
}
