# UniverseMemoryForVVQ 实施计划

> **致代理工作者：** 必需子技能：使用 sp-subagent-driven-development（推荐）或 sp-executing-plans 逐任务实施此计划。步骤使用复选框（`- [ ]`）语法进行跟踪。

**目标：** 用 Vite + Three.js 构建深空 3D 记忆星系网站，玩家半自由驾驶飞船穿梭双子星系，点击星球运镜飞抵后以弧形时间线漂浮卡片展示图文视频。

**架构：** 模块化前端（无后端，第一期）。`core/` 负责渲染/相机运镜/统一循环；`scene/*` 各自暴露 `create()`→Object3D 与可选 `update(t)`；`ship/*` 管飞船模型/控制/视角/尾迹；`ui/*` 管 HUD/卡片画廊/标签/导航；`data/` 提供静态 `memories.json` 与加载校验。关键纯函数（数据校验、缓动、软边界、弧形布局）用 Vitest 单测，3D 表现用构建通过 + 浏览器手动验证清单。

**技术栈：** Node v22 / npm 10、Vite 5、Three.js 0.160、Vitest（单测）、ESLint（lint）。

---

## 文件结构

```
package.json            npm 脚本：dev/build/preview/test/lint
vite.config.js          base、build 输出
index.html              入口，importmap 改为 npm 依赖
.eslintrc.json          lint 规则
.gitignore              node_modules / dist / .trae/skills 软链
src/
  main.js               装配 core + scene + ship + ui
  config.js             配色常量、星系包围球半径、速度等可调参数
  core/
    renderer.js         WebGLRenderer + EffectComposer + UnrealBloom
    loop.js             注册 update 回调的统一 rAF 循环
    easing.js           缓动纯函数（easeInOutCubic 等）
    camera-rig.js       相机运镜：flyTo(target)/returnToOverview()
  scene/
    starfield.js        多层星空
    galaxy.js           银河带 shader 活粒子
    nebula.js           彩色星云
    sun.js              太阳 + 体积光
    planets.js          八大行星 + 辉光 + 土星环
    twins.js            cv/qq 双子星
    comets.js           彗星拖尾
    points.js           命名物理点位
    orbit-path.js       光粒子铺开的轨道光路
  ship/
    ship.js             GLTF 飞船加载 + 尾焰
    controls.js         键鼠 + 触屏摇杆 + 软边界
    bounds.js           软边界纯函数 clampToSphere
    view-mode.js        COCKPIT/CHASE 状态机
    trail.js            光粒子尾迹
  ui/
    hud.js              双风格 HUD 切换
    gallery.js          弧形时间线卡片画廊
    gallery-layout.js   弧形布局纯函数 arcPositions
    tags.js             HTML 标签投影
    nav.js              返回按钮 / 加载进度
  data/
    memories.json       静态示例数据
    loader.js           fetch + 结构校验
  styles/
    main.css            iOS safe-area / touch-action
test/
  loader.test.js
  easing.test.js
  bounds.test.js
  gallery-layout.test.js
public/
  models/ship.glb       现成 CC0 飞船模型
  assets/...            示例图占位
```

---

### 任务 1：Vite 工程脚手架

**文件：**
- 创建：`package.json`
- 创建：`vite.config.js`
- 创建：`.gitignore`
- 创建：`.eslintrc.json`
- 创建：`index.html`
- 创建：`src/main.js`

- [ ] **步骤 1：初始化 package.json**

创建 `package.json`：

```json
{
  "name": "universe-memory-for-vvq",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "lint": "eslint src test"
  },
  "dependencies": {
    "three": "0.160.0"
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "vitest": "^2.1.0",
    "eslint": "^9.0.0"
  }
}
```

- [ ] **步骤 2：创建 vite.config.js**

```js
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: { target: 'es2020', outDir: 'dist' },
  server: { port: 8099, host: true }
});
```

- [ ] **步骤 3：创建 .gitignore**

```
node_modules/
dist/
.DS_Store
.trae/skills/sp-*
.trae/skills/_TRAE_ADAPTER.md
```

- [ ] **步骤 4：创建 .eslintrc.json**

```json
{
  "root": true,
  "env": { "browser": true, "es2022": true },
  "parserOptions": { "ecmaVersion": 2022, "sourceType": "module" },
  "extends": "eslint:recommended",
  "rules": { "no-unused-vars": "warn" }
}
```

- [ ] **步骤 5：创建 index.html**

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>cv · qq · UNIVERSE MEMORY</title>
  <link rel="stylesheet" href="./src/styles/main.css" />
</head>
<body>
  <div id="app"></div>
  <script type="module" src="./src/main.js"></script>
</body>
</html>
```

- [ ] **步骤 6：创建占位 src/main.js**

```js
console.log('UniverseMemoryForVVQ boot');
```

- [ ] **步骤 7：安装依赖并验证 dev 启动**

运行：`npm install`
运行：`npm run build`
预期：build 成功，生成 `dist/`（main.js 仅 console.log，无报错）

- [ ] **步骤 8：提交**

```bash
git add package.json vite.config.js .gitignore .eslintrc.json index.html src/main.js
git commit -m "[build][feat]: Vite + Three.js 工程脚手架 / Scaffold Vite project"
```

---

### 任务 2：配色与全局参数 config.js

**文件：**
- 创建：`src/config.js`

- [ ] **步骤 1：写 config.js（迁移样板已确认常量）**

```js
export const COLOR = {
  ICE: '#7fd4ff',
  ROSE: '#ff9ec4',
  SUN: '#ffd27a',
  DEEP: '#03040c'
};

export const WORLD = {
  boundRadius: 320,
  sunRadius: 10,
  galaxyParticles: 22000
};

export const SHIP = {
  maxSpeed: 1.4,
  accel: 0.04,
  turnRate: 0.025,
  trailParticles: 240
};

export const FONT = '"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
```

- [ ] **步骤 2：提交**

```bash
git add src/config.js
git commit -m "[core][feat]: 全局配色与参数 config / Add global config"
```

---

### 任务 3：缓动纯函数 + 单测

**文件：**
- 创建：`src/core/easing.js`
- 测试：`test/easing.test.js`

- [ ] **步骤 1：写失败测试**

`test/easing.test.js`：

```js
import { describe, it, expect } from 'vitest';
import { easeInOutCubic, clamp01 } from '../src/core/easing.js';

