# TravelAround cx 优化任务说明

> 日期：2026-06-08
> 决策来源：用户已拍板
> - 社区入口：采用 `review/MAP_PAGE_REQUIREMENTS.md` 的 **D1-A**
> - 地图方案：采用 `review/MAP_PAGE_REQUIREMENTS.md` 的 **D2-A**
> 目标：交给 cx 做下一轮优化，Codex 后续负责复验。

## 一、最终决策

### O1 ｜社区入口采用方案 A：恢复第 5 个底栏 Tab

当前实现为了对齐 PRD 4 Tab，把 `community` 设为隐藏路由：

- `app/tabs/_layout.tsx`：`community` 当前是 `options={{ href: null }}`
- `src/components/BottomTabBar.tsx`：当前只渲染 `home / map / checkin / profile`

用户已确认采用方案 A：恢复底栏「社区」入口。

cx 需要做：

1. `app/tabs/_layout.tsx`
   - 恢复 `<Tabs.Screen name="community" />`
   - 底栏目标为：`首页 / 地图 / 点亮 / 社区 / 我的`
   - `plan` 可继续保持隐藏路由，除非产品另有要求。
2. `src/components/BottomTabBar.tsx`
   - 恢复 `community` 的 icon 和 label。
   - 当前中心按钮是 `checkin`，五 Tab 布局下仍保持点亮按钮居中。
   - 高亮仍使用路由名判断，不要退回过滤后 index 判断。
3. 文档回写
   - `FEATURE_MATRIX.md`：Tab 结构从 4 Tab 更新为 5 Tab，社区入口标为 Completed。
   - `ACCEPTANCE_REPORT.md`：说明社区作为底栏一级入口恢复。
   - 若项目后续维护 PRD 文档，也要同步说明这是用户验收口径调整。

验收标准：

- 底栏能看到「社区」。
- 点击「社区」进入 `/tabs/community`。
- 从隐藏路由 `/tabs/plan` 返回其他 Tab 时，底栏高亮不串台。
- `npm run check` 通过。

## 二、地图采用方案 A：WebView 真实中国地图

当前 `MapPreview` 是 SVG 装饰地图，不是真实中国地图，也没有真实缩放/平移。用户已确认采用 D2-A：WebView 方案。

硬约束：

- 必须保持 Expo Go 可扫码运行。
- 不要引入需要 EAS Dev Build 的原生地图 SDK。
- 推荐依赖：`react-native-webview`，需用 Expo 兼容方式安装：

```bash
npx expo install react-native-webview
```

### 推荐落地方式

新增一个真实地图组件，例如：

```text
src/components/ChinaMapWebView.tsx
```

地图页改造：

```text
app/tabs/map.tsx
```

推荐实现：

1. 用 `WebView` 承载网页地图。
2. 优先支持高德 JS API：
   - key 从环境变量读取，例如 `EXPO_PUBLIC_AMAP_WEB_KEY`
   - 没有 key 时，页面显示明确缺 key 状态，不要静默退回假地图。
3. 城市 / 景点点位使用现有经纬度：
   - `city.coordinates`
   - `spot.coordinates`
4. 点位点击后通过 `window.ReactNativeWebView.postMessage(...)` 回传：
   - city -> `router.push('/city/{cityId}')`
   - spot -> `router.push('/spot/{spotId}')`
5. 搜索继续保留真实功能：
   - 输入关键字过滤城市 / 景点 / 主题。
   - 地图只渲染过滤后的点位。
   - 下方保留命中数量或结果列表，避免用户不知道过滤生效。

### 布局要求

同时修复 `MAP_PAGE_REQUIREMENTS.md` 里 P2/R1/R2/R3：

1. 地图页能上下滚动。
2. 地图区域本身支持双指缩放和拖动。
3. 页面浮层不能遮挡底图关键内容。
4. 不再用当前 `MapPreview` 的假 `+/-` 缩放语义。
5. WebView 高度要稳定，建议固定最小高度，例如 520-620，并给底部 Tab 留安全间距。

### 不建议的做法

- 不要接 `react-native-maps`，它不兼容 Expo Go 直接扫码目标。
- 不要继续用当前 SVG 团块冒充真实中国地图。
- 不要把搜索框做成可输入但无效果的假交互。
- 不要把真实地图 key 写死在代码里。

## 三、涉及文件建议

优先修改：

- `app/tabs/_layout.tsx`
- `src/components/BottomTabBar.tsx`
- `app/tabs/map.tsx`
- `src/components/ChinaMapWebView.tsx`（新增）
- `package.json`
- `package-lock.json`
- `FEATURE_MATRIX.md`
- `ACCEPTANCE_REPORT.md`

可能需要小改：

- `src/components/index.ts`
- `src/services/map/*`
- `src/services/types.ts`

## 四、验收清单

cx 完成后，Codex 复验以下项目：

- [ ] 底栏是 5 Tab：`首页 / 地图 / 点亮 / 社区 / 我的`
- [ ] 社区入口可点击，进入 `/tabs/community`
- [ ] 地图页是真实中国地图，不再是 SVG 假地图
- [ ] 地图可拖动、可缩放
- [ ] 地图页可上下滚动，内容不被底栏遮挡
- [ ] 搜索城市 / 景点 / 主题后，地图点位或结果列表真实变化
- [ ] 点击城市点位进入城市详情
- [ ] 点击景点点位进入景点详情
- [ ] Expo Go iOS 真机扫码可运行
- [ ] `npm run format:check` 通过
- [ ] `npm run check` 通过

## 五、交付要求

cx 修复完成后请提交到当前功能分支或新的 `codex/` 分支，并同步：

- 分支名
- commit hash
- 关键改动摘要
- 验证命令结果
- 若需要地图 key，请明确说明环境变量名与配置方式
