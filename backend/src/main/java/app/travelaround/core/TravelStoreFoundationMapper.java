package app.travelaround.core;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
interface TravelStoreFoundationMapper {
    @Select("select count(*) from users")
    int countUsers();

    @Select("select count(*) from cities")
    int countCities();

    @Select("select count(*) from spots")
    int countSpots();

    @Select("""
        select id, nickname, avatar_url as avatarUrl, phone, level, title
        from users
        order by id
        """)
    List<TravelStoreFoundationRows.UserRow> listUsers();

    @Select("""
        select id, name, province, lat, lng, map_x as mapX, map_y as mapY,
               cover_url as coverUrl, description, spot_ids as spotIds, tags
        from cities
        order by id
        """)
    List<TravelStoreFoundationRows.CityRow> listCities();

    @Select("""
        select id, city_id as cityId, name, lat, lng, radius, cover_url as coverUrl,
               description, tags, quest_ids as questIds, photo_ids as photoIds
        from spots
        order by id
        """)
    List<TravelStoreFoundationRows.SpotRow> listSpots();

    @Select("""
        select user_id as userId, city_id as cityId, lit, manually_lit as manuallyLit,
               wished, visited_at as visitedAt
        from user_city_states
        order by user_id, city_id
        """)
    List<TravelStoreFoundationRows.UserCityStateRow> listUserCityStates();

    @Select("""
        select user_id as userId, spot_id as spotId, status, can_check_in as canCheckIn
        from user_spot_states
        order by user_id, spot_id
        """)
    List<TravelStoreFoundationRows.UserSpotStateRow> listUserSpotStates();
}
