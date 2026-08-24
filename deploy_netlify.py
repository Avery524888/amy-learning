#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""可选：用 Netlify REST API 把 _deploy/ 部署到你的 Netlify 站点。
前置：
  1. 在 https://app.netlify.com/user/applications#personal-access-tokens 生成 Personal Access Token
  2. 在 Netlify 先建一个空站点，记下站点 ID（站点后台 URL 里 /sites/<SITE_ID>）
  3. 把下面两个变量填好（或用环境变量传入），运行：python deploy_netlify.py
注意：部署完成后仍需在 Netlify 控制台开启 Password protection（见《部署与访问密码指南.md》第三步第 4 点）。
"""
import os, json, urllib.request, urllib.parse

TOKEN = os.environ.get("NETLIFY_AUTH_TOKEN", "在此填入你的 Netlify Personal Access Token")
SITE_ID = os.environ.get("NETLIFY_SITE_ID", "在此填入站点 ID")
DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_deploy")
EXCLUDE = {"standalone.html", "generate_china_map.py"}  # 单文件版与生成脚本不必上传


def api(method, path, data=None):
    url = "https://api.netlify.com/api/v1" + path
    headers = {
        "Authorization": "Bearer " + TOKEN,
        "User-Agent": "amy-deploy",
        "Content-Type": "application/json",
    }
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        r = urllib.request.urlopen(req, timeout=180)
        return json.loads(r.read()) if r.status != 204 else {}
    except urllib.error.HTTPError as e:
        print("API 错误", e.code, e.read().decode()[:300])
        raise


def main():
    if TOKEN.startswith("在此填入") or SITE_ID.startswith("在此填入"):
        raise SystemExit("请先在脚本顶部（或环境变量）填入 NETLIFY_AUTH_TOKEN 与 NETLIFY_SITE_ID")

    # 1. 创建一次空 deploy，拿到 deploy id
    dep = api("POST", f"/sites/{SITE_ID}/deploys", json.dumps({}).encode())
    did = dep.get("id")
    if not did:
        raise SystemExit("创建 deploy 失败：" + json.dumps(dep)[:200])
    print("已创建 deploy:", did)

    # 2. 逐个上传文件（PUT 文件内容到 /files/<path>）
    count = 0
    for root, _, files in os.walk(DIR):
        for f in files:
            if f in EXCLUDE:
                continue
            p = os.path.join(root, f)
            rel = os.path.relpath(p, DIR).replace("\\", "/")
            with open(p, "rb") as fh:
                content = fh.read()
            up = urllib.request.Request(
                f"https://api.netlify.com/api/v1/deploys/{did}/files/{urllib.parse.quote(rel)}",
                data=content, method="PUT",
                headers={"Authorization": "Bearer " + TOKEN,
                          "User-Agent": "amy-deploy",
                          "Content-Type": "application/octet-stream"},
            )
            urllib.request.urlopen(up, timeout=180)
            count += 1
    print(f"已上传 {count} 个文件，部署完成。请在 Netlify 控制台开启 Password protection。")


if __name__ == "__main__":
    main()
