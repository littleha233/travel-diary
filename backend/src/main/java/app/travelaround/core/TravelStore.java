package app.travelaround.core;

import app.travelaround.common.error.ApiException;
import app.travelaround.common.error.ErrorCode;
import app.travelaround.aimemory.AiMemoryGenerateInput;
import app.travelaround.image.UploadTarget;
import jakarta.annotation.PostConstruct;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class TravelStore {
    private final TravelStoreSnapshotRepository snapshotRepository;
    private final TravelStoreFoundationRepository foundationRepository;
    private final TravelStoreRuntimeRepository runtimeRepository;
    private final TravelStoreFeatureRepository featureRepository;
    private final Map<String, Map<String, Object>> users = new LinkedHashMap<>();
    private final Map<String, Map<String, Object>> cities = new LinkedHashMap<>();
    private final Map<String, Map<String, Object>> spots = new LinkedHashMap<>();
    private final Map<String, Map<String, Object>> trips = new LinkedHashMap<>();
    private final Map<String, Map<String, Object>> checkIns = new LinkedHashMap<>();
    private final Map<String, Map<String, Object>> aiMemories = new LinkedHashMap<>();
    private final Map<String, Map<String, Object>> images = new LinkedHashMap<>();
    private final Map<String, Map<String, Object>> plans = new LinkedHashMap<>();
    private final Map<String, Map<String, Object>> userCityStates = new LinkedHashMap<>();
    private final Map<String, Map<String, Object>> userSpotStates = new LinkedHashMap<>();
    private final Map<String, String> checkInRequests = new LinkedHashMap<>();
    private final List<Map<String, Object>> achievements = new ArrayList<>();
    private final List<Map<String, Object>> quests = new ArrayList<>();
    private final List<Map<String, Object>> communityPosts = new ArrayList<>();
    private final Map<String, String> smsCodes = new LinkedHashMap<>();

    @Autowired
    public TravelStore(
        TravelStoreSnapshotRepository snapshotRepository,
        TravelStoreFoundationRepository foundationRepository,
        TravelStoreRuntimeRepository runtimeRepository,
        TravelStoreFeatureRepository featureRepository
    ) {
        this.snapshotRepository = snapshotRepository;
        this.foundationRepository = foundationRepository;
        this.runtimeRepository = runtimeRepository;
        this.featureRepository = featureRepository;
        seed();
    }

    public TravelStore(TravelStoreSnapshotRepository snapshotRepository) {
        this.snapshotRepository = snapshotRepository;
        this.foundationRepository = null;
        this.runtimeRepository = null;
        this.featureRepository = null;
        seed();
    }

    @PostConstruct
    public synchronized void restoreOrCreateSnapshot() {
        snapshotRepository.load().ifPresentOrElse(snapshot -> {
            restoreSnapshot(snapshot);
            persistSnapshot();
        }, this::persistSnapshot);
    }

    public synchronized Map<String, Object> ensureGuestUser() {
        refreshFoundationFromDatabase();
        String userId = "u-guest-" + UUID.randomUUID();
        Map<String, Object> user = newUser(userId, "游客" + userId.substring(userId.length() - 4), null);
        users.put(userId, user);
        saveUser(user);
        refreshUserStats(user);
        persistSnapshot();
        return copy(user);
    }

    public synchronized Map<String, Object> sendSmsCode(String phone) {
        smsCodes.put(phone, "123456");
        persistSnapshot();
        return map("phone", phone, "code", "123456", "mock", true);
    }

    public synchronized Map<String, Object> loginByPhone(String phone, String code) {
        refreshFoundationFromDatabase();
        String expected = smsCodes.getOrDefault(phone, "123456");
        if (!expected.equals(code)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, "Invalid verification code.");
        }
        Map<String, Object> user = findUserByPhone(phone);
        if (user == null) {
            String userId = userIdForPhone(phone);
            user = newUser(userId, "用户" + phoneSuffix(phone), phone);
            users.put(userId, user);
            saveUser(user);
        }
        refreshUserStats(user);
        Map<String, Object> result = copy(user);
        persistSnapshot();
        return result;
    }

    public synchronized Map<String, Object> user(String userId) {
        refreshFoundationFromDatabase();
        Map<String, Object> user = users.get(userId);
        if (user == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.USER_NOT_FOUND, "User not found.");
        }
        refreshUserStats(user);
        return copy(user);
    }

    public synchronized List<Map<String, Object>> listCities(String userId, String status, String keyword) {
        refreshFoundationFromDatabase();
        List<Map<String, Object>> result = new ArrayList<>();
        String normalizedKeyword = normalize(keyword);
        for (Map<String, Object> city : cities.values()) {
            if (!matchesCityStatus(userId, city, status)) {
                continue;
            }
            if (!normalizedKeyword.isEmpty() && !normalize(String.valueOf(city.get("name")) + " " + city.get("tags")).contains(normalizedKeyword)) {
                continue;
            }
            result.add(enrichCity(userId, city));
        }
        return result;
    }

    public synchronized Map<String, Object> city(String userId, String cityId) {
        refreshFoundationFromDatabase();
        Map<String, Object> city = cities.get(cityId);
        if (city == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.CITY_NOT_FOUND, "City not found.", map("cityId", cityId));
        }
        return enrichCity(userId, city);
    }

    public synchronized List<Map<String, Object>> listSpots(String userId, String cityId, String status, String keyword) {
        refreshFoundationFromDatabase();
        List<Map<String, Object>> result = new ArrayList<>();
        String normalizedKeyword = normalize(keyword);
        for (Map<String, Object> spot : spots.values()) {
            if (cityId != null && !cityId.isBlank() && !cityId.equals(spot.get("cityId"))) {
                continue;
            }
            if (status != null && !status.isBlank() && !"all".equals(status) && !status.equals(effectiveSpotStatus(userId, spot))) {
                continue;
            }
            if (!normalizedKeyword.isEmpty() && !normalize(String.valueOf(spot.get("name")) + " " + spot.get("tags")).contains(normalizedKeyword)) {
                continue;
            }
            result.add(enrichSpot(userId, spot));
        }
        return result;
    }

    public synchronized Map<String, Object> spot(String userId, String spotId) {
        refreshFoundationFromDatabase();
        Map<String, Object> spot = spots.get(spotId);
        if (spot == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.SPOT_NOT_FOUND, "Spot not found.", map("spotId", spotId));
        }
        return enrichSpot(userId, spot);
    }

    public synchronized List<Map<String, Object>> nearbySpots(String userId, double latitude, double longitude, int radiusMeters) {
        refreshFoundationFromDatabase();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> spot : spots.values()) {
            Map<String, Object> coordinates = mapValue(spot.get("coordinates"));
            double distance = distanceMeters(latitude, longitude, number(coordinates.get("latitude")), number(coordinates.get("longitude")));
            if (distance <= radiusMeters) {
                Map<String, Object> item = enrichSpot(userId, spot);
                item.put("distanceMeters", Math.round(distance));
                item.put("distance", distance < 1000 ? Math.round(distance) + "m" : String.format(Locale.US, "%.1fkm", distance / 1000));
                result.add(item);
            }
        }
        result.sort((left, right) -> Long.compare(((Number) left.get("distanceMeters")).longValue(), ((Number) right.get("distanceMeters")).longValue()));
        return result;
    }

    public synchronized List<Map<String, Object>> listTrips(String userId) {
        refreshTripCheckInFromDatabase();
        return trips.values().stream()
            .filter(trip -> userId.equals(trip.get("userId")))
            .map(this::copy)
            .toList();
    }

    public synchronized Map<String, Object> trip(String userId, String tripId) {
        refreshTripCheckInFromDatabase();
        Map<String, Object> trip = trips.get(tripId);
        if (trip == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.TRIP_NOT_FOUND, "Trip not found.", map("tripId", tripId));
        }
        if (!userId.equals(trip.get("userId"))) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.TRIP_NOT_FOUND, "Trip not found.", map("tripId", tripId));
        }
        return copy(trip);
    }

    public synchronized Map<String, Object> tripDetail(String userId, String tripId) {
        refreshTripCheckInFromDatabase();
        Map<String, Object> trip = trip(userId, tripId);
        List<Map<String, Object>> tripCheckIns = checkIns.values().stream()
            .filter(item -> tripId.equals(item.get("tripId")) && userId.equals(item.get("userId")))
            .map(this::copy)
            .toList();
        Map<String, Object> memory = aiMemories.values().stream()
            .filter(item -> tripId.equals(item.get("tripId")) && userId.equals(item.get("userId")))
            .findFirst()
            .map(this::copy)
            .orElse(null);
        return map("trip", trip, "checkIns", tripCheckIns, "aiMemory", memory);
    }

    public synchronized Map<String, Object> createTrip(String userId, String title, String cityId, String startDate, String endDate, String visibility) {
        refreshFoundationFromDatabase();
        city(userId, cityId);
        long days = ChronoUnit.DAYS.between(LocalDate.parse(startDate), LocalDate.parse(endDate)) + 1;
        if (days <= 0) {
            throw new ApiException(HttpStatus.CONFLICT, ErrorCode.TRIP_DATE_CONFLICT, "Trip endDate must be on or after startDate.");
        }
        String id = slug(cityId + "-" + title + "-" + System.currentTimeMillis());
        Map<String, Object> trip = map(
            "id", id,
            "userId", userId,
            "title", title,
            "cityIds", list(cityId),
            "startDate", startDate,
            "endDate", endDate,
            "days", days,
            "spotIds", new ArrayList<>(),
            "checkInIds", new ArrayList<>(),
            "photoUrls", new ArrayList<>(),
            "photoCount", 0,
            "coverUrl", cities.get(cityId).get("coverUrl"),
            "summary", days + " 天 · 1 座城市 · 0 个景点 · 0 张照片",
            "visibility", visibility == null ? "private" : visibility,
            "createdAt", Instant.now().toString(),
            "updatedAt", Instant.now().toString()
        );
        trips.put(id, trip);
        saveTrip(trip);
        persistSnapshot();
        return map("trip", copy(trip));
    }

    public synchronized Map<String, Object> createCheckIn(String userId, String spotId, String tripId, String type, String moodText, Map<String, Object> location, List<String> photoIds, String visitedAt, String clientRequestId) {
        refreshFoundationFromDatabase();
        String idempotencyKey = clientRequestId == null || clientRequestId.isBlank() ? null : userId + ":" + clientRequestId;
        if (idempotencyKey != null && checkInRequests.containsKey(idempotencyKey)) {
            Map<String, Object> existing = checkIns.get(checkInRequests.get(idempotencyKey));
            if (existing != null) {
                return checkInMutationResult(existing, new ArrayList<>());
            }
        }

        Map<String, Object> spot = spots.get(spotId);
        if (spot == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.SPOT_NOT_FOUND, "Spot not found.", map("spotId", spotId));
        }
        if (tripId != null && (!trips.containsKey(tripId) || !userId.equals(trips.get(tripId).get("userId")))) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.TRIP_NOT_FOUND, "Trip not found.", map("tripId", tripId));
        }
        double distance = 0;
        if ("gps".equals(type)) {
            if (location == null) {
                throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.LOCATION_REQUIRED, "GPS check-in requires location.");
            }
            Map<String, Object> coordinates = mapValue(spot.get("coordinates"));
            distance = distanceMeters(number(location.get("latitude")), number(location.get("longitude")), number(coordinates.get("latitude")), number(coordinates.get("longitude")));
            if (distance > number(spot.get("radius"))) {
                throw new ApiException(HttpStatus.BAD_REQUEST, ErrorCode.CHECK_IN_OUT_OF_RANGE, "Check-in is outside the spot radius.");
            }
        }
        String cityId = String.valueOf(spot.get("cityId"));
        String id = "ci-" + spotId + "-" + System.currentTimeMillis();
        Map<String, Object> checkIn = map(
            "id", id,
            "userId", userId,
            "cityId", cityId,
            "spotId", spotId,
            "tripId", tripId,
            "createdAt", Instant.now().toString(),
            "visitedAt", visitedAt == null || visitedAt.isBlank() ? Instant.now().toString() : visitedAt,
            "moodText", moodText == null ? "" : moodText,
            "type", type == null ? "manual" : type,
            "location", location,
            "distanceMeters", Math.round(distance),
            "photoIds", photoIds == null ? new ArrayList<>() : new ArrayList<>(photoIds)
        );
        checkIns.put(id, checkIn);
        if (idempotencyKey != null) {
            checkInRequests.put(idempotencyKey, id);
        }
        saveCheckIn(checkIn, clientRequestId);

        Map<String, Object> spotState = spotState(userId, spotId);
        spotState.put("status", "lit");
        spotState.put("canCheckIn", false);
        Map<String, Object> city = cities.get(cityId);
        Map<String, Object> cityState = cityState(userId, cityId);
        cityState.put("lit", true);
        cityState.put("visitedAt", LocalDate.now().toString());
        saveUserSpotState(spotState);
        saveUserCityState(cityState);

        if (tripId != null) {
            Map<String, Object> trip = trips.get(tripId);
            appendUnique(trip, "spotIds", spotId);
            appendUnique(trip, "checkInIds", id);
            trip.put("photoCount", ((Number) trip.getOrDefault("photoCount", 0)).intValue() + (photoIds == null ? 0 : photoIds.size()));
            trip.put("updatedAt", Instant.now().toString());
            updateTripSummary(trip);
            saveTrip(trip);
        }
        List<Map<String, Object>> unlockedAchievements = refreshAchievementProgress(userId);
        Map<String, Object> result = checkInMutationResult(checkIn, unlockedAchievements);
        persistSnapshot();
        return result;
    }

    public synchronized Map<String, Object> manualLight(String userId, String cityId, boolean lit) {
        refreshFoundationFromDatabase();
        Map<String, Object> city = cities.get(cityId);
        if (city == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.CITY_NOT_FOUND, "City not found.", map("cityId", cityId));
        }
        Map<String, Object> state = cityState(userId, cityId);
        state.put("manuallyLit", lit);
        state.put("lit", lit || hasLitSpot(userId, cityId));
        if (lit) {
            state.put("visitedAt", LocalDate.now().toString());
        } else if (!hasLitSpot(userId, cityId)) {
            state.remove("visitedAt");
        }
        saveUserCityState(state);
        Map<String, Object> result = map("city", enrichCity(userId, city));
        persistSnapshot();
        return result;
    }

    public synchronized Map<String, Object> wishlistCity(String userId, String cityId, boolean wished) {
        refreshFoundationFromDatabase();
        Map<String, Object> city = cities.get(cityId);
        if (city == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.CITY_NOT_FOUND, "City not found.", map("cityId", cityId));
        }
        cityState(userId, cityId).put("wished", wished);
        saveUserCityState(cityState(userId, cityId));
        Map<String, Object> result = map("city", enrichCity(userId, city));
        persistSnapshot();
        return result;
    }

    public synchronized Map<String, Object> wishlistSpot(String userId, String spotId, boolean wished) {
        refreshFoundationFromDatabase();
        Map<String, Object> spot = spots.get(spotId);
        if (spot == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.SPOT_NOT_FOUND, "Spot not found.", map("spotId", spotId));
        }
        Map<String, Object> state = spotState(userId, spotId);
        if (!"lit".equals(state.get("status"))) {
            state.put("status", wished ? "wishlist" : "available");
            state.put("canCheckIn", spot.get("canCheckIn"));
        }
        saveUserSpotState(state);
        Map<String, Object> result = map("spot", enrichSpot(userId, spot));
        persistSnapshot();
        return result;
    }

    public synchronized List<Map<String, Object>> listPlans(String userId) {
        refreshFeatureStateFromDatabase();
        return plans.values().stream()
            .filter(plan -> userId.equals(plan.get("userId")))
            .map(this::copy)
            .toList();
    }

    public synchronized Map<String, Object> plan(String userId, String planId) {
        refreshFeatureStateFromDatabase();
        Map<String, Object> plan = plans.get(planId);
        if (plan == null || !userId.equals(plan.get("userId"))) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.PLAN_NOT_FOUND, "Plan not found.", map("planId", planId));
        }
        return copy(plan);
    }

    public synchronized Map<String, Object> createWeekendPlan(String userId) {
        String id = "weekend-" + System.currentTimeMillis();
        Map<String, Object> plan = map(
            "id", id,
            "userId", userId,
            "title", "杭州周末探索",
            "cityIds", list("hangzhou"),
            "days", 3,
            "progress", 0,
            "total", 4,
            "coverUrl", cities.get("hangzhou").get("coverUrl"),
            "startHint", "下次出发 · Next Mission",
            "spotIds", list("broken-bridge", "sudi", "lingyin-temple", "leifeng-pagoda"),
            "wishlistCityIds", list("chengdu", "beijing", "nanjing"),
            "createdAt", Instant.now().toString(),
            "updatedAt", Instant.now().toString()
        );
        plans.put(id, plan);
        savePlan(plan);
        persistSnapshot();
        return map("plan", copy(plan));
    }

    public synchronized Map<String, Object> deletePlan(String userId, String planId) {
        Map<String, Object> plan = plans.get(planId);
        if (plan == null || !userId.equals(plan.get("userId"))) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.PLAN_NOT_FOUND, "Plan not found.", map("planId", planId));
        }
        plans.remove(planId);
        deletePlanFromDatabase(planId);
        Map<String, Object> result = map("deleted", true, "planId", planId);
        persistSnapshot();
        return result;
    }

    public synchronized List<Map<String, Object>> communityPosts(String keyword) {
        String normalized = normalize(keyword);
        return communityPosts.stream()
            .filter(item -> normalized.isEmpty() || normalize(String.valueOf(item.get("title")) + " " + item.get("subtitle")).contains(normalized))
            .map(this::copy)
            .toList();
    }

    public synchronized Map<String, Object> uploadTarget(String userId, String fileName, String contentType, String linkedType, UploadTarget target) {
        refreshFeatureStateFromDatabase();
        String id = target.imageId();
        Map<String, Object> image = map(
            "id", id,
            "userId", userId,
            "objectKey", target.objectKey(),
            "url", target.publicUrl(),
            "thumbnailUrl", target.publicUrl(),
            "contentType", contentType == null ? "image/jpeg" : contentType,
            "fileName", fileName,
            "linkedType", linkedType,
            "status", "pending",
            "createdAt", Instant.now().toString()
        );
        images.put(id, image);
        saveImage(image);
        persistSnapshot();
        return map(
            "imageId", id,
            "uploadUrl", target.uploadUrl(),
            "method", target.method(),
            "headers", target.headers(),
            "url", target.publicUrl(),
            "objectKey", target.objectKey()
        );
    }

    public synchronized void markUploaded(String imageId, long size) {
        refreshFeatureStateFromDatabase();
        Map<String, Object> image = images.get(imageId);
        if (image != null) {
            image.put("byteSize", size);
            image.put("status", "uploaded");
            image.put("updatedAt", Instant.now().toString());
            saveImage(image);
            persistSnapshot();
        }
    }

    public synchronized Map<String, Object> confirmImage(String userId, String imageId, String linkedType, String linkedId) {
        refreshFeatureStateFromDatabase();
        Map<String, Object> image = images.get(imageId);
        if (image == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.IMAGE_NOT_FOUND, "Image not found.", map("imageId", imageId));
        }
        if (!userId.equals(image.get("userId"))) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.IMAGE_NOT_FOUND, "Image not found.", map("imageId", imageId));
        }
        image.put("linkedType", linkedType);
        image.put("linkedId", linkedId);
        image.put("status", "confirmed");
        image.put("updatedAt", Instant.now().toString());
        saveImage(image);
        Map<String, Object> result = copy(image);
        persistSnapshot();
        return result;
    }

    public synchronized AiMemoryGenerateInput aiMemoryInput(String userId, String tripId, String style, String extraPrompt) {
        refreshTripCheckInFromDatabase();
        refreshFeatureStateFromDatabase();
        Map<String, Object> trip = trip(userId, tripId);
        List<String> spotIds = stringList(trip.get("spotIds"));
        if (spotIds.isEmpty()) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, ErrorCode.AI_MEMORY_NOT_READY, "Trip needs at least one spot.");
        }
        List<String> cityNames = stringList(trip.get("cityIds")).stream()
            .map(cities::get)
            .filter(item -> item != null)
            .map(item -> String.valueOf(item.get("name")))
            .toList();
        List<String> spotNames = spotIds.stream()
            .map(spots::get)
            .filter(item -> item != null)
            .map(item -> String.valueOf(item.get("name")))
            .toList();
        List<String> moodTexts = checkIns.values().stream()
            .filter(item -> tripId.equals(item.get("tripId")) && userId.equals(item.get("userId")))
            .map(item -> String.valueOf(item.getOrDefault("moodText", "")))
            .filter(item -> !item.isBlank())
            .toList();

        return new AiMemoryGenerateInput(
            tripId,
            String.valueOf(trip.get("title")),
            cityNames,
            String.valueOf(trip.get("startDate")),
            String.valueOf(trip.get("endDate")),
            ((Number) trip.get("days")).intValue(),
            spotNames,
            moodTexts,
            ((Number) trip.getOrDefault("photoCount", 0)).intValue(),
            stringList(trip.get("photoUrls")),
            spotIds,
            style,
            extraPrompt
        );
    }

    public synchronized Map<String, Object> saveMemory(String userId, String tripId, String title, String content, String summary, String shareText, String style) {
        refreshFeatureStateFromDatabase();
        trip(userId, tripId);
        String id = "memory-" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        Map<String, Object> memory = map(
            "id", id,
            "userId", userId,
            "tripId", tripId,
            "title", title,
            "summary", summary,
            "content", content,
            "shareText", shareText,
            "style", style,
            "photoUrls", trips.get(tripId).get("photoUrls"),
            "spotIds", trips.get(tripId).get("spotIds"),
            "status", "completed",
            "generatedAt", Instant.now().toString()
        );
        aiMemories.put(id, memory);
        trips.get(tripId).put("aiMemoryId", id);
        saveAiMemory(memory);
        saveTrip(trips.get(tripId));
        Map<String, Object> result = copy(memory);
        persistSnapshot();
        return result;
    }

    public synchronized Map<String, Object> achievementsWithQuests() {
        refreshFeatureStateFromDatabase();
        return map(
            "achievements", achievements.stream().map(this::copy).toList(),
            "quests", quests.stream().map(this::copy).toList()
        );
    }

    private void persistSnapshot() {
        materializeUserScopedState();
        snapshotRepository.save(map(
            "users", users,
            "cities", cities,
            "spots", spots,
            "trips", trips,
            "checkIns", checkIns,
            "aiMemories", aiMemories,
            "images", images,
            "plans", plans,
            "userCityStates", userCityStates,
            "userSpotStates", userSpotStates,
            "checkInRequests", checkInRequests,
            "achievements", achievements,
            "quests", quests,
            "communityPosts", communityPosts,
            "smsCodes", smsCodes
        ));
    }

    private void materializeUserScopedState() {
        for (String userId : users.keySet()) {
            cities.keySet().forEach(cityId -> cityState(userId, cityId));
            spots.keySet().forEach(spotId -> spotState(userId, spotId));
        }
    }

    private void restoreSnapshot(Map<String, Object> snapshot) {
        replaceMap(users, snapshot.get("users"));
        replaceMap(cities, snapshot.get("cities"));
        replaceMap(spots, snapshot.get("spots"));
        replaceMap(trips, snapshot.get("trips"));
        replaceMap(checkIns, snapshot.get("checkIns"));
        replaceMap(aiMemories, snapshot.get("aiMemories"));
        replaceMap(images, snapshot.get("images"));
        replaceMap(plans, snapshot.get("plans"));
        replaceMap(userCityStates, snapshot.get("userCityStates"));
        replaceMap(userSpotStates, snapshot.get("userSpotStates"));
        replaceStringMap(checkInRequests, snapshot.get("checkInRequests"));
        replaceList(achievements, snapshot.get("achievements"));
        replaceList(quests, snapshot.get("quests"));
        replaceList(communityPosts, snapshot.get("communityPosts"));
        replaceStringMap(smsCodes, snapshot.get("smsCodes"));
    }

    private void refreshFoundationFromDatabase() {
        if (foundationRepository == null || !foundationRepository.hasFoundationRows()) {
            return;
        }
        Map<String, Object> foundation = foundationRepository.loadFoundation();
        mergeMap(users, foundation.get("users"));
        mergeMap(cities, foundation.get("cities"));
        mergeMap(spots, foundation.get("spots"));
        replaceMap(userCityStates, foundation.get("userCityStates"));
        replaceMap(userSpotStates, foundation.get("userSpotStates"));
    }

    private void refreshTripCheckInFromDatabase() {
        if (runtimeRepository == null || !runtimeRepository.hasRuntimeRows()) {
            return;
        }
        Map<String, Object> runtime = runtimeRepository.loadTripCheckInState();
        mergeMap(trips, runtime.get("trips"));
        mergeMap(checkIns, runtime.get("checkIns"));
        replaceStringMap(checkInRequests, runtime.get("checkInRequests"));
    }

    private void refreshFeatureStateFromDatabase() {
        if (featureRepository == null || !featureRepository.hasFeatureRows()) {
            return;
        }
        Map<String, Object> feature = featureRepository.loadFeatureState();
        mergeMap(images, feature.get("images"));
        mergeMap(aiMemories, feature.get("aiMemories"));
        mergeMap(plans, feature.get("plans"));
        mergeList(achievements, feature.get("achievements"));
        mergeList(quests, feature.get("quests"));
    }

    private void saveUser(Map<String, Object> user) {
        if (foundationRepository != null) {
            foundationRepository.saveUser(user);
        }
    }

    private void saveUserCityState(Map<String, Object> state) {
        if (foundationRepository != null) {
            foundationRepository.saveUserCityState(state);
        }
    }

    private void saveUserSpotState(Map<String, Object> state) {
        if (foundationRepository != null) {
            foundationRepository.saveUserSpotState(state);
        }
    }

    private void saveTrip(Map<String, Object> trip) {
        if (runtimeRepository != null) {
            runtimeRepository.saveTrip(trip);
        }
    }

    private void saveCheckIn(Map<String, Object> checkIn, String clientRequestId) {
        if (runtimeRepository != null) {
            runtimeRepository.saveCheckIn(checkIn, clientRequestId);
        }
    }

    private void saveImage(Map<String, Object> image) {
        if (featureRepository != null) {
            featureRepository.saveImage(image);
        }
    }

    private void saveAiMemory(Map<String, Object> memory) {
        if (featureRepository != null) {
            featureRepository.saveAiMemory(memory);
        }
    }

    private void savePlan(Map<String, Object> plan) {
        if (featureRepository != null) {
            featureRepository.savePlan(plan);
        }
    }

    private void deletePlanFromDatabase(String planId) {
        if (featureRepository != null) {
            featureRepository.deletePlan(planId);
        }
    }

    private void saveUserAchievement(String userId, Map<String, Object> achievement) {
        if (featureRepository != null) {
            featureRepository.saveUserAchievement(userId, achievement);
        }
    }

    private void seed() {
        users.put("u-nicola", map(
            "id", "u-nicola",
            "nickname", "Nicola",
            "avatarUrl", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
            "level", "Lv.12",
            "title", "城市漫游者",
            "litCityCount", 0,
            "exploredSpotCount", 0,
            "aiMemoryCount", 0,
            "achievementCount", 0,
            "provinceCount", 0,
            "tripCount", 0
        ));

        addCity("hangzhou", "杭州", "浙江", true, false, "2026-05-03", 30.2741, 120.1551, 62, 63,
            "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=80",
            "湖光、茶田、老街和雾气，把杭州变成一张适合慢慢点亮的旅行地图。", list("west-lake", "broken-bridge", "sudi", "leifeng-pagoda", "lingyin-temple"), list("西湖", "江南", "周末探索"));
        addCity("beijing", "北京", "北京", true, false, "2025-10-02", 39.9042, 116.4074, 56, 34,
            "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=900&q=80",
            "中轴线、宫墙与长城，让每一次抵达都有厚重的时间感。", list("forbidden-city", "summer-palace", "great-wall"), list("中轴线", "古都", "长城"));
        addCity("shanghai", "上海", "上海", true, false, "2025-09-18", 31.2304, 121.4737, 68, 58,
            "https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?auto=format&fit=crop&w=900&q=80",
            "从外滩到武康路，城市光影适合被收藏成一段轻盈的回忆。", list("bund", "oriental-pearl", "yuyuan"), list("都市", "建筑", "City Walk"));
        addCity("chengdu", "成都", "四川", false, true, null, 30.5728, 104.0668, 39, 60,
            "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=900&q=80",
            "巷子、茶馆和慢下来的下午，是成都最适合旅行者停留的部分。", list("kuanzhai", "wuhou", "panda-base"), list("慢生活", "烟火气", "熊猫"));
        addCity("nanjing", "南京", "江苏", true, false, null, 32.0603, 118.7969, 63, 56,
            "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=900&q=80",
            "梧桐、城墙和秦淮河，把南京的旅行节奏压得很温柔。", list("confucius-temple", "xuanwu-lake", "sun-yat-sen"), list("秦淮", "古都", "博物馆"));
        Object[][] moreCities = {
            {"suzhou", "苏州", "江苏", 31.2989, 120.5853, 61, 59, true, false},
            {"xian", "西安", "陕西", 34.3416, 108.9398, 45, 49, false, true},
            {"xiamen", "厦门", "福建", 24.4798, 118.0894, 60, 75, false, false},
            {"guangzhou", "广州", "广东", 23.1291, 113.2644, 47, 78, true, false},
            {"shenzhen", "深圳", "广东", 22.5431, 114.0579, 49, 82, true, false},
            {"chongqing", "重庆", "重庆", 29.563, 106.5516, 41, 63, false, true},
            {"qingdao", "青岛", "山东", 36.0671, 120.3826, 64, 45, true, false},
            {"dali", "大理", "云南", 25.6065, 100.2676, 31, 72, false, true},
            {"lijiang", "丽江", "云南", 26.8565, 100.227, 29, 68, false, false},
            {"wuhan", "武汉", "湖北", 30.5928, 114.3055, 52, 61, true, false},
            {"changsha", "长沙", "湖南", 28.2282, 112.9388, 50, 67, false, false},
            {"harbin", "哈尔滨", "黑龙江", 45.8038, 126.5349, 72, 18, false, true},
            {"kunming", "昆明", "云南", 25.0389, 102.7183, 34, 74, true, false}
        };
        for (Object[] city : moreCities) {
            boolean lit = (boolean) city[7];
            boolean wished = (boolean) city[8];
            addCity((String) city[0], (String) city[1], (String) city[2], lit, wished, null, (double) city[3], (double) city[4], (int) city[5], (int) city[6],
                "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
                lit ? city[1] + "已经被 Nicola 点亮，成为个人旅行地图上的一枚柔和光点。" : city[1] + "还等待被点亮，适合放进下一次旅行计划。",
                new ArrayList<>(),
                lit ? list("已点亮", "旅行足迹") : wished ? list("心愿", "待点亮") : list("待点亮", "城市节点"));
        }

        addSpot("west-lake", "hangzhou", "西湖", "1.2km", 500, 30.259, 120.149, "lit", false,
            "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=500&q=80", "西湖是杭州旅行地图的核心节点，湖面、桥影和山色组成了最温柔的城市轮廓。", list("湖泊", "城市地标"), list("west-lake-ten"), list("p1", "p2"));
        addSpot("broken-bridge", "hangzhou", "断桥残雪", "280m", 500, 30.2617, 120.1526, "available", true,
            "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=500&q=80", "西湖十景之一，适合作为杭州周末探索的第一枚新光点。", list("西湖十景", "可点亮"), list("west-lake-ten"), new ArrayList<>());
        addSpot("sudi", "hangzhou", "苏堤春晓", "1.8km", 500, 30.2465, 120.1438, "wishlist", true,
            "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80", "湖边长堤和树影很适合慢慢走完，也适合被加入下一次旅行计划。", list("西湖十景", "心愿"), list("west-lake-ten"), new ArrayList<>());
        addSpot("leifeng-pagoda", "hangzhou", "雷峰塔", "2.4km", 500, 30.2325, 120.1487, "lit", false,
            "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=500&q=80", "黄昏时分的雷峰塔，是杭州旅行回忆里很有辨识度的一页。", list("西湖十景", "已点亮"), list("west-lake-ten"), list("p3"));
        addSpot("lingyin-temple", "hangzhou", "灵隐寺", "6.8km", 500, 30.24, 120.1027, "available", true,
            "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=500&q=80", "山林里的寺院节点，适合在杭州周末探索中安排半天。", list("寺庙", "可点亮"), new ArrayList<>(), new ArrayList<>());
        addSpot("forbidden-city", "beijing", "故宫", "1160km", 500, 39.9163, 116.3972, "lit", false,
            "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=500&q=80", "北京旅行地图里的核心节点，宫墙和屋脊带着强烈的时间感。", list("古都", "建筑"), new ArrayList<>(), new ArrayList<>());
        addSpot("summer-palace", "beijing", "颐和园", "1172km", 500, 39.9999, 116.2755, "lit", false,
            "https://images.unsplash.com/photo-1565585527912-c794f15f820b?auto=format&fit=crop&w=500&q=80", "湖面与长廊组成了北京更松弛的一面。", list("园林", "已点亮"), new ArrayList<>(), new ArrayList<>());
        addSpot("great-wall", "beijing", "八达岭长城", "1194km", 500, 40.3544, 116.0061, "wishlist", false,
            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=500&q=80", "下一次北方旅行里值得加入计划的高光节点。", list("长城", "心愿"), new ArrayList<>(), new ArrayList<>());
        addSpot("bund", "shanghai", "外滩", "170km", 500, 31.2401, 121.4908, "lit", false,
            "https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?auto=format&fit=crop&w=500&q=80", "江风、灯光和建筑立面，是上海城市漫游的标志性开场。", list("都市", "已点亮"), new ArrayList<>(), new ArrayList<>());
        addSpot("oriental-pearl", "shanghai", "东方明珠", "172km", 500, 31.2397, 121.4998, "lit", false,
            "https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?auto=format&fit=crop&w=500&q=80", "上海夜色中的发光节点。", list("地标", "已点亮"), new ArrayList<>(), new ArrayList<>());
        addSpot("yuyuan", "shanghai", "豫园", "169km", 500, 31.2272, 121.4921, "wishlist", false,
            "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=500&q=80", "古典园林和城市烟火交织的地点。", list("园林", "心愿"), new ArrayList<>(), new ArrayList<>());
        addSpot("confucius-temple", "nanjing", "夫子庙", "280km", 500, 32.0207, 118.7882, "lit", false,
            "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=500&q=80", "秦淮河边的夜色节点。", list("秦淮", "已点亮"), new ArrayList<>(), new ArrayList<>());
        addSpot("xuanwu-lake", "nanjing", "玄武湖", "282km", 500, 32.0734, 118.7939, "lit", false,
            "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=500&q=80", "城市里柔和开阔的湖面。", list("湖泊", "已点亮"), new ArrayList<>(), new ArrayList<>());
        addSpot("sun-yat-sen", "nanjing", "中山陵", "286km", 500, 32.0647, 118.8485, "wishlist", false,
            "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=500&q=80", "南京旅行里的山林和历史节点。", list("历史", "心愿"), new ArrayList<>(), new ArrayList<>());
        addSpot("kuanzhai", "chengdu", "宽窄巷子", "1580km", 500, 30.6722, 104.0525, "available", true,
            "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=500&q=80", "成都慢生活的城市入口。", list("烟火气", "可点亮"), new ArrayList<>(), new ArrayList<>());

        trips.put("hangzhou-3-days", map(
            "id", "hangzhou-3-days",
            "userId", "u-nicola",
            "title", "杭州 3 日游",
            "cityIds", list("hangzhou"),
            "startDate", "2026-05-01",
            "endDate", "2026-05-03",
            "days", 3,
            "spotIds", list("west-lake", "leifeng-pagoda", "broken-bridge", "sudi"),
            "checkInIds", list("ci-west-lake", "ci-leifeng-pagoda"),
            "photoUrls", list(
                "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=500&q=80",
                "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=500&q=80"
            ),
            "photoCount", 36,
            "coverUrl", "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=80",
            "aiMemoryId", "memory-hangzhou",
            "summary", "3 天 · 1 座城市 · 7 个景点 · 36 张照片",
            "visibility", "private",
            "createdAt", "2026-05-03T12:00:00.000Z",
            "updatedAt", "2026-06-06T14:00:00.000Z"
        ));
        checkIns.put("ci-west-lake", map("id", "ci-west-lake", "userId", "u-nicola", "cityId", "hangzhou", "spotId", "west-lake", "tripId", "hangzhou-3-days", "createdAt", "2026-05-01T09:20:00.000Z", "moodText", "清晨的西湖很安静，像一张慢慢亮起来的地图。", "type", "mock-gps"));
        checkIns.put("ci-leifeng-pagoda", map("id", "ci-leifeng-pagoda", "userId", "u-nicola", "cityId", "hangzhou", "spotId", "leifeng-pagoda", "tripId", "hangzhou-3-days", "createdAt", "2026-05-02T17:48:00.000Z", "moodText", "黄昏的塔影很适合被收进旅行回忆。", "type", "mock-gps"));
        aiMemories.put("memory-hangzhou", map(
            "id", "memory-hangzhou",
            "userId", "u-nicola",
            "tripId", "hangzhou-3-days",
            "title", "在杭州，把时间走慢",
            "summary", "3 天，1 座城市，7 个景点，36 张照片。",
            "content", "清晨的西湖像一张安静的地图，断桥、苏堤和远处的山影被一点点点亮。后来去到湖边和老街，风里有水汽，也有很淡的茶香。",
            "shareText", "杭州 3 日游：把西湖、断桥和茶香写进一段慢下来的旅行回忆。",
            "style", "自然日记",
            "photoUrls", trips.get("hangzhou-3-days").get("photoUrls"),
            "spotIds", trips.get("hangzhou-3-days").get("spotIds"),
            "status", "completed",
            "generatedAt", "2026-06-06T14:00:00.000Z"
        ));

        achievements.add(map("id", "first-departure", "title", "初次出发", "description", "完成第 1 次城市点亮", "unlocked", true, "unlockedAt", "2024-04-12", "tone", "mint"));
        achievements.add(map("id", "city-wanderer", "title", "城市漫游者", "description", "点亮 5 座城市", "unlocked", true, "unlockedAt", "2024-09-01", "tone", "purple"));
        achievements.add(map("id", "west-lake-first", "title", "西湖初印象", "description", "打卡任意 1 个西湖十景", "unlocked", true, "unlockedAt", "2026-05-01", "tone", "gold"));
        achievements.add(map("id", "west-lake-collector", "title", "西湖收集家", "description", "完成西湖十景 10/10", "unlocked", false, "tone", "blue"));
        quests.add(map("id", "west-lake-ten", "title", "西湖十景", "subtitle", "4 / 10 已点亮", "description", "沿着湖岸和山影收集杭州最经典的十个景致，完成后解锁西湖收集家徽章。", "progress", 4, "total", 10, "coverUrl", "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=80", "rewardAchievementId", "west-lake-collector", "spotIds", list("west-lake", "broken-bridge", "sudi", "leifeng-pagoda"), "cityIds", list("hangzhou")));
        quests.add(map("id", "five-mountains", "title", "中国五岳", "subtitle", "0 / 5 已点亮", "description", "把五座名山加入长期旅行目标，适合一年一年慢慢完成。", "progress", 0, "total", 5, "coverUrl", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80", "rewardAchievementId", "city-wanderer", "spotIds", new ArrayList<>(), "cityIds", list("beijing", "xian")));
        quests.add(map("id", "jiangnan-towns", "title", "江南六大古镇", "subtitle", "2 / 6 已点亮", "description", "把水巷、石桥和白墙黑瓦串成一条柔和的江南路线。", "progress", 2, "total", 6, "coverUrl", "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=900&q=80", "rewardAchievementId", "first-departure", "spotIds", new ArrayList<>(), "cityIds", list("hangzhou", "suzhou", "nanjing")));
        plans.put("hangzhou-weekend", map("id", "hangzhou-weekend", "userId", "u-nicola", "title", "杭州周末探索", "cityIds", list("hangzhou"), "days", 3, "progress", 2, "total", 8, "coverUrl", "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80", "startHint", "下次出发 · Next Mission", "spotIds", list("broken-bridge", "sudi", "lingyin-temple", "leifeng-pagoda"), "wishlistCityIds", list("chengdu", "beijing", "nanjing"), "createdAt", "2026-06-06T14:00:00.000Z", "updatedAt", "2026-06-06T14:00:00.000Z"));
        communityPosts.add(map("id", "route-hangzhou", "type", "route", "title", "杭州 3 日探索路线", "subtitle", "7 个打卡点 · 3 天 · 2.1k 收藏", "author", "Nicola", "linkedId", "hangzhou-3-days", "actionLabel", "加入我的计划", "progress", 86));
        communityPosts.add(map("id", "memory-post-hangzhou", "type", "ai-memory", "title", "在杭州，把时间走慢", "subtitle", "36 张照片 · AI 回忆", "author", "小森", "imageUrl", "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80", "linkedId", "memory-hangzhou"));
        communityPosts.add(map("id", "quest-west-lake", "type", "quest", "title", "西湖十景继续收集", "subtitle", "4 / 10 已点亮 · 完成解锁徽章", "author", "TravelAround", "linkedId", "west-lake-ten", "actionLabel", "查看任务", "progress", 40));
        communityPosts.add(map("id", "achievement-west-lake", "type", "achievement", "title", "小森完成了「西湖十景」", "subtitle", "10 / 10 已点亮 · 成就分享", "author", "小森", "linkedId", "west-lake-collector", "actionLabel", "查看成就", "progress", 100));
    }

    private Map<String, Object> newUser(String userId, String nickname, String phone) {
        return map(
            "id", userId,
            "nickname", nickname,
            "avatarUrl", null,
            "phone", phone,
            "level", "Lv.1",
            "title", "旅行新手"
        );
    }

    private Map<String, Object> findUserByPhone(String phone) {
        for (Map<String, Object> user : users.values()) {
            if (phone.equals(user.get("phone"))) {
                return user;
            }
        }
        return null;
    }

    private String userIdForPhone(String phone) {
        String normalized = phone.replaceAll("[^0-9A-Za-z]", "").toLowerCase(Locale.ROOT);
        if (normalized.isBlank()) {
            normalized = "phone";
        }
        String hash = Integer.toUnsignedString(phone.hashCode(), 36);
        int maxNormalizedLength = Math.max(1, 64 - "u-phone--".length() - hash.length());
        if (normalized.length() > maxNormalizedLength) {
            normalized = normalized.substring(0, maxNormalizedLength);
        }
        return "u-phone-" + normalized + "-" + hash;
    }

    private String phoneSuffix(String phone) {
        String digits = phone.replaceAll("\\D", "");
        if (digits.length() >= 4) {
            return digits.substring(digits.length() - 4);
        }
        return Integer.toUnsignedString(phone.hashCode(), 36);
    }

    private void addCity(String id, String name, String province, boolean lit, boolean wished, String visitedAt, double latitude, double longitude, int mapX, int mapY, String coverUrl, String description, List<String> spotIds, List<String> tags) {
        Map<String, Object> city = map(
            "id", id,
            "name", name,
            "province", province,
            "lit", lit,
            "wished", wished,
            "coordinates", map("latitude", latitude, "longitude", longitude),
            "mapX", mapX,
            "mapY", mapY,
            "coverUrl", coverUrl,
            "description", description,
            "spotIds", spotIds,
            "tags", tags
        );
        if (visitedAt != null) {
            city.put("visitedAt", visitedAt);
        }
        cities.put(id, city);
    }

    private void addSpot(String id, String cityId, String name, String distance, int radius, double latitude, double longitude, String status, boolean canCheckIn, String coverUrl, String description, List<String> tags, List<String> questIds, List<String> photoIds) {
        spots.put(id, map(
            "id", id,
            "cityId", cityId,
            "name", name,
            "distance", distance,
            "radius", radius,
            "coordinates", map("latitude", latitude, "longitude", longitude),
            "status", status,
            "canCheckIn", canCheckIn,
            "coverUrl", coverUrl,
            "description", description,
            "tags", tags,
            "questIds", questIds,
            "photoIds", photoIds
        ));
    }

    private Map<String, Object> enrichCity(String userId, Map<String, Object> city) {
        Map<String, Object> result = copy(city);
        Map<String, Object> state = cityState(userId, String.valueOf(city.get("id")));
        result.put("lit", state.get("lit"));
        result.put("manuallyLit", state.get("manuallyLit"));
        result.put("wished", state.get("wished"));
        if (state.containsKey("visitedAt")) {
            result.put("visitedAt", state.get("visitedAt"));
        } else {
            result.remove("visitedAt");
        }
        long litSpotCount = spots.values().stream().filter(spot -> city.get("id").equals(spot.get("cityId")) && "lit".equals(effectiveSpotStatus(userId, spot))).count();
        long totalSpotCount = spots.values().stream().filter(spot -> city.get("id").equals(spot.get("cityId"))).count();
        long tripCount = trips.values().stream().filter(trip -> userId.equals(trip.get("userId")) && stringList(trip.get("cityIds")).contains(city.get("id"))).count();
        result.put("stats", map("litSpotCount", litSpotCount, "totalSpotCount", totalSpotCount, "tripCount", tripCount, "photoCount", 0));
        return result;
    }

    private Map<String, Object> checkInMutationResult(Map<String, Object> checkIn, List<Map<String, Object>> unlockedAchievements) {
        String spotId = String.valueOf(checkIn.get("spotId"));
        String cityId = String.valueOf(checkIn.get("cityId"));
        Object tripId = checkIn.get("tripId");

        Map<String, Object> result = map(
            "checkIn", copy(checkIn),
            "spot", enrichSpot(String.valueOf(checkIn.get("userId")), spots.get(spotId)),
            "city", enrichCity(String.valueOf(checkIn.get("userId")), cities.get(cityId)),
            "unlockedAchievements", unlockedAchievements
        );
        if (tripId != null && trips.containsKey(String.valueOf(tripId))) {
            result.put("trip", copy(trips.get(String.valueOf(tripId))));
        }
        return result;
    }

    private List<Map<String, Object>> refreshAchievementProgress(String userId) {
        refreshFeatureStateFromDatabase();
        List<Map<String, Object>> unlocked = new ArrayList<>();
        for (Map<String, Object> quest : quests) {
            List<String> questSpotIds = stringList(quest.get("spotIds"));
            if (questSpotIds.isEmpty()) {
                continue;
            }
            long progress = questSpotIds.stream().filter(spotId -> {
                Map<String, Object> spot = spots.get(spotId);
                return spot != null && "lit".equals(effectiveSpotStatus(userId, spot));
            }).count();
            quest.put("progress", progress);
            quest.put("subtitle", progress + " / " + quest.get("total") + " 已点亮");
            if (progress >= ((Number) quest.get("total")).longValue()) {
                String achievementId = String.valueOf(quest.get("rewardAchievementId"));
                achievements.stream()
                    .filter(item -> achievementId.equals(item.get("id")) && !Boolean.TRUE.equals(item.get("unlocked")))
                    .findFirst()
                    .ifPresent(item -> {
                        item.put("unlocked", true);
                        item.put("unlockedAt", LocalDate.now().toString());
                        saveUserAchievement(userId, item);
                        unlocked.add(copy(item));
                    });
            }
        }
        return unlocked;
    }

    private Map<String, Object> enrichSpot(String userId, Map<String, Object> spot) {
        Map<String, Object> result = copy(spot);
        Map<String, Object> state = spotState(userId, String.valueOf(spot.get("id")));
        result.put("status", state.get("status"));
        result.put("canCheckIn", state.get("canCheckIn"));
        Map<String, Object> city = cities.get(spot.get("cityId"));
        if (city != null) {
            result.put("cityName", city.get("name"));
        }
        result.put("distanceMeters", 0);
        return result;
    }

    private boolean matchesCityStatus(String userId, Map<String, Object> city, String status) {
        if (status == null || status.isBlank() || "all".equals(status)) {
            return true;
        }
        Map<String, Object> state = cityState(userId, String.valueOf(city.get("id")));
        return switch (status) {
            case "lit" -> Boolean.TRUE.equals(state.get("lit"));
            case "unlit" -> !Boolean.TRUE.equals(state.get("lit"));
            case "wishlist" -> Boolean.TRUE.equals(state.get("wished"));
            default -> true;
        };
    }

    private Map<String, Object> cityState(String userId, String cityId) {
        Map<String, Object> city = cities.get(cityId);
        if (city == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.CITY_NOT_FOUND, "City not found.", map("cityId", cityId));
        }
        return userCityStates.computeIfAbsent(userKey(userId, cityId), key -> {
            boolean useSeedState = "u-nicola".equals(userId);
            Map<String, Object> state = map(
                "userId", userId,
                "cityId", cityId,
                "lit", useSeedState && Boolean.TRUE.equals(city.get("lit")),
                "manuallyLit", useSeedState && Boolean.TRUE.equals(city.getOrDefault("manuallyLit", false)),
                "wished", useSeedState && Boolean.TRUE.equals(city.get("wished"))
            );
            if (useSeedState && city.containsKey("visitedAt")) {
                state.put("visitedAt", city.get("visitedAt"));
            }
            return state;
        });
    }

    private Map<String, Object> spotState(String userId, String spotId) {
        Map<String, Object> spot = spots.get(spotId);
        if (spot == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, ErrorCode.SPOT_NOT_FOUND, "Spot not found.", map("spotId", spotId));
        }
        return userSpotStates.computeIfAbsent(userKey(userId, spotId), key -> {
            boolean useSeedState = "u-nicola".equals(userId);
            String seedStatus = String.valueOf(spot.get("status"));
            String status = useSeedState || "locked".equals(seedStatus) ? seedStatus : "available";
            return map(
                "userId", userId,
                "spotId", spotId,
                "status", status,
                "canCheckIn", spot.get("canCheckIn")
            );
        });
    }

    private String effectiveSpotStatus(String userId, Map<String, Object> spot) {
        return String.valueOf(spotState(userId, String.valueOf(spot.get("id"))).get("status"));
    }

    private String userKey(String userId, String id) {
        return userId + ":" + id;
    }

    private boolean hasLitSpot(String userId, String cityId) {
        return spots.values().stream().anyMatch(spot -> cityId.equals(spot.get("cityId")) && "lit".equals(effectiveSpotStatus(userId, spot)));
    }

    private void refreshUserStats(Map<String, Object> user) {
        String userId = String.valueOf(user.get("id"));
        long litCityCount = cities.values().stream().filter(city -> Boolean.TRUE.equals(cityState(userId, String.valueOf(city.get("id"))).get("lit"))).count();
        long exploredSpotCount = spots.values().stream().filter(spot -> "lit".equals(effectiveSpotStatus(userId, spot))).count();
        long achievementCount = achievements.stream().filter(item -> Boolean.TRUE.equals(item.get("unlocked"))).count();
        long provinceCount = cities.values().stream().filter(city -> Boolean.TRUE.equals(cityState(userId, String.valueOf(city.get("id"))).get("lit"))).map(city -> city.get("province")).distinct().count();
        user.put("litCityCount", litCityCount);
        user.put("exploredSpotCount", exploredSpotCount);
        user.put("aiMemoryCount", aiMemories.values().stream().filter(memory -> userId.equals(memory.get("userId"))).count());
        user.put("achievementCount", achievementCount);
        user.put("provinceCount", provinceCount);
        user.put("tripCount", trips.values().stream().filter(trip -> userId.equals(trip.get("userId"))).count());
    }

    @SuppressWarnings("unchecked")
    private List<String> stringList(Object value) {
        if (value instanceof List<?> list) {
            return list.stream().map(String::valueOf).toList();
        }
        return new ArrayList<>();
    }

    @SuppressWarnings("unchecked")
    private void appendUnique(Map<String, Object> target, String key, String value) {
        List<String> list = new ArrayList<>(stringList(target.get(key)));
        if (!list.contains(value)) {
            list.add(value);
        }
        target.put(key, list);
    }

    private void updateTripSummary(Map<String, Object> trip) {
        List<String> cityIds = stringList(trip.get("cityIds"));
        List<String> spotIds = stringList(trip.get("spotIds"));
        trip.put("summary", trip.get("days") + " 天 · " + cityIds.size() + " 座城市 · " + spotIds.size() + " 个景点 · " + trip.get("photoCount") + " 张照片");
    }

    private double distanceMeters(double lat1, double lon1, double lat2, double lon2) {
        double earthRadius = 6371000;
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
            + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
            * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    private String normalize(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT).trim();
    }

    private String slug(String value) {
        return value.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9\\u4e00-\\u9fa5]+", "-").replaceAll("(^-|-$)", "");
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> mapValue(Object value) {
        return (Map<String, Object>) value;
    }

    private double number(Object value) {
        return ((Number) value).doubleValue();
    }

    private List<String> list(String... values) {
        return new ArrayList<>(List.of(values));
    }

    @SuppressWarnings("unchecked")
    private void replaceMap(Map<String, Map<String, Object>> target, Object value) {
        target.clear();
        if (value instanceof Map<?, ?> source) {
            source.forEach((key, item) -> {
                if (item instanceof Map<?, ?> map) {
                    target.put(String.valueOf(key), copy((Map<String, Object>) map));
                }
            });
        }
    }

    @SuppressWarnings("unchecked")
    private void mergeMap(Map<String, Map<String, Object>> target, Object value) {
        Map<String, Map<String, Object>> previous = new LinkedHashMap<>(target);
        target.clear();
        if (value instanceof Map<?, ?> source) {
            source.forEach((key, item) -> {
                if (item instanceof Map<?, ?> map) {
                    Map<String, Object> merged = previous.containsKey(String.valueOf(key))
                        ? copy(previous.get(String.valueOf(key)))
                        : new LinkedHashMap<>();
                    merged.putAll(copy((Map<String, Object>) map));
                    target.put(String.valueOf(key), merged);
                }
            });
        }
    }

    @SuppressWarnings("unchecked")
    private void mergeList(List<Map<String, Object>> target, Object value) {
        Map<String, Map<String, Object>> previous = new LinkedHashMap<>();
        for (Map<String, Object> item : target) {
            previous.put(String.valueOf(item.get("id")), copy(item));
        }
        target.clear();
        if (value instanceof List<?> source) {
            source.stream()
                .filter(Map.class::isInstance)
                .map(item -> copy((Map<String, Object>) item))
                .forEach(item -> {
                    String id = String.valueOf(item.get("id"));
                    Map<String, Object> merged = previous.containsKey(id) ? previous.get(id) : new LinkedHashMap<>();
                    merged.putAll(item);
                    target.add(merged);
                });
        }
    }

    private void replaceStringMap(Map<String, String> target, Object value) {
        target.clear();
        if (value instanceof Map<?, ?> source) {
            source.forEach((key, item) -> target.put(String.valueOf(key), String.valueOf(item)));
        }
    }

    @SuppressWarnings("unchecked")
    private void replaceList(List<Map<String, Object>> target, Object value) {
        target.clear();
        if (value instanceof List<?> source) {
            source.stream()
                .filter(Map.class::isInstance)
                .map(item -> copy((Map<String, Object>) item))
                .forEach(target::add);
        }
    }

    private Map<String, Object> map(Object... entries) {
        Map<String, Object> result = new LinkedHashMap<>();
        for (int i = 0; i < entries.length; i += 2) {
            result.put(String.valueOf(entries[i]), entries[i + 1]);
        }
        return result;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> copy(Map<String, Object> source) {
        Map<String, Object> result = new LinkedHashMap<>();
        source.forEach((key, value) -> {
            if (value instanceof Map<?, ?> map) {
                result.put(key, copy((Map<String, Object>) map));
            } else if (value instanceof List<?> list) {
                result.put(key, new ArrayList<>(list));
            } else {
                result.put(key, value);
            }
        });
        return result;
    }
}
