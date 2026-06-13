# TravelAround 当前功能评估报告

日期：2026-06-13
分支：`codex/fix-review-acceptance-items`
开发基线：`ca7c9d6 Implement phase 5 wishlist and plans`
评估范围：前端 Expo App、API 模式、Spring Boot 后端阶段 1-5、真机验收风险。

> 2026-06-13 追加：持久化第一切片已实现，当前采用 `travel_store_snapshots` 数据库快照保存/恢复运行态，并同步投影写入 V2 业务表；完整 MyBatis-Plus 分域读写仍是后续任务。

## 1. 结论

当前项目已经具备一套可演示、可真机验收的 MVP 闭环：

- 前端页面、导航、地图、城市/景点/行程/计划/AI 回忆等主流程基本完整。
- API 模式已经能连接本地 Spring Boot 后端。
- 后端已实现阶段 1-5：鉴权、读链路、打卡写链路、图片上传、AI 回忆、心愿单、手动点亮、计划。
- 但后端请求处理仍由 `TravelStore` 承担；当前已新增数据库快照持久化和 V2 业务表关系投影，MyBatis-Plus mapper/service 分域迁移还没有完成。

因此当前适合做“产品体验验收”“接口闭环验收”和“重启后运行态恢复验收”，但还不适合宣称“生产级分域持久化完成”。

## 2. 已经可验收的功能

### 2.1 前端产品体验

| 功能           | 状态       | 验收说明                                                        |
| -------------- | ---------- | --------------------------------------------------------------- |
| App 启动与路由 | 可验收     | Expo Router 主流程完整，底部 Tab、详情页、返回链路基本可走通。  |
| 首页           | 可验收     | 能展示用户摘要、地图预览、最近行程、任务入口。                  |
| 地图页         | 可验收     | 当前是 WebView/自定义地图能力，可查看城市点、景点点、状态图层。 |
| 城市详情       | 可验收     | 可查看城市、景点列表、点亮状态、心愿状态。                      |
| 景点详情       | 可验收     | 可查看景点信息、加入/移出心愿、进入打卡。                       |
| 打卡页         | 可验收     | 支持 GPS/手动打卡、权限失败兜底、照片选择入口。                 |
| 行程详情       | 可验收     | 能查看行程、打卡、AI 回忆关联信息。                             |
| 计划页         | 可验收     | 能展示计划、创建周末计划、展示心愿城市。                        |
| AI 回忆页      | 可验收     | 能生成草稿、编辑、保存。                                        |
| 成就/任务页    | 可验收     | 能展示成就和主题任务进度。                                      |
| 社区页         | 可验收展示 | 当前可展示 Feed，但还不是完整真实社交模块。                     |

### 2.2 API 模式闭环

| 功能                | 状态       | 后端端点                                                                                                  |
| ------------------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| 游客登录            | 可验收     | `POST /v1/auth/guest`                                                                                     |
| 模拟手机号登录      | 可验收     | `POST /v1/auth/sms/code`、`POST /v1/auth/login`                                                           |
| 当前用户            | 可验收     | `GET /v1/users/me`                                                                                        |
| 城市/景点列表与详情 | 可验收     | `GET /v1/cities`、`GET /v1/spots`                                                                         |
| 附近景点            | 可验收     | `GET /v1/spots/nearby`                                                                                    |
| 创建行程            | 可验收     | `POST /v1/trips`                                                                                          |
| 行程列表/详情       | 可验收     | `GET /v1/trips`、`GET /v1/trips/{tripId}`                                                                 |
| 打卡                | 可验收     | `POST /v1/check-ins`                                                                                      |
| GPS 半径校验        | 可验收     | 后端返回 `LOCATION_REQUIRED` / `CHECK_IN_OUT_OF_RANGE`                                                    |
| 打卡幂等            | 可验收     | 通过 `clientRequestId` 防重复写入                                                                         |
| 图片上传本地兜底    | 可验收     | `POST /v1/images/upload-url`、`PUT /v1/uploads/{imageId}`、`POST /v1/images/{imageId}/confirm`            |
| MinIO 预签名上传    | 可验收配置 | Docker/MinIO 模式可返回 S3-compatible presigned PUT URL。                                                 |
| AI 回忆生成         | 可验收     | `POST /v1/ai-memories/generate`，默认 mock provider。                                                     |
| AI 回忆保存         | 可验收     | `POST /v1/ai-memories`                                                                                    |
| 心愿单/手动点亮     | 可验收     | `/v1/wishlist/*`、`/v1/cities/{cityId}/manual-light`                                                      |
| 计划                | 可验收     | `GET /v1/plans`、`GET /v1/plans/{planId}`、`POST /v1/plans/weekend-template`、`DELETE /v1/plans/{planId}` |
| 成就/任务           | 可验收     | `GET /v1/achievements`                                                                                    |
| 社区 Feed           | 可验收展示 | `GET /v1/community/posts`                                                                                 |

