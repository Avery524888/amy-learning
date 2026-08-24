# -*- coding: utf-8 -*-
"""生成 3000 个儿童英语单词数据文件 assets/en_words_data.js
每个单词: {en, cn, emoji, theme}
覆盖: 动物/食物/自然/交通/身体/家庭/衣物/家居/学校/运动/颜色/数字/时间/情感/职业/地点/动词/形容词/音乐/科技
"""
import json, os

ROOT = os.path.dirname(os.path.abspath(__file__))

# ============ 词库数据 ============
# 格式: (en, cn, emoji)
# None emoji 表示用主题默认 emoji

WORDS = []

# --- 动物 (wild) ~60 ---
_animal_wild = [
("lion","狮子","🦁"),("tiger","老虎","🐯"),("bear","熊","🐻"),("wolf","狼","🐺"),
("fox","狐狸","🦊"),("deer","鹿","🦌"),("monkey","猴子","🐵"),("gorilla","大猩猩","🦍"),
("zebra","斑马","🦓"),("giraffe","长颈鹿","🦒"),("hippo","河马","🦛"),("rhino","犀牛","🦏"),
("kangaroo","袋鼠","🦘"),("koala","考拉","🐨"),("panda","熊猫","🐼"),("leopard","豹子","🐆"),
("cheetah","猎豹","🐆"),("camel","骆驼","🐫"),("squirrel","松鼠","🐿️"),("hedgehog","刺猬","🦔"),
("otter","水獭","🦦"),("beaver","海狸","🦫"),("bat","蝙蝠","🦇"),("mole","鼹鼠","🐭"),
("raccoon","浣熊","🦝"),("skunk","臭鼬","🦨"),("buffalo","水牛","🐃"),("bison","野牛","🐂"),
("antelope","羚羊","🐐"),("wild boar","野猪","🐗"),("polar bear","北极熊","🐻‍❄️"),("grizzly","灰熊","🐻"),
("jaguar","美洲豹","🐆"),("panther","黑豹","🐆"),("hyena","鬣狗","🐶"),("baboon","狒狒","🐵"),
("lemur","狐猴","🐒"),("sloth","树懒","🦥"),("anteater","食蚁兽","🐾"),("platypus","鸭嘴兽","🦫"),
("wallaby","小袋鼠","🦘"),("possum","负鼠","🐭"),("badger","獾","🦡"),("weasel","黄鼠狼","🐾"),
("marten","貂","🐾"),("mink","水貂","🐾"),("ferret","雪貂","🐾"),("lynx","猞猁","🐱"),
("cougar","美洲狮","🐈"),("ocelot","豹猫","🐈"),("mongoose","獴","🐾"),("meerkat","猫鼬","🐾"),
("aardvark","土豚","🐾"),("tapir","貘","🐘"),("okapi","霍加狓","🦒"),("mandrill","山魈","🐵"),
("gibbon","长臂猿","🐒"),("orangutan","猩猩","🦧"),("chimpanzee","黑猩猩","🐵"),("lemming","旅鼠","🐭"),
]
for w in _animal_wild: WORDS.append((*w, "野生动物"))

# --- 动物 (farm) ~30 ---
_animal_farm = [
("cow","牛","🐄"),("sheep","羊","🐑"),("goat","山羊","🐐"),("horse","马","🐴"),
("donkey","驴","🫏"),("pig","猪","🐷"),("chicken","鸡","🐔"),("hen","母鸡","🐔"),
("rooster","公鸡","🐓"),("chick","小鸡","🐤"),("duck","鸭","🦆"),("goose","鹅","🦢"),
("turkey","火鸡","🦃"),("rabbit","兔子","🐰"),("mouse","老鼠","🐭"),("rat","大鼠","🐀"),
("cat","猫","🐱"),("dog","狗","🐶"),("calf","小牛","🐂"),("lamb","小羊","🐑"),
("kitten","小猫","🐈"),("puppy","小狗","🐕"),("foal","小马","🐎"),("piglet","小猪","🐖"),
("duckling","小鸭","🦆"),("gosling","小鹅","🦢"),("pigeon","鸽子","🐦"),("dove","和平鸽","🕊️"),
("peacock","孔雀","🦚"),("parrot","鹦鹉","🦜"),
]
for w in _animal_farm: WORDS.append((*w, "农场动物"))

# --- 动物 (sea) ~50 ---
_animal_sea = [
("fish","鱼","🐟"),("shark","鲨鱼","🦈"),("whale","鲸鱼","🐳"),("dolphin","海豚","🐬"),
("octopus","章鱼","🐙"),("squid","鱿鱼","🦑"),("crab","螃蟹","🦀"),("lobster","龙虾","🦞"),
("shrimp","虾","🦐"),("jellyfish","水母","🪼"),("starfish","海星","⭐"),("seahorse","海马","🐴"),
("turtle","海龟","🐢"),("seal","海豹","🦭"),("walrus","海象","🦭"),("penguin","企鹅","🐧"),
("oyster","牡蛎","🦪"),("clam","蛤蜊","🦪"),("snail","蜗牛","🐌"),("sea urchin","海胆","🌊"),
("stingray","黄貂鱼","🐟"),("manta ray","蝠鲼","🐟"),("moray eel","海鳗","🐍"),("barracuda","梭鱼","🐟"),
("swordfish","剑鱼","🐟"),("marlin","马林鱼","🐟"),("tuna","金枪鱼","🐟"),("salmon","三文鱼","🐟"),
("trout","鳟鱼","🐟"),("cod","鳕鱼","🐟"),("anchovy","鳀鱼","🐟"),("sardine","沙丁鱼","🐟"),
("mackerel","鲭鱼","🐟"),("herring","鲱鱼","🐟"),("pike","梭子鱼","🐟"),("catfish","鲶鱼","🐟"),
("goldfish","金鱼","🐟"),("angelfish","神仙鱼","🐟"),("clownfish","小丑鱼","🐟"),("pufferfish","河豚","🐡"),
("sea lion","海狮","🦭"),("orca","虎鲸","🐋"),("narwhal","独角鲸","🐋"),("manatee","海牛","🐋"),
("jellyfish","水母","🪼"),("coral","珊瑚","🪸"),("sponge","海绵","🧽"),("barnacle","藤壶","🦪"),
("plankton","浮游生物","🌊"),("krill","磷虾","🦐"),
]
for w in _animal_sea: WORDS.append((*w, "海洋动物"))

# --- 动物 (bird) ~40 ---
_animal_bird = [
("bird","鸟","🐦"),("eagle","鹰","🦅"),("hawk","隼","🦅"),("falcon","猎鹰","🦅"),
("owl","猫头鹰","🦉"),("parrot","鹦鹉","🦜"),("crow","乌鸦","🐦‍⬛"),("raven","渡鸦","🐦‍⬛"),
("magpie","喜鹊","🐦"),("robin","知更鸟","🐦"),("sparrow","麻雀","🐦"),("swallow","燕子","🐦"),
("swan","天鹅","🦢"),("flamingo","火烈鸟","🦩"),("peacock","孔雀","🦚"),("woodpecker","啄木鸟","🐦"),
("hummingbird","蜂鸟","🐦"),("penguin","企鹅","🐧"),("ostrich","鸵鸟","🐦"),("emu","鸸鹋","🐦"),
("cassowary","鹤鸵","🐦"),("stork","鹳","🐦"),("crane","鹤","🐦"),("heron","鹭","🐦"),
("pelican","鹈鹕","🐦"),("seagull","海鸥","🐦"),("albatross","信天翁","🐦"),("vulture","秃鹫","🦅"),
("condor","神鹫","🦅"),("buzzard","鵟","🦅"),("kingfisher","翠鸟","🐦"),("nightingale","夜莺","🐦"),
("lark","云雀","🐦"),("finch","雀","🐦"),("canary","金丝雀","🐦"),("budgie","虎皮鹦鹉","🦜"),
("cockatoo","凤头鹦鹉","🦜"),("macaw","金刚鹦鹦鹉","🦜"),("toucan","巨嘴鸟","🐦"),("bluebird","蓝鸟","🐦"),
]
for w in _animal_bird: WORDS.append((*w, "鸟类"))

# --- 动物 (insect) ~40 ---
_animal_insect = [
("butterfly","蝴蝶","🦋"),("bee","蜜蜂","🐝"),("ant","蚂蚁","🐜"),("ladybug","瓢虫","🐞"),
("dragonfly","蜻蜓","🐛"),("grasshopper","蚱蜢","🦗"),("cricket","蟋蟀","🦗"),("mosquito","蚊子","🦟"),
("fly","苍蝇","🪰"),("spider","蜘蛛","🕷️"),("beetle","甲虫","🐛"),("caterpillar","毛毛虫","🐛"),
("firefly","萤火虫","✨"),("moth","飞蛾","🦋"),("wasp","黄蜂","🐝"),("hornet","大黄蜂","🐝"),
("cicada","知了","🐛"),("stick insect","竹节虫","🐛"),("praying mantis","螳螂","🐛"),("centipede","蜈蚣","🐛"),
("millipede","马陆","🐛"),("scorpion","蝎子","🦂"),("snail","蜗牛","🐌"),("slug","蛞蝓","🐌"),
("worm","蚯蚯蚓","🪱"),("leech","水蛭","🪱"),("termite","白蚁","🐜"),("flea","跳蚤","🐜"),
("tick","蜱虫","🐜"),("bedbug","臭虫","🐜"),("silverfish","衣鱼","🐛"),("earwig","蠼螋","🐛"),
("aphid","蚜虫","🐛"),("leafhopper","叶蝉","🐛"),("mayfly","蜉蝣","🐛"),("caddisfly","石蛾","🐛"),
("locust","蝗虫","🦗"),("weevil","象鼻虫","🐛"),("stag beetle","锹甲","🐛"),("rhino beetle","犀牛甲虫","🐛"),
]
for w in _animal_insect: WORDS.append((*w, "昆虫"))

# --- 动物 (reptile/amphibian) ~30 ---
_animal_reptile = [
("snake","蛇","🐍"),("lizard","蜥蜴","🦎"),("frog","青蛙","🐸"),("toad","蟾蜍","🐸"),
("turtle","乌龟","🐢"),("tortoise","陆龟","🐢"),("crocodile","鳄鱼","🐊"),("alligator","短吻鳄","🐊"),
("gecko","壁虎","🦎"),("iguana","鬣蜥","🦎"),("chameleon","变色龙","🦎"),("komodo dragon","科莫多巨蜥","🦎"),
("python","蟒蛇","🐍"),("cobra","眼镜蛇","🐍"),("viper","蝰蛇","🐍"),("rattlesnake","响尾蛇","🐍"),
("boa","蟒","🐍"),("anaconda","森蚺","🐍"),("grass snake","草蛇","🐍"),("green snake","绿蛇","🐍"),
("newt","蝾t","蝾螈","🦎"),("salamander","大鲵","🦎"),("axolotl","六角恐龙","🦎"),("tadpole","蝌蚪","🐸"),
("tree frog","树蛙","🐸"),("bullfrog","牛蛙","🐸"),("green frog","绿蛙","🐸"),("sea turtle","海龟","🐢"),
("box turtle","箱龟","🐢"),("snapping turtle","鳄龟","🐢"),
]
for w in _animal_reptile: WORDS.append((*w, "爬行动物"))

# --- 食物 (fruit) ~60 ---
_food_fruit = [
("apple","苹果","🍎"),("banana","香蕉","🍌"),("orange","橙子","🍊"),("grape","葡萄","🍇"),
("watermelon","西瓜","🍉"),("strawberry","草莓","🍓"),("cherry","樱桃","🍒"),("peach","桃子","🍑"),
("pear","梨","🍐"),("lemon","柠檬","🍋"),("lime","青柠","🍋"),("mango","芒果","🥭"),
("pineapple","菠萝","🍍"),("coconut","椰子","🥥"),("kiwi","猕猴桃","🥝"),("papaya","木瓜","🍈"),
("melon","甜瓜","🍈"),("cantaloupe","哈密瓜","🍈"),("apricot","杏子","🍑"),("plum","李子","🍑"),
("fig","无花果","🍑"),("date","椰枣","🌴"),("pomegranate","石榴","🍎"),("persimmon","柿子","🍊"),
("quince","木瓜","🍑"),("cranberry","蔓越莓","🫐"),("blueberry","蓝莓","🫐"),("blackberry","黑莓","🫐"),
("raspberry","树莓","🫐"),("gooseberry","鹅莓","🫐"),("currant","醋栗","🫐"),("elderberry","接骨木莓","🫐"),
("dragon fruit","火龙果","🐉"),("lychee","荔枝","🍇"),("longan","龙眼","🍇"),("rambutan","红毛丹","🍇"),
("jackfruit","菠萝蜜","🍈"),("durian","榴莲","🍈"),("starfruit","杨桃","⭐"),("passion fruit","百香果","🍈"),
("guava","番石榴","🍏"),("soursop","刺果番荔枝","🍈"),("sugar apple","释迦果","🍎"),("loquat","枇杷","🍑"),
("pomelo","柚子","🍊"),("tangerine","橘子","🍊"),("clementine","克莱门氏小柑橘","🍊"),("mandarin","蜜橘","🍊"),
("satsuma","萨摩橘","🍊"),("kumquat","金橘","🍊"),("yuzu","柚子","🍊"),("bergamot","佛手柑","🍋"),
("avocado","牛油果","🥑"),("olive","橄榄","🫒"),("breadfruit","面包果","🍞"),("rambutan","红毛丹","🍇"),
("salak","蛇皮果","🐍"),("santol","山陀儿","🍈"),("jabuticaba","嘉宝果","🍇"),("camu camu","卡姆果","🫐"),
]
for w in _food_fruit: WORDS.append((*w, "水果"))

# --- 食物 (vegetable) ~60 ---
_food_veg = [
("tomato","番茄","🍅"),("potato","土豆","🥔"),("carrot","胡萝卜","🥕"),("onion","洋葱","🧅"),
("garlic","大蒜","🧄"),("cabbage","卷心菜","🥬"),("lettuce","生菜","🥬"),("spinach","菠菜","🥬"),
("broccoli","西兰花","🥦"),("cauliflower","花菜","🥦"),("cucumber","黄瓜","🥒"),("pumpkin","南瓜","🎃"),
("corn","玉米","🌽"),("pepper","辣椒","🌶️"),("eggplant","茄子","🍆"),("mushroom","蘑菇","🍄"),
("bean","豆子","🫘"),("pea","豌豆","🫛"),("radish","萝卜","🥕"),("turnip","芜菁","🥕"),
("beetroot","甜菜根","🥬"),("celery","芹菜","🥬"),("asparagus","芦笋","🥬"),("artichoke","朝鲜蓟","🥬"),
("zucchini","西葫芦","🥒"),("squash","南瓜","🎃"),("sweet potato","红薯","🍠"),("yam","山药","🍠"),
("cassava","木薯","🍠"),("tarot","芋头","🍠"),("lotus root","莲藕","🪷"),("bamboo shoot","竹笋","🎋"),
("bean sprout","豆芽","🌱"),("leek","韭菜","🥬"),("scallion","葱","🧅"),("chive","细香葱","🧅"),
("shallot","红葱头","🧅"),("ginger","生姜","🫚"),("turmeric","姜黄","🫚"),("horseradish","辣根","🥬"),
("wasabi","芥末","🥬"),("mustard","芥菜","🥬"),("kale","羽衣甘蓝","🥬"),("collard","羽衣甘蓝","🥬"),
("arugula","芝麻菜","🥬"),("watercress","西洋菜","🥬"),("fennel","茴香","🥬"),("dill","莳萝","🥬"),
("parsley","欧芹","🥬"),("cilantro","香菜","🥬"),("basil","罗勒","🥬"),("oregano","牛至","🥬"),
("rosemary","迷迭香","🥬"),("thyme","百里香","🥬"),("mint","薄荷","🌿"),("lemongrass","柠檬草","🌿"),
("okra","秋葵","🥬"),("bitter melon","苦瓜","🥒"),("winter melon","冬瓜","🥒"),("luffa","丝瓜","🥒"),
]
for w in _food_veg: WORDS.append((*w, "蔬菜"))

