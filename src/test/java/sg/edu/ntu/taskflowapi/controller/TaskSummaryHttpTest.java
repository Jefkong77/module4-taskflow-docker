package sg.edu.ntu.taskflowapi.controller;

import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import sg.edu.ntu.taskflowapi.model.Task;
import sg.edu.ntu.taskflowapi.service.TaskService;
import tools.jackson.databind.json.JsonMapper;

import static org.junit.jupiter.api.Assertions.*;

/** Exercises Spring AI's HTTP client against a local test double, not a live LLM. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {"spring.ai.openai.api-key=local-test-placeholder",
                "app.seed-sample-tasks=false",
                "spring.ai.openai.max-retries=0", "spring.ai.openai.timeout=5s"})
class TaskSummaryHttpTest {
    private static final AtomicInteger calls = new AtomicInteger();
    private static final AtomicInteger providerStatus = new AtomicInteger(200);
    private static final AtomicReference<String> responseText = new AtomicReference<>();
    private static final AtomicReference<String> requestBody = new AtomicReference<>();
    private static final AtomicReference<String> requestPath = new AtomicReference<>();
    private static final JsonMapper jsonMapper = JsonMapper.builder().build();
    private static final HttpServer provider = startProvider();

    @LocalServerPort
    private int port;

    @Autowired
    private TaskService tasks;

    private static HttpServer startProvider() {
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            server.createContext("/", exchange -> {
                calls.incrementAndGet();
                requestPath.set(exchange.getRequestURI().getPath());
                requestBody.set(new String(exchange.getRequestBody().readAllBytes(),
                        StandardCharsets.UTF_8));
                String json = providerStatus.get() == 200
                        ? """
                          {"id":"test-completion","object":"chat.completion",
                           "created":1,"model":"gpt-4o-mini",
                           "choices":[{"index":0,"message":{"role":"assistant",
                           "content":%s},"finish_reason":"stop"}],
                           "usage":{"prompt_tokens":10,"completion_tokens":10,"total_tokens":20}}
                          """.formatted(jsonMapper.writeValueAsString(responseText.get()))
                        : "{\"error\":{\"message\":\"Provider diagnostic to keep private\","
                                + "\"type\":\"authentication_error\"}}";
                byte[] body = json.getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(providerStatus.get(), body.length);
                exchange.getResponseBody().write(body);
                exchange.close();
            });
            server.start();
            return server;
        } catch (IOException exception) {
            throw new IllegalStateException("Cannot start the local test provider", exception);
        }
    }

    @DynamicPropertySource
    static void providerUrl(DynamicPropertyRegistry registry) {
        registry.add("spring.ai.openai.base-url",
                () -> "http://127.0.0.1:" + provider.getAddress().getPort() + "/v1");
    }

    @BeforeEach
    void reset() {
        tasks.findAllTasks().forEach(task -> tasks.deleteTask(task.getId()));
        calls.set(0);
        providerStatus.set(200);
        responseText.set("""
                {"summary":"One task is completed and one is pending. Review sources is pending."}
                """);
        requestBody.set(null);
        requestPath.set(null);
    }

    @AfterAll
    static void stopProvider() {
        provider.stop(0);
    }

    private HttpResponse<String> getSummary() throws Exception {
        return HttpClient.newHttpClient().send(HttpRequest.newBuilder(
                        URI.create("http://localhost:" + port + "/api/tasks/summary"))
                .GET().build(), HttpResponse.BodyHandlers.ofString());
    }

    @Test
    void mapsProviderJsonToPojoAndReturnsItsPlainEnglishSummary() throws Exception {
        tasks.createTask(new Task(null, "Review sources", false));
        tasks.createTask(new Task(null, "Write tests", true));
        HttpResponse<String> response = getSummary();
        assertEquals(200, response.statusCode());
        assertTrue(response.headers().firstValue("Content-Type").orElse("")
                .startsWith("text/plain"));
        assertEquals("One task is completed and one is pending. Review sources is pending.",
                response.body());
        assertEquals(1, calls.get());
        assertEquals("/v1/chat/completions", requestPath.get());
        assertTrue(requestBody.get().contains("Completed: 1"));
        assertTrue(requestBody.get().contains("Pending: 1"));
        assertTrue(requestBody.get().contains("PENDING | Review sources"));
        assertTrue(requestBody.get().contains("DONE | Write tests"));
        assertTrue(requestBody.get().contains("summary"));
        assertTrue(requestBody.get().contains("schema"));
        assertEquals(2, tasks.findAllTasks().size());
        assertFalse(tasks.findAllTasks().getFirst().isCompleted());
    }

    @Test
    void emptyListReturnsAStatementOfFactWithoutAProviderCall() throws Exception {
        HttpResponse<String> response = getSummary();
        assertEquals(200, response.statusCode());
        assertEquals("There are no tasks. Nothing is pending or completed.", response.body());
        assertEquals(0, calls.get());
    }

    @Test
    void providerAuthenticationFailureBecomesReadable502() throws Exception {
        tasks.createTask(new Task(null, "Research", false));
        providerStatus.set(401);
        HttpResponse<String> response = getSummary();
        assertEquals(502, response.statusCode());
        assertTrue(response.body().contains("AI summary is unavailable"));
        assertFalse(response.body().contains("Provider diagnostic to keep private"));
    }

    @Test
    void blankProviderOutputBecomes502() throws Exception {
        tasks.createTask(new Task(null, "Research", false));
        responseText.set("   ");
        HttpResponse<String> response = getSummary();
        assertEquals(502, response.statusCode());
        assertTrue(response.body().contains("AI summary is unavailable")
                || response.body().contains("AI provider returned an empty summary"));
    }

    @Test
    void malformedProviderJsonBecomes502WithoutLeakingOutput() throws Exception {
        tasks.createTask(new Task(null, "Research", false));
        responseText.set("Private malformed output");
        HttpResponse<String> response = getSummary();
        assertEquals(502, response.statusCode());
        assertTrue(response.body().contains("AI summary is unavailable"));
        assertFalse(response.body().contains("Private malformed output"));
    }

    @Test
    void missingAndBlankSummaryFieldsBecome502() throws Exception {
        tasks.createTask(new Task(null, "Research", false));
        for (String output : java.util.List.of("{}", "{\"summary\":\"   \"}")) {
            responseText.set(output);
            HttpResponse<String> response = getSummary();
            assertEquals(502, response.statusCode());
            assertTrue(response.body().contains("AI provider returned an empty summary"));
        }
    }

    @Test
    void oversizedListReturns413WithoutCallingProvider() throws Exception {
        for (int i = 0; i < 51; i++) {
            tasks.createTask(new Task(null, "Task " + i, false));
        }
        assertEquals(413, getSummary().statusCode());
        assertEquals(0, calls.get());
    }
}
