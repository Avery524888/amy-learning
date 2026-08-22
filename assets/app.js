/* =========================================================
   艾米的学习乐园 — 应用控制器 (App)
   职责：左侧导航、内容路由、顶部栏刷新、响应式抽屉、
         用户编辑 / AI 设置弹窗、轻提示 toast。
   ========================================================= */
(function () {
  "use strict";
  const S = window.Store, D = window.Data, M = window.Modules;

  // 后台懒加载拼音引擎：单文件离线版已在构建时内联（window.__pinyinInlined=true），
  // 多文件版则注入一个外部 type="module" 脚本（assets/load_pinyin.js）动态导入
  // pinyin-pro.mjs（564KB）。该脚本异步加载、不阻塞首屏渲染；拼音/识字/诗词等用到它的
  // 地方都已对 window.pinyinPro 做空值保护，加载完成后自动生效。
  // （用外部 module 脚本而非内联，是为了满足 GitHub Pages 的 CSP script-src 'self'。）
  if (!window.pinyinPro && !window.__pinyinInlined && typeof document !== "undefined") {
    try {
      const ps = document.createElement("script");
      ps.type = "module";
      ps.src = "assets/load_pinyin.js";
      document.head.appendChild(ps);
    } catch (e) { /* 忽略：不影响其他功能 */ }
  }

  const CATS = [
    { key: "pinyin",   name: "拼音",     emoji: "🅿️" },
    { key: "shizi",    name: "识字",     emoji: "📖" },
    { key: "math",     name: "计算",     emoji: "🔢" },
    { key: "english",  name: "英语",     emoji: "🔤" },
    { key: "logic",    name: "逻辑",     emoji: "🧩" },
    { key: "book",     name: "绘本",     emoji: "📚" },
    { key: "game",     name: "游戏",     emoji: "🎮" },
    { key: "poetry",   name: "诗词",     emoji: "📜" },
    { key: "performance", name: "每日表现", emoji: "🌟" },
    { key: "wordbank", name: "词库",     emoji: "🗂️" },
    { key: "draw",     name: "绘画",     emoji: "🎨" },
    { key: "timeclock",name: "认识时间", emoji: "⏰" },
    { key: "whys",     name: "十万个为什么", emoji: "💡" },
    { key: "reward",   name: "奖励",     emoji: "🎁" },
    { key: "calendar", name: "日历打卡", emoji: "📅" },
    { key: "parent",   name: "家长端",   emoji: "👨‍👩‍👧" }
  ];

  const navList = document.getElementById("navList");
  const content = document.getElementById("content");
  const sidebar = document.getElementById("sidebar");
  const scrim = document.getElementById("scrim");

  // 渲染导航
  CATS.forEach((c, i) => {
    const li = document.createElement("li");
    li.dataset.key = c.key;
    li.innerHTML = `<span class="nav-ico">${c.emoji}</span><span>${c.name}</span>`;
    li.addEventListener("click", () => navigate(c.key));
    navList.appendChild(li);
  });

  let current = null;
  const moduleCache = {};   // key -> 渲染后的 div（保留历史痕迹：筛选/滚动/输入等）
  const moduleScroll = {};   // key -> 离开时的滚动位置
  // 暴露给模块，便于词库删除后主动失效相关模块的缓存
  window.__moduleCache = moduleCache;
  window.__moduleScroll = moduleScroll;
  function navigate(key) {
    const cat = CATS.find((c) => c.key === key);
    if (!cat) return;
    // 切换模块时，停止一切正在播放的声音
    if (window.A && window.A.stop) window.A.stop();
    // 保存当前模块的滚动位置，并把它从内容区摘下（不销毁，保留历史）
    if (current && moduleCache[current] && moduleCache[current].parentNode === content) {
      moduleScroll[current] = content.scrollTop;
      content.removeChild(moduleCache[current]);
    }
    current = key;
    window.__currentModule = key;
    navList.querySelectorAll("li").forEach((li) => li.classList.toggle("active", li.dataset.key === key));
    if (!moduleCache[key]) {
      // 首次访问：渲染并缓存
      const div = document.createElement("div");
      moduleCache[key] = div;
      content.appendChild(div);
      if (M[key]) M[key](div);
    } else {
      // 再次访问：直接挂回缓存的 DOM（保留筛选状态与诗词位置，无需重渲染）
      content.appendChild(moduleCache[key]);
    }
    content.scrollTop = moduleScroll[key] || 0;
    content.focus();
    // 移动端选择后收起抽屉
    if (window.innerWidth <= 860) closeDrawer();
  }

  // 顶部栏刷新
  function refreshTop() {
    const u = S.getUser();
    document.getElementById("topTotal").textContent = S.getTotal();
    document.getElementById("topToday").textContent = S.getToday();
    document.getElementById("topDays").textContent = "第" + S.getCheckins().length + "天";
    document.getElementById("topName").textContent = u.name;
    document.getElementById("topAvatar").textContent = u.avatar;
    document.getElementById("brandName").textContent = D.APP_NAME;
    document.getElementById("encourage").textContent = D.ENCOURAGE[S.dailyIndex(D.ENCOURAGE.length)];
    // 当前日期 + 节日提醒与说明
    const now = new Date();
    const wd = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][now.getDay()];
    const dateEl = document.getElementById("topDate");
    if (dateEl) dateEl.textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${wd}`;
    const fb = document.getElementById("festivalBanner");
    if (fb) {
      const f = D.festivalOf(S.todayStr());
      if (f) {
        fb.hidden = false;
        fb.innerHTML = `<span class="fb-emoji">${f.emoji}</span><span class="fb-text"><b>今天是${f.name}！</b> ${f.desc}</span>`;
      } else {
        fb.hidden = true;
      }
    }
  }

  S.onChange(refreshTop);

  /* 任意数据变化后：除“当前正在查看”的模块外，其余模块的渲染缓存全部失效，
     下次进入该模块时即重新渲染，从而实时同步词库 / 绘本 / 诗词 / 表现 / 打卡等所有数据。
     当前模块保留缓存，由它自己的 onAdded/render 回调原地刷新，避免打断阅读器、拼图等交互。 */
  function invalidateStaleModules() {
    Object.keys(moduleCache).forEach((k) => {
      if (k === current) return;            // 当前模块不在此处失效，由自身逻辑刷新
      delete moduleCache[k];
      if (moduleScroll[k] != null) delete moduleScroll[k];
    });
  }
  S.onChange(invalidateStaleModules);

  // 抽屉（移动端）
  function openDrawer() { sidebar.classList.add("open"); scrim.hidden = false; }
  function closeDrawer() { sidebar.classList.remove("open"); scrim.hidden = true; }
  document.getElementById("hamburger").addEventListener("click", openDrawer);
  scrim.addEventListener("click", closeDrawer);

  // 用户编辑弹窗
  const userModal = document.getElementById("userModal");
  const nameInput = document.getElementById("nameInput");
  const avatarGrid = document.getElementById("avatarGrid");
  document.getElementById("userChip").addEventListener("click", openUser);
  function openUser() {
    const u = S.getUser();
    nameInput.value = u.name;
    avatarGrid.innerHTML = "";
    D.AVATARS.forEach((a) => {
      const s = document.createElement("span");
      s.textContent = a;
      if (a === u.avatar) s.classList.add("sel");
      s.addEventListener("click", () => { avatarGrid.querySelectorAll("span").forEach((n) => n.classList.remove("sel")); s.classList.add("sel"); });
      avatarGrid.appendChild(s);
    });
    userModal.hidden = false;
  }
  document.getElementById("userCancel").addEventListener("click", () => { userModal.hidden = true; });
  document.getElementById("userSave").addEventListener("click", () => {
    const sel = avatarGrid.querySelector("span.sel");
    S.setUser(nameInput.value, sel ? sel.textContent : "🐰");
    userModal.hidden = true;
  });

  // AI 设置弹窗
  const settingsModal = document.getElementById("settingsModal");
  document.getElementById("settingsBtn").addEventListener("click", () => {
    const ai = S.getAI();
    document.getElementById("aiBase").value = ai.base || "";
    document.getElementById("aiKey").value = ai.key || "";
    document.getElementById("aiModel").value = ai.model || "";
    document.getElementById("ttsUrl").value = (S.getTTS() && S.getTTS().url) || "";
    settingsModal.hidden = false;
  });
  document.getElementById("aiSave").addEventListener("click", () => {
    S.setAI({
      base: document.getElementById("aiBase").value,
      key: document.getElementById("aiKey").value,
      model: document.getElementById("aiModel").value
    });
    S.setTTS(document.getElementById("ttsUrl").value);
    settingsModal.hidden = true;
    toast("设置已保存 💾");
  });
  document.getElementById("aiCancel").addEventListener("click", () => { settingsModal.hidden = true; });
  document.getElementById("aiClear").addEventListener("click", () => {
    S.clearAI();
    S.setTTS("");
    document.getElementById("aiBase").value = "";
    document.getElementById("aiKey").value = "";
    document.getElementById("aiModel").value = "";
    document.getElementById("ttsUrl").value = "";
    toast("已清除设置");
  });

  // 点击弹窗外部灰色背景关闭弹窗
  function closeModalOnMask(e) {
    if (e.target === userModal) userModal.hidden = true;
    if (e.target === settingsModal) settingsModal.hidden = true;
  }
  userModal.addEventListener("click", closeModalOnMask);
  settingsModal.addEventListener("click", closeModalOnMask);

  // 语音播放时，点击任意处（文字 / 按钮等）即停止当前声音，避免“关不掉”
  document.addEventListener("click", function () {
    if (window.A && window.A.isSpeaking && window.A.isSpeaking()) window.A.stop();
  }, true);

  // 轻提示
  let snackTimer = null;
  function toast(msg) {
    const sb = document.getElementById("snackbar");
    sb.textContent = msg;
    sb.hidden = false;
    clearTimeout(snackTimer);
    snackTimer = setTimeout(() => { sb.hidden = true; }, 2200);
  }

  // 暴露给模块使用
  window.App = { toast: toast, refreshTop: refreshTop };

  // 启动
  refreshTop();
  navigate("pinyin");
})();
