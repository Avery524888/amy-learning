#!/usr/bin/env node
/*
 * 艾米的学习乐园 —— 豆包(火山引擎)云端 TTS 后端代理
 * ---------------------------------------------------------------
 * 作用：浏览器自带的 Web Speech 用不了豆包的「奶芙波波 / Olivia」等云端音色，
 *      这个小程序把前端的文字请求转发到字节火山引擎「豆包语音」TTS 接口，
 *      把返回的音频（mp3）直接丢回浏览器播放。
 *
 * 为什么需要它：纯静态网页不能安全保存 API 密钥，也不能直接跨域调豆包。
 *      密钥只放在这个后端（环境变量），前端只存「后端地址」。
 *
 * 如何运行（需要 Node 18+，建议 22）：
 *   1) 去火山引擎控制台开通「豆包语音」并创建应用，拿到 appid 与 access token；
 *      在「音色列表」里找到「奶芙波波」和「Olivia」对应的 voice_type 代码（形如 BVxxx_streaming）。
 *   2) 配置环境变量后启动：
 *        TTS_APPID=你的appid \
 *        TTS_TOKEN=你的token \
 *        TTS_VOICE_ZH=奶芙波波对应的voice_type \
 *        TTS_VOICE_EN=Olivia对应的voice_type \
 *        node tts_server.js
 *   3) 在「艾米的学习乐园」⚙️ 设置里，把“TTS 后端地址”填成 http://localhost:3001/tts
 *      （若部署到公网，请改成你的 https 后端地址，否则 https 页面调 http 会被浏览器拦截）。
 *
 * 环境变量（都可省略，省略则用下方默认值/占位）：
 *   TTS_APPID       应用 appid（必填，否则无法合成）
 *   TTS_TOKEN       应用 access token（必填）
 *   TTS_CLUSTER     业务集群，默认 volcano_tts
 *   TTS_VOICE_ZH    中文音色 voice_type，默认 BV700_streaming（请改成奶芙波波的真实代码）
 *   TTS_VOICE_EN    英文音色 voice_type，默认 BV001_streaming（请改成 Olivia 的真实代码）
 *   TTS_ENDPOINT    豆包 TTS HTTP 地址，默认 https://openspeech.bytedance.com/api/v1/tts
 *   TTS_PORT        本服务端口，默认 3001
 */
"use strict";

const http = require("http");
const crypto = require("crypto");

const PORT = parseInt(process.env.TTS_PORT || "3001", 10);
const APPID = process.env.TTS_APPID || "";
const TOKEN = process.env.TTS_TOKEN || "";
const CLUSTER = process.env.TTS_CLUSTER || "volcano_tts";
const VOICE_ZH = process.env.TTS_VOICE_ZH || "BV700_streaming"; // ← 改成奶芙波波的真实 voice_type
const VOICE_EN = process.env.TTS_VOICE_EN || "BV001_streaming"; // ← 改成 Olivia 的真实 voice_type
const ENDPOINT = process.env.TTS_ENDPOINT || "https://openspeech.bytedance.com/api/v1/tts";

// 简单的内存/json 体读取
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => {
      data += c;
      if (data.length > 1e6) { reject(new Error("body too large")); req.destroy(); }
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function sendJSON(res, code, obj, extraHeaders) {
  const body = JSON.stringify(obj);
  res.writeHead(code, Object.assign({
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
  }, extraHeaders || {}));
  res.end(body);
}

// 构造发给豆包TTS的请求体（voice_type 按语种切换）
function buildReqBody(text, lang) {
  const voiceType = lang === "en-US" ? VOICE_EN : VOICE_ZH;
  return {
    app: { appid: APPID, token: TOKEN, cluster: CLUSTER },
    user: { uid: "ameng-kids" },
    audio: {
      voice_type: voiceType,
      encoding: "mp3",
      rate: 24000,
      speed_ratio: 1.0,
      volume_ratio: 1.0,
      pitch_ratio: 1.0
    },
    request: {
      reqid: crypto.randomUUID(),
      text: text,
      text_type: "plain",
      operation: "query",
      silence_duration: "125"
    }
  };
}

// 调用豆包TTS，返回 mp3 的 Buffer；任何失败抛错由上层处理
async function synthesize(text, lang) {
  const reqBody = buildReqBody(text, lang);
  const upstream = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer; " + TOKEN
    },
    body: JSON.stringify(reqBody)
  });
  const js = await upstream.json();
  if (!upstream.ok || !js || js.code !== 3000 || !js.data) {
    const err = new Error("豆包TTS返回错误: " + (js && (js.message || JSON.stringify(js))));
    err.status = 502;
    throw err;
  }
  return Buffer.from(js.data, "base64");
}

async function handleTTS(req, res) {
  if (!TOKEN || !APPID) {
    return sendJSON(res, 400, { error: "后端未配置 TTS_APPID / TTS_TOKEN，请先设置环境变量后重启服务。" });
  }
  let payload;
  try { payload = JSON.parse(await readBody(req)); }
  catch (e) { return sendJSON(res, 400, { error: "请求体不是合法 JSON" }); }

  const text = String(payload.text || "").trim();
  const lang = payload.lang === "en-US" ? "en-US" : "zh-CN";
  if (!text) return sendJSON(res, 400, { error: "text 为空" });
  if (text.length > 400) return sendJSON(res, 400, { error: "文本过长（建议 < 400 字）" });

  try {
    const buf = await synthesize(text, lang);
    res.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Content-Length": buf.length,
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store"
    });
    res.end(buf);
  } catch (e) {
    return sendJSON(res, (e && e.status) || 502, { error: "调用豆包TTS失败", detail: String(e && e.message || e) });
  }
}

const server = http.createServer(async (req, res) => {
  // CORS 预检
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
    });
    return res.end();
  }
  const url = (req.url || "").split("?")[0];
  if (url === "/health") {
    return sendJSON(res, 200, {
      ok: true,
      configured: !!(TOKEN && APPID),
      zh: VOICE_ZH,
      en: VOICE_EN,
      endpoint: ENDPOINT
    });
  }
  if (url === "/tts" && req.method === "POST") {
    return handleTTS(req, res);
  }
  sendJSON(res, 404, { error: "not found" });
});

// 便于单元测试：仅在直接运行时启动 HTTP 服务；被 require 时只导出函数，不占用端口
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[tts_server] 监听 http://localhost:${PORT}`);
    console.log(`[tts_server] 配置: appid=${APPID ? "已填" : "未填"} token=${TOKEN ? "已填" : "未填"} zh=${VOICE_ZH} en=${VOICE_EN}`);
    if (!APPID || !TOKEN) {
      console.warn("[tts_server] 警告：TTS_APPID / TTS_TOKEN 未设置，/tts 会返回 400。请在环境变量中填写后重启。");
    }
  });
}

module.exports = { buildReqBody, synthesize, VOICE_ZH, VOICE_EN, ENDPOINT };
