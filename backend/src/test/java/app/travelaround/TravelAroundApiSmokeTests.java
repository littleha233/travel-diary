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
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class TravelAroundApiSmokeTests {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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

        mockMvc.perform(get("/v1/users/me").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.id").value("u-nicola"));

        mockMvc.perform(get("/v1/cities?pageSize=100").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.length()").value(18));

        mockMvc.perform(get("/v1/trips/hangzhou-3-days").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.checkIns.length()").value(2));

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
            .andExpect(jsonPath("$.data.spot.status").value("lit"));

        String planResponse = mockMvc.perform(post("/v1/plans/weekend-template").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.plan.userId").value("u-nicola"))
            .andExpect(jsonPath("$.data.plan.cityIds[0]").value("hangzhou"))
            .andReturn()
            .getResponse()
            .getContentAsString();
        String planId = objectMapper.readTree(planResponse).path("data").path("plan").path("id").asText();

        mockMvc.perform(get("/v1/plans/" + planId).header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.plan.id").value(planId))
            .andExpect(jsonPath("$.data.plan.userId").value("u-nicola"));

        mockMvc.perform(delete("/v1/plans/" + planId).header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.deleted").value(true))
            .andExpect(jsonPath("$.data.planId").value(planId));

        mockMvc.perform(post("/v1/ai-memories/generate")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"tripId\":\"hangzhou-3-days\",\"style\":\"自然日记\",\"extraPrompt\":\"写得温柔一点\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.tripId").value("hangzhou-3-days"))
            .andExpect(jsonPath("$.data.safetyFallback").value(false));

        mockMvc.perform(post("/v1/ai-memories/generate")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"tripId\":\"hangzhou-3-days\",\"style\":\"自然日记\",\"extraPrompt\":\"加入暴力内容\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.tripId").value("hangzhou-3-days"))
            .andExpect(jsonPath("$.data.safetyFallback").value(true));

        mockMvc.perform(post("/v1/check-ins")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"spotId\":\"broken-bridge\",\"tripId\":\"hangzhou-3-days\",\"type\":\"manual\",\"moodText\":\"smoke\",\"clientRequestId\":\"smoke-check-in\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.checkIn.spotId").value("broken-bridge"))
            .andExpect(jsonPath("$.data.checkIn.userId").value("u-nicola"))
            .andExpect(jsonPath("$.data.spot.status").value("lit"))
            .andExpect(jsonPath("$.data.city.lit").value(true))
            .andExpect(jsonPath("$.data.trip.id").value("hangzhou-3-days"));

        mockMvc.perform(post("/v1/check-ins")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"spotId\":\"broken-bridge\",\"tripId\":\"hangzhou-3-days\",\"type\":\"manual\",\"moodText\":\"same\",\"clientRequestId\":\"smoke-check-in\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.checkIn.moodText").value("smoke"));

        mockMvc.perform(post("/v1/check-ins")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"spotId\":\"lingyin-temple\",\"tripId\":\"hangzhou-3-days\",\"type\":\"gps\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error.code").value("LOCATION_REQUIRED"));

        mockMvc.perform(post("/v1/check-ins")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"spotId\":\"lingyin-temple\",\"tripId\":\"hangzhou-3-days\",\"type\":\"gps\",\"location\":{\"latitude\":31.2304,\"longitude\":121.4737}}"))
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
}