describe('easing', () => {
  it('clamp01 限制到 [0,1]', () => {
    expect(clamp01(-0.5)).toBe(0);
    expect(clamp01(0.3)).toBe(0.3);
    expect(clamp01(2)).toBe(1);
  });
  it('easeInOutCubic 端点', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
  });
  it('easeInOutCubic 中点为 0.5', () => {
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 5);
  });
});
```

- [ ] **步骤 2：运行测试验证它失败**

运行：`npm run test -- easing`
预期：FAIL，报 "Cannot find module easing.js"

- [ ] **步骤 3：写实现**

`src/core/easing.js`：

```js
export function clamp01(t) {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

export function easeInOutCubic(t) {
  t = clamp01(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
```

- [ ] **步骤 4：运行测试验证通过**

运行：`npm run test -- easing`
预期：PASS（3 通过）

- [ ] **步骤 5：提交**

```bash
git add src/core/easing.js test/easing.test.js
git commit -m "[core][feat]: 缓动纯函数与单测 / Add easing utils with tests"
```

---

### 任务 4：软边界纯函数 + 单测

**文件：**
- 创建：`src/ship/bounds.js`
- 测试：`test/bounds.test.js`

- [ ] **步骤 1：写失败测试**

`test/bounds.test.js`：

```js
import { describe, it, expect } from 'vitest';
import { softClampToSphere } from '../src/ship/bounds.js';

describe('softClampToSphere', () => {
  it('球内不变', () => {
    const p = { x: 10, y: 0, z: 0 };
    const r = softClampToSphere(p, 100, 0.1);
    expect(r).toEqual({ x: 10, y: 0, z: 0 });
  });
  it('球外向内拉回', () => {
    const p = { x: 200, y: 0, z: 0 };
    const r = softClampToSphere(p, 100, 0.5);
    expect(r.x).toBeLessThan(200);
    expect(r.x).toBeGreaterThan(100);
  });
});
```

- [ ] **步骤 2：运行测试验证它失败**

运行：`npm run test -- bounds`
预期：FAIL，模块不存在

- [ ] **步骤 3：写实现**

`src/ship/bounds.js`：

```js
export function softClampToSphere(pos, radius, strength) {
  const d = Math.hypot(pos.x, pos.y, pos.z);
  if (d <= radius || d === 0) return { x: pos.x, y: pos.y, z: pos.z };
  const over = d - radius;
  const pull = over * strength;
  const k = (d - pull) / d;
  return { x: pos.x * k, y: pos.y * k, z: pos.z * k };
}
```

- [ ] **步骤 4：运行测试验证通过**

运行：`npm run test -- bounds`
预期：PASS（2 通过）

- [ ] **步骤 5：提交**

```bash
git add src/ship/bounds.js test/bounds.test.js
git commit -m "[ship][feat]: 软边界约束纯函数与单测 / Add soft bounds with tests"
```

---

### 任务 5：弧形卡片布局纯函数 + 单测

**文件：**
- 创建：`src/ui/gallery-layout.js`
- 测试：`test/gallery-layout.test.js`

- [ ] **步骤 1：写失败测试**

`test/gallery-layout.test.js`：

```js
import { describe, it, expect } from 'vitest';
import { arcPositions } from '../src/ui/gallery-layout.js';

describe('arcPositions', () => {
  it('数量匹配', () => {
    const ps = arcPositions(4, 20, Math.PI / 2);
    expect(ps.length).toBe(4);
  });
  it('每个点都有 x/y/z 数值', () => {
    const ps = arcPositions(3, 20, Math.PI / 2);
    for (const p of ps) {
      expect(typeof p.x).toBe('number');
      expect(typeof p.y).toBe('number');
      expect(typeof p.z).toBe('number');
    }
  });
  it('单卡居中（角度跨度内对称）', () => {
    const ps = arcPositions(1, 20, Math.PI / 2);
    expect(ps[0].x).toBeCloseTo(0, 5);
  });
});
```

- [ ] **步骤 2：运行测试验证它失败**

运行：`npm run test -- gallery-layout`
预期：FAIL，模块不存在

- [ ] **步骤 3：写实现**

`src/ui/gallery-layout.js`：

```js
export function arcPositions(count, radius, span) {
  const out = [];
  if (count <= 0) return out;
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const angle = (t - 0.5) * span;
    out.push({
      x: Math.sin(angle) * radius,
      y: 0,
      z: -Math.cos(angle) * radius
    });
  }
  return out;
}
```

- [ ] **步骤 4：运行测试验证通过**

运行：`npm run test -- gallery-layout`
预期：PASS（3 通过）

- [ ] **步骤 5：提交**

```bash
git add src/ui/gallery-layout.js test/gallery-layout.test.js
git commit -m "[ui][feat]: 弧形卡片布局纯函数与单测 / Add arc gallery layout with tests"
```

---

### 任务 6：静态数据 memories.json + 加载校验 + 单测

**文件：**
- 创建：`src/data/memories.json`
- 创建：`src/data/loader.js`
- 测试：`test/loader.test.js`

- [ ] **步骤 1：写 memories.json（含全部 8 行星 + 点位示例）**

`src/data/memories.json`：

```json
{
  "site": { "title": "cv · qq", "subtitle": "UNIVERSE MEMORY" },
  "planets": [
    { "id": "acquaintance", "name": "相识", "owner": "cv",
      "orbit": { "dist": 36, "speed": 0.55 },
      "appearance": { "color": "#b5a17a", "glow": "#e8d9b0", "size": 2.0, "ring": false },
      "cards": [
        { "type": "text", "title": "初次相识", "body": "故事的起点。", "date": "2023-05-20" }
      ] },
    { "id": "first-heart", "name": "初见心动", "owner": "qq",
      "orbit": { "dist": 52, "speed": 0.42 },
      "appearance": { "color": "#ff9ec4", "glow": "#ffd0e2", "size": 2.4, "ring": false },
      "cards": [
        { "type": "text", "title": "心动", "body": "那一刻的悸动。", "date": "2023-06-01" }
      ] },
    { "id": "travel", "name": "一起旅行", "owner": "cv",
      "orbit": { "dist": 72, "speed": 0.33 },
      "appearance": { "color": "#7fd4ff", "glow": "#bfeaff", "size": 3.0, "ring": false },
      "cards": [
        { "type": "image", "src": "assets/sample/travel-01.svg", "caption": "出发", "date": "2023-08-10" }
      ] },
    { "id": "anniversary", "name": "纪念日", "owner": "qq",
      "orbit": { "dist": 96, "speed": 0.26 },
      "appearance": { "color": "#ffd27a", "glow": "#ffe6b0", "size": 2.6, "ring": false },
      "cards": [
        { "type": "text", "title": "周年", "body": "值得铭记的一天。", "date": "2024-05-20" }
      ] },
    { "id": "daily", "name": "日常时光", "owner": "cv",
      "orbit": { "dist": 122, "speed": 0.21 },
      "appearance": { "color": "#c9a8ff", "glow": "#e3d2ff", "size": 2.2, "ring": false },
      "cards": [
        { "type": "text", "title": "平凡", "body": "细水长流的每一天。", "date": "2024-09-01" }
      ] },
    { "id": "food", "name": "美食记录", "owner": "qq",
      "orbit": { "dist": 150, "speed": 0.17 },
      "appearance": { "color": "#e8c07a", "glow": "#f5dca5", "size": 3.4, "ring": true },
      "cards": [
        { "type": "image", "src": "assets/sample/food-01.svg", "caption": "一起做饭", "date": "2024-11-11" }
      ] },
    { "id": "surprise", "name": "惊喜瞬间", "owner": "cv",
      "orbit": { "dist": 182, "speed": 0.13 },
      "appearance": { "color": "#9ec6ff", "glow": "#cfe4ff", "size": 2.5, "ring": false },
      "cards": [
        { "type": "text", "title": "惊喜", "body": "意料之外的温柔。", "date": "2025-02-14" }
      ] },
    { "id": "future", "name": "未来约定", "owner": "qq",
      "orbit": { "dist": 214, "speed": 0.1 },
      "appearance": { "color": "#ffb3d1", "glow": "#ffd6e8", "size": 2.8, "ring": false },
      "cards": [
        { "type": "text", "title": "约定", "body": "我们的下一站。", "date": "2025-12-31" }
      ] }
  ],
  "points": [
    { "id": "L1", "name": "L1 · 初遇点", "owner": "cv", "pos": [70, 18, -40], "linkPlanet": "acquaintance" },
    { "id": "L2", "name": "L2 · 心动锚", "owner": "qq", "pos": [-60, 30, 50], "linkPlanet": "first-heart" },
    { "id": "L4", "name": "L4 · 约定点", "owner": "cv", "pos": [120, -20, -90], "linkPlanet": "future" },
    { "id": "L5", "name": "L5 · 回忆港", "owner": "qq", "pos": [-110, -25, 80], "linkPlanet": "daily" },
    { "id": "perihelion", "name": "近日锚点", "owner": "cv", "pos": [40, 5, 30], "linkPlanet": "travel" }
  ]
}
```

- [ ] **步骤 2：写失败测试**

`test/loader.test.js`：

```js
import { describe, it, expect } from 'vitest';
import { validateMemories } from '../src/data/loader.js';
import data from '../src/data/memories.json';

describe('validateMemories', () => {
  it('示例数据通过校验', () => {
    expect(() => validateMemories(data)).not.toThrow();
  });
  it('缺 site 抛错', () => {
    expect(() => validateMemories({ planets: [], points: [] })).toThrow();
  });
  it('行星缺 id 抛错', () => {
    const bad = { site: { title: 't', subtitle: 's' },
      planets: [{ name: 'x', orbit: { dist: 1, speed: 1 }, appearance: { color: '#fff', glow: '#fff', size: 1, ring: false }, cards: [] }],
      points: [] };
    expect(() => validateMemories(bad)).toThrow();
  });
  it('卡片类型非法抛错', () => {
    const bad = { site: { title: 't', subtitle: 's' },
      planets: [{ id: 'a', name: 'x', owner: 'cv', orbit: { dist: 1, speed: 1 }, appearance: { color: '#fff', glow: '#fff', size: 1, ring: false }, cards: [{ type: 'audio' }] }],
      points: [] };
    expect(() => validateMemories(bad)).toThrow();
  });
});
```

- [ ] **步骤 3：运行测试验证它失败**

运行：`npm run test -- loader`
预期：FAIL，loader.js 不存在

- [ ] **步骤 4：写实现**

`src/data/loader.js`：

```js
const CARD_TYPES = ['image', 'video', 'text'];

export function validateMemories(data) {
  if (!data || typeof data !== 'object') throw new Error('memories: 根必须是对象');
  if (!data.site || !data.site.title || !data.site.subtitle) throw new Error('memories: 缺 site.title/subtitle');
  if (!Array.isArray(data.planets)) throw new Error('memories: planets 必须是数组');
  if (!Array.isArray(data.points)) throw new Error('memories: points 必须是数组');
  for (const p of data.planets) {
    if (!p.id || !p.name || !p.owner) throw new Error('memories: 行星缺 id/name/owner');
    if (!p.orbit || typeof p.orbit.dist !== 'number' || typeof p.orbit.speed !== 'number') throw new Error(`memories: 行星 ${p.id} orbit 非法`);
    const a = p.appearance;
    if (!a || typeof a.size !== 'number' || typeof a.ring !== 'boolean') throw new Error(`memories: 行星 ${p.id} appearance 非法`);
    if (!Array.isArray(p.cards)) throw new Error(`memories: 行星 ${p.id} cards 必须是数组`);
    for (const c of p.cards) {
      if (!CARD_TYPES.includes(c.type)) throw new Error(`memories: 行星 ${p.id} 卡片类型非法 ${c.type}`);
    }
  }
  for (const pt of data.points) {
    if (!pt.id || !pt.name || !Array.isArray(pt.pos) || pt.pos.length !== 3) throw new Error('memories: 点位非法');
  }
  return data;
}

export async function loadMemories(url = './src/data/memories.json') {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`memories: 加载失败 ${res.status}`);
  const data = await res.json();
  return validateMemories(data);
}
```

- [ ] **步骤 5：运行测试验证通过**

运行：`npm run test -- loader`
预期：PASS（4 通过）

- [ ] **步骤 6：提交**

```bash
git add src/data/memories.json src/data/loader.js test/loader.test.js
git commit -m "[data][feat]: 静态记忆数据与加载校验 / Add memories data and loader"
```

---

### 任务 7：核心渲染器 + 统一循环

**文件：**
- 创建：`src/core/renderer.js`
- 创建：`src/core/loop.js`
- 创建：`src/styles/main.css`
- 修改：`src/main.js`

- [ ] **步骤 1：写 main.css（iOS 适配）**

`src/styles/main.css`：

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { width: 100%; height: 100%; overflow: hidden; }
body {
  background: #03040c;
  font-family: "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
  color: #eaf2ff;
  touch-action: none;
  -webkit-user-select: none; user-select: none;
}
canvas { display: block; }
.hud, .nav, .gallery-ui {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
```

- [ ] **步骤 2：写 renderer.js**

`src/core/renderer.js`：

```js
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export function createRenderer(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 4000);
  camera.position.set(0, 60, 220);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.3, 0.6, 0.08);
  composer.addPass(bloom);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  });

  return { renderer, scene, camera, composer };
}
```

- [ ] **步骤 3：写 loop.js**

`src/core/loop.js`：

```js
export function createLoop(composer) {
  const updaters = [];
  let clock = 0;
  function add(fn) { updaters.push(fn); }
  function start() {
    let last = performance.now();
    function frame(now) {
      const dt = (now - last) / 1000;
      last = now;
      clock += dt;
      for (const fn of updaters) fn(clock, dt);
      composer.render();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  return { add, start };
}
```

- [ ] **步骤 4：改 main.js 验证黑屏渲染**

`src/main.js`：

```js
import './styles/main.css';
import { createRenderer } from './core/renderer.js';
import { createLoop } from './core/loop.js';

const app = document.getElementById('app');
const { scene, camera, composer } = createRenderer(app);
const loop = createLoop(composer);
loop.start();
console.log('renderer ready', scene, camera);
```

- [ ] **步骤 5：配置 three/addons 解析**

修改 `vite.config.js`，加 resolve alias：

```js
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      'three/addons/': fileURLToPath(new URL('./node_modules/three/examples/jsm/', import.meta.url))
    }
  },
  build: { target: 'es2020', outDir: 'dist' },
  server: { port: 8099, host: true }
});
```

- [ ] **步骤 6：构建验证**

运行：`npm run build`
预期：build 成功，无模块解析错误。

- [ ] **步骤 7：浏览器手动验证**

运行：`npm run dev`，打开预览。
预期：黑色画布，控制台打印 "renderer ready"，无报错。

- [ ] **步骤 8：提交**

```bash
git add src/core/renderer.js src/core/loop.js src/styles/main.css src/main.js vite.config.js
git commit -m "[core][feat]: 渲染器与统一循环 / Add renderer and loop"
```

---

### 任务 8：场景迁移（星空/银河/星云/太阳/双子星/彗星）

**文件：**
- 创建：`src/scene/starfield.js`
- 创建：`src/scene/galaxy.js`
- 创建：`src/scene/nebula.js`
- 创建：`src/scene/sun.js`
- 创建：`src/scene/twins.js`
- 创建：`src/scene/comets.js`
- 修改：`src/main.js`

- [ ] **步骤 1：迁移逻辑**

从 `preview/index.html` 抽取对应函数为 ES 模块，每个文件导出 `create(THREE)` 返回 `{ object, update }`（update 接收 `(t, dt)`）。具体迁移映射：
- `starfield.js` ← 样板 `makeStars()`（stars1 2200/1500/1.6 白、stars2 500/1300/2.6 冰蓝）
- `galaxy.js` ← 样板 `makeGalaxyBand()`（22000 粒子 / 4 旋臂 / 4 色 / shader uTime 闪烁 / rotation.x=0.38），update 写 `uniforms.uTime.value=t`
- `nebula.js` ← 样板 `makeNebula()`（14 团 radialSprite），update 写 `rotation.y=t*0.006`
- `sun.js` ← 样板太阳 + glowSun/glowSun2 + 14 条 rays（radialSprite 280×14 旋转）+ sunLight PointLight + AmbientLight
- `twins.js` ← 样板 `twin()` + twinCV(ICE)/twinQQ(ROSE) 互绕（导出标签所需世界坐标供 ui/tags 使用）
- `comets.js` ← 样板 `makeComet()`×2 + `launchComet()`（head + 26 段拖尾，update 内 lerp 运动 + 拖尾沿 -dir 排开 + 周期重启）

每个文件顶部 `import * as THREE from 'three'; import { COLOR, WORLD } from '../config.js';`。

- [ ] **步骤 2：装配进 main.js**

在 `main.js` 中导入这些模块，逐个 `const m = create(); scene.add(m.object); loop.add(m.update);`（顺序：nebula → starfield → galaxy → sun → twins → comets）。

- [ ] **步骤 3：构建验证**

运行：`npm run build`
预期：成功，无未定义引用。

- [ ] **步骤 4：浏览器手动验证清单**

运行：`npm run dev`。逐项确认：
- [ ] 中央太阳发光 + 体积光丁达尔射线旋转
- [ ] 银河带 4 旋臂粒子闪烁
- [ ] 星云彩色铺底缓慢旋转
- [ ] 双子星 cv/qq 互绕发光
- [ ] 彗星拖尾周期划过
- [ ] 控制台无报错

- [ ] **步骤 5：提交**

```bash
git add src/scene/starfield.js src/scene/galaxy.js src/scene/nebula.js src/scene/sun.js src/scene/twins.js src/scene/comets.js src/main.js
git commit -m "[scene][feat]: 迁移星空银河星云太阳双子星彗星 / Migrate base scene"
```

---

### 任务 9：行星 + 数据驱动 + 光粒子轨道光路

**文件：**
- 创建：`src/scene/planets.js`
- 创建：`src/scene/orbit-path.js`
- 修改：`src/main.js`

- [ ] **步骤 1：写 orbit-path.js（光粒子铺开光路）**

`src/scene/orbit-path.js` 导出 `createOrbitPath(THREE, radius, color)`：用 `THREE.Points` 沿圆周生成 N 个粒子（如 360 个），shader/PointsMaterial 加性混合，update 内让粒子透明度沿角度从暗到亮"逐渐铺开"流动（用 attribute `aOffset` + uTime 计算亮度），返回 `{ object, update }`。这取代样板单一细线轨道。

```js
import * as THREE from 'three';

export function createOrbitPath(radius, color) {
  const N = 360;
  const positions = new Float32Array(N * 3);
  const offsets = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    positions[i * 3] = Math.cos(a) * radius;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = Math.sin(a) * radius;
    offsets[i] = i / N;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(color) } },
    vertexShader: `
      attribute float aOffset; varying float vB; uniform float uTime;
      void main(){
        float phase = fract(aOffset - uTime * 0.08);
        vB = smoothstep(0.0, 1.0, phase);
        gl_PointSize = 2.0 + vB * 2.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }`,
    fragmentShader: `
      varying float vB; uniform vec3 uColor;
      void main(){
        vec2 c = gl_PointCoord - 0.5; float d = length(c);
        if(d>0.5) discard;
        gl_FragColor = vec4(uColor, (0.15 + vB*0.85) * (1.0 - d*2.0));
      }`
  });
  const points = new THREE.Points(geo, mat);
  return { object: points, update: (t) => { mat.uniforms.uTime.value = t; } };
}
```

- [ ] **步骤 2：写 planets.js（数据驱动 + 辉光 + 土星环）**

`src/scene/planets.js` 导出 `createPlanets(planetData)`，对每条 `planetData`：
- 迁移样板 `makeAtmosphere()`（Fresnel 内层 size*1.18 + 外层 size*1.55）、`makeRingTexture()`（土星环）、3 层 halo sprite 脉动。
- 每行星 = `THREE.Group{ mesh + 内层大气 + 外层 accent + 3 halo + (ring? 环) }`，`userData = { id, angle, dist:orbit.dist, speed:orbit.speed, mesh, halo, baseHalo }`。
- 同时为每行星调用 `createOrbitPath(orbit.dist, appearance.glow)` 加入。
- 导出 `{ object: group, update, meshes }`（meshes 供 raycaster；update 做公转 + 辉光脉动 `0.85+0.15*sin`）。

```js
import * as THREE from 'three';
import { createOrbitPath } from './orbit-path.js';
// makeAtmosphere / makeRingTexture / radialSprite 从样板迁移到此文件或 scene/_helpers.js

export function createPlanets(planetData) {
  const root = new THREE.Group();
  const meshes = [];
  const orbits = [];
  const planets = [];
  for (const d of planetData) {
    const g = new THREE.Group();
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(d.appearance.size, 48, 48),
      new THREE.MeshStandardMaterial({ color: d.appearance.color, emissive: d.appearance.glow, emissiveIntensity: 0.4, roughness: 0.8 })
    );
    g.add(mesh);
    // 迁移：内层/外层 Fresnel 大气 + 3 halo + (d.appearance.ring 时加土星环)
    g.userData = { id: d.id, angle: Math.random() * Math.PI * 2, dist: d.orbit.dist, speed: d.orbit.speed, mesh };
    mesh.userData.planetId = d.id;
    meshes.push(mesh);
    root.add(g);
    planets.push(g);
    const op = createOrbitPath(d.orbit.dist, d.appearance.glow);
    root.add(op.object); orbits.push(op);
  }
  function update(t, dt) {
    for (const g of planets) {
      const u = g.userData;
      u.angle += u.speed * dt * 0.2;
      g.position.set(Math.cos(u.angle) * u.dist, 0, Math.sin(u.angle) * u.dist);
      u.mesh.rotation.y += dt * 0.3;
    }
    for (const o of orbits) o.update(t);
  }
  return { object: root, update, meshes, planets };
}
```

- [ ] **步骤 3：装配 main.js（用 loader 数据）**

在 main.js 中 `import { loadMemories } from './data/loader.js'`，`const data = await loadMemories();`，`const planets = createPlanets(data.planets); scene.add(planets.object); loop.add(planets.update);`。main.js 顶层改为 `async` IIFE 包裹。

- [ ] **步骤 4：构建 + 浏览器验证**

运行：`npm run build` → 成功。
运行：`npm run dev`，确认：
- [ ] 8 颗行星沿各自轨道公转
- [ ] 行星有 Fresnel 辉光脉动
- [ ] 美食记录行星有土星环
- [ ] 轨道是光粒子流动光路（非细线）
- [ ] 无报错

- [ ] **步骤 5：提交**

```bash
git add src/scene/planets.js src/scene/orbit-path.js src/main.js
git commit -m "[scene][feat]: 数据驱动行星与光粒子轨道 / Add planets and particle orbit"
```

---

### 任务 10：点位 + HTML 标签投影

**文件：**
- 创建：`src/scene/points.js`
- 创建：`src/ui/tags.js`
- 修改：`src/main.js`

- [ ] **步骤 1：写 points.js**

迁移样板 `poiDefs`/物理点位：每点 = `Group{ OctahedronGeometry 核 + 朝相机 RingGeometry 准星环 + 光晕 }`，数据来自 `data.points`。导出 `{ object, update(t, camera), items }`，update 内 `ring.lookAt(camera)` + 呼吸缩放。

- [ ] **步骤 2：写 tags.js（投影）**

迁移样板 `projectTag(obj, el, yOff)`：把 3D 世界坐标投影到屏幕 2D，定位 HTML 标签。导出 `createTagLayer(camera)` 返回 `{ addTag(target, text, cls, yOff), update() }`，内部维护 DOM 标签数组，update 内逐个投影。CSS 类 `.planet-tag`/`.poi-tag`/`.name-tag` 从样板迁移到 main.css。

- [ ] **步骤 3：装配 main.js**

为每行星、每点位、双子星 addTag；`loop.add(() => { tags.update(); points.update(t, camera); })`。

- [ ] **步骤 4：构建 + 浏览器验证**

运行：`npm run build` → 成功。
运行：`npm run dev`，确认：
- [ ] 5 个命名点位显示八面体核 + 朝向相机准星环
- [ ] 行星/点位/双子星名称标签贴合 3D 物体并随相机移动
- [ ] 无报错

- [ ] **步骤 5：提交**

```bash
git add src/scene/points.js src/ui/tags.js src/main.js src/styles/main.css
git commit -m "[scene][feat]: 物理点位与标签投影 / Add points and tag projection"
```

---

### 任务 11：飞船模型加载 + 引擎尾焰

**文件：**
- 创建：`public/models/ship.glb`（现成 CC0 模型）
- 创建：`src/ship/ship.js`
- 修改：`src/main.js`

- [ ] **步骤 1：放置飞船模型**

下载一个 CC0 低面数科幻飞船 `.glb`（来源 Poly Pizza / Quaternius / Sketchfab CC0），重命名为 `ship.glb` 放入 `public/models/`。要求文件 < 2MB。下载后用浏览器或 `https://gltf-viewer.donmccurdy.com/` 确认可正常打开。

- [ ] **步骤 2：写 ship.js**

`src/ship/ship.js`：

```js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function loadShip() {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load('./models/ship.glb', (gltf) => {
      const root = new THREE.Group();
      const model = gltf.scene;
      model.scale.setScalar(2);
      root.add(model);

      const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.6, 3, 16),
        new THREE.MeshBasicMaterial({ color: 0x7fd4ff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending })
      );
      flame.rotation.x = Math.PI / 2;
      flame.position.set(0, 0, 3);
      root.add(flame);

      root.position.set(0, 10, 120);
      function update(t) {
        flame.scale.y = 0.8 + Math.sin(t * 20) * 0.2;
      }
      resolve({ object: root, flame, update });
    }, undefined, reject);
  });
}
```

- [ ] **步骤 3：装配 main.js**

`const ship = await loadShip(); scene.add(ship.object); loop.add(ship.update);`

- [ ] **步骤 4：构建 + 浏览器验证**

运行：`npm run build` → 成功。
运行：`npm run dev`，确认：
- [ ] 飞船模型显示在场景中
- [ ] 引擎尾焰发光脉动
- [ ] 无加载报错

- [ ] **步骤 5：提交**

```bash
git add public/models/ship.glb src/ship/ship.js src/main.js
git commit -m "[ship][feat]: 加载飞船模型与引擎尾焰 / Load ship model"
```

---

### 任务 12：飞船控制（键鼠 + 触屏摇杆 + 软边界）

**文件：**
- 创建：`src/ship/controls.js`
- 修改：`src/main.js`

- [ ] **步骤 1：写 controls.js**

`src/ship/controls.js` 导出 `createShipControls(shipObject, domElement)`：
- 内部维护 `velocity`、`heading`（四元数）、`throttle`。
- 桌面：监听 `pointerdown/move/up` 拖拽改朝向；`keydown/up` 监听 W/S 改 throttle；`wheel` 微调。
- 触屏：在 `domElement` 上叠加左下虚拟摇杆 DOM（改朝向）+ 右下推进按钮 DOM（按住 throttle=1）。
- `update(dt)`：按 throttle 加速（`SHIP.accel`，上限 `SHIP.maxSpeed`），沿朝向前进，写 `shipObject.position`，再用 `softClampToSphere(pos, WORLD.boundRadius, 0.08)` 回正。
- 导出 `{ update, setEnabled(b), getState() }`（getState 返回 position/heading/speed 供 HUD）。

```js
import * as THREE from 'three';
import { SHIP, WORLD } from '../config.js';
import { softClampToSphere } from './bounds.js';

export function createShipControls(ship, dom) {
  let enabled = true;
  let throttle = 0;
  let speed = 0;
  const yaw = { x: 0, y: 0 };
  let dragging = false, lastX = 0, lastY = 0;

  dom.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; });
  window.addEventListener('pointerup', () => { dragging = false; });
  window.addEventListener('pointermove', (e) => {
    if (!dragging || !enabled) return;
    yaw.x -= (e.clientX - lastX) * SHIP.turnRate * 0.02;
    yaw.y -= (e.clientY - lastY) * SHIP.turnRate * 0.02;
    yaw.y = Math.max(-1.2, Math.min(1.2, yaw.y));
    lastX = e.clientX; lastY = e.clientY;
  });
  window.addEventListener('keydown', (e) => { if (e.key === 'w') throttle = 1; if (e.key === 's') throttle = -0.5; });
  window.addEventListener('keyup', (e) => { if (e.key === 'w' || e.key === 's') throttle = 0; });

  function update(dt) {
    if (!enabled) return;
    speed += (throttle * SHIP.maxSpeed - speed) * Math.min(1, dt * 2);
    const euler = new THREE.Euler(yaw.y, yaw.x, 0, 'YXZ');
    ship.quaternion.setFromEuler(euler);
    const fwd = new THREE.Vector3(0, 0, -1).applyEuler(euler);
    const next = {
      x: ship.position.x + fwd.x * speed,
      y: ship.position.y + fwd.y * speed,
      z: ship.position.z + fwd.z * speed
    };
    const c = softClampToSphere(next, WORLD.boundRadius, 0.08);
    ship.position.set(c.x, c.y, c.z);
  }
  return {
    update,
    setEnabled: (b) => { enabled = b; },
    getState: () => ({ position: ship.position, speed, yaw })
  };
}
```

> 触屏摇杆/推进按钮 DOM 在本步骤一并实现（在 controls.js 内创建 `.joystick`/`.throttle-btn` 元素并绑定 touch 事件，移动端写 yaw/throttle）。CSS 加入 main.css。

- [ ] **步骤 2：装配 main.js**

`const shipCtrl = createShipControls(ship.object, renderer.domElement); loop.add((t, dt) => shipCtrl.update(dt));`

- [ ] **步骤 3：构建 + 浏览器验证**

运行：`npm run build` → 成功。
运行：`npm run dev`，确认（桌面）：
- [ ] 拖拽改变飞船朝向
- [ ] 按 W 前进、S 后退，带惯性
- [ ] 飞船飞到边界被柔性拉回，不飞丢
- [ ] 移动端模拟器：摇杆 + 推进按钮可用

- [ ] **步骤 4：提交**

```bash
git add src/ship/controls.js src/main.js src/styles/main.css
git commit -m "[ship][feat]: 飞船控制与软边界约束 / Add ship controls"
```

---

### 任务 13：视角切换（舱内/出舱）+ 光粒子尾迹

**文件：**
- 创建：`src/ship/view-mode.js`
- 创建：`src/ship/trail.js`
- 修改：`src/main.js`

- [ ] **步骤 1：写 view-mode.js**

`src/ship/view-mode.js` 导出 `createViewMode(camera, ship)`：
- 状态 `mode` ∈ `'COCKPIT' | 'CHASE'`，默认 `'CHASE'`。
- `update(dt)`：根据 mode 把相机平滑 lerp 到目标位姿。
  - CHASE：相机位于飞船后上方（局部偏移 `(0, 6, 18)` 经飞船朝向变换），lookAt 飞船前方。
  - COCKPIT：相机位于飞船驾驶舱（局部偏移 `(0, 1.5, -1)`），lookAt 飞船前方。
- `toggle()` 切换 mode；导出 `{ update, toggle, getMode }`。

```js
import * as THREE from 'three';

export function createViewMode(camera, ship) {
  let mode = 'CHASE';
  const offset = { CHASE: new THREE.Vector3(0, 6, 18), COCKPIT: new THREE.Vector3(0, 1.5, -1) };
  const desired = new THREE.Vector3();
  const lookTarget = new THREE.Vector3();
  function update(dt) {
    const off = offset[mode].clone().applyQuaternion(ship.quaternion);
    desired.copy(ship.position).add(off);
    camera.position.lerp(desired, Math.min(1, dt * 4));
    const fwd = new THREE.Vector3(0, 0, -10).applyQuaternion(ship.quaternion);
    lookTarget.copy(ship.position).add(fwd);
    camera.lookAt(lookTarget);
  }
  return { update, toggle: () => { mode = mode === 'CHASE' ? 'COCKPIT' : 'CHASE'; }, getMode: () => mode };
}
```

- [ ] **步骤 2：写 trail.js（光粒子尾迹）**

`src/ship/trail.js` 导出 `createTrail(ship)`：维护 `SHIP.trailParticles` 个粒子的 `THREE.Points`，每帧把尾部粒子放到飞船尾部位置并向后扩散、逐渐变暗消散（近船密亮、远端散淡），加性混合。导出 `{ object, update }`。

```js
import * as THREE from 'three';
import { SHIP, COLOR } from '../config.js';

export function createTrail(ship) {
  const N = SHIP.trailParticles;
  const pos = new Float32Array(N * 3);
  const life = new Float32Array(N);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aLife', new THREE.BufferAttribute(life, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(COLOR.ICE) } },
    vertexShader: `attribute float aLife; varying float vL;
      void main(){ vL=aLife; gl_PointSize = 2.0 + aLife*4.0;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);}`,
    fragmentShader: `varying float vL; uniform vec3 uColor;
      void main(){ vec2 c=gl_PointCoord-0.5; if(length(c)>0.5) discard;
      gl_FragColor=vec4(uColor, vL*0.8); }`
  });
  const points = new THREE.Points(geo, mat);
  let head = 0;
  function update() {
    const back = new THREE.Vector3(0, 0, 3).applyQuaternion(ship.quaternion).add(ship.position);
    pos[head * 3] = back.x + (Math.random() - 0.5);
    pos[head * 3 + 1] = back.y + (Math.random() - 0.5);
    pos[head * 3 + 2] = back.z + (Math.random() - 0.5);
    life[head] = 1;
    for (let i = 0; i < N; i++) life[i] *= 0.96;
    head = (head + 1) % N;
    geo.attributes.position.needsUpdate = true;
    geo.attributes.aLife.needsUpdate = true;
  }
  return { object: points, update };
}
```

