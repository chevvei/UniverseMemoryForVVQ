# 双星水晶幻境视觉增强

- 日期：2026-06-25
- 类型：feature
- 涉及模块：scene, ship, core, ui, styles
- 关联需求：AGENTS.md §炫酷 3D + iOS 友好
- 关联 commit：见提交日志

## 1. 背景 / 触发原因
用户要求"用 three.js 做出更加炫酷的界面"，选定方案 A 双星水晶幻境（ICE 蓝 + ROSE 粉双色主题），一次性全上 4 方向：3D 场景特效 + UI 面板样式 + 过渡动画 + 新增天体奇观。

## 2. 改了什么（What）
新增文件：
- [src/core/warp-effect.js](file:///home/sti/Documents/trae_projects/cvqq/src/core/warp-effect.js) — 超光速跃迁径向模糊后处理
- [src/scene/crystal-burst.js](file:///home/sti/Documents/trae_projects/cvqq/src/scene/crystal-burst.js) — 水晶碎裂爆开过渡
- [src/scene/meteors.js](file:///home/sti/Documents/trae_projects/cvqq/src/scene/meteors.js) — 双色流星雨

修改文件：
- [src/scene/nebula.js](file:///home/sti/Documents/trae_projects/cvqq/src/scene/nebula.js) — 从 sprite 升级为双色粒子云（蓝/粉/金 3 簇）
- [src/scene/planets.js](file:///home/sti/Documents/trae_projects/cvqq/src/scene/planets.js) — 土星环加光环粒子
- [src/ship/ship.js](file:///home/sti/Documents/trae_projects/cvqq/src/ship/ship.js) — 能量护盾（加速时淡蓝脉冲球壳）
- [src/ui/gallery.js](file:///home/sti/Documents/trae_projects/cvqq/src/ui/gallery.js) — 玻璃拟态卡片 + 聚焦光晕（邻卡淡出）
- [src/ui/nav.js](file:///home/sti/Documents/trae_projects/cvqq/src/ui/nav.js) — 加载文案星河汇聚
- [src/styles/main.css](file:///home/sti/Documents/trae_projects/cvqq/src/styles/main.css) — 全息扫描线 + HUD 呼吸边框 + 按钮双色脉冲
- [src/main.js](file:///home/sti/Documents/trae_projects/cvqq/src/main.js) — 装配新场景对象 + warp 速度判定 + 水晶碎裂触发

## 3. 怎么改的（How）
### 3D 场景特效
- warp：飞船速度 >85% maxSpeed 时，全屏径向速度线 shader（AdditiveBlending，平滑过渡）
- 水晶碎裂：进入画廊时从行星中心爆出 60 个双色粒子，速度衰减 + 生命淡出
- 双色星云：3 簇粒子云（蓝 800 + 粉 800 + 金 500），ShaderMaterial 柔化 + 呼吸闪烁
- 能量护盾：BackSide 球壳，throttle > 0.3 时显现，正弦脉冲

### UI 面板样式
- 玻璃卡片：圆角 + 渐变背景 + 顶部高光 + 双色流光描边 + 内发光 shadowBlur + 底部双色装饰线
- HUD：repeating-linear-gradient 扫描线 overlay + hud-breathe 呼吸动画（蓝↔粉边框）
- 按钮脉冲：:active 时双色 box-shadow

### 过渡动画
- 卡片聚焦：paused 时 focusBoost 1.8× + 邻卡 opacity 降至 0.15
- 加载文案：星河汇聚中 → 星系已点亮

### 天体奇观
- 流星雨：8 颗双色流星，Line 拖尾 + AdditiveBlending，循环重生
- 土星环粒子：120 个 Points 环绕行星

## 4. 怎么用（Usage）
无用户操作。飞船加速到 85%+ 触发 warp 拖影；点击星球进入时水晶碎裂爆开；星云/流星/彗星在宇宙中可见；卡片玻璃拟态 + 聚焦光晕；HUD 扫描线 + 呼吸边框。

## 5. 影响面 / 风险
- 向后兼容：是
- 性能影响：新增粒子 ~4000（星云 2100 + 流星 8×40 + 碎裂 60 + 土星环 120），配合 pixelRatio 1.5 优化，iOS 可承受
- warp shader 仅高速时启用，静止时无开销

## 6. 验证（Verification）
- 构建：`npm run build` 通过（dist 647KB）
- Lint：`npm run lint` 0 错误 0 warning
- 测试：`npm test` 18 passed（5 files）

## 7. 关联
- 设计规格：[2026-06-25-crystal-fantasy-visual-design.md](../specs/2026-06-25-crystal-fantasy-visual-design.md)
- 后续 TODO：如 iOS 仍卡可降低流星数量/星云粒子数；可加视锥剔除
