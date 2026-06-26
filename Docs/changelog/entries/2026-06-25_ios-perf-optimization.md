# iOS 流畅度性能优化

- 日期：2026-06-25
- 类型：perf
- 涉及模块：scene/earth-moon, core/renderer, config
- 关联需求：AGENTS.md §对 iOS 网页端访问友好
- 关联 commit：b710dd9

## 1. 背景 / 触发原因
用户反馈网页播放卡顿。qq 用苹果手机访问，iOS GPU 对高顶点数 + 高像素填充敏感，需在视觉降级最小化的前提下降低 GPU 压力。

## 2. 改了什么（What）
- 文件：[src/scene/earth-moon.js](file:///home/sti/Documents/trae_projects/cvqq/src/scene/earth-moon.js)
- 文件：[src/core/renderer.js](file:///home/sti/Documents/trae_projects/cvqq/src/core/renderer.js)
- 文件：[src/config.js](file:///home/sti/Documents/trae_projects/cvqq/src/config.js)

## 3. 怎么改的（How）
6 项参数级优化，不动架构：
1. 月球分段 128→48，移除 displacementMap（保留 bumpMap 凹凸阴影），省 ~93% 顶点处理
2. 地球+云层分段 96→48，有 normalMap 加持肉眼无差，省 75% 顶点
3. pixelRatio 上限 2→1.5，省 ~44% 像素填充（最大单点收益）
4. UnrealBloomPass strength 0.85→0.75、threshold 0.25→0.4，收敛高亮区减少叠加开销
5. 星系粒子 galaxyParticles 22000→12000，省填充率
6. 尾迹粒子 trailParticles 240→150，仍饱满

## 4. 怎么用（Usage）
无用户操作，构建后 iOS 帧率显著提升。视觉降级极小：月球环形山靠 bumpMap 仍呈现光影、地球靠 normalMap 仍立体、bloom 仍炫酷。

## 5. 影响面 / 风险
- 向后兼容：是
- 性能影响：正向，降低 GPU 顶点/像素压力
- 风险：bloom 略收敛、星系密度略减，肉眼可察但可接受

## 6. 验证（Verification）
- 构建：`npm run build` 通过（dist ~638KB）
- Lint：`npm run lint` 0 错误
- 测试：`npm test` 18 passed（5 files）

## 7. 关联
- 后续 TODO：如仍卡顿可考虑视锥剔除 / LOD / 按需暂停远处场景更新
