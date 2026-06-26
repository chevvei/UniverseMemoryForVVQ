# 飞船模型兼容两方案 + 第二期前端上传压缩

- 日期：2026-06-23
- 类型：feature
- 涉及模块：src/ship, src/upload, src/ui, src/styles, scripts, test
- 关联需求：AGENTS.md（真实上传照片）；本期"飞船用现成 .glb / 前端上传+压缩"
- 关联 commit：N/A

## 1. 背景 / 触发原因
用户要求：(1) 下载真实飞船 .glb，让 ship.js 兼容两方案——有真实模型加载真实，没有则回退现有程序化飞船；(2) 继续做第二期=网页内选图/视频、浏览器内压缩到 25MB 内、本地预览加入当前星球画廊（云存储后端暂不接）。
注：项目规则「不写兜底/兼容代码」，本次由用户显式指令覆盖。

## 2. 改了什么（What）
- [ship.js](file:///home/sti/Documents/trae_projects/cvqq/src/ship/ship.js)：GLTFLoader 加载 `./models/ship.glb`，失败回退 `buildProcedural()`；新增 `normalizeModel`/`buildExhaust`/`attachUpdate`。
- [fetch-ship.sh](file:///home/sti/Documents/trae_projects/cvqq/scripts/fetch-ship.sh)：下载脚本，接受 Poly Pizza/Quaternius GLB 直链，校验魔数后存入 `public/models/ship.glb`。
- [compress-core.js](file:///home/sti/Documents/trae_projects/cvqq/src/upload/compress-core.js)：纯逻辑 `fitSize`/`checkVideoSize`/`classifyFile`/`LIMITS`。
- [compress.js](file:///home/sti/Documents/trae_projects/cvqq/src/upload/compress.js)：`compressImage`（canvas 缩放+jpeg0.8）、`prepareVideo`（≤25MB 校验）、`processFile`。
- [upload-panel.js](file:///home/sti/Documents/trae_projects/cvqq/src/ui/upload-panel.js)：上传 UI 面板 `createUploadPanel`。
- [gallery.js](file:///home/sti/Documents/trae_projects/cvqq/src/ui/gallery.js)：抽出 `makeTexture`/`layout`/`addCard`，导出 `addCard` 支持动态追加并重排弧形布局。
- [nav.js](file:///home/sti/Documents/trae_projects/cvqq/src/ui/nav.js)：新增「＋上传」按钮（仅星球内显示），导出 `uploadBtn`。
- [main.js](file:///home/sti/Documents/trae_projects/cvqq/src/main.js)：创建 uploadPanel，上传按钮 → open(handler) → `gallery.addCard` 并聚焦。
- [main.css](file:///home/sti/Documents/trae_projects/cvqq/src/styles/main.css)：`.upload-panel` / `.upload-btn` 样式，iOS safe-area 友好。
- [compress-core.test.js](file:///home/sti/Documents/trae_projects/cvqq/test/compress-core.test.js)：覆盖 fitSize/checkVideoSize/classifyFile。

## 3. 怎么改的（How）
- 飞船：`loadShip()` 返回 Promise，GLTFLoader.load 成功 → normalizeModel（Box3 归一化最大边=5、居中、外挂尾焰）；onError → buildProcedural。
- 画廊动态追加：`addCard(card)` 创建 mesh 后调用 `layout()` 按当前卡片数重算 arcPositions，返回新卡片 index 供聚焦。
- 上传按钮闭包引用 `inPlanet`，点击时校验仅星球内可用。

## 4. 怎么用（Usage）
- 下载飞船：`bash scripts/fetch-ship.sh <GLB直链>`，存入 public/models/ship.glb；无模型时自动用程序化飞船。
- 上传：进入星球 → 点「＋上传」→ 选图片/视频 → 自动压缩/校验 → 「添加到星球」→ 卡片加入弧形画廊并放大聚焦。

## 5. 影响面 / 风险
- 向后兼容：无模型时行为不变（程序化飞船）。
- 上传数据仅本地预览（dataURL/objectURL），刷新即失，云存储为后续任务。
- 图片/视频卡片暂不渲染 caption 文字（已知限制）。

## 6. 验证（Verification）
- `npm test`：18 passed（含 compress-core 6）
- `npm run lint`：0 错误 0 警告
- `npm run build`：✓ built（622.42 kB / gzip 164.36 kB；仅 chunk>500kB 提示）

## 7. 关联
- 后续 TODO：BGM（进入自动播放星际穿越风格深邃曲，page0 遮罩交互触发）；云存储后端（EdgeOne KV/Blob）；caption 在图片/视频卡片上的展示；真实飞船 .glb 由用户下载。
