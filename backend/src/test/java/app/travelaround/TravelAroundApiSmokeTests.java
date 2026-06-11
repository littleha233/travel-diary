package app.travelaround;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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

        mockMvc.perform(post("/v1/check-ins")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"spotId\":\"broken-bridge\",\"tripId\":\"hangzhou-3-days\",\"type\":\"manual\",\"moodText\":\"smoke\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.checkIn.spotId").value("broken-bridge"));
    }
}
