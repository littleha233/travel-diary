# TravelAround · Codex 前端开发交接包

当前视觉方向：TravelAround · Mist Purple Mint V4

原型预览：
https://designergpt.replit.app/pages/3650a2cf8fa7a262885681c454c81371.html

## 1. 产品定位

TravelAround 是一款真实世界旅行探索 APP。用户可以点亮去过的城市和景点，制定旅行计划，到达附近景点后完成点亮/打卡，生成 AI 旅行回忆，并在社区分享可复用路线和旅行成就。

核心表达：像玩开放世界游戏一样，点亮真实世界的旅行地图。

## 2. 技术栈建议

Expo + React Native + React Navigation + Mock Data。

第一阶段不接真实后端，不接真实地图 SDK，不接真实定位。先用 View / SVG / 绝对定位模拟未来旅行地图。

## 3. 视觉方向

Mist Purple + Mint Green / 雾紫薄荷系。

目标气质：轻盈、梦幻、未来感、旅行温度、C 端友好，不像后台管理系统，不像监控大屏。

色板：

- 主色 / 薄荷绿：#78E6D6
- 辅助紫 / 雾紫：#B79CFF
- 辅助蓝 / 云雾蓝：#8DBBFF
- 高亮金：#FFD66E
- 浅背景：#F8F7FF
- 深色地图背景：#1B1F3A
- 弱文字：#8E94B8
- 主文字：#2E3350

## 4. 页面优先级

1. 首页旅行地图 HomeMapScreen
2. 底部 Tab 和中间“点亮”按钮
3. 快速点亮/打卡页 CheckInScreen
4. 点亮成功页 CheckInSuccessScreen
5. 旅行计划页 PlanScreen
6. 社区首页 CommunityScreen
7. 我的主页 ProfileScreen
8. AI 回忆生成页 AIMemoryScreen

## 5. 首页硬性要求

首页只突出一张旅行地图。

只保留：标题、副标题、深蓝紫夜色地图、薄荷绿发光点、浅紫/云雾蓝网格与光轨、右侧轻量控件、左下角状态胶囊、底部 Tab、中间点亮按钮。

不要加入：Dashboard、统计大卡片、最近旅行、任务推荐、社区内容、图片墙。

## 6. 组件拆分

FutureMap, MapPin, GlassCard, BottomTabBar, ActivateButton, MissionCard, RadarCard, QuestCard, PlaceCard, RouteMapCard, TravelProfileCard, AIMemoryCard

## 7. Mock Data 建议

城市数据、景点数据、用户旅行档案、任务数据、社区路线数据、AI 回忆数据。

## 8. 给 Codex 的指令

请基于以上规范，先实现 Expo React Native 版的移动端前端 Demo。不要接真实后端、不要接真实地图、不要接真实定位。先把首页地图、底部 Tab、点亮流程、计划页、社区页、我的页和 AI 回忆页做到可运行。
