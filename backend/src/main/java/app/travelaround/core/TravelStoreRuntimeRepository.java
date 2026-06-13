package app.travelaround.core;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class TravelStoreRuntimeRepository {
    private final TravelStoreRuntimeMapper mapper;
    private final ObjectMapper objectMapper;

    public TravelStoreRuntimeRepository(TravelStoreRuntimeMapper mapper, ObjectMapper objectMapper) {
        this.mapper = mapper;
        this.objectMapper = objectMapper;
    }

    public boolean hasRuntimeRows() {
        return mapper.countTrips() > 0 || !mapper.listCheckIns().isEmpty();
    }

    public Map<String, Object> loadTripCheckInState() {
        Map<String, List<String>> tripCities = joins(mapper.listTripCities());
        Map<String, List<String>> tripSpots = joins(mapper.listTripSpots());
        Map<String, List<String>> tripCheckIns = joins(mapper.listTripCheckIns());
        return map(
            "trips", trips(tripCities, tripSpots, tripCheckIns),
            "checkIns", checkIns(),
            "checkInRequests", checkInRequests()
        );
    }

    @Transactional
    public void saveTrip(Map<String, Object> trip) {
        String tripId = text(trip.get("id"));
        mapper.deleteTripCheckIns(tripId);
        mapper.deleteTripSpots(tripId);
        mapper.deleteTripCities(tripId);
        mapper.deleteTrip(tripId);
        mapper.insertTrip(
            tripId,
            text(trip.get("userId")),
            text(trip.get("title")),
            text(trip.get("startDate")),
            text(trip.get("endDate")),
            integer(trip.get("days"), 0),
            integer(trip.get("photoCount"), 0),
            text(trip.get("coverUrl")),
            text(trip.get("aiMemoryId")),
            text(trip.get("summary")),
            text(trip.get("visibility")),
            text(trip.get("createdAt")),
            text(trip.get("updatedAt"))
        );
        insertJoinRows(tripId, "city", stringList(trip.get("cityIds")));
        insertJoinRows(tripId, "spot", stringList(trip.get("spotIds")));
        stringList(trip.get("checkInIds")).forEach(checkInId -> mapper.insertTripCheckIn(tripId, checkInId));
    }

    @Transactional
    public void saveCheckIn(Map<String, Object> checkIn, String clientRequestId) {
        Map<String, Object> location = objectMap(checkIn.get("location"));
        mapper.deleteCheckIn(text(checkIn.get("id")));
        mapper.insertCheckIn(
            text(checkIn.get("id")),
            text(checkIn.get("userId")),
            text(checkIn.get("cityId")),
            text(checkIn.get("spotId")),
            text(checkIn.get("tripId")),
            text(checkIn.get("type")),
            text(checkIn.get("visitedAt")),
            text(checkIn.get("moodText")),
            decimal(location.get("latitude")),
            decimal(location.get("longitude")),
            integer(checkIn.get("distanceMeters"), null),
            json(stringList(checkIn.get("photoIds"))),
            clientRequestId,
            text(checkIn.get("createdAt"))
        );
    }

    private Map<String, Map<String, Object>> trips(
        Map<String, List<String>> tripCities,
        Map<String, List<String>> tripSpots,
        Map<String, List<String>> tripCheckIns
    ) {
        Map<String, Map<String, Object>> result = new LinkedHashMap<>();
        mapper.listTrips().forEach(row -> result.put(row.getId(), map(
            "id", row.getId(),
            "userId", row.getUserId(),
            "title", row.getTitle(),
            "cityIds", tripCities.getOrDefault(row.getId(), new ArrayList<>()),
            "startDate", dateText(row.getStartDate()),
            "endDate", dateText(row.getEndDate()),
            "days", row.getDays(),
            "spotIds", tripSpots.getOrDefault(row.getId(), new ArrayList<>()),
            "checkInIds", tripCheckIns.getOrDefault(row.getId(), new ArrayList<>()),
            "photoCount", row.getPhotoCount(),
            "coverUrl", row.getCoverUrl(),
            "aiMemoryId", row.getAiMemoryId(),
            "summary", row.getSummary(),
            "visibility", row.getVisibility(),
            "createdAt", instantText(row.getCreatedAt()),
            "updatedAt", instantText(row.getUpdatedAt())
        )));
        return result;
    }

    private Map<String, Map<String, Object>> checkIns() {
        Map<String, Map<String, Object>> result = new LinkedHashMap<>();
        mapper.listCheckIns().forEach(row -> {
            Map<String, Object> checkIn = map(
                "id", row.getId(),
                "userId", row.getUserId(),
                "cityId", row.getCityId(),
                "spotId", row.getSpotId(),
                "tripId", row.getTripId(),
                "createdAt", instantText(row.getCreatedAt()),
                "visitedAt", instantText(row.getVisitedAt()),
                "moodText", row.getMoodText(),
                "type", row.getType(),
                "distanceMeters", row.getDistanceMeters(),
                "photoIds", jsonList(row.getPhotoIds())
            );
            if (row.getLat() != null && row.getLng() != null) {
                checkIn.put("location", map("latitude", row.getLat(), "longitude", row.getLng()));
            }
            result.put(row.getId(), checkIn);
        });
        return result;
    }

    private Map<String, String> checkInRequests() {
        Map<String, String> result = new LinkedHashMap<>();
        mapper.listCheckIns().stream()
            .filter(row -> row.getClientRequestId() != null && !row.getClientRequestId().isBlank())
            .forEach(row -> result.put(row.getUserId() + ":" + row.getClientRequestId(), row.getId()));
        return result;
    }

    private Map<String, List<String>> joins(List<TravelStoreRuntimeRows.TripJoinRow> rows) {
        Map<String, List<String>> result = new LinkedHashMap<>();
        rows.forEach(row -> result.computeIfAbsent(row.getTripId(), ignored -> new ArrayList<>()).add(row.getItemId()));
        return result;
    }

    private void insertJoinRows(String tripId, String type, List<String> values) {
        for (int index = 0; index < values.size(); index += 1) {
            if ("city".equals(type)) {
                mapper.insertTripCity(tripId, values.get(index), index);
            } else if ("spot".equals(type)) {
                mapper.insertTripSpot(tripId, values.get(index), index);
            }
        }
    }

    private List<String> jsonList(String value) {
        if (value == null || value.isBlank()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(value, new TypeReference<>() {
            });
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to read runtime projection JSON.", exception);
        }
    }

    private String dateText(LocalDate value) {
        return value == null ? null : value.toString();
    }

    private String instantText(Instant value) {
        return value == null ? null : value.toString();
    }

    private String json(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to write runtime projection JSON.", exception);
        }
    }

    private String text(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private Integer integer(Object value, Integer fallback) {
        return value instanceof Number number ? number.intValue() : fallback;
    }

    private Double decimal(Object value) {
        return value instanceof Number number ? number.doubleValue() : null;
    }

    private List<String> stringList(Object value) {
        if (!(value instanceof List<?> list)) {
            return new ArrayList<>();
        }
        return list.stream().map(String::valueOf).toList();
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> objectMap(Object value) {
        if (value instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        return new LinkedHashMap<>();
    }

    private Map<String, Object> map(Object... entries) {
        Map<String, Object> result = new LinkedHashMap<>();
        for (int i = 0; i < entries.length; i += 2) {
            result.put(String.valueOf(entries[i]), entries[i + 1]);
        }
        return result;
    }
}
