# Estágio 1: Build
FROM maven:3.8.5-openjdk-11 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Estágio 2: Execução
FROM amazoncorretto:11
WORKDIR /app
# O segredo está no /app/target/ aqui embaixo:
COPY --from=build /app/target/*-shaded.jar app.jar
COPY .ttf /.ttf

EXPOSE 8080

# Comando para rodar usando a porta do Render
CMD ["java", "-Dserver.port=${PORT}", "-jar", "app.jar"]
