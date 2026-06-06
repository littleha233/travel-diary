# TravelAround v0.1 Frontend Prototype Implementation Plan

## 1. 本轮输入材料阅读结论

已阅读并对齐以下 3 份材料：

1. `TravelAround-Mist-Purple-Mint-V4-Prototype.html`
   - 作为最高优先级视觉参考。
   - 关键视觉方向：Mist Purple + Mint Green、深蓝紫夜色地图、薄荷绿发光点、雾紫/云雾蓝光轨、奶白玻璃卡片、中间突出的点亮按钮。
   - 原型包含 7 个主要视觉屏：首页旅行地图、旅行计划、快速打卡、点亮成功、社区首页、我的主页、AI 回忆生成。

2. `TravelAround-Codex-Handoff.md`
   - 作为最高优先级产品与开发交接参考。
   - 明确第一阶段不接真实后端、不接真实地图 SDK、不接真实定位，用 View / SVG / 绝对定位模拟旅行地图。
   - 首页硬性要求：只突出旅行地图，不加入 Dashboard、最近旅行、任务推荐、社区内容、图片墙。

3. `TravelAround 产品需求文档 PRD v1.0.docx`
   - 作为完整业务范围、数据对象、核心流程、异常状态和后续能力参考。
   - PRD 中部分早期信息架构为 4 Tab 或更偏 MVP 后端闭环，本阶段以用户本次任务和 V4/Handoff 的 5 Tab 原型为准。

## 2. 当前仓库状态

当前仓库是一个新的前端工程准备目录，尚未初始化 Expo / React Native 项目。

现有文件：

```text
TravelAround 产品需求文档 PRD v1.0.docx
TravelAround-Mist-Purple-Mint-V4-Prototype.html
TravelAround-Codex-Handoff.md
IMPLEMENTATION_PLAN.md
```

## 3. 本阶段目标

实现 `TravelAround v0.1` 移动端前端静态原型工程。

本阶段重点：

1. 初始化可运行的 Expo React Native 工程。
2. 还原 V4 原型的整体视觉语言。
3. 建立统一设计系统。
4. 用 mock 数据实现主页面和关键二级页面。
5. 跑通核心用户路径。
6. 保持代码结构清晰，方便后续接后端、地图 SDK、定位、AI、图片上传。

## 4. 计划采用的技术栈

```text
Expo
React Native
TypeScript
Expo Router
StyleSheet
本地 mock data
```

选择说明：

- 当前仓库没有既有技术栈，因此按推荐栈新建 Expo + React Native + TypeScript 项目。
- 采用 Expo Router，因为用户指定的路由结构天然接近文件路由，后续维护 `/tabs`、`/city/[id]`、`/spot/[id]` 等页面更直观。
- 采用 StyleSheet，避免引入 NativeWind 的额外配置成本；设计 token 通过 `src/theme/theme.ts` 统一管理。
- 地图先使用 React Native View / SVG 风格组件模拟，不接真实地图 SDK。

## 5. 视觉与设计系统方向

视觉优先级：

1. V4 HTML 原型。
2. Codex Handoff。
3. PRD。

核心色彩 token 将以 V4 为准：

```text
mint: #78E6D6
mintLight: #B9FFF7
purple: #B79CFF
blue: #8DBBFF
gold: #FFD66E
background: #F8F7FF
mapDark: #1B1F3A
mapDarkAlt: #252A4A
textPrimary: #2E3350
textMuted: #8E94B8
```

设计系统文件计划：

```text
src/theme/
  theme.ts
```

`theme.ts` 至少包含：

- colors
- spacing
- radius
- typography
- shadow
- zIndex
- component tokens

组件风格原则：

- 首页地图可更未来感，使用深蓝紫背景、网格、光轨、发光点。
- 计划、社区、我的、AI 回忆页更轻、更温暖，避免监控后台感。
- 卡片使用奶白玻璃拟态或浅色柔和卡片。
- 中间点亮按钮使用薄荷绿 + 雾紫渐变和强发光反馈。
- 不做复杂 Dashboard，不用厚重暗色控制台风格承载生活方式内容。

## 6. 计划目录结构