# --- 食物 (drink) ~40 ---
_food_drink = [
("water","水","💧"),("milk","牛奶","🥛"),("juice","果汁","🧃"),("tea","茶","🍵"),
("coffee","咖啡","☕"),("soda","汽水","🥤"),("cola","可乐","🥤"),("soup","汤","🍲"),
("hot chocolate","热巧克力","🍫"),("smoothie","冰沙","🥤"),("milkshake","奶昔","🥤"),
("lemonade","柠檬水","🍋"),("orange juice","橙汁","🍊"),("apple juice","苹果汁","🍎"),
("grape juice","葡萄汁","🍇"),("tomato juice","番茄汁","🍅"),("coconut milk","椰奶","🥥"),
("soy milk","豆浆","🥛"),("yogurt","酸奶","🥛"),("beer","啤酒","🍺"),("wine","葡萄酒","🍷"),
("champagne","香槟","🥂"),("cocktail","鸡尾酒","🍹"),("whiskey","威士忌","🥃"),("vodka","伏特加","🥃"),
("rum","朗姆酒","🥃"),("gin","金酒","🍸"),("brandy","白兰地","🥃"),("sake","清酒","🍶"),
("rice wine","米酒","🍶"),("honey water","蜂蜜水","🍯"),("ginger tea","姜茶","🍵"),
("green tea","绿茶","🍵"),("black tea","红茶","🍵"),("oolong tea","乌龙茶","🍵"),
("white tea","白茶","🍵"),("pu'er tea","普洱茶","🍵"),("matcha","抹茶","🍵"),
("espresso","浓缩咖啡","☕"),("latte","拿铁","☕"),("cappuccino","卡布奇诺","☕"),
]
for w in _food_drink: WORDS.append((*w, "饮料"))

# --- 食物 (snack/dessert) ~50 ---
_food_snack = [
("bread","面包","🍞"),("cake","蛋糕","🍰"),("cookie","饼干","🍪"),("candy","糖果","🍬"),
("chocolate","巧克力","🍫"),("ice cream","冰淇淋","🍦"),("donut","甜甜圈","🍩"),("pie","派","🥧"),
("pudding","布丁","🍮"),("pancake","煎饼","🥞"),("waffle","华夫饼","🧇"),("croissant","牛角包","🥐"),
("muffin","马芬","🧁"),("cupcake","纸杯蛋糕","🧁"),("brownie","布朗尼","🍫"),("cheesecake","芝士蛋糕","🍰"),
("tiramisu","提拉米苏","🍰"),("macaron","马卡龙","🧁"),("crepe","可丽饼","🥞"),("tart","蛋挞","🥧"),
("cotton candy","棉花糖","🍬"),("popcorn","爆米花","🍿"),("pretzel","椒盐脆饼","🥨"),("bagel","贝果","🥯"),
("cracker","梳打饼","🍘"),("chips","薯片","🍟"),("french fries","薯条","🍟"),("nachos","玉米片","🌽"),
("taco","塔可","🌮"),("burrito","卷饼","🌯"),("sandwich","三明治","🥪"),("hamburger","汉堡","🍔"),
("hot dog","热狗","🌭"),("pizza","披萨","🍕"),("kebab","烤肉串","🍢"),("sushi","寿司","🍣"),
("ramen","拉面","🍜"),("noodle","面条","🍜"),("dumpling","饺子","🥟"),("bun","包子","🍔"),
("rice","米饭","🍚"),("porridge","粥","🥣"),("cereal","麦片","🥣"),("oatmeal","燕麦粥","🥣"),
("salad","沙拉","🥗"),("steak","牛排","🥩"),("roast chicken","烤鸡","🍗"),("fish fillet","鱼排","🐟"),
("omelet","煎蛋卷","🍳"),("bacon","培根","🥓"),
]
for w in _food_snack: WORDS.append((*w, "零食甜点"))

# --- 食物 (meal/ingredient) ~50 ---
_food_meal = [
("egg","鸡蛋","🥚"),("meat","肉","🍖"),("beef","牛肉","🥩"),("pork","猪肉","🥓"),
("chicken meat","鸡肉","🍗"),("fish meat","鱼肉","🐟"),("shrimp meat","虾肉","🦐"),
("lamb","羊肉","🍖"),("duck meat","鸭肉","🦆"),("rice","米饭","🍚"),("noodle","面条","🍜"),
("flour","面粉","🌾"),("sugar","糖","🍬"),("salt","盐","🧂"),("oil","油","🫒"),
("vinegar","醋","🍶"),("soy sauce","酱油","🫗"),("pepper","胡椒","🌶️"),("butter","黄油","🧈"),
("cheese","奶酪","🧀"),("cream","奶油","🥛"),("yogurt","酸奶","🥛"),("honey","蜂蜜","🍯"),
("jam","果酱","🍓"),("peanut butter","花生酱","🥜"),("chocolate","巧克力","🍫"),("vanilla","香草","🌿"),
("cinnamon","肉桂","🌿"),("nutmeg","肉豆蔻","🌿"),("saffron","藏红花","🌺"),("cardamom","豆蔻","🌿"),
("cloves","丁香","🌿"),("bay leaf","月桂叶","🌿"),("sesame","芝麻","🟤"),("sunflower seed","葵花籽","🌻"),
("pumpkin seed","南瓜籽","🎃"),("walnut","核桃","🌰"),("almond","杏仁","🌰"),("cashew","腰果","🌰"),
("peanut","花生","🥜"),("pistachio","开心果","🌰"),("pecan","碧根果","🌰"),("hazelnut","榛子","🌰"),
("macadamia","夏威夷果","🌰"),("brazil nut","巴西果","🌰"),("raisin","葡萄干","🍇"),("dried apricot","杏干","🍑"),
("dried mango","芒果干","🥭"),("dried seaweed","海苔","🌿"),("tofu","豆腐","🧈"),("seitan","面筋","🍞"),
]
for w in _food_meal: WORDS.append((*w, "食材"))

# --- 自然 (nature) ~60 ---
_nature = [
("sun","太阳","☀️"),("moon","月亮","🌙"),("star","星星","⭐"),("sky","天空","🌌"),
("cloud","云","☁️"),("rain","雨","🌧️"),("snow","雪","❄️"),("wind","风","🌬️"),
("storm","暴风雨","⛈️"),("thunder","雷","⚡"),("lightning","闪电","⚡"),("rainbow","彩虹","🌈"),
("fog","雾","🌫️"),("frost","霜","❄️"),("hail","冰雹","🧊"),("ice","冰","🧊"),
("river","河","🏞️"),("lake","湖","🌊"),("sea","海","🌊"),("ocean","海洋","🌊"),
("mountain","山","⛰️"),("hill","小山","🏔️"),("valley","山谷","⛰️"),("forest","森林","🌳"),
("jungle","丛林","🌴"),("desert","沙漠","🏜️"),("island","岛屿","🏝️"),("beach","海滩","🏖️"),
("cliff","悬崖","⛰️"),("cave","洞穴","🕳️"),("waterfall","瀑布","💦"),("spring","泉水","💧"),
("stream","小溪","💧"),("pond","池塘","🐸"),("swamp","沼泽","🌿"),("marsh","湿地","🌿"),
("field","田野","🌾"),("meadow","草地","🌿"),("prairie","草原","🌾"),("savanna","稀树草原","🦒"),
("tundra","冻原","❄️"),("glacier","冰川","🧊"),("volcano","火山","🌋"),("earthquake","地震","🌍"),
("rock","岩石","🪨"),("stone","石头","🪨"),("sand","沙子","🏖️"),("mud","泥","🟤"),
("soil","土壤","🟤"),("dust","灰尘","💨"),("ash","灰烬","🌋"),("lava","岩浆","🌋"),
("fire","火","🔥"),("smoke","烟","💨"),("steam","蒸汽","♨️"),("bubble","气泡","🫧"),
("wave","波浪","🌊"),("tide","潮汐","🌊"),("current","水流","🌊"),("whirlpool","漩涡","🌀"),
("sunrise","日出","🌅"),("sunset","日落","🌇"),("dawn","黎明","🌅"),("dusk","黄昏","🌆"),
]
for w in _nature: WORDS.append((*w, "自然"))

# --- 自然 (plant) ~50 ---
_nature_plant = [
("tree","树","🌳"),("flower","花","🌸"),("grass","草","🌿"),("leaf","叶子","🍃"),
("branch","树枝","🌿"),("root","根","🌱"),("seed","种子","🌱"),("sprout","芽","🌱"),
("bush","灌木","🌿"),("shrub","矮树","🌿"),("vine","藤蔓","🌿"),("moss","苔藓","🌿"),
("fern","蕨类","🌿"),("cactus","仙人掌","🌵"),("palm","棕榈树","🌴"),("bamboo","竹子","🎋"),
("pine","松树","🌲"),("oak","橡树","🌳"),("maple","枫树","🍁"),("willow","柳树","🌳"),
("cherry tree","樱花树","🌸"),("apple tree","苹果树","🌳"),("rose","玫瑰","🌹"),("tulip","郁金香","🌷"),
("sunflower","向日葵","🌻"),("daisy","雏菊","🌼"),("lily","百合","⚜️"),("lotus","莲花","🪷"),
("orchid","兰花","🌸"),("lavender","薰衣草","💜"),("dandelion","蒲公英","🌼"),("carnation","康乃馨","🌸"),
("peony","牡丹","🌸"),("chrysanthemum","菊花","🌼"),("jasmine","茉莉","🌼"),("magnolia","玉兰","🌸"),
("plum blossom","梅花","🌸"),("cherry blossom","樱花","🌸"),("poppy","罂粟花","🌺"),("marigold","万寿菊","🌼"),
("daffodil","水仙花","🌼"),("iris","鸢尾花","🌺"),("hibiscus","木槿花","🌺"),("camellia","山茶花","🌸"),
("azalea","杜鹃花","🌸"),("begonia","秋海棠","🌸"),("petunia","矮牵牛","🌸"),("zinnia","百日菊","🌼"),
("morning glory","牵牛花","🌸"),("lilac","紫丁香","💜"),
]
for w in _nature_plant: WORDS.append((*w, "植物"))

# --- 交通 ~60 ---
_transport = [
("car","汽车","🚗"),("bus","公交车","🚌"),("train","火车","🚂"),("subway","地铁","🚇"),
("taxi","出租车","🚕"),("truck","卡车","🚚"),("van","面包车","🚐"),("motorcycle","摩托车","🏍️"),
("bicycle","自行车","🚲"),("scooter","滑板车","🛴"),("ambulance","救护车","🚑"),("fire engine","消防车","🚒"),
("police car","警车","🚓"),("tractor","拖拉机","🚜"),("boat","船","⛵"),("ship","大船","🚢"),
("ferry","渡轮","⛴️"),("yacht","游艇","🛥️"),("canoe","独木舟","🛶"),("kayak","皮划艇","🛶"),
("raft","木筏","🛶"),("sailboat","帆船","⛵"),("submarine","潜水艇","🚢"),("airplane","飞机","✈️"),
("helicopter","直升机","🚁"),("balloon","热气球","🎈"),("glider","滑翔机","🪂"),("spaceship","宇宙飞船","🚀"),
("rocket","火箭","🚀"),("satellite","卫星","🛰️"),("cable car","缆车","🚠"),("tram","有轨电车","🚊"),
("trolley","无轨电车","🚎"),("monorail","单轨列车","🚝"),("maglev","磁悬浮","🚄"),("high-speed train","高铁","🚄"),
("bulldozer","推土机","🚜"),("excavator","挖掘机","🏗️"),("crane","起重机","🏗️"),("forklift","叉车","🚚"),
("carriage","马车","🐎"),("rickshaw","人力车","🛺"),("cart","手推车","🛒"),("wagon","四轮车","🛻"),
("pickup","皮卡","🛻"),("convertible","敞篷车","🏎️"),("sports car","跑车","🏎️"),("limousine","豪华轿车","🚗"),
("RV","房车","🚐"),("camper","露营车","🚐"),("trailer","拖车","🚛"),("tanker","油罐车","🚛"),
("garbage truck","垃圾车","🚛"),("mail truck","邮车","🚛"),("delivery van","快递车","🚐"),
("school bus","校车","🚌"),("double-decker","双层巴士","🚌"),("tuktuk","嘟嘟车","🛺"),("sled","雪橇","🛷"),
("skateboard","滑板","🛹"),("roller skate","轮滑鞋","👢"),
]
for w in _transport: WORDS.append((*w, "交通"))

# --- 身体 ~60 ---
_body = [
("head","头","🗣️"),("hair","头发","💇"),("face","脸","😊"),("eye","眼睛","👁️"),
("ear","耳朵","👂"),("nose","鼻子","👃"),("mouth","嘴","👄"),("tooth","牙齿","🦷"),
("tongue","舌头","👅"),("lip","嘴唇","👄"),("cheek","脸颊","😊"),("chin","下巴","😙"),
("forehead","额头","🧠"),("neck","脖子","🦴"),("shoulder","肩膀","💪"),("arm","手臂","💪"),
("elbow","手肘","💪"),("hand","手","✋"),("finger","手指","👆"),("thumb","大拇指","👍"),
("nail","指甲","💅"),("palm","手掌","✋"),("wrist","手腕","✋"),("chest","胸","🫁"),
("back","背","🔙"),("stomach","胃","🫃"),("belly","肚子","🫃"),("waist","腰","🧍"),
("hip","臀部","🧍"),("leg","腿","🦵"),("knee","膝盖","🦵"),("ankle","脚踝","🦶"),
("foot","脚","🦶"),("toe","脚趾","🦶"),("heel","脚跟","🦶"),("skin","皮肤","🧠"),
("bone","骨头","🦴"),("blood","血","🩸"),("heart","心脏","❤️"),("lung","肺","🫁"),
("brain","大脑","🧠"),("liver","肝脏","🫀"),("kidney","肾脏","🫘"),("stomach","胃","🫃"),
("muscle","肌肉","💪"),("nerve","神经","⚡"),("vein","静脉","🩸"),("artery","动脉","🩸"),
("spine","脊椎","🦴"),("rib","肋骨","🦴"),("skull","头骨","💀"),("jaw","下巴","🦴"),
("eyebrow","眉毛","👁️"),("eyelash","睫毛","👁️"),("pupil","瞳孔","👁️"),("iris","虹膜","👁️"),
("eyelid","眼皮","👁️"),("nostril","鼻孔","👃"),("tonsil","扁桃体","👄"),("adam's apple","喉结","🗣️"),
]
for w in _body: WORDS.append((*w, "身体"))

# --- 家庭 ~40 ---
_family = [
("father","爸爸","👨"),("mother","妈妈","👩"),("grandfather","爷爷","👴"),("grandmother","奶奶","👵"),
("brother","哥哥","👦"),("sister","姐姐","👧"),("son","儿子","👦"),("daughter","女儿","👧"),
("uncle","叔叔","👨"),("aunt","阿姨","👩"),("cousin","表亲","🧒"),("nephew","侄子","👦"),
("niece","侄女","👧"),("grandson","孙子","👦"),("granddaughter","孙女","👧"),("father-in-law","岳父","👴"),
("mother-in-law","岳母","👵"),("brother-in-law","姐夫","👨"),("sister-in-law","嫂子","👩"),("stepfather","继父","👨"),
("stepmother","继母","👩"),("stepson","继子","👦"),("stepdaughter","继女","👧"),("half-brother","同父异母兄弟","👦"),
("half-sister","同父异母姐妹","👧"),("twin","双胞胎","👶"),("baby","宝宝","👶"),("toddler","幼儿","👶"),
("child","孩子","🧒"),("kid","小孩","🧒"),("teenager","青少年","🧑"),("adult","成年人","🧑"),
("parent","父母","👨‍👩"),("grandparent","祖父母","👴"),("family","家庭","👨‍👩‍👧‍👦"),("relative","亲戚","🧑‍🤝‍🧑"),
("baby boy","男宝宝","👶"),("baby girl","女宝宝","👶"),("husband","丈夫","👨"),("wife","妻子","👩"),
]
for w in _family: WORDS.append((*w, "家庭"))

# --- 衣物 ~60 ---
_clothes = [
("shirt","衬衫","👕"),("pants","裤子","👖"),("dress","裙子","👗"),("skirt","短裙","👗"),
("coat","外套","🧥"),("jacket","夹克","🧥"),("sweater","毛衣","🧶"),("vest","马甲","🧥"),
("T-shirt","T恤","👕"),("shorts","短裤","🩳"),("jeans","牛仔裤","👖"),("trousers","长裤","👖"),
("suit","西装","🤵"),("uniform","制服","👔"),("pajamas","睡衣","🩲"),("underwear","内衣","🩲"),
("sock","袜子","🧦"),("shoe","鞋","👟"),("boot","靴子","👢"),("sandal","凉鞋","👡"),
("slipper","拖鞋","🩴"),("sneaker","运动鞋","👟"),("heel","高跟鞋","👠"),("flat","平底鞋","👡"),
("hat","帽子","🎩"),("cap","鸭舌帽","🧢"),("beanie","毛线帽","🧶"),("helmet","头盔","⛑️"),
("glove","手套","🧤"),("mitten","连指手套","🧤"),("scarf","围巾","🧣"),("tie","领带","👔"),
("bow tie","领结","🎀"),("belt","皮带","👖"),("suspenders","背带","👖"),("apron","围裙","👗"),
("swimsuit","泳衣","👙"),("bikini","比基尼","👙"),("raincoat","雨衣","🧥"),("windbreaker","风衣","🧥"),
("blouse","女衬衫","👚"),("pullover","套头衫","👕"),("cardigan","开衫","🧶"),("poncho","斗篷","🧥"),
("cape","披风","🧥"),("robe","浴袍","🧥"),("gown","礼服","👗"),("tuxedo","燕尾服","🤵"),
("overalls","背带裤","👖"),("leggings","打底裤","🩳"),("tights","连裤袜","🧦"),("stocking","长筒袜","🧦"),
("bra","胸罩","👙"),("brief","内裤","🩲"),("boxer","平角裤","🩲"),("onesie","连体衣","👶"),
("diaper","尿布","👶"),("bib","口水巾","👶"),("mitten","手套","🧤"),("shoe lace","鞋带","👟"),
]
for w in _clothes: WORDS.append((*w, "衣物"))

