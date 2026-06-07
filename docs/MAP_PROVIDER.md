# MapProvider Design

Version: Phase 7 MVP  
Scope: Custom mock map and POI capability. No real map SDK integration in this phase.

## Abstraction

`MapProvider` lives under `src/services/map` and keeps map data logic out of React components.

```ts
type MapProvider = {
  id: 'mock' | 'amap' | 'tencent' | 'mapbox';
  buildCountryPoints(input): MapPoint[];
  buildCityPoints(input): MapPoint[];
  buildSpotPoints(input): MapPoint[];
  findNearbySpots(input): NearbySpot[];
};
```

`MapPoint` is the render contract consumed by `MapPreview`:

- `kind`: `city` or `spot`
- `state`: `lit`, `unlit`, `wishlist`, or `theme-task`
- `coordinates`: mock WGS84 latitude/longitude
- `x` / `y`: projected percentage position for the current custom map layer
- `href`: Expo Router target for city or spot detail
- `relatedQuestIds`: theme quest bindings for future filters

## Current Mock Map

The current implementation is `mockMapProvider`.

- City mock data now includes `coordinates` in addition to legacy `mapX` / `mapY`.
- Spot mock data already had WGS84-style coordinates.
- Country layer projects city coordinates into a custom China-shaped SVG background.
- City layer focuses one city and nearby cities using distance sorting.
- Spot layer projects the focused city's spots into a local bounding box.
- Nearby POIs are calculated with Haversine distance and formatted with `formatDistance`.
- Old persisted city data without coordinates is backfilled during `syncDerivedTravelData`.

`MapPreview` supports:

- Nationwide -> city -> spot layer switching.
- Plus / minus zoom controls for layer changes.
- Point state legend.
- City point clicks to `/city/{cityId}`.
- Spot point clicks to `/spot/{spotId}`.
- Nearby spot list on spot layer.

## Future SDK Adapter Points

### AMap / Gaode

Best fit for mainland China consumer usage.

- Use GCJ-02 coordinates for rendered SDK overlays.
- Convert stored WGS84 mock/backend coordinates to GCJ-02 before display if backend remains WGS84.
- Replace custom `x` / `y` projection with SDK marker overlays.
- Keep `MapPoint.state` for marker color and icon selection.
- Use AMap POI search for real nearby places after user permission and compliance review.
- Review app registration, domain/package binding, privacy policy, and location permission copy.

### Tencent Maps

Good domestic fallback with strong mini-program and mobile ecosystem coverage.

- Same GCJ-02 coordinate concern as AMap.
- Map provider can expose Tencent marker data while keeping the same `MapPoint` state contract.
- Useful if Tencent ecosystem login, sharing, or mini-program expansion becomes important.
- Review SDK key restrictions, privacy disclosure, and domestic map data requirements.

### Mapbox

Good for international visual customization, less ideal as the first mainland China SDK.

- Mapbox generally uses WGS84-style coordinates.
- Domestic availability, tile loading reliability, ICP/compliance, and data provider requirements need review before production use in China.
- Custom style flexibility is high, but Chinese POI coverage and regulatory fit may be weaker than domestic providers.

## Phase 7 Decision

Do not integrate a real SDK yet. Keep the app on the custom mock map until the product flow is stable:

1. Validate layer switching and point navigation.
2. Validate lit / unlit / wishlist / theme-task states.
3. Validate nearby POI math and UX.
4. Choose the first real SDK based on target market and compliance needs.
