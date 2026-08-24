# -*- coding: utf-8 -*-
"""生成 3000 本儿童绘本数据文件 assets/books_data.js
基于模板+角色+场景组合生成，每本含 {title, cover, pages:[{emoji, text}]}
"""
import json, os, random, itertools

ROOT = os.path.dirname(os.path.abspath(__file__))

# ============ 角色池 ============
CHARS = [
    ("小白兔", "🐰"), ("小熊", "🐻"), ("小猫", "🐱"), ("小狗", "🐶"),
    ("小鸟", "🐦"), ("小象", "🐘"), ("小猴子", "🐵"), ("小狐狸", "🦊"),
    ("小猪", "🐷"), ("小鸭子", "🦆"), ("小青蛙", "🐸"), ("小老虎", "🐯"),
    ("小狮子", "🦁"), ("小企鹅", "🐧"), ("小熊猫", "🐼"), ("小老鼠", "🐭"),
    ("小鹿", "🦌"), ("小马", "🐴"), ("小羊", "🐑"), ("小牛", "🐄"),
    ("小乌龟", "🐢"), ("小鱼", "🐟"), ("小蝴蝶", "🦋"), ("小蜜蜂", "🐝"),
    ("小松鼠", "🐿️"), ("小刺猬", "🦔"), ("小海豚", "🐬"), ("小考拉", "🐨"),
    ("小恐龙", "🦖"), ("小仙女", "🧚"),
]

# ============ 场景池 ============
PLACES = [
    ("森林", "🌳"), ("公园", "🏞️"), ("家里", "🏠"), ("学校", "🏫"),
    ("海边", "🏖️"), ("山上", "⛰️"), ("河边", "🏞️"), ("花园", "🌷"),
    ("城市", "🏙️"), ("农场", "🚜"), ("天空", "☁️"), ("草地", "🌿"),
    ("雪山", "🏔️"), ("沙漠", "🏜️"), ("湖边", "🌊"), ("树林", "🌲"),
    ("洞穴", "🕳️"), ("岛屿", "🏝️"), ("山谷", "⛰️"), ("星空下", "🌌"),
]