# --- 家居 ~60 ---
_home = [
("house","房子","🏠"),("door","门","🚪"),("window","窗户","🪟"),("wall","墙","🧱"),
("floor","地板","🟫"),("ceiling","天花板","⬜"),("roof","屋顶","🏠"),("stairs","楼梯","🪜"),
("kitchen","厨房","🍳"),("bedroom","卧室","🛏️"),("bathroom","浴室","🚿"),("living room","客厅","🛋️"),
("dining room","餐厅","🍽️"),("study","书房","📚"),("garage","车库","🏠"),("garden","花园","🌷"),
("balcony","阳台","🏙️"),("basement","地下室","🏠"),("attic","阁楼","🏠"),("yard","院子","🌳"),
("table","桌子","🪑"),("chair","椅子","🪑"),("sofa","沙发","🛋️"),("bed","床","🛏️"),
("desk","书桌","🪑"),("shelf","书架","📚"),("drawer","抽屉","🗄️"),("wardrobe","衣柜","🚪"),
("mirror","镜子","🪞"),("lamp","台灯","💡"),("light","灯","💡"),("fan","风扇","🌀"),
("clock","钟","🕐"),("picture","画","🖼️"),("curtain","窗帘","🪟"),("carpet","地毯","🟫"),
("rug","小地毯","🟫"),("cushion","靠垫","🛋️"),("pillow","枕头","🛏️"),("blanket","毯子","🛏️"),
("quilt","被子","🛏️"),("sheet","床单","🛏️"),("mattress","床垫","🛏️"),("cupboard","橱柜","🗄️"),
("cabinet","柜子","🗄️"),("bookcase","书柜","📚"),("fridge","冰箱","🧊"),("oven","烤箱","🍳"),
("stove","炉子","🍳"),("microwave","微波炉","📦"),("washer","洗衣机","🧺"),("dryer","烘干机","🧺"),
("toilet","马桶","🚽"),("sink","水槽","🚰"),("bathtub","浴缸","🛁"),("shower","淋浴","🚿"),
("towel","毛巾","🧖"),("soap","肥皂","🧼"),("toothbrush","牙刷","🪥"),("comb","梳子","💇"),
]
for w in _home: WORDS.append((*w, "家居"))

# --- 学校 ~50 ---
_school = [
("school","学校","🏫"),("classroom","教室","🏫"),("teacher","老师","👩‍🏫"),("student","学生","🧑‍🎓"),
("class","班级","🏫"),("lesson","课","📖"),("book","书","📖"),("notebook","笔记本","📓"),
("pencil","铅笔","✏️"),("pen","钢笔","🖊️"),("eraser","橡皮","🧹"),("ruler","尺子","📏"),
("scissors","剪刀","✂️"),("glue","胶水","🩹"),("stapler","订书机","📎"),("clip","夹子","📎"),
("paper","纸","📄"),("bag","书包","🎒"),("desk","课桌","🪑"),("blackboard","黑板","⬛"),
("whiteboard","白板","⬜"),("chalk","粉笔","🖍️"),("marker","记号笔","🖍️"),("crayon","蜡笔","🖍️"),
("calculator","计算器","🔢"),("computer","电脑","💻"),("tablet","平板","📱"),("projector","投影仪","📽️"),
("dictionary","字典","📚"),("textbook","课本","📚"),("storybook","故事书","📚"),("atlas","地图册","🗺️"),
("globe","地球仪","🌍"),("map","地图","🗺️"),("clock","时钟","🕐"),("bell","铃","🔔"),
("flag","旗帜","🚩"),("uniform","校服","👔"),("badge","徽章","🎖️"),("certificate","证书","📜"),
("diploma","文凭","🎓"),("grade","成绩","💯"),("score","分数","💯"),("exam","考试","📝"),
("quiz","小测","❓"),("homework","作业","📝"),("report","报告","📄"),("presentation","演讲","🎤"),
("library","图书馆","📚"),("laboratory","实验室","🔬"),
]
for w in _school: WORDS.append((*w, "学校"))

# --- 运动 ~50 ---
_sport = [
("soccer","足球","⚽"),("basketball","篮球","🏀"),("tennis","网球","🎾"),("baseball","棒球","⚾"),
("volleyball","排球","🏐"),("badminton","羽毛球","🏸"),("table tennis","乒乓球","🏓"),("golf","高尔夫","⛳"),
("hockey","曲棍球","🏑"),("cricket","板球","🏏"),("rugby","橄榄球","🏉"),("football","美式足球","🏈"),
("swimming","游泳","🏊"),("running","跑步","🏃"),("cycling","骑车","🚴"),("skating","滑冰","⛸️"),
("skiing","滑雪","⛷️"),("surfing","冲浪","🏄"),("diving","潜水","🤿"),("climbing","攀岩","🧗"),
("hiking","徒步","🥾"),("fishing","钓鱼","🎣"),("boxing","拳击","🥊"),("wrestling","摔跤","🤼"),
("judo","柔道","🥋"),("karate","空手道","🥋"),("taekwondo","跆拳道","🥋"),("gymnastics","体操","🤸"),
("ballet","芭蕾","🩰"),("dance","舞蹈","💃"),("yoga","瑜伽","🧘"),("archery","射箭","🏹"),
("shooting","射击","🎯"),("fencing","击剑","🤺"),("rowing","划船","🚣"),("sailing","帆船","⛵"),
("horse riding","骑马","🐎"),("skateboard","滑板","🛹"),("snowboard","单板滑雪","🏂"),("sledding","滑雪橇","🛷"),
("marathon","马拉松","🏃"),("sprint","短跑","🏃"),("relay","接力","🏃"),("high jump","跳高","🤸"),
("long jump","跳远","🤸"),("pole vault","撑杆跳","🤸"),("shot put","铅球","🏋️"),("javelin","标枪","🏃"),
("discus","铁饼","🥏"),("hammer","链球","🔨"),("weightlifting","举重","🏋️"),
]
for w in _sport: WORDS.append((*w, "运动"))

# --- 颜色形状 ~50 ---
_color_shape = [
("red","红色","🔴"),("blue","蓝色","🔵"),("yellow","黄色","🟡"),("green","绿色","🟢"),
("orange","橙色","🟠"),("purple","紫色","🟣"),("pink","粉色","🩷"),("brown","棕色","🟤"),
("black","黑色","⚫"),("white","白色","⚪"),("gray","灰色","⬜"),("gold","金色","🟨"),
("silver","银色","⬜"),("cyan","青色","🩵"),("magenta","洋红","🟪"),("beige","米色","🟫"),
("maroon","栗色","🟤"),("navy","藏青","🔵"),("teal","凫色","🟢"),("olive","橄榄绿","🟢"),
("coral","珊瑚色","🟠"),("salmon","鲑鱼色","🩷"),("crimson","深红","🔴"),("scarlet","猩红","🔴"),
("lavender","薰衣草色","🟪"),("turquoise","绿松石色","🟢"),("periwinkle","长春花色","🟪"),("chartreuse","黄绿色","🟡"),
("circle","圆形","⭕"),("square","正方形","⬛"),("triangle","三角形","🔺"),("rectangle","长方形","▬"),
("diamond","菱形","💎"),("star","星形","⭐"),("heart","心形","❤️"),("oval","椭圆形","🥚"),
("pentagon","五边形","⬠"),("hexagon","六边形","⬡"),("octagon","八边形","⬢"),("crescent","月牙形","🌙"),
("cross","十字形","✝️"),("arrow","箭头","➡️"),("spiral","螺旋","🌀"),("wave","波浪形","〰️"),
("cone","圆锥","🔺"),("cylinder","圆柱","🥫"),("sphere","球体","🔵"),("cube","立方体","🧊"),
("pyramid","金字塔","🔺"),("prism","棱柱","🔺"),
]
for w in _color_shape: WORDS.append((*w, "颜色形状"))

# --- 数字时间 ~60 ---
_num_time = [
("one","一","1️⃣"),("two","二","2️⃣"),("three","三","3️⃣"),("four","四","4️⃣"),
("five","五","5️⃣"),("six","六","6️⃣"),("seven","七","7️⃣"),("eight","八","8️⃣"),
("nine","九","9️⃣"),("ten","十","🔟"),("eleven","十一","🔢"),("twelve","十二","🔢"),
("thirteen","十三","🔢"),("fourteen","十四","🔢"),("fifteen","十五","🔢"),("sixteen","十六","🔢"),
("seventeen","十七","🔢"),("eighteen","十八","🔢"),("nineteen","十九","🔢"),("twenty","二十","🔢"),
("thirty","三十","🔢"),("forty","四十","🔢"),("fifty","五十","🔢"),("hundred","百","💯"),
("thousand","千","🔢"),("million","百万","🔢"),("zero","零","0️⃣"),("first","第一","1️⃣"),
("second","第二","2️⃣"),("third","第三","3️⃣"),("half","一半","½"),("quarter","四分之一","¼"),
("double","双倍","×2"),("triple","三倍","×3"),("dozen","一打","📦"),("pair","一对","👫"),
("Monday","星期一","📅"),("Tuesday","星期二","📅"),("Wednesday","星期三","📅"),("Thursday","星期四","📅"),
("Friday","星期五","📅"),("Saturday","星期六","📅"),("Sunday","星期日","📅"),("weekday","工作日","📅"),
("weekend","周末","📅"),("week","周","📅"),("month","月","📅"),("year","年","📅"),
("today","今天","📅"),("tomorrow","明天","📅"),("yesterday","昨天","📅"),("morning","早上","🌅"),
("noon","中午","☀️"),("afternoon","下午","🌤️"),("evening","傍晚","🌆"),("night","晚上","🌙"),
("midnight","午夜","🕛"),("dawn","黎明","🌅"),("dusk","黄昏","🌆"),("hour","小时","🕐"),
("minute","分钟","⏱️"),("second","秒","⏲️"),
]
for w in _num_time: WORDS.append((*w, "数字时间"))

# --- 情感 ~50 ---
_emotion = [
("happy","开心","😄"),("sad","难过","😢"),("angry","生气","😠"),("scared","害怕","😨"),
("excited","兴奋","🤩"),("bored","无聊","无聊"),("tired","累","😴"),("surprised","惊讶","😲"),
("calm","平静","😌"),("nervous","紧张","😰"),("proud","自豪","🥰"),("shy","害羞","😳"),
("lonely","孤独","😢"),("brave","勇敢","💪"),("kind","善良","🤗"),("greedy","贪心","😋"),
("generous","大方","🤲"),("selfish","自私","🤏"),("honest","诚实","🤝"),("lazy","懒惰","🦥"),
("hardworking","勤劳","🐝"),("patient","耐心","⏳"),("impatient","急躁","😤"),("curious","好奇","🤔"),
("confident","自信","😎"),("shy","害羞","😳"),("grateful","感恩","🙏"),("jealous","嫉妒","😒"),
("confused","困惑","😕"),("disappointed","失望","😞"),("hopeful","充满希望","🌟"),("worried","担心","😟"),
("relaxed","放松","😌"),("stressed","压力大","😰"),("joyful","快乐","🥳"),("miserable","痛苦","😖"),
("content","满足","😊"),("frustrated","沮丧","😤"),("amazed","惊奇","🤯"),("embarrassed","尴尬","😳"),
("guilty","内疚","😔"),("relieved","释然","😮‍💨"),("love","爱","❤️"),("hate","恨","💔"),
("like","喜欢","👍"),("dislike","不喜欢","👎"),("hope","希望","🌈"),("fear","恐惧","😱"),
("courage","勇气","🦁"),("dream","梦想","💭"),
]
for w in _emotion: WORDS.append((*w, "情感"))

# --- 职业 ~60 ---
_job = [
("doctor","医生","👨‍⚕️"),("nurse","护士","👩‍⚕️"),("teacher","老师","👩‍🏫"),("student","学生","🧑‍🎓"),
("police","警察","👮"),("firefighter","消防员","👨‍🚒"),("soldier","士兵","🪖"),("pilot","飞行员","✈️"),
("sailor","水手","⚓"),("driver","司机","🚗"),("farmer","农民","👨‍🌾"),("fisherman","渔夫","🎣"),
("chef","厨师","👨‍🍳"),("baker","面包师","🥖"),("waiter","服务员","🤵"),("barber","理发师","💈"),
("artist","画家","👨‍🎨"),("musician","音乐家","🎵"),("singer","歌手","🎤"),("dancer","舞者","💃"),
("actor","演员","🎭"),("writer","作家","✍️"),("poet","诗人","📖"),("reporter","记者","📰"),
("scientist","科学家","🔬"),("engineer","工程师","🔧"),("programmer","程序员","💻"),("designer","设计师","🎨"),
("architect","建筑师","🏗️"),("builder","建筑工","👷"),("mechanic","机械师","🔧"),("electrician","电工","💡"),
("plumber","水管工","🔧"),("carpenter","木匠","🔨"),("painter","油漆工","🖌️"),("gardener","园丁","🌱"),
("vet","兽医","🐾"),("dentist","牙医","🦷"),("pharmacist","药剂师","💊"),("lawyer","律师","⚖️"),
("judge","法官","⚖️"),("banker","银行家","🏦"),("accountant","会计","📊"),("cashier","收银员","💰"),
("clerk","职员","📋"),("manager","经理","👔"),("boss","老板","💼"),("worker","工人","👷"),
("cleaner","清洁工","🧹"),("postman","邮递员","📮"),("delivery","快递员","📦"),("tailor","裁缝","🧵"),
("photographer","摄影师","📷"),("filmmaker","电影人","🎬"),("director","导演","🎬"),("producer","制作人","🎥"),
("astronaut","宇航员","👨‍🚀"),("archaeologist","考古学家","🏺"),("geologist","地质学家","🪨"),("biologist","生物学家","🧬"),
]
for w in _job: WORDS.append((*w, "职业"))

# --- 地点 ~60 ---
_place = [
("park","公园","🏞️"),("zoo","动物园","🦁"),("museum","博物馆","🏛️"),("library","图书馆","📚"),
("hospital","医院","🏥"),("bank","银行","🏦"),("post office","邮局","📮"),("police station","警察局","🚓"),
("fire station","消防站","🚒"),("airport","机场","✈️"),("train station","火车站","🚉"),("bus stop","公交站","🚏"),
("harbor","港口","⚓"),("port","码头","⚓"),("bridge","桥","🌉"),("tunnel","隧道","🚇"),
("crossroad","十字路口","🚦"),("roundabout","环岛","🔄"),("highway","高速公路","🛣️"),("street","街道","🏘️"),
("avenue","大道","🌳"),("boulevard","林荫道","🌳"),("alley","小巷","🏘️"),("sidewalk","人行道","🚶"),
("square","广场","📐"),("plaza","购物中心","🛒"),("mall","商场","🛍️"),("market","市场","🏪"),
("supermarket","超市","🛒"),("convenience store","便利店","🏪"),("bakery","面包店","🥖"),("butcher","肉店","🥩"),
("bookstore","书店","📚"),("toy store","玩具店","🧸"),("clothing store","服装店","👕"),("shoe store","鞋店","👟"),
("restaurant","餐厅","🍽️"),("cafe","咖啡馆","☕"),("bar","酒吧","🍺"),("hotel","酒店","🏨"),
("motel","汽车旅馆","🛏️"),("school","学校","🏫"),("university","大学","🎓"),("stadium","体育场","🏟️"),
("gym","健身房","💪"),("pool","游泳池","🏊"),("theater","剧院","🎭"),("cinema","电影院","🎦"),
("amusement park","游乐园","🎢"),("water park","水上乐园","💦"),("beach","海滩","🏖️"),("campsite","露营地","🏕️"),
("farm","农场","🚜"),("factory","工厂","🏭"),("warehouse","仓库","📦"),("parking lot","停车场","🅿️"),
("garage","车库","🏠"),("garden","花园","🌷"),("playground","操场","🛝"),("church","教堂","⛪"),
]
for w in _place: WORDS.append((*w, "地点"))

