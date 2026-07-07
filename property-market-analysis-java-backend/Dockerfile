# ---- Build Stage ----
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy pom.xml and download dependencies (cached layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build
COPY src/ src/
RUN mvn package -DskipTests -B

# ---- Runtime Stage ----
FROM eclipse-temurin:21-jre

WORKDIR /app

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy the built JAR
COPY --from=build /app/target/*.jar app.jar

# Change ownership
RUN chown -R appuser:appuser /app

USER appuser

EXPOSE 8001

ENTRYPOINT ["java", "-jar", "app.jar"]