- [ ] **步骤 3：装配 main.js + 视角切换按钮**

加入视角切换按钮（DOM），点击调 `viewMode.toggle()`；`loop.add((t,dt)=>{ viewMode.update(dt); trail.update(); })`。

- [ ] **步骤 4：构建 + 浏览器验证**

运行：`npm run build` → 成功。
运行：`npm run dev`，确认：
- [ ] 默认出舱第三人称，可见飞船
- [ ] 点切换按钮 → 进入舱内第一人称
- [ ] 飞行时身后拖出光粒子尾迹（铺开扩散、逐渐消散）
- [ ] 无报错

- [ ] **步骤 5：提交**

```bash
git add src/ship/view-mode.js src/ship/trail.js src/main.js src/styles/main.css
git commit -m "[ship][feat]: 视角切换与光粒子尾迹 / Add view modes and trail"
```

---

### 任务 14：相机运镜 + 点击星球过渡动画

**文件：**
- 创建：`src/core/camera-rig.js`
- 修改：`src/main.js`

- [ ] **步骤 1：写 camera-rig.js**

`src/core/camera-rig.js` 导出 `createCameraRig(ship, shipCtrl)`：
- `flyTo(targetPos, onArrive)`：开始过渡，禁用 shipCtrl，用 `easeInOutCubic` 在 N 秒内把飞船从当前位置移动到目标星球附近的环绕点（target 旁偏移），途中放大尾迹速度感；到达后调用 `onArrive`，重新允许（或保持环绕）。
- `returnToOverview()`：飞回总览位姿，恢复 shipCtrl。
- `update(dt)`：推进过渡进度。
- 导出 `{ flyTo, returnToOverview, update, isFlying }`。

