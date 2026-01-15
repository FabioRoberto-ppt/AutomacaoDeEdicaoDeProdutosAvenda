# 1. Fase de Construção (Build)
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app

# Copia os arquivos do projeto para o container
COPY . .

# Executa o build ignorando os testes para não estourar a memória
RUN mvn clean package -DskipTests

# 2. Fase de Execução (Runtime)
FROM amazoncorretto:17
WORKDIR /app

# Copia o arquivo JAR gerado na fase anterior
# O wildcard * garante que ele pegue o arquivo mesmo com a versão no nome
COPY --from=build /app/target/automacao-stile-*.jar app.jar

# COPIA A PASTA DE FONTES (Crucial para o seu desenho de imagem)
# O ponto antes de /app/ garante que a estrutura fique exatamente como no seu PC
COPY .ttf ./.ttf/

# Define a porta padrão
EXPOSE 8080

# Comando de inicialização otimizado para o Render Free (512MB RAM)
# -Xmx384m deixa uma folga para o sistema operacional não matar o processo
CMD ["java", "-Xmx384m", "-Xms256m", "-jar", "app.jar"]
