# Estágio 1: Build com Maven
FROM maven:3.8.4-openjdk-11-slim AS build
COPY . .
# Compila o projeto e gera o arquivo JAR
RUN mvn clean package -DskipTests

# Estágio 2: Execução
FROM openjdk:11-jre-slim
# Copia o JAR gerado no estágio anterior
COPY --from=build /target/*.jar app.jar
# Copia a sua pasta de fontes para a arte não sair feia
COPY .ttf /.ttf
# Abre a porta que o Render vai usar
EXPOSE 8080
# Comando para ligar o servidor
CMD ["java", "-Dserver.port=${PORT}", "-jar", "app.jar"]
