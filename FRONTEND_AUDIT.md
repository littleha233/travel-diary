# TravelAround Frontend Audit

## 1. 当前技术栈判断

结论：当前工程是 Expo React Native APP，不是普通 Web 项目。

判断依据：

- `package.json` 的入口是 `expo-router/entry`。
- `app.json` 存在 Expo 配置，项目名为 `TravelAround`，slug 为 `travelaround`。
- `app.json` 启用了 `expo-router` plugin。
- 路由采用 Expo Router 的 `app/` 文件路由结构。
- 页面和组件主体使用 `react-native` 的 `View`、`Text`、`Pressable`、`ScrollView`、`Image`、`ImageBackground`、`Modal`、`StyleSheet` 等组件。
- 没有 `vite.config.*`、`next.config.*`、`index.html`、`pages/`、`public/` 等普通 Web 项目结构。
- 没有 ReactDOM 渲染入口、`createRoot`、`div`、`button`、Next.js 或 Vite 代码痕迹。

当前依赖中存在 `react-dom` 和 `react-native-web`，但它们是 Expo Web 预览所需依赖，不代表项目是普通 Web 工程。

## 2. 配置检查

### package.json

当前关键信息：

```json
{
  "name": "travelaround",
  "main": "expo-router/entry",
  "dependencies": {
    "expo": "~56.0.9",
    "expo-router": "~56.2.9",
    "react": "19.2.3",
    "react-native": "0.85.3"
  }
}
```

脚本：

```text
npm run start   -> expo start
npm run ios     -> expo start --ios
npm run android -> expo start --android
npm run web     -> expo start --web
npm run typecheck -> tsc --noEmit
```

### app.json

当前是标准 Expo 配置：

- `name`: `TravelAround`
- `slug`: `travelaround`
- `orientation`: `portrait`
- `scheme`: `travelaround`
- `plugins`: `["expo-router"]`
- `platforms`: Expo config 输出包含 `ios`、`android`、`web`

当前没有 `app.config.ts`，这不是问题；当前阶段静态配置用 `app.json` 足够。

## 3. 路由结构检查

当前路由结构符合 Expo Router：

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
  city/[id].tsx
  spot/[id].tsx
  plan/[id].tsx
  quest/[id].tsx
  trip/[id].tsx
  ai-memory/[id].tsx
  achievements.tsx
  settings.tsx
