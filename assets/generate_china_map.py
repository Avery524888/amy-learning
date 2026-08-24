#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
离线生成中国省级地图 SVG path 数据（真实省界轮廓，简化以控制体积）。
数据源：DataV GeoJSON (100000_full.json)，已下载到同目录。
输出：chinaMapData.js -> window.ChinaMapData = { w, h, provinces:[...] }
每个省含：short(省简称), capital(省会城市), d(SVG path), lx/ly(省名标注位置)
"""
import json

SRC = "china_full.json"
OUT = "chinaMapData.js"

# 省级行政区全称 -> (显示简称, 省会城市)
META = {
    "北京市": ("北京", "北京"),
    "天津市": ("天津", "天津"),
    "河北省": ("河北", "石家庄"),
    "山西省": ("山西", "太原"),
    "内蒙古自治区": ("内蒙古", "呼和浩特"),
    "辽宁省": ("辽宁", "沈阳"),
    "吉林省": ("吉林", "长春"),
    "黑龙江省": ("黑龙江", "哈尔滨"),
    "上海市": ("上海", "上海"),
    "江苏省": ("江苏", "南京"),
    "浙江省": ("浙江", "杭州"),
    "安徽省": ("安徽", "合肥"),
    "福建省": ("福建", "福州"),
    "江西省": ("江西", "南昌"),
    "山东省": ("山东", "济南"),
    "河南省": ("河南", "郑州"),
    "湖北省": ("湖北", "武汉"),
    "湖南省": ("湖南", "长沙"),
    "广东省": ("广东", "广州"),
    "广西壮族自治区": ("广西", "南宁"),
    "海南省": ("海南", "海口"),
    "重庆市": ("重庆", "重庆"),
    "四川省": ("四川", "成都"),
    "贵州省": ("贵州", "贵阳"),
    "云南省": ("云南", "昆明"),
    "西藏自治区": ("西藏", "拉萨"),
    "陕西省": ("陕西", "西安"),
    "甘肃省": ("甘肃", "兰州"),
    "青海省": ("青海", "西宁"),
    "宁夏回族自治区": ("宁夏", "银川"),
    "新疆维吾尔自治区": ("新疆", "乌鲁木齐"),
    "台湾省": ("台湾", "台北"),
    "香港特别行政区": ("香港", "香港"),
    "澳门特别行政区": ("澳门", "澳门"),
}


def rings_of(geom):
    """返回每个多边形（及 multipolygon 的每个子块）的外环坐标列表 [[lon,lat],...]"""
    t = geom.get("type")
    if t == "Polygon":
        return [geom["coordinates"][0]]
    if t == "MultiPolygon":
        return [poly[0] for poly in geom["coordinates"]]
    return []


# 读取数据
data = json.load(open(SRC, encoding="utf-8"))
feats = [f for f in data["features"] if f.get("properties", {}).get("name") in META]

# 全局 bbox
minx = miny = 1e9
maxx = maxy = -1e9
for f in feats:
    for r in rings_of(f["geometry"]):
        for lon, lat in r:
            if lon < minx: minx = lon
            if lon > maxx: maxx = lon
            if lat < miny: miny = lat
            if lat > maxy: maxy = lat

W = 1000.0
PAD = 34.0
spanX = maxx - minx
spanY = maxy - miny
scale = min((W - 2 * PAD) / spanX, (760 - 2 * PAD) / spanY)
H = spanY * scale + 2 * PAD


def proj(lon, lat):
    x = PAD + (lon - minx) * scale
    y = H - PAD - (lat - miny) * scale
    return (x, y)


def point_dist(p, a, b):
    ax, ay = a; bx, by = b; px, py = p
    dx = bx - ax; dy = by - ay
    if dx == 0 and dy == 0:
        return ((px - ax) ** 2 + (py - ay) ** 2) ** 0.5
    t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)
    t = max(0.0, min(1.0, t))
    cx = ax + t * dx; cy = ay + t * dy
    return ((px - cx) ** 2 + (py - cy) ** 2) ** 0.5


def simplify(pts, eps):
    """Douglas-Peucker，基于投影后像素坐标"""
    if len(pts) < 3:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        s, e = stack.pop()
        dmax = 0.0; idx = -1
        for i in range(s + 1, e):
            d = point_dist(pts[i], pts[s], pts[e])
            if d > dmax:
                dmax = d; idx = i
        if dmax > eps and idx != -1:
            keep[idx] = True
            stack.append((s, idx))
            stack.append((idx, e))
    return [pts[i] for i in range(len(pts)) if keep[i]]


def path_d(geom):
    parts = []
    for r in rings_of(geom):
        pts = [proj(lon, lat) for lon, lat in r]
        pts = simplify(pts, 1.3)
        if len(pts) < 3:
            continue
        seg = "M%.1f %.1f" % (pts[0][0], pts[0][1])
        for x, y in pts[1:]:
            seg += "L%.1f %.1f" % (x, y)
        seg += "Z"
        parts.append(seg)
    return "".join(parts)


provinces = []
for f in feats:
    name = f["properties"]["name"]
    short, cap = META[name]
    d = path_d(f["geometry"])
    cen = f["properties"].get("centroid") or f["properties"].get("center")
    lx, ly = proj(cen[0], cen[1])
    provinces.append({
        "name": short,
        "full": name,
        "capital": cap,
        "d": d,
        "lx": round(lx, 1),
        "ly": round(ly, 1),
    })

# 按 META 顺序输出
order = list(META.keys())
provinces.sort(key=lambda p: order.index(p["full"]))

out = "window.ChinaMapData={w:%d,h:%.1f,provinces:%s};\n" % (
    int(W), H, json.dumps(provinces, ensure_ascii=False, separators=(",", ":"))
)
open(OUT, "w", encoding="utf-8").write(out)

total_d = sum(len(p["d"]) for p in provinces)
print("provinces:", len(provinces))
print("viewBox: 0 0 %d %.1f" % (int(W), H))
print("total path chars:", total_d)
print("output bytes:", len(out.encode("utf-8")))
