FROM eclipse-temurin:21-jre

WORKDIR /app
COPY app.jar /app/app.jar
EXPOSE 8099

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -sf http://localhost:8099/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]