## 3. 只是 mock / 内存态的功能

### 3.1 后端运行时仍以 TravelStore 为主

当前后端虽然有 Flyway schema，但业务请求处理仍然走 `TravelStore`：

- 用户、城市、景点、行程、打卡、AI 回忆、计划、社区数据仍先进入内存 Map/List。
- 已新增 `travel_store_snapshots`，写操作会保存完整运行态快照，服务启动时可从数据库恢复。
- 每次快照保存会同步改写 V2 规范业务表，便于检查 users/cities/spots/user states/trips/check-ins/images/AI memories/plans 等关系数据。
- 主链路运行时读写仍未迁入 MyBatis-Plus 分域 mapper/service。
- MyBatis-Plus 已作为技术方向引入，但 mapper/service 尚未接入主链路。

### 3.2 登录仍是模拟链路

- 游客登录可用。
- 手机号登录是 mock 验证码，固定/响应内返回验证码。
- 没有真实短信网关。
- 没有 token refresh。
- 没有 guest 到正式账号的数据合并。

### 3.3 AI 真实模型接入仍需配置与验收

- AI provider 抽象已经完成。
- 默认 provider 是 `mock`，适合本地验收。
- Anthropic / DeepSeek provider 代码已预留，但需要真实 API key、模型配置、网络验收。
- 没有做生产级内容安全、审计、频控、成本控制。

### 3.4 社区还是展示型 MVP

- 当前只有社区 Feed 展示。
- 尚未实现真实发帖、图文发布、点赞、收藏、评论、关注、用户主页。
- 社区内容仍来自内存 seed。

### 3.5 地图还不是生产地图 SDK

- 当前地图能力可用于 MVP 验收。
- 尚未接入高德/腾讯/Mapbox 等生产地图 SDK。
- 坐标体系、国内地图合规、Key 管理、隐私弹窗仍未完成。

## 4. 接口已通但未逐表持久化的范围

这些接口已经能被前端 API 模式调用，也能完成业务行为；当前会写入数据库快照，并同步投影到规范业务表，但运行时主链路还没有迁移为逐表 mapper 读写：

| 模块                  | 接口状态 | 当前持久化状态 | 仍待完成                                                      |
| --------------------- | -------- | -------------- | ------------------------------------------------------------- |
| Auth/User             | 已通     | 快照 + V2 表投影 | 迁移运行时读写到 `users` mapper，补 token refresh、guest 合并。               |
| Cities/Spots          | 已通     | 快照 + V2 表投影 | 迁移运行时读写到 `cities`、`spots` mapper 和 seed。                          |
| User city/spot states | 已通     | 快照 + V2 表投影 | 迁移运行时读写到 `user_city_states`、`user_spot_states`。                    |
| Trips                 | 已通     | 快照 + V2 表投影 | 迁移运行时读写到 `trips`、`trip_cities`、`trip_spots`、`trip_check_ins`。    |
| Check-ins             | 已通     | 快照 + V2 表投影 | 迁移运行时读写到 `check_ins`，补幂等唯一约束。                               |
| Images                | 已通     | 快照 + V2 表投影 | 迁移运行时读写到 `images` metadata；MinIO 继续只负责对象文件。               |
| AI Memories           | 已通     | 快照 + V2 表投影 | 迁移运行时读写到 `ai_memories`，补真实 provider 生产配置验收。               |
| Achievements/Quests   | 已通     | 快照 + V2 表投影 | 迁移运行时读写到成就/任务表，进度按用户维度计算。                            |
| Plans                 | 已通     | 快照 + V2 表投影 | 迁移运行时读写到 `plans`、`plan_cities`、`plan_spots`，补心愿城市关联表。    |
| Community             | 只读已通 | 快照 + V2 表投影 | 迁移运行时读写到社区表，并实现发帖、点赞、收藏、评论、关注等真实写链路。     |

## 5. 真机体验风险

### 5.1 Expo Go 连接风险

已遇到过一次真机启动失败：

