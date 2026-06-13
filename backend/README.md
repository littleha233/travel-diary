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
- Phase 5 is implemented for wishlist/manual-light/plans: city and spot state is now resolved per user, wishlist/manual-light mutations are user-scoped, and plans support list/detail/weekend-template/delete flows.
- Persistence phase 6a is implemented as a runtime database snapshot plus relational projection: the service writes the full `TravelStore` state to `travel_store_snapshots`, mirrors it into the V2 core tables after mutations, and restores the runtime state on startup.
- Persistence phase 6b starts the mapper migration: users, cities, spots, per-user city/spot state, trips, and check-ins are refreshed from MyBatis mapper reads against the V2 tables before the relevant API responses are assembled. User phone binding, user city/spot state mutations, trip creation, and check-in creation also have fine-grained mapper writes.
- Persistence phase 6c extends the mapper migration to images, AI memories, plans, achievements, and theme quests. Image metadata, AI memory saves, plan create/delete, and user achievement unlocks now have fine-grained mapper writes.
- Persistence phase 6d moves Community Feed reads to the `community_posts` table through a MyBatis mapper. Likes, saves, and comments now have user-scoped write tables and mapper methods; full post publishing and follows are still future work.
- Flyway schema migrations now define the core MySQL tables for users, places, per-user city/spot state, trips, check-ins, images, AI memories, achievements, plans, community posts, and community interactions.

The service still uses `TravelStore` as the request-handling facade. Runtime state now persists through a database snapshot and is mirrored into normalized tables for inspection and migration continuity. Core travel, media, AI memory, plan, achievement, quest, Community Feed, and community interaction paths now use MyBatis reads/writes where the product has APIs. Full community post publishing remains the main unmigrated domain.

## Persistence

Migration `V3__travel_store_snapshot.sql` adds `travel_store_snapshots`.

Current behavior:

- On first startup, seed data is written to the snapshot table.
- On later startups, the service restores users, places, trips, check-ins, images, AI memories, plans, achievements, quests, community posts, and user city/spot state from the snapshot.
- Mutations such as login phone binding, trip creation, check-in, wishlist/manual-light, image metadata changes, AI memory save, and plan changes write through to the snapshot.
- Each snapshot save also rewrites the V2 relational projection tables such as `users`, `cities`, `spots`, `user_city_states`, `user_spot_states`, `trips`, `check_ins`, `images`, `ai_memories`, `plans`, achievements, quests, and `community_posts`.
- User/profile, city, spot, nearby spot, trip creation validation, check-in validation, wishlist, manual-light, trip, and check-in flows refresh phase 1 state from the relational tables through MyBatis mappers.
- User phone binding, user city/spot state changes, trip creation, and check-in creation write directly through MyBatis mapper methods before the compatibility snapshot/projection save runs.
- Image metadata, AI memories, plans, achievements, and theme quests refresh from relational tables through MyBatis mappers.
- Image upload metadata changes, AI memory saves, plan create/delete, and achievement unlocks write directly through MyBatis mapper methods before the compatibility snapshot/projection save runs.
- Community Feed refreshes from `community_posts` through a MyBatis mapper before `/community/posts` responses are assembled.
- Community likes, saves, and comments write to `community_post_likes`, `community_post_saves`, and `community_comments`; post responses include user-scoped `liked`/`saved` flags and aggregate counts.
- Migration `V4__check_in_idempotency.sql` adds a unique index for `(user_id, client_request_id)` on `check_ins`.
- Migration `V5__community_interactions.sql` adds community like, save, and comment tables.

This is an incremental persistence step designed to preserve the current API behavior while keeping the mapper migration small. Production-grade normalized persistence should add community post publishing/follow APIs and continue moving remaining snapshot-backed facade behavior into domain services over the existing Flyway tables.

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
