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
- Phase 3 is implemented for image uploads: local fallback uploads still work for fast tests, and Docker/MinIO mode returns S3-compatible presigned PUT URLs, confirms image metadata, and exposes public image URLs.
- Phase 4 is implemented for AI memories: `/ai-memories/generate` now runs through a backend `AiMemoryProvider` abstraction with `mock`, `anthropic`, and `deepseek` providers, server-side API keys, retry handling, and safe fallback drafts.
- Flyway schema migrations now define the core MySQL tables for users, places, per-user city/spot state, trips, check-ins, images, AI memories, achievements, plans, and community posts.

The service still uses the in-memory `TravelStore` for request handling. Switching runtime reads/writes to MyBatis-Plus mappers is the next persistence step.

## AI Provider

Local runs default to the deterministic mock provider:

```bash
TRAVELAROUND_AI_PROVIDER=mock
```

Anthropic mode:

```bash
TRAVELAROUND_AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=<server-side-key>
TRAVELAROUND_AI_MODEL=claude-haiku-4-5
```

DeepSeek mode:

```bash
TRAVELAROUND_AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=<server-side-key>
TRAVELAROUND_AI_MODEL=deepseek-v4-flash
```

Optional overrides: `TRAVELAROUND_AI_ENDPOINT`, `TRAVELAROUND_AI_MAX_TOKENS`, `TRAVELAROUND_AI_TIMEOUT_SECONDS`, and `TRAVELAROUND_ANTHROPIC_VERSION`.

## Docker Compose

```bash
cd backend
docker compose up --build
```

Services:

- Backend: `http://localhost:8080`
- MySQL: `localhost:3306`
- MinIO console: `http://localhost:9001`

MinIO credentials:

```text
travelaround / travelaround
```

For real-device testing, set `TRAVELAROUND_STORAGE_PUBLIC_ENDPOINT` to a URL reachable by the phone, for example:

```bash
TRAVELAROUND_STORAGE_PUBLIC_ENDPOINT=http://<LAN-IP>:9000
```

Frontend API mode:

```bash
EXPO_PUBLIC_TRAVEL_DATA_SOURCE=api
EXPO_PUBLIC_API_BASE_URL=http://<LAN-IP>:8080/v1
EXPO_PUBLIC_API_AUTH_MODE=guest
```
