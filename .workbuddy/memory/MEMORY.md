# 项目长期记忆：艾米的学习乐园（儿童 AI 学习打卡平台）

## 项目结构
- 多文件源码：`index.html` + `assets/{data,store,audio,modules,app}.js` + `poems_data.js`（开源《全唐诗》卷+儿童必读名篇）+ `poems_extra.js`（义务教育必背+李白/杜甫/白居易/杜牧/王维/苏轼+毛泽东等，运行时去重追加）+ `poem_notes.js`（75首名篇详注）+ `pinyin-pro.mjs`（拼音引擎）。
- **内容大库（2026-08-24 扩充）**：`en_words_data.js`（英语 **3028 词**）+ `books_data.js`（绘本 **3008 本**，50模板×30角色×20场景随机抽样，标题撞车加场景后缀）+ `stories_data.js`（识字故事 **66 篇**、389 独特汉字）。三者均由对应 `gen_*.py` 生成、IIFE 运行时去重追加到 `window.Data`。`index.html` 与 `build_standalone.py` 的 `classic_files` 均需按 `data.js → en_words → books → stories → poems...` 顺序加载。
- 构建产物：`standalone.html` = 单文件自包含版（CSS/JS/数据/拼音引擎全内联），由 `build_standalone.py` 生成。
- 诗词数据：基础 `poems_data.js` + `poems_extra.js`（运行时去重追加），合计约 **471 首**（含毛泽东 12 首、李白 19、杜甫 14、白居易 9、杜牧 6、王维 8、苏轼 6），`pinyin-pro` 运行时生成拼音。

## ⚠️ 关键部署坑（必看）
- CloudStudio 公网静态托管对**子目录资源(assets/*)偶发返回 0 字节**（HTTP 200 但 body 空），导致白屏 + JS 无反应。
- **对策：公网部署一律用单文件 `standalone.html`**（内联一切，无子资源依赖）。CSP 相应改为 `script-src 'unsafe-inline'`。
- 本地预览仍可用多文件版（本地 http.server 正常）。
- 当前有效公网链接：**https://avery524888.github.io/amy-learning/** （GitHub Pages，永久固定）。CloudStudio 临时地址 https://55e52ddd65d340dea60788f3931c122f.app.workbuddy.link 仍由自动化兜底，但已非主地址。
- ⚠️ 旧地址 `https://cdc4f727d14f4471b6af27b5db85b20e.bj3.agentos-app.net/standalone.html` 已于 2026-08-10 前过期失效；更早的 `ff27e10f…` 亦停更。CloudStudio 沙箱约每天掉线，掉线后重推 `_deploy` 会生成**新**沙箱与**新**链接——故对外地址并非永久固定，以「最近一次成功部署的链接」为准。每次功能更新都需重推 `_deploy`。
- ⚠️ **`workbuddy_cloudstudio_deploy` 重推同一沙箱会返回 400**（沙箱已存在导致的重推/重建冲突，非代码故障）。实测线上 URL 已正确服务最新构建，且与本地文件**唯一差异是平台注入的 `beacon.cdn.qq.com/.../beacon_web.min.js` 统计脚本**（serve 时加，~21 行/576 字符），业务代码字节级一致。→ **400 即代表已在线，勿反复重推**；用户硬刷新即可见最新。
- ⚠️ **沙箱会周期性掉线（约每天一次）**：curl 超时 `http_code=000`、提示「工作空间无法连接」。重部署一次可恢复，但几小时到一天后会再次挂掉。另：平台上传服务偶发 **504（upload failed）**，与代码无关，需稍后重试。
- ✅ **已建自动化 `automation-1786611191381`「艾米学习乐园-定时恢复线上地址」**：每 2 小时自动重推 `_deploy` 目录，平台一恢复即自动救活线上地址（部署成功才简短提示，504/400 静默结束）。用户无需每次手动喊。
- ✅ **最可靠兜底**：`standalone.html` 是完全自包含单文件（0 外部请求），用户可**直接双击用浏览器打开**即用，不依赖任何服务器/沙箱。线上挂掉时优先建议此方案。
- 📌 **稳定托管决策（2026-08-13）**：CloudStudio 沙箱本质临时、反复掉线，用户要求「非常稳定」的公网地址。最初选 EdgeOne Pages，但 MCP 连接器**普遍性授权超时**（平台侧问题，重启/换网络均无效），已放弃。
- ✅ **已迁移到 GitHub Pages（2026-08-19）**：永久固定地址 **https://avery524888.github.io/amy-learning/** 。仓库 `Avery524888/amy-learning`，`gh-pages` 分支根目录 `index.html`（= `standalone.html`）。Token 存于 `deploy_github_pages.py`（GITHUB_TOKEN 环境变量可覆盖）。以后每次功能更新只需 `python deploy_github_pages.py` 即可重推，无需 CloudStudio、不会掉线、地址永久不变。GitHub Pages 首次构建约 5-10 秒；国内访问略慢于 CDN 但稳定不掉线。
- **GitHub 账号信息**：用户名 `Avery524888`，仓库 `amy-learning`（public）。Token 权限：repo（创建/推送/管理 Pages）。

## 游戏/模块现状
- 中国地图拼图：真实省界 SVG 轮廓（34 个省级行政区 + 省会城市名；离线由 `generate_china_map.py` 从 DataV 省级 GeoJSON 简化生成 `chinaMapData.js`，约 34KB）。玩法：**底部随机弹出一省真实形状拼片 → 孩子在地图上点击对应省区域**；点中变绿打勾 💚 + 提示「你真棒！」，点错红描边抖动 +「哎哟！不对哦！再看看吧~」；全拼好底部出「🔄 再来一局？」重置。
- 逻辑模块：支持🎤语音答题（切换录音 + 实时转写 + AI/本地判题给对错与正确答案）；未配置 AI 时走本地 `judgeLogic`（中文数字转换 + 包含匹配）。

## 已知限制
- AI 对话：浏览器直连第三方 API 可能遇 CORS，建议填同域代理地址；密钥仅存本机。
- 诗词释义：75首名篇有详注，其余为基于真实诗人生卒年的导读模板。
- 英语短片/真人语音：用 emoji+CSS 与 Web Speech 朗读呈现，未接真人视频。
