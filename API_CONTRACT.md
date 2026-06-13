# TravelAround API Contract

Version: Backend MVP  
Status: Implemented for the current frontend API-mode loop under `backend/`  
Scope: REST API contract plus local Spring Boot backend MVP. Core write-chain behavior is implemented for trip/check-in/nearby flows, image upload supports local fallback plus MinIO/S3-compatible presigned PUT URLs, AI memory generation supports a backend provider abstraction for mock/Anthropic/DeepSeek modes, and Phase 5 wishlist/manual-light/plans are implemented with user-scoped runtime state. Persistence now saves/restores runtime state through a database snapshot, projects it into the V2 core tables, and uses MyBatis mapper reads/writes for users, cities/spots, user state, trips, check-ins, images, AI memories, plans, achievements, quests, Community Feed reads, and community likes/saves/comments; post publishing, follows, and SMS are still follow-up work.

## 1. Design Goals

This contract is based on the current frontend mock data and the TravelAround PRD v1.0 MVP loop:

- Users can view their travel profile and home summary.
- Users can browse cities and spots.
- Users can find nearby check-in spots from GPS coordinates.
- Users can create GPS or manual check-ins.
- Users can create and view trips.
- Users can generate and view AI memories.
- Users can view achievements and theme quest progress.
- Images are represented as backend-owned metadata objects with local fallback and S3-compatible presigned upload support.

The MVP backend should keep the first closed loop small: user -> city/spot -> check-in -> trip -> AI memory -> achievement progress.

## 2. API Basics

Base URL:

```text
https://api.travelaround.app/v1
```

Authentication:

```http
Authorization: Bearer <accessToken>
```

MVP can allow guest tokens. Guest-created records should use the same schema as logged-in records so they can be merged after login.

Content type:

```http
Content-Type: application/json
```

Time format:

- Date: `YYYY-MM-DD`
- DateTime: ISO 8601 UTC, for example `2026-05-01T09:20:00.000Z`

Coordinates:

- `latitude`: WGS84 decimal degrees
- `longitude`: WGS84 decimal degrees
- Distance fields use meters.

## 3. Common Response Envelope

Successful response:

```json
{
  "data": {},
  "meta": {
    "requestId": "req_01JZ8F3M9TVT4",
    "serverTime": "2026-06-06T14:00:00.000Z"
  }
}
```

