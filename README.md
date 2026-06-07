# TravelAround

TravelAround v0.1 is an Expo + React Native + TypeScript frontend prototype for a travel check-in and travel map app.

## Tech Stack

- Expo
- React Native
- TypeScript
- Expo Router
- StyleSheet
- Local mock data / switchable API service layer

## Getting Started

Install dependencies:

```bash
npm install
```

Start the Expo dev server:

```bash
npm start
```

Run on iOS, Android, or Web:

```bash
npm run ios
npm run android
npm run web
```

Run TypeScript checks:

```bash
npm run typecheck
```

## Prototype Scope

The app can run on local mock data or a backend API contract. It does not connect to a real map SDK, real login, or real image upload yet.

Implemented screens include:

- Login / guest entry
- 5 bottom tabs: Home, Plan, CheckIn, Community, Profile
- City detail
- Spot detail
- Plan detail
- Theme quest detail
- Trip detail
- AI memory generation/detail
- Achievements
- Settings

## Phase 3 Native Capabilities

Implemented native-facing check-in capabilities:

- Foreground location permission is requested only from the CheckIn screen when the user taps location.
- Current GPS coordinates are read with `expo-location`.
- Nearby check-in spots are calculated locally from mock spot coordinates and radius values.
- Manual check-in remains available when location permission is denied, unavailable, or no nearby mock spot is found.
- Photo library permission is requested only when the user chooses a check-in photo.
- Selected photos are previewed before saving; on iOS/Android they are copied into the app document directory with `expo-file-system/legacy`.
- Text-only check-ins remain available when photo permission is denied.

Expo packages used:

- `expo-location`
- `expo-image-picker`
- `expo-file-system`

iOS / Android permission configuration:

- iOS `NSLocationWhenInUseUsageDescription` explains that location is used for nearby check-in detection.
- iOS `NSPhotoLibraryUsageDescription` explains that the photo library is used for optional local check-in photos.
- Android permissions include `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`, `READ_MEDIA_IMAGES`, and `READ_EXTERNAL_STORAGE`.
- `app.json` configures the `expo-location` and `expo-image-picker` plugins with matching permission copy.

Real-device test steps:

1. Start the app with `npm start`.
2. Open the app on iOS/Android via Expo Go for quick checks, or create a Development Build if you need to verify native permission strings from `app.json`.
3. Navigate to the CheckIn tab and confirm no location prompt appears before tapping location.
4. Tap location, allow permission, and test near a mock coordinate such as Hangzhou Broken Bridge: `30.2617, 120.1526`.
5. Deny location permission and confirm manual check-in still works.
6. During check-in, tap choose photo, allow or deny photo permission, and confirm both photo and text-only flows save locally.
7. On Web, test in a browser that supports geolocation and also in a blocked/denied permission state.

Known limitations:

- Nearby place recognition is local math against mock coordinates, not a real POI or map SDK.
- Web photo caching uses the selected browser URI directly; native iOS/Android copies the image into the app document directory.
- Expo Go can exercise the APIs, but custom native permission copy is best verified in a Development Build.
- No backend upload, cross-device sync, EXIF processing, or map geofence monitoring is included in this phase.

## Phase 5 Data Source Switching

Data flow:

- Screens read and mutate data through `useTravelStore`.
- `useTravelStore` calls `travelDataService`.
- `travelDataService` selects `mockTravelService` or `realApiService` from environment config.
- `realApiService` uses the shared `apiClient`, which unwraps API envelopes and normalizes network/API errors.
- Loading, error, empty, and retry states stay in the store/component layer; screen components do not call `fetch` directly.

Switch between mock and API:

1. Copy `.env.example` to `.env`.
2. Use mock mode for local frontend work:

```bash
EXPO_PUBLIC_TRAVEL_DATA_SOURCE=mock
```

3. Use real API mode when a backend is running:

```bash
EXPO_PUBLIC_TRAVEL_DATA_SOURCE=api
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/v1
```

4. Restart Expo after changing env values.

Connected API contract endpoints:

- `GET /users/me`
- `GET /cities`
- `GET /spots`
- `GET /trips`
- `GET /trips/{tripId}`
- `GET /achievements`
- `POST /check-ins`
- `POST /ai-memories/generate`
- `POST /ai-memories`

Not connected yet:

- `GET /home/summary`
- `GET /cities/{cityId}`
- `GET /spots/{spotId}`
- `GET /spots/nearby`
- `POST /images/upload-url`
- `POST /images/{imageId}/confirm`
- `POST /trips`
- `GET /ai-memories/{memoryId}`
- Travel plan APIs are not in the Phase 4 contract yet, so plans remain local in API mode.

## Phase 6 AI Memory Generation

Phase 6 implements a text-only AI memory MVP with an editable draft flow.

Frontend flow:

- Trip detail opens `/ai-memory/{tripOrMemoryId}`.
- The AI Memory screen collects `tripId`, `style`, and `extraPrompt`.
- `useTravelStore.generateAIMemoryDraft` calls the active travel data service.
- Mock mode generates a local draft from trip city, dates, spots, mood text, photo count, and user notes.
- API mode calls backend proxy endpoint `POST /ai-memories/generate`.
- The user edits `title`, `content`, `summary`, and `shareText`.
- `useTravelStore.saveAIMemory` saves the edited draft as an AI Memory.

Security and backend boundary:

- The frontend never stores or calls with an AI provider API key.
- Prompt ownership belongs to the backend AI proxy.
- The backend should keep provider credentials in server-side environment variables.
- The backend prompt template is documented in `docs/AI_MEMORY_PROMPT_TEMPLATE.md`.

Failure behavior:

- API generation retries transient network, timeout, rate limit, and 5xx failures.
- Generation failures keep `style` and `extraPrompt` on screen so the user can retry.
- Mock generation returns a safe fallback draft when unsafe text appears in mood or extra prompt.
- Empty or malformed backend draft fields are normalized into editable fallback text.