```js
import * as THREE from 'three';
import { easeInOutCubic } from './easing.js';

export function createCameraRig(ship, shipCtrl) {
  let active = false, p = 0, dur = 2.2;
  const from = new THREE.Vector3(), to = new THREE.Vector3();
  let onArrive = null;
  function flyTo(targetPos, cb) {
    from.copy(ship.position);
    const dir = targetPos.clone().normalize();
    to.copy(targetPos).addScaledVector(dir, 14);
    p = 0; active = true; onArrive = cb || null;
    shipCtrl.setEnabled(false);
  }
  function returnToOverview() {
    from.copy(ship.position);
    to.set(0, 30, 200);
    p = 0; active = true; onArrive = () => shipCtrl.setEnabled(true);
  }
  function update(dt) {
    if (!active) return;
    p = Math.min(1, p + dt / dur);
    const k = easeInOutCubic(p);
    ship.position.lerpVectors(from, to, k);
    if (p >= 1) { active = false; if (onArrive) onArrive(); }
  }
  return { flyTo, returnToOverview, update, isFlying: () => active };
}
```

- [ ] **步骤 2：装配点击拾取 main.js**

加 `THREE.Raycaster`，监听 canvas `click`：对 `planets.meshes` + 点位 items 做 `intersectObjects`；命中则 `rig.flyTo(hit.object.parent.position, () => gallery.open(planetId))`。`loop.add((t,dt)=>rig.update(dt))`。