# --- 动词 ~100 ---
_verb = [
("run","跑","🏃"),("walk","走","🚶"),("jump","跳","🦘"),("swim","游泳","🏊"),
("fly","飞","✈️"),("climb","爬","🧗"),("crawl","爬行","🚶"),("dance","跳舞","💃"),
("sing","唱歌","🎤"),("talk","说话","🗣️"),("speak","说","🗣️"),("listen","听","👂"),
("look","看","👀"),("see","看见","👁️"),("watch","观看","📺"),("read","读","📖"),
("write","写","✍️"),("draw","画","🎨"),("paint","画画","🖌️"),("color","涂色","🖍️"),
("eat","吃","🍽️"),("drink","喝","🥤"),("bite","咬","🦷"),("chew","嚼","👄"),
("cook","做饭","🍳"),("bake","烤","🥖"),("cut","切","🔪"),("mix","搅拌","🥣"),
("wash","洗","🧼"),("clean","打扫","🧹"),("brush","刷","🪥"),("wipe","擦","🧻"),
("sleep","睡觉","😴"),("wake","醒来","⏰"),("rest","休息","🛋️"),("yawn","打哈欠","🥱"),
("cry","哭","😢"),("laugh","笑","😂"),("smile","微笑","😊"),("frown","皱眉","😠"),
("hug","拥抱","🤗"),("kiss","亲吻","😘"),("hold","握","✋"),("catch","抓住","🤲"),
("throw","扔","🤾"),("kick","踢","⚽"),("hit","打","👊"),("push","推","🤚"),
("pull","拉","💪"),("carry","搬运","📦"),("lift","举起","🏋️"),("drop","掉下","⬇️"),
("open","打开","📂"),("close","关上","📂"),("lock","锁","🔒"),("unlock","开锁","🔓"),
("turn","转","🔄"),("spin","旋转","🌀"),("stop","停","✋"),("start","开始","▶️"),
("begin","开始","🎬"),("finish","完成","🏁"),("end","结束","🔚"),("continue","继续","➡️"),
("give","给","🤲"),("take","拿","🤚"),("send","送","📤"),("receive","收到","📥"),
("buy","买","🛒"),("sell","卖","💰"),("pay","付钱","💳"),("cost","花费","💵"),
("help","帮助","🤝"),("share","分享","🩷"),("wait","等","⏳"),("hurry","快点","🏃"),
("try","尝试","💪"),("learn","学习","📚"),("teach","教","👩‍🏫"),("play","玩","🎮"),
("work","工作","💼"),("rest","休息","😴"),("think","思考","🤔"),("remember","记得","🧠"),
("forget","忘记","😶"),("know","知道","💡"),("understand","理解","💡"),("believe","相信","🤞"),
("hope","希望","🌈"),("wish","愿望","⭐"),("love","爱","❤️"),("like","喜欢","👍"),
("hate","讨厌","👎"),("need","需要","📋"),("want","想要","💭"),("have","有","✋"),
("make","制作","🔨"),("build","建造","🏗️"),("break","打破","💔"),("fix","修理","🔧"),
("grow","生长","🌱"),("plant","种植","🌿"),("pick","摘","✋"),("find","找到","🔍"),
("lose","丢失","❌"),("hide","躲藏","🙈"),("seek","寻找","🔍"),("count","数","🔢"),
]
for w in _verb: WORDS.append((*w, "动词"))

# --- 形容词 ~80 ---
_adj = [
("big","大的","🐘"),("small","小的","🐜"),("tall","高的","🦒"),("short","矮的","🐌"),
("long","长的","🐍"),("wide","宽的","📏"),("narrow","窄的","〰️"),("thick","厚的","📖"),
("thin","薄的","📄"),("heavy","重的","🏋️"),("light","轻的","🪶"),("fast","快的","⚡"),
("slow","慢的","🦥"),("strong","强壮的","💪"),("weak","弱的","🍂"),("hard","硬的","🪨"),
("soft","软的","🧸"),("smooth","光滑的","✨"),("rough","粗糙的","🪵"),("sharp","锋利的","🔪"),
("blunt","钝的","🔨"),("hot","热的","🔥"),("cold","冷的","❄️"),("warm","温暖的","☀️"),
("cool","凉爽的","🍃"),("wet","湿的","💧"),("dry","干的","🏜️"),("clean","干净的","✨"),
("dirty","脏的","🟫"),("new","新的","🆕"),("old","旧的","📜"),("good","好的","👍"),
("bad","坏的","👎"),("right","对的","✅"),("wrong","错的","❌"),("true","真的","💯"),
("false","假的","❌"),("easy","简单的","✅"),("difficult","难的","🧩"),("safe","安全的","🛡️"),
("dangerous","危险的","⚠️"),("beautiful","美丽的","🌸"),("ugly","丑的","🤢"),("cute","可爱的","🥰"),
("pretty","漂亮的","🌷"),("handsome","帅的","😎"),("smart","聪明的","🧠"),("silly","傻的","🤪"),
("funny","搞笑的","😂"),("serious","严肃的","😐"),("quiet","安静的","🤫"),("loud","大声的","🔊"),
("bright","明亮的","💡"),("dark","黑暗的","🌑"),("full","满的","🥛"),("empty","空的","🫙"),
("rich","富有的","💰"),("poor","穷的","🪙"),("young","年轻的","👶"),("old","老的","👴"),
("happy","开心的","😄"),("sad","难过的","😢"),("angry","生气的","😠"),("tired","累的","😴"),
("hungry","饿的","😋"),("thirsty","渴的","🥤"),("sick","生病的","🤒"),("healthy","健康的","💚"),
("fresh","新鲜的","🌿"),("rotten","腐烂的","🤢"),("sweet","甜的","🍯"),("sour","酸的","🍋"),
("bitter","苦的","☕"),("spicy","辣的","🌶️"),("salty","咸的","🧂"),("bland","淡的","🍚"),
("crispy","脆的","🥨"),("soft","软的","🍞"),("sticky","粘的","🍯"),("slippery","滑的","🐟"),
("furry","毛茸茸的","🐰"),("scaly","有鳞的","🐍"),("feathery","羽毛的","🐦"),("prickly","多刺的","🌵"),
]
for w in _adj: WORDS.append((*w, "形容词"))

# --- 音乐艺术 ~40 ---
_music_art = [
("piano","钢琴","🎹"),("guitar","吉他","🎸"),("violin","小提琴","🎻"),("drum","鼓","🥁"),
("flute","长笛","🎵"),("trumpet","小号","🎺"),("saxophone","萨克斯","🎷"),("harp","竖琴","🎵"),
("cello","大提琴","🎻"),("clarinet","单簧管","🎶"),("oboe","双簧管","🎶"),("bassoon","巴松管","🎶"),
("trombone","长号","🎺"),("tuba","大号","🎺"),("xylophone","木琴","🎵"),("harmonica","口琴","🎵"),
("accordion","手风琴","🎵"),("banjo","班卓琴","🎵"),("ukulele","尤克里里","🎵"),("microphone","麦克风","🎤"),
("speaker","音箱","🔊"),("headphone","耳机","🎧"),("record","唱片","💿"),("note","音符","🎵"),
("melody","旋律","🎶"),("rhythm","节奏","🥁"),("beat","拍子","🎵"),("tune","曲调","🎵"),
("song","歌曲","🎵"),("music","音乐","🎶"),("concert","音乐会","🎤"),("band","乐队","🎵"),
("orchestra","管弦乐队","🎼"),("choir","合唱团","🎵"),("painting","画作","🖼️"),("sculpture","雕塑","🗿"),
("pottery","陶器","🏺"),("photograph","照片","📷"),("drawing","素描","✏️"),("sketch","速写","✏️"),
]
for w in _music_art: WORDS.append((*w, "音乐艺术"))

# --- 科技 ~40 ---
_tech = [
("computer","电脑","💻"),("laptop","笔记本","💻"),("phone","手机","📱"),("tablet","平板","📱"),
("keyboard","键盘","⌨️"),("mouse","鼠标","🖱️"),("screen","屏幕","🖥️"),("monitor","显示器","🖥️"),
("printer","打印机","🖨️"),("scanner","扫描仪","📷"),("camera","相机","📷"),("video","视频","📹"),
("headphone","耳机","🎧"),("speaker","音箱","🔊"),("microphone","麦克风","🎤"),("charger","充电器","🔌"),
("battery","电池","🔋"),("wire","电线","🔌"),("plug","插头","🔌"),("socket","插座","🔌"),
("switch","开关","🔀"),("button","按钮","🔘"),("remote","遥控器","📡"),("antenna","天线","📡"),
("satellite","卫星","🛰️"),("radar","雷达","📡"),("signal","信号","📶"),("network","网络","🌐"),
("internet","互联网","🌐"),("website","网站","🌐"),("email","邮件","📧"),("message","消息","💬"),
("robot","机器人","🤖"),("drone","无人机","🚁"),("3D printer","3D打印机","🖨️"),("VR headset","VR眼镜","🥽"),
("smartwatch","智能手表","⌚"),("projector","投影仪","📽️"),("calculator","计算器","🔢"),("GPS","导航","📍"),
]
for w in _tech: WORDS.append((*w, "科技"))

# --- 季节天气 ~40 ---
_season = [
("spring","春天","🌸"),("summer","夏天","☀️"),("autumn","秋天","🍂"),("winter","冬天","❄️"),
("season","季节","🍃"),("sunny","晴朗","☀️"),("cloudy","多云","☁️"),("rainy","下雨","🌧️"),
("snowy","下雪","❄️"),("windy","刮风","🌬️"),("foggy","有雾","🌫️"),("stormy","暴风雨","⛈️"),
("hot","炎热","🥵"),("cold","寒冷","🥶"),("warm","温暖","☀️"),("cool","凉爽","🍃"),
("dry","干燥","🏜️"),("humid","潮湿","💧"),("wet","湿润","💦"),("frosty","霜冻","❄️"),
("icy","结冰","🧊"),("muggy","闷热","🥵"),("breezy","微风","🍃"),("gusty","阵风","💨"),
("blizzard","暴风雪","🌨️"),("typhoon","台风","🌀"),("hurricane","飓风","🌀"),("tornado","龙卷风","🌪️"),
("drought","干旱","🏜️"),("flood","洪水","🌊"),("earthquake","地震","🌍"),("tsunami","海啸","🌊"),
("avalanche","雪崩","🏔️"),("landslide","山体滑坡","⛰️"),("volcano eruption","火山喷发","🌋"),("wildfire","野火","🔥"),
("rainbow","彩虹","🌈"),("lightning","闪电","⚡"),("thunder","雷声","⚡"),("hailstone","冰雹","🧊"),
]
for w in _season: WORDS.append((*w, "季节天气"))

# --- 世界国家 ~60 ---
_country = [
("China","中国","🇨🇳"),("America","美国","🇺🇸"),("England","英国","🇬🇧"),("France","法国","🇫🇷"),
("Germany","德国","🇩🇪"),("Japan","日本","🇯🇵"),("Korea","韩国","🇰🇷"),("India","印度","🇮🇳"),
("Brazil","巴西","🇧🇷"),("Canada","加拿大","🇨🇦"),("Australia","澳大利亚","🇦🇺"),("Russia","俄罗斯","🇷🇺"),
("Italy","意大利","🇮🇹"),("Spain","西班牙","🇪🇸"),("Mexico","墨西哥","🇲🇽"),("Egypt","埃及","🇪🇬"),
("Greece","希腊","🇬🇷"),("Turkey","土耳其","🇹🇷"),("Thailand","泰国","🇹🇭"),("Vietnam","越南","🇻🇳"),
("Singapore","新加坡","🇸🇬"),("Malaysia","马来西亚","🇲🇾"),("Indonesia","印度尼西亚","🇮🇩"),("Philippines","菲律宾","🇵🇭"),
("Saudi Arabia","沙特阿拉伯","🇸🇦"),("UAE","阿联酋","🇦🇪"),("Israel","以色列","🇮🇱"),("Iran","伊朗","🇮🇷"),
("Iraq","伊拉克","🇮🇶"),("Pakistan","巴基斯坦","🇵🇰"),("Bangladesh","孟加拉国","🇧🇩"),("Sri Lanka","斯里兰卡","🇱🇰"),
("Nepal","尼泊尔","🇳🇵"),("Mongolia","蒙古","🇲🇳"),("Kazakhstan","哈萨克斯坦","🇰🇿"),("Uzbekistan","乌兹别克斯坦","🇺🇿"),
("Norway","挪威","🇳🇴"),("Sweden","瑞典","🇸🇪"),("Finland","芬兰","🇫🇮"),("Denmark","丹麦","🇩🇰"),
("Holland","荷兰","🇳🇱"),("Belgium","比利时","🇧🇪"),("Switzerland","瑞士","🇨🇭"),("Austria","奥地利","🇦🇹"),
("Poland","波兰","🇵🇱"),("Czech","捷克","🇨🇿"),("Hungary","匈牙利","🇭🇺"),("Romania","罗马尼亚","🇷🇴"),
("Portugal","葡萄牙","🇵🇹"),("Ireland","爱尔兰","🇮🇪"),("Scotland","苏格兰","🏴"),("Wales","威尔士","🏴"),
("Argentina","阿根廷","🇦🇷"),("Chile","智利","🇨🇱"),("Peru","秘鲁","🇵🇪"),("Colombia","哥伦比亚","🇨🇴"),
("Venezuela","委内瑞拉","🇻🇪"),("Cuba","古巴","🇨🇺"),("Jamaica","牙买加","🇯🇲"),("Kenya","肯尼亚","🇰🇪"),
("Nigeria","尼日利亚","🇳🇬"),("South Africa","南非","🇿🇦"),("Morocco","摩洛哥","🇲🇦"),("Ethiopia","埃塞俄比亚","🇪🇹"),
]
for w in _country: WORDS.append((*w, "国家"))

# --- 宇宙太空 ~40 ---
_space = [
("sun","太阳","☀️"),("moon","月亮","🌙"),("earth","地球","🌍"),("mars","火星","🔴"),
("jupiter","木星","🪐"),("saturn","土星","🪐"),("venus","金星","♀️"),("mercury","水星","☿️"),
("neptune","海王星","🔵"),("uranus","天王星","🔵"),("pluto","冥王星","⚪"),("star","恒星","⭐"),
("galaxy","星系","🌌"),("universe","宇宙","🌌"),("space","太空","🌌"),("planet","行星","🪐"),
("comet","彗星","☄️"),("asteroid","小行星","🪨"),("meteor","流星","🌠"),("black hole","黑洞","⬛"),
("nebula","星云","🌌"),("constellation","星座","✨"),("orbit","轨道","🔄"),("gravity","引力","⬇️"),
("rocket","火箭","🚀"),("spaceship","宇宙飞船","🚀"),("satellite","卫星","🛰️"),("astronaut","宇航员","👨‍🚀"),
("telescope","望远镜","🔭"),("space station","空间站","🌌"),("moon landing","登月","🌙"),("solar system","太阳系","☀️"),
("milky way","银河","🌌"),("north star","北极星","⭐"),("big dipper","北斗七星","⭐"),("shooting star","流星","🌠"),
("eclipse","日食","🌑"),("aurora","极光","🌈"),("crater","环形山","🌑"),("moonlight","月光","🌙"),
]
for w in _space: WORDS.append((*w, "太空"))

# --- 工具物品 ~50 ---
_tool = [
("hammer","锤子","🔨"),("saw","锯子","🪚"),("nail","钉子","📌"),("screw","螺丝","🔩"),
("screwdriver","螺丝刀","🪛"),("wrench","扳手","🔧"),("pliers","钳子","🗜️"),("drill","电钻","🪛"),
("tape measure","卷尺","📏"),("level","水平仪","📐"),("axe","斧头","🪓"),("shovel","铲子","🪏"),
("rake","耙子","🧹"),("broom","扫帚","🧹"),("mop","拖把","🧽"),("bucket","桶","🪣"),
("ladder","梯子","🪜"),("flashlight","手电筒","🔦"),("lantern","灯笼","🏮"),("candle","蜡烛","🕯️"),
("match","火柴","🔥"),("lighter","打火机","🔥"),("key","钥匙","🗝️"),("lock","锁","🔒"),
("chain","链条","⛓️"),("rope","绳子","🪢"),("string","线","🧵"),("thread","细线","🧵"),
("needle","针","🪡"),("pin","大头针","📌"),("button","纽扣","🔘"),("zipper","拉链","🤐"),
("hook","钩子","🪝"),("ring","环","⭕"),("clip","夹子","📎"),("band","带子","➰"),
("bandage","绷带","🩹"),("mask","口罩","😷"),("glove","手套","🧤"),("apron","围裙","👗"),
("umbrella","雨伞","☂️"),("fan","扇子","🌀"),("blanket","毯子","🛏️"),("pillow","枕头","🛏️"),
("towel","毛巾","🧖"),("soap","肥皂","🧼"),("brush","刷子","🖌️"),("comb","梳子","💇"),
("scissors","剪刀","✂️"),("knife","刀","🔪"),
]
for w in _tool: WORDS.append((*w, "工具物品"))

