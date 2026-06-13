package app.travelaround;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class TravelAroundApiSmokeTests {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void guestCanLoadAndMutateTravelData() throws Exception {
        String authResponse = mockMvc.perform(post("/v1/auth/guest").contentType(MediaType.APPLICATION_JSON).content("{}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.accessToken").isString())
            .andReturn()
            .getResponse()
            .getContentAsString();
        JsonNode auth = objectMapper.readTree(authResponse);
        String token = auth.path("data").path("accessToken").asText();
        String userId = auth.path("data").path("user").path("id").asText();

        mockMvc.perform(get("/v1/users/me").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").value(userId));

        mockMvc.perform(get("/v1/cities?pageSize=100").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.length()").value(18));

        String tripResponse = mockMvc.perform(post("/v1/trips")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Smoke Hangzhou\",\"cityId\":\"hangzhou\",\"startDate\":\"2026-06-20\",\"endDate\":\"2026-06-21\",\"visibility\":\"private\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.trip.userId").value(userId))
            .andReturn()
            .getResponse()
            .getContentAsString();
        String tripId = objectMapper.readTree(tripResponse).path("data").path("trip").path("id").asText();

        mockMvc.perform(get("/v1/trips/" + tripId).header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.trip.id").value(tripId))
            .andExpect(jsonPath("$.data.checkIns.length()").value(0));

        mockMvc.perform(post("/v1/cities/suzhou/manual-light").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.city.id").value("suzhou"))
            .andExpect(jsonPath("$.data.city.lit").value(true))
            .andExpect(jsonPath("$.data.city.manuallyLit").value(true));

        mockMvc.perform(delete("/v1/cities/suzhou/manual-light").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.city.id").value("suzhou"))
            .andExpect(jsonPath("$.data.city.lit").value(false))
            .andExpect(jsonPath("$.data.city.manuallyLit").value(false));

        mockMvc.perform(post("/v1/wishlist/cities/suzhou").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.city.id").value("suzhou"))
            .andExpect(jsonPath("$.data.city.wished").value(true));

        mockMvc.perform(get("/v1/cities?status=wishlist&pageSize=100").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[*].id", hasItem("suzhou")));

        mockMvc.perform(delete("/v1/wishlist/cities/suzhou").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.city.id").value("suzhou"))
            .andExpect(jsonPath("$.data.city.wished").value(false));

        mockMvc.perform(post("/v1/wishlist/spots/lingyin-temple").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.spot.id").value("lingyin-temple"))
            .andExpect(jsonPath("$.data.spot.status").value("wishlist"));

        mockMvc.perform(delete("/v1/wishlist/spots/lingyin-temple").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.spot.id").value("lingyin-temple"))
            .andExpect(jsonPath("$.data.spot.status").value("available"));

        mockMvc.perform(post("/v1/wishlist/spots/west-lake").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.spot.id").value("west-lake"))
            .andExpect(jsonPath("$.data.spot.status").value("wishlist"));

        String planResponse = mockMvc.perform(post("/v1/plans/weekend-template").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.plan.userId").value(userId))
            .andExpect(jsonPath("$.data.plan.cityIds[0]").value("hangzhou"))
            .andReturn()
            .getResponse()
            .getContentAsString();
        String planId = objectMapper.readTree(planResponse).path("data").path("plan").path("id").asText();

        mockMvc.perform(get("/v1/plans/" + planId).header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.plan.id").value(planId))
            .andExpect(jsonPath("$.data.plan.userId").value(userId));

        mockMvc.perform(delete("/v1/plans/" + planId).header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.deleted").value(true))
            .andExpect(jsonPath("$.data.planId").value(planId));

        mockMvc.perform(post("/v1/check-ins")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"spotId\":\"broken-bridge\",\"tripId\":\"" + tripId + "\",\"type\":\"manual\",\"moodText\":\"smoke\",\"clientRequestId\":\"smoke-check-in\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.checkIn.spotId").value("broken-bridge"))
            .andExpect(jsonPath("$.data.checkIn.userId").value(userId))
            .andExpect(jsonPath("$.data.spot.status").value("lit"))
            .andExpect(jsonPath("$.data.city.lit").value(true))
            .andExpect(jsonPath("$.data.trip.id").value(tripId));

        mockMvc.perform(post("/v1/check-ins")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"spotId\":\"broken-bridge\",\"tripId\":\"" + tripId + "\",\"type\":\"manual\",\"moodText\":\"same\",\"clientRequestId\":\"smoke-check-in\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.checkIn.moodText").value("smoke"));

        mockMvc.perform(post("/v1/ai-memories/generate")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"tripId\":\"" + tripId + "\",\"style\":\"自然日记\",\"extraPrompt\":\"写得温柔一点\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.tripId").value(tripId))
            .andExpect(jsonPath("$.data.safetyFallback").value(false));

        mockMvc.perform(post("/v1/ai-memories/generate")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"tripId\":\"" + tripId + "\",\"style\":\"自然日记\",\"extraPrompt\":\"加入暴力内容\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.tripId").value(tripId))
            .andExpect(jsonPath("$.data.safetyFallback").value(true));

        mockMvc.perform(post("/v1/check-ins")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"spotId\":\"lingyin-temple\",\"tripId\":\"" + tripId + "\",\"type\":\"gps\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error.code").value("LOCATION_REQUIRED"));

        mockMvc.perform(post("/v1/check-ins")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"spotId\":\"lingyin-temple\",\"tripId\":\"" + tripId + "\",\"type\":\"gps\",\"location\":{\"latitude\":31.2304,\"longitude\":121.4737}}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error.code").value("CHECK_IN_OUT_OF_RANGE"));

        String uploadResponse = mockMvc.perform(post("/v1/images/upload-url")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"fileName\":\"broken-bridge.jpg\",\"contentType\":\"image/jpeg\",\"linkedType\":\"check_in\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.imageId").isString())
            .andExpect(jsonPath("$.data.uploadUrl").isString())
            .andReturn()
            .getResponse()
            .getContentAsString();
        String imageId = objectMapper.readTree(uploadResponse).path("data").path("imageId").asText();

        mockMvc.perform(put("/v1/uploads/" + imageId).contentType(MediaType.IMAGE_JPEG).content("fake-image"))
            .andExpect(status().isOk());

        mockMvc.perform(post("/v1/images/" + imageId + "/confirm")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"linkedType\":\"check_in\",\"linkedId\":\"ci-west-lake\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").value(imageId))
            .andExpect(jsonPath("$.data.status").value("confirmed"))
            .andExpect(jsonPath("$.data.linkedId").value("ci-west-lake"));
    }

    @Test
    void phoneLoginUsersKeepCityStateIsolatedThroughApi() throws Exception {
        String tokenA = loginByPhone("13900001001");
        String tokenB = loginByPhone("13900001002");

        String userA = currentUserId(tokenA);
        String userB = currentUserId(tokenB);

        mockMvc.perform(post("/v1/cities/xiamen/manual-light").header("Authorization", "Bearer " + tokenA))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.city.id").value("xiamen"))
            .andExpect(jsonPath("$.data.city.lit").value(true));

        mockMvc.perform(post("/v1/cities/chengdu/manual-light").header("Authorization", "Bearer " + tokenB))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.city.id").value("chengdu"))
            .andExpect(jsonPath("$.data.city.lit").value(true));

        mockMvc.perform(get("/v1/cities/xiamen").header("Authorization", "Bearer " + tokenA))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.city.lit").value(true));

        mockMvc.perform(get("/v1/cities/xiamen").header("Authorization", "Bearer " + tokenB))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.city.lit").value(false));

        mockMvc.perform(get("/v1/cities/chengdu").header("Authorization", "Bearer " + tokenB))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.city.lit").value(true));

        mockMvc.perform(get("/v1/cities/chengdu").header("Authorization", "Bearer " + tokenA))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.city.lit").value(false));

        Integer userRows = jdbcTemplate.queryForObject(
            "select count(*) from users where id in (?, ?) and phone in (?, ?)",
            Integer.class,
            userA,
            userB,
            "13900001001",
            "13900001002"
        );

        org.junit.jupiter.api.Assertions.assertNotEquals(userA, userB);
        org.junit.jupiter.api.Assertions.assertEquals(2, userRows);
    }

    @Test
    void communityPostsReadFromRelationalTableThroughApi() throws Exception {
        String token = guestToken();
        jdbcTemplate.update(
            "update community_posts set title = ?, subtitle = ?, author_id = ? where id = ?",
            "DB 社区路线",
            "从关系表读取",
            "CC Reviewer",
            "route-hangzhou"
        );

        mockMvc.perform(get("/v1/community/posts?keyword=DB").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.length()").value(1))
            .andExpect(jsonPath("$.data[0].id").value("route-hangzhou"))
            .andExpect(jsonPath("$.data[0].title").value("DB 社区路线"))
            .andExpect(jsonPath("$.data[0].subtitle").value("从关系表读取"))
            .andExpect(jsonPath("$.data[0].author").value("CC Reviewer"));
    }

    @Test
    void communityInteractionsAreIsolatedByLoggedInUser() throws Exception {
        String tokenA = loginByPhone("13900001003");
        String tokenB = loginByPhone("13900001004");
        String userA = currentUserId(tokenA);
        String userB = currentUserId(tokenB);

        mockMvc.perform(post("/v1/community/posts/route-hangzhou/like").header("Authorization", "Bearer " + tokenA))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.post.id").value("route-hangzhou"))
            .andExpect(jsonPath("$.data.post.liked").value(true))
            .andExpect(jsonPath("$.data.post.likeCount").value(1));

        mockMvc.perform(post("/v1/community/posts/route-hangzhou/save").header("Authorization", "Bearer " + tokenA))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.post.id").value("route-hangzhou"))
            .andExpect(jsonPath("$.data.post.saved").value(true))
            .andExpect(jsonPath("$.data.post.saveCount").value(1));

        mockMvc.perform(post("/v1/community/posts/route-hangzhou/comments")
                .header("Authorization", "Bearer " + tokenA)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"body\":\"A 用户的社区评论\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.comment.postId").value("route-hangzhou"))
            .andExpect(jsonPath("$.data.comment.userId").value(userA))
            .andExpect(jsonPath("$.data.post.commentCount").value(1));

        mockMvc.perform(get("/v1/community/posts").header("Authorization", "Bearer " + tokenB))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[?(@.id == 'route-hangzhou')].liked", hasItem(false)))
            .andExpect(jsonPath("$.data[?(@.id == 'route-hangzhou')].saved", hasItem(false)))
            .andExpect(jsonPath("$.data[?(@.id == 'route-hangzhou')].likeCount", hasItem(1)))
            .andExpect(jsonPath("$.data[?(@.id == 'route-hangzhou')].saveCount", hasItem(1)))
            .andExpect(jsonPath("$.data[?(@.id == 'route-hangzhou')].commentCount", hasItem(1)));

        mockMvc.perform(get("/v1/community/posts/route-hangzhou/comments").header("Authorization", "Bearer " + tokenB))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[*].body", hasItem("A 用户的社区评论")));

        Integer likeRows = jdbcTemplate.queryForObject(
            "select count(*) from community_post_likes where user_id = ? and post_id = ?",
            Integer.class,
            userA,
            "route-hangzhou"
        );
        Integer saveRows = jdbcTemplate.queryForObject(
            "select count(*) from community_post_saves where user_id = ? and post_id = ?",
            Integer.class,
            userA,
            "route-hangzhou"
        );
        Integer userBLikeRows = jdbcTemplate.queryForObject(
            "select count(*) from community_post_likes where user_id = ?",
            Integer.class,
            userB
        );
        Integer userBSaveRows = jdbcTemplate.queryForObject(
            "select count(*) from community_post_saves where user_id = ?",
            Integer.class,
            userB
        );

        org.junit.jupiter.api.Assertions.assertEquals(1, likeRows);
        org.junit.jupiter.api.Assertions.assertEquals(1, saveRows);
        org.junit.jupiter.api.Assertions.assertEquals(0, userBLikeRows);
        org.junit.jupiter.api.Assertions.assertEquals(0, userBSaveRows);
    }

    private String loginByPhone(String phone) throws Exception {
        mockMvc.perform(post("/v1/auth/sms/code")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"phone\":\"" + phone + "\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.code").value("123456"));

        String authResponse = mockMvc.perform(post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"phone\":\"" + phone + "\",\"code\":\"123456\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.accessToken").isString())
            .andExpect(jsonPath("$.data.user.phone").value(phone))
            .andReturn()
            .getResponse()
            .getContentAsString();

        return objectMapper.readTree(authResponse).path("data").path("accessToken").asText();
    }

    private String guestToken() throws Exception {
        String authResponse = mockMvc.perform(post("/v1/auth/guest").contentType(MediaType.APPLICATION_JSON).content("{}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.accessToken").isString())
            .andReturn()
            .getResponse()
            .getContentAsString();

        return objectMapper.readTree(authResponse).path("data").path("accessToken").asText();
    }

    private String currentUserId(String token) throws Exception {
        String response = mockMvc.perform(get("/v1/users/me").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

        return objectMapper.readTree(response).path("data").path("id").asText();
    }
}
