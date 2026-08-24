// 后台懒加载拼音引擎（仅多文件部署版使用）。
// 由 app.js 在首屏渲染后注入此 type="module" 外部脚本触发；
// 使用「动态 import」而非静态 import，确保 564KB 的 pinyin-pro.mjs 在后台下载，
// 绝不阻塞首屏渲染。加载完成后挂到 window.pinyinPro，各模块自动生效。
import("./pinyin-pro.mjs")
  .then(function (m) { window.pinyinPro = m.pinyin || (m.default && m.default.pinyin); })
  .catch(function (e) { console.warn("拼音引擎加载失败（不影响其他功能）:", e); });