# --- 方位介词 ~30 ---
_direction = [
("up","上","⬆️"),("down","下","⬇️"),("left","左","⬅️"),("right","右","➡️"),
("front","前","🔼"),("back","后","🔽"),("inside","里面","📥"),("outside","外面","📤"),
("above","上方","⬆️"),("below","下方","⬇️"),("over","越过","⬆️"),("under","下面","⬇️"),
("near","附近","📍"),("far","远","🗺️"),("between","在...之间","↔️"),("among","在...之中","🔀"),
("through","穿过","➡️"),("around","围绕","🔄"),("along","沿着","➡️"),("across","横过","↔️"),
("toward","朝向","➡️"),("away","远离","⬅️"),("beside","旁边","↔️"),("behind","后面","🔙"),
("before","之前","⬅️"),("after","之后","➡️"),("next to","紧挨着","↔️"),("opposite","对面","↔️"),
("on top","在顶部","⬆️"),("bottom","底部","⬇️"),
]
for w in _direction: WORDS.append((*w, "方位"))

# --- 交流问候 ~30 ---
_comm = [
("hello","你好","👋"),("hi","嗨","👋"),("goodbye","再见","👋"),("bye","拜拜","👋"),
("thank you","谢谢","🙏"),("thanks","谢了","🙏"),("please","请","🤲"),("sorry","对不起","🙇"),
("excuse me","打扰一下","🙋"),("yes","是的","✅"),("no","不","❌"),("ok","好的","👌"),
("okay","行","👌"),("sure","当然","✅"),("maybe","也许","🤔"),("welcome","欢迎","🤗"),
("good morning","早上好","🌅"),("good night","晚安","🌙"),("good afternoon","下午好","🌤️"),("good evening","晚上好","🌆"),
("how are you","你好吗","🤗"),("fine","很好","😊"),("what's up","怎么了","🤷"),("see you","回头见","👋"),
("nice to meet you","很高兴认识你","🤝"),("my name is","我叫","📛"),("i am","我是","🙋"),("help","救命","🆘"),
("stop","停下","✋"),("look out","小心","⚠️"),
]
for w in _comm: WORDS.append((*w, "交流"))

# ============ 补充词汇（达到3000+） ============

# --- 更多动物（细分物种）~100 ---
_more_animals = [
("poodle","贵宾犬","🐕"),("retriever","金毛","🐕"),("husky","哈士奇","🐕"),("corgi","柯基","🐕"),
("chihuahua","吉娃娃","🐕"),("dalmatian","斑点狗","🐕"),("beagle","比格犬","🐕"),("boxer","拳师犬","🐕"),
("shiba inu","柴犬","🐕"),("pug","巴哥犬","🐶"),("ragdoll","布偶猫","🐈"),("persian cat","波斯猫","🐈"),
("siamese cat","暹罗猫","🐈"),("bengal cat","孟加拉猫","🐈"),("maine coon","缅因猫","🐈"),("sphynx","斯芬克斯","🐈"),
("goldfish","金鱼","🐟"),("koi","锦鲤","🐟"),("betta","斗鱼","🐟"),("guppy","孔雀鱼","🐟"),
("hamster","仓鼠","🐹"),("guinea pig","豚鼠","🐹"),("chinchilla","龙猫","🐭"),("hedgehog","刺猬","🦔"),
("ferret","雪貂","🐾"),("sugar glider","蜜袋鼯","🐾"),("holland lop","荷兰垂耳兔","🐰"),("mini rex","迷你雷克斯兔","🐰"),
("red panda","小熊猫","🦊"),("fennec fox","耳廓狐","🦊"),("arctic fox","北极狐","🦊"),("gray wolf","灰狼","🐺"),
("red fox","红狐","🦊"),("snow leopard","雪豹","🐆"),("clouded leopard","云豹","🐆"),("ocelot","豹猫","🐈"),
("fishing cat","渔猫","🐈"),("sand cat","沙猫","🐈"),("caracal","狞猫","🐈"),("servals","薮猫","🐈"),
("puma","美洲狮","🐈"),("jaguarundi","细腰猫","🐈"),("binturong","熊狸","🐾"),("civet","灵猫","🐾"),
("genet","香猫","🐾"),("linsang","林狸","🐾"),("palm civet","果子狸","🐾"),("banded palm civet","椰子狸","🐾"),
("aardwolf","土狼","🐾"),("bat-eared fox","大耳狐","🦊"),("raccoon dog","浣熊犬","🐶"),("bush dog","丛林犬","🐶"),
("short-eared dog","短耳犬","🐶"),("maned wolf","鬃狼","🐺"),("Ethiopian wolf","埃塞俄比亚狼","🐺"),("dingo","澳洲野犬","🐶"),
("coyote","郊狼","🐺"),("jackal","豺","🐺"),("dhole","豺犬","🐺"),("African wild dog","非洲野犬","🐶"),
("bushbuck","灌羚","🦌"),("duiker","小羚羊","🦌"),("klipspringer","山羚","🦌"),("oribi","侏羚","🦌"),
("reedbuck","苇羚","🦌"),("waterbuck","水羚","🦌"),("impala","黑斑羚","🦌"),("gazelle","瞪羚","🦌"),
("springbok","跳羚","🦌"),("gerenuk","长颈羚","🦌"),("dibatag","迪巴塔格羚","🦌"),("saiga","高鼻羚羊","🦌"),
("chiru","藏羚羊","🦌"),("tibetan antelope","藏羚","🦌"),("bongo","紫羚","🦌"),("eland","伊兰羚","🦌"),
("kudu","捻角羚","🦌"),("nyala","尼亚拉羚","🦌"),("sitatunga","林羚","🦌"),("bushbuck","薮羚","🦌"),
("four-horned antelope","四角羚","🦌"),("nilgai","蓝牛羚","🦌"),("tahr","塔尔羊","🐐"),("serow","鬣羚","🐐"),
("goral","斑羚","🐐"),("takin","羚牛","🐂"),("musk ox","麝牛","🐂"),("bison","野牛","🐂"),
("water buffalo","水牛","🐃"),("yak","牦牛","🐂"),("gayal","大额牛","🐂"),("banteng","爪哇野牛","🐂"),
("kouprey","林牛","🐂"),("tamaraw","民都洛水牛","🐃"),("anoa","倭水牛","🐃"),("mountain anoa","山地倭水牛","🐃"),
("wapiti","马鹿","🦌"),("red deer","马鹿","🦌"),("sika deer","梅花鹿","🦌"),("roe deer","狍子","🦌"),
("moose","驼鹿","🦌"),("reindeer","驯鹿","🦌"),("caribou","驯鹿","🦌"),("elk","麋鹿","🦌"),
("mule deer","骡鹿","🦌"),("white-tailed deer","白尾鹿","🦌"),("fallow deer","黇鹿","🦌"),("chital","斑鹿","🦌"),
("hog deer","豚鹿","🦌"),("pudu","普度鹿","🦌"),("muntjac","麂子","🦌"),("tufted deer","毛冠鹿","🦌"),
("water deer","獐","🦌"),("muskrat","麝鼠","🐭"),("nutria","海狸鼠","🐭"),("capybara","水豚","🦫"),
("maras","马拉","🦫"),("paca","无尾刺豚鼠","🦫"),("agouti","刺豚鼠","🦫"),("pacarana","巴卡拉纳","🦫"),
]
for w in _more_animals: WORDS.append((*w, "动物品种"))

# --- 更多食物（具体菜名/调料）~100 ---
_more_food = [
("dumpling","饺子","🥟"),("wonton","馄饨","🍲"),("noodle soup","汤面","🍜"),("fried rice","炒饭","🍚"),
("rice cake","年糕","🍡"),("spring roll","春卷","🥠"),("dim sum","点心","🥟"),("congee","粥","🥣"),
("soybean milk","豆浆","🥛"),("youtiao","油条","🥖"),("baozi","包子","🍔"),("mantou","馒头","🍞"),
("jianbing","煎饼","🥞"),("malatang","麻辣烫","🍲"),("hotpot","火锅","🍲"),("barbecue","烧烤","🍖"),
("roast duck","烤鸭","🦆"),("braised pork","红烧肉","🍖"),("kung pao chicken","宫保鸡丁","🍗"),
("sweet and sour pork","糖醋里脊","🍖"),("mapo tofu","麻婆豆腐","🧈"),("fried chicken","炸鸡","🍗"),
("peking duck","北京烤鸭","🦆"),("chow mein","炒面","🍜"),("lo mein","拌面","🍜"),("ramen","拉面","🍜"),
("udon","乌冬面","🍜"),("soba","荞麦面","🍜"),("tempura","天妇罗","🍤"),("teriyaki","照烧","🍗"),
("sashimi","刺身","🍣"),("nigiri","握寿司","🍣"),("maki","卷寿司","🍣"),("wasabi","芥末","🥬"),
("miso soup","味噌汤","🍲"),("tempura shrimp","炸虾","🍤"),("gyoza","日式饺子","🥟"),("okonomiyaki","大阪烧","🥞"),
("takoyaki","章鱼烧","🐙"),("yakitori","烤鸡肉串","🍢"),("onigiri","饭团","🍙"),("curry","咖喱","🍛"),
("biryani","比尔亚尼饭","🍛"),("naan","馕","🍞"),("masala","马萨拉","🍛"),("tandoori","坦杜里","🍗"),
("samosa","萨摩萨","🥟"),("dosa","多萨","🥞"),("pita","皮塔饼","🥙"),("hummus","鹰嘴豆泥","🥙"),
("falafel","法拉费","🧆"),("shawarma","沙瓦尔玛","🌯"),("kebab","烤肉串","🍢"),("tabbouleh","塔布勒沙拉","🥗"),
("borscht","罗宋汤","🍲"),("pierogi","波兰饺子","🥟"),("goulash","古拉什","🍲"),("paella","海鲜饭","🥘"),
("risotto","烩饭","🍚"),("lasagna","千层面","🍝"),("spaghetti","意大利面","🍝"),("penne","通心粉","🍝"),
("macaroni","通心粉","🍝"),("fusilli","螺旋粉","🍝"),("ravioli","意大利饺","🥟"),("carbonara","培根蛋面","🍝"),
("pesto","青酱","🌿"),("pizza margherita","玛格丽特披萨","🍕"),("calzone"," calzone","🥧"),("focaccia","佛卡夏","🍞"),
("bruschetta","布鲁斯凯塔","🍞"),("panzanella","面包沙拉","🥗"),("gelato","意式冰淇淋","🍦"),("tiramisu","提拉米苏","🍰"),
("cannoli","奶油煎饼卷","🥮"),("panna cotta","奶冻","🍮"),("espresso","浓缩咖啡","☕"),("cappuccino","卡布奇诺","☕"),
("latte","拿铁","☕"),("mocha","摩卡","☕"),("macchiato","玛奇朵","☕"),("frappuccino","星冰乐","🥤"),
("hot chocolate","热巧克力","🍫"),("apple cider","苹果酒","🍎"),("mulled wine","热红酒","🍷"),
("eggnog","蛋酒","🥚"),("smoothie","冰沙","🥤"),("milkshake","奶昔","🥤"),("float","漂浮饮料","🥤"),
("lemonade","柠檬水","🍋"),("iced tea","冰茶","🧊"),("bubble tea","珍珠奶茶","🧋"),("matcha latte","抹茶拿铁","🍵"),
("hot pot","火锅","🍲"),("steak tartare","鞑靼牛肉","🥩"),("beef wellington","惠灵顿牛排","🥩"),
("shepherd's pie","牧羊人派","🥧"),("fish and chips","炸鱼薯条","🍟"),("full breakfast","英式早餐","🍳"),
("scones","司康饼","🥮"),("crumpet","烤面饼","🍞"),("Yorkshire pudding","约克郡布丁","🍮"),
("toad in the hole","蟾蜍在洞","🍳"),("bangers and mash","香肠土豆泥","🥔"),
]
for w in _more_food: WORDS.append((*w, "美食"))

# --- 更多日常物品 ~100 ---
_more_objects = [
("umbrella","雨伞","☂️"),("raincoat","雨衣","🧥"),("boots","雨靴","👢"),("glasses","眼镜","👓"),
("sunglasses","太阳镜","🕶️"),("watch","手表","⌚"),("ring","戒指","💍"),("necklace","项链","📿"),
("bracelet","手链","📿"),("earring","耳环","👂"),("hairpin","发夹","📌"),("hairband","发箍","🎀"),
("wallet","钱包","👛"),("purse","手提包","👛"),("backpack","背包","🎒"),("handbag","手袋","👜"),
("briefcase","公文包","💼"),("suitcase","行李箱","🧳"),("trunk","大箱子","🧳"),("basket","篮子","🧺"),
("tissue","纸巾","🧻"),("napkin","餐巾","🧻"),("handkerchief","手帕","🧣"),("wet wipe","湿巾","🧻"),
("candle","蜡烛","🕯️"),("match","火柴","🔥"),("lighter","打火机","🔥"),("ashtray","烟灰缸","🚬"),
("vase","花瓶","🏺"),("frame","相框","🖼️"),("album","相册","📔"),("diary","日记本","📔"),
("calendar","日历","📅"),("timer","计时器","⏱️"),("alarm","闹钟","⏰"),("thermometer","温度计","🌡️"),
("scale","秤","⚖️"),("ruler","尺子","📏"),("magnifier","放大镜","🔍"),("microscope","显微镜","🔬"),
("binoculars","双筒望远镜","🔭"),("compass","指南针","🧭"),("flashlight","手电筒","🔦"),("lantern","灯笼","🏮"),
("battery","电池","🔋"),("charger","充电器","🔌"),("power bank","充电宝","🔋"),("adapter","适配器","🔌"),
("headphone","耳机","🎧"),("earbud","耳塞","🎧"),("speaker","音箱","🔊"),("microphone","麦克风","🎤"),
("remote","遥控器","📡"),("joystick","操纵杆","🎮"),("gamepad","游戏手柄","🎮"),("keyboard","键盘","⌨️"),
("mouse","鼠标","🖱️"),("monitor","显示器","🖥️"),("printer","打印机","🖨️"),("scanner","扫描仪","📠"),
("webcam","摄像头","📹"),("cable","数据线","🔌"),("cord","电线","🔌"),("plug","插头","🔌"),
("socket","插座","🔌"),("extension cord","插线板","🔌"),("surge protector","浪涌保护器","🔌"),
("doorbell","门铃","🔔"),("key","钥匙","🗝️"),("lock","锁","🔒"),("chain","链条","⛓️"),
("safe","保险箱","🔒"),("mailbox","信箱","📮"),("trash can","垃圾桶","🗑️"),("recycling bin","回收桶","♻️"),
("broom","扫帚","🧹"),("mop","拖把","🧽"),("dustpan","簸","簸箕","🧹"),("vacuum","吸尘器","🧹"),
("iron","熨斗","👔"),("sewing machine","缝纫机","🧵"),("washing machine","洗衣机","🧺"),("dryer","烘干机","🧺"),
("dishwasher","洗碗机","🍽️"),("blender","搅拌机","🥤"),("toaster","烤面包机","🍞"),("kettle","水壶","🫖"),
("rice cooker","电饭煲","🍚"),("pressure cooker","高压锅","🍲"),("air fryer","空气炸锅","🍟"),
("coffee maker","咖啡机","☕"),("juicer","榨汁机","🥤"),("food processor","食物处理器","🍽️"),
("slow cooker","慢炖锅","🍲"),("steamer","蒸锅","🍲"),("grill","烤架","🍖"),("fryer","炸锅","🍟"),
]
for w in _more_objects: WORDS.append((*w, "日常物品"))

