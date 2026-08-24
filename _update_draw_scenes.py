#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""替换 assets/data.js 中的 DRAW_SCENES 为外部图片引用。"""
import re, pathlib

ROOT = pathlib.Path(r"D:\项目\互动\workbuddy\2026-07-30-19-35-09")
DATA_JS = ROOT / "assets" / "data.js"

SCENES = [
    # ---- AI 生成场景（保留） ----
    {
        "name": "彩虹城堡",
        "emoji": "🏰",
        "story": "在绿色的山坡上，三座彩色圆顶塔楼手拉手。太阳公公笑眯眯，白云像棉花糖飘在蓝天。你可以给城堡画上闪闪发光的窗户和一条通往大门的小路！",
        "img": "images/ai-01.jpg",
    },
    {
        "name": "西瓜冰淇淋",
        "emoji": "🍉",
        "story": "半个甜甜的大西瓜变成冰淇淋碗！一层层彩色冰淇淋球堆得高高的，上面还有草莓和樱桃。夏天吃上一口，清凉又快乐。你最喜欢什么口味的冰淇淋呢？",
        "img": "images/ai-02.jpg",
    },
    {
        "name": "小桥房子",
        "emoji": "🏠",
        "story": "一座可爱的小桥跨在蓝蓝的河水上，桥上的小房子露出甜甜的笑脸。两岸有绿绿的大树和草地，云朵也在微笑。试着画出这个温馨的小桥房子吧！",
        "img": "images/ai-03.jpg",
    },
    {
        "name": "兔子菜园",
        "emoji": "🐰",
        "story": "小白兔抱着最爱的胡萝卜，坐在金黄色的田埂上。周围长着高高的胡萝卜，紫色天空里飘着几朵云。兔子的脸蛋红扑扑的，你也来画一只可爱的小兔子吧！",
        "img": "images/ai-04.jpg",
    },
    {
        "name": "蘑菇小屋",
        "emoji": "🍄",
        "story": "森林深处有一座蘑菇形状的小房子，粉红色的屋顶上点缀着彩色圆点。木门旁边挂着小灯笼，周围开满小花和绿草。你猜小精灵会不会住在里面呢？",
        "img": "images/ai-05.jpg",
    },
    {
        "name": "海底乐园",
        "emoji": "🐠",
        "story": "海底世界五彩缤纷！橙色的小鱼吐着泡泡，绿色海草摇摇摆摆，海星趴在沙地上，还有一只粉色水母在发光。快拿起画笔，画出神秘的海底乐园吧！",
        "img": "images/ai-06.jpg",
    },
    {
        "name": "星空露营",
        "emoji": "⛺",
        "story": "夜晚的山坡上搭着一顶小帐篷，旁边生起温暖的篝火。抬头看，月亮弯弯，星星一闪一闪。萤火虫也提着灯笼飞来啦。画一画这美妙的露营夜晚吧！",
        "img": "images/ai-07.jpg",
    },
    {
        "name": "花园蝴蝶",
        "emoji": "🦋",
        "story": "春天的花园里，一只彩色的大蝴蝶停在花朵上。周围有太阳、白云和绿绿的草地。蝴蝶的翅膀上有好看的斑点，你也来设计一只独一无二的蝴蝶吧！",
        "img": "images/ai-08.jpg",
    },
    # ---- 用户提供的参考图 ----
    {
        "name": "森林蘑菇屋",
        "emoji": "🍄",
        "story": "粉红色的蘑菇屋顶下，住着一座温暖的木头小房子。门口的小路通向森林，周围还有可爱的蘑菇伙伴。一起来画这座森林里的蘑菇小屋吧！",
        "img": "images/user-01.jpg",
    },
    {
        "name": "蓝色小鱼",
        "emoji": "🐟",
        "story": "一条蓝色的鱼儿在海里快乐地游来游去，周围有绿色海草和彩色小泡泡。海底世界真奇妙，你也来画一条小鱼吧！",
        "img": "images/user-02.jpg",
    },
    {
        "name": "夏日西瓜冰",
        "emoji": "🍦",
        "story": "半个大西瓜变成冰淇淋碗，里面装满了五颜六色的冰淇淋球，还有甜甜的草莓和樱桃。夏天就该这样清凉又甜蜜！",
        "img": "images/user-03.jpg",
    },
    {
        "name": "彩虹上的家",
        "emoji": "🌈",
        "story": "一道弯弯的彩虹上，建起了彩色的小房子，旁边有长满果实的树和快乐的小鸟。你想住在彩虹上的家里吗？",
        "img": "images/user-04.jpg",
    },
    {
        "name": "蘑菇小城堡",
        "emoji": "🏰",
        "story": "红色大蘑菇变成了一座小城堡，黄色的小墙上开着蓝色的窗户，太阳公公在旁边微微笑。画出你心中的蘑菇城堡吧！",
        "img": "images/user-05.jpg",
    },
    {
        "name": "彩色仙人掌",
        "emoji": "🌵",
        "story": "一盆胖乎乎的彩色仙人掌，身上长满了白色小点点，还开着漂亮的小花。它坐在漂亮的花盆里，可爱极了！",
        "img": "images/user-06.jpg",
    },
    {
        "name": "小丑鱼旅行",
        "emoji": "🐠",
        "story": "三条橙白相间的小丑鱼在大海里游来游去，周围有绿色海草和蓝色泡泡。它们好像在比赛谁游得快呢！",
        "img": "images/user-07.jpg",
    },
    {
        "name": "美丽的狮子鱼",
        "emoji": "🐡",
        "story": "一条漂亮的狮子鱼张开彩虹色的鱼鳍，像一把彩色的小扇子。它的身上有漂亮的花纹，你也来画一画吧！",
        "img": "images/user-08.jpg",
    },
    {
        "name": "童话城堡",
        "emoji": "🏯",
        "story": "一座圆圆的童话城堡里，住着五颜六色的高塔，屋顶上有星星和花纹装饰。画一画你梦想中的城堡吧！",
        "img": "images/user-09.jpg",
    },
    {
        "name": "沙滩小螃蟹",
        "emoji": "🦀",
        "story": "一只红色的小螃蟹站在沙滩上，挥着大钳子，旁边有黄色的小海星和微笑的太阳。海边真热闹呀！",
        "img": "images/user-10.jpg",
    },
    {
        "name": "彩色蘑菇屋",
        "emoji": "🍄",
        "story": "粉色的蘑菇屋顶上点缀着彩色小圆点，木门前挂着小灯笼，周围有绿叶和红花。小精灵也许就住在这里哦！",
        "img": "images/user-11.jpg",
    },
    {
        "name": "美丽的祖国",
        "emoji": "🚀",
        "story": "火箭飞向蓝天，高铁穿过城市，长城盘绕在祖国大地上，小朋友们穿着漂亮的民族服装载歌载舞。画出你心中美丽的祖国吧！",
        "img": "images/user-12.jpg",
    },
    {
        "name": "蜜蜂花园",
        "emoji": "🐝",
        "story": "勤劳的小蜜蜂在五颜六色的花丛中采蜜，粉色、蓝色、黄色的花儿竞相开放。春天的花园真热闹！",
        "img": "images/user-13.jpg",
    },
    {
        "name": "小鱼吹泡泡",
        "emoji": "🐟",
        "story": "一条彩色的小鱼在海里游来游去，嘴里吐出一串串彩色泡泡。海底的沙子黄黄的，海草绿绿的，真漂亮！",
        "img": "images/user-14.jpg",
    },
    {
        "name": "粉色小鱼",
        "emoji": "🐠",
        "story": "一条粉色的小鱼在蓝色的大海里游泳，身上还有条纹，圆圆的眼睛好可爱。你也来画一条这样的小鱼吧！",
        "img": "images/user-15.jpg",
    },
    {
        "name": "彩色树林",
        "emoji": "🌳",
        "story": "远处是蓝蓝的高山，近处是一片五颜六色的树林，小朋友们在湖边玩耍、划船。秋天的树林像一幅美丽的画！",
        "img": "images/user-16.jpg",
    },
]

pattern = re.compile(r"const DRAW_SCENES = \[.*?\];", re.DOTALL)
new_block = "const DRAW_SCENES = [\n" + ",\n".join(
    f'    {{ name:"{s["name"]}", emoji:"{s["emoji"]}", story:"{s["story"]}",\n      img:"{s["img"]}" }}'
    for s in SCENES
) + "\n  ];"

text = DATA_JS.read_text(encoding="utf-8")
if not pattern.search(text):
    raise SystemExit("DRAW_SCENES block not found")
text = pattern.sub(new_block, text, count=1)
DATA_JS.write_text(text, encoding="utf-8")
print(f"DRAW_SCENES replaced with {len(SCENES)} scenes using external images.")
