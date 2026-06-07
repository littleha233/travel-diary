# Build And Release

Version: Phase 8 MVP  
Scope: EAS development build and internal testing preparation.

## Prerequisites

Install and authenticate EAS CLI:

```bash
npm install -g eas-cli
eas login
```

Confirm the project is linked:

```bash
eas whoami
eas project:init
```

`eas project:init` may add `extra.eas.projectId` to `app.json`. Commit that value after it is created for this repository.

## Local Quality Gate

Run before every build:

```bash
npm run typecheck
npm run lint
npm run format:check
npm test
```

For a single command:

```bash
npm run check
```

## EAS Build Profiles

Configured in `eas.json`:

- `development`: development client, internal distribution, iOS simulator build, Android APK.
- `internal`: internal distribution for real devices.
- `preview`: internal Android AAB and app-store-like iOS settings.
- `production`: production profile with auto-increment enabled.

## Development Builds

iOS simulator development build:

```bash
eas build --profile development --platform ios
```

Android development APK:

```bash
eas build --profile development --platform android
```

After the development build is installed:

```bash
npm start
```

Open the installed development client and connect to the local Expo server.

## iOS Internal / TestFlight

1. Make sure Apple Developer account access is ready.
2. Confirm bundle identifier in `app.json` before the first real-device build.
3. Build an internal iOS artifact:

```bash
eas build --profile internal --platform ios
```

4. For TestFlight submission, use production build and submit:

```bash
eas build --profile production --platform ios
eas submit --platform ios
```

5. In App Store Connect, add internal testers and complete export compliance, privacy, and TestFlight metadata.

## Android Internal Testing

1. Confirm Android package name in `app.json` before first Play Console upload.
2. Build internal APK:

```bash
eas build --profile internal --platform android
```

3. For Play Console internal testing, build AAB:

```bash
eas build --profile preview --platform android
```

4. Upload the AAB to Play Console internal testing.
5. Add testers, complete Data safety, app access, and content rating sections.

## Device Test Focus

Before distributing an internal build, verify:

- Location permission denied -> manual check-in still works.
- Photo permission denied -> text-only check-in still works.
- Check-in success updates city, spot, trip, and quest progress.
- AI memory generation failure leaves input intact and can retry.
- Mock mode works without backend.
- API mode shows useful loading/error/retry states against a backend.
- Custom map layer switching and point navigation work on touch devices.

## Current Limitations

- Real TestFlight / Play Console upload requires account credentials and app identifiers that are not stored in this repo yet.
- No real map SDK is included in Phase 8.
- No real AI provider key is stored in the frontend.
- E2E automation is planned after the first development build is stable.
