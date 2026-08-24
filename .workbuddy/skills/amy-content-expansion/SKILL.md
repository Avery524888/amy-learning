---
name: amy-content-expansion
description: 扩充「艾米的学习乐园」内容库（英语词库/绘本馆/识字故事）并部署到 GitHub Pages 的标准工作流。当用户要求"扩充内容库、加单词、加绘本、加故事、内容更新/每天新内容/不重复"时使用。覆盖：数据生成（gen_*.py）→ 注册加载（index.html + build_standalone.py）→ 冒烟测试 → 构建 → 部署（deploy_github_pages.py）。
agent_created: true
---

# 艾米的学习乐园 — 内容库扩充与部署

## Overview

项目位于 `D:\项目\互动\workbuddy\2026-07-30-19-35-09\`。内容库由生成脚本产出数据文件，运行时 IIFE 去重追加到 `window.Data`，前端 store 提供「每日不重复 + 换一换」。本技能覆盖「扩充 → 注册 → 验证 → 构建 → 部署」完整链路，防止遗漏关键步骤。

## 内容库现状（2026-08-24）

| 库 | 数据文件 | 生成脚本 | 数量 | 每日逻辑 |
|---|---|---|---|---|
| 英语词 | `assets/en_words_data.js` | `gen_en_words.py` | 3028 词 | `getDailyEN()` 游标顺序 5新+2复习，换一换 |
| 绘本 | `assets/books_data.js` | `gen_books.py` | 3008 本 | `getDailyBooks()` seeded 洗牌 5 本/天，7 天不重复 |
| 识字故事 | `assets/stories_data.js` | `gen_stories.py` | 66 篇（389 字） | `getDailyStory()` 按天 1 篇 + `shuffleStory()` 换一换 |

## 扩充步骤（按序执行，缺一不可）

### Step 1: 在生成脚本中加数据
- 英语：往 `gen_en_words.py` 的 `WORDS` 追加 `(en, cn, emoji, theme)` 四元组。
- 绘本：往 `gen_books.py` 的 `TEMPLATES/CHARS/PLACES` 追加；标题撞车会自动加「（场景名）」后缀，无需手动处理。
- 故事：往 `gen_stories.py` 的 `STORIES` 追加 `(title, text, [(字, 拼音, 释义) x 8])`；脚本自动做故事内汉字去重与缺字段容错。
- ⚠️ 数据格式坑（历史踩过）：故事 newChars 必须是**单字**三元组；条目字段数不足 3 会崩（脚本已有容错，但最好不制造）；绘本「学游泳」模板曾含 `(" paddle", ...)` 空 emoji 前缀瑕疵。

### Step 2: 重跑生成脚本
```bash
python gen_en_words.py  # 或 gen_books.py / gen_stories.py
```
- 用托管 Python：`C:\Users\wangxinmiao\.workbuddy\binaries\python\versions\3.13.12\python.exe`
- 脚本末尾会打印「Written: ... 共 N 条」。

### Step 3: 注册加载（两个地方必须同步改）
1. `index.html`：在 `<script src="assets/data.js"></script>` 之后、store.js 之前，按 `en_words_data.js → books_data.js → stories_data.js` 顺序追加 script 标签。
2. `build_standalone.py` 的 `classic_files` 列表：`data.js` 之后同样顺序追加三文件名。
- ⚠️ 顺序即依赖：新数据文件依赖 `window.Data` 存在，必须在 data.js 后；store/modules 依赖数据，必须在它们之前。

### Step 4: 冒烟测试（可选但推荐）
用 node 模拟浏览器环境（`global.window = global` + fake localStorage），加载数据文件 + store.js，断言：
- 合并后总数与唯一性（如 `new Set(...).size === arr.length`）
- `S.getDailyStory()/shuffleStory()` 当天稳定、换一换不同、持久化保持
- `S.getDailyEN()` 5 新 + 2 复习；`S.getDailyBooks()` 5 本且非旧书

### Step 5: 构建
```bash
python build_standalone.py
```
产出 `standalone.html`（单文件自包含）+ `_deploy/`（多文件版）。验证 `_deploy/assets/` 含新数据文件、`_deploy/index.html` 含新 script 引用。

### Step 6: 部署 GitHub Pages（永久固定地址）
```bash
python deploy_github_pages.py
```
- 地址：`https://avery524888.github.io/amy-learning/`（仓库 `Avery524888/amy-learning` gh-pages 分支）
- ⚠️ GitHub API 上传大文件（如 1MB books_data.js）偶发 `RemoteDisconnected`/5xx → 脚本已内置 4 次指数退避重试，**直接重跑一次即可**，不要改代码。
- 部署约 1-3 分钟（40 个文件逐个 blob 上传），期间无 stdout 输出属正常。
- 完成后 curl 验证线上资源（如 `books_data.js` 大小与本地一致、含新标题关键词）。

## 关键模块逻辑速查

- `assets/store.js`：`getDailyStory()`（当天 dailyIndex 轮换 1 篇）+ `shuffleStory()`（排除今天已看过的随机换一篇，记录在 `state.dailySel.story[date]` 持久化，全部看完重置）。新增每日逻辑一律走 `state.dailySel` 持久化 + 当天种子，保证「同天稳定、跨天变化、不重复」。
- `assets/modules.js`：`shizi()` 用 `S.getDailyStory()` + `#storyShuffle` 换一换；`book()` 分批渲染 60 本 + 「加载更多」（3000+ 本不能全量渲染）；`english()` 已含换一换。
- `deploy_github_pages.py`：TOKEN 硬编码于文件内（`GITHUB_TOKEN` 环境变量可覆盖）；api() 带重试。

## 常用命令

```bash
PY="C:\Users\wangxinmiao\.workbuddy\binaries\python\versions\3.13.12\python.exe"
"$PY" gen_stories.py && "$PY" build_standalone.py && "$PY" deploy_github_pages.py
```
