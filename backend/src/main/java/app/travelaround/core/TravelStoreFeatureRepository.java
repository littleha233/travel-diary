package app.travelaround.core;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class TravelStoreFeatureRepository {
    private static final String DEFAULT_USER_ID = "u-nicola";

    private final TravelStoreFeatureMapper mapper;

    public TravelStoreFeatureRepository(TravelStoreFeatureMapper mapper) {
        this.mapper = mapper;
    }

    public boolean hasFeatureRows() {
        return mapper.countImages() > 0
            || mapper.countAiMemories() > 0
            || mapper.countPlans() > 0
            || mapper.countAchievements() > 0;
    }

    public Map<String, Object> loadFeatureState() {
        return map(
            "images", images(),
            "aiMemories", aiMemories(),
            "plans", plans(),
            "achievements", achievements(DEFAULT_USER_ID),
            "quests", quests()
        );
    }

    @Transactional
    public void saveImage(Map<String, Object> image) {
        mapper.deleteImage(text(image.get("id")));
        mapper.insertImage(
            text(image.get("id")),
            text(image.get("userId")),
            text(image.get("url")),
            text(image.get("thumbnailUrl")),
            text(image.get("contentType")),
            longNumber(image.get("byteSize")),
            text(image.get("linkedType")),
            text(image.get("linkedId")),
            text(image.get("status")),
            text(image.get("createdAt")),
            text(firstPresent(image.get("updatedAt"), image.get("createdAt")))
        );
    }

    @Transactional
    public void saveAiMemory(Map<String, Object> memory) {
        mapper.deleteAiMemory(text(memory.get("id")));
        mapper.insertAiMemory(
            text(memory.get("id")),
            text(memory.get("tripId")),
            text(memory.get("userId")),
            text(memory.get("title")),
            text(memory.get("summary")),
            text(memory.get("content")),
            text(memory.get("shareText")),
            text(memory.get("style")),
            text(memory.get("status")),
            text(memory.get("generatedAt"))
        );
    }

    @Transactional
    public void savePlan(Map<String, Object> plan) {
        String planId = text(plan.get("id"));
        mapper.deletePlanSpots(planId);
        mapper.deletePlanCities(planId);
        mapper.deletePlan(planId);
        mapper.insertPlan(
            planId,
            text(plan.get("userId")),
            text(plan.get("title")),
            integer(plan.get("days"), 0),
            integer(plan.get("progress"), 0),
            integer(plan.get("total"), 0),
            text(plan.get("coverUrl")),
            text(plan.get("startHint")),
            text(plan.get("createdAt")),
            text(firstPresent(plan.get("updatedAt"), plan.get("createdAt")))
        );
        insertJoinRows(planId, "city", stringList(plan.get("cityIds")));
        insertJoinRows(planId, "spot", stringList(plan.get("spotIds")));
    }

    @Transactional
    public void deletePlan(String planId) {
        mapper.deletePlanSpots(planId);
        mapper.deletePlanCities(planId);
        mapper.deletePlan(planId);
    }

    @Transactional
    public void saveUserAchievement(String userId, Map<String, Object> achievement) {
        String achievementId = text(achievement.get("id"));
        mapper.deleteUserAchievement(userId, achievementId);
        mapper.insertUserAchievement(
            userId,
            achievementId,
            Boolean.TRUE.equals(achievement.get("unlocked")),
            text(achievement.get("unlockedAt"))
        );
    }

    private Map<String, Map<String, Object>> images() {
        Map<String, Map<String, Object>> result = new LinkedHashMap<>();
        mapper.listImages().forEach(row -> result.put(row.getId(), map(
            "id", row.getId(),
            "userId", row.getUserId(),
            "url", row.getUrl(),
            "thumbnailUrl", row.getThumbnailUrl(),
            "contentType", row.getContentType(),
            "byteSize", row.getByteSize(),
            "linkedType", row.getLinkedType(),
            "linkedId", row.getLinkedId(),
            "status", row.getStatus(),
            "createdAt", instantText(row.getCreatedAt()),
            "updatedAt", instantText(row.getUpdatedAt())
        )));
        return result;
    }

    private Map<String, Map<String, Object>> aiMemories() {
        Map<String, Map<String, Object>> result = new LinkedHashMap<>();
        mapper.listAiMemories().forEach(row -> result.put(row.getId(), map(
            "id", row.getId(),
            "tripId", row.getTripId(),
            "userId", row.getUserId(),
            "title", row.getTitle(),
            "summary", row.getSummary(),
            "content", row.getContent(),
            "shareText", row.getShareText(),
            "style", row.getStyle(),
            "status", row.getStatus(),
            "generatedAt", instantText(row.getGeneratedAt())
        )));
        return result;
    }

    private Map<String, Map<String, Object>> plans() {
        Map<String, List<String>> planCities = joins(mapper.listPlanCities());
        Map<String, List<String>> planSpots = joins(mapper.listPlanSpots());
        Map<String, Map<String, Object>> result = new LinkedHashMap<>();
        mapper.listPlans().forEach(row -> result.put(row.getId(), map(
            "id", row.getId(),
            "userId", row.getUserId(),
            "title", row.getTitle(),
            "cityIds", planCities.getOrDefault(row.getId(), new ArrayList<>()),
            "days", row.getDays(),
            "progress", row.getProgress(),
            "total", row.getTotal(),
            "coverUrl", row.getCoverUrl(),
            "startHint", row.getStartHint(),
            "spotIds", planSpots.getOrDefault(row.getId(), new ArrayList<>()),
            "createdAt", instantText(row.getCreatedAt()),
            "updatedAt", instantText(row.getUpdatedAt())
        )));
        return result;
    }

    private List<Map<String, Object>> achievements(String userId) {
        return mapper.listAchievements(userId).stream().map(row -> {
            Map<String, Object> achievement = map(
                "id", row.getId(),
                "title", row.getTitle(),
                "description", row.getDescription(),
                "tone", row.getTone(),
                "unlocked", Boolean.TRUE.equals(row.getUnlocked())
            );
            if (row.getUnlockedAt() != null) {
                achievement.put("unlockedAt", dateText(row.getUnlockedAt()));
            }
            return achievement;
        }).toList();
    }

    private List<Map<String, Object>> quests() {
        Map<String, List<String>> questSpots = joins(mapper.listQuestSpots());
        Map<String, List<String>> questCities = joins(mapper.listQuestCities());
        return mapper.listQuests().stream().map(row -> map(
            "id", row.getId(),
            "title", row.getTitle(),
            "subtitle", row.getSubtitle(),
            "description", row.getDescription(),
            "total", row.getTotal(),
            "coverUrl", row.getCoverUrl(),
            "rewardAchievementId", row.getRewardAchievementId(),
            "spotIds", questSpots.getOrDefault(row.getId(), new ArrayList<>()),
            "cityIds", questCities.getOrDefault(row.getId(), new ArrayList<>())
        )).toList();
    }

    private Map<String, List<String>> joins(List<TravelStoreFeatureRows.JoinRow> rows) {
        Map<String, List<String>> result = new LinkedHashMap<>();
        rows.forEach(row -> result.computeIfAbsent(row.getOwnerId(), ignored -> new ArrayList<>()).add(row.getItemId()));
        return result;
    }

    private void insertJoinRows(String planId, String type, List<String> values) {
        for (int index = 0; index < values.size(); index += 1) {
            if ("city".equals(type)) {
                mapper.insertPlanCity(planId, values.get(index), index);
            } else if ("spot".equals(type)) {
                mapper.insertPlanSpot(planId, values.get(index), index);
            }
        }
    }

    private String text(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private Integer integer(Object value, Integer fallback) {
        return value instanceof Number number ? number.intValue() : fallback;
    }

    private Long longNumber(Object value) {
        return value instanceof Number number ? number.longValue() : null;
    }

    private Object firstPresent(Object... values) {
        for (Object value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private List<String> stringList(Object value) {
        if (!(value instanceof List<?> list)) {
            return new ArrayList<>();
        }
        return list.stream().map(String::valueOf).toList();
    }

    private String instantText(Instant value) {
        return value == null ? null : value.toString();
    }

    private String dateText(LocalDate value) {
        return value == null ? null : value.toString();
    }

    private Map<String, Object> map(Object... entries) {
        Map<String, Object> result = new LinkedHashMap<>();
        for (int i = 0; i < entries.length; i += 2) {
            result.put(String.valueOf(entries[i]), entries[i + 1]);
        }
        return result;
    }
}