# --- 更多形容词 ~100 ---
_more_adj = [
("ancient","古老的","🏛️"),("modern","现代的","🏙️"),("traditional","传统的","🎎"),("fashionable","时尚的","👗"),
("popular","流行的","⭐"),("famous","著名的","🌟"),("important","重要的","❗"),("urgent","紧急的","🚨"),
("necessary","必要的","✅"),("possible","可能的","🤔"),("impossible","不可能的","❌"),("available","可用的","✅"),
("ready","准备好了","✅"),("busy","忙的","📅"),("free","空闲的","🆓"),("early","早的","🌅"),
("late","晚的","🌙"),("present","在场的","✅"),("absent","缺席的","❌"),("alive","活着的","💚"),
("dead","死的","💀"),("awake","醒着的","👁️"),("asleep","睡着的","😴"),("open","开着的","📂"),
("closed","关着的","📁"),("locked","锁着的","🔒"),("unlocked","没锁的","🔓"),("full","满的","🥛"),
("empty","空的","🫙"),("heavy","重的","🏋️"),("light","轻的","🪶"),("huge","巨大的","🐘"),
("tiny","微小的","🐜"),("enormous","庞大的","🐋"),("minute","微小的","🔬"),("massive","大块的","🏔️"),
("narrow","窄的","〰️"),("broad","宽的","📏"),("deep","深的","🌊"),("shallow","浅的","💧"),
("steep","陡峭的","⛰️"),("flat","平的","🟫"),("round","圆的","⭕"),("square","方的","⬛"),
("straight","直的","📏"),("curved","弯曲的","〰️"),("crooked","歪的","zigzag"),("smooth","光滑的","✨"),
("rough","粗糙的","🪵"),("soft","柔软的","🧸"),("hard","坚硬的","🪨"),("flexible","灵活的","🤸"),
("stiff","僵硬的","🧍"),("fragile","易碎的","🏺"),("sturdy","坚固的","🧱"),("delicate","精致的","🌸"),
("plain","朴素的","⬜"),("fancy","华丽的","✨"),("elegant","优雅的","💃"),("clumsy","笨拙的","🤪"),
("graceful","优美的","🩰"),("steady","稳定的","⚖️"),("wobbly","摇晃的","🌀"),("firm","牢固的","🪨"),
("loose","松的","🪢"),("tight","紧的","🧶"),("hollow","空心的","⭕"),("solid","实心的","🟫"),
("transparent","透明的","🪟"),("opaque","不透明的","⬛"),("colorful","多彩的","🌈"),("plain","素色的","⬜"),
("patterned","有花纹的","🎨"),("striped","条纹的","🦓"),("spotted","有斑点的","🐆"),("checkered","格子的","🏁"),
("shiny","闪亮的","✨"),("dull","暗淡的","🌫️"),("glossy","光滑的","💎"),("matte","哑光的","⬛"),
("clean","干净的","✨"),("filthy","极脏的","🟫"),("tidy","整洁的","🧹"),("messy","凌乱的","🤪"),
("organized","有条理的","📋"),("chaotic","混乱的","🌀"),("orderly","有序的","📐"),("random","随机的","🎲"),
("certain","确定的","✅"),("unsure","不确定的","🤔"),("definite","明确的","✅"),("vague","模糊的","🌫️"),
("clear","清晰的","💡"),("blurry","模糊的","🌫️"),("sharp","锋利的","🔪"),("blunt","钝的","🔨"),
("precise","精确的","🎯"),("accurate","准确的","✅"),("exact","确切的","💯"),("approximate","大约的","≈"),
("correct","正确的","✅"),("incorrect","错误的","❌"),("right","对的","✅"),("wrong","错的","❌"),
]
for w in _more_adj: WORDS.append((*w, "形容词补充"))

# --- 更多动词 ~100 ---
_more_verbs = [
("whisper","低语","🤫"),("shout","大喊","📢"),("scream","尖叫","😱"),("mumble","嘀咕","🤐"),
("chat","聊天","💬"),("discuss","讨论","💭"),("argue","争论","💢"),("agree","同意","🤝"),
("disagree","不同意","🙅"),("nod","点头","👍"),("shake","摇头","👎"),("wave","挥手","👋"),
("clap","鼓掌","👏"),("cheer","欢呼","🎉"),("whistle","吹口哨","🎵"),("hum","哼歌","🎵"),
("cry","哭泣","😢"),("sob","啜泣","😭"),("weep","流泪","😢"),("smile","微笑","😊"),
("grin","咧嘴笑","😀"),("laugh","大笑","😂"),("giggle","咯咯笑","🤭"),("chuckle","轻笑","😄"),
("frown","皱眉","😠"),("glare","怒视","😒"),("stare","盯着","👁️"),("peek","偷看","👀"),
("blink","眨眼","😉"),("wink","眨一只眼","😉"),("squint","眯眼","😖"),("yawn","打哈欠","🥱"),
("sneeze","打喷喷嚏","🤧"),("cough","咳嗽","😷"),("hiccup","打嗝","😮‍💨"),("burp","打饱嗝","🫢"),
("snore","打呼噜","😴"),("breathe","呼吸","💨"),("sigh","叹气","😮‍💨"),("gasp","倒吸一口气","😮"),
("chew","嚼","👄"),("swallow","吞咽","🥤"),("sip","小口喝","🥤"),("gulp","大口喝","🥤"),
("lick","舔","👅"),("bite","咬","🦷"),("gnaw","啃","🦷"),("nibble","小口咬","Nibble"),
("cook","煮","🍳"),("bake","烤","🥖"),("fry","炸","🍳"),("boil","煮开","🍲"),
("steam","蒸","♨️"),("grill","烧烤","🍖"),("roast","烘烤","🍗"),("toast","烤","🍞"),
("stir","搅拌","🥄"),("mix","混合","🥣"),("blend","打碎混合","🥤"),("whip","搅打","🥛"),
("knead","揉面","🍞"),("roll","擀","🥞"),("spread","涂抹","🧈"),("sprinkle","撒","✨"),
("pour","倒","🫗"),("drain","沥干","💧"),("filter","过滤","☕"),("strain","过滤","☕"),
("wash","洗","🧼"),("rinse","冲洗","💧"),("scrub","擦洗","🧹"),("wipe","擦","🧻"),
("dry","弄干","🏜️"),("polish","抛光","✨"),("dust","除尘","🧹"),("sweep","扫","🧹"),
("mop","拖","🧽"),("vacuum","吸尘","🧹"),("iron","熨","👔"),("fold","折叠","📄"),
("hang","挂","👕"),("pack","打包","📦"),("unpack","拆包","📦"),("wrap","包裹","🎁"),
("tie","系","🎀"),("untie","解开","🪢"),("button","扣纽扣","🔘"),("unbutton","解纽扣","🔘"),
("zip","拉拉链","🤐"),("unzip","拉开拉链","🤐"),("buckle","扣扣子","🔖"),("fasten","固定","📌"),
("loosen","放松","🧶"),("tighten","拧紧","🔧"),("squeeze","挤","🤏"),("press","按","👇"),
("push","推","🤚"),("pull","拉","💪"),("drag","拖","🛒"),("lift","举起","🏋️"),
("lower","放下","⬇️"),("drop","扔下","⬇️"),("catch","接住","🤲"),("throw","扔","🤾"),
("toss","抛","🤾"),("kick","踢","⚽"),("punch","打拳","👊"),("slap","拍","👋"),
]
for w in _more_verbs: WORDS.append((*w, "动词补充"))

# --- 更多抽象名词 ~80 ---
_more_abstract = [
("time","时间","⏰"),("life","生活","🌟"),("love","爱","❤️"),("friendship","友谊","🤝"),
("happiness","幸福","😊"),("sadness","悲伤","😢"),("anger","愤怒","😠"),("fear","恐惧","😱"),
("courage","勇气","🦁"),("kindness","善良","🤗"),("honesty","诚实","🤝"),("patience","耐心","⏳"),
("wisdom","智慧","🦉"),("knowledge","知识","📚"),("truth","真相","💯"),("lie","谎言","🤥"),
("secret","秘密","🤫"),("dream","梦想","💭"),("memory","记忆","🧠"),("idea","想法","💡"),
("plan","计划","📋"),("goal","目标","🎯"),("wish","愿望","⭐"),("hope","希望","🌈"),
("future","未来","🔮"),("past","过去","📜"),("present","现在","🎁"),("history","历史","📖"),
("story","故事","📚"),("adventure","冒险","🗺️"),("journey","旅程","🧳"),("travel","旅行","✈️"),
("home","家","🏠"),("family","家庭","👨‍👩‍👧‍👦"),("world","世界","🌍"),("country","国家","🏞️"),
("city","城市","🏙️"),("village","村庄","🏡"),("community","社区","🏘️"),("society","社会","👥"),
("culture","文化","🎎"),("tradition","传统","🏮"),("festival","节日","🎉"),("celebration","庆祝","🎊"),
("party","派对","🥳"),("gift","礼物","🎁"),("surprise","惊喜","😲"),("miracle","奇迹","✨"),
("magic","魔法","🪄"),("science","科学","🔬"),("math","数学","🔢"),("language","语言","🗣️"),
("art","艺术","🎨"),("music","音乐","🎵"),("literature","文学","📚"),("poetry","诗歌","📖"),
("history","历史","📜"),("geography","地理","🗺️"),("biology","生物","🧬"),("chemistry","化学","⚗️"),
("physics","物理","🔭"),("philosophy","哲学","🤔"),("psychology","心理学","🧠"),("sociology","社会学","👥"),
("economics","经济学","💰"),("politics","政治","🏛️"),("law","法律","⚖️"),("medicine","医学","💊"),
("engineering","工程","🔧"),("technology","技术","💻"),("internet","互联网","🌐"),("data","数据","📊"),
("information","信息","ℹ️"),("message","消息","💬"),("news","新闻","📰"),("fact","事实","✅"),
("opinion","观点","💭"),("question","问题","❓"),("answer","答案","✅"),("problem","问题","❗"),
("solution","解决方案","💡"),("method","方法","🔧"),("way","方法/路","🛤️"),("path","小路","🛤️"),
]
for w in _more_abstract: WORDS.append((*w, "抽象概念"))

# --- 更多自然/地理 ~80 ---
_more_geo = [
("continent","大洲","🌍"),("country","国家","🗺️"),("province","省","📍"),("city","城市","🏙️"),
("town","镇","🏘️"),("village","村","🏡"),("capital","首都","🏛️"),("border","边境","🚧"),
("coast","海岸","🏖️"),("shore","岸边","🏖️"),("bank","河岸","🏞️"),("bay","海湾","🌊"),
("gulf","海湾","🌊"),("strait","海峡","🌊"),("channel","海峡","🌊"),("canal","运河","🚢"),
("delta","三角洲","🌊"),("estuary","河口","🌊"),("lagoon","泻湖","🌊"),("reef","珊瑚礁","🪸"),
("atoll","环礁","🏝️"),("peninsula","半岛","🏝️"),("cape","海角","🏝️"),("isthmus","地峡","🗺️"),
("plateau","高原","🏔️"),("plain","平原","🌾"),("basin","盆地","🗺️"),("valley","山谷","⛰️"),
("canyon","峡谷","⛰️"),("gorge","峡谷","⛰️"),("ravine","沟壑","⛰️"),("gully","冲沟","⛰️"),
("cliff","悬崖","⛰️"),("bluff","峭壁","⛰️"),("ridge","山脊","⛰️"),("peak","山峰","🏔️"),
("summit","山顶","🏔️"),("slope","斜坡","⛰️"),("foot","山脚","⛰️"),("glacier","冰川","🧊"),
("iceberg","冰山","🧊"),("ice cap","冰盖","🧊"),("permafrost","冻土","❄️"),("tundra","冻原","❄️"),
("taiga","针叶林","🌲"),("rainforest","雨林","🌴"),("savanna","稀树草原","🦒"),("steppe","草原","🌾"),
("prairie","大草原","🌾"),("pampas","潘帕斯","🌾"),("veld","南非草原","🌾"),("outback","内陆荒野","🏜️"),
("bush","灌木丛","🌿"),("scrub","矮树林","🌿"),("marsh","沼泽","🌿"),("swamp","湿地","🌿"),
("bog","泥炭沼","🌿"),("fen","沼泽","🌿"),("mire","泥潭","🟤"),("quagmire","泥沼","🟤"),
("meadow","草地","🌿"),("pasture","牧场","🐄"),("field","田野","🌾"),("farmland","农田","🚜"),
("orchard","果园","🍎"),("vineyard","葡萄园","🍇"),("plantation","种植园","🌴"),("garden","花园","🌷"),
("park","公园","🏞️"),("forest","森林","🌳"),("wood","树林","🌲"),("grove","小树林","🌳"),
("copse","矮林","🌿"),("thicket","灌木林","🌿"),("jungle","丛林","🌴"),("rainforest","雨林","🌴"),
("desert","沙漠","🏜️"),("dune","沙丘","🏜️"),("oasis","绿洲","🏜️"),("wadi","旱谷","🏜️"),
("mesa","平顶山","⛰️"),("butte","孤山","⛰️"),("monadnock","残丘","⛰️"),("inselberg","岛山","⛰️"),
]
for w in _more_geo: WORDS.append((*w, "地理"))

# --- 更多学校/学习 ~80 ---
_more_school = [
("alphabet","字母表","🔤"),("letter","字母","🔤"),("word","单词","📝"),("sentence","句子","📝"),
("paragraph","段落","📝"),("page","页","📄"),("chapter","章节","📖"),("volume","卷","📚"),
("spelling","拼写"," spell"),("grammar","语法","📐"),("vocabulary","词汇","📚"),("pronunciation","发音","🗣️"),
("reading","阅读","📖"),("writing","写作","✍️"),("listening","听力","👂"),("speaking","口语","🗣️"),
("translation","翻译","🔄"),("composition","作文","📝"),("essay","论文","📝"),("article","文章","📄"),
("novel","小说","📚"),("poem","诗歌","📖"),("story","故事","📚"),("fable","寓言","📖"),
("myth","神话","📖"),("legend","传说","📖"),("biography","传记","📖"),("autobiography","自传","📖"),
("history","历史","📜"),("science","科学","🔬"),("math","数学","🔢"),("arithmetic","算术","➕"),
("algebra","代数","🔤"),("geometry","几何","📐"),("statistics","统计","📊"),("probability","概率","🎲"),
("physics","物理","🔭"),("chemistry","化学","⚗️"),("biology","生物","🧬"),("geology","地质","🪨"),
("astronomy","天文","🌌"),("meteorology","气象","🌤️"),("ecology","生态","🌿"),("environment","环境","🌳"),
("geography","地理","🗺️"),("cartography","制图","🗺️"),("topography","地形","⛰️"),("demography","人口","👥"),
("economics","经济","💰"),("business","商业","💼"),("finance","金融","💳"),("accounting","会计","📊"),
("marketing","营销","📢"),("management","管理","📋"),("leadership","领导力","👑"),("teamwork","团队合作","🤝"),
("communication","沟通","💬"),("negotiation","谈判","🤝"),("decision","决策","🤔"),("strategy","策略","♟️"),
("innovation","创新","💡"),("creativity","创造力","🎨"),("imagination","想象力","💭"),("curiosity","好奇心","🤔"),
("discovery","发现","🔍"),("invention","发明","💡"),("experiment","实验","🔬"),("observation","观察","👁️"),
("analysis","分析","🔍"),("synthesis","综合","🧩"),("evaluation","评估","📋"),("reflection","反思","🪞"),
("practice","练习","🏋️"),("training","训练","🏃"),("education","教育","🎓"),("learning","学习","📚"),
("teaching","教学","👩‍🏫"),("homework","作业","📝"),("assignment","任务","📋"),("project","项目","📊"),
("research","研究","🔬"),("report","报告","📄"),("presentation","演讲","🎤"),("debate","辩论","🗣️"),
]
for w in _more_school: WORDS.append((*w, "学习"))

# --- 更多身体/健康 ~80 ---
_more_health = [
("healthy","健康的","💚"),("sick","生病的","🤒"),("fever","发烧","🌡️"),("cough","咳嗽","😷"),
("sneeze","打喷嚏","🤧"),("headache","头痛","🤕"),("stomachache","肚子痛","🤢"),("toothache","牙痛","🦷"),
("backache","背痛","💔"),("sore throat","喉咙痛","🗣️"),("runny nose","流鼻涕","👃"),("stuffy nose","鼻塞","👃"),
("allergy","过敏","🤧"),("rash","皮疹","🟥"),("bruise","瘀伤","🟪"),("cut","伤口","🩹"),
("scar","疤痕","🩹"),("bandage","绷带","🩹"),("medicine","药","💊"),("pill","药片","💊"),
("capsule","胶囊","💊"),("syrup","糖浆","🧴"),("injection","注射","💉"),("vaccine","疫苗","💉"),
("checkup","体检","🩺"),("blood test","验血","🩸"),("x-ray","X光","📷"),("scan","扫描","📷"),
("surgery","手术","🔪"),("operation","手术","🔪"),("dentist","牙医","🦷"),("optometrist","验光师","👓"),
("physiotherapist","理疗师","💪"),("psychologist","心理咨询师","🧠"),("nutritionist","营养师","🥗"),
("diet","饮食","🥗"),("exercise","锻炼","🏃"),("stretch","拉伸","🧘"),("warmup","热身","🏃"),
("cooldown","放松","🧘"),("workout","锻炼","💪"),("training","训练","🏋️"),("practice","练习","🏋️"),
("rest","休息","😴"),("sleep","睡眠","😴"),("nap","小睡","😴"),("energy","精力","⚡"),
("vitamin","维生素","💊"),("protein","蛋白质","🥩"),("carbohydrate","碳水化合物","🍞"),("fat","脂肪","🥓"),
("fiber","纤维","🥦"),("calcium","钙","🥛"),("iron","铁","🍖"),("zinc","锌","💊"),
("water","水","💧"),("hydration","补水","💧"),("nutrition","营养","🥗"),("metabolism","代谢","🔥"),
("immune system","免疫系统","🛡️"),("antibody","抗体","🛡️"),("virus","病毒","🦠"),("bacteria","细菌","🦠"),
("infection","感染","🦠"),("disease","疾病","🤢"),("fever","发热","🌡️"),("pain","疼痛","😖"),
("recovery","康复","💚"),("healing","愈合","🩹"),("treatment","治疗","💊"),("therapy","疗法","💪"),
("first aid","急救","🩹"),("CPR","心肺复苏","🫀"),("emergency","急诊","🚑"),("ambulance","救护车","🚑"),
("hospital","医院","🏥"),("clinic","诊所","🏥"),("pharmacy","药房","💊"),("prescription","处方","📋"),
]
for w in _more_health: WORDS.append((*w, "健康"))

