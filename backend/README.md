# TravelAround Backend

Spring Boot backend for the TravelAround Expo app.

## Local Run

```bash
cd backend
./mvnw spring-boot:run
```

The default profile uses an in-memory H2 database so the API can run without Docker.

## Current Backend Scope

- Phase 1 is implemented: Spring Boot scaffold, JWT auth, API envelope, seed data, and read APIs.
- Phase 2 is implemented for the runtime service: trip creation, check-in creation, GPS radius validation, nearby spots, check-in idempotency via `clientRequestId`, and derived city/spot/trip update responses.
- Flyway schema migrations now define the core MySQL tables for users, places, per-user city/spot state, trips, check-ins, images, AI memories, achievements, plans, and community posts.

The service still uses the in-memory `TravelStore` for request handling. Switching runtime reads/writes to MyBatis-Plus mappers is the next persistence step.

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
