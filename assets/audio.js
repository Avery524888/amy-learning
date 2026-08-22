/* =========================================================
   艾米的学习乐园 — 语音引擎 (Audio)
   能力：
     - speak(text, lang)        朗读（中/英）
     - recognitionSupported     浏览器是否支持语音识别
     - recognize(lang, ms, expected, threshold)
            录音识别并评分，返回 Promise<{ok,score,transcript,unsupported}>
   说明：语音识别依赖浏览器（Chrome/Edge 最佳）。不支持时
         recognize 返回 {unsupported:true}，由调用方降级为手动确认，
         保证功能始终可用。
   ========================================================= */
window.Audio2 = (function () {
  "use strict";

  const synth = window.speechSynthesis || null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const recognitionSupported = !!SR;

  let zhVoice = null, enVoice = null;

  // 按「自然度 + 音色」给语音打分，选最适合孩子的声音
  function voiceScore(v, lang) {
    if (!v || !v.lang) return -1;
    const vl = v.lang.toLowerCase();
    if (lang === "zh-CN") { if (!/^zh/i.test(vl)) return -1; }
    else if (lang === "en-US") { if (!/^en/i.test(vl)) return -1; }
    else return -1;

    let score = 0;
    const name = String(v.name || "").toLowerCase();
    // 在线自然语音优先（杂音更少）
    if (!v.localService || /online|natural|neural|premium/i.test(name)) score += 30;

    if (lang === "zh-CN") {
      // 中文优先 Xiaoxiao/Yaoyao/Xiaoyi 等清甜女声
      if (/xiaoxiao/.test(name)) score += 120;
      else if (/yaoyao/.test(name)) score += 110;
      else if (/xiaoyi/.test(name)) score += 100;
      else if (/yunxi(?!-)/.test(name)) score += 90;   // 女声
      else if (/yunxia/.test(name)) score += 85;
      else if (/huihui/.test(name)) score += 70;
      else if (/tingting/.test(name)) score += 60;
      else if (/female|girl|女/.test(name)) score += 25;
    } else if (lang === "en-US") {
      // 英文优先小女孩 / 自然女声：Ana 是儿童音，Aria/Jenny/Sonia 是高品质自然音
      if (/\bana\b/.test(name)) score += 150;            // 小女孩
      else if (/aria/.test(name)) score += 120;
      else if (/jenny/.test(name)) score += 115;
      else if (/sonia/.test(name)) score += 110;
      else if (/samantha/.test(name)) score += 90;
      else if (/victoria/.test(name)) score += 85;
      else if (/zira/.test(name)) score += 60;
      else if (/google us english/.test(name)) score += 70;
      else if (/female|girl/.test(name)) score += 25;
    }
    return score;
  }

  function pickVoice(vs, lang) {
    let best = null, bestScore = -1;
    (vs || []).forEach((v) => {
      const s = voiceScore(v, lang);
      if (s > bestScore) { bestScore = s; best = v; }
    });
    return best;
  }

  function loadVoices() {
    if (!synth) return;
    const vs = synth.getVoices() || [];
    zhVoice = pickVoice(vs, "zh-CN");
    enVoice = pickVoice(vs, "en-US");
  }
  if (synth) {
    loadVoices();
    if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadVoices;
  }

  // ---- 朗读锁：杜绝多层混音 + 冷却点击 ----
  // 同一时刻只允许一个声音在播；新请求若在播放中到达，仅保留「最后一次」（覆盖式排队），
  // 当前播完后自动接力，避免叠加噪音。看门狗防止 onend 未触发导致永久卡死。
  let _speaking = false;
  let _next = null;
  let _watch = null;

  function _emit(text, lang, opts) {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang || "zh-CN";
      // 锁定最高音量，保护儿童听力（不超过 0.9）
      let volume = (opts.volume != null) ? opts.volume : 0.9;
      u.volume = Math.max(0, Math.min(volume, 0.9));
      // 默认参数：中文清晰自然、音调中性；英文地道女声
      let rate = 0.9, pitch = 1.0;
      if (lang === "en-US") { rate = 0.9; pitch = 1.1; }
      if (opts.rate != null) rate = opts.rate;
      if (opts.pitch != null) pitch = opts.pitch;
      u.rate = rate;
      u.pitch = pitch;
      if (lang === "en-US" && enVoice) u.voice = enVoice;
      else if (zhVoice) u.voice = zhVoice;
      if (opts.voice) u.voice = opts.voice;
      const finish = () => {
        _speaking = false;
        if (_watch) { clearTimeout(_watch); _watch = null; }
        const n = _next; _next = null;
        if (n) _emit(n.text, n.lang, n.opts);
      };
      u.onend = finish;
      u.onerror = finish;
      _speaking = true;
      // 空闲时清掉任何残留语音再播放，确保无叠加（已在播放中会走 _next 排队，不会到这里）
      if (synth.cancel) { try { synth.cancel(); } catch (e) {} }
      synth.speak(u);
      // 看门狗：长文本或异常未触发 onend 时，强制解锁并接力
      if (_watch) clearTimeout(_watch);
      _watch = setTimeout(finish, 30000);
    } catch (e) { console.warn("朗读失败", e); _speaking = false; }
  }

  // ---- 豆包云端 TTS（可选）：配置了后端地址时，中文/英文走云端音色（奶芙波波/Olivia），
  //      失败或不可用自动回退到本机 Web Speech。后端仅持有密钥，前端只存地址，安全。 ----
  let _ttsBusy = false, _ttsNext = null;
  let _ttsAudio = null, _ttsSpeaking = false;

  function ttsFallback(text, lang, opts) {
    // TTS 不可用 → 用本机朗读兜底（不进 TTS 队列，避免循环）
    _ttsBusy = false; _ttsNext = null;
    if (synth) _emit(text, lang, opts || {});
  }

  function playTTS(text, lang, opts) {
    const url = (window.Store && window.Store.getTTS && window.Store.getTTS().url) || "";
    if (!url) { ttsFallback(text, lang, opts); return; }
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: String(text), lang: lang })
    })
      .then((r) => { if (!r.ok) throw new Error("tts http " + r.status); return r.blob(); })
      .then((blob) => {
        const audio = new Audio(URL.createObjectURL(blob));
        _ttsAudio = audio;
        _ttsSpeaking = true;
        let vol = (opts && opts.volume != null) ? opts.volume : 0.9;
        audio.volume = Math.max(0, Math.min(vol, 0.9));   // 锁定≤0.9，护耳
        const finish = () => {
          _ttsBusy = false; _ttsSpeaking = false; _ttsAudio = null;
          try { URL.revokeObjectURL(audio.src); } catch (e) {}
          const n = _ttsNext; _ttsNext = null;
          if (n) playTTS(n.text, n.lang, n.opts);
        };
        audio.onended = finish;
        audio.onerror = () => { _ttsSpeaking = false; _ttsAudio = null; console.warn("TTS 播放失败，回退本机朗读"); ttsFallback(text, lang, opts); };
        _ttsBusy = true;
        audio.play().catch((e) => { _ttsSpeaking = false; _ttsAudio = null; console.warn("TTS 播放被拒，回退本机朗读", e); ttsFallback(text, lang, opts); });
      })
      .catch((e) => { console.warn("TTS 请求失败，回退本机朗读", e); ttsFallback(text, lang, opts); });
  }

  function speakTTS(text, lang, opts) {
    if (_ttsBusy) { _ttsNext = { text: text, lang: lang, opts: opts || {} }; return; }
    playTTS(text, lang, opts || {});
  }

  // 立即停止一切正在播放的声音（Web Speech 朗读 + 云端 TTS 音频），用于「点击文字 / 切换模块时停止声音」
  function stop() {
    if (synth) { try { synth.cancel(); } catch (e) {} }
    _speaking = false; _next = null;
    if (_watch) { clearTimeout(_watch); _watch = null; }
    _ttsBusy = false; _ttsNext = null; _ttsSpeaking = false;
    if (_ttsAudio) {
      try { _ttsAudio.pause(); _ttsAudio.onended = null; _ttsAudio.onerror = null; if (_ttsAudio.src) URL.revokeObjectURL(_ttsAudio.src); } catch (e) {}
      _ttsAudio = null;
    }
  }
  function isSpeaking() { return !!(_speaking || _ttsSpeaking); }

  function speak(text, lang, opts) {
    // 配置了豆包TTS后端，且是中文/英文时，优先走云端音色
    const ttsUrl = (window.Store && window.Store.getTTS && window.Store.getTTS().url) || "";
    if (ttsUrl && (lang === "zh-CN" || lang === "en-US")) {
      speakTTS(text, lang, opts);
      return;
    }
    if (!synth) { console.warn("当前环境不支持语音朗读"); return; }
    if (_speaking) { _next = { text: text, lang: lang, opts: opts || {} }; return; }
    _emit(text, lang, opts || {});
  }

  // 拼音/汉字：标准中文女声，语速放缓、音调中性、音量 0.9，清晰柔和
  function speakPinyin(text) {
    // 后鼻音等易错韵母用带一声声调的清晰形式，避免 Web Speech 把裸韵母读成英文或鼻音不到位
    const map = { "ang":"āng","eng":"ēng","ing":"yīng","ong":"ōng","an":"ān","en":"ēn","in":"yīn","un":"ūn","ün":"ǖn","iang":"iāng","uang":"uāng","ueng":"uēng","iong":"iōng" };
    const t = map[text] || text;
    speak(t, "zh-CN", { rate: 0.82, pitch: 1.0 });
  }
  // 韵母点击：纠正 ang/eng/ing(ying)/ong 等后鼻音发音
  //  - 云端TTS(豆包)：读例字（如「昂/灯/鹰/钟」），音色自然、准确
  //  - 本机Web Speech：用带一声声调的干净韵母音「āng/ēng/yīng/ōng」，鼻音更到位
  function speakFinal(it) {
    const ttsUrl = (window.Store && window.Store.getTTS && window.Store.getTTS().url) || "";
    if (ttsUrl) { speak(it.ex, "zh-CN", { rate: 0.9, pitch: 1.0 }); return; }
    const map = { "ang":"āng","eng":"ēng","ing":"yīng","ong":"ōng","an":"ān","en":"ēn","in":"yīn","un":"ūn","ün":"ǖn","iang":"iāng","uang":"uāng","ueng":"uēng","iong":"iōng" };
    const clean = map[it.sound] || it.sound;
    speak(clean, "zh-CN", { rate: 0.8, pitch: 1.0 });
  }
  // 诗词朗读：Web Speech + zh-CN 标准女声，rate 0.9、音调中性、音量 0.9，适合小朋友听
  function speakPoem(text) { speak(text, "zh-CN", { rate: 0.9, pitch: 1.0 }); }
  // 英文单词/对话：本机时慢速+正常双读；配置了豆包TTS(Olivia)时单遍即可（云端音质已足够自然）
  function speakEn(text) {
    const ttsUrl = (window.Store && window.Store.getTTS && window.Store.getTTS().url) || "";
    if (ttsUrl) { speak(text, "en-US", { pitch: 1.1 }); return; }
    speak(text, "en-US", { rate: 0.72, pitch: 1.1 });   // 慢速一遍
    speak(text, "en-US", { rate: 0.9, pitch: 1.1 });    // 正常一遍（自动接力）
  }

  // 归一化：去标点、空格，英文转小写
  function norm(s) {
    return String(s || "").replace(/[\s\p{P}]/gu, "").toLowerCase();
  }
  // 相似度：期望串中字符/词被命中比例
  function similarity(transcript, expected) {
    const t = norm(transcript), e = norm(expected);
    if (!e) return 0;
    // 英文按单词，中文按字
    const isEn = /^[a-z0-9 ]+$/.test(e);
    if (isEn) {
      const tw = t.split(/[^a-z0-9]+/).filter(Boolean);
      const ew = e.split(/[^a-z0-9]+/).filter(Boolean);
      if (!ew.length) return 0;
      let hit = 0;
      ew.forEach((w) => { if (tw.indexOf(w) >= 0) hit++; });
      return hit / ew.length;
    }
    let hit = 0;
    for (const ch of e) if (t.indexOf(ch) >= 0) hit++;
    return hit / e.length;
  }

  // 识别并评分
  function recognize(lang, durationMs, expected, threshold) {
    return new Promise((resolve) => {
      if (!recognitionSupported) {
        resolve({ ok: false, unsupported: true, score: 0, transcript: "" });
        return;
      }
      try {
        const rec = new SR();
        rec.lang = lang || "zh-CN";
        rec.interimResults = false;
        rec.maxAlternatives = 3;
        rec.continuous = false;
        let finalTrans = "";
        rec.onresult = (ev) => {
          for (let i = 0; i < ev.results.length; i++) {
            finalTrans += ev.results[i][0].transcript;
          }
        };
        rec.onerror = () => { resolve({ ok: false, score: 0, transcript: finalTrans, error: true }); };
        rec.onend = () => {
          const score = expected ? similarity(finalTrans, expected) : 1;
          resolve({ ok: score >= (threshold || 0.6), score: score, transcript: finalTrans });
        };
        rec.start();
        setTimeout(() => { try { rec.stop(); } catch (e) {} }, durationMs || 6000);
      } catch (e) {
        resolve({ ok: false, unsupported: true, score: 0, transcript: "" });
      }
    });
  }

  // 语音识别：开/关切换（点击开始、再次点击结束），支持实时中间结果
  // handlers: { onStart, onPartial(txt, finalTxt), onFinal(res) }  res={unsupported, transcript}
  let _recInst = null, _recFinal = "", _recOnStart = null, _recOnPartial = null, _recOnFinal = null;
  function recognitionStart(lang, handlers) {
    handlers = handlers || {};
    _recOnStart = handlers.onStart || null;
    _recOnPartial = handlers.onPartial || null;
    _recOnFinal = handlers.onFinal || null;
    return new Promise((resolve) => {
      if (!SR) { resolve({ unsupported: true, transcript: "" }); return; }
      try {
        const r = new SR();
        r.lang = lang || "zh-CN";
        r.interimResults = true;
        r.continuous = true;
        r.maxAlternatives = 1;
        _recFinal = "";
        r.onresult = (ev) => {
          let interim = "", finalNow = "";
          for (let i = ev.resultIndex; i < ev.results.length; i++) {
            const res = ev.results[i];
            if (res.isFinal) finalNow += res[0].transcript;
            else interim += res[0].transcript;
          }
          _recFinal += finalNow;
          if (_recOnPartial) _recOnPartial((_recFinal + interim).trim(), _recFinal.trim());
        };
        r.onerror = () => { /* 不在此 reject，交给 onend 收尾 */ };
        r.onend = () => {
          _recInst = null;
          const finalText = _recFinal.trim();
          if (_recOnFinal) _recOnFinal({ unsupported: false, transcript: finalText });
          resolve({ unsupported: false, transcript: finalText });
        };
        r.start();
        _recInst = r;
        if (_recOnStart) _recOnStart();
      } catch (e) {
        _recInst = null;
        resolve({ unsupported: true, transcript: "" });
      }
    });
  }
  function recognitionStop() { if (_recInst) { try { _recInst.stop(); } catch (e) {} } }
  function recognitionActive() { return !!_recInst; }

  function recordSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && (window.MediaRecorder));
  }

  // 真实录音：返回 { stop() -> Promise<{url,blob}> }
  // 用法：makeRecorder().then(rec => { ... rec.stop().then(({url})=>{...}) })
  function makeRecorder() {
    return new Promise((resolve, reject) => {
      if (!recordSupported()) { reject(new Error("unsupported")); return; }
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        let mr;
        try { mr = new MediaRecorder(stream); } catch (e) { stream.getTracks().forEach((t) => t.stop()); reject(e); return; }
        const chunks = [];
        mr.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
        const api = {
          stop() {
            return new Promise((res) => {
              mr.onstop = () => {
                stream.getTracks().forEach((t) => t.stop());
                const blob = new Blob(chunks, { type: mr.mimeType || "audio/webm" });
                res({ url: URL.createObjectURL(blob), blob: blob });
              };
              try { mr.stop(); } catch (e) { /* 已停止 */ }
            });
          }
        };
        mr.start();
        resolve(api);
      }).catch(() => reject(new Error("unsupported")));
    });
  }

  return {
    speak: speak,
    speakTTS: speakTTS,
    speakPinyin: speakPinyin,
    speakFinal: speakFinal,
    speakPoem: speakPoem,
    speakEn: speakEn,
    stop: stop,
    isSpeaking: isSpeaking,
    recognitionSupported: recognitionSupported,
    recognitionStart: recognitionStart,
    recognitionStop: recognitionStop,
    recognitionActive: recognitionActive,
    recognize: recognize,
    similarity: similarity,
    recordSupported: recordSupported,
    makeRecorder: makeRecorder
  };
})();
// 兼容别名
window.A = window.Audio2;
