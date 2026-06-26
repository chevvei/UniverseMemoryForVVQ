# cvqq 项目规则（Trae 自动加载）

> 本文件由 Trae IDE 在每次会话开始时自动读取。
> __TODO__ 标注的位置请按实际情况补全。

## 1. 沟通规则
- 与用户交流使用**中文**
- 大规模代码修改前必须先给出中文方案
- 不写兜底/兼容代码
- 未经用户确认不直接执行大规模修改

## 2. Skill 使用
本项目通过 `~/.trae-skills/install_skills.sh` 挂载了 11 个 sp-* 通用 skill。
架构与失配处理见 [_TRAE_ADAPTER.md](../skills/_TRAE_ADAPTER.md) §0 三层架构。

## 3. 技术栈
- 语言：JavaScript (ES Module)
- 框架：Three.js 0.160 + Vite 5
- 构建：`npm run build`
- 运行：`npm run dev`（端口 8099）

## 4. 代码风格
- Formatter：无强制（保持现有风格）
- Linter：ESLint 9 flat config（`npm run lint`）
- 严禁提交 secrets/keys

## 5. Git 提交格式
```
[<module>][<type>]: 中文描述 / English description
```

## 6. 测试
- 框架：Vitest
- 运行：`npm test`
