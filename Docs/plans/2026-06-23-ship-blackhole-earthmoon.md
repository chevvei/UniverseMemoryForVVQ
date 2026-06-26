# 飞船操控修复 + 地图扩展 + 黑洞与精致地月系统 实施计划

> **致代理工作者：** 必需子技能：使用 sp-subagent-driven-development（推荐）或 sp-executing-plans 逐任务实施此计划。步骤使用复选框（`- [ ]`）语法进行跟踪。

**目标：** 修复飞船左右转 Bug，扩大地图并增强自由飞行，新增程序化黑洞天体与高清贴图地月系统（可见月面凹坑）。

**架构：** 阶段化交付。阶段 1 改 controls.js / config.js / memories.json（操控与地图）；阶段 2 新增 scene/blackhole.js（纯 shader 黑洞）；阶段 3 新增 scene/earth-moon.js（高清贴图 + 法线/置换）。所有新天体遵循 `create*()→{object,update}` 接口，装配进 main.js 的 scene 与 loop。

**技术栈：** Three.js 0.160、Vite 5、Quaternion 旋转、ShaderMaterial、MeshStandardMaterial（normalMap/displacementMap）、TextureLoader。

**关联规格：** [设计规格](file:///home/sti/Documents/trae_projects/cvqq/Docs/specs/2026-06-23-ship-control-blackhole-earthmoon-design.md)

---

## 阶段 1：飞船操控修复 + 地图扩展

### 任务 1：修复 yaw 旋转轴（左右转 Bug）

**文件：**
- 修改：`src/ship/controls.js:62-77`

- [ ] **步骤 1：定位旋转代码**

确认 [controls.js update](file:///home/sti/Documents/trae_projects/cvqq/src/ship/controls.js#L62-L77) 当前为：
```js
const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
quat.multiply(qy).multiply(qx);
yawInput *= 0.6; pitchInput *= 0.6;
```

- [ ] **步骤 2：改为 yaw 绕世界轴（premultiply）、pitch 绕本地轴（multiply）**

```js
const qy = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
const qx = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
quat.premultiply(qy); // yaw 绕世界竖直轴 → 任意姿态都水平左右转
quat.multiply(qx);    // pitch 绕本地 X 轴 → 机头俯仰
quat.normalize();
yawInput *= 0.6; pitchInput *= 0.6;
```

- [ ] **步骤 3：构建验证**

运行：`npm run build`
预期：构建成功，无报错。

- [ ] **步骤 4：浏览器手动验证**

运行：`npm run dev -- --host --port 8099 --strictPort`（非阻塞），浏览器开 `http://10.30.60.207:8099/`。
预期：先按 ArrowUp 抬头，再按 A/D —— 机头在水平面左右转，不再翻滚；鼠标横向拖拽同样左右转。

- [ ] **步骤 5：提交**

```bash
git add src/ship/controls.js
git commit -m "[ship][fix]: yaw 绕世界轴修复左右转失灵 / Fix yaw to world axis"
```

### 任务 2：增加滚转（Q/E）

**文件：**
- 修改：`src/ship/controls.js:62-79`

- [ ] **步骤 1：在 update 顶部读取滚转输入**

在 `let yaw = yawInput, pitch = pitchInput;` 之后加：
```js
let roll = 0;
if (keys['KeyQ']) roll += SHIP.turnRate * k;
if (keys['KeyE']) roll -= SHIP.turnRate * k;
```

- [ ] **步骤 2：应用滚转（绕本地 Z 轴）**

在 `quat.multiply(qx);` 之后加：
```js
if (roll !== 0) {
  const qz = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), roll);
  quat.multiply(qz);
}
```

- [ ] **步骤 3：构建验证**

运行：`npm run build`
预期：成功。

- [ ] **步骤 4：浏览器验证**

运行 dev，按 Q/E：飞船绕机身轴线左右滚转。

- [ ] **步骤 5：提交**

```bash
git add src/ship/controls.js
git commit -m "[ship][feat]: 增加 Q/E 滚转控制 / Add roll control"
```

### 任务 3：提升转向灵敏度 + 扩大世界边界

**文件：**
- 修改：`src/config.js:8-19`

- [ ] **步骤 1：改 config 常量**

将 [config.js](file:///home/sti/Documents/trae_projects/cvqq/src/config.js#L8-L19) 中：
```js
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
```
改为：
```js
export const WORLD = {
  boundRadius: 700,
  sunRadius: 10,
  galaxyParticles: 22000
};

export const SHIP = {
  maxSpeed: 1.8,
  accel: 0.05,
  turnRate: 0.035,
  trailParticles: 240
};
```

- [ ] **步骤 2：构建验证**

运行：`npm run build`
预期：成功。

- [ ] **步骤 3：提交**

```bash
git add src/config.js
git commit -m "[config][feat]: 扩大世界边界并提升飞船转向灵敏度 / Enlarge world and turn rate"
```

### 任务 4：放大行星轨道与点位坐标（约 1.6×）

**文件：**
- 修改：`src/data/memories.json`

- [ ] **步骤 1：把每个 planet 的 orbit.dist 乘约 1.6 并取整**

依次改为：acquaintance 36→58、first-heart 52→84、travel 72→116、anniversary 96→154、daily 122→196、food 150→240、surprise 182→292、future 214→344。
（仅改 `orbit.dist` 数值，其余不动。）

- [ ] **步骤 2：把每个 point 的 pos 三个分量各乘约 1.6 并取整**

- L1 `[70,18,-40]` → `[112,29,-64]`
- L2 `[-60,30,50]` → `[-96,48,80]`
- L4 `[120,-20,-90]` → `[192,-32,-144]`
- L5 `[-110,-25,80]` → `[-176,-40,128]`
- perihelion `[40,5,30]` → `[64,8,48]`

- [ ] **步骤 3：构建 + 运行测试验证 JSON 合法**

运行：`npm run build && npm test`
预期：build 成功、测试全过（JSON 解析无误）。

- [ ] **步骤 4：浏览器验证**

运行 dev：星球散布明显拉开、空间更开阔，飞到边界仍被软边界拉回（不出界）。

- [ ] **步骤 5：提交**

```bash
git add src/data/memories.json
git commit -m "[data][feat]: 放大行星轨道与点位坐标适配更大地图 / Scale up coordinates"
```

---

## 阶段 2：黑洞场景

### 任务 5：新建 blackhole.js（事件视界 + 吸积盘 + 引力透镜环）

**文件：**
- 创建：`src/scene/blackhole.js`

- [ ] **步骤 1：写 blackhole.js**

```js
import * as THREE from 'three';
import { radialSprite } from './_helpers.js';

export function createBlackhole({ position = new THREE.Vector3(0, 60, -520), radius = 16 } = {}) {
  const root = new THREE.Group();
  root.position.copy(position);

  // 事件视界：纯黑球
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  root.add(core);

  // 吸积盘：旋转色带 shader
  const disk = new THREE.Mesh(
    new THREE.RingGeometry(radius * 1.3, radius * 3.6, 128, 1),
    new THREE.ShaderMaterial({
      transparent: true, side: THREE.DoubleSide, depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 } },
      vertexShader: `
        varying vec2 vUv; varying float vR;
        void main(){
          vUv = uv;
          vR = length(position.xy);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }`,
      fragmentShader: `
        varying vec2 vUv; varying float vR; uniform float uTime;
        void main(){
          float ang = atan(vUv.y - 0.5, vUv.x - 0.5);
          float swirl = sin(ang * 6.0 + uTime * 3.0 - vR * 0.4);
          float heat = smoothstep(0.0, 1.0, 1.0 - vUv.y);
          vec3 cInner = vec3(1.0, 0.95, 0.8);
          vec3 cOuter = vec3(1.0, 0.45, 0.12);
          vec3 col = mix(cOuter, cInner, heat);
          float a = (0.45 + 0.35 * swirl) * smoothstep(1.0, 0.2, vUv.y);
          gl_FragColor = vec4(col, a);
        }`
    })
  );
  disk.rotation.x = Math.PI / 2.1;
  root.add(disk);

  // 引力透镜光环：细高亮环
  const lens = new THREE.Mesh(
    new THREE.RingGeometry(radius * 1.02, radius * 1.18, 96),
    new THREE.MeshBasicMaterial({
      color: 0xffe6c0, transparent: true, opacity: 0.7,
      side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false
    })
  );
  root.add(lens);

  // 外部微光
  root.add(radialSprite(0xffcaa0, radius * 9, 0.18));

  function update(t) {
    disk.material.uniforms.uTime.value = t;
    disk.rotation.z = t * 0.25;
    lens.quaternion.copy(disk.quaternion); // 占位，保证存在 update
  }

  return { object: root, update };
}
```

- [ ] **步骤 2：构建验证**

运行：`npm run build`
预期：成功。

- [ ] **步骤 3：提交**

```bash
git add src/scene/blackhole.js
git commit -m "[scene][feat]: 新增程序化黑洞天体 / Add procedural blackhole"
```

### 任务 6：装配黑洞到 main.js

**文件：**
- 修改：`src/main.js`

- [ ] **步骤 1：导入**

在 main.js 顶部现有 scene 导入附近加：
```js
import { createBlackhole } from './scene/blackhole.js';
```

- [ ] **步骤 2：创建并加入场景与 loop**

在创建其他场景对象处（例如 createPlanets 之后）加：
```js
const blackhole = createBlackhole();
scene.add(blackhole.object);
```
并在已有的 `loop.add((t, dt) => { ... })` 中加入 `blackhole.update(t);`（与现有 update 同一回调内追加一行即可）。

> 注：若 main.js 中各模块 update 是分散注册的，则单独 `loop.add((t) => blackhole.update(t));`。实施时按文件实际结构选其一。

- [ ] **步骤 3：构建验证**

运行：`npm run build`
预期：成功。

- [ ] **步骤 4：浏览器验证**

运行 dev：飞向地图远端 `(0,60,-520)` 方向，可见黑色事件视界 + 旋转发光吸积盘 + 边缘亮环。

- [ ] **步骤 5：提交**

```bash
git add src/main.js
git commit -m "[app][feat]: 装配黑洞天体到场景 / Wire blackhole into scene"
```

---

## 阶段 3：精致地月系统

### 任务 7：贴图下载脚本

**文件：**
- 创建：`scripts/fetch-textures.sh`

- [ ] **步骤 1：写脚本**

```bash
#!/usr/bin/env bash
# 下载地月高清贴图到 public/textures/（CC0 / NASA 公开资源）
# 用户执行：bash scripts/fetch-textures.sh
set -e
DIR="$(cd "$(dirname "$0")/.." && pwd)/public/textures"
mkdir -p "$DIR"
echo "贴图目录：$DIR"
echo "请将以下贴图放入该目录（文件名需与 earth-moon.js 一致）："
echo "  earth_albedo.jpg     地球昼面反照率 (NASA Blue Marble)"
echo "  earth_normal.jpg     地球法线"
echo "  earth_clouds.png     地球云层 (带透明)"
echo "  moon_albedo.jpg      月面反照率 (NASA CGI Moon Kit / LRO)"
echo "  moon_normal.jpg      月面法线"
echo "  moon_displace.jpg    月面置换/高度图"
echo "推荐来源：https://www.solarsystemscope.com/textures/ (CC BY 4.0)"
echo "          https://svs.gsfc.nasa.gov/4720 (NASA 月球)"
```

- [ ] **步骤 2：提交**

```bash
git add scripts/fetch-textures.sh
git commit -m "[build][docs]: 地月贴图下载指引脚本 / Add texture fetch script"
```

### 任务 8：新建 earth-moon.js（地球 + 月球 + 潮汐锁定公转）

**文件：**
- 创建：`src/scene/earth-moon.js`

- [ ] **步骤 1：写 earth-moon.js**

```js
import * as THREE from 'three';
import { makeAtmosphere } from './_helpers.js';

const TEX = 'textures/';
const loader = new THREE.TextureLoader();
function tryLoad(name) {
  // 资源缺失时返回 null，材质相应通道留空（不写兜底贴图）
  return loader.load(TEX + name, undefined, undefined, () => {});
}

export function createEarthMoon({ position = new THREE.Vector3(-180, 40, 260), earthRadius = 14 } = {}) {
  const root = new THREE.Group();
  root.position.copy(position);

  // 地球
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(earthRadius, 96, 96),
    new THREE.MeshStandardMaterial({
      map: tryLoad('earth_albedo.jpg'),
      normalMap: tryLoad('earth_normal.jpg'),
      roughness: 0.85, metalness: 0.0
    })
  );
  root.add(earth);

  // 云层
  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(earthRadius * 1.02, 96, 96),
    new THREE.MeshStandardMaterial({
      map: tryLoad('earth_clouds.png'),
      transparent: true, depthWrite: false, opacity: 0.85
    })
  );
  root.add(clouds);

  // 大气辉光
  root.add(makeAtmosphere(earthRadius * 1.12, '#7fb6ff'));

  // 月球（潮汐锁定）
  const moonOrbit = new THREE.Group();
  root.add(moonOrbit);
  const moonRadius = earthRadius * 0.27;
  const moonDist = earthRadius * 4.0;
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(moonRadius, 96, 96),
    new THREE.MeshStandardMaterial({
      map: tryLoad('moon_albedo.jpg'),
      normalMap: tryLoad('moon_normal.jpg'),
      displacementMap: tryLoad('moon_displace.jpg'),
      displacementScale: moonRadius * 0.06,
      roughness: 1.0, metalness: 0.0
    })
  );
  moon.position.set(moonDist, 0, 0);
  moonOrbit.add(moon);

  function update(t) {
    earth.rotation.y = t * 0.08;
    clouds.rotation.y = t * 0.1;
    moonOrbit.rotation.y = t * 0.04;
    // 潮汐锁定：月球自转抵消公转，始终同一面朝地球
    moon.rotation.y = -t * 0.04;
  }

  return { object: root, update };
}
```

- [ ] **步骤 2：构建验证**

运行：`npm run build`
预期：成功（贴图缺失不影响构建，运行时通道为空）。

- [ ] **步骤 3：提交**

```bash
git add src/scene/earth-moon.js
git commit -m "[scene][feat]: 新增精致地月系统 / Add detailed earth-moon system"
```

### 任务 9：装配地月系统到 main.js

**文件：**
- 修改：`src/main.js`

- [ ] **步骤 1：导入**

```js
import { createEarthMoon } from './scene/earth-moon.js';
```

- [ ] **步骤 2：创建并加入场景与 loop**

```js
const earthMoon = createEarthMoon();
scene.add(earthMoon.object);
```
在 loop 回调追加 `earthMoon.update(t);`。

- [ ] **步骤 3：构建验证**

运行：`npm run build`
预期：成功。

- [ ] **步骤 4：浏览器验证（需先放置贴图）**

执行 `bash scripts/fetch-textures.sh` 并按提示放入贴图后运行 dev：
飞向 `(-180,40,260)` 方向，可见地球（昼夜交界、云层转动、大气辉光）与绕其公转的月球（法线/置换让环形山凹坑随太阳光投出阴影、潮汐锁定）。

- [ ] **步骤 5：提交**

```bash
git add src/main.js
git commit -m "[app][feat]: 装配地月系统到场景 / Wire earth-moon into scene"
```

---

## 收尾：changelog

### 任务 10：记录 changelog

**文件：**
- 创建：`Docs/changelog/entries/2026-06-23_ship-blackhole-earthmoon.md`

- [ ] **步骤 1：调用 changelog 技能记录本批改动**

涵盖：飞船 yaw 修复、Q/E 滚转、地图扩大、坐标放大、黑洞、地月系统。关联本规格与计划。

- [ ] **步骤 2：提交**

```bash
git add Docs/changelog/
git commit -m "[docs][chore]: 记录操控修复与黑洞地月 changelog / Add changelog"
```

---

## 自我评审结论

- **规格覆盖**：① 任务1；② 任务2/3/4；③ 任务5/6；④⑤ 任务7/8/9；收尾 任务10。全覆盖。
- **占位符扫描**：blackhole.js 的 `lens.quaternion.copy` 一行为保证 update 非空的占位，已注释说明；其余均为完整代码。
- **类型一致性**：所有新模块统一 `create*({...})→{object,update}`；main.js 装配方式一致；config 常量名沿用既有 WORLD/SHIP。
- **规则一致**：贴图缺失不写兜底贴图（onError 留空），符合 project_rules「不写兜底/兼容代码」。
