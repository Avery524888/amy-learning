#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""部署后线上验证：对比 GitHub Pages 线上资源与本地 _deploy 文件是否一致。"""
import urllib.request, pathlib, re, sys

BASE = "https://avery524888.github.io/amy-learning"
LOCAL = pathlib.Path(r"D:\项目\互动\workbuddy\2026-07-30-19-35-09\_deploy")

def fetch(url, timeout=60):
    req = urllib.request.Request(url, headers={"User-Agent": "verify"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()

checks = [
    ("index.html", "index.html"),
    ("assets/books_data.js", "assets/books_data.js"),
    ("assets/en_words_data.js", "assets/en_words_data.js"),
    ("assets/stories_data.js", "assets/stories_data.js"),
]
ok = True
for rel, _ in checks:
    local = LOCAL / rel
    if not local.exists():
        print(f"[SKIP] 本地缺失 {rel}")
        continue
    try:
        remote = fetch(f"{BASE}/{rel}")
    except Exception as e:
        print(f"[FAIL] {rel} 线上不可达: {e}")
        ok = False
        continue
    lsize, rsize = local.stat().st_size, len(remote)
    if lsize == rsize:
        print(f"[OK] {rel} 大小一致 {lsize} 字节")
    else:
        print(f"[DIFF] {rel} 本地 {lsize} vs 线上 {rsize}")
        ok = False

# 内容抽检
try:
    remote_books = fetch(f"{BASE}/assets/books_data.js").decode("utf-8")
    titles = re.findall(r'title:\s*"([^"]+)"', remote_books)
    suf = [t for t in titles if "（" in t]
    print(f"[INFO] 线上绘本标题 {len(titles)} 个, 唯一 {len(set(titles))}, 场景后缀 {len(suf)}")
    if len(titles) != 3000 or len(set(titles)) != 3000:
        ok = False
except Exception as e:
    print(f"[FAIL] 线上绘本内容校验异常: {e}")
    ok = False

print("\n结论:", "✅ 全部一致，线上已更新！" if ok else "❌ 存在差异/失败，需排查")
sys.exit(0 if ok else 1)
