# UniverseMemoryForVVQ · 设计规格

- 文档日期：2026-06-23
- 项目主题：探索 / 记忆 / 在记忆地图中查找
- 定位：cv（男主人）与 qq（女主人）的秘密基地。深空沉浸式 3D 记忆星系，驾驶飞船穿梭双子星系，每颗星球/点位对应一段记忆，飞抵后以空中漂浮卡片画廊展示真实上传的图文视频。
- 仓库：`git@github.com:chevvei/UniverseMemoryForVVQ.git`（账号 chevvei）
- 设备约束：对 iOS（苹果手机）网页端友好为硬性要求。

---

## 1. 总体决策（已与用户确认）

| 决策项 | 结论 |
| --- | --- |
| 飞船/宇航员 | 加载现成 CC0 免费 `.glb` 模型（GLTFLoader） |
| 视角 | 舱内 HUD（第一人称）/ 出舱第三人称，一键切换 |
| HUD 风格 | 默认浪漫简约，可一键切换科技冷蓝（两者可切换/融合） |
| 驾驶自由度 | 半自由飞行（软边界约束）+ 点星球可自动运镜飞过去 |
| 星球内展示 | 空中漂浮卡片画廊，弧形时间线排列 + 点中心放大 |
| 数据/上传 | 两阶段：第一期纯静态 JSON + 仓库资源；第二期网页上传 + 浏览器压缩 + 云存储 |
| 技术栈 | Vite + Three.js 模块化工程（替代当前单文件样板） |
| 本期范围 | 整套一次做到位（飞船 + 视角 + 飞行 + 过渡 + 星球内卡片画廊，用静态示例数据） |
| 托管/部署 | 代码托管 GitHub；网站部署平台先本地开发，最后再定（候选 EdgeOne Pages） |

---

## 2. 视觉与配色（沿用已确认样板）

- 深空底：`#03040c`
- cv 冰蓝：`#7fd4ff`
- qq 暖粉：`#ff9ec4`
- 太阳金：`#ffd27a`
- 渲染：Three.js + EffectComposer + UnrealBloom
- 字体：`"PingFang SC","Microsoft YaHei",system-ui,sans-serif`
- 已确认场景元素（来自样板，迁移到正式工程）：中央太阳 + 丁达尔体积光、八大行星（带魔幻多层辉光、土星环）、cv/qq 双子星互绕（名字标签）、银河带（22000 活粒子 4 旋臂）、彩色星云铺底、彗星拖尾、命名物理点位（L1 初遇点等）。

---

## 3. 功能模块设计

### 3.1 飞船与视角
- 用 `GLTFLoader` 加载低面数科幻飞船 `.glb`（目标 < 2MB，保证 iOS 流畅）；加载失败不做兜底降级（按项目规则不写兜底代码，资源缺失即视为构建错误）。
- 视角状态机：`COCKPIT`（舱内第一人称）/ `CHASE`（出舱第三人称跟随）。一键切换。
  - 舱内：屏幕叠加舷窗框 + HUD；相机位于驾驶舱内。
  - 出舱：相机位于飞船后上方，飞船可见，带引擎尾焰。
- HUD 双风格：
  - 浪漫简约（默认）：淡舷窗框 + 目标星球名 + cv/qq 标识。
  - 科技冷蓝：雷达 / 坐标 / 速度数据线。
  - 一键切换；样式用 DOM 叠加层实现。

### 3.2 驾驶飞行
- 桌面：拖拽转向，`W/S` 或滚轮推进/后退，带惯性缓动加减速。
- iOS 触屏：左下角虚拟摇杆转向，右下角推进按钮前进；支持双指拖拽。
- 软边界约束：飞船位置被柔性拉回星系包围球内（超出范围施加回正力），不会飞丢。
- 光路尾迹：飞船身后生成扩散发光粒子尾迹（近船密亮、远端散淡、加性混合、缓慢消散），取代细线。

### 3.3 点击星球 → 过渡动画
- 点击星球/点位 → 相机 + 飞船平滑运镜飞向目标（加速→巡航→抵达减速缓动，带轻微俯仰）。
- 途中光路粒子拉长强化速度感；抵达时轻微辉光闪现作为到达反馈。
- 抵达后飞船减速环绕目标星球，触发卡片画廊展开。
- 常驻「⟵ 返回星系」，点击运镜飞回总览。

### 3.4 星球内 · 空中漂浮卡片画廊
- 抵达后该记忆内容以发光卡片沿弧形时间线轨道在太空中铺开排列，缓慢自转 + 轻微上下浮动。
- 卡片类型：图片卡 / 视频卡（带播放角标）/ 文字卡。
- 悬停/点击卡片 → 放大到正前方居中，文字可读、视频可播放；点空白处收回。
- 卡片数据来自 `memories.json`，第一期用示例图占位。

