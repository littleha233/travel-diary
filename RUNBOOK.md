# TravelAround Runbook

Date: 2026-06-07  
Scope: Local development, preview, mock/API switching, and EAS build commands.

## Prerequisites

- Node.js compatible with the current Expo project.
- npm.
- Expo CLI through `npx expo`.
- For EAS builds: `eas-cli` and an authenticated Expo account.

Install dependencies:

```bash
npm install
```

## Local Start

Start the Expo dev server:

```bash
npm start
```

Run all local quality checks:

```bash
npm run check
```

Run formatting check:

```bash
npm run format:check
```

## iOS Start

For Expo Go or an installed development build:

```bash
npm run ios
```

If native permission copy or native behavior must be validated, use an EAS development build instead of relying only on Expo Go.

## Android Start

For Expo Go or an installed development build:

```bash
npm run android
```

If native permission copy or APK behavior must be validated, install an EAS development/internal build on a real Android device.

## Web Preview

Start Web preview:

```bash
npm run web
```

Build a static Web export for verification:

```bash
npx expo export --platform web --output-dir /tmp/travelaround-web-export
```

## EAS Build Commands

Install and authenticate EAS CLI:

```bash
npm install -g eas-cli
eas login
```

Initialize/link the EAS project if not already done:

```bash
eas project:init
```

iOS simulator development build:

```bash
eas build --profile development --platform ios
```

Android development APK:

```bash
eas build --profile development --platform android
```

iOS internal device build:

```bash
eas build --profile internal --platform ios
```

Android internal APK:

```bash
eas build --profile internal --platform android
```

Android Play Console internal AAB:

```bash
eas build --profile preview --platform android
```

iOS production/TestFlight flow:

```bash
eas build --profile production --platform ios
eas submit --platform ios
```

## Environment Variables

Defined in `.env.example`:

```bash
EXPO_PUBLIC_TRAVEL_DATA_SOURCE=mock
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/v1
EXPO_PUBLIC_API_TIMEOUT_MS=12000
```

| Variable                         | Required | Description                                               |
| -------------------------------- | -------- | --------------------------------------------------------- |
| `EXPO_PUBLIC_TRAVEL_DATA_SOURCE` | No       | `mock` or `api`. Defaults to `mock`.                      |
| `EXPO_PUBLIC_API_BASE_URL`       | API mode | Backend base URL. Defaults to `http://localhost:8080/v1`. |
| `EXPO_PUBLIC_API_TIMEOUT_MS`     | No       | API request timeout in milliseconds. Defaults to `12000`. |

## Mock / Real API Switching

Use mock mode for local product walkthroughs:

```bash
EXPO_PUBLIC_TRAVEL_DATA_SOURCE=mock
```

Use API mode when a backend is running:

```bash
EXPO_PUBLIC_TRAVEL_DATA_SOURCE=api
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/v1
```

Restart Expo after changing `.env` values.

## API Mode Notes

Connected frontend endpoints:

- `GET /users/me`
- `GET /cities`
- `GET /spots`
- `GET /trips`
- `GET /trips/{tripId}`
- `GET /achievements`
- `POST /check-ins`
- `POST /ai-memories/generate`
- `POST /ai-memories`

Still local or not connected:

- Home summary API.
- City detail API.
- Spot detail API.
- Nearby spots API.
- Image upload APIs.
- Trip creation API.
- Travel plan APIs.
- Get AI memory API.

## Troubleshooting

- If local persisted mock data looks stale, use Settings reset or clear app storage.
- If API mode fails, confirm backend URL, envelope format, and CORS for Web.
- If EAS build fails before project init, run `eas project:init`.
- If GitHub CLI actions fail, run `gh auth login`.
