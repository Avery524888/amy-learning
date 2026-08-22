/* =========================================================
   艾米的学习乐园 — 状态与持久化 (Store)
   职责：
     - 定义清晰的状态结构（schema）
     - localStorage 持久化，带版本迁移与异常保护
     - 安全：提供 esc() 转义助手，杜绝 XSS；所有用户输入先校验
     - 积分/打卡/词库/诗词/奖励/AI 配置的增改 API
     - 轻量发布订阅，供 UI 刷新
   ========================================================= */
window.Store = (function () {
  "use strict";
  const KEY = "amy_learning_v2";
  const VERSION = 2;

  /* ---------- 安全：HTML 转义（防 XSS） ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- 默认状态 ---------- */
  function defaults() {
    return {
      version: VERSION,
      user: { name: (window.Data && Data.DEFAULT_NAME) || "艾米", avatar: "🐰" },
      totalFlowers: 0,
      todayFlowers: 0,
      lastFlowerDay: "",          // 用于每日积分清零
      dailyLog: {},               // { "2026-08-04": 当日获得积分 }
      checkins: [],               // ["2026-08-04", ...]
      lastRewardStreak: 0,
      learnedCN: [],              // [{char,py,mean}]
      learnedEN: [],              // [{en,cn,emoji}]
      poemLearned: [],            // [{title,author}]
      poemRecited: [],            // [{title,author}]
      rewards: { candy: 0, sapling: 0, pearl: 0, kitten: 0 },
      ai: { base: "", key: "", model: "" },
      tts: { url: "" },                 // 豆包TTS后端地址（如 http://localhost:3001/tts）
      lastVisit: todayStr(),
      perfByDate: {},             // { "2026-08-06": { behaviorId: "good"|"bad" } }
      enCursor: 0,                // 每日英语轮换指针
      dailyEN: {},                // { "2026-08-06": { newKeys:[], reviewKeys:[] } }
      dailySel: {},               // { logic:{date:[idx...]}, book:{date:[idx]} } 每日不重复选题缓存
      drawings: [],              // 绘画作品 [{id,date,prompt,img,comment,suggestion}]
      readBooks: []               // 已读绘本标题列表（右上角标记绿勾，可重复阅读）
    };
  }

  /* ---------- 持久化 ---------- */
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      const o = JSON.parse(raw);
      return migrate(o);
    } catch (e) {
      console.warn("读取存档失败，使用默认状态", e);
      return defaults();
    }
  }
  function migrate(o) {
    const d = defaults();
    if (!o || typeof o !== "object") return d;
    // 合并，保证字段完整
    const s = Object.assign(d, o);
    s.user = Object.assign(d.user, o.user || {});
    s.rewards = Object.assign(d.rewards, o.rewards || {});
    s.ai = Object.assign(d.ai, o.ai || {});
    s.tts = Object.assign(d.tts, o.tts || {});
    if (!Array.isArray(s.checkins)) s.checkins = [];
    if (!Array.isArray(s.learnedCN)) s.learnedCN = [];
    if (!Array.isArray(s.learnedEN)) s.learnedEN = [];
    if (!Array.isArray(s.poemLearned)) s.poemLearned = [];
    if (!Array.isArray(s.poemRecited)) s.poemRecited = [];
    if (!Array.isArray(s.readBooks)) s.readBooks = [];
    return s;
  }
  // 初始化状态
  let state = load();
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("保存失败", e);
    }
  }

  /* ---------- 工具 ---------- */
  function todayStr(d) {
    d = d || new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  function dayNumber(d) {
    // 以 2026-01-01 为基准的天数，用于每日内容轮换
    const base = Date.UTC(2026, 0, 1);
    return Math.floor((d.getTime() - base) / 86400000);
  }
  function isToday(str) { return str === todayStr(); }

  /* ---------- 每日轮换工具 ---------- */
  // 当天整数种子（同一天稳定，跨天变化）
  function todaySeed() {
    let n = dayNumber(new Date());
    // 扩散到 32 位无符号，避免集中在小范围
    return (Math.imul(n + 1, 2654435761) >>> 0);
  }
  // 确定性取数组中的第 k 个（按天轮换）
  function dailyPick(arr, offset) {
    const n = dayNumber(new Date()) + (offset || 0);
    const len = arr.length || 1;
    return arr[((n % len) + len) % len];
  }
  // 连续取 n 个（按天轮换起点）
  function dailyPickN(arr, n, offset) {
    const start = dayNumber(new Date()) + (offset || 0);
    const len = arr.length || 1;
    const out = [];
    for (let i = 0; i < n; i++) out.push(arr[((start + i) % len + len) % len]);
    return out;
  }
  // 可复现伪随机（mulberry32），用种子生成稳定序列
  function seededRand(seed) {
    let t = (seed >>> 0) || 1;
    return function () {
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- 每日内容「不重复」选取 ---------- */
  // 取某天相对 today 偏移 n 天的日期对象
  function addDays(date, n) { const d = new Date(date.getTime()); d.setDate(d.getDate() + n); return d; }
  // 字符串哈希（FNV-1a），用于给不同内容池不同的随机种子
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  // 从 pool 中选 count 个，且与最近 historyDays 天已选的不重复（同天稳定、跨天变化）
  function dailyChoice(key, pool, count, historyDays) {
    const d = todayStr();
    if (!state.dailySel) state.dailySel = {};
    if (!state.dailySel[key]) state.dailySel[key] = {};
    if (state.dailySel[key][d]) {
      return state.dailySel[key][d].map((i) => pool[i]).filter(Boolean);
    }
    const len = pool.length;
    if (!len) return [];
    // 收集最近 historyDays 天已选下标，避免重复
    const recent = new Set();
    for (let i = 1; i <= historyDays; i++) {
      const ds = todayStr(addDays(new Date(), -i));
      const arr = state.dailySel[key][ds];
      if (arr) arr.forEach((x) => recent.add(x));
    }
    // 用当天种子 + 内容池名做洗牌，保证确定且跨天变化
    const rnd = seededRand((todaySeed() ^ hashStr(key)) >>> 0);
    const idxs = pool.map((_, i) => i);
    for (let i = idxs.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const t = idxs[i]; idxs[i] = idxs[j]; idxs[j] = t;
    }
    const chosen = [];
    for (const ix of idxs) { if (chosen.length >= count) break; if (!recent.has(ix)) chosen.push(ix); }
    // 若池子太小不够避开近期，再补足（保证数量）
    let k = 0;
    while (chosen.length < count && k < idxs.length) { if (chosen.indexOf(idxs[k]) < 0) chosen.push(idxs[k]); k++; }
    state.dailySel[key][d] = chosen;
    save();
    return chosen.map((i) => pool[i]).filter(Boolean);
  }
  // 每日 5 道逻辑题（与最近 3 天不重复）
  function getDailyLogic() { return dailyChoice("logic", (window.Data && window.Data.LOGIC) || [], 5, 3); }
  // 每日推荐绘本（与最近 3 天不重复）
  function getDailyBook() { const a = dailyChoice("book", (window.Data && window.Data.BOOKS) || [], 1, 3); return a[0]; }
  // 每日 5 本新绘本（与最近 7 天不重复），排在前面
  function getDailyBooks() { return dailyChoice("book5", (window.Data && window.Data.BOOKS) || [], 5, 7); }

  /* ---------- 红花可调（允许扣减，下限 0） ---------- */
  function adjustFlowers(delta, reason) {
    if (!isToday(state.lastFlowerDay)) {
      state.todayFlowers = 0;
      state.lastFlowerDay = todayStr();
      state.dailyLog[todayStr()] = 0;
    }
    state.totalFlowers = Math.max(0, state.totalFlowers + delta);
    state.todayFlowers = Math.max(0, state.todayFlowers + delta);
    state.dailyLog[todayStr()] = state.todayFlowers;
    save(); emit();
  }

  /* ---------- 每日表现（8 项行为） ---------- */
  function optionDelta(b, key) {
    if (key === "good") return (b.good && b.good.delta) || 0;
    if (key === "bad") return (b.bad && b.bad.delta) || 0;
    return 0;
  }
  function getPerf(dateStr) {
    dateStr = dateStr || todayStr();
    return state.perfByDate[dateStr] || {};
  }
  function perfTotal(dateStr) {
    const sel = getPerf(dateStr);
    const bs = (window.Data && window.Data.BEHAVIORS) || [];
    let sum = 0;
    bs.forEach((b) => { if (sel[b.id]) sum += optionDelta(b, sel[b.id]); });
    return sum;
  }
  function setPerf(dateStr, id, optionKey) {
    dateStr = dateStr || todayStr();
    if (!state.perfByDate[dateStr]) state.perfByDate[dateStr] = {};
    const prev = state.perfByDate[dateStr][id];
    state.perfByDate[dateStr][id] = optionKey;
    const b = (window.Data && window.Data.BEHAVIORS && window.Data.BEHAVIORS.find((x) => x.id === id));
    if (!b) return;
    const delta = optionDelta(b, optionKey) - (prev ? optionDelta(b, prev) : 0);
    adjustFlowers(delta, "每日表现");
    save(); emit();
  }

  /* ---------- 每日英语（5 新 + 2 复习） ---------- */
  function getDailyEN() {
    const d = todayStr();
    if (state.dailyEN[d]) return state.dailyEN[d];
    const words = (window.Data && window.Data.EN_WORDS) || [];
    const len = words.length || 1;
    let cursor = state.enCursor || 0;
    const newKeys = [], revKeys = [];
    for (let i = 0; i < 5; i++) newKeys.push(words[(cursor + i) % len].en);
    for (let i = 0; i < 2; i++) revKeys.push(words[(((cursor - 5 + i) % len) + len) % len].en);
    state.enCursor = (cursor + 5) % len;
    const obj = { newKeys: newKeys, reviewKeys: revKeys };
    state.dailyEN[d] = obj;
    save();
    return obj;
  }

  /* ---------- 绘画作品 ---------- */
  function addDrawing(rec) {
    state.drawings.push(rec);
    if (state.drawings.length > 30) state.drawings = state.drawings.slice(-30);
    save(); emit();
  }
  function getDrawings() { return state.drawings.slice().reverse(); } // 最新在前
  function removeDrawing(id) {
    state.drawings = state.drawings.filter((d) => d.id !== id);
    save(); emit();
  }

  /* ---------- 发布订阅 ---------- */
  const listeners = [];
  function onChange(fn) { listeners.push(fn); }
  function emit() { listeners.forEach((f) => { try { f(state); } catch (e) {} }); }

  /* ---------- 用户信息 ---------- */
  function getUser() { return state.user; }
  function setUser(name, avatar) {
    state.user.name = validateName(name);
    state.user.avatar = avatar || "🐰";
    save(); emit();
  }
  function validateName(name) {
    // 仅允许中英文、数字、空格，长度 1-8，防注入
    let n = String(name || "").trim().slice(0, 8);
    n = n.replace(/[^\u4e00-\u9fa5A-Za-z0-9 ]/g, "");
    return n || "艾米";
  }

  /* ---------- 积分 ---------- */
  function addFlowers(n, reason) {
    n = Math.max(0, Math.floor(n || 0));
    if (n === 0) return;
    if (!isToday(state.lastFlowerDay)) {
      state.todayFlowers = 0;
      state.lastFlowerDay = todayStr();
      state.dailyLog[todayStr()] = 0;
    }
    state.totalFlowers += n;
    state.todayFlowers += n;
    state.dailyLog[todayStr()] = state.todayFlowers;
    save(); emit();
  }
  function getTotal() { return state.totalFlowers; }
  function getToday() { if (!isToday(state.lastFlowerDay)) { state.todayFlowers = 0; state.lastFlowerDay = todayStr(); save(); } return state.todayFlowers; }

  /* ---------- 打卡 ---------- */
  function checkIn(dateStr) {
    dateStr = dateStr || todayStr();
    if (state.checkins.indexOf(dateStr) >= 0) return { already: true, streak: getStreak() };
    state.checkins.push(dateStr);
    state.checkins.sort();
    const streak = getStreak();
    let reward = 0;
    const prevMult = Math.floor(state.lastRewardStreak / 7);
    const newMult = Math.floor(streak / 7);
    if (newMult > prevMult) {
      reward = 5 * (newMult - prevMult);   // 每连续 7 天奖 5 朵
      state.lastRewardStreak = streak;
      state.totalFlowers += reward;
      if (!isToday(state.lastFlowerDay)) { state.todayFlowers = 0; state.lastFlowerDay = todayStr(); state.dailyLog[todayStr()] = 0; }
      state.todayFlowers += reward;
      state.dailyLog[todayStr()] = state.todayFlowers;
    }
    save(); emit();
    return { already: false, streak: streak, reward: reward };
  }
  function getCheckins() { return state.checkins.slice(); }
  function getStreak() {
    if (!state.checkins.length) return 0;
    const set = new Set(state.checkins);
    const today = new Date();
    // 若今天没打卡，从昨天倒推；否则从今天倒推
    let cursor = new Date(today);
    if (!set.has(todayStr(cursor))) cursor.setDate(cursor.getDate() - 1);
    let n = 0;
    while (set.has(todayStr(cursor))) {
      n++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return n;
  }
  function isChecked(dateStr) { return state.checkins.indexOf(dateStr) >= 0; }
  function getDailyLog() { return Object.assign({}, state.dailyLog); }

  /* ---------- 词库 ---------- */
  function addCN(char, py, mean) {
    if (!char) return false;
    if (state.learnedCN.some((x) => x.char === char)) return false;
    state.learnedCN.push({ char: char, py: py || "", mean: mean || "" });
    save(); emit(); return true;
  }
  function removeCN(char) {
    state.learnedCN = state.learnedCN.filter((x) => x.char !== char);
    save(); emit();
  }
  function addEN(en, cn, emoji) {
    if (!en) return false;
    if (state.learnedEN.some((x) => x.en === en)) return false;
    state.learnedEN.push({ en: en, cn: cn || "", emoji: emoji || "🔤" });
    save(); emit(); return true;
  }
  function removeEN(en) {
    state.learnedEN = state.learnedEN.filter((x) => x.en !== en);
    save(); emit();
  }
  function getCN() { return state.learnedCN.slice(); }
  function getEN() { return state.learnedEN.slice(); }

  /* ---------- 诗词状态 ---------- */
  function markLearned(title, author) {
    if (!state.poemLearned.some((p) => p.title === title && p.author === author))
      state.poemLearned.push({ title: title, author: author });
    save(); emit();
  }
  function isLearned(title, author) {
    return state.poemLearned.some((p) => p.title === title && p.author === author);
  }
  function recite(title, author) {
    const already = isRecited(title, author);
    if (!already) {
      state.poemRecited.push({ title: title, author: author });
      addFlowers(5, "背诵诗词");
    }
    markLearned(title, author);
    save(); emit();
    return !already;
  }
  function isRecited(title, author) {
    return state.poemRecited.some((p) => p.title === title && p.author === author);
  }
  function getLearnedPoems() { return state.poemLearned.slice(); }
  function getRecitedPoems() { return state.poemRecited.slice(); }

  /* ---------- 绘本已读状态 ---------- */
  // 每条记录存 {title, ts}，ts 用于按阅读时间倒序展示（兼容旧版纯字符串记录）
  function _bookTitle(x) { return (x && typeof x === "object") ? x.title : x; }
  function _bookTs(x) { return (x && typeof x === "object") ? (x.ts || 0) : 0; }
  function markBookRead(title) {
    if (!title) return;
    const exists = state.readBooks.some((x) => _bookTitle(x) === title);
    if (!exists) { state.readBooks.push({ title: title, ts: Date.now() }); save(); emit(); }
  }
  function isBookRead(title) { return state.readBooks.some((x) => _bookTitle(x) === title); }
  function getReadBooks() {
    // 按阅读时间倒序返回（最近读的排最前）
    return state.readBooks.slice().sort((a, b) => _bookTs(b) - _bookTs(a));
  }

  /* ---------- 奖励兑换 ---------- */
  function getRewards() { return Object.assign({}, state.rewards); }
  function getFlower() { return state.totalFlowers; }
  // 兑换：from 来源计数键，to 目标键（体验奖励用特殊键），cost 数量
  function exchange(from, to, cost) {
    if (from === "flower") {
      if (state.totalFlowers < cost) return { ok: false, msg: "小红花不够哦～" };
      state.totalFlowers -= cost;
    } else {
      if ((state.rewards[from] || 0) < cost) return { ok: false, msg: "数量不够，再努力攒一攒！" };
      state.rewards[from] -= cost;
    }
    if (to === "tv" || to === "money" || to === "park") {
      // 体验奖励仅记录弹窗提示，不计入常驻物品
    } else {
      state.rewards[to] = (state.rewards[to] || 0) + 1;
    }
    save(); emit();
    return { ok: true };
  }

  /* ---------- AI 设置 ---------- */
  function getAI() { return Object.assign({}, state.ai); }
  function setAI(obj) {
    state.ai = {
      base: String(obj.base || "").slice(0, 200),
      key: String(obj.key || "").slice(0, 200),
      model: String(obj.model || "").slice(0, 80)
    };
    save(); emit();
  }
  function clearAI() { state.ai = { base: "", key: "", model: "" }; save(); emit(); }

  /* ---------- 豆包TTS 后端地址 ---------- */
  function getTTS() { return Object.assign({}, state.tts); }
  function setTTS(url) { state.tts = { url: String(url || "").trim().slice(0, 300) }; save(); emit(); }

  /* ---------- 每日轮换索引 ---------- */
  function dailyIndex(len, offset) {
    const n = dayNumber(new Date()) + (offset || 0);
    return ((n % len) + len) % len;
  }

  return {
    esc: esc,
    onChange: onChange,
    getUser: getUser, setUser: setUser,
    addFlowers: addFlowers, getTotal: getTotal, getToday: getToday,
    checkIn: checkIn, getCheckins: getCheckins, getStreak: getStreak, isChecked: isChecked,
    getDailyLog: getDailyLog,
    addCN: addCN, removeCN: removeCN, addEN: addEN, removeEN: removeEN,
    getCN: getCN, getEN: getEN,
    markLearned: markLearned, isLearned: isLearned, recite: recite, isRecited: isRecited,
    getLearnedPoems: getLearnedPoems, getRecitedPoems: getRecitedPoems,
    markBookRead: markBookRead, isBookRead: isBookRead, getReadBooks: getReadBooks,
    getRewards: getRewards, getFlower: getFlower, exchange: exchange,
    getAI: getAI, setAI: setAI, clearAI: clearAI,
    getTTS: getTTS, setTTS: setTTS,
    dailyIndex: dailyIndex, todayStr: todayStr,
    todaySeed: todaySeed, dailyPick: dailyPick, dailyPickN: dailyPickN, seededRand: seededRand,
    getPerf: getPerf, setPerf: setPerf, perfTotal: perfTotal,
    getDailyEN: getDailyEN, addDrawing: addDrawing, getDrawings: getDrawings, removeDrawing: removeDrawing,
    getDailyLogic: getDailyLogic, getDailyBook: getDailyBook, getDailyBooks: getDailyBooks
  };
})();
