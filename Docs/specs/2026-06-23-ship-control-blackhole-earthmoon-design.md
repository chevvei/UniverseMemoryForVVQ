# 设计规格：飞船操控修复 + 地图扩展 + 黑洞与精致地月系统

- 日期：2026-06-23
- 类型：feature（含 1 处 bug 修复）
- 状态：已确认，待编写实施计划
- 涉及模块：ship（controls / view-mode）、config、scene（新增 blackhole / earth-moon，复用 _helpers）、data（memories.json）、main.js
- 关联需求：用户原话「飞船不能左转右转，自由控制呢，只能上下，这个机制能否拓展下，将地图变大，最好再增加黑洞场景以及真实地球和月亮，这个地月系统要求精致细致，可以看到真实月球表面的每个位置凹坑」

## 1. 背景 / 触发原因

当前飞船在俯仰后左右转失灵，飞行体验受限；世界范围偏小；希望新增两类沉浸式地标天体——黑洞、精致地月系统，且月面要能看清环形山凹坑。用户经可视化伴侣确认采纳全部 4 块方案，按阶段实施。

## 2. 子系统拆解与实施顺序

分 3 个阶段，每阶段可独立验证：

- **阶段 1（操控）**：① 修复飞船左右转 Bug + ② 自由飞行增强 + 地图变大
- **阶段 2（黑洞）**：③ 程序化黑洞天体
- **阶段 3（地月）**：④⑤ 精致地球 + 月球（高清贴图 + 法线/置换贴图）

## 3. 详细设计

### 3.1 ① 飞船左右转 Bug 修复

