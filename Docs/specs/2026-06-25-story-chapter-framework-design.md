# 故事线 + 篇章框架设计规格

- 日期：2026-06-25
- 主题：8 篇章太空叙事框架（登月/地出/火星/土星/逃离/冥王星/黑洞/虫洞）+ 恋爱故事融合隐喻 + 3A 打字机系统 + 可交互记忆碎片 + 线性门控
- 子项目编号：1/6（统领子项目）
- 关联：AGENTS.md §探索记忆、cv/qq 秘密基地；后续子项目 2-6 依赖本框架

## 1. 设计目标
建立统领全局的叙事骨架：8 个太空篇章隐喻 cv/qq 恋爱的 8 个阶段，3A 大作式进入系统（打字机文字+场景音乐+真实影像），环境叙事（线索/伏笔/暗篇），可交互记忆碎片（支持 text/image/video），线性解锁门控。预留定制插入点供用户填真实照片/文字/视频。

## 2. 篇章 ↔ 恋爱阶段映射

| 章 | 太空篇章 | 恋爱隐喻 | 核心意象 | 打字机开场文案 |
|----|---------|---------|---------|--------------|
| 1 | 登月·第一步 | 相识 | 阿姆斯特朗一小步 | 1969，人类迈出第一步。2023，我迈向你。 |
| 2 | 地出·回望蓝星 | 初见心动 | Apollo 8 地出 | 从月球回望，地球是一颗蓝色弹珠。原来心动，是看见家的方向。 |
| 3 | 远征火星 | 一起旅行 | 红色荒漠远征 | 两颗星球之间最远的距离，是我在火星，你在信号另一端。但我们一起走过了。 |
| 4 | 土星环·盛宴 | 美食记录 | 光环下的盛宴 | 土星环转了亿万年，像一桌永不散场的宴席。你笑说，这顿饭我们吃了一整个星系。 |
| 5 | 逃离太阳系 | 纪念日 | 挣脱引力飞向星际 | 纪念日那天，我们挣脱了所有引力。从此不再围绕谁转，只围绕彼此。 |
| 6 | 冥王星·边缘之光 | 日常时光 | 太阳系边缘寒冷小星 | 冥王星被除名了，可它还在转。像那些平凡的日子，不被歌颂，却是我的全部。 |
| 7 | 黑洞求生 | 惊喜瞬间 | 事件视界生死边缘 | 视界边缘，连光都逃不掉。那个惊喜的瞬间，我也没能逃掉。 |
| 8 | 虫洞·新宇宙 | 未来约定 | 穿越虫洞通往未知 | 虫洞的另一头是什么？是我们说好的那个未来。走吧，一起。 |

## 3. 进入系统

### 进入流程
```
飞船飞入篇章触发区 → 画面渐暗(0.5s) → 章节标题(1.5s) → 真实影像背景淡入(1s) → 打字机文案(~4s) → 停留2s淡出 → 场景淡入 → BGM淡入 → 篇章开始
```

### 打字机文字系统
- 位置：画面中下部，半透明黑底 + 双色细边字幕条
- 效果：逐字打出，每字 40ms，逗号停顿 120ms，句号停顿 300ms，打完停留 2s 淡出
- 字体：思源宋体（衬线文学感），双色高亮关键词（cv 蓝 #7fd4ff / qq 粉 #ff9ec4）
- 音效：打字 tick 声（可静音）
- 章节标题：开场前显示「第 N 章 · 篇名」，停留 1.5s 淡出再接文案

### 场景音乐
- 每篇章独立 BGM，进入淡入 1.5s，退出淡出 1s
- 情绪：登月庄严、地出空灵、火星苍凉、土星华丽、逃离激昂、冥王星孤独、黑洞紧张、虫洞梦幻
- 复用 src/audio/bgm.js，扩展为多轨切换

### 真实影像素材
- 打字机阶段背景叠加真实太空影像（NASA 公开图片/视频）
- 存 public/assets/chapter-imagery/
- 进入时全屏背景图淡入淡出
- 来源：NASA Image Library / Three.js CDN 公开素材

## 4. 线性门控

### 状态机
- chapters.json 记录每章状态：locked / unlocked / completed
- 第 1 章默认 unlocked；完成本章主任务后自动解锁下一章
- 锁定章节星球显示为暗色天体，靠近打字机提示"信号加密中…前方未知"
- 进度存 localStorage（key: cvqq_progress），刷新不丢失