# ============ 故事模板 ============
# 每个模板: {title, cover, pages: [(emoji, text_pattern)]}
# {char} = 角色, {place} = 场景, {cemoji} = 角色emoji, {pemoji} = 场景emoji
TEMPLATES = [
    {
        "title": "{char}找朋友",
        "cover": "🤝",
        "pages": [
            ("{cemoji}", "{char}住在{place}里，它想找一个好朋友。"),
            ("{pemoji}", "{char}走出{place}，东看看西看看。"),
            ("🐿️", "路上遇到了一只小松鼠。"),
            ("⚽", "它们一起踢球、捉迷藏，玩得真开心。"),
            ("🤝", "{char}终于有了一个好朋友！"),
        ]
    },
    {
        "title": "{char}的大冒险",
        "cover": "🗺️",
        "pages": [
            ("{cemoji}", "{char}决定去{place}探险。"),
            ("{pemoji}", "它来到{place}，看到好多新奇的东西。"),
            ("🔍", "它发现了一个神秘的小洞。"),
            ("💎", "洞里有一颗闪闪发光的宝石！"),
            ("🎉", "{char}开开心心地带着宝石回家了。"),
        ]
    },
    {
        "title": "{char}学分享",
        "cover": "🩷",
        "pages": [
            ("{cemoji}", "{char}有一篮子好吃的。"),
            ("🍎", "它不想分给别人，自己抱着篮子。"),
            ("😢", "可是它发现一个人吃一点都不开心。"),
            ("🤗", "它把好吃的分给了{place}的小伙伴们。"),
            ("😄", "大家一起吃，{char}觉得比以前更开心了！"),
        ]
    },
    {
        "title": "{char}和彩虹",
        "cover": "🌈",
        "pages": [
            ("🌧️", "{place}下了一场大雨。"),
            ("🌈", "雨停了，天上出现了一道彩虹。"),
            ("{cemoji}", "{char}看到彩虹，开心极了。"),
            ("🎨", "它想画出彩虹，可是颜色太多了。"),
            ("💖", "{char}说：彩虹真美，就像好朋友一样！"),
        ]
    },
    {
        "title": "{char}的生日派对",
        "cover": "🎂",
        "pages": [
            ("{cemoji}", "今天是{char}的生日！"),
            ("🎈", "{place}里挂满了气球和彩带。"),
            ("🎁", "朋友们带来了好多礼物。"),
            ("🎂", "大家一起唱生日歌，吹蜡烛。"),
            ("🥳", "{char}说：这是最开心的生日！"),
        ]
    },
    {
        "title": "{char}学飞行",
        "cover": "🪽",
        "pages": [
            ("{cemoji}", "{char}看到小鸟在天上飞，很羡慕。"),
            ("{pemoji}", "它爬上{place}最高的地方。"),
            ("💨", "它张开手臂，使劲扇呀扇。"),
            ("😅", "可是怎么也飞不起来。"),
            ("🌟", "小鸟说：每个动物都有自己厉害的地方！"),
        ]
    },
    {
        "title": "{char}种花",
        "cover": "🌻",
        "pages": [
            ("{cemoji}", "{char}想在{place}种一棵花。"),
            ("🌱", "它挖了一个小坑，放进种子。"),
            ("💧", "它每天浇水，等呀等。"),
            ("🌿", "小芽冒出来了，越长越高。"),
            ("🌻", "终于开出了一朵大大的向日葵！"),
        ]
    },
    {
        "title": "{char}不怕黑",
        "cover": "🌙",
        "pages": [
            ("{cemoji}", "{char}害怕天黑。"),
            ("🌌", "夜晚的{place}黑黑的。"),
            ("⭐", "它抬头看到好多星星一闪一闪。"),
            ("🌙", "月亮姐姐对它笑。"),
            ("😴", "{char}不怕了，甜甜地睡着了。"),
        ]
    },
    {
        "title": "{char}帮助别人",
        "cover": "🤝",
        "pages": [
            ("{cemoji}", "{char}在{place}散步。"),
            ("😰", "它看到小蚂蚁掉进了水里。"),
            ("🍃", "{char}用一片树叶把蚂蚁救了上来。"),
            ("🙏", "小蚂蚁说：谢谢你！"),
            ("💖", "{char}觉得帮助别人真快乐。"),
        ]
    },
    {
        "title": "{char}的梦",
        "cover": "💭",
        "pages": [
            ("😴", "{char}在{place}睡着了。"),
            ("☁️", "它梦见自己飞上了天空。"),
            ("🏰", "它来到一座糖果做的城堡。"),
            ("🍬", "到处都是好吃的糖果和蛋糕。"),
            ("⭐", "醒来后，{char}觉得这是个甜甜的梦。"),
        ]
    },
    {
        "title": "{char}捡到蛋",
        "cover": "🥚",
        "pages": [
            ("{cemoji}", "{char}在{place}发现一颗蛋。"),
            ("🥚", "蛋圆圆的，温温的。"),
            ("🐤", "突然，蛋壳裂了，钻出一只小鸡！"),
            ("😍", "{char}小心翼翼地照顾小鸡。"),
            ("🐥", "小鸡跟着{char}，叫它妈妈。"),
        ]
    },
    {
        "title": "{char}过河",
        "cover": "🌊",
        "pages": [
            ("{cemoji}", "{char}要过一条河。"),
            ("🌊", "河水哗哗流，{char}不会游泳。"),
            ("🐢", "小乌龟游过来说：我背你！"),
            ("🙏", "{char}爬上乌龟背，安全过了河。"),
            ("💖", "{char}说：谢谢你，好朋友！"),
        ]
    },
    {
        "title": "{char}画画",
        "cover": "🎨",
        "pages": [
            ("{cemoji}", "{char}想画一幅画。"),
            ("🎨", "它拿出画笔和颜料。"),
            ("🖼️", "它画了{place}的风景。"),
            ("🏆", "大家看了都说画得真好！"),
            ("😊", "{char}开心地笑了。"),
        ]
    },
    {
        "title": "{char}捉迷藏",
        "cover": "🙈",
        "pages": [
            ("{cemoji}", "{char}和小伙伴们玩捉迷藏。"),
            ("🌳", "{char}藏在{place}的大树后面。"),
            ("🤫", "它屏住呼吸，不敢出声。"),
            ("👀", "找呀找，终于被找到了！"),
            ("😂", "大家哈哈大笑，真好玩！"),
        ]
    },
    {
        "title": "{char}的礼物",
        "cover": "🎁",
        "pages": [
            ("{cemoji}", "{char}想给妈妈准备一个礼物。"),
            ("🌸", "它去{place}采了一束花。"),
            ("🎀", "它用丝带把花绑好。"),
            ("🎁", "妈妈收到礼物，好感动。"),
            ("💕", "妈妈说：谢谢你，宝贝！"),
        ]
    },
    {
        "title": "{char}和大雨",
        "cover": "🌧️",
        "pages": [
            ("{cemoji}", "{char}在{place}玩耍。"),
            ("🌧️", "突然下起了大雨。"),
            ("🍄", "{char}躲在一个大蘑菇下面。"),
            ("🌈", "雨停了，天上出现彩虹。"),
            ("☀️", "{char}开开心心地回家了。"),
        ]
    },
    {
        "title": "{char}学数数",
        "cover": "🔢",
        "pages": [
            ("{cemoji}", "{char}想学数数。"),
            ("1️⃣", "妈妈教它数：一、二、三。"),
            ("🍎", "{char}数{place}里的苹果。"),
            ("✅", "它数对了，好棒！"),
            ("🏆", "妈妈夸{char}是聪明的好孩子。"),
        ]
    },
    {
        "title": "{char}的雪天",
        "cover": "⛄",
        "pages": [
            ("❄️", "{place}下雪了！"),
            ("{cemoji}", "{char}穿上厚厚的衣服出去玩。"),
            ("⛄", "它堆了一个大雪人。"),
            ("⚔️", "它和小伙伴打雪仗。"),
            ("🔥", "玩累了，回家喝热汤暖暖。"),
        ]
    },
    {
        "title": "{char}送信",
        "cover": "✉️",
        "pages": [
            ("{cemoji}", "{char}要送一封信给远方的朋友。"),
            ("{pemoji}", "它穿过{place}，走呀走。"),
            ("🏔️", "它翻过高山，过小河。"),
            ("📮", "终于把信送到了！"),
            ("😊", "朋友收到信好开心，{char}也好开心。"),
        ]
    },
    {
        "title": "{char}和月亮",
        "cover": "🌙",
        "pages": [
            ("{cemoji}", "{char}喜欢看月亮。"),
            ("🌙", "月亮弯弯的，像小船。"),
            ("⭐", "星星围在月亮身边。"),
            ("🎶", "{char}给月亮唱了一首歌。"),
            ("😴", "月亮笑了，{char}也睡了。"),
        ]
    },
    {
        "title": "{char}去上学",
        "cover": "🏫",
        "pages": [
            ("{cemoji}", "{char}第一天去上学。"),
            ("🏫", "它来到{place}的学校。"),
            ("📚", "老师教大家读书写字。"),
            ("🤝", "{char}认识了新朋友。"),
            ("🎉", "上学真有趣！"),
        ]
    },
    {
        "title": "{char}的花园",
        "cover": "🌷",
        "pages": [
            ("{cemoji}", "{char}有一个小花园。"),
            ("🌱", "它种了好多花和蔬菜。"),
            ("💧", "每天浇水、除草。"),
            ("🌹", "花园里开满了各种花。"),
            ("🦋", "蝴蝶和蜜蜂都来玩了。"),
        ]
    },
    {
        "title": "{char}建房子",
        "cover": "🏠",
        "pages": [
            ("{cemoji}", "{char}想建一个自己的房子。"),
            ("🧱", "它搬来砖头和木头。"),
            ("🔨", "它一块一块地砌墙。"),
            ("🏠", "房子建好了，又结实又漂亮。"),
            ("🎉", "{char}邀请朋友们来家里玩。"),
        ]
    },
    {
        "title": "{char}唱歌",
        "cover": "🎵",
        "pages": [
            ("{cemoji}", "{char}想学唱歌。"),
            ("🎶", "它跟着小鸟学唱Do Re Mi。"),
            ("🎤", "它练习了好久好久。"),
            ("🏆", "它参加了唱歌比赛。"),
            ("⭐", "大家都说{char}唱得真好听！"),
        ]
    },
    {
        "title": "{char}和星星",
        "cover": "⭐",
        "pages": [
            ("{cemoji}", "{char}在{place}看星星。"),
            ("⭐", "星星一闪一闪，好多好多。"),
            ("🌠", "一颗流星飞过去了！"),
            ("🤔", "{char}许了一个愿望。"),
            ("💫", "它相信愿望一定会实现。"),
        ]
    },
    {
        "title": "{char}做蛋糕",
        "cover": "🎂",
        "pages": [
            ("{cemoji}", "{char}想做一个蛋糕。"),
            ("🥚", "它准备了鸡蛋、面粉和糖。"),
            ("🥣", "它把所有材料搅在一起。"),
            ("🔥", "放进烤箱，等呀等。"),
            ("🎉", "蛋糕做好了，好香好香！"),
        ]
    },
    {
        "title": "{char}的魔法",
        "cover": "🪄",
        "pages": [
            ("{cemoji}", "{char}发现了一根魔法棒。"),
            ("🪄", "它挥一挥，变出了一朵花。"),
            ("✨", "再挥一挥，变出了一只蝴蝶。"),
            ("🌟", "它用魔法帮助了{place}的小动物。"),
            ("💖", "大家都说{char}是善良的小魔法师。"),
        ]
    },
    {
        "title": "{char}摘果子",
        "cover": "🍎",
        "pages": [
            ("{cemoji}", "{char}去{place}摘果子。"),
            ("🌳", "树上挂满了红红的苹果。"),
            ("🧺", "{char}摘了满满一篮子。"),
            ("😋", "它咬了一口，好甜好甜。"),
            ("🏠", "它带回家和妈妈一起分享。"),
        ]
    },
    {
        "title": "{char}不怕困难",
        "cover": "💪",
        "pages": [
            ("{cemoji}", "{char}遇到了一个难题。"),
            ("🤔", "它想了很久，不知道怎么办。"),
            ("💪", "它告诉自己不要放弃。"),
            ("✅", "它试了一次又一次，终于成功了！"),
            ("🏆", "{char}明白了坚持就是胜利。"),
        ]
    },
    {
        "title": "{char}看日落",
        "cover": "🌇",
        "pages": [
            ("{cemoji}", "{char}在{place}看日落。"),
            ("🌅", "太阳慢慢落下去了。"),
            ("🌇", "天空变成了橙色和红色。"),
            ("🌙", "月亮升起来了。"),
            ("😌", "{char}觉得日落好美。"),
        ]
    },
    {
        "title": "{char}的万圣节",
        "cover": "🎃",
        "pages": [
            ("{cemoji}", "今天是万圣节！"),
            ("🎃", "{char}刻了一个南瓜灯。"),
            ("👻", "它穿上了有趣的服装。"),
            ("🍬", "它去敲门：不给糖就捣蛋！"),
            ("🥳", "{char}收获了好多好多糖果！"),
        ]
    },
    {
        "title": "{char}和风筝",
        "cover": "🪁",
        "pages": [
            ("{cemoji}", "{char}有一个漂亮的风筝。"),
            ("{pemoji}", "它来到{place}放风筝。"),
            ("💨", "风呼呼地吹，风筝飞得高高的。"),
            ("🪁", "风筝在天上像一只小鸟。"),
            ("😄", "{char}拉着线跑呀跑，真开心！"),
        ]
    },
    {
        "title": "{char}的旅行",
        "cover": "🧳",
        "pages": [
            ("{cemoji}", "{char}要去旅行啦！"),
            ("🧳", "它收拾好行李，出发了。"),
            ("🚂", "它坐上火车，看窗外风景。"),
            ("🏝️", "它来到美丽的{place}。"),
            ("📸", "{char}拍了好多照片，真难忘！"),
        ]
    },
    {
        "title": "{char}学游泳",
        "cover": "🏊",
        "pages": [
            ("{cemoji}", "{char}想学游泳。"),
            ("🏊", "它来到{place}的泳池。"),
            ("💧", "它扑通跳进水里。"),
            ("🏊", "它学会了蹬腿和划水。"),
            ("🏆", "{char}终于学会游泳了！"),
        ]
    },
    {
        "title": "{char}捡到宝",
        "cover": "💎",
        "pages": [
            ("{cemoji}", "{char}在{place}散步。"),
            ("✨", "它看到地上有个东西在发光。"),
            ("💎", "原来是一颗漂亮的宝石！"),
            ("🤔", "{char}想：这是谁掉的呢？"),
            ("🤝", "它找到了失主，把宝石还了回去。"),
        ]
    },
    {
        "title": "{char}的节日",
        "cover": "🎉",
        "pages": [
            ("{cemoji}", "{place}要举办节日庆典。"),
            ("🎊", "到处挂满了彩旗和灯笼。"),
            ("🎵", "大家唱歌跳舞。"),
            ("🍱", "有好吃的食物和好玩的。"),
            ("🥳", "{char}度过了快乐的一天。"),
        ]
    },
    {
        "title": "{char}变小了",
        "cover": "🔍",
        "pages": [
            ("{cemoji}", "一天早上{char}发现自己变小了！"),
            ("🐜", "它变得和蚂蚁一样小。"),
            ("🍃", "草丛像大森林一样。"),
            ("💧", "一滴水珠像大海。"),
            ("✨", "突然它又变回来了，原来是做梦！"),
        ]
    },
    {
        "title": "{char}做饼干",
        "cover": "🍪",
        "pages": [
            ("{cemoji}", "{char}想做饼干。"),
            ("🥛", "它准备了面粉、黄油和糖。"),
            ("🍪", "它用模具压出各种形状。"),
            ("🔥", "放进烤箱，香喷喷的味道。"),
            ("😋", "饼干做好了，{char}开心地吃了起来。"),
        ]
    },
    {
        "title": "{char}和风",
        "cover": "🌬️",
        "pages": [
            ("{cemoji}", "{char}在{place}感受风。"),
            ("🍃", "微风轻轻吹，树叶沙沙响。"),
            ("🌬️", "大风吹来了，{char}的帽子飞走了！"),
            ("🏃", "{char}追呀追，追回了帽子。"),
            ("😄", "风真调皮，{char}笑着回家了。"),
        ]
    },
    {
        "title": "{char}的春天",
        "cover": "🌸",
        "pages": [
            ("🌸", "春天来了，{place}变美了。"),
            ("{cemoji}", "{char}出来看春天。"),
            ("🌱", "小草绿了，花也开了。"),
            ("🐝", "蜜蜂忙着采蜜。"),
            ("☀️", "{char}说：春天真好！"),
        ]
    },
    {
        "title": "{char}做朋友",
        "cover": "💖",
        "pages": [
            ("{cemoji}", "{char}搬到了新的{place}。"),
            ("😢", "它一个人都不认识，有点难过。"),
            ("👋", "它鼓起勇气和大家打招呼。"),
            ("🤝", "小伙伴们都来欢迎它。"),
            ("😄", "{char}交到了好多新朋友！"),
        ]
    },
    {
        "title": "{char}看云",
        "cover": "☁️",
        "pages": [
            ("{cemoji}", "{char}躺在{place}看云。"),
            ("☁️", "一朵云像棉花糖。"),
            ("🐰", "一朵云像小兔子。"),
            ("🏰", "一朵云像大城堡。"),
            ("😌", "{char}看着云，慢慢睡着了。"),
        ]
    },
    {
        "title": "{char}的音乐会",
        "cover": "🎵",
        "pages": [
            ("{cemoji}", "{char}要办一场音乐会。"),
            ("🎺", "它吹小号，咚咚咚。"),
            ("🥁", "它打鼓，铛铛铛。"),
            ("🎹", "它弹钢琴，叮叮叮。"),
            ("👏", "大家都来听，掌声好响亮！"),
        ]
    },
    {
        "title": "{char}的秋天",
        "cover": "🍂",
        "pages": [
            ("🍂", "秋天到了，{place}的树叶变黄了。"),
            ("{cemoji}", "{char}踩着落叶散步。"),
            ("🌰", "它捡了好多栗子和松果。"),
            ("🍁", "枫叶红红的，好漂亮。"),
            ("🏠", "{char}带着秋天的礼物回家了。"),
        ]
    },
    {
        "title": "{char}找妈妈",
        "cover": "💕",
        "pages": [
            ("{cemoji}", "{char}在{place}找不到妈妈了。"),
            ("😢", "它着急地走来走去。"),
            ("🦆", "它问鸭子：你看到我妈妈了吗？"),
            ("👆", "鸭子说：你妈妈在那边！"),
            ("💖", "{char}找到妈妈，紧紧抱住她。"),
        ]
    },
    {
        "title": "{char}和影子",
        "cover": "🌑",
        "pages": [
            ("{cemoji}", "{char}发现了自己的影子。"),
            ("🌑", "影子跟着它走，它走影子也走。"),
            ("🏃", "它跑，影子也跑。"),
            ("🤔", "{char}想：影子是我的好朋友。"),
            ("😊", "它和影子玩了一下午。"),
        ]
    },
    {
        "title": "{char}种树",
        "cover": "🌳",
        "pages": [
            ("{cemoji}", "{char}想种一棵树。"),
            ("🌰", "它找到一颗种子，挖了个坑。"),
            ("💧", "它每天浇水。"),
            ("🌱", "小树苗长出来了！"),
            ("🌳", "小树越长越大，{char}好骄傲。"),
        ]
    },
    {
        "title": "{char}的冬天",
        "cover": "❄️",
        "pages": [
            ("❄️", "冬天来了，{place}白白的。"),
            ("{cemoji}", "{char}穿上厚衣服出去玩。"),
            ("⛸️", "它在冰上滑来滑去。"),
            ("🔥", "回家围在火炉旁边。"),
            ("☕", "喝一杯热可可，暖暖的。"),
        ]
    },
    {
        "title": "{char}当医生",
        "cover": "💊",
        "pages": [
            ("{cemoji}", "{char}当起了小医生。"),
            ("🩺", "它给小熊量体温。"),
            ("💊", "它给小鸟开了药。"),
            ("🤒", "它照顾生病的小猪。"),
            ("💕", "大家都好了，{char}是好医生！"),
        ]
    },
    {
        "title": "{char}的宝藏",
        "cover": "🗺️",
        "pages": [
            ("{cemoji}", "{char}找到了一张藏宝图。"),
            ("🗺️", "它按照地图走到{place}。"),
            ("🔍", "它找了又找，挖了又挖。"),
            ("💰", "它找到了一箱金币！"),
            ("🤝", "{char}把宝藏分给了大家。"),
        ]
    },
]