- 表现：Expo Go 提示 `Could not connect to the server`。
- 原因：二维码指向的 Metro 服务已停止，旧地址为 `exp://192.168.3.23:8082`。
- 修复方式：用 `screen` 后台保持后端和 Expo 服务，重新生成 `exp://192.168.3.23:8083` 二维码。

后续真机验收前应确认：

- iPhone 和电脑在同一 Wi-Fi。
- Expo Go 已允许“本地网络”权限。
- 本机 `192.168.3.23:8083` Metro 可访问。
- 本机 `192.168.3.23:8080` 后端可访问。
- 二维码和当前 Expo 端口一致。

### 5.2 API 模式风险

- 真机不能使用 `localhost`，必须用电脑局域网 IP。
- 当前建议环境变量：

```bash
EXPO_PUBLIC_TRAVEL_DATA_SOURCE=api
EXPO_PUBLIC_API_BASE_URL=http://192.168.3.23:8080/v1
EXPO_PUBLIC_API_AUTH_MODE=guest
```

- 如果电脑 IP 变化，二维码和 API Base URL 都要重新生成。
- 后端如果用 H2 默认内存库，重启进程后数据库会清空并回到 seed；要验收跨进程持久化应使用 MySQL/Docker 数据源。
- 如果用 Docker/MinIO 模式，`TRAVELAROUND_STORAGE_PUBLIC_ENDPOINT` 必须配置成手机可访问地址。

### 5.3 权限和原生能力风险

- Expo Go 能验证大部分 JS 流程，但不能代表最终 EAS build 表现。
- 相册、定位权限需要在真机上确认文案和拒绝后的兜底。
- iOS 后台定位、生产地图 SDK、真实上传能力需要 development build / TestFlight 再验。

## 6. 建议验收清单

### 6.1 API 模式冒烟

- [ ] 扫 Expo Go 二维码能启动 App。
- [ ] 首页能加载用户、城市、行程、计划、社区、成就。
- [ ] 地图页能显示城市/景点点位。
- [ ] 城市详情能进入，状态展示正确。
- [ ] 景点详情能进入，心愿按钮可切换。
- [ ] 手动点亮城市后，城市状态更新。
- [ ] 取消手动点亮后，如无已点亮景点，城市回到未点亮。
- [ ] 打卡一个景点后，景点变为 lit，城市变为 lit。
- [ ] 重复打卡同一个 clientRequestId 不重复新增。
- [ ] 创建周末计划后，计划列表刷新。
- [ ] AI 回忆可生成、编辑、保存。
- [ ] 社区 Feed 可加载。

### 6.2 风险专项

- [ ] 关闭并重启后端，确认新增内存数据会丢失，并记录这是预期风险。
- [ ] 更换 Wi-Fi / IP 后，确认二维码和 API Base URL 需要重建。
- [ ] 拒绝定位权限，确认手动打卡兜底可用。
- [ ] 拒绝相册权限，确认不会卡死。
- [ ] 后端关闭时，前端能给出可理解错误或重试入口。

## 7. 下一步开发建议

考虑当前额度和功能风险，建议下一阶段不要直接做社区大模块，而是优先做持久化落库。

推荐拆分顺序：

1. `users`、guest/auth、手机号 mock 登录落库。
2. `cities`、`spots` 基础数据读取落库。
3. `user_city_states`、`user_spot_states` 落库，保持 per-user 状态。
4. `trips`、`trip_cities`、`trip_spots`、`check_ins`、`trip_check_ins` 落库。
5. `images` metadata 落库，MinIO 只负责对象文件。
6. `plans`、`plan_cities`、`plan_spots` 落库。
7. `ai_memories` 落库。
8. 再启动社区写链路：发帖、点赞、收藏、评论、关注。

每完成一个切片都应：

- 补对应集成测试。
- 保持 API response envelope 不变。
- 跑 `cd backend && ./mvnw test`。
- 跑 `npm run check`，确认前端 API 模式类型和测试不回退。
- 单独 commit + push，避免大改中断后难恢复。

## 8. 当前可接受的验收结论

当前可以接受为：

> TravelAround 已完成前端 MVP 与后端阶段 1-5 的 API 闭环，支持真机 API 模式体验验收；后端已完成持久化第一切片（快照恢复 + V2 业务表投影），但尚未完成生产意义上的 MyBatis-Plus 分域读写、真实短信、真实 AI key 配置验收、完整社区社交和生产地图 SDK。

不建议当前接受为：

> 真实后端已完成。

更准确的状态是：

> 真实后端骨架与 API 行为已完成，持久化第一切片已落地，下一阶段关键任务是把运行时主链路迁移到分域 mapper/service。
