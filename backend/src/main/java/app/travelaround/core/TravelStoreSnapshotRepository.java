package app.travelaround.core;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class TravelStoreSnapshotRepository {
    private static final String SNAPSHOT_ID = "default";

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public TravelStoreSnapshotRepository(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    public Optional<Map<String, Object>> load() {
        return jdbcTemplate.query(
            "select payload from travel_store_snapshots where id = ?",
            resultSet -> resultSet.next() ? Optional.of(readPayload(resultSet.getString("payload"))) : Optional.empty(),
            SNAPSHOT_ID
        );
    }

    @Transactional
    public void save(Map<String, Object> payload) {
        String json = writePayload(payload);
        jdbcTemplate.update("delete from travel_store_snapshots where id = ?", SNAPSHOT_ID);
        jdbcTemplate.update("insert into travel_store_snapshots (id, payload, updated_at) values (?, ?, current_timestamp)", SNAPSHOT_ID, json);
        saveRelationalProjection(payload);
    }

    private void saveRelationalProjection(Map<String, Object> payload) {
        clearRelationalTables();
        saveUsers(mapOfMaps(payload.get("users")));
        saveCities(mapOfMaps(payload.get("cities")));
        saveSpots(mapOfMaps(payload.get("spots")));
        saveUserCityStates(mapOfMaps(payload.get("userCityStates")));
        saveUserSpotStates(mapOfMaps(payload.get("userSpotStates")));
        saveTrips(mapOfMaps(payload.get("trips")));
        saveCheckIns(mapOfMaps(payload.get("checkIns")), stringMap(payload.get("checkInRequests")));
        saveImages(mapOfMaps(payload.get("images")));
        saveAiMemories(mapOfMaps(payload.get("aiMemories")));
        saveAchievements(listValue(payload.get("achievements")));
        saveThemeQuests(listValue(payload.get("quests")));
        savePlans(mapOfMaps(payload.get("plans")));
        saveCommunityPosts(listValue(payload.get("communityPosts")));
    }

    private void clearRelationalTables() {
        List.of(
            "community_posts",
            "plan_spots",
            "plan_cities",
            "plans",
            "theme_quest_cities",
            "theme_quest_spots",
            "theme_quests",
            "user_achievements",
            "achievements",
            "ai_memories",
            "images",
            "trip_check_ins",
            "check_ins",
            "trip_spots",
            "trip_cities",
            "trips",
            "user_spot_states",
            "user_city_states",
            "spots",
            "cities",
            "users"
        ).forEach(table -> jdbcTemplate.update("delete from " + table));
    }

    private void saveUsers(Map<String, Map<String, Object>> users) {
        users.values().forEach(user -> jdbcTemplate.update(
            "insert into users (id, nickname, avatar_url, phone, level, title) values (?, ?, ?, ?, ?, ?)",
            text(user.get("id")),
            text(user.get("nickname")),
            text(user.get("avatarUrl")),
            text(user.get("phone")),
            text(user.get("level")),
            text(user.get("title"))
        ));
    }

    private void saveCities(Map<String, Map<String, Object>> cities) {
        cities.values().forEach(city -> {
            Map<String, Object> coordinates = objectMap(city.get("coordinates"));
            jdbcTemplate.update(
                "insert into cities (id, name, province, lat, lng, map_x, map_y, cover_url, description, spot_ids, tags) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                text(city.get("id")),
                text(city.get("name")),
                text(city.get("province")),
                decimal(coordinates.get("latitude")),
                decimal(coordinates.get("longitude")),
                integer(city.get("mapX")),
                integer(city.get("mapY")),
                text(city.get("coverUrl")),
                text(city.get("description")),
                json(city.get("spotIds")),
                json(city.get("tags"))
            );
        });
    }

    private void saveSpots(Map<String, Map<String, Object>> spots) {
        spots.values().forEach(spot -> {
            Map<String, Object> coordinates = objectMap(spot.get("coordinates"));
            jdbcTemplate.update(
                "insert into spots (id, city_id, name, lat, lng, radius, cover_url, description, tags, quest_ids, photo_ids) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                text(spot.get("id")),
                text(spot.get("cityId")),
                text(spot.get("name")),
                decimal(coordinates.get("latitude")),
                decimal(coordinates.get("longitude")),
                integer(spot.get("radius")),
                text(spot.get("coverUrl")),
                text(spot.get("description")),
                json(spot.get("tags")),
                json(spot.get("questIds")),
                json(spot.get("photoIds"))
            );
        });
    }

    private void saveUserCityStates(Map<String, Map<String, Object>> states) {
        states.values().forEach(state -> jdbcTemplate.update(
            "insert into user_city_states (user_id, city_id, lit, manually_lit, wished, visited_at) values (?, ?, ?, ?, ?, ?)",
            text(state.get("userId")),
            text(state.get("cityId")),
            bool(state.get("lit")),
            bool(state.get("manuallyLit")),
            bool(state.get("wished")),
            date(state.get("visitedAt"))
        ));
    }

    private void saveUserSpotStates(Map<String, Map<String, Object>> states) {
        states.values().forEach(state -> jdbcTemplate.update(
            "insert into user_spot_states (user_id, spot_id, status, can_check_in) values (?, ?, ?, ?)",
            text(state.get("userId")),
            text(state.get("spotId")),
            text(state.get("status")),
            bool(state.get("canCheckIn"))
        ));
    }

    private void saveTrips(Map<String, Map<String, Object>> trips) {
        trips.values().forEach(trip -> {
            String tripId = text(trip.get("id"));
            jdbcTemplate.update(
                "insert into trips (id, user_id, title, start_date, end_date, days, photo_count, cover_url, ai_memory_id, summary, visibility, created_at, updated_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                tripId,
                text(trip.get("userId")),
                text(trip.get("title")),
                date(trip.get("startDate")),
                date(trip.get("endDate")),
                integer(trip.get("days")),
                integer(trip.get("photoCount")),
                text(trip.get("coverUrl")),
                text(trip.get("aiMemoryId")),
                text(trip.get("summary")),
                text(trip.get("visibility")),
                timestamp(trip.get("createdAt")),
                timestamp(trip.get("updatedAt"))
            );
            saveJoinRows("trip_cities", "trip_id", tripId, "city_id", stringList(trip.get("cityIds")));
            saveJoinRows("trip_spots", "trip_id", tripId, "spot_id", stringList(trip.get("spotIds")));
            saveTripCheckInRows(tripId, stringList(trip.get("checkInIds")));
        });
    }

    private void saveCheckIns(Map<String, Map<String, Object>> checkIns, Map<String, String> checkInRequests) {
        checkIns.values().forEach(checkIn -> {
            Map<String, Object> location = objectMap(checkIn.get("location"));
            jdbcTemplate.update(
                "insert into check_ins (id, user_id, city_id, spot_id, trip_id, type, visited_at, mood_text, lat, lng, distance_meters, photo_ids, client_request_id, created_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                text(checkIn.get("id")),
                text(checkIn.get("userId")),
                text(checkIn.get("cityId")),
                text(checkIn.get("spotId")),
                text(checkIn.get("tripId")),
                text(checkIn.get("type")),
                timestamp(firstPresent(checkIn.get("visitedAt"), checkIn.get("createdAt"))),
                text(checkIn.get("moodText")),
                decimal(location.get("latitude")),
                decimal(location.get("longitude")),
                integer(checkIn.get("distanceMeters")),
                json(checkIn.get("photoIds")),
                clientRequestIdFor(text(checkIn.get("id")), checkInRequests),
                timestamp(checkIn.get("createdAt"))
            );
        });
    }

    private void saveImages(Map<String, Map<String, Object>> images) {
        images.values().forEach(image -> jdbcTemplate.update(
            "insert into images (id, user_id, url, thumbnail_url, content_type, byte_size, linked_type, linked_id, status, created_at, updated_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            text(image.get("id")),
            text(image.get("userId")),
            text(image.get("url")),
            text(image.get("thumbnailUrl")),
            text(image.get("contentType")),
            longNumber(image.get("byteSize")),
            text(image.get("linkedType")),
            text(image.get("linkedId")),
            text(image.get("status")),
            timestamp(image.get("createdAt")),
            timestamp(firstPresent(image.get("updatedAt"), image.get("createdAt")))
        ));
    }

    private void saveAiMemories(Map<String, Map<String, Object>> memories) {
        memories.values().forEach(memory -> jdbcTemplate.update(
            "insert into ai_memories (id, trip_id, user_id, title, summary, content, share_text, style, status, generated_at, created_at, updated_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            text(memory.get("id")),
            text(memory.get("tripId")),
            text(memory.get("userId")),
            text(memory.get("title")),
            text(memory.get("summary")),
            text(memory.get("content")),
            text(memory.get("shareText")),
            text(memory.get("style")),
            text(memory.get("status")),
            timestamp(memory.get("generatedAt")),
            timestamp(firstPresent(memory.get("generatedAt"), memory.get("createdAt"))),
            timestamp(firstPresent(memory.get("generatedAt"), memory.get("updatedAt"), memory.get("createdAt")))
        ));
    }

    private void saveAchievements(List<Map<String, Object>> achievements) {
        achievements.forEach(achievement -> {
            String achievementId = text(achievement.get("id"));
            jdbcTemplate.update(
                "insert into achievements (id, title, description, tone) values (?, ?, ?, ?)",
                achievementId,
                text(achievement.get("title")),
                text(achievement.get("description")),
                text(achievement.get("tone"))
            );
            jdbcTemplate.update(
                "insert into user_achievements (user_id, achievement_id, unlocked, unlocked_at) values (?, ?, ?, ?)",
                text(firstPresent(achievement.get("userId"), "u-nicola")),
                achievementId,
                bool(achievement.get("unlocked")),
                date(achievement.get("unlockedAt"))
            );
        });
    }

    private void saveThemeQuests(List<Map<String, Object>> quests) {
        quests.forEach(quest -> {
            String questId = text(quest.get("id"));
            jdbcTemplate.update(
                "insert into theme_quests (id, title, subtitle, description, total, cover_url, reward_achievement_id) values (?, ?, ?, ?, ?, ?, ?)",
                questId,
                text(quest.get("title")),
                text(quest.get("subtitle")),
                text(quest.get("description")),
                integer(quest.get("total")),
                text(quest.get("coverUrl")),
                text(quest.get("rewardAchievementId"))
            );
            saveJoinRows("theme_quest_spots", "quest_id", questId, "spot_id", stringList(quest.get("spotIds")));
            saveJoinRows("theme_quest_cities", "quest_id", questId, "city_id", stringList(quest.get("cityIds")));
        });
    }

    private void savePlans(Map<String, Map<String, Object>> plans) {
        plans.values().forEach(plan -> {
            String planId = text(plan.get("id"));
            jdbcTemplate.update(
                "insert into plans (id, user_id, title, days, progress, total, cover_url, start_hint, created_at, updated_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                planId,
                text(plan.get("userId")),
                text(plan.get("title")),
                integer(plan.get("days")),
                integer(plan.get("progress")),
                integer(plan.get("total")),
                text(plan.get("coverUrl")),
                text(plan.get("startHint")),
                timestamp(plan.get("createdAt")),
                timestamp(firstPresent(plan.get("updatedAt"), plan.get("createdAt")))
            );
            saveJoinRows("plan_cities", "plan_id", planId, "city_id", stringList(plan.get("cityIds")));
            saveJoinRows("plan_spots", "plan_id", planId, "spot_id", stringList(plan.get("spotIds")));
        });
    }

    private void saveCommunityPosts(List<Map<String, Object>> posts) {
        posts.forEach(post -> jdbcTemplate.update(
            "insert into community_posts (id, author_id, type, title, subtitle, body, image_url, linked_id, action_label, progress, status) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            text(post.get("id")),
            text(firstPresent(post.get("authorId"), "u-nicola")),
            text(post.get("type")),
            text(post.get("title")),
            text(post.get("subtitle")),
            text(post.get("body")),
            text(post.get("imageUrl")),
            text(post.get("linkedId")),
            text(post.get("actionLabel")),
            integer(post.get("progress")),
            text(firstPresent(post.get("status"), "published"))
        ));
    }

    private void saveJoinRows(String table, String leftColumn, String leftValue, String rightColumn, List<String> values) {
        for (int index = 0; index < values.size(); index += 1) {
            jdbcTemplate.update(
                "insert into " + table + " (" + leftColumn + ", " + rightColumn + ", sort_order) values (?, ?, ?)",
                leftValue,
                values.get(index),
                index
            );
        }
    }

    private void saveTripCheckInRows(String tripId, List<String> checkInIds) {
        for (String checkInId : checkInIds) {
            jdbcTemplate.update(
                "insert into trip_check_ins (trip_id, check_in_id) values (?, ?)",
                tripId,
                checkInId
            );
        }
    }

    private Map<String, Object> readPayload(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to read travel store snapshot.", exception);
        }
    }

    private String writePayload(Map<String, Object> payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to write travel store snapshot.", exception);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Map<String, Object>> mapOfMaps(Object value) {
        if (value instanceof Map<?, ?> map) {
            return (Map<String, Map<String, Object>>) map;
        }
        return Collections.emptyMap();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> objectMap(Object value) {
        if (value instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        return Collections.emptyMap();
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> listValue(Object value) {
        if (value instanceof List<?> list) {
            return (List<Map<String, Object>>) list;
        }
        return Collections.emptyList();
    }

    private Map<String, String> stringMap(Object value) {
        if (!(value instanceof Map<?, ?> map)) {
            return Collections.emptyMap();
        }
        Map<String, String> result = new java.util.LinkedHashMap<>();
        map.forEach((key, item) -> result.put(String.valueOf(key), String.valueOf(item)));
        return result;
    }

    private List<String> stringList(Object value) {
        if (!(value instanceof List<?> list)) {
            return new ArrayList<>();
        }
        return list.stream().map(String::valueOf).toList();
    }

    private String json(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to write travel store projection JSON.", exception);
        }
    }

    private String text(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private Boolean bool(Object value) {
        return Boolean.TRUE.equals(value);
    }

    private Integer integer(Object value) {
        return value instanceof Number number ? number.intValue() : null;
    }

    private Long longNumber(Object value) {
        return value instanceof Number number ? number.longValue() : null;
    }

    private Double decimal(Object value) {
        return value instanceof Number number ? number.doubleValue() : null;
    }

    private Date date(Object value) {
        if (value == null) {
            return null;
        }
        return Date.valueOf(LocalDate.parse(String.valueOf(value)));
    }

    private Timestamp timestamp(Object value) {
        if (value == null) {
            return null;
        }
        return Timestamp.from(Instant.parse(String.valueOf(value)));
    }

    private Object firstPresent(Object... values) {
        for (Object value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private String clientRequestIdFor(String checkInId, Map<String, String> checkInRequests) {
        return checkInRequests.entrySet().stream()
            .filter(entry -> checkInId.equals(entry.getValue()))
            .map(entry -> {
                String key = entry.getKey();
                int delimiter = key.indexOf(':');
                return delimiter >= 0 ? key.substring(delimiter + 1) : key;
            })
            .findFirst()
            .orElse(null);
    }
}
