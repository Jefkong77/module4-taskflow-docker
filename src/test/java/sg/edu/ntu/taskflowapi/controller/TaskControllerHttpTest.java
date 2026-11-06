package sg.edu.ntu.taskflowapi.controller;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpHeaders;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import sg.edu.ntu.taskflowapi.service.TaskService;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import static org.junit.jupiter.api.Assertions.*;

/** Checks the task API through HTTP against an isolated Spring Boot server. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {"spring.ai.openai.api-key=local-http-test-placeholder",
                "app.seed-sample-tasks=false"})
class TaskControllerHttpTest {
    @LocalServerPort
    private int port;

    @Autowired
    private TaskService tasks;

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5)).build();
    private final JsonMapper json = JsonMapper.builder().build();

    @BeforeEach
    void clearTasks() {
        tasks.findAllTasks().forEach(task -> tasks.deleteTask(task.getId()));
    }

    @Test
    void taskLifecyclePreservesGeneratedIdsAndSavedCompletion() throws Exception {
        assertTrue(request("GET", "/api/tasks", 200, null).json().isEmpty());

        Reply first = request("POST", "/api/tasks", 201,
                "{\"id\":900,\"title\":\" First task \",\"completed\":false}");
        long firstId = first.json().get("id").asLong();
        assertTrue(firstId > 0);
        assertNotEquals(900L, firstId);
        assertEquals("First task", first.json().get("title").asString());
        assertFalse(first.json().get("completed").asBoolean());
        assertTrue(first.headers().firstValue("Location").orElse("")
                .endsWith("/api/tasks/" + firstId));

        Reply second = request("POST", "/api/tasks", 201,
                "{\"title\":\"Second task\"}");
        long secondId = second.json().get("id").asLong();
        assertNotEquals(firstId, secondId);
        assertFalse(second.json().get("completed").asBoolean());

        JsonNode all = request("GET", "/api/tasks", 200, null).json();
        assertEquals(2, all.size());
        assertEquals(firstId, all.get(0).get("id").asLong());
        assertEquals(secondId, all.get(1).get("id").asLong());
        assertEquals(first.json(), request("GET", "/api/tasks/" + firstId,
                200, null).json());

        Reply updated = request("PUT", "/api/tasks/" + firstId, 200,
                "{\"id\":999,\"title\":\"Updated task\",\"completed\":false}");
        assertEquals(firstId, updated.json().get("id").asLong());
        assertEquals("Updated task", updated.json().get("title").asString());
        assertFalse(updated.json().get("completed").asBoolean());

        for (int i = 0; i < 2; i++) {
            Reply completed = request("PUT", "/api/tasks/" + firstId
                    + "/complete", 200, null);
            assertTrue(completed.json().get("completed").asBoolean());
        }
        assertTrue(request("GET", "/api/tasks/" + firstId, 200, null)
                .json().get("completed").asBoolean());

        Reply deleted = request("DELETE", "/api/tasks/" + firstId, 200, null);
        assertTrue(deleted.json().get("message").asString().contains("deleted"));
        request("GET", "/api/tasks/" + firstId, 404, null);
        request("DELETE", "/api/tasks/" + secondId, 200, null);
        assertTrue(request("GET", "/api/tasks", 200, null).json().isEmpty());
    }

    @Test
    void invalidTitlesJsonAndIdsReturn400() throws Exception {
        for (String body : List.of(
                "{\"title\":null}",
                "{\"title\":\"\"}",
                "{\"title\":\"   \"}",
                "{\"title\":\"" + "x".repeat(201) + "\"}")) {
            JsonNode problem = request("POST", "/api/tasks", 400, body).json();
            assertEquals(400, problem.get("status").asInt());
            assertFalse(problem.get("detail").asString().isBlank());
        }
        request("POST", "/api/tasks", 400, "{\"title\":");
        for (String id : List.of("abc", "0", "-1")) {
            request("GET", "/api/tasks/" + id, 400, null);
        }
        assertTrue(tasks.findAllTasks().isEmpty());
    }

    @Test
    void missingTasksReturn404ForReadUpdateDeleteAndCompletion() throws Exception {
        String path = "/api/tasks/999999999";
        request("GET", path, 404, null);
        request("PUT", path, 404, "{\"title\":\"Missing\"}");
        request("DELETE", path, 404, null);
        request("PUT", path + "/complete", 404, null);
        assertTrue(tasks.findAllTasks().isEmpty());
    }

    private Reply request(String method, String path, int expectedStatus,
            String body) throws Exception {
        HttpRequest.Builder builder = HttpRequest.newBuilder(
                URI.create("http://localhost:" + port + path))
                .timeout(Duration.ofSeconds(10))
                .method(method, body == null
                        ? HttpRequest.BodyPublishers.noBody()
                        : HttpRequest.BodyPublishers.ofString(body));
        if (body != null) {
            builder.header("Content-Type", "application/json");
        }
        HttpResponse<String> response = client.send(builder.build(),
                HttpResponse.BodyHandlers.ofString());
        assertEquals(expectedStatus, response.statusCode(),
                method + " " + path + ": " + response.body());
        JsonNode value = json.readTree(response.body());
        if (expectedStatus >= 400) {
            assertEquals(expectedStatus, value.get("status").asInt());
            assertFalse(value.get("detail").asString().isBlank());
        }
        return new Reply(value, response.headers());
    }

    private record Reply(JsonNode json, HttpHeaders headers) {
    }
}
