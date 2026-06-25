# 进入遮罩 + 自动播放星际穿越风格深邃 BGM

- 日期：2026-06-23
- 类型：feature
- 涉及模块：src/audio, src/ui, src/styles, src/main.js, scripts
- 关联需求：用户"新增进入自动播放音乐，BGM 为星际穿越风格深邃，page0 遮罩的一部分"
- 关联 commit：N/A

## 1. 背景 / 触发原因
用户希望进入网站时自动播放星际穿越（Interstellar）风格的深邃 BGM，作为 page0 首屏遮罩交互的一部分。浏览器自动播放策略要求音频需用户首次交互触发，因此把原本自动隐藏的加载层改造为「点击进入」遮罩，点击即触发播放（合规）。

## 2. 改了什么（What）
- [bgm.js](file:///home/sti/Documents/trae_projects/cvqq/src/audio/bgm.js)：新增 `createBgm()`，创建 `<audio loop>`，渐入音量；导出 `play()`/`stop()`/`toggleMute()`。无音频文件时静默不报错。
- [nav.js](file:///home/sti/Documents/trae_projects/cvqq/src/ui/nav.js)：`createLoading` 改为带「进入宇宙」按钮的 page0 遮罩，导出 `ready()`/`onEnter(cb)`；nav 新增静音按钮 `muteBtn`。
- [main.js](file:///home/sti/Documents/trae_projects/cvqq/src/main.js)：创建 bgm；loop.start 后 `loading.ready()`，`onEnter` 点击进入时 `bgm.play()`；静音按钮切换。
- [main.css](file:///home/sti/Documents/trae_projects/cvqq/src/styles/main.css)：进入按钮发光脉冲、loading 标题/副文样式。
- [fetch-bgm.sh](file:///home/sti/Documents/trae_projects/cvqq/scripts/fetch-bgm.sh)：下载脚本，接受免版权深空氛围曲直链 → `public/audio/bgm.mp3`，校验 mp3 魔数。

## 3. 怎么改的（How）
- 自动播放合规：BGM 在用户点击「进入宇宙」按钮的同步回调中 `audio.play()`，绕过浏览器自动播放限制。
- 音量从 0 渐入到 0.55（2.6s），营造深邃淡入感；静音按钮渐变到 0/恢复。
- 无 bgm.mp3 时 `play().catch(()=>{})` 静默，不影响体验。

## 4. 怎么用（Usage）
- 下载 BGM：`bash scripts/fetch-bgm.sh <免版权mp3直链>`（来源见脚本注释：Pixabay Music 等），存入 public/audio/bgm.mp3。
- 进入：首屏遮罩显示「进入宇宙」按钮，点击即渐隐遮罩并淡入 BGM；右上角 ♪ 按钮可静音/恢复。

## 5. 影响面 / 风险
- 行为变更：首屏不再自动进入，需用户点击「进入宇宙」（这是自动播放合规的必要交互）。
- 无音频文件时静默无声，不报错。
- Interstellar 原声有版权，脚本注释已提示使用免版权替代曲。

## 6. 验证（Verification）
- `npm run lint`：0 错误 0 警告
- `npm run build`：✓ built（623.57 kB / gzip 164.81 kB）

## 7. 关联
- 后续 TODO：用户用 fetch-bgm.sh 下载实际音频；云存储后端；真实飞船 .glb。
