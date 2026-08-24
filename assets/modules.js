/* =========================================================
   艾米的学习乐园 — 各学习模块 (Modules)
   每个模块接收 container 元素并渲染内容。
   约定：动态文本一律经 Store.esc() 转义；用户数据只用 textContent。
   ========================================================= */
window.Modules = (function () {
  "use strict";
  const S = window.Store, A = window.A, D = window.Data, esc = S.esc;

  /* ---------- 通用：词库/各模块缓存失效 ----------
     现已统一交由 app.js 的 S.onChange(invalidateStaleModules) 处理：
     任意数据变化（加词/加字/背诗/读绘本/绘画/游戏/打卡…）都会使“非当前模块”的
     缓存失效，下次进入即重新渲染，实现跨模块实时同步；当前模块由各模块的
     onAdded/render 回调原地刷新。此处保留空函数仅为兼容既有调用点。 */
  function notifyBankChange() { /* 缓存失效已在 app.js 统一处理，无需在此操作 */ }

  /* ---------- 通用：朗读评分小组件 ---------- */
  function readWidget(parent, opts) {
    opts = opts || {};
    const wrap = document.createElement("div");
    wrap.style.marginTop = "10px";
    wrap.innerHTML = `<button class="btn btn-sm">🎤 ${esc(opts.buttonLabel || "读一读")}</button> <span class="read-status"></span>`;
    parent.appendChild(wrap);
    const btn = wrap.querySelector("button");
    const status = wrap.querySelector(".read-status");
    let done = false;
    btn.addEventListener("click", () => {
      if (done) return;
      if (!A.recognitionSupported) {
        status.innerHTML = `<span class="feedback ok">说完啦？点击确认 👉</span> `;
        const ok = document.createElement("button");
        ok.className = "btn btn-mint btn-sm"; ok.textContent = "我读完了 ✓";
        ok.addEventListener("click", () => { done = true; status.innerHTML = `<span class="feedback ok">真棒！🌟</span>`; opts.onResult && opts.onResult({ manual: true, ok: true }); });
        wrap.appendChild(ok);
        return;
      }
      btn.disabled = true;
      status.innerHTML = '<span class="rec-dot"></span> 听你说…';
      A.recognize(opts.lang || "zh-CN", opts.dur || 6000, opts.expected || "", opts.threshold || 0.6)
        .then((r) => {
          btn.disabled = false;
          if (r.unsupported) { status.innerHTML = `<span class="feedback warn">设备不支持识别，点「我读完了」确认</span> `; return; }
          const pct = Math.round((r.score || 0) * 100);
          if (r.ok) { done = true; status.innerHTML = `<span class="feedback ok">读得真好！${pct}分 🌟</span>`; }
          else { status.innerHTML = `<span class="feedback warn">再试一次吧～ ${pct}分</span>`; }
          opts.onResult && opts.onResult(r);
        });
    });
  }

  /* ---------- 通用：长按弹窗（加入词库） ----------
     加入移动容差，避免孩子手指轻微滑动就取消长按 ---------- */
  function attachLongPress(el, handler) {
    let timer = null, startX = 0, startY = 0, startTime = 0, longFired = false;
    const LONG_MS = 500, MOVE_TOL = 10;
    function clear() {
      if (timer) { clearTimeout(timer); timer = null; }
    }
    function start(x, y) {
      longFired = false; startX = x; startY = y; startTime = Date.now();
      timer = setTimeout(() => { longFired = true; handler(startX, startY); }, LONG_MS);
    }
    function move(x, y) {
      if (!timer) return;
      if (Math.hypot(x - startX, y - startY) > MOVE_TOL) clear();
    }
    el.addEventListener("contextmenu", (e) => { e.preventDefault(); handler(e.clientX, e.clientY); });
    el.addEventListener("touchstart", (e) => {
      const t = e.touches[0];
      start(t.clientX, t.clientY);
    }, { passive: true });
    el.addEventListener("touchmove", (e) => {
      if (!timer) return;
      const t = e.touches[0];
      move(t.clientX, t.clientY);
    }, { passive: true });
    el.addEventListener("touchend", () => { clear(); });
    el.addEventListener("touchcancel", () => { clear(); });
    // 桌面端鼠标也支持长按
    el.addEventListener("mousedown", (e) => { if (e.button === 0) start(e.clientX, e.clientY); });
    el.addEventListener("mousemove", (e) => { if (timer) move(e.clientX, e.clientY); });
    el.addEventListener("mouseup", () => { clear(); });
    el.addEventListener("mouseleave", () => { clear(); });
    // 长按触发后，阻止紧随其后的 click 误关弹窗
    el.addEventListener("click", (e) => { if (longFired) { longFired = false; e.stopPropagation(); } });
  }
  function wordPopup(char, py, mean, kind, x, y, onAdded) {
    document.querySelectorAll(".ctx-menu").forEach((n) => n.remove());
    const m = document.createElement("div");
    m.className = "ctx-menu";
    const label = kind === "en" ? `「${esc(char)}」已经学会！我要加入词库！` : `「${esc(char)}」已经学会！我要加入词库！`;
    m.innerHTML = `<div class="cm-emoji">${kind === "en" ? "🔤" : "🌟"}</div>
      <div class="cm-text">${label}</div>
      <div style="font-size:13px;color:#8a6a78">${esc(py || "")} ${esc(mean || "")}</div>
      <button class="btn btn-primary btn-sm" style="margin-top:8px">确定！</button>`;
    m.style.left = Math.min(x, window.innerWidth - 240) + "px";
    m.style.top = Math.min(y, window.innerHeight - 160) + "px";
    document.body.appendChild(m);
    m.querySelector("button").addEventListener("click", () => {
      let added;
      if (kind === "en") added = S.addEN(char, mean, "🔤");
      else added = S.addCN(char, py, mean);
      m.remove();
      // 实时同步：新增后清除相关模块缓存，词库/识字/英语/诗词等下次访问即刷新
      notifyBankChange();
      window.App && window.App.toast(added ? "加入词库啦！📚" : "已经添加过咯！试试其他的吧~");
      if (onAdded) onAdded(added);
    });
    setTimeout(() => { const close = (e) => { if (!m.contains(e.target)) { m.remove(); document.removeEventListener("click", close); } }; document.addEventListener("click", close); }, 0);
  }

  /* ---------- 通用：判断汉字 / 取单字信息（拼音+释义） ---------- */
  function isCJK(ch) { return /[一-鿿]/.test(ch); }
  function getCharInfo(ch) {
    let py = "";
    try { if (window.pinyinPro) py = window.pinyinPro(ch, { type: "array", toneType: "symbol", nonZh: "removed" })[0] || ""; } catch (e) {}
    const mean = (window.Data && window.Data.COMMON_MEAN && window.Data.COMMON_MEAN[ch]) || "";
    return { py: py, mean: mean };
  }

  /* 通用：把一段文字渲染成「汉字带拼音」的标注（每个 CJK 字上方显示拼音） */
  function charRuby(text, hl) {
    if (!text) return "";
    let out = "";
    const arr = Array.from(text);
    for (const ch of arr) {
      if (isCJK(ch)) {
        let py = "";
        try { if (window.pinyinPro) py = window.pinyinPro(ch, { type: "array", toneType: "symbol", nonZh: "removed" })[0] || ""; } catch (e) {}
        out += `<span class="chr${hl ? " hl" : ""}" data-ch="${esc(ch)}"><span class="py">${esc(py)}</span>${esc(ch)}</span>`;
      } else {
        out += `<span class="punc">${esc(ch)}</span>`;
      }
    }
    return out;
  }

  /* ---------- 通用：录音组件（跟读 / 对话回答） ---------- */
  function attachRecorder(parent, opts) {
    opts = opts || {};
    const wrap = document.createElement("div");
    wrap.style.marginTop = "8px";
    parent.appendChild(wrap);
    const recBtn = document.createElement("button");
    recBtn.className = "btn btn-sm";
    recBtn.textContent = "🎤 " + (opts.label || "跟读");
    const status = document.createElement("span");
    status.className = "read-status";
    wrap.appendChild(recBtn);
    wrap.appendChild(status);

    let rec = null, autoTimer = null, playBtn = null;
    function clearPlayback() { if (playBtn) { playBtn.remove(); playBtn = null; } }

    recBtn.addEventListener("click", () => {
      if (rec) {
        clearTimeout(autoTimer);
        const api = rec; rec = null;
        api.stop().then((r) => onStopped(r));
      } else {
        if (opts.prompt) A.speak(opts.prompt, opts.lang || "en-US");
        clearPlayback();
        A.makeRecorder().then((api) => {
          rec = api;
          recBtn.textContent = "⏹ 停止";
          status.innerHTML = '<span class="rec-dot"></span> 录音中…';
          autoTimer = setTimeout(() => { recBtn.click(); }, opts.autoMs || 6000);
        }).catch(() => {
          status.innerHTML = '<span class="feedback warn">设备不支持录音，点「我读完啦」确认即可</span>';
          if (opts.fallback) opts.onStop && opts.onStop("", "");
        });
      }
    });

    function onStopped(r) {
      recBtn.textContent = "🎤 重录";
      clearPlayback();
      playBtn = document.createElement("button");
      playBtn.className = "btn btn-sm btn-mint";
      playBtn.textContent = "🔊 我的录音";
      playBtn.style.marginLeft = "8px";
      const audio = new Audio(r.url);
      audio.preload = "none";
      playBtn.addEventListener("click", () => audio.play());
      wrap.appendChild(playBtn);
      status.innerHTML = "";
      if (opts.recognize === false) { opts.onStop && opts.onStop(r.url, ""); return; }
      // 尝试识别孩子说的话，交给回调（用于 AI 对话对应回复）
      if (A.recognitionSupported) {
        status.innerHTML = '<span class="rec-dot"></span> 听你说…';
        A.recognize(opts.lang || "en-US", 4000, "", 0).then((res) => {
          status.innerHTML = "";
          opts.onStop && opts.onStop(r.url, res.transcript || "");
        }).catch(() => {
          status.innerHTML = "";
          opts.onStop && opts.onStop(r.url, "");
        });
      } else {
        opts.onStop && opts.onStop(r.url, "");
      }
    }
  }

  // 跟读按钮：单按钮切换（点击先朗读目标词，再开始录音/识别；再点停止并给出反馈）
  // 修复：移动端识别实例可能未真正启动（mode 卡在 rec 但 _recInst 为空），
  //       导致“停止”点击无效、一直转圈。现统一用 finished 状态机 + recognitionActive() 兜底，
  //       并在停止时 A.stop() 停掉正在朗读的语音，确保任意情况下都能一键停止并复位。
  function wireShadow(recBtn, recStat, w) {
    // finished=true 表示“当前空闲（未开始/已结束），可重新开始”
    let rec = null, autoTimer = null, mode = null, finished = true;
    function resetBtn(txt) {
      recBtn.textContent = txt; recBtn.classList.remove("rec-on");
    }
    function forceStop() {
      finished = true;
      clearTimeout(autoTimer); autoTimer = null;
      if (mode === "rec") { try { A.recognitionStop(); } catch (e) {} }
      else if (mode === "mic") { const a = rec; rec = null; if (a) { try { a.stop(); } catch (e) {} } }
      // 兜底：识别实例仍在（例如移动端已启动但未回调），强制停止并复位
      if (A.recognitionActive && A.recognitionActive()) { try { A.recognitionStop(); } catch (e) {} }
      // 停掉可能仍在朗读的语音
      if (A.stop && A.isSpeaking && A.isSpeaking()) { try { A.stop(); } catch (e) {} }
      done("");
    }
    recBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!finished) { forceStop(); return; } // 进行中 → 停止（任意模式、任意状态都能停）
      // 空闲 → 开始：先朗读目标词，再开始听孩子读
      finished = false; mode = A.recognitionSupported ? "rec" : "mic";
      A.speak(w.en, "en-US");
      recBtn.textContent = "⏹ 停止"; recBtn.classList.add("rec-on");
      recStat.textContent = "听你说…";
      if (mode === "rec") {
        autoTimer = setTimeout(() => { if (!finished) forceStop(); }, 9000);
        A.recognitionStart("en-US", {
          onPartial: (txt) => { recStat.textContent = "我听到：" + (txt || "…"); },
          onFinal: (res) => { if (!finished) { clearTimeout(autoTimer); finished = true; done(res && res.transcript); } }
        }).catch(() => { if (!finished) { finished = true; resetBtn("🎤 再读一次"); recStat.textContent = "设备不支持语音识别哦～"; } });
      } else {
        A.makeRecorder().then((api) => {
          if (finished || mode !== "mic") return;
          rec = api;
          autoTimer = setTimeout(() => { if (!finished) forceStop(); }, 6000);
        }).catch(() => {
          if (finished) return;
          finished = true; resetBtn("🎤 再读一次"); recStat.textContent = "设备不支持录音哦～";
        });
      }
    });
    function done(transcript) {
      mode = null;
      if (recBtn.textContent !== "⏹ 停止") return; // 已复位则不重复
      resetBtn("🎤 再读一次");
      const t = (transcript || "").toLowerCase().replace(/[^a-z ]/g, "").trim();
      const target = w.en.toLowerCase().replace(/[^a-z ]/g, "").trim();
      if (t && t.indexOf(target) >= 0) {
        recStat.textContent = "你读的是：" + transcript + " ✅ 读得真棒！";
        window.App && window.App.toast("跟读得很标准！🌟");
        A.speak("Great job!", "en-US");
      } else if (transcript) {
        recStat.textContent = "你读的是：" + transcript + " 💪 再试一次会更好！";
        window.App && window.App.toast("再试一次，你可以的！💪");
      } else {
        recStat.textContent = "跟读完成！真棒 🌟";
        window.App && window.App.toast("跟读完成！真棒 🌟");
      }
    }
  }

  /* =========================================================
     1) 拼音
     ========================================================= */
  function pinyin(container) {
    container.innerHTML = `
      <div class="module-title">🅿️ 拼音乐园</div>
      <div class="module-sub">上面是汉语拼音字母，点一点就能听到正确发音；下面玩拼音组合小游戏～</div>
      <div class="card">
        <div style="font-weight:800;color:var(--pink-600);margin-bottom:8px">声母（b p m f…）</div>
        <div class="alpha-grid" id="iniGrid"></div>
      </div>
      <div class="card">
        <div style="font-weight:800;color:var(--pink-600);margin-bottom:8px">韵母（a o e…）</div>
        <div class="alpha-grid" id="finGrid"></div>
      </div>
      <div class="card">
        <div style="font-weight:800;color:var(--pink-600);margin-bottom:8px">🎮 拼音组合游戏</div>
        <div class="module-sub">下面有 4 个字母方块，点一点正确的字母，按顺序拼出拼音，拼对就会出现一个字和图哦！</div>
        <div class="tile-row" id="pinyinTiles"></div>
        <div id="pinyinTarget" style="font-size:22px;font-weight:800;color:var(--purple);min-height:30px;margin:6px 0"></div>
        <div id="pinyinResult"></div>
        <button class="btn btn-ghost btn-sm" id="pinyinReset" style="margin-top:8px">🔄 换一个</button>
      </div>`;
    const ini = container.querySelector("#iniGrid");
    D.PINYIN_INITIALS.forEach((it) => {
      const c = document.createElement("div");
      c.className = "alpha-cell";
      c.innerHTML = `${esc(it.s)}<div class="alpha-label">${esc(it.ex)}</div>`;
      // 用中文例字发音，避免拉丁字母被读成英语
      c.addEventListener("click", () => A.speakPinyin(it.ex));
      ini.appendChild(c);
    });
    const fin = container.querySelector("#finGrid");
    D.PINYIN_FINALS.forEach((it) => {
      const c = document.createElement("div");
      c.className = "alpha-cell";
      c.innerHTML = `${esc(it.s)}<div class="alpha-label">${esc(it.ex)}</div>`;
      // 后鼻音韵母(ang/eng/ing/ong…)用 speakFinal 纠正发音
      c.addEventListener("click", () => A.speakFinal(it));
      fin.appendChild(c);
    });

    const target = container.querySelector("#pinyinTarget");
    const result = container.querySelector("#pinyinResult");
    const tilesEl = container.querySelector("#pinyinTiles");
    let pOffset = 0;
    function nextCombo() { return D.PINYIN_COMBOS[S.dailyIndex(D.PINYIN_COMBOS.length, pOffset++)]; }
    let combo = nextCombo();
    let picked = [];

    // 去声调：把带调字母还原成基础字母（用于拼字判定）
    function stripTone(s) {
      return (s || "")
        .replace(/[āáǎà]/g, "a").replace(/[ōóǒò]/g, "o").replace(/[ēéěè]/g, "e")
        .replace(/[īíǐì]/g, "i").replace(/[ūúǔù]/g, "u").replace(/[ǖǘǚǜü]/g, "ü")
        .replace(/[ḿ]/g, "m").replace(/[ńňǹ]/g, "n");
    }

    function renderTiles() {
      tilesEl.innerHTML = "";
      const targetLetters = stripTone(combo.combo).split("");
      // 用「目标字母 + 干扰字母」凑成 4 个方块，打乱顺序
      const pool = ["b","p","m","f","d","t","n","l","g","k","h","j","q","x","z","c","s","y","w","a","o","e","i","u","ü"];
      const used = new Set(targetLetters);
      const distract = [];
      const need = 4 - targetLetters.length;
      for (const L of pool) {
        if (distract.length >= need) break;
        if (used.has(L)) continue;
        distract.push(L); used.add(L);
      }
      const all = targetLetters.concat(distract).sort(() => Math.random() - 0.5);
      all.forEach((L) => {
        const t = document.createElement("div");
        t.className = "tile"; t.textContent = L; t.dataset.l = L;
        t.addEventListener("click", () => {
          if (t.classList.contains("sel")) return;
          if (picked.length >= targetLetters.length) return;
          picked.push(L);
          t.classList.add("sel"); t.style.pointerEvents = "none";
          target.textContent = picked.join(" ");
          if (picked.length === targetLetters.length) checkCombo();
        });
        tilesEl.appendChild(t);
      });
    }
    function checkCombo() {
      const got = picked.join("").toLowerCase();
      const want = stripTone(combo.combo).toLowerCase();
      if (got === want) {
        A.speakPinyin(combo.word);
        result.innerHTML = `<div class="feedback ok">拼对啦！你拼出了「${esc(combo.combo)}」→ ${esc(combo.char)} ${esc(combo.emoji)}（${esc(combo.word)}）🎉</div>
          <div class="py-result"><div class="py-result-emoji">${esc(combo.emoji)}</div><div class="py-result-char">${esc(combo.char)}</div><div class="py-result-word">${esc(combo.word)}</div></div>
          <div class="py-hint">💡 拼读一下吧，小公主～</div>`;
        A.speak("拼读一下吧，小公主", "zh-CN");
        setTimeout(() => A.speakPinyin(combo.char), 1300);
        setTimeout(() => A.speakPinyin(combo.word), 2700);
        setTimeout(() => { combo = nextCombo(); picked = []; target.textContent = ""; result.innerHTML = ""; renderTiles(); }, 5200);
      } else {
        result.innerHTML = `<div class="feedback warn">再试试看～ 要拼成「${esc(want)}」哦</div>`;
        setTimeout(() => { picked = []; target.textContent = ""; result.innerHTML = ""; renderTiles(); }, 1500);
      }
    }
    container.querySelector("#pinyinReset").addEventListener("click", () => {
      combo = nextCombo(); picked = []; target.textContent = ""; result.innerHTML = ""; renderTiles();
    });
    renderTiles();
  }

  /* =========================================================
     2) 识字
     ========================================================= */
  function shizi(container) {
    // 当天默认 1 篇故事（S.getDailyStory 按天轮换）；「换一换」切换今天还没看过的故事
    function render(story) {
    container.innerHTML = `
      <div class="module-title">📖 识字小故事</div>
      <div class="module-sub">今天是《${esc(story.title)}》。每个字都能点读；双击或长按任意汉字，就能加入词库哦（黄色的是今天的新字）！</div>
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;font-weight:800;color:var(--pink-600);margin-bottom:6px"><span>📚 ${esc(story.title)}</span><button class="btn btn-ghost btn-sm" id="storyShuffle" title="换一篇没看过的故事">🔄 换一换</button></div>
        <div class="story-text" id="storyText"></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">
          <button class="btn btn-sm" id="storyRead">🔊 朗读全文</button>
        </div>
        <div id="storyReadArea"></div>
      </div>
      <div class="card">
        <div style="font-weight:800;color:var(--pink-600);margin-bottom:6px">🎤 自读打分</div>
        <div class="module-sub">读完上面的故事，点下面的按钮开始录音，读完点结束，正确率 60% 以上就完成任务，奖 2 朵小红花！</div>
        <div id="storySelf"></div>
      </div>
      <div class="card">
        <div style="font-weight:800;color:var(--pink-600);margin-bottom:6px">🎮 文字小游戏</div>
        <div class="module-sub">左边是今天的新字，右边是打乱的拼音。先点一个字，再点对应的拼音连起来，全对就收获一朵小花！</div>
        <div class="match-wrap" id="matchWrap"></div>
        <div id="matchResult"></div>
      </div>`;

    // 渲染故事：每个汉字都可点读（单击朗读）、双击/长按加入词库（含非新字）
    const storyText = container.querySelector("#storyText");
    const charMap = {};
    story.newChars.forEach((c) => { charMap[c.char] = c; });
    // 先把多字「新词」整体标为高亮，其余逐字包成可交互 span
    const newReSrc = story.newChars.map((c) => c.char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    const newRe = newReSrc ? new RegExp("(" + newReSrc + ")", "g") : null;
    const parts = [];
    const text = story.text;
    if (newRe) {
      let last = 0, m;
      while ((m = newRe.exec(text)) !== null) {
        if (m.index > last) parts.push({ t: text.slice(last, m.index), hl: false });
        parts.push({ t: m[0], hl: true });
        last = m.index + m[0].length;
      }
      if (last < text.length) parts.push({ t: text.slice(last), hl: false });
    } else {
      parts.push({ t: text, hl: false });
    }
    let html = "";
    parts.forEach((part) => { html += charRuby(part.t, part.hl); });
    storyText.innerHTML = html;
    const inBank = new Set(S.getCN().map((x) => x.char));
    storyText.querySelectorAll(".chr").forEach((sp) => {
      const ch = sp.dataset.ch;
      if (inBank.has(ch)) sp.classList.add("done-added");
      sp.addEventListener("click", () => A.speak(ch, "zh-CN"));
      sp.addEventListener("dblclick", (e) => { e.preventDefault(); addCharToBank(ch, e.clientX, e.clientY); });
      attachLongPress(sp, (x, y) => addCharToBank(ch, x, y));
    });
    function addCharToBank(ch, x, y) {
      const info = charMap[ch] || getCharInfo(ch);
      wordPopup(ch, info.py, info.mean, "cn", x || 120, y || 120, (added) => {
        if (added) storyText.querySelectorAll(".chr").forEach((sp) => { if (sp.dataset.ch === ch) sp.classList.add("done-added"); });
      });
    }
    container.querySelector("#storyRead").addEventListener("click", () => A.speak(story.text, "zh-CN"));

    // 自读
    let selfDone = false;
    readWidget(container.querySelector("#storySelf"), {
      buttonLabel: "🎤 开始自读", lang: "zh-CN", dur: 16000, expected: story.text, threshold: 0.6,
      onResult: (r) => {
        if ((r.ok || r.manual) && !selfDone) { selfDone = true; S.addFlowers(2, "自读故事"); window.App && window.App.toast("自读完成任务！+2 🌺"); }
      }
    });

    // 文字小游戏
    const matchWrap = container.querySelector("#matchWrap");
    const matchResult = container.querySelector("#matchResult");
    const leftChars = story.newChars.slice(0, 5);
    const rightPy = leftChars.map((c) => c.py).sort(() => Math.random() - 0.5);
    let picked = null;
    const leftCol = document.createElement("div"); leftCol.className = "match-col";
    const rightCol = document.createElement("div"); rightCol.className = "match-col";
    leftChars.forEach((c) => {
      const it = document.createElement("div");
      it.className = "match-item"; it.textContent = c.char; it.dataset.py = c.py;
      it.addEventListener("click", () => {
        if (it.classList.contains("done-ok")) return;
        document.querySelectorAll(".match-item.picked").forEach((n) => n.classList.remove("picked"));
        it.classList.add("picked"); picked = it;
      });
      leftCol.appendChild(it);
    });
    rightPy.forEach((py) => {
      const it = document.createElement("div");
      it.className = "match-item"; it.textContent = py; it.dataset.py = py;
      it.addEventListener("click", () => {
        if (!picked) { window.App && window.App.toast("先点左边的字哦～"); return; }
        if (it.dataset.py === picked.dataset.py) {
          it.classList.add("done-ok"); it.innerHTML = esc(py) + '<span class="mk">✅</span>';
          picked.classList.add("done-ok"); picked.classList.remove("picked");
          const done = leftCol.querySelectorAll(".done-ok").length;
          if (done === leftChars.length) {
            matchResult.innerHTML = `<div class="feedback ok">你真棒！收获一朵小花！🌸</div>`;
            S.addFlowers(1, "文字游戏");
          }
          picked = null;
        } else {
          it.classList.add("done-bad"); it.innerHTML = esc(py) + '<span class="mk">❌</span>';
          setTimeout(() => { it.classList.remove("done-bad"); it.innerHTML = esc(py); }, 800);
          picked.classList.remove("picked"); picked = null;
        }
      });
      rightCol.appendChild(it);
    });
    matchWrap.appendChild(leftCol); matchWrap.appendChild(rightCol);

    // 换一换：切换到今天还没看过的故事（当天记录持久化，刷新后保持）
    const shuffleBtn = container.querySelector("#storyShuffle");
    if (shuffleBtn) shuffleBtn.addEventListener("click", () => {
      const s = S.shuffleStory();
      if (s) { render(s); window.App && window.App.toast("换了一篇新故事～"); }
    });
  }
  render(S.getDailyStory() || (D.STORIES && D.STORIES[0]) || { title: "", text: "", newChars: [] });
  }

  /* =========================================================
     3) 计算
     ========================================================= */
  function tenFrame(filled, total) {
    let h = "";
    for (let i = 0; i < total; i++) {
      h += `<div class="cell ${i < filled ? "filled" : ""}" data-i="${i}">${i < filled ? "🐱" : ""}</div>`;
    }
    return `<div class="tenframe">${h}</div>`;
  }

  function math(container) {
    container.innerHTML = `
      <div class="module-title">🔢 快乐计算</div>
      <div class="module-sub">十格法、凑十破十、口算小游戏，玩着学数学！</div>
      <div class="card" id="mPart1"></div>
      <div class="card" id="mPart2"></div>
      <div class="card" id="mPart3"></div>`;
    mathPart1(container.querySelector("#mPart1"));
    mathPart2(container.querySelector("#mPart2"));
    mathPart3(container.querySelector("#mPart3"));
  }

  function mathPart1(box) {
    function newProblem(seed) {
      const rnd = (seed != null) ? S.seededRand(seed) : Math.random;
      const a = 4 + Math.floor(rnd() * 6);          // 大数 4-9
      const maxB = 10 - a;
      const b = 1 + Math.floor(rnd() * maxB);        // 小数
      box.innerHTML = `
        <div style="font-weight:800;color:var(--pink-600)">🐱 十格法（10 以内加法）</div>
        <div class="module-sub">格子里已经有 <b>${a}</b> 只小动物，点空格子再添一些小动物，然后算出一共有几只。</div>
        <div id="tf"></div>
        <div style="margin:8px 0">已经添了 <b id="added">0</b> 只，一共 = ${a} + <span id="added2">0</span> = ?</div>
        <input class="text-input" id="ans" inputmode="numeric" placeholder="输入答案" style="max-width:160px;display:inline-block" />
        <button class="btn btn-sm" id="chk" style="margin-left:8px">✅ 确定</button>
        <div id="m1res"></div>`;
      const tf = box.querySelector("#tf");
      tf.innerHTML = tenFrame(a, 10);
      const cells = tf.querySelectorAll(".cell");
      const addedEl = box.querySelector("#added"), addedEl2 = box.querySelector("#added2");
      let added = 0;
      const userFilled = new Set();
      cells.forEach((cell, idx) => {
        if (cell.classList.contains("filled")) return; // 题目已有的小动物不能取消
        cell.addEventListener("click", () => {
          if (userFilled.has(idx)) {
            userFilled.delete(idx);
            cell.classList.remove("filled"); cell.textContent = "";
            added--;
          } else {
            userFilled.add(idx);
            cell.classList.add("filled"); cell.textContent = "🐱";
            added++;
          }
          addedEl.textContent = added; addedEl2.textContent = added;
        });
      });
      box.querySelector("#chk").addEventListener("click", () => {
        const ans = parseInt(box.querySelector("#ans").value, 10);
        const correct = a + added;
        const res = box.querySelector("#m1res");
        if (ans === correct) {
          res.innerHTML = `<div class="feedback ok">你真棒！收获一朵小红花！🌺<br>方法：${a} + ${added} = ${correct}</div>`;
          S.addFlowers(1, "十格计算");
        } else {
          res.innerHTML = `<div class="feedback warn">加油！还差一点点哦~ 正确答案是 ${correct}（${a} + ${added}）</div>`;
        }
      });
    }
    newProblem(S.todaySeed());
    const btn = document.createElement("button");
    btn.className = "btn btn-ghost btn-sm"; btn.textContent = "🔄 换一题";
    btn.style.marginTop = "10px";
    btn.addEventListener("click", () => { newProblem(); });
    box.appendChild(btn);
  }

  function mathPart2(box) {
    box.innerHTML = `
      <div style="font-weight:800;color:var(--pink-600)">🌿 20 以内：拆一拆，算一算</div>
      <div class="module-sub">把数字拆开，先凑成 10，再加剩下的数，就很容易啦！</div>
      <div class="decomp-card" id="p2q"></div>
      <button class="btn btn-ghost btn-sm" id="p2next" style="margin-top:10px">🔄 换一题</button>`;

    function makeTree(isAdd, a, b, splitLeft, splitRight, ans) {
      if (isAdd) {
        return `
        <svg viewBox="0 0 360 210" xmlns="http://www.w3.org/2000/svg">
          <defs><style>
            .dn{fill:#5a3e36;font-size:26px;font-weight:800;text-anchor:middle;dominant-baseline:middle}
            .ds{fill:#7a5c4c;font-size:17px;text-anchor:middle;dominant-baseline:middle}
            .box{fill:#fff9c4;stroke:#f9c74f;stroke-width:2}
            .ten{fill:#c8f7c5;stroke:#8fd68f;stroke-width:2}
            .br{stroke:#bfa78f;stroke-width:2;fill:none}
            .op{fill:#e07a5f;font-size:22px;font-weight:800;text-anchor:middle;dominant-baseline:middle}
          </style></defs>
          <!-- 拆第二个数 -->
          <text x="160" y="22" class="dn">${b}</text>
          <line x1="160" y1="30" x2="130" y2="60" class="br"/>
          <line x1="160" y1="30" x2="190" y2="60" class="br"/>
          <rect x="112" y="62" width="36" height="32" rx="8" class="box"/>
          <text x="130" y="78" class="dn">${splitLeft}</text>
          <text x="160" y="78" class="op">+</text>
          <rect x="172" y="62" width="36" height="32" rx="8" class="box"/>
          <text x="190" y="78" class="dn">${splitRight}</text>
          <!-- 第一个数 -->
          <text x="70" y="78" class="dn">${a}</text>
          <!-- 凑十 -->
          <line x1="70" y1="90" x2="70" y2="115" class="br"/>
          <line x1="130" y1="94" x2="130" y2="115" class="br"/>
          <line x1="70" y1="115" x2="130" y2="115" class="br"/>
          <line x1="100" y1="115" x2="100" y2="138" class="br"/>
          <text x="100" y="108" class="op">+</text>
          <rect x="84" y="140" width="32" height="28" rx="6" class="ten"/>
          <text x="100" y="154" class="ds">10</text>
          <!-- 结果（先隐藏为 ?，答对后揭示） -->
          <text x="100" y="196" class="dn">10</text>
          <text x="138" y="196" class="ds">+</text>
          <text x="176" y="196" class="dn">${splitRight}</text>
          <text x="214" y="196" class="ds">=</text>
          <text x="252" y="196" class="dn" id="p2treeAns">?</text>
        </svg>`;
      } else {
        const after10 = 10 - b;
        return `
        <svg viewBox="0 0 360 210" xmlns="http://www.w3.org/2000/svg">
          <defs><style>
            .dn{fill:#5a3e36;font-size:26px;font-weight:800;text-anchor:middle;dominant-baseline:middle}
            .ds{fill:#7a5c4c;font-size:17px;text-anchor:middle;dominant-baseline:middle}
            .box{fill:#fff9c4;stroke:#f9c74f;stroke-width:2}
            .ten{fill:#c8f7c5;stroke:#8fd68f;stroke-width:2}
            .br{stroke:#bfa78f;stroke-width:2;fill:none}
            .op{fill:#e07a5f;font-size:22px;font-weight:800;text-anchor:middle;dominant-baseline:middle}
          </style></defs>
          <!-- 拆被减数 -->
          <text x="70" y="22" class="dn">${a}</text>
          <line x1="70" y1="30" x2="40" y2="60" class="br"/>
          <line x1="70" y1="30" x2="100" y2="60" class="br"/>
          <rect x="22" y="62" width="36" height="32" rx="8" class="ten"/>
          <text x="40" y="78" class="ds">10</text>
          <text x="70" y="78" class="op">+</text>
          <rect x="82" y="62" width="36" height="32" rx="8" class="box"/>
          <text x="100" y="78" class="dn">${splitRight}</text>
          <!-- 减数 -->
          <text x="190" y="78" class="dn">${b}</text>
          <!-- 10 - b -->
          <line x1="40" y1="94" x2="40" y2="115" class="br"/>
          <line x1="190" y1="94" x2="190" y2="115" class="br"/>
          <line x1="40" y1="115" x2="190" y2="115" class="br"/>
          <line x1="115" y1="115" x2="115" y2="138" class="br"/>
          <text x="115" y="108" class="op">−</text>
          <rect x="99" y="140" width="32" height="28" rx="6" class="ten"/>
          <text x="115" y="154" class="dn">${after10}</text>
          <!-- 结果（先隐藏为 ?，答对后揭示） -->
          <text x="115" y="196" class="dn">${after10}</text>
          <text x="153" y="196" class="ds">+</text>
          <text x="191" y="196" class="dn">${splitRight}</text>
          <text x="229" y="196" class="ds">=</text>
          <text x="267" y="196" class="dn" id="p2treeAns">?</text>
        </svg>`;
      }
    }

    function newProblem(seed) {
      const rnd = (seed != null) ? S.seededRand(seed) : Math.random;
      const isAdd = rnd() < 0.55; // 优先加法，与截图一致
      let a, b, op, ans, splitLeft, splitRight, tree;
      if (isAdd) {
        a = 2 + Math.floor(rnd() * 8);   // 2-9，保证凑十需要量为正
        const need = 10 - a;              // 需要几才能凑 10
        b = need + Math.floor(rnd() * (10 - need)); // 保证拆完 rest≥0
        op = "+"; ans = a + b;
        splitLeft = need; splitRight = b - need;
      } else {
        a = 11 + Math.floor(rnd() * 8);  // 11-18
        b = 1 + Math.floor(rnd() * 9);    // 1-9
        op = "−"; ans = a - b;
        splitLeft = 10; splitRight = a - 10;
      }
      tree = makeTree(isAdd, a, b, splitLeft, splitRight, ans);

      const choices = new Set([ans]);
      while (choices.size < 3) {
        let d = ans + (Math.floor(rnd() * 7) - 3);
        if (d < 0) d = ans + (Math.floor(rnd() * 5) + 1);
        choices.add(d);
      }
      const arr = Array.from(choices).sort(() => rnd() - 0.5);

      const qEl = box.querySelector("#p2q");
      qEl.innerHTML = `
        <div class="decomp-eq">${a} ${op} ${b} = <span class="decomp-ans" id="p2ans">?</span></div>
        <div class="decomp-tree">${tree}</div>
        <div class="decomp-tip" id="p2tip">先拆一拆，再选出正确答案吧！</div>
        <div class="decomp-choices" id="p2choices"></div>
        <div id="p2res"></div>`;
      const cEl = qEl.querySelector("#p2choices");
      arr.forEach((c) => {
        const btn = document.createElement("button");
        btn.className = "btn decomp-choice";
        btn.textContent = c;
        btn.addEventListener("click", () => {
          const res = qEl.querySelector("#p2res");
          const tip = qEl.querySelector("#p2tip");
          const ansSpan = qEl.querySelector("#p2ans");
          if (c === ans) {
            ansSpan.textContent = ans;
            const treeAns = qEl.querySelector("#p2treeAns");
            if (treeAns) treeAns.textContent = ans;   // 揭示树图里被隐藏的结果
            res.innerHTML = `<div class="feedback ok">你真棒！🌺</div>`;
            tip.textContent = isAdd
              ? `把 ${b} 拆成 ${splitLeft} + ${splitRight}，${a} + ${splitLeft} = 10，10 + ${splitRight} = ${ans}`
              : `把 ${a} 拆成 10 + ${splitRight}，10 − ${b} = ${10 - b}，${10 - b} + ${splitRight} = ${ans}`;
            S.addFlowers(1, "20以内分解");
            setTimeout(() => newProblem(), 1600);
          } else {
            res.innerHTML = `<div class="feedback warn">再看看？🤔</div>`;
          }
        });
        cEl.appendChild(btn);
      });
    }
    newProblem(S.todaySeed());
    box.querySelector("#p2next").addEventListener("click", () => newProblem());
  }

  function mathPart3(box) {
    box.innerHTML = `<div style="font-weight:800;color:var(--pink-600)">🎮 口算小游戏</div><div id="g3"></div>`;
    function newProblem(seed) {
      const rnd = (seed != null) ? S.seededRand(seed) : Math.random;
      const a = 1 + Math.floor(rnd() * 19);
      const b = 1 + Math.floor(rnd() * 19);
      const isAdd = rnd() < 0.5;
      const ans = isAdd ? a + b : Math.max(a, b) - Math.min(a, b);
      const op = isAdd ? "+" : "−";
      const q = `${Math.max(a, b)} ${op} ${Math.min(a, b)}`;
      const choices = new Set([ans]);
      while (choices.size < 4) { choices.add(ans + (Math.floor(rnd() * 11) - 5)); }
      const arr = Array.from(choices).sort(() => rnd() - 0.5);
      const g = box.querySelector("#g3");
      g.innerHTML = `
        <div style="font-size:24px;font-weight:800;margin:8px 0">${esc(q)} = ?</div>
        <div class="tile-row" id="choices"></div>
        <div id="g3res"></div>`;
      const cEl = g.querySelector("#choices");
      arr.forEach((c) => {
        const t = document.createElement("div"); t.className = "tile"; t.textContent = c;
        t.addEventListener("click", () => {
          const res = g.querySelector("#g3res");
          if (c === ans) { res.innerHTML = `<div class="feedback ok">你真棒！收获一朵小红花！🌺</div>`; S.addFlowers(1, "口算游戏"); setTimeout(newProblem, 1500); }
          else { res.innerHTML = `<div class="feedback warn">加油！还差一点点哦~</div>`; }
        });
        cEl.appendChild(t);
      });
    }
    newProblem(S.todaySeed());
  }

  /* =========================================================
     4) 英语
     ========================================================= */
  function english(container) {
    const dialogue = D.EN_DIALOGUES[S.dailyIndex(D.EN_DIALOGUES.length)];
    container.innerHTML = `
      <div class="module-title">🔤 英语乐园</div>
      <div class="module-sub">点图听音，长按卡片加入词库。每天固定 5 个新单词，学会的会打勾留在「今日新学」；以前学会的进入「复习记录」哦～</div>
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;font-weight:800;color:var(--pink-600)"><span>🌱 今日新学（<span id="newCount">0</span> 个）</span><button class="btn btn-ghost btn-sm" id="newShuffle" title="换一批不同的新单词">🔄 换一换</button></div>
        <div class="word-grid" id="wordGridNew"></div>
      </div>
      <div class="card">
        <div style="font-weight:800;color:var(--pink-600)">📒 复习记录（<span id="revCount">0</span> 个）</div>
        <div class="word-grid" id="wordGridRev"></div>
      </div>
      <div class="card">
        <div style="font-weight:800;color:var(--pink-600)">💬 每日小对话：${esc(dialogue.title)}</div>
        <div id="dialogueBox"></div>
        <button class="btn btn-mint btn-sm" id="dlgAll" style="margin-top:8px">🔊 一键读全文</button>
      </div>
      <div class="card" id="aiTalkBox"></div>`;

    const gridNew = container.querySelector("#wordGridNew");
    const gridRev = container.querySelector("#wordGridRev");

    function renderWordCard(grid, w) {
      const card = document.createElement("div");
      card.className = "word-card";
      const inBank = S.getEN().some((x) => x.en === w.en);
      card.innerHTML = `<div class="word-emoji${inBank ? " added" : ""}">${esc(w.emoji)}${inBank ? '<span class="chk-badge">✓</span>' : ""}</div>
        <div class="word-en${inBank ? " added" : ""}">${esc(w.en)}</div>
        <div class="word-cn">${esc(w.cn)}</div>
        <button class="btn btn-sm" style="margin-top:6px">🎤 跟读</button>
        <div class="read-status" style="margin-top:6px;min-height:18px;color:var(--purple);font-size:13px"></div>`;
      card.addEventListener("click", (e) => { if (e.target.tagName !== "BUTTON") A.speak(w.en, "en-US"); });
      attachLongPress(card, (x, y) => wordPopup(w.en, w.en, w.cn, "en", x, y, (addedFlag) => {
        if (addedFlag) rebuildWords();   // 加入词库后：保留在「今日新学」并打勾（每日 5 新词固定不变）
      }));
      const recBtn = card.querySelector("button");
      const recStat = card.querySelector(".read-status");
      wireShadow(recBtn, recStat, w);
      grid.appendChild(card);
    }

    // 今日新学 = 当天固定的 5 个新单词（getDailyEN 按天稳定，刷新后保持不变）；
    // 加入词库的单词仍留在「今日新学」并显示「已学会✓」，不会挪走，保证“一直保持新增状态”。
    // 复习记录 = 之前已学会（不在今日新学里的）单词。
    // 当前展示的“新单词”批次：默认当天固定的 5 个（刷新后不变）；
    // 点「换一换」在未学会单词里随机换一批不同的，方便多学一点。
    let curBatch = (S.getDailyEN().newKeys || []).slice();
    function rebuildWords() {
      const newSet = new Set(curBatch);
      const newWords = curBatch.map((k) => D.EN_WORDS.find((w) => w.en === k)).filter(Boolean);
      const reviewWords = S.getEN()
        .filter((x) => !newSet.has(x.en))
        .map((x) => D.EN_WORDS.find((w) => w.en === x.en) || x);
      gridNew.innerHTML = ""; gridRev.innerHTML = "";
      if (!newWords.length) gridNew.innerHTML = '<div class="tip">🎉 新单词都学会啦！去「复习记录」里巩固一下吧～</div>';
      else newWords.forEach((w) => renderWordCard(gridNew, w));
      if (!reviewWords.length) gridRev.innerHTML = '<div class="tip">还没有复习记录哦，先去「今日新学」学几个单词吧～</div>';
      else reviewWords.forEach((w) => renderWordCard(gridRev, w));
      const nc = container.querySelector("#newCount"); if (nc) nc.textContent = newWords.length;
      const rc = container.querySelector("#revCount"); if (rc) rc.textContent = reviewWords.length;
    }
    rebuildWords();
    // 换一换：在未加入词库的单词里挑一批不同于当前展示的新词
    container.querySelector("#newShuffle").addEventListener("click", () => {
      const bank = new Set(S.getEN().map((x) => x.en));
      const pool = D.EN_WORDS.filter((w) => !bank.has(w.en) && !curBatch.includes(w.en));
      const src = pool.length >= 5 ? pool : D.EN_WORDS.filter((w) => !bank.has(w.en));
      const shuffled = src.slice().sort(() => Math.random() - 0.5);
      let next = shuffled.slice(0, Math.min(5, shuffled.length)).map((w) => w.en);
      if (!next.length) next = curBatch.slice(0, 5);
      curBatch = next;
      rebuildWords();
      window.App && window.App.toast("换了一批新单词～");
    });

    const dlg = container.querySelector("#dialogueBox");
    dialogue.lines.forEach((ln, i) => {
      const row = document.createElement("div");
      row.style.cssText = "display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px dashed var(--line)";
      row.innerHTML = `<span style="font-size:34px">${esc(ln.emoji)}</span>
        <div style="flex:1"><div style="font-weight:800;color:var(--purple)">${esc(ln.en)}</div><div style="color:var(--ink-soft);font-size:14px">${esc(ln.cn)}</div></div>
        <button class="btn btn-sm">🔊</button>`;
      row.querySelector("button").addEventListener("click", () => A.speak(ln.en, "en-US"));
      dlg.appendChild(row);
    });
    container.querySelector("#dlgAll").addEventListener("click", () => {
      dialogue.lines.forEach((ln, i) => setTimeout(() => A.speak(ln.en, "en-US"), i * 1400));
    });

    aiTalk(container.querySelector("#aiTalkBox"));
  }

  // 真实 AI 对话（配置后启用，未配置则降级）
  function aiTalk(box) {
    box.innerHTML = `
      <div style="font-weight:800;color:var(--pink-600)">🤖 AI 对话练习</div>
      <div class="module-sub">配置好接口后，AI 老师会用英文和你聊天并鼓励你。</div>
      <div id="aiMsg" style="min-height:24px;margin-bottom:8px"></div>
      <button class="btn btn-sm" id="aiAsk">💡 让 AI 老师出个题</button>
      <button class="btn btn-mint btn-sm" id="aiAnswer" style="margin-left:6px">🎤 我来回答</button>
      <div id="aiRes"></div>`;
    const aiMsg = box.querySelector("#aiMsg");
    const aiRes = box.querySelector("#aiRes");
    const ai = S.getAI();
    if (!ai.base || !ai.key) {
      aiMsg.innerHTML = `<span class="feedback warn">还没配置 AI 接口，点右上角 ⚙️ 设置，或先点「出个题」用内置问题练习～</span>`;
    }
    const questions = ["Hello! What is your name?", "What is your favorite animal?", "How are you today?", "Can you count to three?", "What color do you like?"];
    let curQ = questions[Math.floor(Math.random() * questions.length)];
    box.querySelector("#aiAsk").addEventListener("click", () => {
      curQ = questions[Math.floor(Math.random() * questions.length)];
      aiMsg.innerHTML = `<b style="color:var(--purple)">AI 老师：</b>${esc(curQ)}`;
      A.speak(curQ, "en-US");
    });
    const aiRec = document.createElement("div");
    aiRec.id = "aiRec";
    aiRec.style.marginTop = "8px";
    box.appendChild(aiRec);
    box.querySelector("#aiAnswer").addEventListener("click", () => {
      const ansBtn = box.querySelector("#aiAnswer");
      ansBtn.style.display = "none";
      attachRecorder(aiRec, { label: "我来回答", prompt: curQ, lang: "en-US", autoMs: 8000, fallback: true,
        onStop: (url, transcript) => {
          aiRes.innerHTML = "AI 老师正在想…";
          callAI(curQ, transcript, aiMsg, aiRes);
        }
      });
    });
  }

  function callAI(question, childSaid, aiMsg, aiRes) {
    const ai = S.getAI();
    if (!ai.base || !ai.key) {
      const replies = ["Great job! You are amazing!", "Wonderful! Keep practicing!", "Excellent! I am proud of you!"];
      const rep = replies[Math.floor(Math.random() * replies.length)];
      aiMsg.innerHTML = `<b style="color:var(--purple)">AI 老师（英文）：</b>${esc(rep)}<br><span style="font-size:12px;color:#8a6a78">（未配置真实接口，使用内置鼓励语）</span>`;
      A.speak(rep, "en-US");
      return;
    }
    aiRes.innerHTML = "AI 老师正在想…";
    fetch(ai.base.replace(/\/$/, "") + "/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + ai.key },
      body: JSON.stringify({
        model: ai.model || "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a warm English teacher for a 5-year-old Chinese child. Reply in simple English with encouragement, under 20 words." },
          { role: "user", content: "Question: " + question + " Child answered: " + (childSaid || "(no speech)") + ". Encourage the child in simple English." }
        ]
      })
    }).then((r) => r.json()).then((d) => {
      const rep = (d.choices && d.choices[0] && d.choices[0].message.content) || "Great job!";
      aiMsg.innerHTML = `<b style="color:var(--purple)">AI 老师（英文）：</b>${esc(rep)}`;
      A.speak(rep, "en-US");
    }).catch((e) => {
      aiRes.innerHTML = `<div class="feedback warn">调用失败（可能是跨域/网络），先用内置鼓励语～</div>`;
      A.speak("Great job! You are amazing!", "en-US");
    });
  }

  /* =========================================================
     5) 逻辑
     ========================================================= */

  // —— 本地智能判题（无 AI 密钥时也能用）——
  function normalizeCN(s) {
    s = (s || "").replace(/[\s，。？！、,.?!~～"'""''（）()：:—\-]/g, "");
    s = s.replace(/^(我(觉得|想|猜|认为|看)|应该是?|答案是?|我的答案是?|正确答案是?|那就是?|就是|我觉得是|我想是|我猜是|对吗|对不对|是不是)/, "");
    s = s.replace(/^(是|对|呀|呢|吧|哦|啊|嘛|嗯|那个|这个)/, "");
    s = s.replace(/(呀|呢|吧|哦|啊|嘛|嗯|吗|啦|咯|哈|嘿|对吗|对不对|好不好|是吗)$/, "");
    return s;
  }
  const _CN_NUM = { 零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };
  function numOf(s) {
    if (s == null) return null;
    const m = String(s).match(/\d+/);
    if (m) return parseInt(m[0], 10);
    let total = null;
    for (const ch of String(s)) { if (ch in _CN_NUM) total = (total == null ? 0 : total) + _CN_NUM[ch]; }
    return total;
  }
  function judgeLogic(child, q) {
    const a = q.a;
    const c = normalizeCN(child);
    if (!c) return { correct: false };
    const aN = normalizeCN(a);
    if (c === aN) return { correct: true };
    if (c.indexOf(aN) >= 0 || aN.indexOf(c) >= 0) return { correct: true };
    const cn = numOf(c), an = numOf(a);
    if (cn != null && an != null && cn === an) return { correct: true };
    return { correct: false };
  }

  // 调用真实 AI 判断逻辑题（配置后启用，失败降级本地判题）
  function callLogicAI(q, child, verdictEl) {
    const ai = S.getAI();
    verdictEl.innerHTML = '<div class="read-status">🤖 AI 老师正在听你说…</div>';
    fetch(ai.base.replace(/\/$/, "") + "/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + ai.key },
      body: JSON.stringify({
        model: ai.model || "gpt-4o-mini",
        messages: [
          { role: "system", content: "你是温柔的幼儿老师（5岁小朋友）。根据孩子的回答和正确答案，用简单中文（不超过40字）先说孩子答对了还是答错了，再清楚给出正确答案，最后一句鼓励。不要说多余的话。" },
          { role: "user", content: "题目：" + q.q + "\n正确答案：" + q.a + "\n孩子说：" + (child || "(没听清)") }
        ]
      })
    }).then((r) => r.json()).then((d) => {
      const rep = (d.choices && d.choices[0] && d.choices[0].message.content) || "";
      verdictEl.innerHTML = '<div class="feedback ai">' + (rep ? esc(rep) : "") +
        '<br><span style="font-size:13px;color:#8a6a78">正确答案：「' + esc(q.a) + '」</span></div>';
      if (rep) A.speak(rep, "zh-CN");
    }).catch(() => {
      const j = judgeLogic(child, q);
      verdictEl.innerHTML = j.correct
        ? '<div class="feedback ok">答对啦！🎉 答案就是「' + esc(q.a) + '」！</div>'
        : '<div class="feedback warn">再想一想～ 正确答案是「' + esc(q.a) + '」💡 ' + esc(q.hint) + '</div>';
      A.speak(j.correct ? ("答对啦！答案就是" + q.a) : ("正确答案是" + q.a + "，加油"), "zh-CN");
    });
  }

  function logic(container) {
    container.innerHTML = `
      <div class="module-title">🧩 逻辑小火车</div>
      <div class="module-sub">动动小脑筋，把题做对啦！</div>
      <div style="display:flex;justify-content:flex-end;margin-bottom:8px">
        <button class="btn btn-ghost btn-sm" id="logicShuffle" title="换一组不同的逻辑题">🔄 换一组</button>
      </div>
      <div id="logicList"></div>`;
    let curQs = S.getDailyLogic();
    function renderLogic(qs) {
      const list = container.querySelector("#logicList");
      list.innerHTML = "";
      qs.forEach((q, idx) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <div style="font-weight:800;color:var(--pink-600)">第 ${idx + 1} 题 · ${esc(q.type)}</div>
        <div style="font-size:18px;margin:6px 0">${esc(q.q)}</div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <input class="text-input" placeholder="写出答案，或点话筒说" style="flex:1;min-width:140px;max-width:260px;" />
          <button class="btn btn-sm voice-btn" title="点一下开始录音，再点一下结束">🎤 说答案</button>
          <button class="btn btn-sm ans-btn" style="margin-left:0">✅ 看答案</button>
        </div>
        <div class="rec-status" style="min-height:20px;margin-top:4px"></div>
        <div class="ans" style="margin-top:8px"></div>`;
      const input = card.querySelector("input");
      const ans = card.querySelector(".ans");
      const ansBtn = card.querySelector(".ans-btn");
      const voiceBtn = card.querySelector(".voice-btn");
      const recStatus = card.querySelector(".rec-status");
      let recognizing = false;

      function checkAns() {
        const v = (input.value || "").trim();
        const right = v === q.a;
        ans.innerHTML = right
          ? `<div class="feedback ok">答对啦！🎉 答案就是「${esc(q.a)}」</div>`
          : `<div class="feedback warn">答案是「${esc(q.a)}」💡 ${esc(q.hint)}</div>`;
      }
      ansBtn.addEventListener("click", checkAns);
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") checkAns(); });

      // 语音答题：点一下开始录音，再点一下结束，然后 AI 判断是否正确
      function judgeVoice(childText) {
        input.value = childText;
        recStatus.innerHTML = '<span class="read-status">🗣️ 你说：' + esc(childText) + '</span>';
        const ai = S.getAI();
        if (ai.base && ai.key) {
          callLogicAI(q, childText, ans);
        } else {
          const j = judgeLogic(childText, q);
          ans.innerHTML = j.correct
            ? '<div class="feedback ok">答对啦！🎉 答案就是「' + esc(q.a) + '」，你真棒！</div>'
            : '<div class="feedback warn">再想一想～ 正确答案是「' + esc(q.a) + '」💡 ' + esc(q.hint) + '</div>';
          const say = j.correct ? ("答对啦！答案就是" + q.a + "，你真棒！") : ("正确答案是" + q.a + "，加油哦！");
          A.speak(say, "zh-CN");
        }
      }

      voiceBtn.addEventListener("click", () => {
        if (!A.recognitionSupported) { window.App && window.App.toast("设备不支持语音输入，用键盘写答案吧～"); return; }
        if (!recognizing) {
          recognizing = true;
          voiceBtn.textContent = "🔴 停止";
          voiceBtn.classList.add("rec-on");
          recStatus.innerHTML = '<span class="rec-dot"></span> 正在聆听，说出你的答案吧…';
          A.recognitionStart("zh-CN", {
            onPartial: (txt) => { if (txt) recStatus.innerHTML = '<span class="rec-dot"></span> 听到：' + esc(txt); },
            onFinal: (res) => {
              recognizing = false;
              voiceBtn.textContent = "🎤 重说";
              voiceBtn.classList.remove("rec-on");
              if (res.unsupported) { recStatus.innerHTML = '<span class="feedback warn">设备不支持语音，用键盘写答案吧～</span>'; return; }
              const t = (res.transcript || "").trim();
              if (t) judgeVoice(t);
              else recStatus.innerHTML = '<span class="feedback warn">没听清，再试一次吧～</span>';
            }
          });
        } else {
          A.recognitionStop();
        }
      });
      list.appendChild(card);
      });
    }
    renderLogic(curQs);
    container.querySelector("#logicShuffle").addEventListener("click", () => {
      const pool = (D.LOGIC || []).filter((q) => !curQs.includes(q));
      const src = pool.length >= 5 ? pool : (D.LOGIC || []);
      const shuffled = src.slice().sort(() => Math.random() - 0.5);
      curQs = shuffled.slice(0, 5);
      renderLogic(curQs);
      window.App && window.App.toast("换了一组新逻辑题～");
    });
  }

  /* =========================================================
     6) 绘本
     ========================================================= */
  function book(container) {
    container.innerHTML = `
      <div class="module-title">📚 绘本馆</div>
      <div class="module-sub">挑一本绘本，一页页读，读完最后一页绘本右上角会出现绿色对钩 ✓，可以反复再读哦！每天都会更新 5 本新绘本～</div>
      <div class="book-featured" id="featured"></div>
      <div class="book-grid" id="bookGrid"></div>
      <div id="moreWrap" style="text-align:center;margin:14px 0 4px"><button class="btn" id="moreBtn">📚 加载更多绘本</button></div>
      <div id="reader"></div>`;
    const grid = container.querySelector("#bookGrid");
    const reader = container.querySelector("#reader");
    const feat = container.querySelector("#featured");
    const moreWrap = container.querySelector("#moreWrap");
    const moreBtn = container.querySelector("#moreBtn");
    // 全库 3000+ 本，分批渲染避免卡顿
    let shown = 60;
    const BATCH = 60;

    function renderBookCard(b, isNew) {
      const card = document.createElement("div");
      card.className = "book-card";
      card.style.position = "relative";
      card.dataset.title = b.title;
      const read = S.isBookRead(b.title);
      card.innerHTML = `<div class="book-cover">${esc(b.cover)}</div><div class="book-name">${esc(b.title)}</div>`
        + (isNew ? '<span class="book-new-badge" title="今日新绘本">新</span>' : "")
        + (read ? '<span class="book-read-badge" title="这本已经读过啦">✓</span>' : "");
      card.addEventListener("click", () => openBook(b));
      grid.appendChild(card);
    }

    function renderList() {
      // 当天 5 本新绘本（与近期不重复），排在前面并带「新」标
      const dailyBooks = S.getDailyBooks();
      const dailySet = new Set(dailyBooks.map((b) => b.title));
      const featured = dailyBooks[0] || D.BOOKS[0];
      feat.className = "book-featured";
      feat.dataset.title = featured.title;
      feat.innerHTML = `<div class="book-cover">${esc(featured.cover)}</div>
        <div class="book-featured-info">
          <div class="book-featured-title">${esc(featured.title)}</div>
          <div class="book-featured-desc">⭐ 今日新绘本，点我读一读~</div>
        </div>
        <span class="book-new-badge" title="今日新绘本">新</span>`
        + (S.isBookRead(featured.title) ? '<span class="book-read-badge" title="这本已经读过啦">✓</span>' : "");
      feat.onclick = () => openBook(featured);
      grid.innerHTML = "";
      // 其余 4 本「今日新绘本」排在前面
      dailyBooks.slice(1).forEach((b) => renderBookCard(b, true));
      // 其余绘本：已读的按阅读时间倒序排在前面，未读在后
      const readTs = {};
      S.getReadBooks().forEach((x) => {
        const t = (x && typeof x === "object") ? x.title : x;
        if (!(t in readTs)) readTs[t] = (x && typeof x === "object") ? (x.ts || 0) : 0;
      });
      const rest = D.BOOKS.filter((b) => !dailySet.has(b.title));
      rest.sort((a, b) => {
        const ra = (a.title in readTs) ? readTs[a.title] : -1;
        const rb = (b.title in readTs) ? readTs[b.title] : -1;
        return rb - ra;
      });
      // 分批：先渲染已加载的部分，避免一次渲染 3000 张卡片卡顿
      rest.slice(0, shown).forEach((b) => renderBookCard(b, false));
      if (rest.length > shown) {
        moreWrap.style.display = "";
      } else {
        moreWrap.style.display = "none";
      }
      moreBtn.onclick = () => {
        const start = shown;
        shown = Math.min(rest.length, shown + BATCH);
        rest.slice(start, shown).forEach((b) => renderBookCard(b, false));
        if (shown >= rest.length) moreWrap.style.display = "none";
      };
    }

    function openBook(b) {
      let p = 0, showPy = true;
      function render() {
        const pg = b.pages[p];
        const last = p === b.pages.length - 1;
        reader.innerHTML = `
          <div class="card book-reader">
            <div style="font-weight:800;color:var(--pink-600)">${esc(b.title)}（${p + 1}/${b.pages.length}）</div>
            <div class="book-page-img">${esc(pg.emoji)}</div>
            <div class="book-page-text">${showPy ? charRuby(pg.text) : esc(pg.text)}</div>
            ${last ? '<div class="module-sub" style="margin-top:6px;color:#2fae6b;font-weight:700">🎉 读到这里就读完这一本啦，绘本右上角会出现绿色对钩 ✓</div>' : ''}
            <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
              <button class="btn btn-sm" id="prev">⬅️ 上一页</button>
              <button class="btn btn-mint btn-sm" id="read">🔊 读这一页</button>
              <button class="btn btn-sm btn-ghost" id="pyToggle">${showPy ? "🔤 隐藏拼音" : "🔤 显示拼音"}</button>
              <button class="btn btn-sm" id="next">${last ? "读完啦 🌟" : "下一页 ➡️"}</button>
            </div>
          </div>`;
        reader.querySelector("#read").addEventListener("click", () => A.speak(pg.text, "zh-CN"));
        reader.querySelector("#pyToggle").addEventListener("click", () => { showPy = !showPy; render(); });
        reader.querySelector("#prev").addEventListener("click", () => { if (p > 0) { p--; render(); } });
        reader.querySelector("#next").addEventListener("click", () => { if (!last) { p++; render(); } });
        // 绘本内文字：已在词库的字置灰；点读 + 长按加入词库
        const pageText = reader.querySelector(".book-page-text");
        if (pageText) {
          const inBank = new Set(S.getCN().map((x) => x.char));
          pageText.querySelectorAll(".chr").forEach((sp) => {
            const ch = sp.dataset.ch;
            if (inBank.has(ch)) sp.classList.add("done-added");
            sp.addEventListener("click", () => A.speak(ch, "zh-CN"));
            attachLongPress(sp, (x, y) => {
              const info = getCharInfo(ch);
              wordPopup(ch, info.py, info.mean, "cn", x, y, (added) => { if (added) sp.classList.add("done-added"); });
            });
          });
        }
        // 读完最后一页才标记已读（右上角绿色对钩），只更新对钩、不重建整个列表
        if (last) {
          S.markBookRead(b.title);
          grid.querySelectorAll(".book-card").forEach((c) => {
            if (c.dataset.title === b.title && !c.querySelector(".book-read-badge")) {
              c.insertAdjacentHTML("beforeend", '<span class="book-read-badge" title="这本已经读过啦">✓</span>');
            }
          });
          if (feat.dataset.title === b.title && !feat.querySelector(".book-read-badge")) {
            feat.insertAdjacentHTML("beforeend", '<span class="book-read-badge" title="这本已经读过啦">✓</span>');
          }
        }
      }
      render();
      if (reader.scrollIntoView) reader.scrollIntoView({ behavior: "smooth" });
    }

    renderList();
  }

  /* =========================================================
     7) 游戏
     ========================================================= */
  function game(container) {
    container.innerHTML = `
      <div class="module-title">🎮 好玩的游戏</div>
      <div class="module-sub">动手动脑，越玩越聪明！</div>
      <div class="game-grid" id="gameGrid"></div>
      <div id="gameArea"></div>`;
    const grid = container.querySelector("#gameGrid");
    const area = container.querySelector("#gameArea");
    D.GAMES.forEach((g) => {
      const card = document.createElement("div");
      card.className = "game-card";
      card.innerHTML = `<div class="g-ico">${esc(g.ico)}</div><div class="g-name">${esc(g.name)}</div><div style="font-size:13px;color:#8a6a78;margin-top:4px">${esc(g.desc)}</div>`;
      card.addEventListener("click", () => { area.innerHTML = ""; if (g.key === "memory") memoryGame(area); else if (g.key === "diff") diffGame(area); else if (g.key === "count") countGame(area); else if (g.key === "gomoku") gomokuGame(area); else if (g.key === "sudoku") sudokuGame(area); else if (g.key === "shapes") shapesGame(area); else if (g.key === "pattern") patternGame(area); else if (g.key === "chinamap") chinaMapGame(area); if (area.scrollIntoView) area.scrollIntoView({ behavior: "smooth" }); });
      grid.appendChild(card);
    });
  }

  function memoryGame(area) {
    const emojis = ["🍎","🐱","⭐","🌸","🐟","🚀","🌈","🍌"];
    let deck = emojis.concat(emojis).sort(() => Math.random() - 0.5);
    let first = null, lock = false, matched = 0;
    area.innerHTML = `<div class="card"><div class="module-sub">翻开两张一样的卡片就配对成功！</div><div class="memory-board" id="board"></div><div id="mres"></div></div>`;
    const board = area.querySelector("#board");
    deck.forEach((e, i) => {
      const c = document.createElement("div"); c.className = "mem-card"; c.dataset.e = e; c.dataset.i = i; c.textContent = "❓";
      c.addEventListener("click", () => {
        if (lock || c.classList.contains("flip") || c.classList.contains("hide")) return;
        c.classList.add("flip"); c.textContent = e;
        if (!first) { first = c; return; }
        if (first.dataset.i === c.dataset.i) return;
        if (first.dataset.e === c.dataset.e) {
          setTimeout(() => { first.classList.add("hide"); c.classList.add("hide"); first = null; matched++; if (matched === emojis.length) area.querySelector("#mres").innerHTML = `<div class="feedback ok">全部配对成功！你记忆力真好！🌟</div>`; }, 500);
        } else {
          lock = true;
          setTimeout(() => { first.classList.remove("flip"); first.textContent = "❓"; c.classList.remove("flip"); c.textContent = "❓"; first = null; lock = false; }, 900);
        }
      });
      board.appendChild(c);
    });
  }

  function diffGame(area) {
    let sceneIdx = 0;
    function render() {
      const scene = D.DIFF_SCENES[sceneIdx];
      const left = scene.base.slice();
      const right = scene.base.slice();
      scene.diffs.forEach((d) => { right[d.i] = d.right; });
      const diffSet = new Set(scene.diffs.map((d) => d.i));
      const found = new Set();
      area.innerHTML = `<div class="card">
        <div style="font-weight:800;color:var(--pink-600)">🔍 ${esc(scene.name)}</div>
        <div class="module-sub">${esc(scene.desc)} 已找到 <b id="dfound">0</b> / ${diffSet.size} 处</div>
        <div class="diff-wrap">
          <div class="diff-col"><div class="diff-cap">左图</div><div class="diff-board" id="boardL"></div></div>
          <div class="diff-col"><div class="diff-cap">右图（点不同处）</div><div class="diff-board" id="boardR"></div></div>
        </div>
        <div id="dres"></div>
        <button class="btn btn-ghost btn-sm" id="dnext" style="margin-top:8px">➡️ 换一关</button>
      </div>`;
      const boardL = area.querySelector("#boardL");
      const boardR = area.querySelector("#boardR");
      const dfound = area.querySelector("#dfound");
      left.forEach((e, i) => {
        const c = document.createElement("div"); c.className = "diff-cell"; c.textContent = e; boardL.appendChild(c);
      });
      right.forEach((e, i) => {
        const c = document.createElement("div"); c.className = "diff-cell"; c.textContent = e;
        c.addEventListener("click", () => {
          if (found.has(i)) return;
          if (diffSet.has(i)) {
            found.add(i); c.classList.add("ok"); c.textContent = e + "✅"; dfound.textContent = found.size;
            if (found.size === diffSet.size) {
              area.querySelector("#dres").innerHTML = `<div class="feedback ok">全部找到啦！你观察得真仔细！🌟 +2 小红花</div>`;
              S.addFlowers(2, "找不同");
            }
          } else {
            c.classList.add("bad"); setTimeout(() => c.classList.remove("bad"), 600);
          }
        });
        boardR.appendChild(c);
      });
      area.querySelector("#dnext").addEventListener("click", () => { sceneIdx = (sceneIdx + 1) % D.DIFF_SCENES.length; render(); });
    }
    render();
  }

  function countGame(area) {
    const emojis = ["⭐","🍎","🐱","🌸"];
    area.innerHTML = `<div class="card"><div class="module-sub">数一数有几个，点出正确的数字！</div><div class="color-target" id="cntEmoji"></div><div id="cntChoices" class="tile-row"></div><div id="cntRes"></div></div>`;
    const cntEmoji = area.querySelector("#cntEmoji");
    const cntChoices = area.querySelector("#cntChoices");
    const cntRes = area.querySelector("#cntRes");
    function round() {
      const n = 1 + Math.floor(Math.random() * 9);
      const e = emojis[Math.floor(Math.random() * emojis.length)];
      cntEmoji.textContent = e.repeat(n);
      const choices = new Set([n]); while (choices.size < 4) choices.add(1 + Math.floor(Math.random() * 9));
      cntChoices.innerHTML = "";
      Array.from(choices).sort(() => Math.random() - 0.5).forEach((c) => {
        const t = document.createElement("div"); t.className = "tile"; t.textContent = c;
        t.addEventListener("click", () => {
          if (c === n) { cntRes.innerHTML = `<div class="feedback ok">数得真准！🌟</div>`; setTimeout(round, 1300); }
          else { cntRes.innerHTML = `<div class="feedback warn">再数一遍哦～</div>`; }
        });
        cntChoices.appendChild(t);
      });
    }
    round();
  }

  /* 五子棋：9 路棋盘，玩家执黑，电脑执白，连五判胜 */
  function gomokuGame(area) {
    const N = 9;
    const board = Array.from({ length: N }, () => Array(N).fill(0));
    area.innerHTML = `
      <div class="card">
        <div style="font-weight:800;color:var(--pink-600)">⚫ 五子棋</div>
        <div class="module-sub">你执<b>黑子</b>，电脑执白子。点到空交叉点落子，先在横、竖或斜方向连成 5 子就赢！</div>
        <canvas id="gkB" width="360" height="360" class="gomoku-board"></canvas>
        <div id="gkRes" style="margin-top:8px;min-height:24px"></div>
        <button class="btn btn-ghost btn-sm" id="gkReset" style="margin-top:6px">🔄 重新开始</button>
      </div>`;
    const cv = area.querySelector("#gkB");
    let ctx = null;
    try { ctx = cv.getContext ? cv.getContext("2d") : null; } catch (e) { ctx = null; }
    const res = area.querySelector("#gkRes");
    const cell = 360 / (N + 1);
    let over = false;
    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, 360, 360);
      ctx.strokeStyle = "#c9a"; ctx.lineWidth = 1;
      for (let i = 0; i < N; i++) {
        ctx.beginPath(); ctx.moveTo(cell, cell + i * cell); ctx.lineTo(360 - cell, cell + i * cell); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cell + i * cell, cell); ctx.lineTo(cell + i * cell, 360 - cell); ctx.stroke();
      }
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        if (board[r][c]) {
          const x = cell + c * cell, y = cell + r * cell;
          ctx.beginPath(); ctx.arc(x, y, cell * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = board[r][c] === 1 ? "#222" : "#fff";
          ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = "#666"; ctx.stroke();
        }
      }
    }
    function rc(e) {
      const rect = cv.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const c = Math.round((x - cell) / cell), r = Math.round((y - cell) / cell);
      if (c < 0 || c >= N || r < 0 || r >= N) return null;
      if (Math.abs(x - (cell + c * cell)) > cell * 0.5 || Math.abs(y - (cell + r * cell)) > cell * 0.5) return null;
      return { r: r, c: c };
    }
    function win(r, c, who) {
      const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
      for (const d of dirs) {
        let n = 1;
        for (let s = 1; s < 5; s++) { const rr = r + d[0] * s, cc = c + d[1] * s; if (rr < 0 || rr >= N || cc < 0 || cc >= N || board[rr][cc] !== who) break; n++; }
        for (let s = 1; s < 5; s++) { const rr = r - d[0] * s, cc = c - d[1] * s; if (rr < 0 || rr >= N || cc < 0 || cc >= N || board[rr][cc] !== who) break; n++; }
        if (n >= 5) return true;
      }
      return false;
    }
    function aiMove() {
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { if (board[r][c]) continue; board[r][c] = 2; const w = win(r, c, 2); board[r][c] = 0; if (w) return { r: r, c: c }; }
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { if (board[r][c]) continue; board[r][c] = 1; const w = win(r, c, 1); board[r][c] = 0; if (w) return { r: r, c: c }; }
      let best = null, bestScore = -1;
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
        if (board[r][c]) continue;
        let score = 0;
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) { const rr = r + dr, cc = c + dc; if (rr >= 0 && rr < N && cc >= 0 && cc < N && board[rr][cc]) score++; }
        score -= (Math.abs(r - 4) + Math.abs(c - 4)) * 0.1;
        if (score > bestScore) { bestScore = score; best = { r: r, c: c }; }
      }
      return best || { r: 4, c: 4 };
    }
    function place(r, c, who) {
      board[r][c] = who; draw();
      if (win(r, c, who)) {
        over = true;
        if (who === 1) { res.innerHTML = `<div class="feedback ok">你连成五子啦！太厉害了！🌟 +3 小红花</div>`; S.addFlowers(3, "五子棋"); }
        else { res.innerHTML = `<div class="feedback warn">电脑连成五子啦，再来一局试试～</div>`; }
        return true;
      }
      return false;
    }
    if (cv.addEventListener) cv.addEventListener("click", (e) => {
      if (over) return;
      const p = rc(e); if (!p || board[p.r][p.c]) return;
      if (place(p.r, p.c, 1)) return;
      const m = aiMove(); if (m) place(m.r, m.c, 2);
    });
    area.querySelector("#gkReset").addEventListener("click", () => {
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) board[r][c] = 0;
      over = false; res.innerHTML = ""; draw();
    });
    draw();
  }

  /* 4×4 数独 */
  function sudokuGame(area) {
    area.innerHTML = `<div class="card">
      <div style="font-weight:800;color:var(--pink-600)">🔢 4×4 数独</div>
      <div class="module-sub">每行、每列、每个 2×2 小方块里都要有 1-4 不重复。在空格里填数吧！</div>
      <div id="sud" class="sudoku"></div>
      <div id="sudRes" style="margin-top:8px"></div>
      <button class="btn btn-sm" id="sudChk" style="margin-top:8px">✅ 检查</button>
      <button class="btn btn-ghost btn-sm" id="sudNew" style="margin-top:8px">🔄 换一题</button>
    </div>`;
    function genSolved() {
      let g = [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]];
      const perm = [1, 2, 3, 4].sort(() => Math.random() - 0.5);
      g = g.map((row) => row.map((v) => perm[v - 1]));
      if (Math.random() < 0.5) { const t = g[0]; g[0] = g[1]; g[1] = t; const t2 = g[2]; g[2] = g[3]; g[3] = t2; }
      if (Math.random() < 0.5) { for (let r = 0; r < 4; r++) { const t = g[r][0]; g[r][0] = g[r][1]; g[r][1] = t; const t2 = g[r][2]; g[r][2] = g[r][3]; g[r][3] = t2; } }
      return g;
    }
    function build() {
      const sol = genSolved();
      const cells = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) cells.push(r * 4 + c);
      cells.sort(() => Math.random() - 0.5);
      const holes = 6 + Math.floor(Math.random() * 3);
      const blank = new Set(cells.slice(0, holes));
      const sud = area.querySelector("#sud");
      sud.innerHTML = "";
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        const cell = document.createElement("div");
        cell.className = "sud-cell" + ((Math.floor(r / 2) + Math.floor(c / 2)) % 2 ? " alt" : "");
        if (blank.has(r * 4 + c)) {
          const inp = document.createElement("input");
          inp.className = "sud-inp"; inp.inputMode = "numeric"; inp.maxLength = 1; inp.dataset.r = r; inp.dataset.c = c;
          cell.appendChild(inp);
        } else { cell.textContent = sol[r][c]; cell.classList.add("fixed"); }
        sud.appendChild(cell);
      }
      area.querySelector("#sudRes").innerHTML = "";
      area.querySelector("#sudChk").onclick = () => {
        let ok = true;
        sud.querySelectorAll("input").forEach((inp) => {
          const v = parseInt(inp.value, 10); const r = +inp.dataset.r, c = +inp.dataset.c;
          if (v !== sol[r][c]) ok = false;
        });
        if (ok) { area.querySelector("#sudRes").innerHTML = `<div class="feedback ok">全部填对啦！你真棒！🌟 +2 小红花</div>`; S.addFlowers(2, "数独"); }
        else area.querySelector("#sudRes").innerHTML = `<div class="feedback warn">还有不对的地方，再看看每行每列吧～</div>`;
      };
    }
    build();
    area.querySelector("#sudNew").addEventListener("click", build);
  }

  /* 认识图形和立方体 */
  function shapesGame(area) {
    area.innerHTML = `<div class="card">
      <div style="font-weight:800;color:var(--pink-600)">🔺 图形和立方体</div>
      <div class="module-sub" id="shTip"></div>
      <div class="shape-opt" id="shOpt"></div>
      <div id="shRes" style="margin-top:8px"></div>
      <button class="btn btn-ghost btn-sm" id="shNext" style="margin-top:6px">➡️ 换一题</button>
    </div>`;
    const tip = area.querySelector("#shTip"), opt = area.querySelector("#shOpt"), resEl = area.querySelector("#shRes");
    function q() {
      const target = D.SHAPES[Math.floor(Math.random() * D.SHAPES.length)];
      tip.innerHTML = `下面哪个是 <b style="color:var(--purple);font-size:20px">${esc(target.name)}</b>？<span style="color:#8a6a78">（${target.dim === "3D" ? "立体图形" : "平面图形"}）</span>`;
      const choices = new Set([target]);
      while (choices.size < 4) { const s = D.SHAPES[Math.floor(Math.random() * D.SHAPES.length)]; choices.add(s); }
      opt.innerHTML = "";
      Array.from(choices).sort(() => Math.random() - 0.5).forEach((s) => {
        const d = document.createElement("div");
        d.className = "shape-card";
        d.innerHTML = `<div class="shape-svg">${s.svg}</div><div class="shape-name">${esc(s.name)}</div>`;
        d.addEventListener("click", () => {
          if (s === target) { resEl.innerHTML = `<div class="feedback ok">答对啦！这就是${esc(target.name)}！🌟 +1 小红花</div>`; S.addFlowers(1, "图形认知"); }
          else { resEl.innerHTML = `<div class="feedback warn">再看看，这不是${esc(target.name)}哦～</div>`; }
        });
        opt.appendChild(d);
      });
      resEl.innerHTML = "";
    }
    q();
    area.querySelector("#shNext").addEventListener("click", q);
  }

  /* 找规律 */
  function patternGame(area) {
    const emojiPool = ["🔴", "⭐", "🐱", "🐶", "🌸", "🌿", "🍎", "🍌", "🔺", "🔵", "🟡", "🟢", "🌟", "🐟", "🌈"];
    area.innerHTML = `<div class="card">
      <div style="font-weight:800;color:var(--pink-600)">🔁 找规律</div>
      <div class="module-sub" id="ptTip"></div>
      <div class="pattern-seq" id="ptSeq"></div>
      <div class="module-sub">下一个应该是哪个？</div>
      <div class="tile-row" id="ptOpt"></div>
      <div id="ptRes" style="margin-top:8px"></div>
      <button class="btn btn-ghost btn-sm" id="ptNext" style="margin-top:6px">➡️ 换一题</button>
    </div>`;
    const tip = area.querySelector("#ptTip"), seq = area.querySelector("#ptSeq"), opt = area.querySelector("#ptOpt"), resEl = area.querySelector("#ptRes");
    function q() {
      const p = D.PATTERNS[Math.floor(Math.random() * D.PATTERNS.length)];
      tip.innerHTML = `规律：${esc(p.kind)}`;
      seq.innerHTML = p.items.map((it) => `<span class="pt-item">${esc(it)}</span>`).join("") + `<span class="pt-item pt-q">？</span>`;
      // 候选干扰项：先从题目里取「与答案不同」的去重集合，不够再从表情池补（排除答案与已用项）
      const distinctPool = Array.from(new Set(p.items.filter((x) => x !== p.answer)));
      const extraPool = emojiPool.filter((x) => x !== p.answer && distinctPool.indexOf(x) < 0);
      const src = distinctPool.concat(extraPool);
      const target = Math.min(4, 1 + src.length); // 总选项数不超过「答案 + 所有可去重项」
      // 洗牌候选池后顺序取，避免依赖随机命中导致死循环
      const shuffled = src.slice();
      for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = t; }
      const opts = new Set([p.answer]);
      shuffled.forEach((x) => { if (opts.size < target) opts.add(x); });
      opt.innerHTML = "";
      Array.from(opts).sort(() => Math.random() - 0.5).forEach((o) => {
        const t = document.createElement("div"); t.className = "tile"; t.textContent = o;
        t.addEventListener("click", () => {
          if (o === p.answer) { resEl.innerHTML = `<div class="feedback ok">你找出规律啦！答对！🌟 +1 小红花</div>`; S.addFlowers(1, "找规律"); }
          else { resEl.innerHTML = `<div class="feedback warn">再看看规律哦～</div>`; }
        });
        opt.appendChild(t);
      });
      resEl.innerHTML = "";
    }
    q();
    area.querySelector("#ptNext").addEventListener("click", q);
  }

  /* 中国地图拼图：把省份拖到对应位置，认识我们美丽的中国 */
  // 由 SVG path 字符串计算包围盒（用于中间拼块的 viewBox）
  function pathBBox(d) {
    const nums = (String(d).match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (let i = 0; i + 1 < nums.length; i += 2) {
      const x = nums[i], y = nums[i + 1];
      if (x < minX) minX = x; if (y < minY) minY = y;
      if (x > maxX) maxX = x; if (y > maxY) maxY = y;
    }
    if (!isFinite(minX)) return { x: 0, y: 0, w: 100, h: 100 };
    const pad = 10;
    return { x: minX - pad, y: minY - pad, w: (maxX - minX) + pad * 2, h: (maxY - minY) + pad * 2 };
  }

  function chinaMapGame(area) {
    // 真实中国省级边界（雄鸡形状），来自 chinaMapData.js（离线简化的 GeoJSON SVG path）
    const CD = window.ChinaMapData;
    if (!CD || !CD.provinces || !CD.provinces.length) {
      area.innerHTML = '<div class="card module-sub">地图数据加载中，请稍后或刷新页面重试～</div>';
      return;
    }
    const provs = CD.provinces;
    const SVGNS = "http://www.w3.org/2000/svg";
    area.innerHTML = `
      <div class="card">
        <div style="font-weight:800;color:var(--pink-600)">🗺️ 中国地图拼图（真实雄鸡地图）</div>
        <div class="module-sub">这是<b>真实的中国地图</b>，像一只大雄鸡🐔！下面会随机出现<b>一个省份</b>，请在地图上<b>点一点</b>它正确的位置吧！放对就变绿，并告诉你省名和省会城市 💚</div>
        <div class="cm-wrap">
          <svg class="china-svg" viewBox="0 0 ${CD.w} ${CD.h}" id="chinaSvg" preserveAspectRatio="xMidYMid meet"></svg>
        </div>
        <div class="module-sub" style="margin-top:12px">🎯 这一关要找的省份（在地图上点它）：</div>
        <div class="cm-challenge" id="cmChallenge"></div>
        <div class="module-sub" style="margin-top:12px">📋 省份参考（省 · 省会城市）：</div>
        <div class="china-tray" id="chinaTray"></div>
        <div id="chinaRes" style="margin-top:8px"></div>
        <div style="display:flex;gap:10px;margin-top:8px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" id="chinaSkip">🔁 换一个</button>
          <button class="btn btn-primary btn-sm" id="chinaReset" style="display:none">🔄 再来一局？</button>
        </div>
      </div>`;
    const svg = area.querySelector("#chinaSvg");
    const challenge = area.querySelector("#cmChallenge");
    const tray = area.querySelector("#chinaTray");
    const res = area.querySelector("#chinaRes");
    const resetBtn = area.querySelector("#chinaReset");
    const skipBtn = area.querySelector("#chinaSkip");

    // 渲染省份真实轮廓 + 省名标注（完成后高亮并显示「省·市」）；点击省份判定
    const labelEls = {};
    const pathEls = {};
    provs.forEach((p) => {
      const path = document.createElementNS(SVGNS, "path");
      path.setAttribute("d", p.d);
      path.setAttribute("class", "china-prov");
      path.setAttribute("data-prov", p.name);
      path.style.cursor = "pointer";
      path.addEventListener("click", () => onProvClick(p, path));
      svg.appendChild(path);
      pathEls[p.name] = path;
      const t = document.createElementNS(SVGNS, "text");
      t.setAttribute("x", p.lx); t.setAttribute("y", p.ly + 4);
      t.setAttribute("class", "china-prov-label");
      t.setAttribute("text-anchor", "middle");
      t.textContent = p.name;
      svg.appendChild(t);
      labelEls[p.name] = t;
    });

    // —— 澳门太小不易点击：扩大点击区域；并以「珠江三角洲」作为容错点击区（仅当目标为澳门时生效）——
    const macauProv = provs.find((p) => p.name === "澳门");
    const macauPath = macauProv ? pathEls[macauProv.name] : null;
    const MACAU_X = 591.4, MACAU_Y = 470.9;
    const macauHit = document.createElementNS(SVGNS, "circle");
    macauHit.setAttribute("cx", MACAU_X); macauHit.setAttribute("cy", MACAU_Y); macauHit.setAttribute("r", 16);
    macauHit.setAttribute("class", "china-macau-hit");
    macauHit.setAttribute("fill", "transparent");
    macauHit.style.pointerEvents = "none"; macauHit.style.cursor = "pointer";
    svg.appendChild(macauHit);
    const deltaHit = document.createElementNS(SVGNS, "circle");
    deltaHit.setAttribute("cx", MACAU_X); deltaHit.setAttribute("cy", MACAU_Y); deltaHit.setAttribute("r", 42);
    deltaHit.setAttribute("class", "china-delta-hit");
    deltaHit.setAttribute("fill", "transparent");
    deltaHit.style.pointerEvents = "none"; deltaHit.style.cursor = "pointer";
    svg.appendChild(deltaHit);
    const hintRing = document.createElementNS(SVGNS, "circle");
    hintRing.setAttribute("cx", MACAU_X); hintRing.setAttribute("cy", MACAU_Y); hintRing.setAttribute("r", 42);
    hintRing.setAttribute("class", "china-macau-hint");
    hintRing.setAttribute("fill", "none");
    hintRing.style.pointerEvents = "none";
    svg.appendChild(hintRing);
    function macauResolve() {
      if (cur && cur.name === "澳门" && macauProv && !done["澳门"]) onProvClick(macauProv, macauPath);
    }
    macauHit.addEventListener("click", macauResolve);
    deltaHit.addEventListener("click", macauResolve);
    function updateMacauHit() {
      const on = !!(cur && cur.name === "澳门");
      macauHit.style.pointerEvents = on ? "all" : "none";
      deltaHit.style.pointerEvents = on ? "all" : "none";
      hintRing.style.display = on ? "" : "none";
    }

    const note = document.createElementNS(SVGNS, "text");
    note.setAttribute("x", CD.w - 68); note.setAttribute("y", CD.h - 16);
    note.setAttribute("class", "china-note");
    note.textContent = "南海诸岛";
    svg.appendChild(note);

    // 省份参考托盘（只读，帮助孩子辨认形状对应的省份）
    provs.forEach((p) => {
      const chip = document.createElement("div");
      chip.className = "china-ref";
      chip.innerHTML = `<b>${esc(p.name)}</b><span>${esc(p.capital)}</span>`;
      tray.appendChild(chip);
    });

    const done = {};
    let doneCount = 0, cur = null;

    function pickNext() {
      const rest = provs.filter((p) => !done[p.name]);
      if (!rest.length) { finish(); return; }
      cur = rest[Math.floor(Math.random() * rest.length)];
      updateMacauHit();
      renderPiece();
    }

    function renderPiece() {
      const bb = pathBBox(cur.d);
      challenge.innerHTML = `
        <div class="cm-piece" id="cmPiece">
          <div class="cm-piece-hint">👆 请在地图上点一点「<b>${esc(cur.name)}</b>」所在的位置！</div>
          <div class="cm-piece-shape"><svg viewBox="${bb.x} ${bb.y} ${bb.w} ${bb.h}" preserveAspectRatio="xMidYMid meet"><path d="${cur.d}" class="cm-piece-path"></path></svg></div>
          <div class="cm-piece-cap">省会城市：${esc(cur.capital)}</div>
        </div>`;
    }

    function onProvClick(p, path) {
      if (done[p.name]) return;
      if (p.name === cur.name) {
        // 点对了
        path.classList.add("filled"); path.classList.remove("wrong");
        const t = labelEls[p.name];
        if (t) { t.textContent = p.name + "·" + p.capital; t.classList.add("ok"); }
        done[p.name] = true; doneCount++;
        res.innerHTML = `<div class="feedback ok">你真棒！这就是 <b>${esc(p.name)}</b>，省会城市是 <b>${esc(p.capital)}</b> 💚</div>`;
        window.App && window.App.toast("拼对啦！" + p.name + " · " + p.capital);
        A.speak(p.name + "的省会是" + p.capital, "zh-CN");
        if (doneCount === provs.length) { finish(); return; }
        setTimeout(() => { if (doneCount < provs.length) { res.innerHTML = ""; pickNext(); } }, 1800);
      } else {
        // 点错了
        res.innerHTML = `<div class="feedback warn">哎哟！不对哦！再看看吧~</div>`;
        path.classList.add("wrong");
        setTimeout(() => path.classList.remove("wrong"), 600);
        setTimeout(() => { if (!done[cur.name]) res.innerHTML = ""; }, 1800);
      }
    }

    function finish() {
      res.innerHTML = `<div class="feedback ok">🎉 太厉害啦！你认识了所有省份和省会城市，真是地理小能手！🌟 +5 小红花</div>`;
      S.addFlowers(5, "中国地图拼图");
      challenge.innerHTML = `<div class="cm-piece cm-done">🐔 全部拼好啦！我们的祖国真美丽～</div>`;
      skipBtn.style.display = "none";
      resetBtn.style.display = "";
    }

    skipBtn.addEventListener("click", () => { if (doneCount < provs.length) { res.innerHTML = ""; pickNext(); } });
    resetBtn.addEventListener("click", () => {
      Object.keys(done).forEach((k) => delete done[k]);
      doneCount = 0;
      svg.querySelectorAll(".china-prov").forEach((path) => path.classList.remove("filled", "over", "wrong"));
      Object.keys(labelEls).forEach((k) => { const t = labelEls[k]; t.textContent = k; t.classList.remove("ok"); });
      res.innerHTML = "";
      skipBtn.style.display = "";
      resetBtn.style.display = "none";
      pickNext();
    });

    pickNext();
  }

  /* =========================================================
     8) 诗词
     ========================================================= */
  function genPinyinLine(line) {
    try {
      // segment:true 让多音字按词语/上下文自动选择正确读音
      if (window.pinyinPro) return window.pinyinPro(line, { type: "array", toneType: "symbol", segment: true, nonZh: "removed" }).join(" ");
    } catch (e) {}
    return "";
  }
  // 为每句诗生成一张「插画卡」：关键词 → emoji（对应每一句的描述）
  function genPoemImages(p) {
    const map = (window.Data && window.Data.POEM_IMG_KEYWORDS) || {};
    const out = [];
    (p.lines || []).forEach((ln) => {
      let emo = "📜";
      for (const k in map) { if (ln.indexOf(k) >= 0) { emo = map[k]; break; } }
      out.push({ emoji: emo, caption: ln });
    });
    return out;
  }
  const TYPE_EMOJI = { "植物": "🌿", "田园": "🌾", "动物": "🐾", "边塞": "🏰", "山水": "⛰️", "春天": "🌸", "冬天": "❄️", "秋天": "🍂", "思乡": "🏠", "送别": "👋", "节日": "🎉", "思念": "💭", "抒情": "💗", "自然": "🌈", "月亮": "🌙", "想象": "✨", "励志": "💪", "江南": "🍃", "隐逸": "🍵", "怀古": "🏛️", "感慨": "🌟", "宫怨": "👑", "爱情": "💞", "少女": "👧", "友情": "🤝", "儿童": "🧒", "愁绪": "🌧️", "黄河": "🌊", "神话": "🐉", "其他": "📜" };

  function poetry(container) {
    container.innerHTML = `
      <div class="module-title">📜 诗词天地</div>
      <div class="module-sub">${window.POEMS.length} 首诗词（含义务教育必背与名家名篇），按诗人和类型筛选，点字听读，跟着背诵～默认先展示一首最简单的诗。</div>
      <div class="poem-nav">
        <div class="poem-search"><input id="poemSearch" placeholder="🔍 搜诗人或诗名" /></div>
      </div>
      <div class="poem-nav" id="poetChips"></div>
      <div class="poem-nav" id="typeChips"></div>
      <div class="card" id="poemBox"></div>`;

    let curPoet = "全部", curType = "全部", curSearch = "", curIdx = 0;
    // 儿童经典简单诗词（优先作为默认随机展示，避免一上来难度过高）
    const EASY_POEMS = ["咏鹅","静夜思","春晓","悯农（其一）","悯农（其二）","登鹳雀楼","相思","鹿柴","池上","咏柳","寻隐者不遇","风","古朗月行（节选）","绝句","绝句（江碧）","绝句（两个黄鹂）","江雪"];

    // 诗人 chips（取出现次数多的 + 全部）
    const poetCount = {};
    window.POEMS.forEach((p) => { poetCount[p.author] = (poetCount[p.author] || 0) + 1; });
    const famousPoets = ["李白", "杜甫", "白居易", "杜牧", "王维", "孟浩然", "骆宾王", "贺知章", "王之涣", "柳宗元", "李商隐", "王昌龄"];
    const poetList = ["全部"].concat(famousPoets.filter((x) => poetCount[x])).concat(Object.keys(poetCount).filter((x) => famousPoets.indexOf(x) < 0 && poetCount[x] >= 3).sort());
    const poetChips = container.querySelector("#poetChips");
    poetList.forEach((pt) => {
      const c = document.createElement("span"); c.className = "chip" + (pt === "全部" ? " active" : ""); c.textContent = pt === "全部" ? "全部诗人" : pt; c.dataset.p = pt;
      c.addEventListener("click", () => { curPoet = pt; curIdx = randomEasyIndex(); poetChips.querySelectorAll(".chip").forEach((n) => n.classList.remove("active")); c.classList.add("active"); render(); });
      poetChips.appendChild(c);
    });

    const types = ["全部"].concat(Array.from(new Set(window.POEMS.map((p) => p.type || "其他"))));
    const typeChips = container.querySelector("#typeChips");
    types.forEach((t) => {
      const c = document.createElement("span"); c.className = "chip" + (t === "全部" ? " active" : ""); c.textContent = t === "全部" ? "全部类型" : (TYPE_EMOJI[t] || "") + t; c.dataset.t = t;
      c.addEventListener("click", () => { curType = t; curIdx = randomEasyIndex(); typeChips.querySelectorAll(".chip").forEach((n) => n.classList.remove("active")); c.classList.add("active"); render(); });
      typeChips.appendChild(c);
    });

    container.querySelector("#poemSearch").addEventListener("input", (e) => { curSearch = e.target.value.trim(); curIdx = randomEasyIndex(); render(); });

    function filtered() {
      return window.POEMS.filter((p) =>
        (curPoet === "全部" || p.author === curPoet) &&
        (curType === "全部" || (p.type || "其他") === curType) &&
        (!curSearch || p.title.indexOf(curSearch) >= 0 || p.author.indexOf(curSearch) >= 0)
      ).sort((a, b) => (a.diff || 99) - (b.diff || 99));
    }

    function randomEasyIndex() {
      const list = filtered();
      if (!list.length) return 0;
      const easy = list.filter((p) => EASY_POEMS.indexOf(p.title) >= 0);
      const pool = easy.length ? easy : list;
      // 按天稳定选取一首简单诗（同一天不变，跨天轮换）
      const pick = pool[S.todaySeed() % pool.length];
      return list.indexOf(pick);
    }

    function render() {
      const list = filtered();
      const box = container.querySelector("#poemBox");
      if (!list.length) { box.innerHTML = `<div class="tip">没有符合条件的诗，换个筛选试试～</div>`; return; }
      if (curIdx >= list.length) curIdx = 0;
      const p = list[curIdx];
      const learned = S.isLearned(p.title, p.author);
      const recited = S.isRecited(p.title, p.author);
      const added = learned || recited;
      let linesHtml = "";
      p.lines.forEach((ln) => {
        const py = genPinyinLine(ln);
        let chars = "";
        for (const ch of ln) {
          if ("，。？！、；：".indexOf(ch) >= 0) chars += `<span>${esc(ch)}</span>`;
          else chars += `<span class="poem-char" data-ch="${esc(ch)}">${esc(ch)}</span>`;
        }
        linesHtml += `<div class="poem-pinyin">${esc(py)}</div><div class="poem-line">${chars}</div>`;
      });
      const note = window.getPoemNote ? window.getPoemNote(p) : "";
      const imgs = genPoemImages(p);
      box.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
          <div class="poem-title ${added ? "added" : ""}" style="font-size:22px;font-weight:800;color:var(--pink-600)">《${esc(p.title)}》</div>
          <div class="poem-status ${learned ? "learned" : "unlearned"}">${learned ? "✅ 已学" : "⭕ 未学"}</div>
        </div>
        <div class="poem-meta">${esc(p.author)} · ${(TYPE_EMOJI[p.type] || "📜")} ${esc(p.type || "其他")} · 难度${"★".repeat(Math.min(p.diff || 1, 8))}</div>
        <div class="poem-imgs">${imgs.map((im) => `<div class="poem-img-card"><div class="pic${added ? " added" : ""}">${esc(im.emoji)}${added ? '<span class="chk-badge">✓</span>' : ""}</div><div class="cap">${esc(im.caption)}</div></div>`).join("")}</div>
        <div style="margin:6px 0">${linesHtml}</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-sm" id="pRead">🔊 一键朗读</button>
          <button class="btn btn-ghost btn-sm" id="pPrev">⬅️ 上一首</button>
          <button class="btn btn-ghost btn-sm" id="pNext">下一首 ➡️</button>
          <button class="btn btn-mint btn-sm" id="pRecite">🌟 我会背诵啦~</button>
        </div>
        <div class="poem-note"><b>📖 释义：</b>${esc(note)} <button class="btn btn-ghost btn-sm" id="pNoteRead" title="朗读释义">🔊 读释义</button></div>
        ${recited ? `<div class="feedback ok" style="margin-top:8px">这首已经会背诵啦，真厉害！🌟</div>` : ""}`;
      box.querySelectorAll(".poem-char").forEach((sp) => sp.addEventListener("click", () => A.speak(sp.dataset.ch, "zh-CN")));
      box.querySelector("#pRead").addEventListener("click", () => A.speakPoem(p.lines.join("")));
      box.querySelector("#pNoteRead").addEventListener("click", () => A.speak(note, "zh-CN", { rate: 0.8 }));
      box.querySelector("#pRecite").addEventListener("click", () => {
        const first = S.recite(p.title, p.author);
        notifyBankChange();   // 实时同步到词库模块
        window.App && window.App.toast(first ? "加入诗词库！+5 🌺" : "已经添加过咯！试试其他的吧~");
        render();
      });
      box.querySelector("#pPrev").addEventListener("click", () => { curIdx--; if (curIdx < 0) curIdx = list.length - 1; render(); });
      box.querySelector("#pNext").addEventListener("click", () => { curIdx++; if (curIdx >= list.length) curIdx = 0; render(); });
    }
    curIdx = randomEasyIndex();
    render();
  }

  /* =========================================================
     9) 词库
     ========================================================= */
  function wordbank(container) {
    const cn = S.getCN(), en = S.getEN();
    const learned = S.getLearnedPoems(), recited = S.getRecitedPoems();
    container.innerHTML = `
      <div class="module-title">📚 我的词库</div>
      <div class="module-sub">点一点下面的字 / 词 / 诗，就能看到详情并听读哦～</div>
      <div class="card">
        <div>第一部分：汉字词库 <span class="wb-count">${cn.length} 个字</span></div>
        <div style="margin-top:10px" id="cnBox"></div>
        <div class="wb-detail" id="cnDetail"></div>
      </div>
      <div class="card">
        <div>第二部分：英语词库 <span class="wb-count">${en.length} 个词</span></div>
        <div style="margin-top:10px" id="enBox"></div>
        <div class="wb-detail" id="enDetail"></div>
      </div>
      <div class="card">
        <div>第三部分：诗词库</div>
        <div style="margin-top:10px"><b style="color:var(--pink-600)">已学（${learned.length}）</b><div id="plBox" style="margin:6px 0"></div>
        <b style="color:var(--pink-600)">会背诵（${recited.length}）</b><div id="prBox" style="margin:6px 0"></div></div>
        <div class="wb-detail" id="poemDetail"></div>
      </div>`;

    function showCnDetail(x) {
      const box = container.querySelector("#cnDetail");
      box.innerHTML = `
        <div class="wb-card">
          <div class="wb-bigchar">${esc(x.char)}</div>
          <div class="wb-py">${esc(x.py || "(暂无拼音)")}</div>
          <div class="wb-mean">${esc(x.mean || "(暂无释义)")}</div>
          <button class="btn btn-sm" id="cnRead">🔊 读一读</button>
        </div>`;
      box.querySelector("#cnRead").addEventListener("click", () => A.speak(x.char, "zh-CN"));
    }
    function showEnDetail(x) {
      const box = container.querySelector("#enDetail");
      box.innerHTML = `
        <div class="wb-card">
          <div class="wb-img">${esc(x.emoji || "🔤")}</div>
          <div class="wb-word">${esc(x.en)}</div>
          <div class="wb-mean">${esc(x.cn || "(暂无中文)")}</div>
          <button class="btn btn-sm" id="enRead">🔊 听发音</button>
        </div>`;
      box.querySelector("#enRead").addEventListener("click", () => A.speakEn(x.en));
    }
    function showPoemDetail(p) {
      const box = container.querySelector("#poemDetail");
      if (!box) return;
      // 即使 POEMS 里查不到，也尽量用标签自带信息兜底，避免“什么都不显示”
      let poem = (window.POEMS || []).find((q) => q.title === p.title && q.author === p.author);
      if (!poem) poem = { title: p.title, author: p.author, lines: p.lines || [], type: p.type || "唐诗" };
      try {
        let linesHtml = "";
        (poem.lines || []).forEach((ln) => {
          const py = genPinyinLine(ln);
          let chars = "";
          for (const ch of ln) { chars += `<span class="pc">${esc(ch)}</span>`; }
          linesHtml += `<div class="poem-pinyin">${esc(py)}</div><div class="poem-line">${chars}</div>`;
        });
        const note = window.getPoemNote ? window.getPoemNote(poem) : "";
        const imgs = genPoemImages(poem);
        box.innerHTML = `
          <div class="wb-card wb-poem">
            <div class="wb-ptitle">《${esc(poem.title)}》 ${esc(poem.author)}</div>
            <div class="poem-imgs">${imgs.map((im) => `<div class="poem-img-card"><div class="pic">${esc(im.emoji)}</div><div class="cap">${esc(im.caption)}</div></div>`).join("")}</div>
            <div>${linesHtml || '<div class="tip">这首诗暂时没有逐句内容～</div>'}</div>
            <div class="poem-note"><b>📖 释义：</b>${esc(note)}</div>
            <button class="btn btn-sm" id="poemRead">🔊 朗读全诗</button>
          </div>`;
        const rb = box.querySelector("#poemRead");
        if (rb) rb.addEventListener("click", () => A.speakPoem((poem.lines || []).join("")));
        if (box.scrollIntoView) box.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } catch (e) {
        box.innerHTML = `<div class="tip">这首诗暂时打不开详情，请稍后再试～（${esc(String((e && e.message) || e))}）</div>`;
      }
    }

    const cnBox = container.querySelector("#cnBox");
    if (!cn.length) cnBox.innerHTML = `<div class="tip">还没有学会的字，去「识字」长按生字加入吧～</div>`;
    cn.forEach((x) => {
      const tag = document.createElement("span");
      tag.className = "wb-tag wb-click";
      tag.innerHTML = `${esc(x.char)}<span class="rm" title="移除">✕</span>`;
      tag.addEventListener("click", (e) => {
        if (e.target.classList.contains("rm")) { S.removeCN(x.char); notifyBankChange(); window.App && window.App.toast("已移除，识字/绘本里的灰字会恢复哦"); wordbank(container); }
        else showCnDetail(x);
      });
      cnBox.appendChild(tag);
    });
    const enBox = container.querySelector("#enBox");
    if (!en.length) enBox.innerHTML = `<div class="tip">还没有学会的单词，去「英语」长按卡片加入吧～</div>`;
    en.forEach((x) => {
      const tag = document.createElement("span");
      tag.className = "wb-tag wb-click";
      tag.innerHTML = `${esc(x.emoji)} ${esc(x.en)}<span class="rm" title="移除">✕</span>`;
      tag.addEventListener("click", (e) => {
        if (e.target.classList.contains("rm")) { S.removeEN(x.en); notifyBankChange(); window.App && window.App.toast("已移除，英语里的灰字会恢复哦"); wordbank(container); }
        else showEnDetail(x);
      });
      enBox.appendChild(tag);
    });
    const plBox = container.querySelector("#plBox");
    learned.forEach((p) => { const t = document.createElement("span"); t.className = "wb-tag wb-click"; t.textContent = `《${p.title}》`; t.addEventListener("click", () => showPoemDetail(p)); plBox.appendChild(t); });
    const prBox = container.querySelector("#prBox");
    recited.forEach((p) => { const t = document.createElement("span"); t.className = "wb-tag wb-click"; t.textContent = `《${p.title}》`; t.addEventListener("click", () => showPoemDetail(p)); prBox.appendChild(t); });
  }

  /* =========================================================
     10) 奖励
     ========================================================= */
  function reward(container) {
    const R = D.REWARDS, have = S.getRewards(), flower = S.getFlower();
    const expMap = R.experiences;
    container.innerHTML = `
      <div class="module-title">🎁 奖励兑换</div>
      <div class="module-sub">用努力换来的小红花，兑换喜欢的奖励吧！</div>
      <div class="card reward-tier">
        <h3>🌺 第一层：用小红花换实物</h3>
        <div id="tier1"></div>
      </div>
      <div class="card reward-tier">
        <h3>🌟 第二层：用收集物换体验奖励</h3>
        <div id="tier2"></div>
      </div>`;
    const t1 = container.querySelector("#tier1");
    R.exchange.filter((e) => e.from === "flower").forEach((e) => {
      const target = R.items.find((i) => i.key === e.to);
      const row = document.createElement("div"); row.className = "reward-row";
      row.innerHTML = `<div class="r-ico">${target.ico}</div>
        <div class="r-info"><div style="font-weight:800">${esc(e.label)}</div><div class="r-have">你现有 🌺 ${flower} 朵</div></div>
        <button class="btn btn-sm">兑换</button>`;
      row.querySelector("button").addEventListener("click", () => {
        const r = S.exchange("flower", e.to, e.cost);
        if (r.ok) { window.App && window.App.toast(`兑换成功！获得${target.ico}${target.name} 🎉`); reward(container); }
        else window.App && window.App.toast(r.msg);
      });
      t1.appendChild(row);
    });
    const t2 = container.querySelector("#tier2");
    R.exchange.filter((e) => e.from !== "flower").forEach((e) => {
      const fromItem = R.items.find((i) => i.key === e.from);
      const exp = expMap[e.to];
      const row = document.createElement("div"); row.className = "reward-row";
      row.innerHTML = `<div class="r-ico">${fromItem.ico}</div>
        <div class="r-info"><div style="font-weight:800">${esc(e.label)}</div><div class="r-have">你现有 ${fromItem.ico} ${have[e.from] || 0} 个</div></div>
        <button class="btn btn-sm">兑换</button>`;
      row.querySelector("button").addEventListener("click", () => {
        const r = S.exchange(e.from, e.to, e.cost);
        if (r.ok) { window.App && window.App.toast(`兑换成功！获得${exp.ico}${exp.name} 🎉`); reward(container); }
        else window.App && window.App.toast(r.msg);
      });
      t2.appendChild(row);
    });
    // 现有收集物展示
    const inv = document.createElement("div");
    inv.className = "card";
    inv.innerHTML = `<div style="font-weight:800;color:var(--pink-600)">🎀 我的收藏</div><div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:8px">` +
      R.items.map((i) => `<div style="text-align:center"><div style="font-size:30px">${i.ico}</div><div style="font-weight:800;color:var(--pink-600)">${(i.key === "flower" ? flower : (have[i.key] || 0))}</div><div style="font-size:12px;color:#8a6a78">${i.name}</div></div>`).join("") +
      `</div>`;
    container.appendChild(inv);
  }

  /* =========================================================
     11) 日历打卡
     ========================================================= */
  function calendar(container) {
    let viewY = new Date().getFullYear(), viewM = new Date().getMonth();
    container.innerHTML = `
      <div class="module-title">📅 日历打卡</div>
      <div class="module-sub">每天点一点日期就能打卡，连续打卡 7 天可得 5 朵小红花！</div>
      <div class="card">
        <div class="cal-head">
          <button class="btn btn-ghost btn-sm" id="prevM">◀</button>
          <div id="calTitle" style="font-weight:800;font-size:18px;color:var(--pink-600)"></div>
          <button class="btn btn-ghost btn-sm" id="nextM">▶</button>
        </div>
        <div class="poem-nav" style="margin-bottom:6px">
          <span class="chip">日</span><span class="chip">一</span><span class="chip">二</span><span class="chip">三</span><span class="chip">四</span><span class="chip">五</span><span class="chip">六</span>
        </div>
        <div class="cal-grid" id="calGrid"></div>
        <div style="margin-top:12px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <button class="btn btn-sm" id="checkToday">✅ 打卡今天</button>
          <div id="streakInfo" style="font-weight:800;color:var(--pink-600)"></div>
        </div>
      </div>`;
    const grid = container.querySelector("#calGrid");
    const title = container.querySelector("#calTitle");
    function render() {
      title.textContent = `${viewY} 年 ${viewM + 1} 月`;
      grid.innerHTML = "";
      const first = new Date(viewY, viewM, 1).getDay();
      const days = new Date(viewY, viewM + 1, 0).getDate();
      const today = S.todayStr();
      for (let i = 0; i < first; i++) { const e = document.createElement("div"); e.className = "cal-cell"; e.style.visibility = "hidden"; grid.appendChild(e); }
      for (let d = 1; d <= days; d++) {
        const ds = `${viewY}-${String(viewM + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const cell = document.createElement("div");
        cell.className = "cal-cell" + (S.isChecked(ds) ? " checked" : "") + (ds === today ? " today" : "") + (ds !== today ? " no-check" : "");
        cell.textContent = d;
        if (S.isChecked(ds)) { const s = document.createElement("span"); s.className = "star"; s.textContent = "🌺"; cell.appendChild(s); }
        cell.addEventListener("click", () => {
          if (ds !== today) { window.App && window.App.toast("只能签到当天哦～"); return; }
          const r = S.checkIn(ds);
          if (r.already) window.App && window.App.toast("今天已经打卡啦～");
          else if (r.reward) window.App && window.App.toast(`打卡成功！连续 ${r.streak} 天，奖励 ${r.reward} 朵花！🎉`);
          else window.App && window.App.toast(`打卡成功！连续 ${r.streak} 天 🌺`);
          render();
        });
        grid.appendChild(cell);
      }
      const streak = S.getStreak();
      container.querySelector("#streakInfo").innerHTML = `当前连续打卡：<b>${streak}</b> 天（满 7 天奖 5 花）`;
    }
    container.querySelector("#prevM").addEventListener("click", () => { viewM--; if (viewM < 0) { viewM = 11; viewY--; } render(); });
    container.querySelector("#nextM").addEventListener("click", () => { viewM++; if (viewM > 11) { viewM = 0; viewY++; } render(); });
    container.querySelector("#checkToday").addEventListener("click", () => {
      const r = S.checkIn();
      if (r.already) window.App && window.App.toast("今天已经打卡啦～");
      else if (r.reward) window.App && window.App.toast(`打卡成功！连续 ${r.streak} 天，奖励 ${r.reward} 朵花！🎉`);
      else window.App && window.App.toast(`打卡成功！连续 ${r.streak} 天 🌺`);
      viewY = new Date().getFullYear(); viewM = new Date().getMonth(); render();
    });
    render();
  }

  /* =========================================================
     12) 家长端
     ========================================================= */
  function parent(container) {
    const cn = S.getCN().length, en = S.getEN().length;
    const learned = S.getLearnedPoems().length, recited = S.getRecitedPoems().length;
    const streak = S.getStreak(), total = S.getTotal(), today = S.getToday();
    const rw = S.getRewards(), flower = S.getFlower();
    // 近 7 日柱状图
    const log = S.getDailyLog();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = S.todayStr(d);
      days.push({ ds: ds.slice(5), v: log[ds] || 0 });
    }
    const maxV = Math.max(1, ...days.map((x) => x.v));
    container.innerHTML = `
      <div class="module-title">👨‍👩‍👧 家长端 · 学习报告</div>
      <div class="module-sub">了解艾米每天的学习进度与成果～</div>
      <div class="report-cards">
        <div class="report-card"><div class="rc-num">${streak}</div><div class="rc-label">连续打卡(天)</div></div>
        <div class="report-card"><div class="rc-num">${S.getCheckins().length}</div><div class="rc-label">累计打卡(天)</div></div>
        <div class="report-card"><div class="rc-num">${total}</div><div class="rc-label">累计小红花</div></div>
        <div class="report-card"><div class="rc-num">${today}</div><div class="rc-label">今日获得</div></div>
        <div class="report-card"><div class="rc-num">${cn}</div><div class="rc-label">已学汉字</div></div>
        <div class="report-card"><div class="rc-num">${en}</div><div class="rc-label">已学单词</div></div>
        <div class="report-card"><div class="rc-num">${learned}</div><div class="rc-label">已学诗词</div></div>
        <div class="report-card"><div class="rc-num">${recited}</div><div class="rc-label">会背诵</div></div>
        <div class="report-card"><div class="rc-num">${S.perfTotal(S.todayStr())}</div><div class="rc-label">今日表现</div></div>
        <div class="report-card"><div class="rc-num">${(S.getDrawings ? S.getDrawings().length : 0)}</div><div class="rc-label">绘画作品</div></div>
      </div>
      <div class="card" style="margin-top:16px">
        <div style="font-weight:800;color:var(--pink-600);margin-bottom:8px">📊 近 7 日获得小红花</div>
        <div class="bar-chart">${days.map((x) => `<div class="bar-col"><div class="bar-val">${x.v}</div><div class="bar" style="height:${Math.round(x.v / maxV * 100)}%"></div><div class="bar-day">${x.ds}</div></div>`).join("")}</div>
      </div>
      <div class="card">
        <div style="font-weight:800;color:var(--pink-600);margin-bottom:8px">🎀 奖励收集</div>
        <div style="display:flex;gap:16px;flex-wrap:wrap">
          <div>🌺 小红花：${flower}</div><div>🍬 糖果：${rw.candy}</div>
          <div>🌱 小树苗：${rw.sapling}</div><div>💎 大珍珠：${rw.pearl}</div>
          <div>🐱 小花猫：${rw.kitten}</div>
        </div>
      </div>`;
  }

  /* =========================================================
     13) 每日表现
     ========================================================= */
  function performance(container) {
    const today = S.todayStr();
    const bs = D.BEHAVIORS;
    function totalNow() { return S.perfTotal(today); }
    container.innerHTML = `
      <div class="module-title">🌟 每日表现</div>
      <div class="module-sub">每天完成好习惯，就能获得小红花！点一点今天的表现吧～</div>
      <div class="card">
        <div style="font-weight:800;color:var(--pink-600);font-size:18px">今天的表现小红花：<span id="perfTotal">${totalNow()}</span> 🌺</div>
        <div id="perfList" style="margin-top:12px"></div>
      </div>`;
    const list = container.querySelector("#perfList");
    const totalEl = container.querySelector("#perfTotal");
    const sel = S.getPerf(today);
    bs.forEach((b, idx) => {
      const row = document.createElement("div");
      row.className = "perf-row";
      const chosen = sel[b.id];
      row.innerHTML = `
        <div class="perf-label"><span class="perf-no">${idx + 1}</span> ${esc(b.label)}</div>
        <div class="perf-btns">
          <button class="btn btn-mint btn-sm perf-opt ${chosen === "good" ? "on" : ""}" data-opt="good">${esc(b.good.label)}</button>
          <button class="btn btn-ghost btn-sm perf-opt ${chosen === "bad" ? "on" : ""}" data-opt="bad">${esc(b.bad.label)}</button>
        </div>`;
      row.querySelectorAll(".perf-opt").forEach((btn) => {
        btn.addEventListener("click", () => {
          const opt = btn.dataset.opt;
          S.setPerf(today, b.id, opt);
          row.querySelectorAll(".perf-opt").forEach((n) => n.classList.remove("on"));
          btn.classList.add("on");
          totalEl.textContent = totalNow();
          window.App && window.App.toast(opt === "good" ? "表现 +" + b.good.delta + " 🌺" : (b.bad.delta === 0 ? "这次没有红花哦～" : "扣 " + Math.abs(b.bad.delta) + " 🌺"));
        });
      });
      list.appendChild(row);
    });
  }

  /* =========================================================
     14) 绘画
     ========================================================= */
  function draw(container) {
    // 每日范画：基于当天种子对整个主题池做洗牌，取前 N 个，保证每天分散且不重复
    // （原 dailyPickN 用连续索引，会导致相邻两天 4/5 重叠；改用洗牌后每天都真正不一样）
    const REF_DAILY_N = 6;
    function seededShuffle(arr, seed) {
      const rnd = S.seededRand(seed >>> 0);
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        const t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }
    let refsToday = seededShuffle(D.DRAW_PROMPTS, (S.todaySeed() ^ 0x51ed270b) >>> 0).slice(0, REF_DAILY_N);
    let activeRef = refsToday[0];
    const usedRefNames = refsToday.map((p) => p.name); // 已展示过的范画，换一换时排除，避免立刻重复
    // 每日场景参考：按天轮换一幅“多元素、故事性强”的整幅画，供孩子照着学习
    const scenesAll = (D.DRAW_SCENES && D.DRAW_SCENES.length) ? D.DRAW_SCENES : [];
    let sceneIdx = scenesAll.length ? S.dailyIndex(scenesAll.length) : 0;
    // 渲染“范画”画廊（可换一换切换，且与当前展示的范画不重复）
    function setActiveTip(p) {
      const t = container.querySelector("#activeRefTip");
      if (t) t.textContent = (p && p.step) ? ("💡 小提示：" + p.step) : "";
    }
    function renderRefs() {
      const gal = container.querySelector("#drawRefGallery");
      if (!gal) return;
      gal.innerHTML = refsToday.map((p, i) => {
        const hasSvg = D.DRAW_REFS && D.DRAW_REFS[p.name];
        const svg = hasSvg ? D.DRAW_REFS[p.name] : `<div style="font-size:46px">${esc(p.emoji)}</div>`;
        const badge = (p.cat) ? `<div class="draw-ref-cat">${esc(p.cat)}</div>` : "";
        return `<div class="draw-ref-card${i === 0 ? " on" : ""}" data-name="${esc(p.name)}" title="点一下选这个范画">
            <div class="draw-ref-svg">${svg}</div>
            <div class="draw-ref-name">${esc(p.name)} ${esc(p.emoji)}</div>
            ${badge}
          </div>`;
      }).join("");
      const rn = container.querySelector("#refNames");
      if (rn) rn.textContent = refsToday.map((p) => p.name).join("、");
      activeRef = refsToday[0];
      const lab = container.querySelector("#activeRefName");
      if (lab) lab.textContent = activeRef.name + " " + activeRef.emoji;
      setActiveTip(activeRef);
      gal.querySelectorAll(".draw-ref-card").forEach((card) => {
        card.addEventListener("click", () => {
          gal.querySelectorAll(".draw-ref-card").forEach((n) => n.classList.remove("on"));
          card.classList.add("on");
          const nm = card.dataset.name;
          const found = refsToday.find((p) => p.name === nm);
          if (found) { activeRef = found; const l = container.querySelector("#activeRefName"); if (l) l.textContent = found.name + " " + found.emoji; setActiveTip(found); }
        });
      });
    }
    function shuffleRefs() {
      let pool = D.DRAW_PROMPTS.slice();
      let cand = pool.filter((p) => !usedRefNames.includes(p.name));
      if (cand.length < 5) { usedRefNames.length = 0; cand = pool.slice(); } // 池子用尽则重置，避免卡死
      for (let i = cand.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = cand[i]; cand[i] = cand[j]; cand[j] = t; }
      const next = cand.slice(0, 5);
      usedRefNames.push.apply(usedRefNames, next.map((p) => p.name));
      refsToday = next;
      renderRefs();
    }
    // 真正加载并展示某一幅场景大图（仅在用户点击场景 / 换一换 时才触发，避免打开即下载大图造成卡顿）
    function loadScene() {
      const wrap = container.querySelector("#sceneWrap");
      if (!wrap || !scenesAll.length) return;
      const st = scenesAll[sceneIdx % scenesAll.length];
      wrap.innerHTML = `
      <div class="card draw-scene">
        <div class="draw-scene-head" style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
          <span>🖼️ 今日场景参考：<b style="color:var(--pink-600)">${esc(st.name)}</b> ${esc(st.emoji)}（照着画一个大故事吧！）</span>
          <button class="btn btn-ghost btn-sm" id="sceneShuffle" title="换一个场景参考">🔄 换一换</button>
        </div>
        <div class="draw-scene-body">
          <div class="draw-scene-svg"><img src="${st.img || st.svg}" alt="${esc(st.name)}" class="draw-scene-img" loading="lazy" decoding="async"></div>
          <div class="draw-scene-story">${esc(st.story)}</div>
        </div>
      </div>`;
      wrap.querySelector("#sceneShuffle").addEventListener("click", () => {
        if (scenesAll.length < 2) return;
        let ni = sceneIdx;
        while (ni === sceneIdx) ni = Math.floor(Math.random() * scenesAll.length);
        sceneIdx = ni;
        loadScene();
      });
    }
    // 初始只展示「场景选择条」，不加载任何大图；点场景或换一换才加载对应图片
    function showScenePicker() {
      const wrap = container.querySelector("#sceneWrap");
      if (!wrap || !scenesAll.length) return;
      const chips = scenesAll.map((s, i) =>
        `<button class="scene-chip" data-i="${i}" title="点一下看《${esc(s.name)}》参考图">${esc(s.emoji)} <span>${esc(s.name)}</span></button>`
      ).join("");
      wrap.innerHTML = `
      <div class="card draw-scene draw-scene-idle">
        <div class="draw-scene-head" style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
          <span>🖼️ 今日场景参考（<b style="color:var(--pink-600)">点下面的场景</b> 或按「换一换」，参考图马上出现～）</span>
          <button class="btn btn-ghost btn-sm" id="sceneShuffle" title="随机换一个场景参考">🔄 换一换</button>
        </div>
        <div class="draw-scene-picker">
          <div class="draw-scene-placeholder">👆 选一个喜欢的场景，参考图立刻加载给你看！</div>
          <div class="scene-chips">${chips}</div>
        </div>
      </div>`;
      wrap.querySelector("#sceneShuffle").addEventListener("click", () => {
        if (scenesAll.length < 2) return;
        let ni = sceneIdx;
        while (ni === sceneIdx) ni = Math.floor(Math.random() * scenesAll.length);
        sceneIdx = ni;
        loadScene();
      });
      wrap.querySelectorAll(".scene-chip").forEach((ch) => {
        ch.addEventListener("click", () => { sceneIdx = +ch.dataset.i; loadScene(); });
      });
    }
    container.innerHTML = `
      <div class="module-title">🎨 绘画小天地</div>
      <div class="module-sub">🎨 今天为你准备了 <b style="color:var(--pink-600)">${REF_DAILY_N} 个范画</b> 灵感：<span id="refNames"></span>。点左边的图选一个，在右边画出来，画完点「完成」！（点「换一换」还有好多好多哦～ 今天已画 <b id="drawCount" style="color:var(--pink-600)">0</b>/6 副）</div>
      <div id="sceneWrap"></div>
      <div class="draw-top">
        <div class="draw-prompt">正在画：<b id="activeRefName" style="color:var(--pink-600);font-size:18px">${esc(activeRef.name)} ${activeRef.emoji}</b></div>
        <div class="draw-ref-tip-big" id="activeRefTip"></div>
        <div class="draw-tools">
          <div class="tool-row">
            <button class="btn btn-sm tool-btn on" data-tool="brush">🖌️ 画笔</button>
            <button class="btn btn-sm btn-ghost tool-btn" data-tool="fill">🪣 涂色</button>
          </div>
          <div class="tool-row" id="palette"></div>
          <div class="tool-row">
            <input type="color" id="customColor" value="#ff6fa3" title="自定义颜色" style="width:44px;height:40px;border:none;background:none;cursor:pointer" />
            <button class="btn btn-sm btn-ghost" id="undoBtn" title="撤销">↩️ 撤销</button>
            <button class="btn btn-sm btn-ghost" id="clearBtn" title="清空">🧹 清空</button>
          </div>
        </div>
      </div>
      <div class="draw-main">
        <div class="draw-ref">
          <div class="draw-ref-head" style="display:flex;justify-content:space-between;align-items:center;gap:10px">
            <span>📋 选一个范画（学着画）</span>
            <button class="btn btn-ghost btn-sm" id="refShuffle" title="换一批范画，不重复">🔄 换一换</button>
          </div>
          <div class="draw-ref-gallery" id="drawRefGallery"></div>
        </div>
        <div class="draw-canvas-wrap">
          <canvas id="drawCanvas" width="480" height="360" class="draw-canvas"></canvas>
          <div style="margin-top:10px;display:flex;gap:10px;justify-content:center">
            <button class="btn btn-primary" id="finishBtn">✅ 完成封存</button>
            <button class="btn btn-ghost btn-sm" id="clearBtn2">🧹 重新画</button>
          </div>
        </div>
      </div>
      <div class="draw-hist-head">🖼️ 历史作品（最新在前）</div>
      <div class="draw-hist" id="drawHist"></div>`;

    showScenePicker();
    const canvas = container.querySelector("#drawCanvas");
    const ctx = canvas.getContext ? canvas.getContext("2d") : null;
    if (ctx) { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }

    let tool = "brush";
    let color = "#ff6fa3";
    const lineW = 6;
    const palette = container.querySelector("#palette");
    const COLORS = ["#ff6fa3","#ffce54","#6cc4ff","#46c9a3","#a06bff","#ff5a5a","#2b2b2b","#ffffff"];
    COLORS.forEach((c) => {
      const sw = document.createElement("span");
      sw.className = "swatch" + (c === color ? " on" : "");
      sw.style.background = c;
      sw.dataset.c = c;
      sw.addEventListener("click", () => {
        color = c;
        palette.querySelectorAll(".swatch").forEach((n) => n.classList.remove("on"));
        sw.classList.add("on");
      });
      palette.appendChild(sw);
    });
    container.querySelector("#customColor").addEventListener("input", (e) => { color = e.target.value; });

    container.querySelectorAll(".tool-btn").forEach((b) => {
      b.addEventListener("click", () => {
        tool = b.dataset.tool;
        container.querySelectorAll(".tool-btn").forEach((n) => n.classList.remove("on"));
        b.classList.add("on");
      });
    });

    container.querySelector("#refShuffle").addEventListener("click", shuffleRefs);
    renderRefs();

    const undoStack = [];
    function pushUndo() { if (!ctx) return; try { undoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height)); if (undoStack.length > 12) undoStack.shift(); } catch (e) {} }
    function clearCanvas() { if (!ctx) return; ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    container.querySelector("#clearBtn").addEventListener("click", () => { pushUndo(); clearCanvas(); });
    container.querySelector("#clearBtn2").addEventListener("click", () => { pushUndo(); clearCanvas(); });
    container.querySelector("#undoBtn").addEventListener("click", () => { if (!ctx) return; const img = undoStack.pop(); if (img) ctx.putImageData(img, 0, 0); });

    function pos(e) {
      const rect = canvas.getBoundingClientRect();
      const cx = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
      const cy = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
      return { x: (cx - rect.left) * (canvas.width / rect.width), y: (cy - rect.top) * (canvas.height / rect.height) };
    }
    let drawing = false, lastX = 0, lastY = 0;
    function startDraw(e) {
      if (!ctx) return;
      if (tool === "fill") { floodFill(pos(e)); return; }
      pushUndo(); drawing = true; const p = pos(e); lastX = p.x; lastY = p.y;
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p.x, p.y, lineW / 2, 0, Math.PI * 2); ctx.fill();
    }
    function moveDraw(e) {
      if (!ctx || !drawing) return; if (e.cancelable) e.preventDefault();
      const p = pos(e); ctx.strokeStyle = color; ctx.lineWidth = lineW; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(p.x, p.y); ctx.stroke(); lastX = p.x; lastY = p.y;
    }
    function endDraw() { drawing = false; }
    if (ctx) {
      canvas.addEventListener("pointerdown", startDraw);
      canvas.addEventListener("pointermove", moveDraw);
      canvas.addEventListener("pointerup", endDraw);
      canvas.addEventListener("pointerleave", endDraw);
      canvas.style.touchAction = "none";
    }

    function hexToRgb(hex) {
      hex = String(hex).replace("#", "");
      if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
      const n = parseInt(hex, 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 255 };
    }
    function floodFill(at) {
      if (!ctx) return;
      const w = canvas.width, h = canvas.height;
      let img; try { img = ctx.getImageData(0, 0, w, h); } catch (e) { return; }
      const data = img.data;
      const x = Math.floor(at.x), y = Math.floor(at.y);
      if (x < 0 || y < 0 || x >= w || y >= h) return;
      const idx0 = (y * w + x) * 4;
      const tr = data[idx0], tg = data[idx0 + 1], tb = data[idx0 + 2], ta = data[idx0 + 3];
      const fc = hexToRgb(color);
      if (Math.abs(tr - fc.r) < 12 && Math.abs(tg - fc.g) < 12 && Math.abs(tb - fc.b) < 12 && ta === fc.a) return;
      const tol = 40; const stack = [[x, y]];
      while (stack.length) {
        const cell = stack.pop(); const cx = cell[0], cy = cell[1];
        if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue;
        const i = (cy * w + cx) * 4;
        if (Math.abs(data[i] - tr) > tol || Math.abs(data[i + 1] - tg) > tol || Math.abs(data[i + 2] - tb) > tol || data[i + 3] !== ta) continue;
        data[i] = fc.r; data[i + 1] = fc.g; data[i + 2] = fc.b; data[i + 3] = fc.a;
        stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
      }
      ctx.putImageData(img, 0, 0);
    }
    function coverage() {
      if (!ctx) return 1;
      let img; try { img = ctx.getImageData(0, 0, canvas.width, canvas.height); } catch (e) { return 1; }
      const d = img.data; let nonWhite = 0;
      for (let i = 0; i < d.length; i += 4) { if (d[i] < 245 || d[i + 1] < 245 || d[i + 2] < 245) nonWhite++; }
      return nonWhite / (d.length / 4);
    }

    function updateDrawCount() {
      const el = container.querySelector("#drawCount");
      if (!el) return;
      const n = S.getDrawings().filter((d) => d.date === S.todayStr()).length;
      el.textContent = Math.min(n, 6);
    }
    updateDrawCount();

    container.querySelector("#finishBtn").addEventListener("click", () => {
      if (!ctx) { window.App && window.App.toast("当前浏览器不支持画板，换 Chrome/Edge 试试～"); return; }
      // 每日最多 5 副，超过则提示并不保存
      const todayCount = S.getDrawings().filter((d) => d.date === S.todayStr()).length;
      if (todayCount >= 6) {
        window.App && window.App.toast("每天最多只能画6副哦！快去学学习其他内容吧！");
        return;
      }
      const cov = coverage();
      const COMMENTS = ["画得真棒！色彩很漂亮🌟","你的画充满想象力，老师很喜欢💖","好可爱的画，线条很流畅👏","颜色搭配得真好，像小画家一样🎨","你观察得真仔细，画得很生动🌈","一笔一笔都很认真，真厉害✨"];
      const SUGGEST = ["下次可以试试把画面画得更满一些哦🖍️","多观察真实的形状，会画得更像📐","颜色再丰富一点会更漂亮🌈","如果加上背景（天空、草地）会更完整🏞️","每天画一点，你会越来越棒💪"];
      const comment = COMMENTS[Math.floor(Math.random() * COMMENTS.length)];
      const suggestion = cov < 0.02 ? "这次画得有点少，下次大胆多画一些吧！🖍️" : SUGGEST[Math.floor(Math.random() * SUGGEST.length)];
      let img = ""; try { img = canvas.toDataURL("image/jpeg", 0.7); } catch (e) { img = ""; }
      S.addDrawing({ id: Date.now(), date: S.todayStr(), prompt: activeRef.name + " " + activeRef.emoji, img: img, comment: comment, suggestion: suggestion });
      window.App && window.App.toast("作品已封存！🎉");
      renderHistory();
      updateDrawCount();
    });

    function renderHistory() {
      const hist = container.querySelector("#drawHist");
      const items = S.getDrawings();
      if (!items.length) { hist.innerHTML = `<div class="tip">还没有作品，快画第一幅吧！</div>`; return; }
      hist.innerHTML = "";
      items.forEach((it) => {
        const t = document.createElement("div");
        t.className = "hist-item";
        const thumb = it.img ? `<img src="${it.img}" alt="作品" />` : `<div style="font-size:30px">🖼️</div>`;
        t.innerHTML = `${thumb}<div class="hist-date">${esc((it.date || "").slice(5))}</div><span class="hist-del" title="删除">🗑️</span>`;
        t.addEventListener("click", (e) => {
          if (e.target.classList.contains("hist-del")) { e.stopPropagation(); confirmDelete(it, t); }
          else showWork(it);
        });
        hist.appendChild(t);
      });
    }
    function confirmDelete(it, itemEl) {
      document.querySelectorAll(".work-modal").forEach((n) => n.remove());
      const m = document.createElement("div");
      m.className = "modal-mask work-modal";
      m.innerHTML = `<div class="modal-card">
        <div class="modal-title">🗑️ 删除作品</div>
        <div class="modal-tip">确定要删除这幅作品吗？删除后就不能恢复啦～</div>
        <div class="modal-actions">
          <button class="btn btn-ghost" id="wmCancel">再想想</button>
          <button class="btn btn-danger" id="wmDel">确定删除</button>
        </div>
      </div>`;
      document.body.appendChild(m);
      m.addEventListener("click", (e) => { if (e.target === m) m.remove(); });
      m.querySelector("#wmCancel").addEventListener("click", () => m.remove());
      m.querySelector("#wmDel").addEventListener("click", () => {
        S.removeDrawing(it.id);
        m.remove();
        renderHistory();
        updateDrawCount();
        window.App && window.App.toast("已删除这幅作品");
      });
    }
    function showWork(it) {
      document.querySelectorAll(".work-modal").forEach((n) => n.remove());
      const m = document.createElement("div");
      m.className = "modal-mask work-modal";
      const big = it.img ? `<img src="${it.img}" style="max-width:100%;border-radius:12px" />` : `<div style="font-size:80px">🖼️</div>`;
      m.innerHTML = `<div class="modal-card">
        <div class="modal-title">🖼️ ${esc(it.prompt || "")}</div>
        <div style="text-align:center">${big}</div>
        <div style="margin-top:10px;background:var(--pink-50);border-radius:14px;padding:12px">${esc(it.comment || "")}</div>
        <div style="margin-top:8px;background:#e7faf1;border-radius:14px;padding:12px;color:var(--mint-d)"><b>完善建议：</b>${esc(it.suggestion || "")}</div>
        <div class="modal-actions"><button class="btn btn-primary" id="wmClose">关闭</button></div>
      </div>`;
      document.body.appendChild(m);
      m.addEventListener("click", (e) => { if (e.target === m) m.remove(); });
      m.querySelector("#wmClose").addEventListener("click", () => m.remove());
    }
    renderHistory();
  }

  /* =========================================================
     时钟表盘 SVG（时分指针按角度旋转）
     ========================================================= */
  function clockSVGShell() {
    const cx = 100, cy = 100, r = 86;
    let ticks = "";
    for (let i = 0; i < 60; i++) {
      const a = i * 6 * Math.PI / 180;
      const isHour = i % 5 === 0;
      const inner = isHour ? (r - 13) : (r - 7);
      const x1 = cx + Math.sin(a) * inner, y1 = cy - Math.cos(a) * inner;
      const x2 = cx + Math.sin(a) * r, y2 = cy - Math.cos(a) * r;
      ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#caa" stroke-width="${isHour ? 3 : 1}"/>`;
    }
    let nums = "";
    for (let i = 1; i <= 12; i++) {
      const a = i * 30 * Math.PI / 180;
      const nx = cx + Math.sin(a) * (r - 24);
      const ny = cy - Math.cos(a) * (r - 24);
      nums += `<text x="${nx.toFixed(1)}" y="${(ny + 5).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="700" fill="#7a5a3a">${i}</text>`;
    }
    return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" class="clock-svg">` +
      `<circle cx="100" cy="100" r="${r}" fill="#fffdf6" stroke="#caa" stroke-width="4"/>` +
      `${ticks}${nums}` +
      `<line id="hrHand" x1="100" y1="100" x2="100" y2="58" stroke="#e26a9c" stroke-width="6" stroke-linecap="round"/>` +
      `<line id="minHand" x1="100" y1="100" x2="100" y2="34" stroke="#444" stroke-width="4" stroke-linecap="round"/>` +
      `<line id="secHand" x1="100" y1="112" x2="100" y2="26" stroke="#e0533a" stroke-width="2" stroke-linecap="round"/>` +
      `<circle cx="100" cy="100" r="5" fill="#444"/>` +
      `</svg>`;
  }

  function setClock(svg, h, m, s) {
    const hrA = (h % 12) * 30 + (m % 60) * 0.5;
    const minA = (m % 60) * 6;
    const secA = (s % 60) * 6;
    const hr = svg.querySelector("#hrHand");
    const mn = svg.querySelector("#minHand");
    const sc = svg.querySelector("#secHand");
    if (hr) hr.setAttribute("transform", `rotate(${hrA.toFixed(2)} 100 100)`);
    if (mn) mn.setAttribute("transform", `rotate(${minA.toFixed(2)} 100 100)`);
    if (sc) sc.setAttribute("transform", `rotate(${secA.toFixed(2)} 100 100)`);
  }

  /* =========================================================
     认识时间
     ========================================================= */
  function timeclock(container) {
    if (timeclock._raf) { if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(timeclock._raf); timeclock._raf = null; }
    container.innerHTML = `
      <div class="module-title">⏰ 认识时间</div>
      <div class="module-sub">左边是现在真正的时间，时针、分针、秒针一直在走；右边来猜一猜钟面显示的是几点吧！</div>
      <div class="clock-layout">
        <div class="clock-left">
          <div class="clock-cap">🕐 现在的时间</div>
          <div id="liveClock"></div>
          <div id="liveText" style="font-size:20px;font-weight:800;color:var(--purple);margin-top:6px"></div>
        </div>
        <div class="clock-right">
          <div class="clock-cap">❓ 猜一猜：钟面现在是几点？</div>
          <div id="guessClock"></div>
          <div class="module-sub">下面哪个时间最像钟面显示的？</div>
          <div class="tile-row" id="guessOpts"></div>
          <div id="guessRes" style="margin-top:8px"></div>
          <button class="btn btn-ghost btn-sm" id="guessNext" style="margin-top:6px">➡️ 换一个</button>
        </div>
      </div>`;
    const liveClock = container.querySelector("#liveClock");
    const liveText = container.querySelector("#liveText");
    liveClock.innerHTML = clockSVGShell();
    const raf = (typeof requestAnimationFrame === "function")
      ? requestAnimationFrame
      : (cb) => setTimeout(() => cb(Date.now()), 33);
    const caf = (typeof cancelAnimationFrame === "function") ? cancelAnimationFrame : clearTimeout;
    function frame() {
      if (!liveClock.isConnected) { caf(timeclock._raf); timeclock._raf = null; return; }
      const now = new Date();
      const h = now.getHours() % 12, m = now.getMinutes(), s = now.getSeconds(), ms = now.getMilliseconds();
      setClock(liveClock, h, m, s + ms / 1000);
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      liveText.textContent = `${now.getHours()}点${now.getMinutes()}分${now.getSeconds()}秒（${hh}:${mm}:${ss}）`;
      timeclock._raf = raf(frame);
    }
    frame();

    const guessClock = container.querySelector("#guessClock");
    const guessOpts = container.querySelector("#guessOpts");
    const guessRes = container.querySelector("#guessRes");
    function newGuess() {
      const h = Math.floor(Math.random() * 12);
      const mOpts = [0, 15, 30, 45];
      const m = mOpts[Math.floor(Math.random() * mOpts.length)];
      guessClock.innerHTML = clockSVGShell();
      setClock(guessClock, h, m, 0);
      const answer = h === 0 ? 12 : h;
      const label = `${answer}:${String(m).padStart(2, "0")}`;
      const opts = new Set([label]);
      while (opts.size < 3) {
        const hh2 = 1 + Math.floor(Math.random() * 12);
        const mm2 = mOpts[Math.floor(Math.random() * mOpts.length)];
        opts.add(`${hh2}:${String(mm2).padStart(2, "0")}`);
      }
      guessOpts.innerHTML = "";
      Array.from(opts).sort(() => Math.random() - 0.5).forEach((o) => {
        const t = document.createElement("div"); t.className = "tile time-opt"; t.textContent = o;
        t.addEventListener("click", () => {
          if (o === label) { guessRes.innerHTML = `<div class="feedback ok">你好棒！猜对啦！🌟 就是 ${label}！</div>`; S.addFlowers(1, "认时间"); }
          else { guessRes.innerHTML = `<div class="feedback warn">再看看时针和分针哦～ 正确答案是 ${label}</div>`; }
        });
        guessOpts.appendChild(t);
      });
      guessRes.innerHTML = "";
    }
    newGuess();
    container.querySelector("#guessNext").addEventListener("click", newGuess);
  }

  /* =========================================================
     十万个为什么
     ========================================================= */
  function whys(container) {
    const WHY_DAILY_N = 6;
    const WHY_SEED = 0x7a3c91e5;
    // 按种子对全池洗牌（与 draw 模块同款），保证同天稳定、跨天不同
    function seededShuffle(arr, seed) {
      const rnd = S.seededRand(seed >>> 0);
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        const t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    }
    // 每日 6 条：当天种子洗牌取前 6，分散且不重叠
    let whyToday = seededShuffle(D.WHYS, (S.todaySeed() ^ WHY_SEED) >>> 0).slice(0, WHY_DAILY_N);
    const shownQ = new Set(whyToday.map((w) => w.q)); // 换一换时排除已展示项，避免重复
    function renderWhys() {
      const box = container.querySelector("#whyList");
      if (!box) return;
      box.innerHTML = "";
      whyToday.forEach((w) => {
        const card = document.createElement("div");
        card.className = "card why-card";
        card.innerHTML = `
          <div class="why-q">❓ ${esc(w.q)}</div>
          <div class="why-a">${esc(w.a)}</div>
          <button class="btn btn-sm why-read">🔊 读给我听</button>`;
        card.querySelector(".why-read").addEventListener("click", () => A.speak(w.q + "。" + w.a, "zh-CN"));
        box.appendChild(card);
      });
      const cnt = container.querySelector("#whyCount");
      if (cnt) cnt.textContent = "今天挑了 " + whyToday.length + " 个（题库共 " + D.WHYS.length + " 个）";
    }
    // 换一换：从全池排除已展示项取 6 条，池子用尽再重置，保证每次都更新且不重复
    function shuffleWhys() {
      let cand = D.WHYS.filter((w) => !shownQ.has(w.q));
      if (cand.length < WHY_DAILY_N) { shownQ.clear(); cand = D.WHYS.slice(); }
      for (let i = cand.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = cand[i]; cand[i] = cand[j]; cand[j] = t; }
      const next = cand.slice(0, WHY_DAILY_N);
      next.forEach((w) => shownQ.add(w.q));
      whyToday = next;
      renderWhys();
    }
    container.innerHTML = `
      <div class="module-title">💡 十万个为什么</div>
      <div class="module-sub">点 🔊 听一听答案；想看别的就点「换一换」，每次都不重复～</div>
      <div class="why-head">
        <span class="why-count" id="whyCount"></span>
        <button class="btn btn-sm why-shuffle" id="whyShuffle">🔄 换一换</button>
      </div>
      <div id="whyList"></div>`;
    container.querySelector("#whyShuffle").addEventListener("click", shuffleWhys);
    renderWhys();
  }

  return {
    pinyin: pinyin, shizi: shizi, math: math, english: english, logic: logic,
    book: book, game: game, poetry: poetry, wordbank: wordbank, reward: reward,
    calendar: calendar, parent: parent, performance: performance, draw: draw,
    timeclock: timeclock, whys: whys,
    judgeLogic: judgeLogic,
    notifyBankChange: notifyBankChange
  };
})();