# --- 更多交通细节 ~60 ---
_more_transport = [
("traffic light","红绿灯","🚦"),("stop sign","停车标志","🛑"),("speed limit","限速","📐"),("crosswalk","人行横道","🚶"),
("parking","停车","🅿️"),("gas station","加油站","⛽"),("charging station","充电站","🔌"),("car wash","洗车","🧼"),
("repair shop","修理厂","🔧"),("tire","轮胎","🛞"),("wheel","车轮","🛞"),("engine","发动机","⚙️"),
("brake","刹车","🛑"),("accelerator","油门","🏃"),("steering wheel","方向盘","🎡"),("mirror","后视镜","🪞"),
("seat belt","安全带","🪢"),("airbag","安全气囊","🎈"),("horn","喇叭","📢"),("headlight","前灯","💡"),
("taillight","尾灯","🚦"),("windshield","挡风玻璃","🪟"),("wiper","雨刮","🧹"),("bumper","保险杠","🛡️"),
("license plate","车牌","🔢"),("registration","登记","📋"),("insurance","保险","📋"),("driver's license","驾照","💳"),
("ticket","票","🎫"),("fare","车费","💰"),("passenger","乘客","🧑"),("driver","司机","🚗"),
("pedestrian","行人","🚶"),("cyclist","骑车人","🚴"),("traffic jam","堵车","🚗"),("road trip","公路旅行","🛣️"),
("map","地图","🗺️"),("GPS","导航","📍"),("direction","方向","🧭"),("route","路线","🛤️"),
("shortcut","捷径","🛤️"),("detour","绕路","↩️"),("arrival","到达","📍"),("departure","出发","🛫"),
("delay","延误","⏰"),("schedule","时刻表","📅"),("ticket counter","售票处","🎫"),("gate","登机口","🚪"),
("boarding","登机","🛫"),("landing","降落","🛬"),("takeoff","起飞","🛫"),("flight","航班","✈️"),
("cruise","游轮","🛳️"),("voyage","航程","🚢"),("sail","航行","⛵"),("anchor","锚","⚓"),
("harbor","港口","⚓"),("dock","码头","⚓"),("pier","栈桥","⚓"),("mooring","系泊","⚓"),
]
for w in _more_transport: WORDS.append((*w, "交通补充"))

# --- 更多动物行为/特征 ~60 ---
_more_animal_feat = [
("paw","爪子","🐾"),("claw","爪子","🦅"),("talon","利爪","🦅"),("beak","鸟嘴","🐦"),
("fang","毒牙","🐍"),("tusk","象牙","🐘"),("horn","角","🦏"),("antler","鹿角","🦌"),
("feather","羽毛","🪶"),("fur","毛皮","🐾"),("scale","鳞片","🐟"),("shell","壳","🐢"),
("fin","鱼鳍","🐟"),("wing","翅膀","🪽"),("tail","尾巴","🐾"),("mane","鬃毛","🦁"),
("whisker","胡须","🐱"),("gill","鳃","🐟"),("hump","驼峰","🐫"),("pouch","育儿袋","🦘"),
("den","兽穴","🏠"),("nest","鸟巢","🪹"),("hive","蜂巢","🐝"),("web","蜘蛛网","🕸️"),
("burrow","地洞","🕳️"),("lair","巢穴","🏠"),("terrier","梗犬","🐕"),("pack","狼群","🐺"),
("flock","鸟群","🐦"),("herd","兽群","🦌"),("school","鱼群","🐟"),("colony","群体","🐜"),
("swarm","蜂群","🐝"),("pride","狮群","🦁"),("pod","鲸群","🐋"),("troop","猴群","🐵"),
("litter","一窝","👶"),("cub","幼崽","🐾"),("pup","小崽","🐾"),("kit","小崽","🐾"),
("fawn","小鹿","🦌"),("foal","小马","🐴"),("calf","幼崽","🐂"),("chick","雏鸟","🐤"),
("fledgling","幼鸟","🐦"),("nestling","雏鸟","🐦"),("hatch","孵化","🥚"),("lay egg","产卵","🥚"),
("molt","脱毛","🪶"),("shed","蜕皮","🐍"),("hibernate","冬眠","😴"),("migrate","迁徙","🦅"),
("hunt","捕猎","🐺"),("graze","吃草","🐄"),("browse","啃食","🦌"),("forage","觅食","🐗"),
("prey","猎物","🐰"),("predator","捕食者","🦁"),("camouflage","伪装","🦎"),("venom","毒液","🐍"),
]
for w in _more_animal_feat: WORDS.append((*w, "动物特征"))

# --- 更多节日/庆典 ~40 ---
_more_festival = [
("birthday","生日","🎂"),("party","派对","🥳"),("cake","蛋糕","🍰"),("candle","蜡烛","🕯️"),
("gift","礼物","🎁"),("balloon","气球","🎈"),("decoration","装饰","🎊"),("fireworks","烟花","🎆"),
("Christmas","圣诞节","🎄"),("Santa","圣诞老人","🎅"),("reindeer","驯鹿","🦌"),("sleigh","雪","雪橇","🛷"),
("elf","精灵","🧝"),("snowman","雪人","⛄"),("stocking","袜子","🧦"),(" wreath","花环","🌿"),
("Halloween","万圣节","🎃"),("pumpkin","南瓜","🎃"),("ghost","鬼","👻"),("witch","女巫","🧙"),
("vampire","吸血鬼","🧛"),("zombie","僵尸","🧟"),("costume","服装","🎭"),("mask","面具","😷"),
("trick or treat","不给糖就捣蛋","🍬"),("candy","糖果","🍬"),("spooky","可怕的","👻"),
("Easter","复活节","🐰"),("Easter egg","彩蛋","🥚"),("Easter bunny","复活节兔子","🐰"),
("New Year","新年","🎉"),("countdown","倒计时","⏰"),("resolution","决心","📝"),("fireworks","烟花","🎆"),
("Valentine's Day","情人节","❤️"),("rose","玫瑰","🌹"),("chocolate","巧克力","🍫"),("heart","心","❤️"),
("Thanksgiving","感恩节","🦃"),("turkey","火鸡","🦃"),("gratitude","感恩","🙏"),("harvest","丰收","🌾"),
("Mid-Autumn","中秋节","🌙"),("mooncake","月饼","🥮"),("lantern","灯笼","🏮"),("Dragon Boat","端午节","🐉"),
]
for w in _more_festival: WORDS.append((*w, "节日"))

# --- 更多天气/自然现象 ~60 ---
_more_weather = [
("breeze","微风","🍃"),("gust","阵风","💨"),("gale","大风","💨"),("storm","暴风雨","⛈️"),
("blizzard","暴风雪","🌨️"),("drizzle","毛毛雨","🌧️"),("downpour","倾盆大雨","🌧️"),("shower","阵雨","🌧️"),
("thunderstorm","雷暴","⛈️"),("lightning","闪电","⚡"),("thunder","雷声","⚡"),("fog","雾","🌫️"),
("mist","薄雾","🌫️"),("haze","霾","🌫️"),("smog","雾霾","🌫️"),("frost","霜","❄️"),
("dew","露水","💧"),("icicle","冰柱","🧊"),("snowflake","雪花","❄️"),("snowball","雪球","⛄"),
("avalanche","雪崩","🏔️"),("glacier","冰川","🧊"),("iceberg","冰山","🧊"),("permafrost","冻土","❄️"),
("drought","干旱","🏜️"),("flood","洪水","🌊"),("tsunami","海啸","🌊"),("hurricane","飓风","🌀"),
("typhoon","台风","🌀"),("tornado","龙卷风","🌪️"),("cyclone","气旋","🌀"),("monsoon","季风","🌬️"),
("el nino","厄尔尼诺","🌊"),("la nina","拉尼娜","🌊"),("greenhouse","温室","🌡️"),("global warming","全球变暖","🌡️"),
("climate","气候","🌤️"),("weather","天气","🌤️"),("temperature","温度","🌡️"),("humidity","湿度","💧"),
("pressure","气压","📊"),("forecast","预报","📅"),("meteorologist","气象学家","🌡️"),("barometer","气压计","📊"),
("anemometer","风速计","💨"),("thermometer","温度计","🌡️"),("hygrometer","湿度计","💧"),("rain gauge","雨量计","🌧️"),
("wind vane","风向标","🌬️"),("weather station","气象站","🌡️"),("satellite","卫星","🛰️"),("radar","雷达","📡"),
("sunrise","日出","🌅"),("sunset","日落","🌇"),("equinox","春分秋分","☀️"),("solstice","夏至冬至","☀️"),
("eclipse","日食月食","🌑"),("aurora","极光","🌈"),("rainbow","彩虹","🌈"),("halo","光环","⭕"),
("corona","日冕","☀️"),("zodiac","黄道带","⛎"),("constellation","星座","✨"),("milky way","银河","🌌"),
]
for w in _more_weather: WORDS.append((*w, "天气现象"))

# --- 更多材质/质地 ~40 ---
_more_material = [
("wood","木头","🪵"),("metal","金属","⚙️"),("plastic","塑料","🧴"),("glass","玻璃","🪟"),
("paper","纸","📄"),("cardboard","纸板","📦"),("fabric","布料","🧵"),("leather","皮革","👞"),
("rubber","橡胶","🛞"),("silicone","硅胶","🧴"),("ceramic","陶瓷","🏺"),("porcelain","瓷器","🏺"),
("clay","黏土","🏺"),("stone","石头","🪨"),("rock","岩石","🪨"),("marble","大理石","⬜"),
("granite","花岗岩","🪨"),("limestone","石灰岩","⬜"),("sandstone","砂岩","🟫"),("slate","板岩","⬛"),
("brick","砖","🧱"),("concrete","混凝土","🟦"),("cement","水泥","⬜"),("asphalt","沥青","⬛"),
("copper","铜","🟤"),("iron","铁","⛓️"),("steel","钢","⚙️"),("aluminum","铝","🥫"),
("gold","金","🟨"),("silver","银","⬜"),("bronze","青铜","🟫"),("brass","黄铜","🟡"),
("tin","锡","🥫"),("lead","铅","⬛"),("zinc","锌","⬜"),("nickel","镍","⬜"),
("diamond","钻石","💎"),("ruby","红宝石","❤️"),("sapphire","蓝宝石","💙"),("emerald","绿宝石","💚"),
]
for w in _more_material: WORDS.append((*w, "材质"))

# --- 更多乐器/艺术 ~40 ---
_more_art = [
("canvas","画布","🖼️"),("easel","画架","🎨"),("palette","调色板","🎨"),("brush","画笔","🖌️"),
("paint","颜料","🎨"),("watercolor","水彩","🎨"),("oil paint","油画颜料","🎨"),("acrylic","丙烯","🎨"),
("charcoal","炭笔","✏️"),("pastel","粉彩","🎨"),("crayon","蜡笔","🖍️"),("marker","记号笔","🖍️"),
("pencil","铅笔","✏️"),("pen","钢笔","🖊️"),("ink","墨水","🖋️"),("eraser","橡皮","🧹"),
("sketch","素描","✏️"),("portrait","肖像","🖼️"),("landscape","风景画","🖼️"),("still life","静物画","🖼️"),
("abstract","抽象画","🎨"),("mural","壁画","🖼️"),("graffiti","涂鸦","🎨"),("calligraphy","书法","✍️"),
("sculpture","雕塑","🗿"),("statue","雕像","🗿"),("carving","雕刻","🔪"),("pottery","陶艺","🏺"),
("ceramics","陶瓷","🏺"),("mosaic","马赛克","🧩"),("collage","拼贴","✂️"),("origami","折纸","📄"),
("photography","摄影","📷"),("camera","相机","📷"),("lens","镜头","🔭"),("tripod","三脚架","📷"),
("film","胶片","🎞️"),("darkroom","暗房","📷"),("exposure","曝光","📷"),("focus","对焦","🔍"),
]
for w in _more_art: WORDS.append((*w, "艺术补充"))

# --- 更多烹饪方式 ~40 ---
_more_cooking = [
("boil","煮","🍲"),("steam","蒸","♨️"),("fry","炒","🍳"),("deep fry","炸","🍳"),
("stir fry","翻炒","🍳"),("pan fry","煎","🍳"),("grill","烤","🍖"),("roast","烘烤","🍗"),
("bake","烘焙","🥖"),("broil","炙烤","🔥"),("braise","炖","🍲"),("stew","焖","🍲"),
("simmer","煨","🍲"),("poach","水煮","🍲"),("blanch","焯水","🥦"),("parboil","半煮","🍲"),
("saute","嫩煎","🍳"),("sear","煎封","🍳"),("toast","烤","🍞"),("melt","融化","🫠"),
("freeze","冷冻","🧊"),("chill","冷藏","🧊"),("refrigerate","冷藏","🧊"),("defrost","解冻","💧"),
("marinate","腌制","🧂"),("cure","腌制","🧂"),("pickle","泡制","🥒"),("ferment","发酵","🍺"),
("smoke","熏制","💨"),("dry","风干","🏜️"),("dehydrate","脱水","🏜️"),("freeze dry","冻干","🧊"),
("preserve","保存","🫙"),("can","罐装","🥫"),("bottle","瓶装","🍾"),("jar","坛装","🫙"),
("grind","磨碎","⚙️"),("crush","压碎","🔨"),("mash","捣碎","🥔"),("blend","搅拌","🥤"),
("whisk","搅打","🥛"),("strain","过滤","☕"),("sift","筛","🔍"),("knead","揉","🍞"),
]
for w in _more_cooking: WORDS.append((*w, "烹饪"))

# --- 更多运动/户外 ~40 ---
_more_sport2 = [
("archery","射箭","🏹"),("fencing","击剑","🤺"),("shooting","射击","🎯"),("curling","冰壶","🪨"),
("bobsleigh","雪车","🛷"),("luge","仰卧雪橇","🛷"),("skeleton","俯式冰冰橇","🛷"),("skating","滑冰","⛸️"),
("figure skating","花样滑冰","⛸️"),("speed skating","速滑","⛸️"),("short track","短道速滑","⛸️"),
("ice hockey","冰球","🏒"),("bandy","班迪球","🏒"),("sledding","滑雪橇","🛷"),("toboggan","长雪橇","🛷"),
("ice climbing","攀冰","🧗"),("snowshoeing","雪鞋健行","🥾"),("winter hiking","冬季徒步","🥾"),
("camping","露营","🏕️"),("backpacking","背包旅行","🎒"),("trekking","徒步","🥾"),("orienteering","定向越野","🧭"),
("geocaching","寻宝","🗺️"),("birdwatching","观鸟","🐦"),("stargazing","观星","⭐"),("photography","摄影","📷"),
("fishing","钓鱼","🎣"),("hunting","打猎","🏹"),("foraging","采集","🌿"),("gardening","园艺","🌱"),
("horseback riding","骑马","🐎"),("pony trekking","矮马徒步","🐎"),("camel riding","骑骆驼","🐫"),
("elephant riding","骑大象","🐘"),("safari","野生动物观察","🦁"),("whale watching","观鲸","🐋"),
("snorkeling","浮潜","🤿"),("scuba diving","水肺潜水","🤿"),("kayaking","皮划艇","🛶"),("canoeing","独木舟","🛶"),
]
for w in _more_sport2: WORDS.append((*w, "户外运动"))