List response:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 102,
    "hasMore": true
  },
  "meta": {
    "requestId": "req_01JZ8F3M9TVT4",
    "serverTime": "2026-06-06T14:00:00.000Z"
  }
}
```

Error response:

```json
{
  "error": {
    "code": "SPOT_NOT_FOUND",
    "message": "Spot not found.",
    "details": {
      "spotId": "broken-bridge"
    }
  },
  "meta": {
    "requestId": "req_01JZ8F3M9TVT4",
    "serverTime": "2026-06-06T14:00:00.000Z"
  }
}
```

## 4. Common Error Codes

| HTTP | Code                    | Meaning                                       |
| ---- | ----------------------- | --------------------------------------------- |
| 400  | `VALIDATION_ERROR`      | Request body or query is invalid.             |
| 400  | `LOCATION_REQUIRED`     | A GPS-only request is missing coordinates.    |
| 400  | `CHECK_IN_OUT_OF_RANGE` | GPS check-in is outside the spot radius.      |
| 401  | `AUTH_REQUIRED`         | Missing or invalid access token.              |
| 403  | `FORBIDDEN`             | User cannot access this resource.             |
| 404  | `USER_NOT_FOUND`        | User does not exist.                          |
| 404  | `CITY_NOT_FOUND`        | City does not exist.                          |
| 404  | `SPOT_NOT_FOUND`        | Spot does not exist.                          |
| 404  | `TRIP_NOT_FOUND`        | Trip does not exist.                          |
| 404  | `PLAN_NOT_FOUND`        | Travel plan does not exist.                   |
| 404  | `IMAGE_NOT_FOUND`       | Image asset does not exist.                   |
| 404  | `AI_MEMORY_NOT_FOUND`   | AI memory does not exist.                     |
| 409  | `DUPLICATE_RESOURCE`    | A unique resource already exists.             |
| 409  | `TRIP_DATE_CONFLICT`    | Trip dates conflict with business rules.      |
| 422  | `AI_MEMORY_NOT_READY`   | Trip data is not enough to generate a memory. |
| 429  | `RATE_LIMITED`          | Too many requests.                            |
| 500  | `INTERNAL_ERROR`        | Unexpected server error.                      |

## 5. Data Models

### 5.1 GeoPoint

```json
{
  "latitude": 30.2617,
  "longitude": 120.1526
}
```

### 5.2 User

Matches current `TravelUser`.

```json
{
  "id": "u-nicola",
  "nickname": "Nicola",
  "avatarUrl": "https://cdn.travelaround.app/avatars/u-nicola.jpg",
  "level": "Lv.12",
  "title": "城市漫游者",
  "litCityCount": 18,
  "exploredSpotCount": 72,
  "aiMemoryCount": 11,
  "achievementCount": 14,
  "provinceCount": 7,
  "tripCount": 1,
  "createdAt": "2026-05-01T00:00:00.000Z",
  "updatedAt": "2026-06-06T14:00:00.000Z"
}
```

### 5.3 City

Matches current `City`; adds derived user stats for detail pages.

```json
{
  "id": "hangzhou",
  "name": "杭州",
  "province": "浙江",
  "lit": true,
  "wished": false,
  "visitedAt": "2026-05-03",
  "coordinates": {
    "latitude": 30.2741,
    "longitude": 120.1551
  },
  "mapX": 62,
  "mapY": 63,
  "coverUrl": "https://cdn.travelaround.app/cities/hangzhou.jpg",
  "description": "湖光、茶田、老街和雾气，把杭州变成一张适合慢慢点亮的旅行地图。",
  "spotIds": ["west-lake", "broken-bridge"],
  "tags": ["西湖", "江南", "周末探索"],
  "stats": {
    "litSpotCount": 2,
    "totalSpotCount": 5,
    "tripCount": 1,
    "photoCount": 36
  }
}
```

### 5.4 Spot

Matches current `Spot`.

```json
{
  "id": "broken-bridge",
  "cityId": "hangzhou",
  "cityName": "杭州",
  "name": "断桥残雪",
  "distance": "280m",
  "distanceMeters": 280,
  "radius": 500,
  "coordinates": {
    "latitude": 30.2617,
    "longitude": 120.1526
  },
  "status": "available",
  "canCheckIn": true,
  "coverUrl": "https://cdn.travelaround.app/spots/broken-bridge.jpg",
  "description": "西湖十景之一，适合作为杭州周末探索的第一枚新光点。",
  "tags": ["西湖十景", "可点亮"],
  "questIds": ["west-lake-ten"],
  "photoIds": []
}
```

Spot status enum:

```text
available | lit | locked | wishlist
```

### 5.5 CheckIn

Matches current `CheckInRecord`; moves local-only image URI to backend image IDs and URLs.

```json
{
  "id": "ci-broken-bridge-1760000000000",
  "userId": "u-nicola",
  "cityId": "hangzhou",
  "spotId": "broken-bridge",
  "tripId": "hangzhou-3-days",
  "createdAt": "2026-06-06T14:00:00.000Z",
  "visitedAt": "2026-06-06T13:58:00.000Z",
  "moodText": "断桥边的风很轻。",
  "type": "gps",
  "location": {
    "latitude": 30.2618,
    "longitude": 120.1527
  },
  "distanceMeters": 24,
  "photoIds": ["img_01JZ8F3M9TVT4"],
  "photos": []
}
```

Check-in type enum:

```text
gps | manual
```

### 5.6 Trip

Matches current `Trip`.

```json
{
  "id": "hangzhou-3-days",
  "userId": "u-nicola",
  "title": "杭州 3 日游",
  "cityIds": ["hangzhou"],
  "startDate": "2026-05-01",
  "endDate": "2026-05-03",
  "days": 3,
  "spotIds": ["west-lake", "leifeng-pagoda"],
  "checkInIds": ["ci-west-lake", "ci-leifeng-pagoda"],
  "photoUrls": ["https://cdn.travelaround.app/images/img_01.jpg"],
  "photoCount": 36,
  "coverUrl": "https://cdn.travelaround.app/trips/hangzhou-3-days.jpg",
  "aiMemoryId": "memory-hangzhou",
  "summary": "3 天 · 1 座城市 · 7 个景点 · 36 张照片",
  "visibility": "private",
  "createdAt": "2026-05-03T12:00:00.000Z",
  "updatedAt": "2026-06-06T14:00:00.000Z"
}
```

Visibility enum:

```text
private | public | unlisted
```

### 5.7 ImageAsset

```json
{
  "id": "img_01JZ8F3M9TVT4",
  "userId": "u-nicola",
  "url": "https://cdn.travelaround.app/images/img_01JZ8F3M9TVT4.jpg",
  "thumbnailUrl": "https://cdn.travelaround.app/images/img_01JZ8F3M9TVT4_thumb.jpg",
  "contentType": "image/jpeg",
  "width": 1600,
  "height": 1200,
  "byteSize": 524288,
  "linkedType": "check_in",
  "linkedId": "ci-broken-bridge-1760000000000",
  "createdAt": "2026-06-06T14:00:00.000Z"
}
```

### 5.8 AIMemory

Matches current `AIMemory`.

```json
{
  "id": "memory-hangzhou",
  "tripId": "hangzhou-3-days",
  "title": "在杭州，把时间走慢",
  "summary": "3 天，1 座城市，7 个景点，36 张照片。",
  "content": "清晨的西湖像一张安静的地图...",
  "shareText": "杭州 3 日游：把西湖、断桥和茶香写进一段慢下来的旅行回忆。",
  "style": "自然日记",
  "photoUrls": ["https://cdn.travelaround.app/images/img_01.jpg"],
  "spotIds": ["west-lake", "broken-bridge"],
  "status": "completed",
  "generatedAt": "2026-06-06T14:00:00.000Z"
}
```

AI memory status enum:

```text
queued | generating | completed | failed
```

### 5.9 Achievement

Matches current `Achievement`.

```json
{
  "id": "west-lake-first",
  "title": "西湖初印象",
  "description": "打卡任意 1 个西湖十景",
  "unlocked": true,
  "unlockedAt": "2026-05-01",
  "tone": "gold"
}
```

Tone enum:

```text
mint | purple | gold | blue
```

### 5.10 ThemeQuest

Matches current `ThemeQuest`.

```json
{
  "id": "west-lake-ten",
  "title": "西湖十景",
  "subtitle": "4 / 10 已点亮",
  "description": "沿着湖岸和山影收集杭州最经典的十个景致。",
  "progress": 4,
  "total": 10,
  "coverUrl": "https://cdn.travelaround.app/quests/west-lake-ten.jpg",
  "rewardAchievementId": "west-lake-collector",
  "spotIds": ["west-lake", "broken-bridge"],
  "cityIds": ["hangzhou"]
}
```

## 6. Endpoints

### 6.1 Get Current User

```http
GET /users/me
```

Request:

No body.

Response `200`:

```json
{
  "data": {
    "id": "u-nicola",
    "nickname": "Nicola",
    "avatarUrl": "https://cdn.travelaround.app/avatars/u-nicola.jpg",
    "level": "Lv.12",
    "title": "城市漫游者",
    "litCityCount": 18,
    "exploredSpotCount": 72,
    "aiMemoryCount": 11,
    "achievementCount": 14,
    "provinceCount": 7,
    "tripCount": 1
  },
  "meta": {
    "requestId": "req_01",
    "serverTime": "2026-06-06T14:00:00.000Z"
  }
}
```

Error codes:

- `AUTH_REQUIRED`
- `USER_NOT_FOUND`

Pagination:

Not needed.

### 6.2 Get Home Summary

Aggregates Home/Profile data currently derived from Zustand.

```http
GET /home/summary
```

Request:

No body.

Response `200`:

```json
{
  "data": {
    "user": {
      "id": "u-nicola",
      "nickname": "Nicola",
      "avatarUrl": "https://cdn.travelaround.app/avatars/u-nicola.jpg",
      "level": "Lv.12",
      "title": "城市漫游者",
      "litCityCount": 18,
      "exploredSpotCount": 72,
      "aiMemoryCount": 11,
      "achievementCount": 14,
      "provinceCount": 7,
      "tripCount": 1
    },
    "map": {
      "cities": [],
      "litCityCount": 18,
      "provinceCount": 7,
      "exploredSpotCount": 72
    },
    "recentTrip": {
      "id": "hangzhou-3-days",
      "title": "杭州 3 日游",
      "startDate": "2026-05-01",
      "endDate": "2026-05-03",
      "summary": "3 天 · 1 座城市 · 7 个景点 · 36 张照片",
      "coverUrl": "https://cdn.travelaround.app/trips/hangzhou-3-days.jpg",
      "aiMemoryId": "memory-hangzhou"
    },
    "recommendedQuest": {
      "id": "west-lake-ten",
      "title": "西湖十景",
      "progress": 4,
      "total": 10
    },
    "latestAchievements": []
  },
  "meta": {
    "requestId": "req_01",
    "serverTime": "2026-06-06T14:00:00.000Z"
  }
}
```

Error codes:

- `AUTH_REQUIRED`
- `USER_NOT_FOUND`

Pagination:

Not needed. The server should return compact arrays for Home. Full data should be fetched from list APIs.

### 6.3 List Cities

```http
GET /cities
```

Query parameters:

| Name           | Type    | Required | Description                                       |
| -------------- | ------- | -------- | ------------------------------------------------- |
| `status`       | string  | No       | `all`, `lit`, `unlit`, `wishlist`. Default `all`. |
| `province`     | string  | No       | Filter by province name.                          |
| `keyword`      | string  | No       | Search city name or tags.                         |
| `includeStats` | boolean | No       | Include derived user stats. Default `true`.       |
| `page`         | number  | No       | Default `1`.                                      |
| `pageSize`     | number  | No       | Default `20`, max `100`.                          |

Response `200`:

```json
{
  "data": [
    {
      "id": "hangzhou",
      "name": "杭州",
      "province": "浙江",
      "lit": true,
      "wished": false,
      "visitedAt": "2026-05-03",
      "coordinates": {
        "latitude": 30.2741,
        "longitude": 120.1551
      },
      "mapX": 62,
      "mapY": 63,
      "coverUrl": "https://cdn.travelaround.app/cities/hangzhou.jpg",
      "description": "湖光、茶田、老街和雾气，把杭州变成一张适合慢慢点亮的旅行地图。",
      "spotIds": ["west-lake", "broken-bridge"],
      "tags": ["西湖", "江南", "周末探索"],
      "stats": {
        "litSpotCount": 2,
        "totalSpotCount": 5,
        "tripCount": 1,
        "photoCount": 36
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 18,
    "hasMore": false
  },
  "meta": {
    "requestId": "req_01",
    "serverTime": "2026-06-06T14:00:00.000Z"
  }
}
```

Error codes:

- `AUTH_REQUIRED`
- `VALIDATION_ERROR`

Pagination:

Required.

### 6.4 Get City Detail

```http
GET /cities/{cityId}
```

Path parameters:

| Name     | Type   | Required | Description                      |
| -------- | ------ | -------- | -------------------------------- |
| `cityId` | string | Yes      | City ID, for example `hangzhou`. |

Query parameters:

| Name      | Type   | Required | Description                            |
| --------- | ------ | -------- | -------------------------------------- |
| `include` | string | No       | Comma-separated: `spots,quests,trips`. |

Response `200`:

```json
{
  "data": {
    "city": {
      "id": "hangzhou",
      "name": "杭州",
      "province": "浙江",
      "lit": true,
      "visitedAt": "2026-05-03",
      "mapX": 62,
      "mapY": 63,
      "coverUrl": "https://cdn.travelaround.app/cities/hangzhou.jpg",
      "description": "湖光、茶田、老街和雾气，把杭州变成一张适合慢慢点亮的旅行地图。",
      "spotIds": ["west-lake", "broken-bridge"],
      "tags": ["西湖", "江南", "周末探索"],
      "stats": {
        "litSpotCount": 2,
        "totalSpotCount": 5,
        "tripCount": 1,
        "photoCount": 36
      }
    },
    "spots": [],
    "quests": [],
    "trips": []
  },
  "meta": {
    "requestId": "req_01",
    "serverTime": "2026-06-06T14:00:00.000Z"
  }
}
```

Error codes:

- `AUTH_REQUIRED`
- `CITY_NOT_FOUND`
- `VALIDATION_ERROR`

Pagination:

Not needed for MVP city detail. If a city has many spots later, use `GET /spots?cityId=...`.

### 6.5 List Spots

```http
GET /spots
```

Query parameters:

| Name          | Type    | Required | Description                                      |
| ------------- | ------- | -------- | ------------------------------------------------ |
| `cityId`      | string  | No       | Filter spots in one city.                        |
| `status`      | string  | No       | `all`, `available`, `lit`, `locked`, `wishlist`. |
| `questId`     | string  | No       | Filter by theme quest.                           |
| `keyword`     | string  | No       | Search spot name, description, or tags.          |
| `includeCity` | boolean | No       | Include `cityName`. Default `true`.              |
| `page`        | number  | No       | Default `1`.                                     |
| `pageSize`    | number  | No       | Default `20`, max `100`.                         |

Response `200`:

```json
{
  "data": [
    {
      "id": "broken-bridge",
      "cityId": "hangzhou",
      "cityName": "杭州",
      "name": "断桥残雪",
      "distance": "280m",
      "radius": 500,
      "coordinates": {
        "latitude": 30.2617,
        "longitude": 120.1526
      },
      "status": "available",
      "canCheckIn": true,
      "coverUrl": "https://cdn.travelaround.app/spots/broken-bridge.jpg",
      "description": "西湖十景之一，适合作为杭州周末探索的第一枚新光点。",
      "tags": ["西湖十景", "可点亮"],
      "questIds": ["west-lake-ten"],
      "photoIds": []
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 5,
    "hasMore": false
  },
  "meta": {
    "requestId": "req_01",
    "serverTime": "2026-06-06T14:00:00.000Z"
  }
}
```

Error codes:

- `AUTH_REQUIRED`
- `VALIDATION_ERROR`
- `CITY_NOT_FOUND`

Pagination:

Required.

### 6.6 Get Spot Detail

```http
GET /spots/{spotId}
```

Path parameters:

| Name     | Type   | Required | Description                           |
| -------- | ------ | -------- | ------------------------------------- |
| `spotId` | string | Yes      | Spot ID, for example `broken-bridge`. |

Query parameters:

| Name        | Type   | Required | Description                                  |
| ----------- | ------ | -------- | -------------------------------------------- |
| `latitude`  | number | No       | Current latitude. Used to compute distance.  |
| `longitude` | number | No       | Current longitude. Used to compute distance. |
| `include`   | string | No       | Comma-separated: `city,photos,quests,trips`. |

Response `200`:

```json
{
  "data": {
    "spot": {
      "id": "broken-bridge",
      "cityId": "hangzhou",
      "cityName": "杭州",
      "name": "断桥残雪",
      "distance": "280m",
      "distanceMeters": 280,
      "radius": 500,
      "coordinates": {
        "latitude": 30.2617,
        "longitude": 120.1526
      },
      "status": "available",
      "canCheckIn": true,
      "coverUrl": "https://cdn.travelaround.app/spots/broken-bridge.jpg",
      "description": "西湖十景之一，适合作为杭州周末探索的第一枚新光点。",
      "tags": ["西湖十景", "可点亮"],
      "questIds": ["west-lake-ten"],
      "photoIds": [],
      "checkInState": {
        "isLit": false,
        "withinRadius": true,
        "distanceMeters": 280,
        "lastCheckInAt": null
      }
    },
    "city": null,
    "photos": [],
    "quests": [],
    "trips": []
  },
  "meta": {
    "requestId": "req_01",
    "serverTime": "2026-06-06T14:00:00.000Z"
  }
}
```

Error codes:

- `AUTH_REQUIRED`
- `SPOT_NOT_FOUND`
- `VALIDATION_ERROR`

Pagination:

Not needed.

### 6.7 Find Nearby Spots

```http
GET /spots/nearby
```

Query parameters:

| Name           | Type    | Required | Description                                 |
| -------------- | ------- | -------- | ------------------------------------------- |
| `latitude`     | number  | Yes      | Current latitude.                           |
| `longitude`    | number  | Yes      | Current longitude.                          |
| `radiusMeters` | number  | No       | Search radius. Default `3000`, max `20000`. |
| `limit`        | number  | No       | Default `10`, max `50`.                     |
| `includeLit`   | boolean | No       | Include already lit spots. Default `false`. |

Response `200`:

```json
{
  "data": {
    "location": {
      "latitude": 30.2618,
      "longitude": 120.1527
    },
    "currentCity": {
      "id": "hangzhou",
      "name": "杭州",
      "province": "浙江"
    },
    "spots": [
      {
        "id": "broken-bridge",
        "cityId": "hangzhou",
        "cityName": "杭州",
        "name": "断桥残雪",
        "distance": "24m",
        "distanceMeters": 24,
        "radius": 500,
        "coordinates": {
          "latitude": 30.2617,
          "longitude": 120.1526
        },
        "status": "available",
        "canCheckIn": true,
        "coverUrl": "https://cdn.travelaround.app/spots/broken-bridge.jpg",
        "description": "西湖十景之一，适合作为杭州周末探索的第一枚新光点。",
        "tags": ["西湖十景", "可点亮"],
        "questIds": ["west-lake-ten"],
        "photoIds": [],
        "withinRadius": true
      }
    ]
  },
  "meta": {
    "requestId": "req_01",
    "serverTime": "2026-06-06T14:00:00.000Z"
  }
}
```

Error codes:

- `AUTH_REQUIRED`
- `VALIDATION_ERROR`
- `LOCATION_REQUIRED`

Pagination:

No page-based pagination. Use `limit` because nearby search is distance-ranked.

### 6.8 Create Check-In

Creates a GPS check-in or manual补卡. This endpoint updates derived state: spot lit state, city lit state, trip check-in references, achievement progress.

```http
POST /check-ins
```

Request:

```json
{
  "spotId": "broken-bridge",
  "tripId": "hangzhou-3-days",
  "type": "gps",
  "visitedAt": "2026-06-06T13:58:00.000Z",
  "moodText": "断桥边的风很轻。",
  "location": {
    "latitude": 30.2618,
    "longitude": 120.1527
  },
  "photoIds": ["img_01JZ8F3M9TVT4"],
  "clientRequestId": "ios-uuid-001"
}
```

Request rules:

- `spotId` is required.
- `tripId` is optional. If omitted, server can attach to an active trip or create a lightweight default trip according to product rules.
- `type` is required: `gps` or `manual`.
- `location` is required when `type = gps`.
- `visitedAt` is optional. Default is server time.
- `photoIds` is optional. Empty array means text-only check-in.
- `clientRequestId` is optional but recommended for idempotency.

Response `201`:

```json
{
  "data": {
    "checkIn": {
      "id": "ci-broken-bridge-1760000000000",
      "userId": "u-nicola",
      "cityId": "hangzhou",
      "spotId": "broken-bridge",
      "tripId": "hangzhou-3-days",
      "createdAt": "2026-06-06T14:00:00.000Z",
      "visitedAt": "2026-06-06T13:58:00.000Z",
      "moodText": "断桥边的风很轻。",
      "type": "gps",
      "location": {
        "latitude": 30.2618,
        "longitude": 120.1527
      },
      "distanceMeters": 24,
      "photoIds": ["img_01JZ8F3M9TVT4"],
      "photos": []
    },
    "spot": {
      "id": "broken-bridge",
      "status": "lit",
      "canCheckIn": false
    },
    "city": {
      "id": "hangzhou",
      "lit": true,
      "visitedAt": "2026-06-06"
    },
    "trip": {
      "id": "hangzhou-3-days",
      "checkInIds": ["ci-west-lake", "ci-broken-bridge-1760000000000"],
      "spotIds": ["west-lake", "broken-bridge"],
      "photoCount": 37,
      "summary": "3 天 · 1 座城市 · 2 个景点 · 37 张照片"
    },
    "unlockedAchievements": [
      {
        "id": "west-lake-first",
        "title": "西湖初印象"
      }
    ]
  },
  "meta": {
    "requestId": "req_01",
    "serverTime": "2026-06-06T14:00:00.000Z"
  }
}
```

Error codes:

- `AUTH_REQUIRED`
- `SPOT_NOT_FOUND`
- `TRIP_NOT_FOUND`
- `LOCATION_REQUIRED`
- `CHECK_IN_OUT_OF_RANGE`
- `VALIDATION_ERROR`
- `DUPLICATE_RESOURCE`

Pagination:

Not needed.

### 6.9 Request Image Upload

Creates image metadata and returns upload instructions. The actual storage provider can be S3, OSS, Supabase Storage, Firebase Storage, or local dev storage later.

```http
POST /images/upload-url
```

Request:

```json
{
  "fileName": "broken-bridge.jpg",
  "contentType": "image/jpeg",
  "byteSize": 524288,
  "linkedType": "check_in",
  "linkedId": null
}
```

Response `201`:

```json
{
  "data": {
    "image": {
      "id": "img_01JZ8F3M9TVT4",
      "url": "https://cdn.travelaround.app/images/img_01JZ8F3M9TVT4.jpg",
      "thumbnailUrl": null,
      "contentType": "image/jpeg",
      "width": null,
      "height": null,
      "byteSize": 524288,
      "linkedType": "check_in",
      "linkedId": null,
      "createdAt": "2026-06-06T14:00:00.000Z"
    },
    "upload": {
      "method": "PUT",
      "url": "https://storage.example.com/upload/img_01JZ8F3M9TVT4",
      "headers": {
        "Content-Type": "image/jpeg"
      },
      "expiresAt": "2026-06-06T14:15:00.000Z"
    }
  },
  "meta": {
    "requestId": "req_01",
    "serverTime": "2026-06-06T14:00:00.000Z"
  }
}
```

Error codes:

- `AUTH_REQUIRED`
- `VALIDATION_ERROR`
- `FORBIDDEN`

Pagination:

Not needed.

### 6.10 Confirm Image Upload

```http
POST /images/{imageId}/confirm
```

Request:

```json
{
  "width": 1600,
  "height": 1200,
  "linkedType": "check_in",
  "linkedId": "ci-broken-bridge-1760000000000"
}
```

Response `200`:

```json
{
  "data": {
    "id": "img_01JZ8F3M9TVT4",
    "url": "https://cdn.travelaround.app/images/img_01JZ8F3M9TVT4.jpg",
    "thumbnailUrl": "https://cdn.travelaround.app/images/img_01JZ8F3M9TVT4_thumb.jpg",
    "contentType": "image/jpeg",
    "width": 1600,
    "height": 1200,
    "byteSize": 524288,
    "linkedType": "check_in",
    "linkedId": "ci-broken-bridge-1760000000000",
    "createdAt": "2026-06-06T14:00:00.000Z"
  },
  "meta": {
    "requestId": "req_01",
    "serverTime": "2026-06-06T14:00:00.000Z"
  }
}
```

Error codes:

- `AUTH_REQUIRED`
- `VALIDATION_ERROR`
- `FORBIDDEN`
- `IMAGE_NOT_FOUND`

Pagination:

Not needed.

### 6.11 Create Trip

```http
POST /trips
```

Request:

```json
{
  "title": "杭州 3 日游",
  "cityIds": ["hangzhou"],
  "startDate": "2026-05-01",
  "endDate": "2026-05-03",
  "spotIds": ["west-lake", "broken-bridge"],
  "checkInIds": ["ci-west-lake"],
  "photoIds": ["img_01JZ8F3M9TVT4"],
  "coverImageId": "img_01JZ8F3M9TVT4",
  "visibility": "private"
}
```

Request rules:

- `title`, `cityIds`, `startDate`, `endDate` are required.
- `days` is server-derived from dates.
- `spotIds`, `checkInIds`, and `photoIds` can be empty.
- `visibility` defaults to `private`.

Response `201`:

```json
{
  "data": {
    "id": "trip_01JZ8F3M9TVT4",
    "userId": "u-nicola",
    "title": "杭州 3 日游",
    "cityIds": ["hangzhou"],
    "startDate": "2026-05-01",
    "endDate": "2026-05-03",
    "days": 3,
    "spotIds": ["west-lake", "broken-bridge"],
    "checkInIds": ["ci-west-lake"],
    "photoUrls": ["https://cdn.travelaround.app/images/img_01JZ8F3M9TVT4.jpg"],
    "photoCount": 1,
    "coverUrl": "https://cdn.travelaround.app/images/img_01JZ8F3M9TVT4.jpg",
    "aiMemoryId": null,
    "summary": "3 天 · 1 座城市 · 2 个景点 · 1 张照片",
    "visibility": "private",
    "createdAt": "2026-06-06T14:00:00.000Z",
    "updatedAt": "2026-06-06T14:00:00.000Z"
  },
  "meta": {
    "requestId": "req_01",
    "serverTime": "2026-06-06T14:00:00.000Z"
  }
}
```

Error codes:

- `AUTH_REQUIRED`
- `VALIDATION_ERROR`
- `CITY_NOT_FOUND`
- `SPOT_NOT_FOUND`
- `TRIP_DATE_CONFLICT`

Pagination:

Not needed.

### 6.12 List Trips

Useful for Profile, Home, and future trip list pages.

```http
GET /trips
```

Query parameters:

| Name       | Type   | Required | Description                       |
| ---------- | ------ | -------- | --------------------------------- |
| `cityId`   | string | No       | Filter trips that include a city. |
| `fromDate` | date   | No       | Start date lower bound.           |
| `toDate`   | date   | No       | End date upper bound.             |
| `page`     | number | No       | Default `1`.                      |
| `pageSize` | number | No       | Default `20`, max `100`.          |

Response `200`:

```json
{
  "data": [
    {
      "id": "hangzhou-3-days",
      "title": "杭州 3 日游",
      "cityIds": ["hangzhou"],
      "startDate": "2026-05-01",
      "endDate": "2026-05-03",
      "days": 3,
      "spotIds": ["west-lake", "leifeng-pagoda"],
      "checkInIds": ["ci-west-lake"],
      "photoUrls": ["https://cdn.travelaround.app/images/img_01.jpg"],
      "photoCount": 36,
      "coverUrl": "https://cdn.travelaround.app/trips/hangzhou-3-days.jpg",
      "aiMemoryId": "memory-hangzhou",
      "summary": "3 天 · 1 座城市 · 7 个景点 · 36 张照片",
      "visibility": "private"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 1,
    "hasMore": false
  },
  "meta": {
    "requestId": "req_01",
    "serverTime": "2026-06-06T14:00:00.000Z"
  }
}
```

Error codes:

- `AUTH_REQUIRED`
- `VALIDATION_ERROR`

Pagination:

Required.

### 6.13 Get Trip Detail

```http
GET /trips/{tripId}
```

Path parameters:

| Name     | Type   | Required | Description |
| -------- | ------ | -------- | ----------- |
| `tripId` | string | Yes      | Trip ID.    |

Query parameters:

| Name      | Type   | Required | Description                                               |
| --------- | ------ | -------- | --------------------------------------------------------- |
| `include` | string | No       | Comma-separated: `cities,spots,checkIns,photos,aiMemory`. |

Response `200`:

```json
{
  "data": {
    "trip": {
      "id": "hangzhou-3-days",
      "userId": "u-nicola",
      "title": "杭州 3 日游",
      "cityIds": ["hangzhou"],
      "startDate": "2026-05-01",
      "endDate": "2026-05-03",
      "days": 3,
      "spotIds": ["west-lake", "leifeng-pagoda"],
      "checkInIds": ["ci-west-lake"],
      "photoUrls": ["https://cdn.travelaround.app/images/img_01.jpg"],
      "photoCount": 36,
      "coverUrl": "https://cdn.travelaround.app/trips/hangzhou-3-days.jpg",
      "aiMemoryId": "memory-hangzhou",
      "summary": "3 天 · 1 座城市 · 7 个景点 · 36 张照片",
      "visibility": "private",
      "createdAt": "2026-05-03T12:00:00.000Z",
      "updatedAt": "2026-06-06T14:00:00.000Z"
    },
    "cities": [],
    "spots": [],
    "checkIns": [],
    "photos": [],
    "aiMemory": null
  },
  "meta": {
    "requestId": "req_01",
    "serverTime": "2026-06-06T14:00:00.000Z"
  }
}
```

Error codes:

- `AUTH_REQUIRED`
- `FORBIDDEN`
- `TRIP_NOT_FOUND`

Pagination:

Not needed for MVP. If a trip has many photos later, add `/trips/{tripId}/photos`.

### 6.14 Generate AI Memory Draft

Generates an editable text-only AI memory draft through the backend AI proxy. The frontend must never call OpenAI or hold an AI API key. MVP returns completed draft content synchronously; production can later return `queued` and poll by a generation job ID.

```http
POST /ai-memories/generate
```

Request:

```json
{
  "tripId": "hangzhou-3-days",
  "style": "自然日记",
  "extraPrompt": "想突出断桥边的风，和朋友散步的轻松感。"
}
```

Backend generation context:

- Load the trip by `tripId`.
- Load related cities, check-ins, spots, mood text, date range, and photo count.
- Build the AI prompt from the backend-owned prompt template.
- Do not perform image understanding in Phase 6.
- Retry transient AI provider failures server-side.
- If content safety blocks the prompt or output, return a safe fallback draft with `safetyFallback: true`.

Response `200`:

```json
{
  "data": {
    "tripId": "hangzhou-3-days",
    "title": "把西湖走成一段回忆",
    "content": "这次杭州旅行一共 3 天，地图上又亮起了西湖、断桥残雪...",
    "summary": "3 天，1 座城市，4 个景点，36 张照片。",
    "shareText": "杭州 3 日游：把西湖、断桥残雪和茶香写成一段慢下来的旅行回忆。",
    "style": "自然日记",
    "photoUrls": ["https://cdn.travelaround.app/images/img_01.jpg"],
    "spotIds": ["west-lake", "broken-bridge"],
    "generatedAt": "2026-06-06T14:00:00.000Z",
    "safetyFallback": false
  },
  "meta": {
    "requestId": "req_01",
    "serverTime": "2026-06-06T14:00:00.000Z"
  }
}
```

Error codes:

- `AUTH_REQUIRED`
- `TRIP_NOT_FOUND`
- `FORBIDDEN`
- `AI_MEMORY_NOT_READY`
- `VALIDATION_ERROR`
- `RATE_LIMITED`

Pagination:

Not needed.

### 6.15 Save AI Memory

Saves the edited draft as an AI Memory. The frontend can regenerate multiple drafts before calling this endpoint.

```http
POST /ai-memories
```

Request:

```json
{
  "tripId": "hangzhou-3-days",
  "title": "把西湖走成一段回忆",
  "content": "这次杭州旅行一共 3 天，地图上又亮起了西湖、断桥残雪...",
  "summary": "3 天，1 座城市，4 个景点，36 张照片。",
  "shareText": "杭州 3 日游：把西湖、断桥残雪和茶香写成一段慢下来的旅行回忆。",
  "style": "自然日记"
}
```

Response `201`:

```json
{
  "data": {
    "id": "memory-trip_01JZ8F3M9TVT4",
    "tripId": "hangzhou-3-days",
    "title": "把西湖走成一段回忆",
    "summary": "3 天，1 座城市，4 个景点，36 张照片。",
    "content": "这次杭州旅行一共 3 天，地图上又亮起了西湖、断桥残雪...",
    "shareText": "杭州 3 日游：把西湖、断桥残雪和茶香写成一段慢下来的旅行回忆。",
    "style": "自然日记",
    "photoUrls": ["https://cdn.travelaround.app/images/img_01.jpg"],
    "spotIds": ["west-lake", "broken-bridge"],
    "status": "completed",
    "generatedAt": "2026-06-06T14:00:00.000Z"
  },
  "meta": {
    "requestId": "req_01",
    "serverTime": "2026-06-06T14:00:00.000Z"
  }
}
```

Error codes:

- `AUTH_REQUIRED`
- `TRIP_NOT_FOUND`
- `FORBIDDEN`
- `VALIDATION_ERROR`
- `AI_MEMORY_NOT_READY`

### 6.16 Get AI Memory

```http
GET /ai-memories/{memoryId}
```

Response `200`:

```json
{
  "data": {
    "id": "memory-hangzhou",
    "tripId": "hangzhou-3-days",
    "title": "在杭州，把时间走慢",
    "summary": "3 天，1 座城市，7 个景点，36 张照片。",
    "content": "清晨的西湖像一张安静的地图...",
    "shareText": "杭州 3 日游：把西湖、断桥和茶香写进一段慢下来的旅行回忆。",
    "style": "自然日记",
    "photoUrls": ["https://cdn.travelaround.app/images/img_01.jpg"],
    "spotIds": ["west-lake", "broken-bridge"],
    "status": "completed",
    "generatedAt": "2026-06-06T14:00:00.000Z"
  },
  "meta": {
    "requestId": "req_01",
    "serverTime": "2026-06-06T14:00:00.000Z"
  }
}
```

Error codes:

- `AUTH_REQUIRED`
- `FORBIDDEN`
- `AI_MEMORY_NOT_FOUND`

Pagination:

Not needed.

### 6.17 Manual Light And Wishlist

Manual light and wishlist state is per user. Mutating one user must not update global city/spot seed data or another user's state.

```http
POST /cities/{cityId}/manual-light
DELETE /cities/{cityId}/manual-light
POST /wishlist/cities/{cityId}
DELETE /wishlist/cities/{cityId}
POST /wishlist/spots/{spotId}
DELETE /wishlist/spots/{spotId}
```

Response `200` for city mutation:

```json
{
  "data": {
    "city": {
      "id": "suzhou",
      "name": "苏州",
      "lit": true,
      "manuallyLit": true,
      "wished": false,
      "visitedAt": "2026-06-11"
    }
  },
  "meta": {
    "requestId": "req_01",
    "serverTime": "2026-06-11T06:00:00.000Z"
  }
}
```

Response `200` for spot wishlist mutation:

```json
{
  "data": {
    "spot": {
      "id": "lingyin-temple",
      "cityId": "hangzhou",
      "status": "wishlist",
      "canCheckIn": true
    }
  },
  "meta": {
    "requestId": "req_01",
    "serverTime": "2026-06-11T06:00:00.000Z"
  }
}
```

Behavior:

- `DELETE /cities/{cityId}/manual-light` clears only the manual flag. If the user has lit spots in that city, `lit` remains `true`.
- Spot wishlist changes do not downgrade a lit spot.
- `GET /cities?status=wishlist` and `GET /spots?status=wishlist` return the current user's wishlist state.

Error codes:

- `AUTH_REQUIRED`
- `CITY_NOT_FOUND`
- `SPOT_NOT_FOUND`

### 6.18 Plans

Travel plans are per user. MVP supports listing, detail, weekend template creation, and deletion.

```http
GET /plans
GET /plans/{planId}
POST /plans/weekend-template
DELETE /plans/{planId}
```

Response `200` for `GET /plans`:

```json
{
  "data": [
    {
      "id": "hangzhou-weekend",
      "userId": "u-nicola",
      "title": "杭州周末探索",
      "cityIds": ["hangzhou"],
      "days": 3,
      "progress": 2,
      "total": 8,
      "coverUrl": "https://cdn.travelaround.app/plans/hangzhou.jpg",
      "startHint": "下次出发 · Next Mission",
      "spotIds": ["broken-bridge", "sudi"],
      "wishlistCityIds": ["chengdu", "beijing", "nanjing"]
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 1,
    "total": 1,
    "hasMore": false
  },
  "meta": {
    "requestId": "req_01",
    "serverTime": "2026-06-11T06:00:00.000Z"
  }
}
```

Response `200` for `POST /plans/weekend-template` and `GET /plans/{planId}`:

```json
{
  "data": {
    "plan": {
      "id": "weekend-1781160000000",
      "userId": "u-nicola",
      "title": "杭州周末探索",
      "cityIds": ["hangzhou"],
      "days": 3,
      "progress": 0,
      "total": 4,
      "coverUrl": "https://cdn.travelaround.app/plans/hangzhou.jpg",
      "startHint": "下次出发 · Next Mission",
      "spotIds": ["broken-bridge", "sudi", "lingyin-temple", "leifeng-pagoda"],
      "wishlistCityIds": ["chengdu", "beijing", "nanjing"]
    }
  },
  "meta": {
    "requestId": "req_01",
    "serverTime": "2026-06-11T06:00:00.000Z"
  }
}
```

Response `200` for `DELETE /plans/{planId}`:

```json
{
  "data": {
    "deleted": true,
    "planId": "weekend-1781160000000"
  },
  "meta": {
    "requestId": "req_01",
    "serverTime": "2026-06-11T06:00:00.000Z"
  }
}
```

Error codes:

- `AUTH_REQUIRED`
- `PLAN_NOT_FOUND`

### 6.19 Get Achievements And Quest Progress

Returns the data currently used by the Achievements page: badges plus theme quest progress.

```http
GET /achievements
```

Query parameters:

| Name            | Type    | Required | Description                                   |
| --------------- | ------- | -------- | --------------------------------------------- |
| `status`        | string  | No       | `all`, `unlocked`, `locked`. Default `all`.   |
| `includeQuests` | boolean | No       | Include theme quest progress. Default `true`. |

Response `200`:

```json
{
  "data": {
    "summary": {
      "level": "Lv.12",
      "title": "城市漫游者",
      "unlockedCount": 14,
      "nextAchievementId": "west-lake-collector"
    },
    "achievements": [
      {
        "id": "west-lake-first",
        "title": "西湖初印象",
        "description": "打卡任意 1 个西湖十景",
        "unlocked": true,
        "unlockedAt": "2026-05-01",
        "tone": "gold"
      }
    ],
    "quests": [
      {
        "id": "west-lake-ten",
        "title": "西湖十景",
        "subtitle": "4 / 10 已点亮",
        "description": "沿着湖岸和山影收集杭州最经典的十个景致。",
        "progress": 4,
        "total": 10,
        "coverUrl": "https://cdn.travelaround.app/quests/west-lake-ten.jpg",
        "rewardAchievementId": "west-lake-collector",
        "spotIds": ["west-lake", "broken-bridge"],
        "cityIds": ["hangzhou"]
      }
    ]
  },
  "meta": {
    "requestId": "req_01",
    "serverTime": "2026-06-06T14:00:00.000Z"
  }
}
```

Error codes:

- `AUTH_REQUIRED`
- `VALIDATION_ERROR`

Pagination:

Not required for MVP. Add page-based pagination if badge catalog grows.

### 6.20 Community Feed And Interactions

Community Feed is authenticated. Feed rows include per-user `liked` and `saved` flags plus aggregate counts.

```http
GET /community/posts
POST /community/posts/{postId}/like
DELETE /community/posts/{postId}/like
POST /community/posts/{postId}/save
DELETE /community/posts/{postId}/save
GET /community/posts/{postId}/comments
POST /community/posts/{postId}/comments
```

Response `200` for `GET /community/posts`:

```json
{
  "data": [
    {
      "id": "route-hangzhou",
      "type": "route",
      "title": "杭州 3 日探索路线",
      "subtitle": "7 个打卡点 · 3 天 · 2.1k 收藏",
      "author": "Nicola",
      "linkedId": "hangzhou-3-days",
      "actionLabel": "加入我的计划",
      "progress": 86,
      "liked": false,
      "saved": true,
      "likeCount": 12,
      "saveCount": 42,
      "commentCount": 3
    }
  ]
}
```

Request body for `POST /community/posts/{postId}/comments`:

```json
{
  "body": "这条路线我也想试试"
}
```

Response `200` for like, save, and comment mutations returns the updated post envelope:

```json
{
  "data": {
    "post": {
      "id": "route-hangzhou",
      "liked": true,
      "saved": false,
      "likeCount": 13,
      "saveCount": 42,
      "commentCount": 3
    }
  }
}
```

Error codes:

- `AUTH_REQUIRED`
- `COMMUNITY_POST_NOT_FOUND`
- `VALIDATION_ERROR`

## 7. Backend MVP Data Tables

This is not implementation, but these table names map cleanly to a later Spring Boot service:

- `users`
- `cities`
- `spots`
- `user_city_states`
- `user_spot_states`
- `check_ins`
- `trips`
- `trip_cities`
- `trip_spots`
- `trip_check_ins`
- `images`
- `ai_memories`
- `achievements`
- `user_achievements`
- `theme_quests`
- `theme_quest_spots`
- `theme_quest_cities`
- `plans`
- `plan_cities`
- `plan_spots`
- `community_posts`
- `community_post_likes`
- `community_post_saves`
- `community_comments`

## 8. Service Boundaries

Suggested Spring Boot package/module boundaries:

- User service: `/users/me`, user stats.
- Place service: `/cities`, `/spots`, `/spots/nearby`.
- Check-in service: `/check-ins`, check-in validation, derived lit state.
- Trip service: `/trips`.
- Image service: `/images/upload-url`, `/images/{imageId}/confirm`.
- AI memory service: `/ai-memories/generate`, `/ai-memories`, `/ai-memories/{memoryId}`.
- Wishlist service: `/cities/{cityId}/manual-light`, `/wishlist/cities/{cityId}`, `/wishlist/spots/{spotId}`.
- Plan service: `/plans`, `/plans/{planId}`, `/plans/weekend-template`.
- Achievement service: `/achievements`, quest progress recalculation.
- Community service: `/community/posts`, likes, saves, comments.

For Phase 5 implementation, start with user, place, check-in, and trip persistence before adding real image storage or a real AI provider.
