# Estágio 1: Build
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY . .

# Build otimizado para o Render (pula testes e economiza RAM)
RUN mvn clean package -DskipTests

# Estágio 2: Execução
FROM amazoncorretto:17
WORKDIR /app

# Copia o JAR gerado pelo Maven Shade
COPY --from=build /app/target/automacao-stile-*.jar app.jar

# Garante que a pasta da fonte exista e o arquivo esteja lá
RUN mkdir -p .ttf
COPY *.ttf ./.ttf/ 2>/dev/null || cp *.ttf . 2>/dev/null || true

EXPOSE 8080

# Parâmetros -Xmx e -Xms evitam que o Java estoure os 512MB do Render Free
CMD ["java", "-Xmx380m", "-Xms256m", "-jar", "app.jar"]
