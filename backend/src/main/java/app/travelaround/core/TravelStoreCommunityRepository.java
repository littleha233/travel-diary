package app.travelaround.core;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class TravelStoreCommunityRepository {
    private final TravelStoreCommunityMapper mapper;

    public TravelStoreCommunityRepository(TravelStoreCommunityMapper mapper) {
        this.mapper = mapper;
    }

    public boolean hasCommunityRows() {
        return mapper.countPosts() > 0;
    }

    public boolean postExists(String postId) {
        return mapper.countPublishedPost(postId) > 0;
    }

    public List<Map<String, Object>> loadPosts(String userId) {
        return mapper.listPublishedPosts(userId).stream().map(row -> map(
            "id", row.getId(),
            "authorId", row.getAuthorId(),
            "author", row.getAuthor(),
            "type", row.getType(),
            "title", row.getTitle(),
            "subtitle", row.getSubtitle(),
            "body", row.getBody(),
            "imageUrl", row.getImageUrl(),
            "linkedId", row.getLinkedId(),
            "actionLabel", row.getActionLabel(),
            "progress", row.getProgress(),
            "status", row.getStatus(),
            "likeCount", row.getLikeCount(),
            "saveCount", row.getSaveCount(),
            "commentCount", row.getCommentCount(),
            "liked", Boolean.TRUE.equals(row.getLiked()),
            "saved", Boolean.TRUE.equals(row.getSaved()),
            "createdAt", instantText(row.getCreatedAt()),
            "updatedAt", instantText(row.getUpdatedAt())
        )).toList();
    }

    @Transactional
    public void setLiked(String userId, String postId, boolean liked) {
        mapper.deleteLike(userId, postId);
        if (liked) {
            mapper.insertLike(userId, postId);
        }
    }

    @Transactional
    public void setSaved(String userId, String postId, boolean saved) {
        mapper.deleteSave(userId, postId);
        if (saved) {
            mapper.insertSave(userId, postId);
        }
    }

    public List<Map<String, Object>> loadComments(String postId) {
        return mapper.listComments(postId).stream().map(row -> map(
            "id", row.getId(),
            "postId", row.getPostId(),
            "userId", row.getUserId(),
            "author", row.getAuthor(),
            "body", row.getBody(),
            "status", row.getStatus(),
            "createdAt", instantText(row.getCreatedAt()),
            "updatedAt", instantText(row.getUpdatedAt())
        )).toList();
    }

    public void saveComment(Map<String, Object> comment) {
        mapper.insertComment(
            text(comment.get("id")),
            text(comment.get("postId")),
            text(comment.get("userId")),
            text(comment.get("body")),
            text(comment.get("createdAt"))
        );
    }

    private String instantText(Instant value) {
        return value == null ? null : value.toString();
    }

    private String text(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private Map<String, Object> map(Object... entries) {
        Map<String, Object> result = new java.util.LinkedHashMap<>();
        for (int i = 0; i < entries.length; i += 2) {
            if (entries[i + 1] != null) {
                result.put(String.valueOf(entries[i]), entries[i + 1]);
            }
        }
        return result;
    }
}