```

路由判断：

- 一级 5 Tab 已实现。
- 中间点亮 Tab 使用自定义 `BottomTabBar`。
- 动态详情页已使用 `[id].tsx`。
- `index.tsx` 当前重定向到 `/login`。

## 4. 已完成页面

已实现主页面：

- 登录 / 游客入口：`app/login.tsx`
- Onboarding：`app/onboarding.tsx`
- 首页旅行地图：`app/tabs/home.tsx`
- 计划页：`app/tabs/plan.tsx`
- 打卡页：`app/tabs/checkin.tsx`
- 社区页：`app/tabs/community.tsx`
- 我的页：`app/tabs/profile.tsx`

已实现二级页面：

- 城市详情：`app/city/[id].tsx`
- 景点详情：`app/spot/[id].tsx`
- 旅行计划详情：`app/plan/[id].tsx`
- 主题任务详情：`app/quest/[id].tsx`
- 旅行详情：`app/trip/[id].tsx`
- AI 回忆生成/详情：`app/ai-memory/[id].tsx`
- 成就页：`app/achievements.tsx`
- 设置页：`app/settings.tsx`

已实现基础组件：

- `AppButton`
- `AppCard`
- `AppText`
- `BottomTabBar`
- `MapPreview`
- `GlowPoint`
- `CityCard`
- `SpotCard`
- `PlanCard`
- `ThemeQuestCard`
- `CommunityCard`
- `AchievementBadge`
- `PhotoGrid`
- `EmptyState`
- `LoadingState`
- `ErrorState`
- 以及 `Screen`、`SectionHeader`、`StatusChip`、`ProgressBar`、`DetailHeader`

## 5. 未完成页面 / 简化实现

以下内容当前是简化或合并实现：

- AI 回忆生成页和 AI 回忆详情页目前共用 `/ai-memory/[id]`，没有拆成独立生成流程和独立详情页。
- 打卡成功页目前是 `CheckIn` 页面内的 `Modal`，不是独立路由页面。
- 创建旅行记录页未实现。本次计划侧重点是查看已有 mock 计划和旅行详情。
- 登录页是游客模式静态入口，不含手机号、验证码、协议勾选等真实登录结构。
- Loading / Empty / Error 组件已实现，但并没有在所有页面都完整接入真实状态分支。
- 设置页是静态 mock 入口，没有真实权限读取或账号设置逻辑。

## 6. React Native 用法检查

页面和组件使用了 React Native 组件：

- `View`
- `Text`
- `Pressable`
- `ScrollView`
- `Image`
- `ImageBackground`
- `Modal`
- `ActivityIndicator`
- `StyleSheet`
- `SafeAreaView`

未发现以下普通 Web 项目痕迹：

- `ReactDOM`
- `createRoot`
- JSX 中的 `<div>`
- JSX 中的 `<button>`
- `vite`
- `next`
- `next.config.*`
- `vite.config.*`
- `index.html`

注意：

- `react-dom` 和 `react-native-web` 存在于依赖中，仅用于 Expo Web 预览。
- `app/settings.tsx` 中从 `lucide-react-native` 引入了名为 `Image` 的图标组件；这不是 DOM Image，但命名容易与 React Native `Image` 混淆，建议后续改名为 `ImageIcon`。

## 7. 脚本运行检查

已实际运行：

```bash
npm run typecheck
```

结果：通过。

已实际运行：

```bash
npm run start -- --port 8090
```

结果：成功启动 Expo / Metro，输出 Expo Go QR、Metro 地址和 Web 地址。

已实际运行：

```bash
npm run web -- --port 8091
```

结果：成功启动并完成 Web bundle。

Web 运行日志中出现：

- React Native Web 警告：`"shadow*" style props are deprecated. Use "boxShadow".`
- 浏览器钱包扩展错误：`Error checking default wallet status...`

判断：

- `shadow*` 是样式兼容性警告，不阻断运行。
- 钱包扩展错误来自浏览器扩展，不是 TravelAround 应用代码。

已检查命令解析：

```bash
npm run ios -- --help
npm run android -- --help
```

结果：均正确解析为 Expo start 命令。

说明：

- `npm run ios` 实际打开 iOS Simulator 需要本机安装并配置 Xcode / Simulator。
- `npm run android` 实际打开 Android 设备需要本机连接 Android 真机或启动 Android Emulator。
- 本次审计没有强行打开模拟器或设备。

已运行生产 Web 导出：

```bash
npx expo export --platform web --output-dir dist-test
```

结果：通过，Web bundle 成功生成。

## 8. 当前页面与 V4 原型的还原度

整体判断：中等偏高，还原了 V4 的主要方向，但仍属于第一版静态工程原型。

已较好还原：

- Mist Purple + Mint Green 主色系统。
- 深蓝紫夜色地图。
- 薄荷绿发光城市点。
- 中间突出的点亮按钮。
- 首页只突出 Travel Map，没有做成数据 Dashboard。
- 计划页包含 Next Mission、Wishlist Map、Theme Quests。
- 打卡页包含附近探索扫描、当前城市、可点亮地点、点亮成功反馈。
- 社区页包含路线地图卡、AI 游记卡、主题任务卡、成就分享卡。
- 我的页整体接近数字旅行护照 / Travel Profile。

主要视觉偏差：

- 原型中的地图网格、光轨扫描、发光动画在 React Native 中做了静态近似，还没有完整动态效果。
- V4 原型的玻璃拟态、阴影、模糊层级在原生端还原有限，当前主要用半透明背景、边框和阴影模拟。
- 首页地图中的中国轮廓是简化 SVG 形状，不是真实地图轮廓。
- 社区页和计划页的布局密度、卡片质感比 V4 原型更简化。
- AI 回忆页的“生成中扫描线 / 玻璃纸张”只做了结构和氛围，没有完整动效。
- 当前图片使用远程 Unsplash URL，离线或网络不佳时会影响视觉验收。

## 9. 代码结构问题

当前结构整体清晰，符合 `IMPLEMENTATION_PLAN.md`。

发现的问题和风险：

1. `src/mock/spots.ts` 较长，后续可按城市拆分或增加 mock index 聚合规则。
2. 页面中还有一些重复的 layout 样式，例如 `top`、`list`、`row`、`stats`，后续可抽成更稳定的页面布局组件。
3. `ai-memory/[id].tsx` 同时承担生成页和详情页，后续业务接入时建议拆分。
4. `CheckIn` 成功反馈在 Modal 内，若后续要与 PRD/Handoff 的成功页一致，建议增加独立成功路由。
5. `react-native-web` 下有 shadow deprecation warning，建议为 Web 预览补充 `boxShadow` 或减少 web shadow 警告。
6. 当前状态组件存在，但页面状态分支还不完整，后续接后端前需要统一 loading / empty / error 策略。
7. 当前大量使用远程图片 URL，不适合作为稳定验收资产，后续可引入本地 mock 图片或生成固定资产。

## 10. 下一步修复建议

建议优先级：

1. 保持当前 Expo React Native 架构，不要转成普通 Web 项目。
2. 拆分 `AI 回忆生成页` 和 `AI 回忆详情页`。
3. 将 `打卡成功` 从 Modal 升级为独立页面或明确保留 Modal 作为 v0.1 交互。
4. 将远程图片替换为本地静态 mock 资产，降低验收不稳定性。
5. 为首页地图增加轻量动画：光点 pulse、路线流动、扫描线。
6. 进一步还原 V4 的玻璃层级和卡片质感，同时检查 iOS / Android 的真实阴影表现。
7. 补齐每个页面的 loading / empty / error 分支。
8. 用真机或模拟器跑一次 `npm run ios` 和 `npm run android`，检查原生端布局、图片、Tab 安全区和 Modal 表现。

## 11. 总结

当前 TravelAround 前端工程可以判定为 Expo React Native APP。

它不是普通 Web 项目；Web 能运行是因为 Expo 支持 Web 预览。当前页面结构、组件实现和路由方式都符合 Expo + React Native + Expo Router 的移动端工程形态。

