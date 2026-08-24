// 第6轮优化冒烟测试：词库点击展开详情 + 逻辑每日轮换 + 语音锁变量
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync("index.html", "utf8");
const dom = new JSDOM(html, { runScripts: "outside-only", pretendToBeVisual: true });
const { window } = dom;
global.window = window;
global.document = window.document;
global.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 33);
global.cancelAnimationFrame = (id) => clearTimeout(id);
window.requestAnimationFrame = global.requestAnimationFrame;
window.cancelAnimationFrame = global.cancelAnimationFrame;

window.SpeechSynthesisUtterance = function () {};
window.speechSynthesis = { speak() {}, getVoices() { return []; }, cancel() {} };
window.HTMLCanvasElement.prototype.getContext = () => null;
window.HTMLElement.prototype.scrollIntoView = () => {};

const base = process.cwd();
const files = ["assets/data.js", "assets/poems_data.js", "assets/poem_notes.js", "assets/store.js", "assets/audio.js", "assets/modules.js", "assets/app.js"];
for (const f of files) {
  window.eval(fs.readFileSync(path.join(base, f), "utf8"));
}

let pass = true;
function check(name, cond) { console.log((cond ? "PASS" : "FAIL") + " - " + name); if (!cond) pass = false; }

// 逻辑模块每日轮换：确认 getDailyLogic 存在且返回 5 题
const logic = window.Store.getDailyLogic();
check("getDailyLogic 返回 5 题", Array.isArray(logic) && logic.length === 5);

// 词库：先灌入数据
window.Store.addCN("猫", "māo", "一种可爱的小动物");
window.Store.addEN("cat", "猫", "🐱");
const poem = window.POEMS[0];
window.Store.markLearned(poem.title, poem.author);

const M = window.Modules;
const c = window.document.createElement("div");
window.document.body.appendChild(c);
M.wordbank(c);

// 点击汉字标签 -> 展开详情
const cnTag = c.querySelector("#cnBox .wb-tag");
cnTag.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
check("汉字点击展开：大字符", !!c.querySelector("#cnDetail .wb-bigchar"));
check("汉字详情含拼音", !!c.querySelector("#cnDetail .wb-py") && c.querySelector("#cnDetail .wb-py").textContent.indexOf("māo") >= 0);

// 点击英语标签 -> 展开详情（中文意思 + 图片）
const enTag = c.querySelector("#enBox .wb-tag");
enTag.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
check("英语点击展开：图片emoji", !!c.querySelector("#enDetail .wb-img"));
check("英语详情含中文意思", !!c.querySelector("#enDetail .wb-mean") && c.querySelector("#enDetail .wb-mean").textContent.indexOf("猫") >= 0);

// 点击诗词标签 -> 展开全诗
const poemTag = c.querySelector("#plBox .wb-tag");
poemTag.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
check("诗词点击展开：朗读按钮", !!c.querySelector("#poemDetail #poemRead"));
check("诗词详情含标题", !!c.querySelector("#poemDetail .wb-ptitle") && c.querySelector("#poemDetail .wb-ptitle").textContent.indexOf(poem.title) >= 0);

// 语音锁变量存在
check("audio 暴露 speak/speakPoem/speakEn", typeof window.A.speak === "function" && typeof window.A.speakPoem === "function" && typeof window.A.speakEn === "function");

// 语音停止：speak 后 isSpeaking 为真，stop 后归 false
window.A.speak("测试", "zh-CN");
const speakingAfterSpeak = window.A.isSpeaking();
window.A.stop();
check("语音：stop 后可停止(isSpeaking=false)", speakingAfterSpeak === true && window.A.isSpeaking() === false);

// 游戏：中国地图拼图入口 + 渲染 29 省份格子与瓦片
const cg = window.document.createElement("div");
window.document.body.appendChild(cg);
M.game(cg);
const cmapCard = Array.from(cg.querySelectorAll(".game-card")).find((el) => el.textContent.indexOf("中国地图拼图") >= 0);
check("游戏：含中国地图拼图入口", !!cmapCard);
cmapCard.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
const cmapArea = cg.querySelector("#gameArea");
check("地图：渲染 29 个省份格子", cmapArea.querySelectorAll(".china-cell:not(.empty)").length === 29);
check("地图：渲染 29 个省份瓦片", cmapArea.querySelectorAll(".china-tile").length === 29);

// 识字：已加入词库的字置灰
const story = window.Data.STORIES[window.Store.dailyIndex(window.Data.STORIES.length)];
const aChar = story.newChars[0] && story.newChars[0].char;
if (aChar) window.Store.addCN(aChar, "x", "y");
const cs = window.document.createElement("div");
window.document.body.appendChild(cs);
M.shizi(cs);
check("识字：已加入的字置灰(done-added)", aChar ? cs.querySelectorAll(".chr.done-added").length > 0 : true);

// 英语：已加入的单词置灰 + 图片绿色对钩
const enDaily = window.Store.getDailyEN();
const enKey = (enDaily.newKeys[0] || enDaily.reviewKeys[0]);
if (enKey) window.Store.addEN(enKey, "测试", "🔤");
const ce = window.document.createElement("div");
window.document.body.appendChild(ce);
M.english(ce);
let enGreyed = !enKey;
ce.querySelectorAll(".word-card").forEach((card) => {
  const en = card.querySelector(".word-en");
  if (en && en.textContent === enKey && en.classList.contains("added") && card.querySelector(".chk-badge")) enGreyed = true;
});
check("英语：已加入单词置灰+绿色对钩", enGreyed);

console.log(pass ? "\nROUND6 SMOKE TEST PASS" : "\nROUND6 SMOKE TEST FAIL");
process.exit(pass ? 0 : 1);