```text
app/
  _layout.tsx
  index.tsx
  onboarding.tsx
  login.tsx
  tabs/
    _layout.tsx
    home.tsx
    plan.tsx
    checkin.tsx
    community.tsx
    profile.tsx
  city/
    [id].tsx
  spot/
    [id].tsx
  plan/
    [id].tsx
  quest/
    [id].tsx
  trip/
    [id].tsx
  ai-memory/
    [id].tsx
  achievements.tsx
  settings.tsx

src/
  components/
    AppButton.tsx
    AppCard.tsx
    AppText.tsx
    BottomTabBar.tsx
    MapPreview.tsx
    GlowPoint.tsx
    CityCard.tsx
    SpotCard.tsx
    PlanCard.tsx
    ThemeQuestCard.tsx
    CommunityCard.tsx
    AchievementBadge.tsx
    PhotoGrid.tsx
    EmptyState.tsx
    LoadingState.tsx
    ErrorState.tsx
  mock/
    user.ts
    cities.ts
    spots.ts
    plans.ts
    quests.ts
    trips.ts
    community.ts
    achievements.ts
    aiMemories.ts
  theme/
    theme.ts
  types/
    user.ts
    city.ts
    spot.ts
    plan.ts
    quest.ts
    trip.ts
    community.ts
    achievement.ts
    aiMemory.ts
  utils/
    travelStats.ts
    routes.ts
```

说明：

- `app/` 放 Expo Router 页面。
- `src/components/` 放可复用 UI 组件。
- `src/mock/` 放本地 mock 数据。
- `src/types/` 放数据类型，后续接 API 时可复用。
- `src/utils/` 放统计、进度、路由辅助等纯函数。

## 7. 页面清单

### 7.1 一级页面 / Tab 页面

1. `Home / Travel Map`
   - 只突出旅行地图。
   - 展示已点亮城市光点。
   - 展示轻量状态胶囊，例如“已点亮 18 座城市 · 7 个省份探索中”。
   - 点击城市光点进入城市详情。
   - 不放最近旅行、任务卡片、社区内容或复杂统计。

2. `Plan / Travel Plan`
   - Next Mission 卡片。
   - Wishlist Map 模块。
   - Theme Quests 模块。
   - 点击计划进入计划详情。
   - 点击主题任务进入主题任务详情。

3. `CheckIn`
   - 展示当前城市杭州。
   - 展示附近可点亮地点。
   - 地点卡片包含名称、距离、状态、点亮按钮。
   - 点击点亮后进入确认/成功流程。
   - 使用 mock 状态模拟成功，不请求真实定位。

4. `Community`
   - 展示路线地图卡、AI 游记卡、主题任务卡、成就分享卡。
   - 路线卡包含“加入我的计划”按钮。
   - 视觉更像旅行生活方式社区，不复制普通内容流。

5. `Profile / Travel Profile`
   - 展示 Nicola 的数字旅行护照。
   - 包含头像、昵称、等级、已点亮城市、已探索景点、AI 回忆数量。
   - 包含徽章墙、我的旅行、我的照片、设置入口。

### 7.2 二级页面 / 占位页面

1. 城市详情页 `/city/[id]`
   - 城市封面、点亮状态、景点列表、任务进度、最近旅行入口。

2. 景点详情页 `/spot/[id]`
   - 景点封面、简介、所属城市、打卡状态、相关主题、打卡入口。

3. 旅行计划详情页 `/plan/[id]`
   - 行程信息、待点亮景点、进度、加入/继续计划操作。

4. 主题任务详情页 `/quest/[id]`
   - 任务说明、地点列表、完成度、奖励徽章。

5. 旅行详情页 `/trip/[id]`
   - 杭州 3 日游、旅行统计、景点、照片墙、AI 回忆入口。

6. AI 回忆生成页 `/ai-memory/[id]`
   - 旅行素材、生成状态、mock AI 文案、保存/分享按钮。

7. AI 回忆详情页 `/ai-memory/[id]`
   - 与生成页共用路由，通过 mock 状态展示已生成内容；后续可拆独立详情。

8. 成就页 `/achievements`
   - 徽章墙、已解锁/未解锁状态、主题任务进度。

9. 设置页 `/settings`
   - 账号、隐私、定位、相册、关于等静态入口。

## 8. 组件清单

本阶段计划实现以下组件：

```text
AppButton
AppCard
AppText
BottomTabBar
MapPreview
GlowPoint
CityCard
SpotCard
PlanCard
ThemeQuestCard
CommunityCard
AchievementBadge
PhotoGrid
EmptyState
LoadingState
ErrorState
```