# ============ 生成绘本 ============
random.seed(42)  # 固定随机种子，保证每次生成一致

# 从「模板×角色×场景」全组合中随机均匀抽样，保证 3000 本覆盖全部模板/角色/场景类型
# （顺序遍历只会覆盖前几个模板，故事类型太单一）
combos = [(t, c, p) for t in TEMPLATES for c in CHARS for p in PLACES]
random.shuffle(combos)

books = []
seen_titles = set()
max_books = 3000

for tpl, (cname, cemoji), (pname, pemoji) in combos:
    if len(books) >= max_books:
        break
    base = tpl["title"].replace("{char}", cname).replace("{place}", pname)
    title = base
    if title in seen_titles:
        # 模板标题不含场景（如「小鸭和彩虹」）：用场景名做后缀区分，标题更自然且唯一
        title = base + "（" + pname + "）"
        if title in seen_titles:
            continue
    seen_titles.add(title)
    pages = []
    for emoji_pat, text_pat in tpl["pages"]:
        emoji = emoji_pat.replace("{cemoji}", cemoji).replace("{pemoji}", pemoji)
        text = text_pat.replace("{char}", cname).replace("{place}", pname)
        pages.append({"emoji": emoji, "text": text})
    books.append({
        "title": title,
        "cover": tpl["cover"],
        "pages": pages
    })

