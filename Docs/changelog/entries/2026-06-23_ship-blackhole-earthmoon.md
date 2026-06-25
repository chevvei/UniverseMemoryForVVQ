# 飞船操控修复 + 地图扩展 + 黑洞与精致地月系统

- 日期：2026-06-23
- 类型：feature（含 bugfix）
- 涉及模块：ship（controls）、config、scene（blackhole/earth-moon）、data（memories.json）、app（main.js）、build（scripts）
- 关联需求：用户「飞船不能左转右转、将地图变大、增加黑洞场景、真实地球和月亮看清月面凹坑」
- 关联 commit：c8a8b1e（操控）、9e992c6 + 3234485（黑洞 + 地月）

## 1. 背景 / 触发原因
飞船俯仰后左右转失灵（只能上下）；地图偏小；需新增黑洞与精致地月系统，月面要能看清环形山凹坑。经可视化伴侣确认采纳全部方案，分 3 阶段实施。

## 2. 改了什么（What）
- [controls.js](file:///home/sti/Documents/trae_projects/cvqq/src/ship/controls.js)：yaw 旋转轴修复 + Q/E 滚转
- [config.js](file:///home/sti/Documents/trae_projects/cvqq/src/config.js)：boundRadius 320→700、turnRate 0.025→0.035、maxSpeed 1.4→1.8
- [memories.json](file:///home/sti/Documents/trae_projects/cvqq/src/data/memories.json)：行星轨道与点位坐标放大约 1.6×
- [blackhole.js](file:///home/sti/Documents/trae_projects/cvqq/src/scene/blackhole.js)：新增程序化黑洞
- [earth-moon.js](file:///home/sti/Documents/trae_projects/cvqq/src/scene/earth-moon.js)：新增精致地月系统
- [fetch-textures.sh](file:///home/sti/Documents/trae_projects/cvqq/scripts/fetch-textures.sh)：地月贴图下载指引
- [main.js](file:///home/sti/Documents/trae_projects/cvqq/src/main.js)：装配黑洞与地月

## 3. 怎么改的（How）
- **左右转 Bug 根因**：yaw 与 pitch 都用 `quat.multiply()`（本地轴累乘），俯仰后 yaw 绕倾斜的本地 Y 轴，左右转被扭成翻滚。
```diff
- quat.multiply(qy).multiply(qx);
+ quat.premultiply(qy); // yaw 绕世界竖直轴
+ quat.multiply(qx);    // pitch 绕本地 X 轴
+ quat.normalize();
```
- **黑洞**：纯黑事件视界 + ShaderMaterial 旋转吸积盘（橙红→白热渐变流动）+ 引力透镜光环，无外部模型。
- **地月（方案 X）**：高清贴图 + 法线/置换贴图在普通球体上呈现凹坑随光影投影；月球潮汐锁定公转；地球昼夜交界 + 云层 + 大气辉光。贴图缺失时通道留空（不写兜底贴图）。

## 4. 怎么用（Usage）
- 飞行：A/D 或鼠标横向=水平左右转、方向键上下=俯仰、Q/E=滚转、W/S=推进。
- 地月需先 `bash scripts/fetch-textures.sh` 按指引放入贴图到 `public/textures/`。

## 5. 影响面 / 风险
- 地图扩大后早期飞行距离变长（属预期）。
- 地月贴图缺失时仅显示纯色球体，不报错。

## 6. 验证（Verification）
- 构建：`npm run build` ✓
- 测试：`npm test` 18 passed
- Lint：`npm run lint` 0 错误
- 待用户浏览器手动验证操控手感与天体视觉。

## 7. 关联
- [设计规格](file:///home/sti/Documents/trae_projects/cvqq/Docs/specs/2026-06-23-ship-control-blackhole-earthmoon-design.md)
- [实施计划](file:///home/sti/Documents/trae_projects/cvqq/Docs/plans/2026-06-23-ship-blackhole-earthmoon.md)
- 后续 TODO：用户下载地月贴图后验证月面凹坑效果。
