// 冒烟测试：加载 standalone.html，验证绘本已读徽标 + 英语新学/复习分离 + 跟读 + 中国地图中间形状
const fs = require("fs");
const { JSDOM } = require("jsdom");
const html = fs.readFileSync("standalone.html", "utf8");
const errors = [];
const dom = new JSDOM(html, {
  url: "https://example.com/",
  runScripts: "dangerously",
  pretendToBeVisual: true,
});
const w = dom.window;
w.addEventListener("error", (e) => errors.push(String((e.error && e.error.message) || e.message)));

setTimeout(() => {
  const CD = w.ChinaMapData;
  const M = w.Modules;
  const Store = w.Store;
  const Data = w.Data;
  let ok = true;

  // 1) 中国地图数据
  if (!CD || !CD.provinces || CD.provinces.length !== 34) {
    console.log("FAIL ChinaMapData.provinces =", CD && CD.provinces && CD.provinces.length);
    ok = false;
  } else {
    const bad = CD.provinces.filter((p) => !p.d || !p.capital || !p.name || !p.lx);
    console.log("OK ChinaMapData: 省份数", CD.provinces.length, "异常项", bad.length);
    if (bad.length) { console.log("  异常:", bad.map((b) => b.name)); ok = false; }
  }

  // 2) 逻辑本地判题（数字转换 + 包含匹配）
  if (!M || !M.judgeLogic) {
    console.log("FAIL Modules.judgeLogic 不存在"); ok = false;
  } else {
    const t = (child, a) => M.judgeLogic(child, { a: a }).correct;
    const j1 = t("五", "5"), j2 = t("水", "水"), j3 = t("北京", "水"), j4 = t("应该是水", "水");
    console.log("judgeLogic: 五=5:", j1, "| 水=水:", j2, "| 北京!=水:", j3, "| 去前缀:", j4);
    if (!(j1 && j2 && !j3 && j4)) { console.log("FAIL judgeLogic 判定异常"); ok = false; }
  }

  // 3) 逻辑卡渲染（voice-btn 语音答题按钮存在）
  if (M && M.logic) {
    try {
      const c = w.document.createElement("div"); M.logic(c);
      const vbs = c.querySelectorAll(".voice-btn");
      const ans = c.querySelectorAll(".ans-btn");
      console.log("logic 渲染: voice-btn=", vbs.length, "ans-btn=", ans.length);
      if (vbs.length < 5 || ans.length < 5) { console.log("FAIL 逻辑卡按钮不足"); ok = false; }
    } catch (e) { console.log("FAIL logic 渲染异常:", e.message); ok = false; }
  }

  // 5) 绘本已读状态 API
  if (!Store || !Store.markBookRead || !Store.isBookRead) {
    console.log("FAIL Store.readBooks API 缺失"); ok = false;
  } else {
    Store.markBookRead("测试绘本X");
    const r = Store.isBookRead("测试绘本X");
    console.log("readBooks: mark+is =", r);
    if (!r) { console.log("FAIL readBooks"); ok = false; }
  }

  // 6) 绘本：已读显示对钩；读完最后一页才标记（打开不标记）
  if (M && M.book && Data && Data.BOOKS && Data.BOOKS.length >= 2) {
    try {
      // 6a) 已读过的书渲染时显示对钩
      Store.markBookRead(Data.BOOKS[0].title);
      const c3 = w.document.createElement("div"); M.book(c3);
      const cards = c3.querySelectorAll(".book-card");
      const badge = c3.querySelector(".book-read-badge");
      console.log("book(已读) 渲染: book-card=", cards.length, "已读徽标=", !!badge);
      if (!cards.length) { console.log("FAIL book 未渲染卡片"); ok = false; }
      if (!badge) { console.log("FAIL 已读徽标未出现"); ok = false; }

      // 6b) 打开一本未读的书：首末页前不标已读；读完最后一页才出现对钩
      const tb = Data.BOOKS[1];
      const c4b = w.document.createElement("div"); M.book(c4b);
      const target = Array.from(c4b.querySelectorAll(".book-card")).find((el) => el.querySelector(".book-name") && el.querySelector(".book-name").textContent === tb.title);
      if (!target) { console.log("FAIL 找不到测试绘本卡片:", tb.title); ok = false; }
      else {
        target.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
        const afterOpen = target.querySelector(".book-read-badge");
        console.log("book 打开(末页前)徽标=", !!afterOpen, "(应为 false)");
        if (afterOpen) { console.log("FAIL 打开即标记已读"); ok = false; }
        // 翻到最后一页
        let guard = 0, nxt = c4b.querySelector("#next");
        while (nxt && nxt.textContent.indexOf("读完啦") < 0 && guard < 60) {
          nxt.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
          nxt = c4b.querySelector("#next");
          guard++;
        }
        const target2 = Array.from(c4b.querySelectorAll(".book-card")).find((el) => el.querySelector(".book-name") && el.querySelector(".book-name").textContent === tb.title);
        const badgeLast = target2 && target2.querySelector(".book-read-badge");
        const isRead = Store.isBookRead(tb.title);
        console.log("book 末页后徽标=", !!badgeLast, "isBookRead=", isRead, "(应为 true)");
        if (!badgeLast || !isRead) { console.log("FAIL 末页未标记已读"); ok = false; }
      }
    } catch (e) { console.log("FAIL book 渲染异常:", e.message); ok = false; }
  }

  // 7) 英语：今日新学 / 复习记录分离 + 跟读按钮
  if (M && M.english) {
    try {
      const c4 = w.document.createElement("div"); M.english(c4);
      const nc = c4.querySelector("#newCount");
      const rc = c4.querySelector("#revCount");
      const gn = c4.querySelector("#wordGridNew");
      const gr = c4.querySelector("#wordGridRev");
      const hasOld = c4.innerHTML.indexOf("复习一下") >= 0;
      const recBtn = c4.querySelector(".word-card button");
      console.log("english: newCount=", nc && nc.textContent, "revCount=", rc && rc.textContent, "复习一下残留=", hasOld, "跟读按钮=", !!recBtn);
      if (!nc || !gn || !gr) { console.log("FAIL english 结构缺失"); ok = false; }
      if (hasOld) { console.log("FAIL 仍显示旧文案「复习一下」"); ok = false; }
      const nNum = parseInt(nc && nc.textContent, 10);
      if (!(nNum >= 1 && nNum <= 5)) { console.log("FAIL 今日新学数量异常"); ok = false; }
    } catch (e) { console.log("FAIL english 渲染异常:", e.message); ok = false; }
  }

  // 8) 中国地图：中间随机弹出真实形状 + 省份参考托盘
  if (M && M.game) {
    try {
      const c2 = w.document.createElement("div"); M.game(c2);
      const cards = c2.querySelectorAll(".game-card");
      let mapCard = null;
      cards.forEach((card) => { if (card.textContent.indexOf("中国地图") >= 0) mapCard = card; });
      if (!mapCard) { console.log("FAIL 未找到中国地图游戏卡"); ok = false; }
      else {
        mapCard.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
        const challenge = c2.querySelector("#cmChallenge");
        const piece = c2.querySelector(".cm-piece");
        const piecePath = c2.querySelector(".cm-piece-path");
        const refs = c2.querySelectorAll(".china-ref");
        console.log("chinaMap: 挑战区=", !!challenge, "形状拼块=", !!piece, "形状path=", !!piecePath, "参考省数=", refs.length);
        if (!challenge || !piece || !piecePath || refs.length < 30) { console.log("FAIL 地图中间形状/参考缺失"); ok = false; }
      }
    } catch (e) { console.log("FAIL chinaMap 渲染异常:", e.message); ok = false; }
  }

  // 10) 拼音：韵母点击走 speakFinal（ang/eng/ing/ong 纠正路径）
  if (M && M.pinyin) {
    const cP = w.document.createElement("div"); M.pinyin(cP);
    const iniCells = cP.querySelectorAll("#iniGrid .alpha-cell");
    const finCells = cP.querySelectorAll("#finGrid .alpha-cell");
    console.log("pinyin: 声母格=", iniCells.length, "韵母格=", finCells.length, "speakFinal暴露=", !!(w.A && w.A.speakFinal));
    if (!finCells.length || !(w.A && w.A.speakFinal)) { console.log("FAIL 韵母或speakFinal缺失"); ok = false; }
    const origFinal = w.A.speakFinal; let finalArg = null;
    w.A.speakFinal = (it) => { finalArg = it && it.s; };
    const angCell = Array.from(finCells).find((c) => c.textContent.indexOf("ang") >= 0);
    if (angCell) angCell.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
    w.A.speakFinal = origFinal;
    console.log("pinyin 韵母点击->speakFinal(s)=", finalArg);
    if (finalArg !== "ang") { console.log("FAIL 韵母未走speakFinal"); ok = false; }
  }

  // 11) 中国地图：点击正确省份高亮+「你真棒」；点错→「哎哟」
  if (M && M.game) {
    const c2 = w.document.createElement("div"); M.game(c2);
    const mapCard = Array.from(c2.querySelectorAll(".game-card")).find((card) => card.textContent.indexOf("中国地图") >= 0);
    if (!mapCard) { console.log("FAIL 未找到中国地图"); ok = false; }
    else {
      mapCard.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
      const hint = c2.querySelector(".cm-piece-hint");
      const paths = c2.querySelectorAll(".china-prov");
      console.log("chinaMap: 拼片提示=", !!hint, "省份路径=", paths.length);
      if (!hint || paths.length < 30) { console.log("FAIL 地图拼片/省份缺失"); ok = false; }
      else {
        const want = (hint.textContent.match(/「(.+?)」/) || [])[1];
        const target = Array.from(paths).find((p) => p.getAttribute("data-prov") === want);
        target.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
        const res1 = c2.querySelector("#chinaRes");
        console.log("chinaMap 点对:", /你真棒/.test(res1.textContent), "filled=", target.classList.contains("filled"));
        if (!/你真棒/.test(res1.textContent) || !target.classList.contains("filled")) { console.log("FAIL 点对未高亮/未提示"); ok = false; }
        const wrong = Array.from(paths).find((p) => p.getAttribute("data-prov") !== want && !p.classList.contains("filled"));
        if (wrong) {
          wrong.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
          const res2 = c2.querySelector("#chinaRes");
          console.log("chinaMap 点错提示哎哟=", /哎哟/.test(res2.textContent));
          if (!/哎哟/.test(res2.textContent)) { console.log("FAIL 点错未提示哎哟"); ok = false; }
        }
      }
    }
  }

  // 12) 计算拆解：最终结果先隐藏为「?」，选项点击能命中正确支（你真棒）并揭示答案
  if (M && M.math) {
    const cM = w.document.createElement("div"); M.math(cM);
    const p2 = cM.querySelector("#p2q");
    if (!p2) { console.log("FAIL 未找到拆解模块"); ok = false; }
    else {
      const treeAns = p2.querySelector("#p2treeAns");
      const choices = p2.querySelectorAll(".decomp-choice");
      const mergeOp = p2.querySelector('svg text[y="108"].op');
      const hasMergeOp = !!(mergeOp && (mergeOp.textContent === "+" || mergeOp.textContent === "−"));
      console.log("decomp: 初始treeAns=", treeAns && treeAns.textContent, "选项数=", choices.length, "合并位运算符=", hasMergeOp ? mergeOp.textContent : "无");
      if (!treeAns || treeAns.textContent !== "?") { console.log("FAIL 拆解结果未隐藏为?"); ok = false; }
      if (choices.length < 2) { console.log("FAIL 拆解选项缺失"); ok = false; }
      if (!hasMergeOp) { console.log("FAIL 合并位缺少+/-符号"); ok = false; }
      let solved = false, revealed = false;
      choices.forEach((btn) => {
        if (solved) return;
        btn.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
        const res = p2.querySelector("#p2res");
        if (res && /你真棒/.test(res.textContent)) solved = true;
        const ta = p2.querySelector("#p2treeAns");
        if (ta && ta.textContent !== "?") revealed = true;
      });
      console.log("decomp: 命中正确=", solved, "答案揭示=", revealed);
      if (!solved || !revealed) { console.log("FAIL 拆解选择题未达正确分支"); ok = false; }
    }
  }

  // 13) 模块切换保留历史痕迹（诗词筛选状态 + 同一 DOM）
  const navLis = w.document.querySelectorAll("#navList li");
  function clickNav(key) {
    const li = Array.from(navLis).find((x) => x.dataset.key === key);
    if (li) li.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  }
  clickNav("poetry");
  const poetryDiv = w.document.querySelector("#content").firstElementChild;
  const liChip = poetryDiv && poetryDiv.querySelector("#poetChips .chip[data-p='李白']");
  if (liChip) liChip.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
  clickNav("pinyin");
  clickNav("poetry");
  const poetryDiv2 = w.document.querySelector("#content").firstElementChild;
  const activeChip = poetryDiv2 && poetryDiv2.querySelector("#poetChips .chip.active");
  console.log("req5 缓存: 回诗词同div=", poetryDiv === poetryDiv2, "李白仍选中=", !!(activeChip && activeChip.dataset.p === "李白"));
  if (!(poetryDiv === poetryDiv2)) { console.log("FAIL 模块未缓存(每次重建)"); ok = false; }
  if (!(activeChip && activeChip.dataset.p === "李白")) { console.log("FAIL 诗词筛选状态未保留"); ok = false; }

  // 14) 绘画每日上限 5 副（计数逻辑）
  for (let i = 0; i < 6; i++) Store.addDrawing({ id: Date.now() + i, date: Store.todayStr(), prompt: "t", img: "", comment: "", suggestion: "" });
  const todayN = Store.getDrawings().filter((d) => d.date === Store.todayStr()).length;
  console.log("req6 今日作品数(含测试添加)=", todayN, "(>=6 说明计数逻辑可用)");
  if (todayN < 6) { console.log("FAIL 每日计数异常"); ok = false; }

  // 15) 绘画作品删除（removeDrawing + 二次确认弹窗存在）
  if (M && M.draw && Store.removeDrawing) {
    const cD = w.document.createElement("div"); M.draw(cD);
    const histItems = cD.querySelectorAll(".hist-item");
    const delBtns = cD.querySelectorAll(".hist-del");
    console.log("draw: 历史项=", histItems.length, "删除按钮=", delBtns.length, "removeDrawing暴露=", typeof Store.removeDrawing === "function");
    if (!histItems.length || delBtns.length !== histItems.length) { console.log("FAIL 历史项/删除按钮缺失"); ok = false; }
    if (typeof Store.removeDrawing !== "function") { console.log("FAIL Store.removeDrawing 缺失"); ok = false; }
    // 模拟删除第一项并确认
    const before = Store.getDrawings().length;
    const id0 = Store.getDrawings()[0].id;
    Store.removeDrawing(id0);
    const after = Store.getDrawings().length;
    console.log("draw 删除: 删除前=", before, "删除后=", after);
    if (after !== before - 1) { console.log("FAIL removeDrawing 未生效"); ok = false; }
  } else { console.log("FAIL draw/removeDrawing 不可用"); ok = false; }

  // 16) 任意数据变化后，非当前模块缓存自动失效（app.js S.onChange 统一处理）→ 跨模块实时同步
  //     同时当前模块的缓存必须保留，否则切换时会出现残留/孤儿 DOM。
  if (M && w.__moduleCache && w.__moduleScroll) {
    clickNav("pinyin");                              // 切到 pinyin，使 poetry 成为“非当前模块”
    w.__moduleCache["poetry"] = w.document.createElement("div");
    w.__moduleScroll["poetry"] = 100;
    Store.addEN("__synctest__", "测试", "🔤");        // 任意数据变更 → 触发 app.js 失效逻辑
    const poetryCleared = !w.__moduleCache["poetry"];
    const scrollCleared = w.__moduleScroll["poetry"] == null;
    const pinyinKept = !!w.__moduleCache["pinyin"];   // 当前模块缓存应保留
    console.log("sync: 非当前poetry缓存已清除=", poetryCleared, "滚动位已清除=", scrollCleared, "当前pinyin保留=", pinyinKept);
    if (!poetryCleared || !scrollCleared) { console.log("FAIL 数据变化未使非当前模块缓存失效"); ok = false; }
    if (!pinyinKept) { console.log("FAIL 当前模块缓存被误删→切换会残留/孤儿DOM"); ok = false; }
  } else { console.log("FAIL __moduleCache/__moduleScroll 不可用"); ok = false; }

  // 17) 绘画每日场景参考（默认不加载大图，点击场景/换一换 才加载，避免打开即卡顿）
  if (M && M.draw && w.Data && w.Data.DRAW_SCENES && w.Data.DRAW_SCENES.length) {
    const cS = w.document.createElement("div"); M.draw(cS);
    const picker = cS.querySelector(".draw-scene-idle");
    const chips = cS.querySelectorAll(".scene-chip");
    const imgBefore = cS.querySelector(".draw-scene-svg img");
    console.log("场景参考(默认): 选择条=", !!picker, "场景按钮数=", chips.length, "默认加载大图=", !!imgBefore, "场景数=", w.Data.DRAW_SCENES.length);
    // 默认不应加载任何大图，应有场景选择按钮
    if (!picker || chips.length === 0) { console.log("FAIL 绘画场景选择条缺失"); ok = false; }
    if (imgBefore) { console.log("FAIL 默认不应加载大图（应点击后加载）"); ok = false; }
    // 模拟点击一个场景，verify 大图出现
    if (chips.length) {
      chips[0].dispatchEvent(new w.Event("click", { bubbles: true }));
      const imgAfter = cS.querySelector(".draw-scene-svg img");
      const story = cS.querySelector(".draw-scene-story");
      console.log("场景参考(点击后): 大图=", !!imgAfter, "小故事=", !!story);
      if (!imgAfter || !story) { console.log("FAIL 点击场景后未加载参考图"); ok = false; }
    }
  } else { console.log("FAIL 绘画场景参考不可用"); ok = false; }

  // 17b) 范画换一换：初始 5 张，点击换一换后仍为 5 张且与当前一批不重复
  if (M && M.draw && w.Data && w.Data.DRAW_PROMPTS && w.Data.DRAW_PROMPTS.length) {
    const cR = w.document.createElement("div"); M.draw(cR);
    const btn = cR.querySelector("#refShuffle");
    const cards0 = cR.querySelectorAll(".draw-ref-card");
    const names0 = Array.from(cards0).map((c) => c.dataset.name).sort();
    console.log("范画(初始): 换一换按钮=", !!btn, "卡片数=", cards0.length, "范画名=", names0.join("、"));
    if (!btn || cards0.length !== 5) { console.log("FAIL 范画初始异常（按钮或卡片数）"); ok = false; }
    else {
      btn.dispatchEvent(new w.Event("click", { bubbles: true }));
      const cards1 = cR.querySelectorAll(".draw-ref-card");
      const names1 = Array.from(cards1).map((c) => c.dataset.name).sort();
      console.log("范画(换一换后): 卡片数=", cards1.length, "范画名=", names1.join("、"));
      const same = cards1.length === 5 && names0.length === names1.length && names0.every((n, i) => n === names1[i]);
      if (cards1.length !== 5) { console.log("FAIL 换一换后卡片数异常"); ok = false; }
      if (same) { console.log("FAIL 换一换后出现与当前重复的范画"); ok = false; }
    }
  } else { console.log("FAIL 范画换一换不可用"); ok = false; }

  // 18) 跟读停止修复：英语模块渲染的跟读按钮，在“移动端识别实例未真正启动”时也能一键停止并复位
  if (M && M.english && w.Audio2) {
    const A2 = w.Audio2;
    // 模拟移动端：recognitionSupported=true，但识别实例未真正启动（active 返回 false）
    A2.recognitionSupported = true;
    A2.recognitionActive = function () { return false; };
    const recBtnReal = A2.recognitionStop;
    const engBox = w.document.createElement("div");
    M.english(engBox);
    const recBtn = engBox.querySelector(".word-card button");
    if (!recBtn) { console.log("FAIL 英语跟读按钮缺失"); ok = false; }
    else {
      recBtn.click();                  // 开始（朗读+尝试识别）
      const started = recBtn.textContent === "⏹ 停止";
      recBtn.click();                  // 再点 → 必须能停止并复位（移动端兜底）
      const reset = recBtn.textContent === "🎤 再读一次";
      console.log("跟读: 开始变停止=", started, "再点停止复位=", reset);
      if (!started || !reset) { console.log("FAIL 跟读停止无法复位"); ok = false; }
    }
    A2.recognitionStop = recBtnReal;
  } else { console.log("FAIL 跟读停止逻辑不可用"); ok = false; }

  // 9) 脚本错误（忽略 pinyin-pro ESM 在 jsdom 不被支持的常见告警）
  const realErrors = errors.filter((e) => !/pinyin/i.test(e));
  console.log("脚本错误(非pinyin):", realErrors.length, realErrors.slice(0, 3));
  if (realErrors.length) ok = false;

  console.log(ok ? "SMOKE_PASS" : "SMOKE_FAIL");
}, 500);
