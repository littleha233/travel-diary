package app.travelaround;

import static org.junit.jupiter.api.Assertions.assertEquals;

import app.travelaround.image.UploadTarget;
import app.travelaround.core.TravelStore;
import app.travelaround.core.TravelStoreSnapshotRepository;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:travelaround-persistence;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1")
class TravelStoreSnapshotPersistenceTests {
    @Autowired
    private TravelStore store;

    @Autowired
    private TravelStoreSnapshotRepository snapshotRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void foundationReadPathUsesRelationalTables() {
        jdbcTemplate.update("update users set phone = ? where id = ?", "13800000000", "u-nicola");
        jdbcTemplate.update("update cities set name = ? where id = ?", "杭州DB", "hangzhou");
        jdbcTemplate.update("update spots set name = ? where id = ?", "断桥DB", "broken-bridge");
        jdbcTemplate.update(
            "update user_city_states set wished = true where user_id = ? and city_id = ?",
            "u-nicola",
            "suzhou"
        );
        jdbcTemplate.update(
            "update user_spot_states set status = ?, can_check_in = false where user_id = ? and spot_id = ?",
            "wishlist",
            "u-nicola",
            "lingyin-temple"
        );

        Map<String, Object> user = store.user("u-nicola");
        Map<String, Object> city = store.city("u-nicola", "hangzhou");
        Map<String, Object> wishedCity = store.city("u-nicola", "suzhou");
        Map<String, Object> spot = store.spot("u-nicola", "broken-bridge");
        Map<String, Object> wishedSpot = store.spot("u-nicola", "lingyin-temple");

        assertEquals("13800000000", user.get("phone"));
        assertEquals("杭州DB", city.get("name"));
        assertEquals(true, wishedCity.get("wished"));
        assertEquals("断桥DB", spot.get("name"));
        assertEquals("wishlist", wishedSpot.get("status"));
        assertEquals(false, wishedSpot.get("canCheckIn"));
    }