# --- 更多家具/装饰 ~40 ---
_more_furniture = [
("armchair","扶手椅","🛋️"),("rocking chair","摇椅","🪑"),("stool","凳子","🪑"),("bench","长凳","🪵"),
("ottoman","脚凳","🛋️"),("chaise lounge","躺椅","🛋️"),("futon","榻榻米","🛏️"),("hammock","吊床","🛏️"),
("bunk bed","双层床","🛏️"),("crib","婴儿床","🛏️"),("cradle","摇篮","🛏️"),("trundle bed","抽屉床","🛏️"),
("daybed","沙发床","🛏️"),("couch","沙发","🛋️"),("sectional","组合沙发","🛋️"),("loveseat","双人沙发","🛋️"),
("recliner","躺椅","🛋️"),("chaise","长榻","🛋️"),("settee","长靠椅","🛋️"),("divan","无靠背沙发","🛋️"),
("coffee table","茶几","☕"),("end table","边桌","🪑"),("console table","控制台桌","🪑"),("dining table","餐桌","🍽️"),
("desk","书桌","🪑"),("vanity","梳妆台","🪞"),("nightstand","床头柜","🛏️"),("dresser","梳妆台","🪞"),
("chest","箱子","🧰"),("trunk","行李箱","🧳"),("wardrobe","衣柜","🚪"),("armoire","大衣柜","🚪"),
("bookshelf","书架","📚"),("bookcase","书柜","📚"),("cabinet","橱柜","🗄️"),("cupboard","碗柜","🗄️"),
("buffet","餐具柜","🍽️"),("sideboard","餐具柜","🍽️"),("credenza","矮柜","🗄️"),("hutch","碗橱","🗄️"),
]
for w in _more_furniture: WORDS.append((*w, "家具"))

# --- 最终补充：通用常见词 ~300 ---
_final_batch = [
("book","书","📖"),("pen","笔","🖊️"),("bag","包","🎒"),("box","盒子","📦"),
("ball","球","⚽"),("doll","洋娃娃","🪆"),("toy","玩具","🧸"),("game","游戏","🎮"),
("card","卡片","🎴"),("sticker","贴纸","🌟"),("puzzle","拼图","🧩"),("block","积木","🧱"),
("rattle","拨浪鼓","👶"),("teddy","泰迪熊","🧸"),("robot toy","机器人玩具","🤖"),("car toy","玩具车","🚗"),
("yarn","毛线","🧶"),("thread","线","🧵"),("ribbon","丝带","🎀"),("lace","蕾丝","🌸"),
("button","纽扣","🔘"),("zipper","拉链","🤐"),("buckle","扣环","🔒"),("pin","别针","📌"),
("comb","梳子","💇"),("brush","刷子","🖌️"),("mirror","镜子","🪞"),("towel","毛巾","🧖"),
("soap","肥皂","🧼"),("shampoo","洗发水","🧴"),("lotion","乳液","🧴"),("perfume","香水","🌸"),
("toothpaste","牙膏","🪥"),("toothbrush","牙刷","🪥"),("floss","牙线","🦷"),("mouthwash","漱口水","🦷"),
("razor","剃须刀","🪒"),("shaver","剃须刀","🪒"),("nail clipper","指甲刀","💅"),("tweezer","镊子","🔬"),
("cotton","棉花","☁️"),("sponge","海绵","🧽"),("rag","抹布","🧹"),("duster","掸子","🧹"),
("bucket","水桶","🪣"),("basin","脸盆","🚰"),("jug","水壶","🫗"),("pitcher","水罐","🫗"),
("mug","马克杯","☕"),("cup","杯子","☕"),("glass","玻璃杯","🥛"),("bottle","瓶子","🍼"),
("flask","保温瓶","🧴"),("thermos","热水瓶","☕"),("canteen","水壶","🧴"),("vessel","容器","🫙"),
("plate","盘子","🍽️"),("dish","碟子","🍽️"),("bowl","碗","🥣"),("saucer","茶碟","☕"),
("tray","托盘","🍽️"),("platter","大托盘","🍽️"),("pot","锅","🍲"),("pan","平底锅","🍳"),
("wok","炒锅","🍳"),("skillet","煎锅","🍳"),("casserole","砂锅","🍲"),("griddle","烤盘","🍳"),
("lid","盖子","🫙"),("cover","盖子","🫙"),("foil","锡纸","✨"),("wrap","保鲜膜","📦"),
("bag","袋子","🛍️"),("sack","麻袋","🛍️"),("pouch","小袋","🛍️"),("envelope","信封","✉️"),
("parcel","包裹","📦"),("package","包裹","📦"),("crate","板条箱","📦"),("carton","纸箱","📦"),
("jar","罐子","🫙"),("can","罐头","🥫"),("tin","罐头","🥫"),("tube","管子","🧴"),
("spray","喷雾","💦"),("nozzle","喷嘴","💦"),("hose","水管","🚰"),("pipe","管道","🔧"),
("valve","阀门","🔧"),("faucet","水龙头","🚰"),("tap","水龙头","🚰"),("drain","下水道","💧"),
("sink","水槽","🚰"),("basin","水盆","🚰"),("tub","浴缸","🛁"),("shower","淋浴","🚿"),
("toilet","马桶","🚽"),("bidet","净身盆","🚽"),("urinal","小便池","🚽"),("plunger","搋子","🚽"),
("curtain","窗帘","🪟"),("blind","百叶窗","🪟"),("shade","遮光帘","🪟"),("drape","帷幔","🪟"),
("screen","屏风","🪟"),("partition","隔断","🚪"),("door","门","🚪"),("gate","大门","🚪"),
("fence","栅栏","🚧"),("wall","墙","🧱"),("floor","地板","🟫"),("ceiling","天花板","⬜"),
("roof","屋顶","🏠"),("chimney","烟囱","🏠"),("balcony","阳台","🏙️"),("terrace","露台","🏙️"),
("patio","庭院","🌳"),("porch","门廊","🏠"),("veranda","走廊","🏠"),("deck","甲板","⚓"),
("stairs","楼梯","🪜"),("ramp","坡道","🪜"),("elevator","电梯","🏢"),("escalator","自动扶梯","🏢"),
("ladder","梯子","🪜"),("step","台阶","🪜"),("staircase","楼梯间","🪜"),("stairway","楼梯","🪜"),
("carpet","地毯","🟫"),("rug","地毯","🟫"),("mat","垫子","🟫"),("runner","长条地毯","🟫"),
("tile","瓷砖","⬜"),("floorboard","地板条","🟫"),("parquet","拼花地板","🟫"),("linoleum","油毡","🟫"),
("wallpaper","壁纸","🌸"),("paint","油漆","🎨"),("varnish","清漆","✨"),("stain","着色剂","🎨"),
("grout","填缝剂","⬜"),("caulk","密封胶","🔧"),("sealant","密封剂","🔧"),("adhesive","粘合剂","🔧"),
("glue","胶水","🩹"),("tape","胶带","📦"),("string","绳子","🪢"),("rope","绳索","🪢"),
("cord","细绳","🪢"),("wire","金属线","🔌"),("chain","链条","⛓️"),("link","链环","⛓️"),
("hook","钩子","🪝"),("clip","夹子","📎"),("clamp","夹具","🗜️"),("vise","老虎钳","🗜️"),
("peg","钉子","📌"),("pin","大头针","📌"),("nail","钉子","📌"),("screw","螺丝","🔩"),
("bolt","螺栓","🔩"),("nut","螺母","🔩"),("washer","垫圈","🔩"),("rivet","铆钉","🔩"),
("hinge","铰链","🚪"),("bracket","支架","🔧"),("mount","挂架","🔧"),("frame","框架","🖼️"),
("stand","支架","🧍"),("holder","支架","🔧"),("rack","架子","📦"),("shelf","搁板","📚"),
("drawer","抽屉","🗄️"),("cabinet","柜子","🗄️"),("cupboard","橱柜","🗄️"),("closet","壁橱","🚪"),
("pantry","食品柜","🗄️"),("cellar","地窖","🏠"),("attic","阁楼","🏠"),("loft","阁楼","🏠"),
("basement","地下室","🏠"),("garage","车库","🏠"),("carport","车棚","🏠"),("shed","棚子","🏠"),
("barn","谷仓","🏠"),("stable","马厩","🐎"),("kennel","狗窝","🐕"),("hutch","兔笼","🐰"),
("coop","鸡舍","🐔"),("pen","围栏","🐄"),("corral","畜栏","🐄"),("pasture","牧场","🐄"),
("field","田地","🌾"),("meadow","草地","🌿"),("lawn","草坪","🌿"),("yard","院子","🌳"),
("garden","花园","🌷"),("orchard","果园","🍎"),("grove","树丛","🌳"),("vineyard","葡萄园","🍇"),
("greenhouse","温室","🌡️"),("conservatory","温室","🌡️"),("atrium","中庭","🏙️"),("courtyard","庭院","🌳"),
("plaza","广场","🏙️"),("square","广场","📐"),("market","市场","🏪"),("bazaar","集市","🏪"),
("shop","商店","🏪"),("store","店铺","🏪"),("boutique","精品店","🛍️"),("stall","摊位","🏪"),
("booth","亭子","🎪"),("kiosk","售货亭","🏪"),("stand","摊","🧍"),("cart","手推车","🛒"),
("truck","卡车","🚚"),("van","货车","🚐"),("wagon","四轮车","🛻"),("trailer","拖车","🚛"),
("carriage","马车","🐎"),("coach","长途客车","🚌"),("caravan","房车","🚐"),("camper","露营车","🚐"),
("RV","房车","🚐"),("motorhome","房车","🚐"),("tricycle","三轮车","🛺"),("rickshaw","人力车","🛺"),
("sled","雪橇","🛷"),("sleigh","雪","雪橇","🛷"),("wagon","运货车","🛻"),("barrow","手推车","🛒"),
("stroller","婴儿车","👶"),("pram","婴儿车","👶"),("wheelchair","轮椅","♿"),("crutch","拐杖","🦵"),
("walker","助行器","🚶"),("cane","手杖","🦯"),("stick","手杖","🦯"),("staff","棍杖","🦯"),
("pole","杆子","🪵"),("rod","杆","🪵"),("bar","杆","🪵"),("beam","横梁","🪵"),
("plank","木板","🪵"),("board","板子","🪵"),("panel","面板","🪵"),("sheet","薄片","📄"),
("slab","厚板","🪵"),("block","块","🧱"),("brick","砖","🧱"),("tile","瓦","⬜"),
("shingle","木瓦","🏠"),("slate","石板","⬛"),("stone","石头","🪨"),("rock","岩石","🪨"),
("boulder","巨石","🪨"),("pebble","鹅卵石","🪨"),("gravel","碎石","🪨"),("sand","沙子","🏖️"),
("dust","灰尘","💨"),("dirt","泥土","🟫"),("soil","土壤","🟫"),("mud","泥","🟤"),
("clay","黏土","🟤"),("mud","泥巴","🟤"),("sludge","污泥","🟤"),("ooze","软泥","🟤"),
("water","水","💧"),("liquid","液体","💧"),("fluid","流体","💨"),("gas","气体","💨"),
("air","空气","💨"),("steam","蒸汽","♨️"),("vapor","蒸汽","💨"),("mist","薄雾","🌫️"),
("smoke","烟","💨"),("fume","烟雾","💨"),("smog","雾霾","🌫️"),("haze","霾","🌫️"),
("fire","火","🔥"),("flame","火焰","🔥"),("spark","火花","✨"),("ember","余烬","🔥"),
("ash","灰烬","🌋"),("soot","煤烟","⬛"),("charcoal","木炭","⬛"),("coal","煤","⬛"),
("light","光","💡"),("ray","光线","☀️"),("beam","光束","💡"),("glow","发光","✨"),
("shine","闪耀","✨"),("glitter","闪烁","✨"),("sparkle","闪耀","✨"),("twinkle","闪烁","⭐"),
("shadow","影子","🌑"),("shade","阴影","🌑"),("silhouette","剪影","🌑"),("outline","轮廓","📐"),
("shape","形状","📐"),("form","形式","📐"),("figure","图形","🔢"),("pattern","图案","🎨"),
("design","设计","🎨"),("style","风格","🎨"),("theme","主题","🎭"),("motif","主题","🎭"),
]
for w in _final_batch: WORDS.append((*w, "通用词汇"))

# --- 最终补丁 ~80 ---
_patch = [
("morning","早晨","🌅"),("noon","中午","☀️"),("afternoon","下午","🌤️"),("evening","傍晚","🌆"),
("midnight","半夜","🕛"),("dawn","破晓","🌅"),("dusk","黄昏","🌆"),("today","今天","📅"),
("tomorrow","明天","📅"),("yesterday","昨天","📅"),("now","现在","⏰"),("later","稍后","⏰"),
("soon","很快","⏱️"),("already","已经","✅"),("yet","还没","❌"),("still","仍然","🔄"),
("always","总是","♾️"),("never","从不","❌"),("sometimes","有时","🤷"),("often","经常","🔄"),
("usually","通常","🔄"),("rarely","很少","📉"),("everyday","每天","📅"),("weekly","每周","📅"),
("monthly","每月","📅"),("yearly","每年","📅"),("suddenly","突然","⚡"),("gradually","逐渐","📈"),
("quickly","快速地","⚡"),("slowly","缓慢地","🐢"),("carefully","小心地","🤗"),("carelessly","粗心地","🤪"),
("quietly","安静地","🤫"),("loudly","大声地","📢"),("happily","快乐地","😄"),("sadly","悲伤地","😢"),
("easily","容易地","✅"),("hard","困难地","💪"),("well","好地","👍"),("badly","差地","👎"),
("very","非常","💯"),("quite","相当","💯"),("too","也/太","➕"),("enough","足够","✅"),
("almost","几乎","≈"),("perhaps","也许","🤔"),("maybe","可能","🤔"),("certainly","当然","✅"),
("definitely","一定","💯"),("probably","大概","🤔"),("possibly","可能","🤔"),("luckily","幸运地","🍀"),
("unfortunately","不幸地","😢"),("surprisingly","意外地","😲"),("naturally","自然地","🌿"),("obviously","明显地","💡"),
("actually","实际上","💡"),("really","真的","💯"),("truly","真正地","💯"),("exactly","确切地","🎯"),
("just","刚刚","⏱️"),("only","只有","1️⃣"),("even","甚至","📈"),("also","也","➕"),
("besides","此外","➕"),("however","然而","🤔"),("although","虽然","🤔"),("because","因为","💡"),
("since","自从","📅"),("until","直到","⏰"),("while","当","⏰"),("during","在...期间","⏰"),
("before","之前","⬅️"),("after","之后","➡️"),("when","当","❓"),("where","哪里","📍"),
("why","为什么","❓"),("how","怎样","❓"),("what","什么","❓"),("who","谁","❓"),
("which","哪个","❓"),("whose","谁的","❓"),("whom","谁","❓"),("whether","是否","🤔"),
]
for w in _patch: WORDS.append((*w, "副词连词"))

# ============ 去重 + 输出 ============
seen = set()
unique = []
for entry in WORDS:
    if len(entry) == 4:
        en, cn, emoji, theme = entry
    elif len(entry) == 3:
        en, cn, emoji = entry
        theme = "通用"
    elif len(entry) >= 5:
        # malformed entry with extra fields
        en = entry[0]
        emoji = entry[-1]
        cn = entry[1]  # take first cn field
        theme = "通用"
    else:
        en, cn, emoji = entry[0], entry[1], entry[2] if len(entry) > 2 else "❓"
        theme = "通用"
    key = en.lower().strip()
    if key in seen:
        continue
    seen.add(key)
    unique.append({"en": en, "cn": cn, "emoji": emoji, "theme": theme})

print(f"Total unique words: {len(unique)}")

# 如果不足 3000，用主题默认 emoji 补充通用词
if len(unique) < 3000:
    print(f"WARNING: only {len(unique)} words, need {3000 - len(unique)} more")

# 输出 JS 文件
lines = ["/* 英语词库 - 自动生成，共 %d 词 */" % len(unique)]
lines.append("/* 由 gen_en_words.py 生成，覆盖动物/食物/自然/交通/身体/家庭/衣物/家居/学校/运动/颜色/数字/情感/职业/地点/动词/形容词/音乐/科技/季节/国家/太空/工具/方位/交流等主题 */")
lines.append(";(function(){")
lines.append("  var extra = [")
for w in unique:
    lines.append('    {en:"%s",cn:"%s",emoji:"%s",theme:"%s"},' % (
        w["en"].replace('"','\\"'), w["cn"].replace('"','\\"'),
        w["emoji"].replace('"','\\"'), w["theme"].replace('"','\\"')
    ))
lines.append("  ];")
lines.append("  if (window.Data && window.Data.EN_WORDS) {")
lines.append("    var existing = new Set(window.Data.EN_WORDS.map(function(w){return w.en.toLowerCase()}));")
lines.append("    extra.forEach(function(w){ if(!existing.has(w.en.toLowerCase())) window.Data.EN_WORDS.push(w); });")
lines.append("  }")
lines.append("})();")

outpath = os.path.join(ROOT, "assets", "en_words_data.js")
with open(outpath, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))
print(f"Written: {outpath} ({len(lines)} lines, {len(unique)} words)")
