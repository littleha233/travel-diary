# TravelAround Test Plan

Version: Phase 8 MVP  
Status: Active baseline

## Goals

- Keep TypeScript checks as the first static quality gate.
- Use ESLint and Prettier to prevent style and correctness drift.
- Add Jest coverage for core business state, component rendering, key page rendering, and service retry behavior.
- Document manual device checks before iOS / Android internal release builds.

## Test Layers

### Static Analysis

Commands:

```bash
npm run typecheck
npm run lint
npm run format:check
```

Coverage:

- TypeScript strict checks for `app` and `src`.
- Expo ESLint flat config.
- Prettier formatting for source, config, and Markdown docs.

### Component Tests

Command:

```bash
npm test
```

Current component coverage:

- `StatusChip` renders status labels.
- `MapPreview` compact map snapshot.
- `MapPreview` spot layer renders focused city POI labels.

### Business State Tests

Command:

```bash
npm test
```

Current service coverage:

- Lighting a spot updates the spot state and owning city state.
- Successful check-in recalculates theme quest progress.
- AI memory draft generation retries transient real API failures.
- `EXPO_PUBLIC_TRAVEL_DATA_SOURCE` switches between `mock` and `api`.

### Key Page Rendering Tests

Command:

```bash
npm test
```

Current page coverage:

- Check-in page keeps manual check-in available after location permission is denied.
- AI Memory page preserves input after generation failure and supports retry.

## Required Core Paths

| Path                       | Automated | Current Test                |
| -------------------------- | --------- | --------------------------- |
| 点亮景点后城市状态更新     | Yes       | `mockTravelService.test.ts` |
| 打卡成功后主题任务进度更新 | Yes       | `mockTravelService.test.ts` |
| 权限拒绝后可手动补卡       | Yes       | `checkin.test.tsx`          |
| AI 回忆生成失败后可重试    | Yes       | `aiMemory.test.tsx`         |
| mock / real API 可切换     | Yes       | `config.test.ts`            |

## Manual Device Test Checklist

Run this on iOS and Android before internal release:

1. Start from a clean install.
2. Enter as guest.
3. Open Home and switch map layers.
4. Open a city from the map, then open a spot from city map.
5. Open CheckIn.
6. Deny location permission and confirm manual check-in remains available.
7. Complete manual check-in with text only.
8. Allow photo permission and complete manual check-in with one photo.
9. If testing near mock coordinates, allow location and verify GPS check-in flow.
10. Open Trip detail and generate an AI memory draft in mock mode.
11. Edit title/content/summary/share text and save.
12. Switch to API mode against a local backend and verify loading/error/retry behavior.

## Future Coverage

- Add dedicated store tests around persisted hydration.
- Add more page snapshots for Home, Trip detail, and City detail.
- Add integration tests for save AI Memory in API mode once backend exists.
- Add Detox or Maestro E2E tests after the first development build is stable.
- Add CI workflow after the GitHub auth and repository automation setup is complete.