补充组件视实现需要增加：

```text
Screen
TopBar
StatusChip
ProgressBar
SectionHeader
GlassPanel
```

这些补充组件用于减少页面重复样式，但会保持轻量，不提前抽象过度。

## 9. Mock 数据计划

计划创建：

```text
src/mock/user.ts
src/mock/cities.ts
src/mock/spots.ts
src/mock/plans.ts
src/mock/quests.ts
src/mock/trips.ts
src/mock/community.ts
src/mock/achievements.ts
src/mock/aiMemories.ts
```

mock 覆盖内容：

- 用户：Nicola。
- 已点亮城市：18 个。
- 种子城市：杭州、北京、上海、成都、南京。
- 杭州重点景点：西湖、断桥残雪、苏堤春晓、雷峰塔、灵隐寺等。
- 主题任务：西湖十景、中国五岳、江南六大古镇。
- 旅行计划：杭州周末探索。
- 旅行记录：杭州 3 日游。
- 社区内容：路线地图卡、AI 游记卡、主题任务卡、成就分享卡。
- 成就徽章：初次出发、城市漫游者、西湖初印象、西湖收集家。
- AI 回忆：杭州周末探索 mock 生成内容。

## 10. 核心交互路径

本阶段需要跑通：

1. 首次进入
   - `index` / `login`
   - 进入首页
   - 查看旅行地图

2. 查看城市
   - 首页
   - 点击已点亮城市
   - 城市详情页
   - 景点详情页

3. 创建/查看计划
   - 计划 Tab
   - 查看杭州周末探索
   - 进入计划详情
   - 查看待点亮景点

4. 完成打卡
   - 打卡 Tab
   - 查看附近地点
   - 点击点亮
   - 打卡确认
   - 打卡成功

5. 查看社区内容
   - 社区 Tab
   - 点击路线卡 / AI 游记卡 / 主题任务卡
   - 进入对应详情或占位详情

6. 查看个人档案
   - 我的 Tab
   - 查看旅行档案
   - 进入成就页
   - 进入设置页

## 11. 本阶段使用 mock 的能力

以下能力本阶段全部使用 mock 或静态模拟：

- 用户登录 / 游客进入。
- 用户资料。
- 已点亮城市。
- 已点亮景点。
- 旅行地图。
- 附近可点亮地点。
- 打卡成功状态。
- 旅行计划。
- 心愿单。
- 主题任务。
- 社区内容。
- 旅行记录。
- AI 回忆生成和结果。
- 成就徽章。
- Loading / Empty / Error 状态展示。

## 12. 留到后续阶段的能力

以下能力不在 v0.1 实现：

- 真实后端 API。
- 真实账号登录。
- 真实地图 SDK。
- 真实定位权限和 GPS 判断。
- 真实图片上传。
- 真实相册权限。
- 真实 AI 生成接口。
- 真实社区发布。
- 复杂防作弊。
- 支付、订单、门票、酒店等商业能力。
- 好友、私信、情侣共同地图、亲子模式。
- 完整埋点和数据分析。

## 13. 后续正式编码顺序

确认本计划后，正式开发将按以下顺序进行：

1. 初始化 Expo + TypeScript 项目。
2. 安装并配置 Expo Router。
3. 建立 `src/theme/theme.ts`。
4. 建立 `src/types/` 数据类型。
5. 建立 `src/mock/` mock 数据。
6. 实现基础组件。
7. 实现自定义底部 Tab 和中间点亮按钮。
8. 实现首页旅行地图。
9. 实现计划页。
10. 实现打卡页和打卡成功反馈。
11. 实现社区页。
12. 实现我的页。
13. 实现二级页面。
14. 补齐 Loading / Empty / Error 状态。
15. 编写 README 启动说明。
16. 运行项目，修复 TypeScript 和启动错误。

## 14. 验收方式

开发完成后将验证：

- 项目可以正常启动。
- TypeScript 无明显类型错误。
- 5 个底部 Tab 可切换。
- 中间点亮按钮可进入打卡流程。
- 首页符合 V4 的旅行地图视觉方向。
- 计划页轻盈、温暖，不像监控后台。
- 社区页突出 TravelAround 的路线、AI 回忆、主题任务、成就特色。
- 我的页像数字旅行护照。
- 所有页面由 mock 数据驱动。
- 主要二级页面可返回。
- README 包含启动命令。