### 篇章触发区
- 每个篇章星球周围不可见球形触发区
- 飞船进入触发区 → 触发进入流程
- 触发区有微弱环形光晕视觉提示

## 5. 环境叙事

### 可交互记忆碎片
场景散落发光可交互物件，靠近(<3m)提示「按 E 查看」，弹出照片/文字/视频。每章 3-5 个。

碎片形态（每章不同）：
| 章 | 碎片形态 | 示例 |
|----|---------|------|
| 1 登月 | 月面全息数据牌 | 刻着日期的金属牌 |
| 2 地出 | 漂浮旧照片框 | 蓝色弹珠旧照片 |
| 3 火星 | 红沙中信件胶囊 | 邮戳密封胶囊 |
| 4 土星 | 光环中音乐盒 | 刻菜名小银盒 |
| 5 逃离 | 引力计旁全息日记 | 闪烁数字日记本 |
| 6 冥王星 | 冰原上温暖灯笼 | 寒冷中发光小灯笼 |
| 7 黑洞 | 视界边缘漂流瓶 | 快被吞噬的瓶子 |
| 8 虫洞 | 虫洞入口钥匙 | 旋转星形钥匙 |

碎片内容支持三种类型：text（文字）、image（照片）、video（视频片段，VideoTexture 循环播放）。

### 线索系统（伏笔）
不可交互但暗示性的环境物件：
- 登月章月面刻有"地出"坐标 → 预告第 2 章
- 火星章沙暴中隐现土星环图案 → 预告第 4 章
- 冥王星章边缘有虫洞光纹 → 预告第 8 章
- 黑洞章吸积盘纹理藏虫洞方程 → 预告最终章

### 暗篇（隐藏内容）
- 收集型暗篇：集齐本章全部碎片 → 解锁隐藏回忆
- 行为型暗篇：飞到非主线区域 → 触发隐藏日记
- 连携暗篇：按特定顺序查看跨章碎片 → 解锁彩蛋回忆

### 交互流程
```
飞船/人物靠近碎片(<3m) → 碎片脉冲发光 + 提示「按 E 查看」
→ 按 E → 暂停 + 全屏玻璃面板淡入（照片/文字/视频+日期）
→ 再按 E/点击 → 面板淡出 → 碎片标记已收集（变暗）
→ 集齐本章全部 → 触发暗篇提示
```

### 数据结构
```json
{
  "id": "chapter-1-moon",
  "fragments": [
    {
      "id": "frag-1",
      "pos": [12, 0, -8],
      "form": "hologram-plate",
      "label": "2023-05-20",
      "content": { "type": "text", "title": "初次相识", "body": "…" },
      "isCustomizable": true
    },
    {
      "id": "frag-2",
      "pos": [20, 1, -15],
      "form": "hologram-plate",
      "content": { "type": "image", "src": "assets/memories/our-photo.jpg" },
      "isCustomizable": true
    },
    {
      "id": "frag-3",
      "pos": [-8, 0, -22],
      "form": "hologram-plate",
      "content": { "type": "video", "src": "assets/memories/our-video.mp4" },
      "isCustomizable": true
    }
  ],
  "clues": [
    { "pos": [...], "form": "engraved-coords", "text": "→ 地出坐标" }
  ],
  "hiddenChapter": {
    "trigger": "collect-all-fragments",
    "content": { ... }
  }
}
```

### 定制插入点
- 每个碎片 isCustomizable: true 的项是用户填真实照片/文字/视频的位置
- 替换 content 字段即可（文字直写、照片放 public/assets/memories/、视频同目录）
- 碎片形态/位置由开发者设计，用户不用管 3D 摆放

## 6. 技术架构

### 文件结构
```
src/story/
├── chapters.json          # 8 篇章定义（门控状态、触发区、碎片、线索、暗篇）
├── chapter-manager.js     # 篇章状态机：解锁/进入/完成/存档(localStorage)
├── typewriter.js          # 打字机字幕系统（逐字、停顿、双色高亮、tick音）
├── chapter-intro.js       # 进入流程编排（渐暗→标题→打字机→音乐→淡入场景）
├── fragment-system.js     # 可交互记忆碎片（3D摆放、靠近检测、查看面板、收集）
├── clue-system.js         # 环境线索（不可交互暗示物件）
└── fragment-viewer.js     # 碎片查看面板（text/image/video 渲染）
```