print(f"Generated {len(books)} books (sampled from {len(combos)} combos = {len(TEMPLATES)} templates x {len(CHARS)} chars x {len(PLACES)} places)")

# 如果不足 3000，用随机组合补充
if len(books) < max_books:
    extra = max_books - len(books)
    for i in range(extra):
        tpl = random.choice(TEMPLATES)
        cname, cemoji = random.choice(CHARS)
        pname, pemoji = random.choice(PLACES)
        title = tpl["title"].replace("{char}", cname).replace("{place}", pname) + f"（第{i+2}季）"
        if title in seen_titles:
            continue
        seen_titles.add(title)
        pages = []
        for emoji_pat, text_pat in tpl["pages"]:
            emoji = emoji_pat.replace("{cemoji}", cemoji).replace("{pemoji}", pemoji)
            text = text_pat.replace("{char}", cname).replace("{place}", pname)
            pages.append({"emoji": emoji, "text": text})
        books.append({"title": title, "cover": tpl["cover"], "pages": pages})

print(f"Final book count: {len(books)}")

# ============ 输出 JS 文件 ============
lines = ["/* 绘本库 - 自动生成，共 %d 本 */" % len(books)]
lines.append("/* 由 gen_books.py 生成，基于模板+角色+场景组合 */")
lines.append(";(function(){")
lines.append("  var extra = [")
for b in books:
    pages_js = ",".join(
        '{emoji:"%s",text:"%s"}' % (
            p["emoji"].replace('"', '\\"'),
            p["text"].replace('"', '\\"').replace("\n", "")
        )
        for p in b["pages"]
    )
    lines.append('    {title:"%s",cover:"%s",pages:[%s]},' % (
        b["title"].replace('"', '\\"'),
        b["cover"].replace('"', '\\"'),
        pages_js
    ))
lines.append("  ];")
lines.append("  if (window.Data && window.Data.BOOKS) {")
lines.append("    var existing = new Set(window.Data.BOOKS.map(function(b){return b.title}));")
lines.append("    extra.forEach(function(b){ if(!existing.has(b.title)) window.Data.BOOKS.push(b); });")
lines.append("  }")
lines.append("})();")

outpath = os.path.join(ROOT, "assets", "books_data.js")
with open(outpath, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print(f"Written: {outpath} ({len(lines)} lines, {len(books)} books)")
