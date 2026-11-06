package sg.edu.ntu.taskflowapi;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// A non-secret placeholder permits context startup; this test calls no provider.
@SpringBootTest(properties = {"spring.ai.openai.api-key=local-test-placeholder",
        "app.seed-sample-tasks=false"})
class TaskflowApiApplicationTests {

	@Test
	void contextLoads() {
	}

}
