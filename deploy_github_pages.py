#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Deploy _deploy/ directory to GitHub Pages (gh-pages branch) via GitHub API.
Usage: python deploy_github_pages.py
Reads token from env GITHUB_TOKEN or hardcoded fallback.
"""
import urllib.request, json, os, sys, base64, pathlib, time

# Token 优先级：环境变量 GITHUB_TOKEN > 本地 config_local.py（不提交到仓库，见 .gitignore）
TOKEN = os.environ.get("GITHUB_TOKEN", "")
if not TOKEN:
    try:
        import config_local
        TOKEN = getattr(config_local, "GITHUB_TOKEN", "")
    except Exception:
        TOKEN = ""
if not TOKEN:
    raise SystemExit(
        "未找到 GitHub Token。请二选一：\n"
        "  1) 设置环境变量 GITHUB_TOKEN；或\n"
        "  2) 复制 config_local.py.example 为 config_local.py 并填入你的 Token\n"
        "     （config_local.py 已被 .gitignore 忽略，不会上传到仓库）。"
    )
OWNER = "Avery524888"
REPO = "amy-learning"
DEPLOY_DIR = pathlib.Path(r"D:\项目\互动\workbuddy\2026-07-30-19-35-09\_deploy")

def api(method, path, payload=None, retries=4):
    """GitHub API 调用，带指数退避重试（大文件上传偶发 RemoteDisconnected/5xx）。"""
    url = f"https://api.github.com/repos/{OWNER}/{REPO}/{path}"
    data = json.dumps(payload).encode() if payload else None
    last_err = None
    for attempt in range(retries):
        req = urllib.request.Request(url, data=data, method=method, headers={
            "Authorization": f"token {TOKEN}",
            "Accept": "application/vnd.github+json",
            "User-Agent": "amy-learning-deploy",
            "Content-Type": "application/json"
        })
        try:
            resp = urllib.request.urlopen(req, timeout=180)
            return json.loads(resp.read()) if resp.status != 204 else {}
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            last_err = f"HTTP {e.code}: {body[:300]}"
            # 4xx 除 429/408 外不重试（参数/权限错误重试无意义）
            if e.code < 500 and e.code not in (408, 429):
                print(f"API {method} {path} -> {last_err}")
                raise
            print(f"API {method} {path} -> {last_err} (retry {attempt + 1}/{retries})")
        except Exception as e:
            last_err = str(e)
            print(f"API {method} {path} -> {last_err} (retry {attempt + 1}/{retries})")
        time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"API {method} {path} failed after {retries} attempts: {last_err}")

def create_blob(content_bytes):
    """通过 /git/blobs 创建 blob，返回 sha。"""
    blob = api("POST", "git/blobs", {
        "content": base64.b64encode(content_bytes).decode("ascii"),
        "encoding": "base64"
    })
    return blob["sha"]

def collect_tree_items(base_dir):
    """遍历 _deploy 目录，返回 GitHub tree item 列表（全部通过 blob sha）。"""
    items = []
    for root, dirs, files in os.walk(base_dir):
        for fname in files:
            fpath = pathlib.Path(root) / fname
            relpath = fpath.relative_to(base_dir).as_posix()
            content = fpath.read_bytes()
            sha = create_blob(content)
            items.append({
                "path": relpath,
                "mode": "100644",
                "type": "blob",
                "sha": sha
            })
            time.sleep(0.05)  # 缓和 API 速率
    return items

def main():
    if not DEPLOY_DIR.exists():
        raise SystemExit(f"Deploy dir not found: {DEPLOY_DIR}")

    tree_items = collect_tree_items(DEPLOY_DIR)
    print(f"Collected {len(tree_items)} files from {DEPLOY_DIR}")

    # Get gh-pages branch HEAD
    branch = api("GET", "branches/gh-pages")
    commit_sha = branch["commit"]["sha"]
    tree_sha = branch["commit"]["commit"]["tree"]["sha"]
    print(f"gh-pages HEAD: {commit_sha}")

    # Create new tree with all files
    new_tree = api("POST", "git/trees", {
        "base_tree": tree_sha,
        "tree": tree_items
    })
    print(f"New tree: {new_tree['sha']}")

    # Create commit
    new_commit = api("POST", "git/commits", {
        "message": "Deploy: auto update with external images",
        "tree": new_tree["sha"],
        "parents": [commit_sha]
    })
    print(f"New commit: {new_commit['sha']}")

    # Update gh-pages ref
    api("PATCH", "git/refs/heads/gh-pages", {"sha": new_commit['sha']})
    print("gh-pages updated!")

    # Trigger Pages build
    try:
        api("POST", "pages/builds")
        print("Pages build triggered")
    except Exception as e:
        print(f"Build trigger (may be auto): {e}")

    print(f"\nDeployed: https://{OWNER}.github.io/{REPO}/")

if __name__ == "__main__":
    main()