### 篇章场景模块（本子项目占位简化版）
| 章 | 场景模块 | 核心元素 | 真实影像 |
|----|---------|---------|---------|
| 1 登月 | scene/chapter-moon.js | 月面地形+登月舱+地球远景 | Apollo 11 月面照 |
| 2 地出 | scene/chapter-earthrise.js | 地球升起+月球轨道 | Apollo 8 地出照 |
| 3 火星 | scene/chapter-mars.js | 红色荒漠+沙暴粒子 | NASA 火星地表照 |
| 4 土星 | scene/chapter-saturn.js | 土星环近距离+卫星群 | Cassini 土星照 |
| 5 逃离 | scene/chapter-escape.js | 太阳渐远+柯伊伯带 | 太阳系边缘示意 |
| 6 冥王星 | scene/chapter-pluto.js | 冰原+心形冰川 | New Horizons 照 |
| 7 黑洞 | scene/chapter-blackhole.js | 事件视界+吸积盘 | EHT 黑洞照 |
| 8 虫洞 | scene/chapter-wormhole.js | 虫洞入口+扭曲通道 | Interstellar 风格 |

### 接口约定
场景模块遵循 `create*()→{object, update(t,dt), onEnter(), onExit()}`

### 篇章触发区 → 场景切换流程
```
飞船进入触发区
→ chapter-manager.checkTrigger() 检测
→ chapter-intro.play(chapterData) 编排：
    1. 画面渐暗(0.5s)
    2. 章节标题淡入(1.5s)
    3. 真实影像背景淡入(1s)
    4. 打字机文案逐字打出(~4s)
    5. 停留2s全部淡出
    6. 场景模块 onEnter() 加载，淡入
    7. BGM 切换淡入
→ 篇章中：fragment-system + clue-system 活跃
→ 完成主任务：chapter-manager.complete() → 解锁下章 → onExit() → 返回宇宙地图
```

### 进度存档
```js
// localStorage: cvqq_progress
{
  currentChapter: 1,
  chapters: {
    1: { status: "completed", fragments: ["frag-1","frag-2"], hiddenUnlocked: true },
    2: { status: "unlocked", fragments: [], hiddenUnlocked: false },
    "3-8": { status: "locked" }
  }
}
```

### BGM 多轨扩展
现有 audio/bgm.js 扩展为 8 轨 + 1 宇宙默认轨，switchTrack(id, fadeMs) 切换。

## 7. 文件清单

### 新增
- src/story/chapters.json — 8 篇章数据
- src/story/chapter-manager.js — 状态机 + 存档
- src/story/typewriter.js — 打字机系统
- src/story/chapter-intro.js — 进入编排
- src/story/fragment-system.js — 记忆碎片
- src/story/clue-system.js — 环境线索
- src/story/fragment-viewer.js — 查看面板
- 8 个 scene/chapter-*.js — 篇章场景（占位简化版）
- public/assets/chapter-imagery/ — 真实影像素材
- public/assets/chapter-bgm/ — 8 篇章 BGM

### 修改
- src/main.js — 装配 chapter-manager，飞船触发区检测接入
- src/audio/bgm.js — 扩展多轨切换
- src/styles/main.css — 打字机字幕条 + 碎片查看面板样式
- src/data/memories.json — 现有 8 行星映射为 8 篇章触发区

## 8. 不在本子项目范围
- 飞船升级/视角系统（子项目 2）
- 人物行走控制（子项目 3）
- 地月深度优化（子项目 4）
- 登月玩法细节（子项目 5）
- 记忆嵌入系统的深度玩法（子项目 6）

本子项目只建叙事骨架 + 篇章框架 + 打字机 + 碎片系统 + 门控，篇章场景先用占位简化版，后续子项目逐个填充深度玩法。

## 9. 验证
- npm run build 通过
- npm run lint 0 错误
- npm test 通过
- 浏览器手动验证：飞入第 1 章触发区 → 打字机字幕 + 标题 + 影像 + 音乐 → 简化月面场景加载 → 碎片靠近提示 → 查看面板 text/image/video → 收集 → 完成解锁第 2 章 → 刷新进度保留
- iOS 流畅度不回退