### 3.5 行星轨道
- 公转轨道由单一细线改为光粒子逐渐铺开的光路（与尾迹同风格）。

---

## 4. 数据模型（第一期静态）

`data/memories.json`：

```json
{
  "site": { "title": "cv · qq", "subtitle": "UNIVERSE MEMORY" },
  "planets": [
    {
      "id": "first-meet",
      "name": "相识",
      "owner": "cv",
      "orbit": { "dist": 36, "speed": 0.55 },
      "appearance": { "color": "#b5a17a", "glow": "#e8d9b0", "size": 2.0, "ring": false },
      "cards": [
        { "type": "image", "src": "assets/first-meet/01.jpg", "caption": "第一次见面", "date": "2023-05-20" },
        { "type": "text", "title": "那天", "body": "……" },
        { "type": "video", "src": "assets/first-meet/clip.mp4", "poster": "assets/first-meet/poster.jpg" }
      ]
    }
  ],
  "points": [
    { "id": "L1", "name": "L1 · 初遇点", "owner": "cv", "pos": [70, 18, -40], "linkPlanet": "first-meet" }
  ]
}
```

- 数据加载器 `data/loader.js` 负责 fetch + 校验结构；结构非法即报错（不兜底）。
- 第二期上传接口预留：`uploadMedia(file)` → 浏览器压缩 → 云存储返回 URL → 追加到对应 planet.cards。

---

## 5. 技术架构（Vite + Three.js 模块化）

```
src/
  main.js              入口：初始化 core，装配场景与 UI
  core/
    renderer.js        WebGLRenderer + EffectComposer + Bloom
    camera-rig.js      相机运镜（飞向星球 / 返回总览的缓动控制）
    loop.js            统一动画循环（注册 update 回调）
  scene/
    starfield.js       多层星空 + 呼吸
    galaxy.js          银河带（shader 活粒子，4 旋臂）
    nebula.js          彩色星云铺底
    sun.js             太阳 + 丁达尔体积光
    planets.js         八大行星（多层辉光 + 土星环 + 光粒子轨道）
    twins.js           cv/qq 双子星互绕 + 名字标签
    comets.js          彗星拖尾
    points.js          命名物理点位
  ship/
    ship.js            GLTF 飞船加载 + 引擎尾焰
    controls.js        桌面键鼠 + iOS 虚拟摇杆/推进键 + 软边界约束
    view-mode.js       COCKPIT / CHASE 视角状态机
    trail.js           光粒子尾迹
  ui/
    hud.js             双风格 HUD（浪漫简约 / 科技冷蓝）切换
    gallery.js         星球内弧形时间线卡片画廊 + 放大
    tags.js            星球/点位/双子星 HTML 标签投影
    nav.js             返回星系按钮、加载进度
  data/
    memories.json
    loader.js
  styles/
    main.css           含 iOS safe-area / touch-action / -webkit-backdrop-filter
index.html
```

- 模块边界原则：每个 scene/* 暴露 `create()` 返回 Object3D + 可选 `update(t)`；ship/ui 通过事件/回调与场景解耦。
- 渲染统一走 `core/loop.js` 注册 update，避免多处各写 rAF。

---

## 6. iOS 适配清单

- viewport：`width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover`
- safe-area：UI 用 `env(safe-area-inset-*)` 留白
- 触控：`touch-action:none` 防误触；虚拟摇杆 + 推进键单手可玩；禁用双击缩放
- 毛玻璃：`-webkit-backdrop-filter`
- 性能降级：按设备能力降低粒子数 / 关闭部分辉光（低端机）
- 视频：`playsinline` + `muted` 默认，避免 iOS 全屏劫持

---

## 7. 分期与里程碑

- 第一期（本期）：Vite 工程化 + 全部场景迁移 + 飞船/视角/飞行/过渡/卡片画廊（静态示例数据）+ iOS 适配。
- 第二期：网页内上传 + 浏览器压缩到 25MB 内 + 云存储（EdgeOne KV/Blob）+ 部署平台落地。

---

## 8. 待第二期/部署阶段再定（本期不展开）

- 上传鉴权/口令（当前不设口令，谁有链接谁可看，架构预留能力）。
- 云存储后端选型与免费额度（EdgeOne KV/Blob 单文件 25MB 限制）。
- 站名最终定稿（暂用 "cv · qq" 占位）。
- 部署平台最终选择（候选 EdgeOne Pages，境内可访问、免备案）。
