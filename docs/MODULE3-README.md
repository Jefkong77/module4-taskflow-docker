# TaskFlow Task Management API

TaskFlow is a Java 21 Spring Boot API for creating, viewing, updating, completing, and deleting tasks. It implements the four layers and in-memory storage specified in the Module 3 assignment. Task 6 adds a Spring AI endpoint that summarises completed and pending work.

Repository: [Jefkong77/module3-taskflow-api](https://github.com/Jefkong77/module3-taskflow-api).

## Source code by assignment task

The task numbers match the Module 3 assignment. Files are organised by their model, repository, service, or controller layer.

| Task | Requirement | Location | Responsibility |
| --- | --- | --- | --- |
| 1 | Create four layer folders | `model`, `repository`, `service`, `controller` | Organises task data, storage, business logic, and HTTP endpoints into separate layers |
| 2 | Model | [model/Task.java](src/main/java/sg/edu/ntu/taskflowapi/model/Task.java) | Holds id, title, and completed; Lombok generates getters, setters, and constructors |
| 3 | Repository | [repository/TaskRepository.java](src/main/java/sg/edu/ntu/taskflowapi/repository/TaskRepository.java) | Stores tasks in an initialized HashMap and generates IDs |
| 4 | Service | [service/TaskService.java](src/main/java/sg/edu/ntu/taskflowapi/service/TaskService.java) | Validates input and implements the six task operations |
| 5 | Controller | [controller/TaskController.java](src/main/java/sg/edu/ntu/taskflowapi/controller/TaskController.java) | Maps the six task endpoints to service methods |
| 6 | Spring AI summary | [model/TaskSummaryResult.java](src/main/java/sg/edu/ntu/taskflowapi/model/TaskSummaryResult.java), [service/TaskSummaryService.java](src/main/java/sg/edu/ntu/taskflowapi/service/TaskSummaryService.java), and [controller/TaskSummaryController.java](src/main/java/sg/edu/ntu/taskflowapi/controller/TaskSummaryController.java) | Reads current tasks, maps AI output into a POJO, and returns its plain-English summary through GET /api/tasks/summary |

Supporting files:

| Purpose | Source file | Responsibility |
| --- | --- | --- |
| Explicit errors | [ApiExceptionHandler.java](src/main/java/sg/edu/ntu/taskflowapi/controller/ApiExceptionHandler.java) | Converts exceptions into readable HTTP error responses |
| Configuration, including Task 6 | [application.properties](src/main/resources/application.properties) | Configures the application, JSON binding, and Spring AI provider |
| Application startup | [TaskflowApiApplication.java](src/main/java/sg/edu/ntu/taskflowapi/TaskflowApiApplication.java) | Starts Spring Boot and component scanning |
| Build and dependencies, including Task 6 | [pom.xml](pom.xml) | Declares the Java version, Spring Boot build, and Spring AI dependencies |

Browse [application source](src/main) and [test source](src/test/java/sg/edu/ntu/taskflowapi).

## Project structure

Task labels show where each assignment requirement is implemented. Task 5 is in the controller folder; Task 6 spans the model, service, and controller folders, with provider settings in application.properties and Spring AI dependencies in pom.xml.

```text
module3-taskflow-api/
├── pom.xml                                     # Build and Task 6 dependencies
├── mvnw
├── mvnw.cmd
├── src/
│   ├── main/
│   │   ├── java/sg/edu/ntu/taskflowapi/
│   │   │   ├── TaskflowApiApplication.java
│   │   │   ├── model/                          # Task 1: layer folder
│   │   │   │   ├── Task.java                   # Task 2: model
│   │   │   │   └── TaskSummaryResult.java      # Task 6: AI output POJO
│   │   │   ├── repository/                     # Task 1: layer folder
│   │   │   │   └── TaskRepository.java         # Task 3: repository
│   │   │   ├── service/                        # Task 1: layer folder
│   │   │   │   ├── TaskService.java            # Task 4: task operations
│   │   │   │   └── TaskSummaryService.java     # Task 6: AI summary
│   │   │   └── controller/                     # Task 1: layer folder
│   │   │       ├── TaskController.java         # Task 5: six task endpoints
│   │   │       ├── ApiExceptionHandler.java    # Supporting HTTP errors
│   │   │       └── TaskSummaryController.java  # Task 6: summary endpoint
│   │   └── resources/
│   │       └── application.properties          # Application and Task 6 settings
│   └── test/java/sg/edu/ntu/taskflowapi/
│       ├── TaskflowApiApplicationTests.java
│       ├── service/
│       │   ├── TaskServiceTest.java
│       │   └── TaskSummaryServiceTest.java
│       └── controller/
│           ├── TaskControllerHttpTest.java
│           └── TaskSummaryHttpTest.java
└── docs/
    ├── EDA-and-context.md
    ├── document-review.md
    ├── requirements-matrix.md
    ├── finish-today.md
    ├── task6-ai-summary.md
    ├── sample-tasks.csv
    ├── postman/
    └── evidence/
```

## Build and run

Requirements: JDK 21, Maven, and internet access for the first dependency download. The project uses Spring Boot 4.1.2 and Spring AI 2.0.1. Provider environment variables are described in [Task 6 configuration](docs/task6-ai-summary.md#provider-configuration).

From the project root in WSL Ubuntu:

```bash
mvn -version
mvn clean verify
mvn spring-boot:run
```

Maven should report Java 21. The application listens at `http://localhost:8080`; keep the terminal running while sending requests. Ctrl+C stops the application. The generated Maven Wrapper is also available as `./mvnw` in WSL or `.\mvnw.cmd` in PowerShell.

[Local development and Postman procedures](docs/finish-today.md) cover cloning, startup, ports, and collection imports.

## API contract

| Method | Path | Behaviour | Success |
| --- | --- | --- | --- |
| GET | /api/tasks | List tasks | 200 |
| GET | /api/tasks/{id} | Retrieve one task | 200 |
| POST | /api/tasks | Create a task with a generated ID | 201 |
| PUT | /api/tasks/{id} | Update title and completed | 200 |
| DELETE | /api/tasks/{id} | Delete a task | 200 |
| PUT | /api/tasks/{id}/complete | Set completed to true and save | 200 |
| GET | /api/tasks/summary | Summarise completed and pending work | 200 |

POST and PUT accept JSON. Example request body:

```json
{"title":"Prepare the meeting agenda","completed":false}
```

POST returns the saved task and a Location header. Its response body includes a generated ID:

```json
{"id":1,"title":"Prepare the meeting agenda","completed":false}
```

The URL ID identifies a task during updates. Creation ignores a supplied ID. Titles are trimmed and must contain 1–200 characters. Invalid IDs, invalid titles, and malformed JSON return 400; unknown positive IDs return 404. Error responses use Spring ProblemDetail. Omitted or null completed values bind to false; PUT replaces both writable fields.

## Storage and request flow

TaskController calls TaskService through constructor injection. TaskService validates requests and calls TaskRepository. The repository owns the initialized HashMap and ID counter. Task is a plain Java object with Lombok annotations.

Tasks are stored for the application session. An application or DevTools restart starts an empty collection and resets the counter. The repository returns copies and lists tasks by ID. Synchronized repository methods protect individual map operations and ID allocation.

The summary service reads the current task list and maps the AI response into TaskSummaryResult using `.entity(TaskSummaryResult.class)`. The controller returns the object's summary field as text/plain. It uses the configured model for nonempty lists of up to fifty tasks. Empty lists return a fixed factual message, lists above fifty return 413, and provider failures, malformed output, or missing/blank summaries return 502. Task records are unchanged.

## Documentation

| Document | Contents |
| --- | --- |
| [EDA and context](docs/EDA-and-context.md) | Problem, task schema, synthetic sample data, and lifecycle |
| [Design rationale](docs/document-review.md) | Layer responsibilities, storage choices, and JSON behaviour |
| [Requirement matrix](docs/requirements-matrix.md) | Assignment requirements mapped to code and API behaviour |
| [Local development](docs/finish-today.md) | WSL setup, Maven startup, and Postman procedures |
| [Task 6 summary](docs/task6-ai-summary.md) | ChatClient flow, provider configuration, and summary examples |
| [Test results](docs/evidence/verification.md) | Build, API regression, and Postman/Newman reports |
| [Task 6 test details](docs/evidence/task6-verification.md) | Prompt, provider-contract, and summary-error checks |
| [Structured-output verification](docs/evidence/structured-output-verification.md) | POJO conversion, schema instructions, and invalid-output tests |

## Tests

`mvn clean verify` runs 28 tests: ten task-service tests, one application-context test, three task-controller HTTP tests, seven summary-service tests, and seven summary HTTP tests. [TaskControllerHttpTest.java](src/test/java/sg/edu/ntu/taskflowapi/controller/TaskControllerHttpTest.java) uses Java's HTTP client against an isolated Spring Boot server to check the task lifecycle, validation, and missing resources. Summary unit tests use model doubles; summary HTTP tests use Spring AI with a local OpenAI-compatible test server and controlled JSON responses to verify POJO conversion and error handling.

The [CRUD collection](docs/postman/TaskFlow.postman_collection.json) contains 24 requests. The [AI collection](docs/postman/TaskFlow-AI.postman_collection.json) contains nine requests. Both use the [TaskFlow Local environment](docs/postman/TaskFlow-Local.postman_environment.json). Recorded Newman runs passed 38 CRUD assertions and 15 summary assertions; the summary run used the local test server. See [test results](docs/evidence/verification.md) for the reports.

An interactive Postman run of the POJO implementation at commit `bb7e686` on 24 October 2026 used OpenRouter's `openrouter/free` route. The summary returned HTTP 200 in 7.04 seconds with the correct one-completed / one-pending description, and a subsequent GET confirmed unchanged task records. [Structured-output verification](docs/evidence/structured-output-verification.md#live-provider-verification) includes the live screenshots and the successful 28-test build. The [earlier Task 6 verification](docs/evidence/task6-verification.md#live-provider-verification) and [WSL Ubuntu build](docs/evidence/verification.md#wsl-ubuntu-build-and-interactive-verification) preserve the text-response implementation's results.

## References

The assignment specification is `Module3_Assignment_mandatory (1) (2).docx`.

- [Spring Initializr](https://start.spring.io/)
- [Spring Boot documentation](https://docs.spring.io/spring-boot/)
- [Lombok features](https://projectlombok.org/features/)
- [Spring AI documentation](https://docs.spring.io/spring-ai/reference/)
- [Spring AI structured outputs](https://docs.spring.io/spring-ai/reference/api/structured-output.html)
- [Postman collection runs](https://learning.postman.com/docs/collections/running-collections/intro-to-collection-runs/)
- [Newman command-line runner](https://learning.postman.com/docs/collections/using-newman-cli/command-line-integration-with-newman/)