- [ ] **步骤 3：构建 + 浏览器验证**

运行：`npm run build` → 成功。
运行：`npm run dev`，确认：
- [ ] 点击任意行星 → 飞船平滑运镜飞向该星球（缓动）
- [ ] 到达后停在星球附近环绕
- [ ] 控制台触发 open(planetId)
- [ ] 无报错

- [ ] **步骤 4：提交**

```bash
git add src/core/camera-rig.js src/main.js
git commit -m "[core][feat]: 相机运镜与点击星球过渡 / Add camera flyTo transition"
```

---

### 任务 15：星球内弧形时间线卡片画廊

**文件：**
- 创建：`src/ui/gallery.js`
- 修改：`src/main.js`、`src/styles/main.css`

- [ ] **步骤 1：写 gallery.js**

`src/ui/gallery.js` 导出 `createGallery(scene, camera, data)`：
- `open(planetId)`：查 `data.planets` 取 cards，用 `arcPositions(cards.length, 26, Math.PI*0.9)` 得到围绕该星球的弧形位置；为每卡片创建朝向相机的卡片对象：
  - image 卡：`THREE.Mesh(PlaneGeometry, MeshBasicMaterial{ map: TextureLoader.load(src) })`
  - video 卡：HTML `<video playsinline muted>` → `VideoTexture`，带播放角标
  - text 卡：用 CanvasTexture 把 title/body/date 画到平面
  - 加发光边框 + 缓慢自转 + 上下浮动
