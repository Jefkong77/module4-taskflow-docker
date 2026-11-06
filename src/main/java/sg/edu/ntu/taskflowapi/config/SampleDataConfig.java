package sg.edu.ntu.taskflowapi.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import sg.edu.ntu.taskflowapi.model.Task;
import sg.edu.ntu.taskflowapi.repository.TaskRepository;

/**
 * Module 4: the API stores tasks in memory, and free Render services restart
 * often, so a fresh container would always return []. These sample tasks give
 * GET /api/tasks real data after every start. Turn off with SEED_SAMPLE_TASKS=false.
 */
@Configuration
@ConditionalOnProperty(name = "app.seed-sample-tasks", havingValue = "true")
public class SampleDataConfig {

    @Bean
    CommandLineRunner seedSampleTasks(TaskRepository repository) {
        return args -> {
            if (repository.findAll().isEmpty()) {
                repository.create(new Task(null, "Write the Dockerfile", true));
                repository.create(new Task(null, "Build and test the image locally", true));
                repository.create(new Task(null, "Deploy to Render", false));
                repository.create(new Task(null, "Add CI, versioning and security checks", false));
            }
        };
    }
}
