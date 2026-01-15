# Estágio 1: Build (Usando Java 17 para bater com seu pom.xml)
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY . .

# Build limpo ignorando testes
RUN mvn clean package -DskipTests

# Estágio 2: Execução (Corretto 17)
FROM amazoncorretto:17
WORKDIR /app

# O Maven Shade gera um arquivo chamado 'automacao-stile-1.0-SNAPSHOT.jar' 
# ou similar. Vamos usar o wildcard correto:
COPY --from=build /app/target/automacao-stile-*.jar app.jar

# Se você tem arquivos .ttf, garanta que o caminho de origem está correto
# Se estiverem na raiz do projeto, o comando abaixo funciona:
COPY *.ttf ./ 

EXPOSE 8080

# O Javalin/Render precisa da porta dinâmica
CMD ["java", "-jar", "app.jar"]
