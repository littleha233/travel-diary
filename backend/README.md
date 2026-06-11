# TravelAround Backend

Spring Boot backend for the TravelAround Expo app.

## Local Run

```bash
cd backend
./mvnw spring-boot:run
```

The default profile uses an in-memory H2 database so the API can run without Docker.

## Docker Compose

```bash
cd backend
docker compose up --build
```

Services:

- Backend: `http://localhost:8080`
- MySQL: `localhost:3306`
- MinIO console: `http://localhost:9001`

Frontend API mode:

```bash
EXPO_PUBLIC_TRAVEL_DATA_SOURCE=api
EXPO_PUBLIC_API_BASE_URL=http://<LAN-IP>:8080/v1
EXPO_PUBLIC_API_AUTH_MODE=guest
```
