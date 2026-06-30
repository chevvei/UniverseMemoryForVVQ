# 双星水晶幻境·视觉增强设计规格

- 日期：2026-06-25
- 主题：3D 场景特效 + UI 面板样式 + 过渡动画 + 新增天体奇观（一次性全上）
- 风格方案：A 双星水晶幻境（ICE 蓝 #7fd4ff cv + ROSE 粉 #ff9ec4 qq 双色主题）
- 关联：AGENTS.md §炫酷 3D + iOS 友好；上一轮 iOS 性能优化（pixelRatio 1.5、分段降低）基础上叠加

## 1. 设计目标
在刚完成性能优化（降分段/像素比/粒子数）的基础上，叠加 4 方向视觉增强，保持 iOS 流畅。全部用 Points/Sprite/简单 shader，不用 raymarching；新增粒子总量控制在 ~4000 以内。

## 2. 第 1 节 · 3D 场景特效

### 2.1 超光速跃迁拖影（warp）
- 触发：飞船速度 > 85% maxSpeed
- 尾迹升级：双色（蓝/粉）拉伸光带
- 背景星点拉成短线（star streaks）
- 画面径向模糊（全屏单 pass shader）
- 文件：src/ship/trail.js（升级）、src/scene/starfield.js（streaks）、新增 src/core/warp-effect.js

### 2.2 行星进入穿越过渡
- 点星球进画廊时：水晶碎片向四周爆裂扩散
- 画廊从中心绽放展开（现有 scale 0.2→1 基础上加碎裂过渡层）
- 文件：src/ui/gallery.js（open 动画增强）、新增 src/scene/crystal-burst.js

### 2.3 双色星云
- 地图 3 处放程序化粒子云（蓝/粉双色 Points + AdditiveBlending + 柔化 shader）
- 远处观赏
- 文件：新增 src/scene/nebula.js

### 2.4 能量护盾
- 飞船外圈淡蓝半透明球壳
- 加速时显现脉冲
- 文件：src/ship/ship.js

## 3. 第 2 节 · UI 面板样式

### 3.1 玻璃拟态记忆卡片
- CanvasTexture 升级：圆角、玻璃高光、双色流光描边动画
- 文件：src/ui/gallery.js textCard()

### 3.2 全息 HUD
- 扫描线 overlay + 双色呼吸边框
- tech 模式速度/坐标仪表盘实时显示
- 文件：src/styles/main.css、src/ui/nav.js

### 3.3 导航按钮脉冲
- 按下时双色脉冲（移动端替代 hover）
- 文件：src/styles/main.css

### 3.4 加载/进入升级
- 进度条粒子流，进入按钮光环增强
- 文件：src/ui/nav.js createLoading()、src/styles/main.css

## 4. 第 3 节 · 过渡动画

### 4.1 进入遮罩折叠
- 星河汇聚→展开（粒子从四周汇聚成银河再绽放），替代现有纯淡出
- 文件：src/ui/nav.js createLoading()、src/scene/starfield.js

### 4.2 卡片聚焦动画
- focusCard 时缩放 + 径向光晕 + 邻卡淡出
- 文件：src/ui/gallery.js

### 4.3 画廊绽放
- open 时碎裂扩散过渡
- 文件：src/ui/gallery.js

## 5. 第 4 节 · 新增天体奇观

### 5.1 双色星云（同 2.3）

### 5.2 流星雨
- 随机流星拖尾划过夜空
- 文件：新增 src/scene/meteors.js

### 5.3 土星环
- 给"旅行"行星加环 + 光环粒子
- 文件：src/scene/planets.js

### 5.4 彗星
- 1 颗椭圆轨道彗星带拖尾
- 文件：新增 src/scene/comet.js

## 6. 性能预算
- 新增粒子总量 ~4000：星云 3000 + 流星 200 + 彗星 50 + 护盾/碎裂 800
- warp 模糊：全屏单 pass，仅高速时启用
- 全部 Points/Sprite/简单 shader，不用 raymarching
- 配合已做的 pixelRatio 1.5、分段降低优化，iOS 可承受
- 视锥剔除暂不做（本轮聚焦视觉）

## 7. 新增文件清单
- src/core/warp-effect.js — 超光速径向模糊后处理
- src/scene/crystal-burst.js — 水晶碎裂爆开
- src/scene/nebula.js — 双色程序化星云
- src/scene/meteors.js — 流星雨
- src/scene/comet.js — 椭圆轨道彗星

## 8. 修改文件清单
- src/ship/trail.js — 双色拉伸光带
- src/ship/ship.js — 能量护盾
- src/scene/starfield.js — star streaks + 加载汇聚
- src/scene/planets.js — 土星环
- src/ui/gallery.js — 玻璃卡片 + 碎裂绽放 + 聚焦光晕
- src/ui/nav.js — HUD 升级 + 加载升级
- src/styles/main.css — 全息 HUD + 按钮脉冲 + 加载样式
- src/main.js — 装配新场景对象

## 9. 接口约定
所有新场景对象遵循现有 `create*()→{object, update(t, dt)}` 约定，在 main.js loop 中注册 update。

## 10. 验证
- npm run build 通过
- npm run lint 0 错误
- npm test 18 passed
- 浏览器手动验证：飞船加速 warp、进画廊碎裂、星云/流星/彗星可见、卡片玻璃拟态、HUD 扫描线、进入折叠
- iOS 流畅度不回退
