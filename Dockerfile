# ===== BUILD =====
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package -DskipTests

# ===== RUN =====
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

COPY --from=build /target/*-shaded.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
