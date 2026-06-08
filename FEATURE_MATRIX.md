# TravelAround Feature Matrix

Date: 2026-06-08
Scope: Phase 1 to Phase 8 acceptance matrix plus review remediation

Status legend:

- Completed: MVP behavior is implemented and can be accepted in current scope.
- Partial: MVP has local/mock or contract-level support, but production capability is incomplete.
- Not Done: Not implemented beyond placeholder, docs, or future contract mention.

## Page Matrix

| Page / Area                   | Status    | Acceptance Entry                                   | Related Files                                                                                   |
| ----------------------------- | --------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| App shell and routing         | Completed | Launch app, navigate between tabs and detail pages | `app/_layout.tsx`, `app/tabs/_layout.tsx`, `src/components/BottomTabBar.tsx`                    |
| Login / guest entry           | Completed | `/login`                                           | `app/login.tsx`                                                                                 |
| Onboarding                    | Completed | `/onboarding`                                      | `app/onboarding.tsx`                                                                            |
| Home dashboard                | Completed | `/tabs/home`                                       | `app/tabs/home.tsx`, `src/components/MapPreview.tsx`, `src/services/map/mockMapProvider.ts`     |
| Map tab                       | Completed | `/tabs/map`                                        | `app/tabs/map.tsx`, `src/components/ChinaMapWebView.tsx`                                        |
| Plan tab                      | Completed | `/tabs/plan`                                       | `app/tabs/plan.tsx`, `src/components/PlanCard.tsx`, `src/mock/plans.ts`                         |
| Check-in tab                  | Completed | `/tabs/checkin`                                    | `app/tabs/checkin.tsx`, `src/store/travelStore.ts`, `src/services/mockTravelService.ts`         |
| Community tab                 | Completed | `/tabs/community`                                  | `app/tabs/community.tsx`, `src/components/CommunityCard.tsx`, `src/store/travelStore.ts`        |
| Profile tab                   | Completed | `/tabs/profile`                                    | `app/tabs/profile.tsx`, `src/components/AchievementBadge.tsx`                                   |
| Settings                      | Completed | `/settings`                                        | `app/settings.tsx`, `src/store/travelStore.ts`                                                  |
| City detail                   | Completed | `/city/{cityId}`                                   | `app/city/[id].tsx`, `src/components/SpotCard.tsx`, `src/components/MapPreview.tsx`             |
| Spot detail                   | Completed | `/spot/{spotId}`                                   | `app/spot/[id].tsx`, `src/types/spot.ts`                                                        |
| Trip detail                   | Completed | `/trip/{tripId}`                                   | `app/trip/[id].tsx`, `src/types/trip.ts`                                                        |
| AI Memory detail / generation | Completed | `/ai-memory/{tripIdOrMemoryId}`                    | `app/ai-memory/[id].tsx`, `src/services/mockTravelService.ts`, `src/services/realApiService.ts` |
| Plan detail                   | Completed | `/plan/{planId}`                                   | `app/plan/[id].tsx`, `src/types/plan.ts`                                                        |
| Quest detail                  | Completed | `/quest/{questId}`                                 | `app/quest/[id].tsx`, `src/types/quest.ts`                                                      |
| Achievements                  | Completed | `/achievements`                                    | `app/achievements.tsx`, `src/mock/achievements.ts`                                              |
| Create trip                   | Completed | `/create-trip`                                     | `app/create-trip.tsx`, `src/store/travelStore.ts`, `src/services/mockTravelService.ts`          |
| Share card                    | Completed | `/share-card/{tripIdOrAchievementId}`              | `app/share-card/[id].tsx`, `app/trip/[id].tsx`, `app/achievements.tsx`                          |

## Functional Matrix