**根因**：[controls.js](file:///home/sti/Documents/trae_projects/cvqq/src/ship/controls.js#L72-L75) 中
```js
const qy = setFromAxisAngle((0,1,0), yaw);
const qx = setFromAxisAngle((1,0,0), pitch);
quat.multiply(qy).multiply(qx);   // 两者都绕本地轴累乘
```
`multiply` 是右乘，绕的是飞船**本地坐标轴**。当 pitch≠0、机头已倾斜，yaw 绕的是倾斜后的本地 Y 轴，左右转被扭曲成滚转/打转，表现为「只能上下、不能左右」。

**修复**：yaw 绕**世界竖直轴**（左乘 premultiply），pitch 绕本地轴（右乘 multiply）：
```js
const qy = setFromAxisAngle((0,1,0), yaw);
const qx = setFromAxisAngle((1,0,0), pitch);
quat.premultiply(qy);   // yaw 绕世界 Y 轴 → 始终水平左右转
quat.multiply(qx);      // pitch 绕本地 X 轴 → 机头俯仰
```
这是标准飞行/航空相机手感。成功标准：飞船任意姿态下，A/D（及鼠标横向拖拽、摇杆 X）都让机头在水平面左右转，不再翻滚。

### 3.2 ② 自由飞行增强 + 地图变大

- **转向更顺手**：`SHIP.turnRate 0.025 → 0.035`（左右/上下更灵敏）。
- **可选滚转（roll）**：键盘 Q/E 绕本地 Z 轴滚转（`quat.multiply(qz)`），让 6 自由度更自由；移动端不加滚转按钮（保持简洁）。
- **地图变大**：`WORLD.boundRadius 320 → 700`；同步把 [memories.json](file:///home/sti/Documents/trae_projects/cvqq/src/data/memories.json) 中行星 `orbit.dist` 与点位 `pos` 整体放大约 1.6×，使星球散布拉开、空间更开阔（不改变相对结构）。
- HUD 速度/坐标显示沿用现有逻辑，无需改。

### 3.3 ③ 黑洞场景（程序化）

新增 `src/scene/blackhole.js`，导出 `createBlackhole(opts) → { object, update }`，遵循现有 `create*` 接口约定。组成：
- **事件视界**：纯黑球体（`MeshBasicMaterial` color 0x000000）。
- **吸积盘**：水平圆环（RingGeometry 或自定义），ShaderMaterial 做橙红→白热渐变 + 旋转流动 + 加性混合，明显旋转动画。
- **引力透镜光环**：盘外一圈高亮细环（薄 RingGeometry + 加性混合），制造光线弯曲的暗示。
- **放置**：作为一个新地标天体，固定在地图远端某坐标（不绕轨道）。先不挂记忆卡片（纯观赏地标）；后续若要可点击进入再扩展。
- iOS 友好：纯 shader / 基础几何，无外部模型，无大贴图。

### 3.4 ④⑤ 精致地月系统（方案 X：高清贴图 + 法线/置换）

新增 `src/scene/earth-moon.js`，导出 `createEarthMoon() → { object, update }`：
- **地球**：SphereGeometry + `MeshStandardMaterial`：
  - 反照率贴图（昼面）、法线贴图（地形）、可选高光/粗糙度贴图（海洋反光）。
  - 云层：略大半透明球壳，独立缓慢自转。
  - 大气辉光：复用 `makeAtmosphere`。
  - 夜景灯光（可选，emissive 贴图）放后续增强，先不强求。
- **月球**：SphereGeometry（分段 ≥ 96）+ `MeshStandardMaterial`：
  - 反照率贴图（NASA 月面）+ **法线贴图**（环形山随光照投影出阴影）+ **置换贴图 displacementMap**（真实几何起伏，掠射角立体）。
  - 这是「看清每个凹坑」的关键：法线给细节阴影，置换给真实高度起伏。
  - 月球绕地球公转 + 自转（潮汐锁定：自转周期=公转周期，始终同一面朝地球）。
- **光照**：地月系统使用场景已有的太阳 PointLight 作为主光源，明暗交界（晨昏线）真实。
- **资源**：贴图放 `public/textures/`，用 NASA / CC0 公开高清贴图（地球 Blue Marble、月球 CGI Moon Kit / LRO）。提供下载脚本 `scripts/fetch-textures.sh`（类似 fetch-ship.sh），由用户执行下载，校验文件。控制总体积（地球 ~2-4MB、月球 ~2-4MB），iOS 流畅。
- **放置**：作为地图中一个精致地标天体，固定坐标。

## 4. 模块边界

| 模块 | 职责 | 接口 |
|---|---|---|
| controls.js（改） | 飞船 6 自由度旋转与推进 | `update(dt)→throttle` |
| config.js（改） | turnRate / boundRadius 参数 | 常量 |
| blackhole.js（新） | 黑洞观赏天体 | `createBlackhole()→{object,update}` |
| earth-moon.js（新） | 地月系统 | `createEarthMoon()→{object,update}` |
| memories.json（改） | 轨道/点位坐标放大 | 数据 |
| main.js（改） | 装配新天体到 scene 与 loop | — |

## 5. 测试

- **纯函数单测**：本次旋转修复在 controls.js 内（依赖 THREE，难纯函数化），不强加单测；以 `npm run build` + 浏览器手动验证为准。
- **回归**：现有 18 项测试须继续通过（lint 0、build ✓）。
- **手动验证清单**：
  - 飞船任意姿态左右转保持水平、上下俯仰正常、Q/E 滚转生效。
  - 地图明显变大，星球散布拉开，飞行不出界（软边界仍生效）。
  - 黑洞吸积盘旋转发光、有引力透镜光环。
  - 地球昼夜交界真实、云层转动；月球能看清环形山凹坑阴影、潮汐锁定。
  - iOS（Safari）流畅无卡顿。

## 6. 不做（YAGNI）

- 黑洞的真实广义相对论光线追踪（只做视觉暗示）。
- 地月真实 3D 网格模型（体积/性能不划算，方案 X 已满足）。
- 黑洞/地月暂不挂记忆卡片交互（先做观赏地标，后续按需扩展）。
- 地球夜景灯光贴图列为后续可选增强。
