package app.travelaround.core;

import java.util.List;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
interface TravelStoreCommunityMapper {
    @Select("select count(*) from community_posts")
    int countPosts();

    @Select("""
        select p.id,
               p.author_id as authorId,
               coalesce(u.nickname, p.author_id) as author,
               p.type,
               p.title,
               p.subtitle,
               p.body,
               p.image_url as imageUrl,
               p.linked_id as linkedId,
               p.action_label as actionLabel,
               p.progress,
               p.status,
               (select count(*) from community_post_likes l where l.post_id = p.id) as likeCount,
               (select count(*) from community_post_saves s where s.post_id = p.id) as saveCount,
               (select count(*) from community_comments c where c.post_id = p.id and c.status = 'published') as commentCount,
               exists(select 1 from community_post_likes l where l.post_id = p.id and l.user_id = #{userId}) as liked,
               exists(select 1 from community_post_saves s where s.post_id = p.id and s.user_id = #{userId}) as saved,
               p.created_at as createdAt,
               p.updated_at as updatedAt
        from community_posts p
        left join users u on u.id = p.author_id
        where p.status = 'published'
        order by p.created_at desc, p.id
        """)
    List<TravelStoreCommunityRows.PostRow> listPublishedPosts(@Param("userId") String userId);

    @Select("select count(*) from community_posts where id = #{postId} and status = 'published'")
    int countPublishedPost(@Param("postId") String postId);

    @Delete("delete from community_post_likes where user_id = #{userId} and post_id = #{postId}")
    void deleteLike(@Param("userId") String userId, @Param("postId") String postId);

    @Insert("insert into community_post_likes (user_id, post_id) values (#{userId}, #{postId})")
    void insertLike(@Param("userId") String userId, @Param("postId") String postId);

    @Delete("delete from community_post_saves where user_id = #{userId} and post_id = #{postId}")
    void deleteSave(@Param("userId") String userId, @Param("postId") String postId);

    @Insert("insert into community_post_saves (user_id, post_id) values (#{userId}, #{postId})")
    void insertSave(@Param("userId") String userId, @Param("postId") String postId);

    @Select("""
        select c.id,
               c.post_id as postId,
               c.user_id as userId,
               coalesce(u.nickname, c.user_id) as author,
               c.body,
               c.status,
               c.created_at as createdAt,
               c.updated_at as updatedAt
        from community_comments c
        left join users u on u.id = c.user_id
        where c.post_id = #{postId} and c.status = 'published'
        order by c.created_at, c.id
        """)
    List<TravelStoreCommunityRows.CommentRow> listComments(@Param("postId") String postId);

    @Insert("""
        insert into community_comments (id, post_id, user_id, body, status, created_at, updated_at)
        values (#{id}, #{postId}, #{userId}, #{body}, 'published', #{createdAt}, #{createdAt})
        """)
    void insertComment(
        @Param("id") String id,
        @Param("postId") String postId,
        @Param("userId") String userId,
        @Param("body") String body,
        @Param("createdAt") String createdAt
    );
}
