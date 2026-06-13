package app.travelaround.core;

import java.time.Instant;

public final class TravelStoreCommunityRows {
    private TravelStoreCommunityRows() {
    }

    public static class PostRow {
        private String id;
        private String authorId;
        private String author;
        private String type;
        private String title;
        private String subtitle;
        private String body;
        private String imageUrl;
        private String linkedId;
        private String actionLabel;
        private Integer progress;
        private String status;
        private Integer likeCount;
        private Integer saveCount;
        private Integer commentCount;
        private Boolean liked;
        private Boolean saved;
        private Instant createdAt;
        private Instant updatedAt;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getAuthorId() { return authorId; }
        public void setAuthorId(String authorId) { this.authorId = authorId; }
        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getSubtitle() { return subtitle; }
        public void setSubtitle(String subtitle) { this.subtitle = subtitle; }
        public String getBody() { return body; }
        public void setBody(String body) { this.body = body; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public String getLinkedId() { return linkedId; }
        public void setLinkedId(String linkedId) { this.linkedId = linkedId; }
        public String getActionLabel() { return actionLabel; }
        public void setActionLabel(String actionLabel) { this.actionLabel = actionLabel; }
        public Integer getProgress() { return progress; }
        public void setProgress(Integer progress) { this.progress = progress; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Integer getLikeCount() { return likeCount; }
        public void setLikeCount(Integer likeCount) { this.likeCount = likeCount; }
        public Integer getSaveCount() { return saveCount; }
        public void setSaveCount(Integer saveCount) { this.saveCount = saveCount; }
        public Integer getCommentCount() { return commentCount; }
        public void setCommentCount(Integer commentCount) { this.commentCount = commentCount; }
        public Boolean getLiked() { return liked; }
        public void setLiked(Boolean liked) { this.liked = liked; }
        public Boolean getSaved() { return saved; }
        public void setSaved(Boolean saved) { this.saved = saved; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
        public Instant getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class CommentRow {
        private String id;
        private String postId;
        private String userId;
        private String author;
        private String body;
        private String status;
        private Instant createdAt;
        private Instant updatedAt;

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getPostId() { return postId; }
        public void setPostId(String postId) { this.postId = postId; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }
        public String getBody() { return body; }
        public void setBody(String body) { this.body = body; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
        public Instant getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    }
}
