# TravelAround Acceptance Report

Date: 2026-06-07  
Scope: Phase 1 to Phase 8 formal acceptance preparation  
Repository: `git@github.com:littleha233/travel-diary.git`

## Current Completed Phases

| Phase   | Status    | Summary                                                                                   |
| ------- | --------- | ----------------------------------------------------------------------------------------- |
| Phase 1 | Completed | Frontend prototype, app shell, navigation, initial visual system, planning assets.        |
| Phase 2 | Completed | Local mock business loop for TravelAround core screens and local progress.                |
| Phase 3 | Completed | Native-facing location, photo permission, photo picking, and local check-in capabilities. |
| Phase 4 | Completed | REST API contract draft for backend integration.                                          |
| Phase 5 | Completed | Switchable mock / real API service layer.                                                 |
| Phase 6 | Completed | Text-only AI memory generation MVP through backend proxy contract.                        |
| Phase 7 | Completed | Custom mock map and POI MVP with MapProvider abstraction.                                 |
| Phase 8 | Completed | Testing, linting, formatting, and EAS build/release baseline.                             |

## Implemented Features

- Expo Router app shell with onboarding, login, bottom tabs, and detail routes.
- Home travel map with custom mock map, city points, layer switching, and point navigation.
- City detail, spot detail, trip detail, plan detail, quest detail, achievements, community, profile, and settings screens.
- Local mock data for user, cities, spots, trips, check-ins, AI memories, achievements, quests, plans, and community posts.
- Zustand store with persisted local travel state.
- Local check-in flow with GPS attempt, permission-denied fallback, manual check-in, optional photo selection, and local photo caching on native.
- Derived state synchronization for lit spots, lit cities, trip summaries, user stats, and quest progress.
- API contract covering user, city, spot, nearby spots, check-ins, trips, images, AI memories, achievements, and quests.
- Switchable data source via `EXPO_PUBLIC_TRAVEL_DATA_SOURCE=mock|api`.
- Real API service wrapper with envelope handling, timeout handling, and normalized errors.
- Text-only AI memory draft generation flow with editable title, content, summary, and share text.
- Backend-proxy AI endpoint contract; frontend does not hold AI provider keys.
- AI prompt template maintained in `docs/AI_MEMORY_PROMPT_TEMPLATE.md`.
- Mock MapProvider abstraction in `src/services/map`.
- EAS build profiles for development, internal, preview, and production.
- Baseline automated tests, snapshots, ESLint, Prettier, and TypeScript checks.

## Not Implemented

- Real backend service implementation.
- Real authentication and account lifecycle.
- Real OpenAI or AI provider integration.
- Real image upload, object storage, and backend image confirmation.
- Real map SDK integration with AMap / Gaode, Tencent Maps, Mapbox, or another provider.
- Real POI provider search.
- Real geofencing or continuous location monitoring.
- Real trip creation API integration in API mode.
- Travel plan backend API contract and persistence.
- Production iOS TestFlight upload.
- Production Android internal testing upload.
- Full end-to-end test automation on device.
- CI workflow for automatic checks on pull requests.

## Known Issues

- Browser wallet-extension errors may appear during local Web testing; previous checks identified them as browser extension noise rather than app errors.
- Codex in-app browser local-page inspection was unreliable in prior phases, so Web export is currently used as the reliable build verification fallback.
- `gh` is installed but not authenticated on this machine, so PR creation still requires browser flow or `gh auth login`.
- EAS project has not been initialized with a committed `extra.eas.projectId`.
- iOS bundle identifier and Android package name are not finalized in `app.json`.
- Native permission copy is configured, but final strings still need real-device validation in a development build.
- App is still primarily a mock-data MVP; real API mode depends on a compatible backend.

## Risks

- Real backend integration may expose contract drift because only part of the API contract is currently wired in `realApiService`.
- Domestic map integration requires provider selection, GCJ-02 handling, SDK key management, privacy compliance, and map data compliance review.
- AI memory generation needs backend content safety, rate limiting, audit logging, and provider retry/timeout policy before production.
- Image upload and user-generated content need moderation, storage cost controls, and privacy review.
- Persisted local mock data can mask backend loading issues during API-mode testing if not reset.
- Test coverage is a baseline, not a full release safety net.
- EAS release requires Apple Developer and Google Play Console account setup that is not represented in this repository.

## Acceptance Recommendations

1. Accept Phase 1 to Phase 8 as a feature-complete MVP prototype and internal-test baseline.
2. Use mock mode for product walkthrough acceptance.
3. Use API mode only with a backend that implements the Phase 5 and Phase 6 connected endpoints.
4. Run the checks in `TEST_RESULT.md` before every merge.
5. Complete one iOS and one Android development build before declaring native acceptance.
6. Verify permission-denied, manual check-in, photo selection, AI retry, and map navigation on real devices.
7. Before production planning, decide backend stack, map SDK, AI provider, image storage, auth provider, and compliance requirements.
