package app.travelaround.core;

import java.util.List;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
interface TravelStoreFeatureMapper {
    @Select("select count(*) from images")
    int countImages();

    @Select("select count(*) from ai_memories")
    int countAiMemories();

    @Select("select count(*) from plans")
    int countPlans();

    @Select("select count(*) from achievements")
    int countAchievements();

    @Select("""
        select id, user_id as userId, url, thumbnail_url as thumbnailUrl, content_type as contentType,
               byte_size as byteSize, linked_type as linkedType, linked_id as linkedId,
               status, created_at as createdAt, updated_at as updatedAt
        from images
        order by created_at, id
        """)
    List<TravelStoreFeatureRows.ImageRow> listImages();

    @Delete("delete from images where id = #{id}")
    void deleteImage(@Param("id") String id);

    @Insert("""
        insert into images (id, user_id, url, thumbnail_url, content_type, byte_size,
                            linked_type, linked_id, status, created_at, updated_at)
        values (#{id}, #{userId}, #{url}, #{thumbnailUrl}, #{contentType}, #{byteSize},
                #{linkedType}, #{linkedId}, #{status}, #{createdAt}, #{updatedAt})
        """)
    void insertImage(
        @Param("id") String id,
        @Param("userId") String userId,
        @Param("url") String url,
        @Param("thumbnailUrl") String thumbnailUrl,
        @Param("contentType") String contentType,
        @Param("byteSize") Long byteSize,
        @Param("linkedType") String linkedType,
        @Param("linkedId") String linkedId,
        @Param("status") String status,
        @Param("createdAt") String createdAt,
        @Param("updatedAt") String updatedAt
    );

    @Select("""
        select id, trip_id as tripId, user_id as userId, title, summary, content,
               share_text as shareText, style, status, generated_at as generatedAt
        from ai_memories
        order by generated_at, id
        """)
    List<TravelStoreFeatureRows.AiMemoryRow> listAiMemories();

    @Delete("delete from ai_memories where id = #{id}")
    void deleteAiMemory(@Param("id") String id);

    @Insert("""
        insert into ai_memories (id, trip_id, user_id, title, summary, content, share_text,
                                 style, status, generated_at, created_at, updated_at)
        values (#{id}, #{tripId}, #{userId}, #{title}, #{summary}, #{content}, #{shareText},
                #{style}, #{status}, #{generatedAt}, #{generatedAt}, #{generatedAt})
        """)
    void insertAiMemory(
        @Param("id") String id,
        @Param("tripId") String tripId,
        @Param("userId") String userId,
        @Param("title") String title,
        @Param("summary") String summary,
        @Param("content") String content,
        @Param("shareText") String shareText,
        @Param("style") String style,
        @Param("status") String status,
        @Param("generatedAt") String generatedAt
    );

    @Select("""
        select id, user_id as userId, title, days, progress, total, cover_url as coverUrl,
               start_hint as startHint, created_at as createdAt, updated_at as updatedAt
        from plans
        order by created_at, id
        """)
    List<TravelStoreFeatureRows.PlanRow> listPlans();

    @Select("select plan_id as ownerId, city_id as itemId from plan_cities order by plan_id, sort_order, city_id")
    List<TravelStoreFeatureRows.JoinRow> listPlanCities();

    @Select("select plan_id as ownerId, spot_id as itemId from plan_spots order by plan_id, sort_order, spot_id")
    List<TravelStoreFeatureRows.JoinRow> listPlanSpots();

    @Delete("delete from plan_spots where plan_id = #{planId}")
    void deletePlanSpots(@Param("planId") String planId);

    @Delete("delete from plan_cities where plan_id = #{planId}")
    void deletePlanCities(@Param("planId") String planId);

    @Delete("delete from plans where id = #{planId}")
    void deletePlan(@Param("planId") String planId);

    @Insert("""
        insert into plans (id, user_id, title, days, progress, total, cover_url, start_hint, created_at, updated_at)
        values (#{id}, #{userId}, #{title}, #{days}, #{progress}, #{total}, #{coverUrl}, #{startHint}, #{createdAt}, #{updatedAt})
        """)
    void insertPlan(
        @Param("id") String id,
        @Param("userId") String userId,
        @Param("title") String title,
        @Param("days") int days,
        @Param("progress") int progress,
        @Param("total") int total,
        @Param("coverUrl") String coverUrl,
        @Param("startHint") String startHint,
        @Param("createdAt") String createdAt,
        @Param("updatedAt") String updatedAt
    );

    @Insert("insert into plan_cities (plan_id, city_id, sort_order) values (#{planId}, #{cityId}, #{sortOrder})")
    void insertPlanCity(@Param("planId") String planId, @Param("cityId") String cityId, @Param("sortOrder") int sortOrder);

    @Insert("insert into plan_spots (plan_id, spot_id, sort_order) values (#{planId}, #{spotId}, #{sortOrder})")
    void insertPlanSpot(@Param("planId") String planId, @Param("spotId") String spotId, @Param("sortOrder") int sortOrder);

    @Select("""
        select a.id, a.title, a.description, a.tone,
               coalesce(ua.unlocked, false) as unlocked, ua.unlocked_at as unlockedAt
        from achievements a
        left join user_achievements ua on ua.achievement_id = a.id and ua.user_id = #{userId}
        order by a.id
        """)
    List<TravelStoreFeatureRows.AchievementRow> listAchievements(@Param("userId") String userId);

    @Delete("delete from user_achievements where user_id = #{userId} and achievement_id = #{achievementId}")
    void deleteUserAchievement(@Param("userId") String userId, @Param("achievementId") String achievementId);

    @Insert("""
        insert into user_achievements (user_id, achievement_id, unlocked, unlocked_at, updated_at)
        values (#{userId}, #{achievementId}, #{unlocked}, #{unlockedAt}, current_timestamp)
        """)
    void insertUserAchievement(
        @Param("userId") String userId,
        @Param("achievementId") String achievementId,
        @Param("unlocked") boolean unlocked,
        @Param("unlockedAt") String unlockedAt
    );

    @Select("""
        select id, title, subtitle, description, total, cover_url as coverUrl,
               reward_achievement_id as rewardAchievementId
        from theme_quests
        order by id
        """)
    List<TravelStoreFeatureRows.QuestRow> listQuests();

    @Select("select quest_id as ownerId, spot_id as itemId from theme_quest_spots order by quest_id, sort_order, spot_id")
    List<TravelStoreFeatureRows.JoinRow> listQuestSpots();

    @Select("select quest_id as ownerId, city_id as itemId from theme_quest_cities order by quest_id, sort_order, city_id")
    List<TravelStoreFeatureRows.JoinRow> listQuestCities();
}
