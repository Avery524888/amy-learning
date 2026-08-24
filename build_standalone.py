# -*- coding: utf-8 -*-
"""构建两种产物：
1) standalone.html —— 单文件自包含版（内联所有资源+图片 base64），可双击离线打开。
2) _deploy/         —— 多文件版（适合 GitHub Pages）：index.html + assets/*.js + assets/style.css
                       + images/。脚本/样式/图片分文件，浏览器可缓存、首屏并行加载，
                       拼音引擎(pinyin-pro.mjs, 564KB) 作为 deferred 模块后台下载，不阻塞首屏渲染。

为什么这么做：
- 单文件可彻底规避某些托管对子目录资源返回 0 字节的问题，且离线可用；
- 多文件版让 GitHub Pages 的首屏只下载约 290KB 关键脚本（其余并行/后台加载且可缓存），
  重复访问几乎秒开，从根本上解决“打开网址太慢”。
"""
import re, os, base64, shutil

ROOT = r"D:/项目/互动/workbuddy/2026-07-30-19-35-09"
html = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
css = open(os.path.join(ROOT, "assets/style.css"), encoding="utf-8").read()

# ---- 拼音引擎：去掉末尾 export，改为挂载到 window（仅单文件版内联用）----
pin = open(os.path.join(ROOT, "assets/pinyin-pro.mjs"), encoding="utf-8").read()
lines = pin.split("\n")
for i, l in enumerate(lines):
    if l.strip().startswith("export"):
        lines[i] = "window.pinyinPro = pinyin; window.__pinyinInlined = true;"
pin = "\n".join(lines)

# ---- 工具：内联 JS 时把 </script 转义，避免提前闭合 ----
def inline_js(fname, *, data_js_transform=None):
    s = open(os.path.join(ROOT, "assets", fname), encoding="utf-8").read()
    if fname == "data.js" and data_js_transform:
        s = data_js_transform(s)
    s = s.replace("</script", "<\\/script")
    return s

classic_files = ["chinaMapData.js", "data.js", "en_words_data.js", "books_data.js",
                 "stories_data.js", "poems_data.js", "poems_extra.js",
                 "poem_notes.js", "store.js", "audio.js", "modules.js", "app.js"]

# ============================================================
# 1) standalone.html —— 单文件，全部内联（图片 base64）
# ============================================================
IMG_REF_RE = re.compile(r'img:"images/([^"]+)"')

def inline_images(content):
    def repl(m):
        fname = m.group(1)
        fpath = os.path.join(ROOT, "images", fname)
        if not os.path.exists(fpath):
            print(f"[warn] image not found: {fpath}")
            return m.group(0)
        ext = os.path.splitext(fname)[1].lower()
        mime = "image/png" if ext == ".png" else "image/jpeg"
        with open(fpath, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("ascii")
        return f'img:"data:{mime};base64,{b64}"'
    return IMG_REF_RE.sub(repl, content)

def keep_relative(content):
    return content

def build_scripts_inline():
    pin_safe = pin.replace("</script", "<\\/script")
    scripts = '<script type="module">\n' + pin_safe + '\n</script>\n'
    for f in classic_files:
        transform = inline_images if f == "data.js" else None
        scripts += '<script>\n' + inline_js(f, data_js_transform=transform) + '\n</script>\n'
    return scripts

# 单文件：CSS 内联 + 脚本全内联 + CSP 放宽允许内联（无外部脚本）
html_css = html.replace('<link rel="stylesheet" href="assets/style.css" />',
                         '<style>\n' + css + '\n</style>')
html_csp = html_css.replace("script-src 'self';", "script-src 'unsafe-inline';")
standalone_scripts = build_scripts_inline()
standalone_html = re.sub(
    r'<script type="module" src="assets/pinyin_init.js"></script>.*?<script src="assets/app.js"></script>',
    lambda m: standalone_scripts, html_csp, flags=re.S)
out = os.path.join(ROOT, "standalone.html")
open(out, "w", encoding="utf-8").write(standalone_html)
print("standalone.html 生成成功，大小:", len(standalone_html), "字节")
left = re.findall(r'(?:src|href)="assets/[^"]+"', standalone_html)
print("standalone 残留外部资源引用:", left if left else "无")

# ============================================================
# 2) _deploy/ —— 多文件版（原生结构拷贝，浏览器可缓存）
# ============================================================
deploy_dir = os.path.join(ROOT, "_deploy")
if os.path.exists(deploy_dir):
    shutil.rmtree(deploy_dir)
os.makedirs(deploy_dir)

# index.html：保持外部脚本引用（CSP 用原生的 'self'，允许加载 assets/*.js）
deploy_index = html
# 多文件版图片本来就是外部引用（data.js 中 img:"images/xxx.jpg"），无需改动
# 为与单文件版数据一致，确保 poems_extra.js 被加载（原生 index.html 未引用，这里补上）
if 'assets/poems_extra.js' not in deploy_index:
    deploy_index = deploy_index.replace(
        '<script src="assets/poems_data.js"></script>',
        '<script src="assets/poems_data.js"></script>\n  <script src="assets/poems_extra.js"></script>'
    )
# 移除会静态 import 564KB 拼音引擎的 pinyin_init.js（会阻塞首屏）；
# 拼音引擎改由 app.js 在后台动态 import，不阻塞渲染。
deploy_index = re.sub(r'\s*<script type="module" src="assets/pinyin_init.js"></script>', '', deploy_index)
# 给经典脚本加 defer：先渲染界面骨架，再并行下载/执行脚本，首屏不再被 400KB+ 脚本阻塞
deploy_index = re.sub(
    r'<script src="assets/([^"]+\.js)"></script>',
    lambda m: f'<script defer src="assets/{m.group(1)}"></script>',
    deploy_index
)
# 给经典脚本加 defer：先渲染界面骨架，再并行下载/执行脚本，首屏不再被 400KB+ 脚本阻塞
deploy_index = re.sub(
    r'<script src="assets/([^"]+\.js)"></script>',
    lambda m: f'<script defer src="assets/{m.group(1)}"></script>',
    deploy_index
)
open(os.path.join(deploy_dir, "index.html"), "w", encoding="utf-8").write(deploy_index)

# 拷贝 assets/（所有 js + css + 拼音引擎）与 images/
# 排除 assets/images（data.js 引用的是根目录 images/，嵌套副本纯属冗余会撑大部署体积）
shutil.copytree(os.path.join(ROOT, "assets"), os.path.join(deploy_dir, "assets"),
                ignore=shutil.ignore_patterns("images"))
images_src = os.path.join(ROOT, "images")
images_dst = os.path.join(deploy_dir, "images")
if os.path.exists(images_src):
    shutil.copytree(images_src, images_dst)
    print(f"_deploy/images/ 复制完成: {len(os.listdir(images_dst))} 张图片")
else:
    print("[warn] images/ 源目录不存在")

# 统计首屏关键脚本大小（不含拼音引擎）
key = ["assets/app.js", "assets/modules.js", "assets/data.js", "assets/poems_data.js",
       "assets/store.js", "assets/audio.js", "assets/chinaMapData.js", "assets/style.css"]
total = 0
for k in key:
    p = os.path.join(deploy_dir, k)
    if os.path.exists(p):
        total += os.path.getsize(p)
print(f"_deploy/index.html 大小: {os.path.getsize(os.path.join(deploy_dir,'index.html'))} 字节")
print(f"_deploy 首屏关键资源(不含拼音引擎564KB): {total} 字节 ≈ {total/1024:.0f} KB")
print("_deploy 结构:", sorted(os.listdir(deploy_dir)))