    @Test
    void userCityStateIsIsolatedByUser() {
        jdbcTemplate.update(
            "insert into users (id, nickname, avatar_url, phone, level, title) values (?, ?, ?, ?, ?, ?)",
            "u-alex",
            "Alex",
            null,
            null,
            "Lv.1",
            "旅行新手"
        );

        store.wishlistCity("u-alex", "xiamen", true);

        Map<String, Object> alexCity = store.city("u-alex", "xiamen");
        Map<String, Object> nicolaCity = store.city("u-nicola", "xiamen");

        assertEquals(true, alexCity.get("wished"));
        assertEquals(false, nicolaCity.get("wished"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void tripAndCheckInReadPathUsesRelationalTables() {
        jdbcTemplate.update(
            "insert into trips (id, user_id, title, start_date, end_date, days, photo_count, cover_url, summary, visibility) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            "db-trip",
            "u-nicola",
            "DB 旅行",
            "2026-06-20",
            "2026-06-21",
            2,
            0,
            "https://example.com/db-trip.jpg",
            "2 天 · 1 座城市 · 1 个景点 · 0 张照片",
            "private"
        );
        jdbcTemplate.update("insert into trip_cities (trip_id, city_id, sort_order) values (?, ?, ?)", "db-trip", "hangzhou", 0);
        jdbcTemplate.update("insert into trip_spots (trip_id, spot_id, sort_order) values (?, ?, ?)", "db-trip", "broken-bridge", 0);
        jdbcTemplate.update(
            "insert into check_ins (id, user_id, city_id, spot_id, trip_id, type, visited_at, mood_text, distance_meters, photo_ids, client_request_id) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            "ci-db-runtime",
            "u-nicola",
            "hangzhou",
            "broken-bridge",
            "db-trip",
            "manual",
            "2026-06-20T09:00:00Z",
            "DB 读链路",
            0,
            "[]",
            "db-runtime"
        );
        jdbcTemplate.update("insert into trip_check_ins (trip_id, check_in_id) values (?, ?)", "db-trip", "ci-db-runtime");

        Map<String, Object> detail = store.tripDetail("u-nicola", "db-trip");
        Map<String, Object> trip = (Map<String, Object>) detail.get("trip");
        java.util.List<Map<String, Object>> checkIns = (java.util.List<Map<String, Object>>) detail.get("checkIns");

        assertEquals("DB 旅行", trip.get("title"));
        assertEquals("ci-db-runtime", checkIns.get(0).get("id"));
        assertEquals("DB 读链路", checkIns.get(0).get("moodText"));
    }

    @Test
    void duplicateClientRequestIdDoesNotCreateSecondCheckInRow() {
        store.createCheckIn("u-nicola", "broken-bridge", null, "manual", "first", null, null, "2026-06-22T10:00:00.000Z", "unique-db-client");
        store.createCheckIn("u-nicola", "broken-bridge", null, "manual", "second", null, null, "2026-06-22T10:05:00.000Z", "unique-db-client");

        Integer count = jdbcTemplate.queryForObject(
            "select count(*) from check_ins where user_id = ? and client_request_id = ?",
            Integer.class,
            "u-nicola",
            "unique-db-client"
        );

        assertEquals(1, count);
    }

    @Test
    void featureMapperPathsPersistImagesPlansAndAiMemories() {
        UploadTarget target = new UploadTarget(
            "img-phase2",
            "uploads/img-phase2.jpg",
            "http://localhost/upload",
            "http://localhost/public/img-phase2.jpg",
            "PUT",
            Map.of(),
            true
        );

        store.uploadTarget("u-nicola", "phase2.jpg", "image/jpeg", "check-in", target);
        store.markUploaded("img-phase2", 128);
        store.confirmImage("u-nicola", "img-phase2", "check-in", "ci-phase2");
        Integer confirmedImages = jdbcTemplate.queryForObject(
            "select count(*) from images where id = ? and status = ? and linked_id = ?",
            Integer.class,
            "img-phase2",
            "confirmed",
            "ci-phase2"
        );

        Map<String, Object> planResult = store.createWeekendPlan("u-nicola");
        @SuppressWarnings("unchecked")
        Map<String, Object> plan = (Map<String, Object>) planResult.get("plan");
        jdbcTemplate.update("update plans set title = ? where id = ?", "DB 计划", plan.get("id"));
        Map<String, Object> dbPlan = store.plan("u-nicola", String.valueOf(plan.get("id")));

        store.saveMemory("u-nicola", "hangzhou-3-days", "二阶段回忆", "content", "summary", "share", "自然日记");
        Integer memoryCount = jdbcTemplate.queryForObject(
            "select count(*) from ai_memories where title = ? and trip_id = ?",
            Integer.class,
            "二阶段回忆",
            "hangzhou-3-days"
        );

        assertEquals(1, confirmedImages);
        assertEquals("DB 计划", dbPlan.get("title"));
        assertEquals(1, memoryCount);
    }

    @Test
    @SuppressWarnings("unchecked")
    void achievementsAndQuestsReadFromRelationalTables() {
        jdbcTemplate.update("update achievements set title = ? where id = ?", "DB 成就", "first-departure");
        jdbcTemplate.update("update theme_quests set title = ? where id = ?", "DB 任务", "west-lake-ten");

        Map<String, Object> result = store.achievementsWithQuests();
        List<Map<String, Object>> achievements = (List<Map<String, Object>>) result.get("achievements");
        List<Map<String, Object>> quests = (List<Map<String, Object>>) result.get("quests");

        assertEquals("DB 成就", achievements.stream().filter(item -> "first-departure".equals(item.get("id"))).findFirst().orElseThrow().get("title"));
        assertEquals("DB 任务", quests.stream().filter(item -> "west-lake-ten".equals(item.get("id"))).findFirst().orElseThrow().get("title"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void mutationsAreSavedAndCanBeRestoredFromDatabaseSnapshot() {
        store.wishlistCity("u-nicola", "suzhou", true);

        Map<String, Object> snapshot = snapshotRepository.load().orElseThrow();
        Map<String, Object> cityStates = (Map<String, Object>) snapshot.get("userCityStates");
        Map<String, Object> suzhouState = (Map<String, Object>) cityStates.get("u-nicola:suzhou");
        assertEquals(true, suzhouState.get("wished"));

        TravelStore restored = new TravelStore(snapshotRepository);
        restored.restoreOrCreateSnapshot();
        Map<String, Object> city = restored.city("u-nicola", "suzhou");
        assertEquals(true, city.get("wished"));
    }

    @Test
    void mutationsAreProjectedIntoRelationalTables() {
        Map<String, Object> tripResult = store.createTrip("u-nicola", "落库验证", "hangzhou", "2026-06-14", "2026-06-15", "private");
        @SuppressWarnings("unchecked")
        Map<String, Object> trip = (Map<String, Object>) tripResult.get("trip");

        store.createCheckIn("u-nicola", "broken-bridge", String.valueOf(trip.get("id")), "manual", "关系表写入验证", null, null, "2026-06-14T10:00:00.000Z", "persist-check-in");

        Integer wishedCount = jdbcTemplate.queryForObject(
            "select count(*) from user_city_states where user_id = ? and city_id = ?",
            Integer.class,
            "u-nicola",
            "hangzhou"
        );
        Integer tripCount = jdbcTemplate.queryForObject(
            "select count(*) from trips where id = ? and user_id = ?",
            Integer.class,
            trip.get("id"),
            "u-nicola"
        );
        Integer checkInCount = jdbcTemplate.queryForObject(
            "select count(*) from check_ins where client_request_id = ? and spot_id = ?",
            Integer.class,
            "persist-check-in",
            "broken-bridge"
        );
        Integer tripCheckInCount = jdbcTemplate.queryForObject(
            "select count(*) from trip_check_ins where trip_id = ?",
            Integer.class,
            trip.get("id")
        );

        assertEquals(1, wishedCount);
        assertEquals(1, tripCount);
        assertEquals(1, checkInCount);
        assertEquals(1, tripCheckInCount);
    }
}
