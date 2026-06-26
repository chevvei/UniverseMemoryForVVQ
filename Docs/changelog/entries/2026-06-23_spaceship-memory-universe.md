# 实现飞船驾驶宇宙记忆站全功能（16 任务一次到位）

- 日期：2026-06-23
- 类型：feature
- 涉及模块：app（src/main.js）、core（renderer/loop/camera-rig/easing）、scene（starfield/galaxy/nebula/sun/twins/comets/planets/points/orbit-path/_helpers）、ship（ship/controls/view-mode/trail/bounds）、ui（gallery/gallery-layout/tags/hud/nav）、data（loader/memories.json）、build（package.json/vite.config.js/eslint.config.js）、docs（project_rules.md）
- 关联需求：[设计规格](file:///home/sti/Documents/trae_projects/cvqq/Docs/specs/2026-06-23-universe-memory-design.md)、[实施计划](file:///home/sti/Documents/trae_projects/cvqq/Docs/plans/2026-06-23-universe-memory.md)
- 关联 commit：feat/spaceship-memory-universe 分支首个功能提交

## 1. 背景 / 触发原因
延续 preview/index.html 已确认的双星融合视觉，按 bruno-simon.com 风格升级为"宇航员驾驶宇宙飞船"游戏化交互：自由航行星系、点击星球过渡飞入、星球内弧形时间线漂浮卡片画廊。用户指令"确认无误，开始实施，直接一步到位，然后开始调试"。

## 2. 改了什么（What）
- 工程脚手架：[package.json](file:///home/sti/Documents/trae_projects/cvqq/package.json)、[vite.config.js](file:///home/sti/Documents/trae_projects/cvqq/vite.config.js)、[eslint.config.js](file:///home/sti/Documents/trae_projects/cvqq/eslint.config.js)、[index.html](file:///home/sti/Documents/trae_projects/cvqq/index.html)
- 纯函数+单测：[easing.js](file:///home/sti/Documents/trae_projects/cvqq/src/core/easing.js)、[bounds.js](file:///home/sti/Documents/trae_projects/cvqq/src/ship/bounds.js)、[gallery-layout.js](file:///home/sti/Documents/trae_projects/cvqq/src/ui/gallery-layout.js)、[loader.js](file:///home/sti/Documents/trae_projects/cvqq/src/data/loader.js)
- 场景模块：星空/银河（22000 粒子 shader 闪烁）/星云/双星太阳/彗星/数据驱动行星（Fresnel 辉光+土星环）/物理点位/光粒子轨道光路
- 飞船系统：程序化飞船+引擎尾焰、半自由飞行控制（键鼠+触屏摇杆/推进）、舱内/出舱视角切换、光粒子尾迹
- 交互：相机运镜 flyTo/returnTo、Raycaster 点击拾取、弧形时间线漂浮卡片画廊（text/image/video）、双风格 HUD（浪漫/科技）、导航与加载

## 3. 怎么改的（How）
- 统一 `create*() → { object, update }` 接口，main.js 注册到 createLoop 统一驱动。
- 飞船 .glb 计划项改为程序化 primitives 构建（CapsuleGeometry 机身+ConeGeometry 机首+玻璃座舱+加性混合尾焰），无需外网二进制依赖即可全链路跑通；后续可替换为真实 .glb。
- 软边界 softClampToSphere 约束飞行范围；点击星球时 controls.setEnabled(false)→rig.flyTo→gallery.open。

## 4. 怎么用（Usage）
- 开发：`npm run dev`（默认 8099，占用时自动 8100）
- 桌面：WASD 推进/转向、方向键俯仰、鼠标拖拽转向；移动端：左下摇杆+右下推进按钮
- 点击星球/点位 → 飞入 → 卡片画廊；点卡片放大；"返回宇宙"退出
- 右上角：视角切换、HUD 风格切换

## 5. 影响面 / 风险
- 首次完整工程，无向后兼容问题。
- 打包 532KB（gzip 138KB），Three.js 体积所致，后续可 manualChunks 分包。
- 飞船为程序化模型，非最终美术资产。

## 6. 验证（Verification）
- 测试：`npm test` → 12 passed（easing/bounds/gallery-layout/loader）
- Lint：`npm run lint` → 0 error 0 warning
- 构建：`npm run build` → ✓ built，40 modules
- 运行：`npm run dev` → http://localhost:8100/ 无浏览器报错，服务器稳定

## 7. 关联
- 后续 TODO：替换真实飞船 .glb；网页内上传+浏览器压缩+云存储（第二期）；部署平台落地（EdgeOne Pages）；站名最终确定
