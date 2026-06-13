package app.travelaround.core;

import java.util.List;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
interface TravelStoreRuntimeMapper {
    @Select("select count(*) from trips")
    int countTrips();

    @Select("""
        select id, user_id as userId, title, start_date as startDate, end_date as endDate,
               days, photo_count as photoCount, cover_url as coverUrl, ai_memory_id as aiMemoryId,
               summary, visibility, created_at as createdAt, updated_at as updatedAt
        from trips
        order by created_at, id
        """)
    List<TravelStoreRuntimeRows.TripRow> listTrips();

    @Select("select trip_id as tripId, city_id as itemId from trip_cities order by trip_id, sort_order, city_id")
    List<TravelStoreRuntimeRows.TripJoinRow> listTripCities();

    @Select("select trip_id as tripId, spot_id as itemId from trip_spots order by trip_id, sort_order, spot_id")
    List<TravelStoreRuntimeRows.TripJoinRow> listTripSpots();

    @Select("select trip_id as tripId, check_in_id as itemId from trip_check_ins order by trip_id, check_in_id")
    List<TravelStoreRuntimeRows.TripJoinRow> listTripCheckIns();

    @Select("""
        select id, user_id as userId, city_id as cityId, spot_id as spotId, trip_id as tripId,
               type, visited_at as visitedAt, mood_text as moodText, lat, lng,
               distance_meters as distanceMeters, photo_ids as photoIds,
               client_request_id as clientRequestId, created_at as createdAt
        from check_ins
        order by created_at, id
        """)
    List<TravelStoreRuntimeRows.CheckInRow> listCheckIns();

    @Delete("delete from trip_check_ins where trip_id = #{tripId}")
    void deleteTripCheckIns(@Param("tripId") String tripId);

    @Delete("delete from trip_spots where trip_id = #{tripId}")
    void deleteTripSpots(@Param("tripId") String tripId);

    @Delete("delete from trip_cities where trip_id = #{tripId}")
    void deleteTripCities(@Param("tripId") String tripId);

    @Delete("delete from trips where id = #{tripId}")
    void deleteTrip(@Param("tripId") String tripId);

    @Insert("""
        insert into trips (id, user_id, title, start_date, end_date, days, photo_count,
                           cover_url, ai_memory_id, summary, visibility, created_at, updated_at)
        values (#{id}, #{userId}, #{title}, #{startDate}, #{endDate}, #{days}, #{photoCount},
                #{coverUrl}, #{aiMemoryId}, #{summary}, #{visibility}, #{createdAt}, #{updatedAt})
        """)
    void insertTrip(
        @Param("id") String id,
        @Param("userId") String userId,
        @Param("title") String title,
        @Param("startDate") String startDate,
        @Param("endDate") String endDate,
        @Param("days") int days,
        @Param("photoCount") int photoCount,
        @Param("coverUrl") String coverUrl,
        @Param("aiMemoryId") String aiMemoryId,
        @Param("summary") String summary,
        @Param("visibility") String visibility,
        @Param("createdAt") String createdAt,
        @Param("updatedAt") String updatedAt
    );

    @Insert("insert into trip_cities (trip_id, city_id, sort_order) values (#{tripId}, #{cityId}, #{sortOrder})")
    void insertTripCity(@Param("tripId") String tripId, @Param("cityId") String cityId, @Param("sortOrder") int sortOrder);

    @Insert("insert into trip_spots (trip_id, spot_id, sort_order) values (#{tripId}, #{spotId}, #{sortOrder})")
    void insertTripSpot(@Param("tripId") String tripId, @Param("spotId") String spotId, @Param("sortOrder") int sortOrder);

    @Insert("insert into trip_check_ins (trip_id, check_in_id) values (#{tripId}, #{checkInId})")
    void insertTripCheckIn(@Param("tripId") String tripId, @Param("checkInId") String checkInId);

    @Delete("delete from check_ins where id = #{id}")
    void deleteCheckIn(@Param("id") String id);

    @Insert("""
        insert into check_ins (id, user_id, city_id, spot_id, trip_id, type, visited_at,
                               mood_text, lat, lng, distance_meters, photo_ids, client_request_id, created_at)
        values (#{id}, #{userId}, #{cityId}, #{spotId}, #{tripId}, #{type}, #{visitedAt},
                #{moodText}, #{lat}, #{lng}, #{distanceMeters}, #{photoIds}, #{clientRequestId}, #{createdAt})
        """)
    void insertCheckIn(
        @Param("id") String id,
        @Param("userId") String userId,
        @Param("cityId") String cityId,
        @Param("spotId") String spotId,
        @Param("tripId") String tripId,
        @Param("type") String type,
        @Param("visitedAt") String visitedAt,
        @Param("moodText") String moodText,
        @Param("lat") Double lat,
        @Param("lng") Double lng,
        @Param("distanceMeters") Integer distanceMeters,
        @Param("photoIds") String photoIds,
        @Param("clientRequestId") String clientRequestId,
        @Param("createdAt") String createdAt
    );
}