| Feature                          | Status    | Acceptance Entry                               | Related Files                                                                           |
| -------------------------------- | --------- | ---------------------------------------------- | --------------------------------------------------------------------------------------- |
| Static frontend prototype        | Completed | Run app and inspect main screens               | `app/**`, `src/components/**`, `src/theme/theme.ts`                                     |
| Mock travel data                 | Completed | Start in mock mode                             | `src/mock/**`                                                                           |
| Persisted local state            | Completed | Restart app after local actions                | `src/store/travelStore.ts`                                                              |
| Light up spot                    | Completed | `/tabs/checkin` -> check in or manual make-up  | `app/tabs/checkin.tsx`, `src/services/mockTravelService.ts`                             |
| Manual city light-up             | Completed | `/city/{cityId}` -> light / cancel manual mark | `app/city/[id].tsx`, `src/services/mockTravelService.ts`                                |
| Wishlist city / spot management  | Completed | City, spot, and plan wishlist actions          | `app/city/[id].tsx`, `app/spot/[id].tsx`, `app/tabs/plan.tsx`                           |
| Trip creation                    | Completed | `/create-trip` -> create local trip            | `app/create-trip.tsx`, `src/services/mockTravelService.ts`                              |
| City state sync after check-in   | Completed | Check city detail after check-in               | `src/services/mockTravelService.ts`, `src/services/__tests__/mockTravelService.test.ts` |
| Theme quest progress sync        | Completed | Check quest progress after related check-in    | `src/services/mockTravelService.ts`, `src/mock/quests.ts`                               |
| Location permission request      | Completed | `/tabs/checkin` -> Start location              | `app/tabs/checkin.tsx`, `app.json`                                                      |
| Location denied fallback         | Completed | Deny location -> manual check-in remains       | `app/tabs/checkin.tsx`, `app/tabs/__tests__/checkin.test.tsx`                           |
| Photo permission request         | Completed | Check-in modal -> choose photos                | `app/tabs/checkin.tsx`, `app.json`                                                      |
| Multi-photo check-in             | Completed | Check-in modal -> up to 9 photos               | `app/tabs/checkin.tsx`, `src/types/checkIn.ts`                                          |
| Native photo cache               | Completed | iOS/Android photo check-in                     | `app/tabs/checkin.tsx`                                                                  |
| Web photo fallback               | Completed | Web photo check-in                             | `app/tabs/checkin.tsx`                                                                  |
| API contract                     | Completed | Read contract                                  | `API_CONTRACT.md`                                                                       |
| Mock / real API switch           | Completed | Set `EXPO_PUBLIC_TRAVEL_DATA_SOURCE`           | `src/services/config.ts`, `src/services/travelDataService.ts`, `.env.example`           |
| Real API loading                 | Partial   | API mode with backend                          | `src/services/realApiService.ts`, `src/services/apiClient.ts`                           |
| Check-in API integration         | Partial   | API mode -> check-in with backend              | `src/services/realApiService.ts`                                                        |
| AI memory generation             | Completed | `/ai-memory/{tripId}` -> generate draft        | `app/ai-memory/[id].tsx`, `src/services/mockTravelService.ts`                           |
| AI memory backend proxy contract | Completed | Read API contract and prompt template          | `API_CONTRACT.md`, `docs/AI_MEMORY_PROMPT_TEMPLATE.md`                                  |
| AI memory editable save          | Completed | Generate, edit, save                           | `app/ai-memory/[id].tsx`, `src/store/travelStore.ts`                                    |
| AI generation failure retry      | Completed | Simulated by tests                             | `app/ai-memory/__tests__/aiMemory.test.tsx`                                             |
| Real AI provider integration     | Not Done  | N/A                                            | Backend future work                                                                     |
| WebView map city points          | Completed | `/tabs/map`                                    | `src/components/ChinaMapWebView.tsx`, `src/mock/cities.ts`                              |
| WebView map spot points          | Completed | `/tabs/map`                                    | `src/components/ChinaMapWebView.tsx`, `src/mock/spots.ts`                               |
| Map layer switching              | Completed | `/tabs/map` plus/minus or layer pills          | `src/components/MapPreview.tsx`                                                         |
| Share card skeleton              | Completed | Trip / achievement share entry                 | `app/share-card/[id].tsx`                                                               |
| Nearby POI calculation           | Completed | Spot layer panel                               | `src/services/map/mockMapProvider.ts`, `src/utils/geo.ts`                               |
| Native map SDK                   | Not Done  | N/A                                            | `docs/MAP_PROVIDER.md`                                                                  |
| Image upload API                 | Not Done  | N/A                                            | `API_CONTRACT.md` only                                                                  |
| Trip creation API                | Not Done  | N/A                                            | `API_CONTRACT.md` only                                                                  |
| Travel plan API                  | Not Done  | N/A                                            | Future API contract                                                                     |
| ESLint                           | Completed | `npm run lint`                                 | `eslint.config.js`                                                                      |
| Prettier                         | Completed | `npm run format:check`                         | `.prettierrc`, `.prettierignore`                                                        |
| TypeScript check                 | Completed | `npm run typecheck`                            | `tsconfig.json`                                                                         |
| Jest tests                       | Completed | `npm test`                                     | `jest.config.js`, `jest.setup.ts`, `**/__tests__/**`                                    |
| EAS build profiles               | Completed | `eas build --profile ...`                      | `eas.json`, `BUILD_AND_RELEASE.md`                                                      |
| iOS TestFlight upload            | Not Done  | N/A                                            | `BUILD_AND_RELEASE.md`                                                                  |
| Android internal upload          | Not Done  | N/A                                            | `BUILD_AND_RELEASE.md`                                                                  |

## Acceptance Priority

1. Verify mock-mode product walkthrough end to end.
2. Verify check-in permission fallback on iOS and Android.
3. Verify AI memory generation/edit/save flow.
4. Verify map navigation from Home -> City -> Spot.
5. Verify API mode against a real backend once backend exists.
6. Verify EAS development build before TestFlight or Play Console internal testing.
