package app.travelaround;

import static org.junit.jupiter.api.Assertions.assertEquals;

import app.travelaround.core.TravelStore;
import app.travelaround.core.TravelStoreSnapshotRepository;
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