- `close()`：移除所有卡片对象。
- 点击卡片：lerp 放大到相机正前方居中（视频开始播放）；点空白处收回。
- `update(t)`：卡片朝向相机 + 浮动；维护放大状态。
- 导出 `{ open, close, update }`。

- [ ] **步骤 2：示例占位图**

在 `public/assets/sample/` 放 `travel-01.svg`、`food-01.svg`（简单 SVG 占位图，与 memories.json 引用一致）。

- [ ] **步骤 3：装配 main.js**

点击星球到达后 `onArrive` 调 `gallery.open(planetId)`；返回按钮调 `gallery.close()` + `rig.returnToOverview()`。`loop.add((t)=>gallery.update(t))`。

- [ ] **步骤 4：构建 + 浏览器验证**

运行：`npm run build` → 成功。
运行：`npm run dev`，确认：
- [ ] 飞抵星球后卡片沿弧形时间线在太空中铺开
- [ ] 图片/文字/视频卡正常显示，缓慢浮动
- [ ] 点击卡片放大居中、视频可播放
- [ ] 点空白收回
- [ ] 无报错

- [ ] **步骤 5：提交**

```bash
git add src/ui/gallery.js public/assets/sample src/main.js src/styles/main.css
git commit -m "[ui][feat]: 弧形时间线漂浮卡片画廊 / Add arc gallery"
```

