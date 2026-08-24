#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""将 _deploy/images 中的 JPEG 场景图转为 base64，替换 assets/data.js 中的 DRAW_SCENES。"""
import re, pathlib, base64

ROOT = pathlib.Path(r"D:\项目\互动\workbuddy\2026-07-30-19-35-09")
DATA_JS = ROOT / "assets" / "data.js"
IMG_DIR = ROOT / "_deploy" / "images"

SCENES = [
    ("彩虹城堡", "🏰", "在绿色的山坡上，三座彩色圆顶塔楼手拉手。太阳公公笑眯眯，白云像棉花糖飘在蓝天。你可以给城堡画上闪闪发光的窗户和一条通往大门的小路！", "castle.jpg"),
    ("西瓜冰淇淋", "🍉", "半个甜甜的大西瓜变成冰淇淋碗！一层层彩色冰淇淋球堆得高高的，上面还有草莓和樱桃。夏天吃上一口，清凉又快乐。你最喜欢什么口味的冰淇淋呢？", "watermelon.jpg"),
    ("小桥房子", "🏠", "一座可爱的小桥跨在蓝蓝的河水上，桥上的小房子露出甜甜的笑脸。两岸有绿绿的大树和草地，云朵也在微笑。试着画出这个温馨的小桥房子吧！", "bridgehouse.jpg"),
    ("兔子菜园", "🐰", "小白兔抱着最爱的胡萝卜，坐在金黄色的田埂上。周围长着高高的胡萝卜，紫色天空里飘着几朵云。兔子的脸蛋红扑扑的，你也来画一只可爱的小兔子吧！", "rabbit.jpg"),
    ("蘑菇小屋", "🍄", "森林深处有一座蘑菇形状的小房子，粉红色的屋顶上点缀着彩色圆点。木门旁边挂着小灯笼，周围开满小花和绿草。你猜小精灵会不会住在里面呢？", "mushroom.jpg"),
    ("海底乐园", "🐠", "海底世界五彩缤纷！橙色的小鱼吐着泡泡，绿色海草摇摇摆摆，海星趴在沙地上，还有一只粉色水母在发光。快拿起画笔，画出神秘的海底乐园吧！", "underwater.jpg"),
    ("星空露营", "⛺", "夜晚的山坡上搭着一顶小帐篷，旁边生起温暖的篝火。抬头看，月亮弯弯，星星一闪一闪。萤火虫也提着灯笼飞来啦。画一画这美妙的露营夜晚吧！", "camping.jpg"),
    ("花园蝴蝶", "🦋", "春天的花园里，一只彩色的大蝴蝶停在花朵上。周围有太阳、白云和绿绿的草地。蝴蝶的翅膀上有好看的斑点，你也来设计一只独一无二的蝴蝶吧！", "butterfly.jpg"),
]

def to_base64(name):
    path = IMG_DIR / name
    data = path.read_bytes()
    return "data:image/jpeg;base64," + base64.b64encode(data).decode()

items = []
for name, emoji, story, img in SCENES:
    b64 = to_base64(img)
    items.append(f'    {{ name:"{name}", emoji:"{emoji}", story:"{story}",\n      img:`{b64}` }}')

new_block = "const DRAW_SCENES = [\n" + ",\n".join(items) + "\n  ];"

text = DATA_JS.read_text(encoding="utf-8")
pattern = re.compile(r"const DRAW_SCENES = \[.*?\];", re.DOTALL)
if not pattern.search(text):
    raise SystemExit("DRAW_SCENES block not found")
text = pattern.sub(new_block, text, count=1)
DATA_JS.write_text(text, encoding="utf-8")
print(f"DRAW_SCENES replaced with {len(SCENES)} base64 JPEG scenes.")
