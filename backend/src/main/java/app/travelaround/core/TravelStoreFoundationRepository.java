package app.travelaround.core;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Repository;

@Repository
public class TravelStoreFoundationRepository {
    private final TravelStoreFoundationMapper mapper;
    private final ObjectMapper objectMapper;

    public TravelStoreFoundationRepository(TravelStoreFoundationMapper mapper, ObjectMapper objectMapper) {
        this.mapper = mapper;
        this.objectMapper = objectMapper;
    }

    public boolean hasFoundationRows() {
        return mapper.countUsers() > 0 && mapper.countCities() > 0 && mapper.countSpots() > 0;
    }

    public Map<String, Object> loadFoundation() {
        return map(
            "users", users(),
            "cities", cities(),
            "spots", spots(),
            "userCityStates", userCityStates(),
            "userSpotStates", userSpotStates()
        );
    }

    private Map<String, Map<String, Object>> users() {
        Map<String, Map<String, Object>> result = new LinkedHashMap<>();
        mapper.listUsers().forEach(row -> result.put(row.getId(), map(
            "id", row.getId(),
            "nickname", row.getNickname(),
            "avatarUrl", row.getAvatarUrl(),
            "phone", row.getPhone(),
            "level", row.getLevel(),
            "title", row.getTitle()
        )));
        return result;
    }

    private Map<String, Map<String, Object>> cities() {
        Map<String, Map<String, Object>> result = new LinkedHashMap<>();
        mapper.listCities().forEach(row -> result.put(row.getId(), map(
            "id", row.getId(),
            "name", row.getName(),
            "province", row.getProvince(),
            "coordinates", map("latitude", row.getLat(), "longitude", row.getLng()),
            "mapX", row.getMapX(),
            "mapY", row.getMapY(),
            "coverUrl", row.getCoverUrl(),
            "description", row.getDescription(),
            "spotIds", jsonList(row.getSpotIds()),
            "tags", jsonList(row.getTags())
        )));
        return result;
    }

    private Map<String, Map<String, Object>> spots() {
        Map<String, Map<String, Object>> result = new LinkedHashMap<>();
        mapper.listSpots().forEach(row -> result.put(row.getId(), map(
            "id", row.getId(),
            "cityId", row.getCityId(),
            "name", row.getName(),
            "radius", row.getRadius(),
            "coordinates", map("latitude", row.getLat(), "longitude", row.getLng()),
            "coverUrl", row.getCoverUrl(),
            "description", row.getDescription(),
            "tags", jsonList(row.getTags()),
            "questIds", jsonList(row.getQuestIds()),
            "photoIds", jsonList(row.getPhotoIds())
        )));
        return result;
    }

    private Map<String, Map<String, Object>> userCityStates() {
        Map<String, Map<String, Object>> result = new LinkedHashMap<>();
        mapper.listUserCityStates().forEach(row -> {
            Map<String, Object> state = map(
                "userId", row.getUserId(),
                "cityId", row.getCityId(),
                "lit", Boolean.TRUE.equals(row.getLit()),
                "manuallyLit", Boolean.TRUE.equals(row.getManuallyLit()),
                "wished", Boolean.TRUE.equals(row.getWished())
            );
            if (row.getVisitedAt() != null) {
                state.put("visitedAt", dateText(row.getVisitedAt()));
            }
            result.put(userKey(row.getUserId(), row.getCityId()), state);
        });
        return result;
    }

    private Map<String, Map<String, Object>> userSpotStates() {
        Map<String, Map<String, Object>> result = new LinkedHashMap<>();
        mapper.listUserSpotStates().forEach(row -> result.put(userKey(row.getUserId(), row.getSpotId()), map(
            "userId", row.getUserId(),
            "spotId", row.getSpotId(),
            "status", row.getStatus(),
            "canCheckIn", Boolean.TRUE.equals(row.getCanCheckIn())
        )));
        return result;
    }

    private List<String> jsonList(String value) {
        if (value == null || value.isBlank()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(value, new TypeReference<>() {
            });
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to read relational projection JSON.", exception);
        }
    }

    private String dateText(LocalDate value) {
        return value.toString();
    }

    private String userKey(String userId, String id) {
        return userId + ":" + id;
    }

    private Map<String, Object> map(Object... entries) {
        Map<String, Object> result = new LinkedHashMap<>();
        for (int i = 0; i < entries.length; i += 2) {
            result.put(String.valueOf(entries[i]), entries[i + 1]);
        }
        return result;
    }
}