---

### 任务 16：双风格 HUD + 导航 + 最终验证

**文件：**
- 创建：`src/ui/hud.js`
- 创建：`src/ui/nav.js`
- 修改：`src/main.js`、`src/styles/main.css`、`.trae/rules/project_rules.md`

- [ ] **步骤 1：写 hud.js（浪漫简约 / 科技冷蓝可切换）**

`src/ui/hud.js` 导出 `createHud(getState, getViewMode)`：创建固定定位 `.hud` 层，两套样式 class `.hud-soft`（默认：舷窗框 + 目标星球名 + cv/qq 标识）与 `.hud-tech`（雷达/坐标/速度数据线）。提供 `toggleStyle()` 切换；`update()` 写入 `getState()` 的速度/坐标。导出 `{ element, toggleStyle, update }`。

- [ ] **步骤 2：写 nav.js**

`src/ui/nav.js` 导出 `createNav({ onBack, onToggleView, onToggleHud })`：右上角"⟵ 返回星系"+ 视角切换 + HUD 风格切换按钮；加载进度条（首屏 GLTF 加载时显示）。导出 `{ element, setLoading }`。

- [ ] **步骤 3：装配 main.js**

接线全部回调：返回→gallery.close + rig.returnToOverview；视角→viewMode.toggle；HUD 风格→hud.toggleStyle。`loop.add(()=>hud.update())`。

