# Stage 1: Build the JAR with Maven
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Run the JAR in a slim runtime image
FROM eclipse-temurin:21-jre-alpine
# v1.1.0 (Option 5): Trivy found CVE-2026-4738 (MEDIUM) in the base image's zlib 1.3.2-r1;
# upgrade it to the fixed Alpine package (1.4-r0). Task 1's original Dockerfile is tag v1.0.0.
RUN apk upgrade --no-cache zlib
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