- [ ] **步骤 4：填写 project_rules.md 技术栈字段**

把 `.trae/rules/project_rules.md` 中 `__TODO__` 替换为：
- 语言：JavaScript (ES2022)
- 框架：Three.js 0.160 + 原生 DOM
- 构建：`npm run build`
- 运行：`npm run dev`
- Formatter：Prettier（默认）
- Linter：`npm run lint`（ESLint）
- 测试框架：Vitest；运行：`npm run test`

- [ ] **步骤 5：全量验证**

运行：`npm run test`（预期：easing/bounds/gallery-layout/loader 全部 PASS）
运行：`npm run lint`（预期：无 error）
运行：`npm run build`（预期：成功）
运行：`npm run dev`，完整体验确认：
- [ ] 默认浪漫 HUD，可切换科技冷蓝
- [ ] 出舱/舱内视角切换正常
- [ ] 半自由驾驶 + 点击星球运镜飞抵 + 卡片画廊 + 返回 全链路通畅
- [ ] iOS 模拟器：摇杆/推进/触控正常，无溢出，安全区留白正确
- [ ] 无报错

- [ ] **步骤 6：提交**

```bash
git add src/ui/hud.js src/ui/nav.js src/main.js src/styles/main.css .trae/rules/project_rules.md
git commit -m "[ui][feat]: 双风格HUD与导航并完成第一期 / Add HUD nav and finish phase 1"
```

---

## 自我评审记录

**1. 规格覆盖：**
- 飞船 .glb 加载 → 任务 11 ✅
- 舱内 HUD / 出舱第三人称视角切换 → 任务 13（视角）+ 任务 16（HUD 风格）✅
- HUD 双风格可切换/融合 → 任务 16 ✅
- 半自由飞行 + 软边界 → 任务 4（纯函数）+ 任务 12（控制）✅
- 点击星球过渡动画 → 任务 14 ✅
- 弧形时间线漂浮卡片画廊 + 点中心放大 → 任务 5（布局）+ 任务 15 ✅
- 光粒子轨道光路 → 任务 9（orbit-path）✅
- 光粒子尾迹 → 任务 13（trail）✅
- 静态 JSON 数据模型 + 校验 → 任务 6 ✅
- 场景元素迁移（太阳/银河/星云/双子星/彗星/点位/标签）→ 任务 8、10 ✅
- iOS 适配 → 任务 7（CSS）+ 任务 12（触屏）+ 任务 16（验证）✅
- Vite 工程结构 → 任务 1、7 ✅

**2. 占位符扫描：** 无 TBD/TODO 作为"待补"出现；任务 8/10/15 用文字描述迁移映射但均指明确切来源函数（样板）+ 接口契约 + 关键参数，属可执行迁移说明而非占位。

**3. 类型一致性：**
- `softClampToSphere(pos, radius, strength)` 定义（任务 4）与调用（任务 12）一致 ✅
- `arcPositions(count, radius, span)` 定义（任务 5）与调用（任务 15）一致 ✅
- `easeInOutCubic` 定义（任务 3）与调用（任务 14 camera-rig）一致 ✅
- `createOrbitPath(radius, color)` 定义/调用一致；`createPlanets` 返回 `meshes` 供任务 14 raycaster 一致 ✅
- `loadMemories()` / `validateMemories(data)`（任务 6）与 main 装配（任务 9）一致 ✅
- `flyTo(targetPos, onArrive)` / `returnToOverview()`（任务 14）与 gallery `open/close`（任务 15）接线一致 ✅

自审通过。

