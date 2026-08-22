/* =========================================================
   艾米的学习乐园 — 内容数据层 (Data)
   说明：所有学习内容集中在此，便于扩展与维护。
   结构：
     - 基础配置（名称/头像/鼓励语）
     - 拼音字母表 + 拼音游戏组合
     - 识字：每日故事（含新字）
     - 计算：题目生成参数（逻辑在 modules）
     - 英语：每日单词 + 对话
     - 逻辑题
     - 绘本
     - 游戏清单
     - 奖励两层兑换规则
     - 诗人信息（生卒年，用于诗词释义）
   注：诗词正文在 poems_data.js（320首），释义在 poem_notes.js。
   ========================================================= */
window.Data = (function () {
  const APP_NAME = "艾米的学习乐园";
  const DEFAULT_NAME = "艾米";
  const AVATARS = ["🐰","🐱","🐶","🦊","🐻","🐼","🐯","🦁","🐸","🐵","🐥","🦄","🌸","⭐","🍎","🚀"];

  const ENCOURAGE = [
    "艾米今天也超棒！继续加油呀～",
    "你是最爱学习的小花朵🌸",
    "每天一点点，本领大无边！",
    "艾米真聪明，老师为你点赞👍",
    "坚持打卡，你会越来越厉害！",
    "读书使人快乐，今天也要开心学～",
    "你读得真好听，再试一次吧！",
    "小脑袋转一转，答案就出现啦～",
    "今天的你比昨天更棒一点点💖",
    "勇敢大声读，全世界都为你鼓掌👏"
  ];

  /* ---------- 拼音 ---------- */
  // 声母（汉语拼音字母，点击朗读 sound 音节，而非字母名）
  const PINYIN_INITIALS = [
    { s:"b", ex:"波", sound:"bo" }, { s:"p", ex:"坡", sound:"po" }, { s:"m", ex:"摸", sound:"mo" }, { s:"f", ex:"佛", sound:"fo" },
    { s:"d", ex:"得", sound:"de" }, { s:"t", ex:"特", sound:"te" }, { s:"n", ex:"讷", sound:"ne" }, { s:"l", ex:"勒", sound:"le" },
    { s:"g", ex:"哥", sound:"ge" }, { s:"k", ex:"科", sound:"ke" }, { s:"h", ex:"喝", sound:"he" },
    { s:"j", ex:"鸡", sound:"ji" }, { s:"q", ex:"七", sound:"qi" }, { s:"x", ex:"西", sound:"xi" },
    { s:"zh", ex:"知", sound:"zhi" }, { s:"ch", ex:"吃", sound:"chi" }, { s:"sh", ex:"狮", sound:"shi" }, { s:"r", ex:"日", sound:"ri" },
    { s:"z", ex:"字", sound:"zi" }, { s:"c", ex:"刺", sound:"ci" }, { s:"s", ex:"丝", sound:"si" },
    { s:"y", ex:"衣", sound:"yi" }, { s:"w", ex:"屋", sound:"wu" }
  ];
  // 韵母（点击朗读 sound 音节）
  const PINYIN_FINALS = [
    { s:"a", ex:"啊", sound:"a" }, { s:"o", ex:"哦", sound:"o" }, { s:"e", ex:"鹅", sound:"e" }, { s:"i", ex:"衣", sound:"i" },
    { s:"u", ex:"乌", sound:"u" }, { s:"ü", ex:"鱼", sound:"yu" },
    { s:"ai", ex:"爱", sound:"ai" }, { s:"ei", ex:"诶", sound:"ei" }, { s:"ui", ex:"围", sound:"ui" },
    { s:"ao", ex:"袄", sound:"ao" }, { s:"ou", ex:"欧", sound:"ou" }, { s:"iu", ex:"优", sound:"iu" },
    { s:"ie", ex:"耶", sound:"ie" }, { s:"üe", ex:"月", sound:"yue" }, { s:"er", ex:"耳", sound:"er" },
    { s:"an", ex:"安", sound:"an" }, { s:"en", ex:"恩", sound:"en" }, { s:"in", ex:"音", sound:"in" }, { s:"un", ex:"温", sound:"un" }, { s:"ün", ex:"云", sound:"yun" },
    { s:"ang", ex:"昂", sound:"ang" }, { s:"eng", ex:"灯", sound:"eng" }, { s:"ing", ex:"鹰", sound:"ing" }, { s:"ong", ex:"钟", sound:"ong" }
  ];
  // 拼音游戏：点击字母拼出组合，正确后读拼音并展示对应字+图
  const PINYIN_COMBOS = [
    { combo:"bà",  char:"爸", emoji:"👨", word:"爸爸" },
    { combo:"mā",  char:"妈", emoji:"👩", word:"妈妈" },
    { combo:"mǎ",  char:"马", emoji:"🐴", word:"小马" },
    { combo:"bō",  char:"波", emoji:"🌊", word:"波浪" },
    { combo:"pá",  char:"爬", emoji:"🧗", word:"爬山" },
    { combo:"dà",  char:"大", emoji:"🐘", word:"大象" },
    { combo:"tī",  char:"踢", emoji:"⚽", word:"踢球" },
    { combo:"nǎi", char:"奶", emoji:"🥛", word:"牛奶" },
    { combo:"lè",  char:"乐", emoji:"😄", word:"快乐" },
    { combo:"gē",  char:"哥", emoji:"🧑", word:"哥哥" },
    { combo:"hē",  char:"喝", emoji:"🥤", word:"喝水" },
    { combo:"huā", char:"花", emoji:"🌸", word:"花朵" },
    { combo:"xī",  char:"西", emoji:"🌅", word:"西瓜" },
    { combo:"yú",  char:"鱼", emoji:"🐟", word:"小鱼" },
    { combo:"niǎo",char:"鸟", emoji:"🐦", word:"小鸟" },
    { combo:"mèi", char:"妹", emoji:"👧", word:"妹妹" }
  ];

  /* ---------- 识字：每日故事 ---------- */
  // 每篇约100字，5-8个新字（在文中以 [字|拼音|释义] 标记，会高亮重复出现）
  // 这里用简单结构：text 为普通文本，newChars 列出新字（模块自动高亮其在文中所有出现）
  const STORIES = [
    {
      title: "小白兔种萝卜",
      text: "有一天，小白兔想要种萝卜。它先挖了一个小坑，把萝卜种子放进去，再盖上土。小白兔每天都给它喝水。太阳出来了，小芽慢慢长出来。风儿轻轻吹，萝卜一天天变大。小白兔笑了，它说：我要吃自己种的萝卜！",
      newChars: [
        { char:"兔", py:"tù", mean:"小动物，长耳朵" },
        { char:"种", py:"zhòng", mean:"把种子埋进土里" },
        { char:"萝卜", py:"luó bo", mean:"一种蔬菜" },
        { char:"坑", py:"kēng", mean:"地上的小洞" },
        { char:"芽", py:"yá", mean:"刚长出的小苗" },
        { char:"风", py:"fēng", mean:"空气流动" }
      ]
    },
    {
      title: "小熊过桥",
      text: "小熊走到一座小桥上。桥下流水哗哗响，小熊有点害怕。它深吸一口气，慢慢走过去。走到中间，它看见一条小鱼在桥下游。小熊笑了，不再害怕。过了桥，它采了一朵红花，高高兴兴回家了。妈妈夸它是勇敢的小熊。",
      newChars: [
        { char:"熊", py:"xióng", mean:"一种大动物" },
        { char:"桥", py:"qiáo", mean:"过河的路" },
        { char:"怕", py:"pà", mean:"心里害怕" },
        { char:"勇敢", py:"yǒng gǎn", mean:"不怕困难" },
        { char:"游", py:"yóu", mean:"在水里动" },
        { char:"夸", py:"kuā", mean:"表扬、说你好" }
      ]
    },
    {
      title: "小雨点旅行",
      text: "天上有许多小雨点。它们从云里跳下来，落进小河里。小河带着小雨点往前跑，跑过草地，跑过树林。小草喝饱了水，挺直了身子。小鸟在树上唱：谢谢小雨点！小雨点笑嘻嘻，它们让世界变得干净又漂亮。",
      newChars: [
        { char:"雨", py:"yǔ", mean:"从天上落下水滴" },
        { char:"云", py:"yún", mean:"天上的白棉花" },
        { char:"河", py:"hé", mean:"流动的水" },
        { char:"草", py:"cǎo", mean:"地上的绿植物" },
        { char:"林", py:"lín", mean:"很多树在一起" },
        { char:"漂亮", py:"piào liang", mean:"好看" }
      ]
    },
    {
      title: "小猫钓鱼",
      text: "小猫拿着小鱼竿去河边钓鱼。一只蝴蝶飞来了，小猫去追蝴蝶。蝴蝶飞走了，小猫回来，看见小鱼竿动了。它赶紧拉起来，钓到了一条大鱼！小猫明白：做事情要专心，不能三心二意。它开心地回家，给妈妈看大鱼。",
      newChars: [
        { char:"猫", py:"māo", mean:"会抓老鼠的小动物" },
        { char:"钓", py:"diào", mean:"用竿子捕鱼" },
        { char:"蝴", py:"hú", mean:"蝴蝶，会飞的小虫" },
        { char:"专", py:"zhuān", mean:"集中精神" },
        { char:"意", py:"yì", mean:"心思、想法" },
        { char:"赶", py:"gǎn", mean:"快点去做" }
      ]
    },
    {
      title: "星星睡了",
      text: "夜晚到了，天黑黑的。小星星挂在天上，一闪一闪像小灯。月亮姐姐慢慢升起来，洒下柔柔的光。小动物都回家睡觉了。小鸟闭上了眼，小狗蜷成一团。小艾米也闭上眼睛，做个甜甜的梦。星星悄悄说：晚安，乖宝宝。",
      newChars: [
        { char:"星", py:"xīng", mean:"天上亮亮的点" },
        { char:"夜", py:"yè", mean:"天黑的时候" },
        { char:"月", py:"yuè", mean:"晚上的大灯" },
        { char:"梦", py:"mèng", mean:"睡觉时看到的画" },
        { char:"闭", py:"bì", mean:"合上" },
        { char:"甜", py:"tián", mean:"味道好、舒服" }
      ]
    },
    {
      title: "小蚂蚁搬家",
      text: "要下雨了，小蚂蚁发现天气变闷。它们排成一队，把粮食一粒一粒搬进新家。小蚂蚁力气虽小，可它们很团结。大雨哗哗落下，小蚂蚁在新家里吃着粮食，一点也不怕。雨停了，天边出现一道彩虹，小蚂蚁笑了。",
      newChars: [
        { char:"蚂蚁", py:"mǎ yǐ", mean:"很小的昆虫" },
        { char:"搬", py:"bān", mean:"移动东西" },
        { char:"粮", py:"liáng", mean:"吃的粮食" },
        { char:"团结", py:"tuán jié", mean:"一起帮忙" },
        { char:"虹", py:"hóng", mean:"雨后的彩桥" },
        { char:"闷", py:"mēn", mean:"又热又不舒服" }
      ]
    },
    {
      title: "小火车出发",
      text: "小火车鸣鸣叫，它要出发去远方。车厢一节连一节，装满了礼物和歌声。它穿过山洞，越过小河，路过一片金黄的麦田。小动物们在站台上挥手：再见，小火车！小火车笑着说：下次再带你们去玩！它冒着白烟，快乐地向前跑。",
      newChars: [
        { char:"火车", py:"huǒ chē", mean:"在铁轨上跑的车" },
        { char:"站", py:"zhàn", mean:"停车的地方" },
        { char:"洞", py:"dòng", mean:"山里的窟窿" },
        { char:"麦", py:"mài", mean:"做面包的庄稼" },
        { char:"烟", py:"yān", mean:"白白的汽" },
        { char:"挥", py:"huī", mean:"摇手打招呼" }
      ]
    }
  ];

  /* ---------- 常用字释义（识字故事「任意汉字」加入词库时显示） ---------- */
  // 新字用其自带释义；其余常见字用此表兜底，查不到则释义留空（仍显示拼音）
  const COMMON_MEAN = {
    "的":"助词，表所属","小":"不大、年幼","了":"表示动作完成","是":"对、正确","在":"存在于",
    "它":"指动物或事物","先":"首先","放":"安放","进":"进入","再":"又一次","盖":"遮上","上":"位置高的一边",
    "土":"泥土","每":"各个","天":"天空、一天","给":"交付","太":"很、极","阳":"太阳","出":"从里到外","来":"到来",
    "儿":"孩子","轻":"分量小","吹":"合嘴出气","一":"数目1","大":"体积大","笑":"快乐表情","说":"用话表达","要":"想要",
    "自":"自己","己":"自己","吃":"送食物进嘴","看":"用眼睛瞧","见":"看到","飞":"空中移动","走":"用脚移动","过":"经过",
    "回":"返回","家":"住的地方","白":"像雪的颜色","里":"内部","们":"表复数","我":"自己","你":"对方","他":"别人",
    "好":"优点多","不":"否定","会":"能够","也":"同样","都":"全、总","很":"十分","爱":"喜欢","有":"存在","和":"连同",
    "手":"上肢","足":"脚","目":"眼睛","口":"嘴","人":"人类","日":"太阳、一天","月":"月亮","火":"燃烧的光热",
    "木":"树","金":"金属","石":"石头","田":"庄稼地","山":"高地","雨":"落下的水","中":"中间","下":"位置低",
    "左":"西边","右":"东边","前":"正面","后":"背面","高":"离地远","低":"离地近","长":"距离大","短":"距离小",
    "开":"打开","关":"闭合","生":"长出来","死":"生命结束","老":"年纪大","少":"数量小","多":"数量大","早":"时间靠前",
    "晚":"时间靠后","红":"像血色","绿":"草色","蓝":"天色","黄":"金色","黑":"墨色","花":"植物繁殖器官","鸟":"飞禽",
    "鱼":"水中动物","虫":"小昆虫","马":"大牲口","牛":"家畜","羊":"家畜","狗":"看家动物","猫":"捕鼠动物","书":"著作",
    "车":"陆上交通工具","船":"水上交通工具","刀":"切物工具","笔":"写字工具","学":"学习","问":"请教","答":"回答",
    "知":"晓得","想":"思考","怕":"害怕","喜":"高兴","哭":"流泪","睡":"闭眼休息","起":"站起","坐":"坐下",
    "立":"站","跑":"快步","跳":"离地","听":"用耳接收","读":"看着念","写":"用笔记","画":"描形","名":"名字",
    "字":"文字","词":"语句单位","句":"完整话","歌":"歌曲","舞":"舞蹈","球":"圆体育用品","糖":"甜食品","果":"植物果实",
    "米":"粮食","面":"面粉","肉":"禽兽肉","菜":"蔬菜","茶":"饮料","杯":"盛液器皿","碗":"盛饭器皿","桌":"有面家具",
    "椅":"坐具","床":"睡具","灯":"照明","窗":"透光处","路":"行走道","桥":"过河建筑","城":"城区","国":"国家",
    "年":"绕日一周","岁":"年龄","春":"第一季","夏":"热季","秋":"收季","冬":"冷季","东":"日出","西":"日落",
    "南":"右方","北":"左方","风":"空气流动","云":"天上白云","星":"天上亮点","光":"亮","声":"声音","色":"颜色",
    "香":"好闻气味","甜":"味好","苦":"味差","冷":"温低","热":"温高","暖":"温和","凉":"微冷","新":"刚出现",
    "旧":"用过","真":"实在","假":"不实","美":"好看","丑":"难看","快":"速高","慢":"速低","远":"距大","近":"距小",
    "明":"亮","暗":"不亮","方":"方形","圆":"圆形","直":"不弯","弯":"曲折","平":"不斜","满":"充实","空":"无物",
    "全":"完整","半":"一半","双":"两个","单":"一个","群":"聚集","个":"量词","只":"量词","条":"量词","朵":"量词",
    "棵":"量词","本":"量词","张":"量词","把":"量词","头":"量词","匹":"量词","辆":"量词","支":"量词","片":"量词",
    "块":"量词","件":"量词","顶":"量词","座":"量词","间":"量词"
  };

  /* ---------- 计算 ---------- */
  const MATH = { tenMax: 10, twentyMax: 20 };

  /* ---------- 英语 ---------- */
  // 每日单词（按主题轮换），每个含 emoji 图与中文
  const EN_WORDS = [
    // animals
    { en:"cat",    cn:"猫",   emoji:"🐱", theme:"动物" },
    { en:"dog",    cn:"狗",   emoji:"🐶", theme:"动物" },
    { en:"fish",   cn:"鱼",   emoji:"🐟", theme:"动物" },
    { en:"bird",   cn:"鸟",   emoji:"🐦", theme:"动物" },
    { en:"rabbit", cn:"兔子", emoji:"🐰", theme:"动物" },
    { en:"elephant",cn:"大象",emoji:"🐘", theme:"动物" },
    // plants
    { en:"flower", cn:"花",   emoji:"🌸", theme:"植物" },
    { en:"tree",   cn:"树",   emoji:"🌳", theme:"植物" },
    { en:"grass",  cn:"草",   emoji:"🌿", theme:"植物" },
    { en:"apple",  cn:"苹果", emoji:"🍎", theme:"植物" },
    // transport
    { en:"car",    cn:"汽车", emoji:"🚗", theme:"交通" },
    { en:"bus",    cn:"公交", emoji:"🚌", theme:"交通" },
    { en:"train",  cn:"火车", emoji:"🚂", theme:"交通" },
    { en:"boat",   cn:"船",   emoji:"⛵", theme:"交通" },
    // life
    { en:"water",  cn:"水",   emoji:"💧", theme:"生活" },
    { en:"milk",   cn:"牛奶", emoji:"🥛", theme:"生活" },
    { en:"book",   cn:"书",   emoji:"📖", theme:"生活" },
    { en:"ball",   cn:"球",   emoji:"⚽", theme:"生活" },
    // weather
    { en:"sun",    cn:"太阳", emoji:"☀️", theme:"天气" },
    { en:"rain",   cn:"雨",   emoji:"🌧️", theme:"天气" },
    { en:"snow",   cn:"雪",   emoji:"❄️", theme:"天气" },
    { en:"wind",   cn:"风",   emoji:"🌬️", theme:"天气" },
    // communication
    { en:"hello",  cn:"你好", emoji:"👋", theme:"交流" },
    { en:"thank you",cn:"谢谢",emoji:"🙏", theme:"交流" },
    { en:"goodbye",cn:"再见", emoji:"👋", theme:"交流" },
    { en:"happy",  cn:"开心", emoji:"😄", theme:"交流" }
  ];
  // 每日小对话（5句/天，带图，故事性）
  const EN_DIALOGUES = [
    {
      title: "在公园里",
      lines: [
        { en:"Hello! I am Amy.",        cn:"你好！我是艾米。", emoji:"👧" },
        { en:"Look! A small dog.",      cn:"看！一只小狗。",   emoji:"🐶" },
        { en:"The dog is happy.",       cn:"小狗很开心。",     emoji:"😄" },
        { en:"I like the dog.",         cn:"我喜欢小狗。",     emoji:"💖" },
        { en:"Goodbye, little dog!",    cn:"再见，小狗！",     emoji:"👋" }
      ]
    },
    {
      title: "吃水果",
      lines: [
        { en:"I am hungry.",            cn:"我饿了。",         emoji:"😋" },
        { en:"An apple, please.",       cn:"请给我一个苹果。", emoji:"🍎" },
        { en:"Red apple is sweet.",     cn:"红苹果很甜。",     emoji:"🍎" },
        { en:"Thank you, mommy.",       cn:"谢谢你，妈妈。",   emoji:"🙏" },
        { en:"Yummy! I am happy.",      cn:"好吃！我好开心。", emoji:"😄" }
      ]
    },
    {
      title: "去上学",
      lines: [
        { en:"Good morning!",           cn:"早上好！",         emoji:"🌞" },
        { en:"I go to school.",         cn:"我去上学。",       emoji:"🏫" },
        { en:"I see my friend.",        cn:"我看见我的朋友。", emoji:"🧒" },
        { en:"We read a book.",         cn:"我们一起读书。",   emoji:"📖" },
        { en:"School is fun!",          cn:"上学真有趣！",     emoji:"🎉" }
      ]
    }
  ];

  /* ---------- 逻辑题（5-7岁） ---------- */
  const LOGIC = [
    { q:"什么东西越洗越脏？", a:"水", hint:"想想你洗手时，什么变脏了？", type:"脑筋急转弯" },
    { q:"小明有3颗糖，妈妈又给了2颗，现在有几颗？", a:"5", hint:"把两堆合起来数一数", type:"算术" },
    { q:"树上原来有5只鸟，飞走了2只，还剩几只？", a:"3", hint:"用减法想一想", type:"算术" },
    { q:"什么动物最怕冷，一到冬天就冬眠？", a:"熊", hint:"它会睡很长很长的觉", type:"常识" },
    { q:"1只手有5根手指，2只手有几根？", a:"10", hint:"5加5等于多少？", type:"算术" },
    { q:"什么东西有头有脚，却没有身体？", a:"床", hint:"你每天晚上都会用到它", type:"脑筋急转弯" },
    { q:"花园里有4朵红花和3朵黄花，一共有几朵花？", a:"7", hint:"红色加黄色", type:"算术" },
    { q:"什么车寸步难行？", a:"风车", hint:"它只会转，不会走", type:"脑筋急转弯" },
    { q:"艾米前面有2个人，后面有3个人，这一队共有几人？", a:"6", hint:"别忘了算上艾米自己", type:"算术" },
    { q:"什么越生气越大？", a:"脾气", hint:"生气的时候它会变大", type:"脑筋急转弯" },
    { q:"盘子里有6块饼干，吃掉2块，还剩几块？", a:"4", hint:"用减法", type:"算术" },
    { q:"什么布剪不断？", a:"瀑布", hint:"它是从高处落下的水", type:"脑筋急转弯" },
    { q:"什么动物白天睡觉，晚上出来捉老鼠？", a:"猫头鹰", hint:"它有一双大大的眼睛", type:"常识" },
    { q:"艾米有10块糖，送给好朋友4块，还剩几块？", a:"6", hint:"用减法算一算", type:"算术" },
    { q:"鱼缸里有3条红鱼和2条黑鱼，一共有几条鱼？", a:"5", hint:"红色加黑色", type:"算术" },
    { q:"什么东西天气越热，它爬得越高？", a:"温度计", hint:"它会显示温度高低", type:"常识" },
    { q:"一个星期有几天？", a:"7", hint:"星期一到星期日", type:"常识" },
    { q:"艾米买2支笔，每支3元，一共花了几元？", a:"6", hint:"2个3相加", type:"算术" },
    { q:"什么动物耳朵长、尾巴短，最爱吃胡萝卜？", a:"兔子", hint:"它蹦蹦跳跳真可爱", type:"常识" },
    { q:"什么东西掉在地上不会碎，还能弹起来？", a:"皮球", hint:"拍一拍它会跳", type:"常识" },
    { q:"从1数到10，去掉头尾中间还有几个数？", a:"8", hint:"把1和10去掉数一数", type:"算术" },
    { q:"什么动物会冬眠，醒来时春天就到了？", a:"青蛙", hint:"它呱呱叫，捉害虫", type:"常识" },
    { q:"妈妈买了8个橘子，艾米吃了1个，还剩几个？", a:"7", hint:"8减1等于多少？", type:"算术" }
  ];

  /* ---------- 绘本 ---------- */
  const BOOKS = [
    {
      title: "好饿的小毛毛虫",
      cover:"🐛",
      pages:[
        { emoji:"🥚", text:"一颗小小的蛋，躺在叶子上。" },
        { emoji:"🐛", text:"星期天，一条毛毛虫钻出来了，它好饿好饿。" },
        { emoji:"🍎", text:"它吃了一个红苹果，还是觉得饿。" },
        { emoji:"🍐", text:"它又吃了一个梨，还是饿。" },
        { emoji:"🦋", text:"后来，它变成了一只美丽的蝴蝶！" }
      ]
    },
    {
      title: "晚安，月亮",
      cover:"🌙",
      pages:[
        { emoji:"🌙", text:"天黑了，月亮升起来。" },
        { emoji:"🐰", text:"小兔子盖上小被子。" },
        { emoji:"⭐", text:"星星一闪一闪，像小灯笼。" },
        { emoji:"😴", text:"小兔子闭上眼睛，睡着了。" },
        { emoji:"💤", text:"晚安，月亮。晚安，宝贝。" }
      ]
    },
    {
      title: "彩虹朋友",
      cover:"🌈",
      pages:[
        { emoji:"🌧️", text:"下过雨，天空湿湿的。" },
        { emoji:"🌈", text:"一道彩虹挂上天，红橙黄绿青蓝紫。" },
        { emoji:"☀️", text:"太阳公公笑了。" },
        { emoji:"🐦", text:"小鸟说：彩虹像一座桥！" },
        { emoji:"💖", text:"艾米说：彩虹是我的好朋友。" }
      ]
    },
    {
      title: "小火车嘟嘟",
      cover:"🚂",
      pages:[
        { emoji:"🚂", text:"小火车鸣鸣叫：嘟嘟！" },
        { emoji:"🎁", text:"它拉着一车礼物。" },
        { emoji:"⛰️", text:"它穿过黑黑的山洞。" },
        { emoji:"🏠", text:"它把礼物送到每个小动物的家。" },
        { emoji:"🎉", text:"大家都说：谢谢小火车！" }
      ]
    },
    {
      title: "小熊找朋友",
      cover:"🐻",
      pages:[
        { emoji:"🐻", text:"一只小熊想找一个好朋友。" },
        { emoji:"🌳", text:"它走过森林，遇见小兔子。" },
        { emoji:"🐰", text:"小兔子说：我们一起玩吧！" },
        { emoji:"⚽", text:"它们踢球、捉迷藏，玩得真开心。" },
        { emoji:"🤝", text:"小熊终于有了一个好朋友！" }
      ]
    },
    {
      title: "会唱歌的小鸟",
      cover:"🐤",
      pages:[
        { emoji:"🥚", text:"树上有一个小小的鸟窝。" },
        { emoji:"🐤", text:"小鸟破壳而出，叽叽喳喳。" },
        { emoji:"🎵", text:"它每天练习唱歌，声音越来越好听。" },
        { emoji:"🌞", text:"清晨，它用歌声叫醒太阳。" },
        { emoji:"💖", text:"大家都说：这是最动听的歌！" }
      ]
    },
    {
      title: "月亮船",
      cover:"🌙",
      pages:[
        { emoji:"🌙", text:"夜晚，一艘弯弯的月亮船挂在天上。" },
        { emoji:"⭐", text:"小星星跳上船，一起去看夜空。" },
        { emoji:"🐟", text:"它们看见银河里游着发光的小鱼。" },
        { emoji:"🌌", text:"月亮船轻轻摇晃，像摇篮一样。" },
        { emoji:"😴", text:"玩累了，星星们闭上眼睛睡着了。" }
      ]
    },
    {
      title: "勇敢的小刺猬",
      cover:"🦔",
      pages:[
        { emoji:"🦔", text:"小刺猬身上长满尖尖的刺。" },
        { emoji:"🍎", text:"它用刺扎起掉落的苹果，帮妈妈搬回家。" },
        { emoji:"🦊", text:"大灰狼来了，小刺猬缩成一团，狼咬不动。" },
        { emoji:"🛡️", text:"小刺猬一点都不怕，保护了小伙伴。" },
        { emoji:"🎉", text:"大家都夸它是勇敢的小英雄！" }
      ]
    }
  ];

  /* ---------- 游戏清单 ---------- */
  const GAMES = [
    { key:"memory", name:"记忆翻牌", ico:"🃏", desc:"翻开卡片，记住位置，找出相同的配对！" },
    { key:"diff",   name:"两图找不同", ico:"🔍", desc:"左右两幅图有几处不同，快来找出它们！" },
    { key:"count",  name:"数数闯关", ico:"🔢", desc:"数一数画面里有几个，点出正确数字！" },
    { key:"gomoku", name:"五子棋", ico:"⚫", desc:"黑白对战，先在横竖斜连成五子就赢！" },
    { key:"sudoku", name:"数独", ico:"🔢", desc:"在格子里填数，每行每列每宫都不重复！" },
    { key:"shapes", name:"图形和立方体", ico:"🔺", desc:"认识平面图形和立体图形，考考你！" },
    { key:"pattern",name:"找规律", ico:"🔁", desc:"找出图形和数字排列的规律，猜下一个！" },
    { key:"chinamap",name:"中国地图拼图", ico:"🗺️", desc:"把各个省份拖到地图上的正确位置，拼出我们美丽的中国！" }
  ];

  /* ---------- 奖励：两层兑换 ---------- */
  const REWARDS = {
    items: [
      { key:"flower",  name:"小红花", ico:"🌺" },
      { key:"candy",   name:"糖果",   ico:"🍬" },
      { key:"sapling", name:"小树苗", ico:"🌱" },
      { key:"pearl",   name:"大珍珠", ico:"💎" },
      { key:"kitten",  name:"小花猫", ico:"🐱" }
    ],
    // 第一层：红花 → 实物奖励；第二层：树苗/珍珠/猫 → 体验奖励
    exchange: [
      { from:"flower",  to:"candy",   cost:100, label:"100 朵小红花 → 1 颗糖果" },
      { from:"flower",  to:"sapling", cost:150, label:"150 朵小红花 → 1 颗小树苗" },
      { from:"sapling", to:"tv",      cost:2,   label:"2 颗小树苗 → 30 分钟电视" },
      { from:"sapling", to:"pearl",   cost:3,   label:"3 颗小树苗 → 1 颗大珍珠" },
      { from:"pearl",   to:"money",   cost:2,   label:"2 颗大珍珠 → 奖励 2 元" },
      { from:"sapling", to:"kitten",  cost:5,   label:"5 颗小树苗 → 1 只小花猫" },
      { from:"kitten",  to:"park",    cost:5,   label:"5 只小花猫 → 1 次游乐场" }
    ],
    // 体验奖励的说明（不可再兑换，终点）
    experiences: {
      tv:    { name:"30分钟电视", ico:"📺" },
      money: { name:"奖励2元",    ico:"💰" },
      park:  { name:"游乐场一次", ico:"🎡" }
    }
  };

  /* ---------- 诗人信息（生卒年，诗词释义用） ---------- */
  const POETS = {
    "李白":   { born:701,  died:762, dynasty:"唐" },
    "杜甫":   { born:712,  died:770, dynasty:"唐" },
    "白居易": { born:772,  died:846, dynasty:"唐" },
    "杜牧":   { born:803,  died:852, dynasty:"唐" },
    "王维":   { born:701,  died:761, dynasty:"唐" },
    "孟浩然": { born:689,  died:740, dynasty:"唐" },
    "王之涣": { born:688,  died:742, dynasty:"唐" },
    "李商隐": { born:813,  died:858, dynasty:"唐" },
    "柳宗元": { born:773,  died:819, dynasty:"唐" },
    "贺知章": { born:659,  died:744, dynasty:"唐" },
    "刘禹锡": { born:772,  died:842, dynasty:"唐" },
    "王昌龄": { born:698,  died:757, dynasty:"唐" },
    "骆宾王": { born:619,  died:687, dynasty:"唐" },
    "贾岛":   { born:779,  died:843, dynasty:"唐" },
    "张继":   { born:"约715", died:779, dynasty:"唐" }
  };

  /* ---------- 打卡 ---------- */
  const CALENDAR = { streakReward: 5, streakDays: 7 };

  /* ---------- 节日数据（用于顶部日期提醒与说明） ---------- */
  // date 为 "MM-DD"（每年固定）或 "YYYY-MM-DD"（农历/特定年份节日，已换算为 2026 公历日期）
  const FESTIVALS = [
    { date:"01-01", name:"元旦",       emoji:"🎉", desc:"新年的第一天，一起许下美好的愿望吧！" },
    { date:"03-08", name:"妇女节",     emoji:"👩", desc:"向妈妈、奶奶、老师等所有女性说声：辛苦啦！" },
    { date:"03-12", name:"植树节",     emoji:"🌳", desc:"种下一棵小树苗，守护我们的地球家园。" },
    { date:"04-01", name:"愚人节",     emoji:"🤡", desc:"今天可以友好地开个小玩笑，但千万不要骗人哦。" },
    { date:"05-01", name:"劳动节",     emoji:"🛠️", desc:"感谢爸爸妈妈和所有辛苦工作的人。" },
    { date:"06-01", name:"儿童节",     emoji:"🧒", desc:"专属小朋友的节日，艾米儿童节快乐！" },
    { date:"09-10", name:"教师节",     emoji:"🍎", desc:"别忘了谢谢教你知识的老师。" },
    { date:"10-01", name:"国庆节",     emoji:"🇨🇳", desc:"祖国妈妈的生日，举国同庆！" },
    { date:"12-25", name:"圣诞节",     emoji:"🎄", desc:"温馨的节日，把祝福送给身边的人。" },
    // —— 农历节日（已换算为 2026 年公历日期）——
    { date:"2026-02-17", name:"春节",   emoji:"🧧", desc:"农历新年！穿新衣、收红包、放鞭炮，过大年啦！" },
    { date:"2026-03-03", name:"元宵节", emoji:"🏮", desc:"正月十五，吃汤圆、赏花灯，团团圆圆。" },
    { date:"2026-04-05", name:"清明节", emoji:"🌿", desc:"踏青扫墓，怀念故人，也去户外感受春天。" },
    { date:"2026-06-19", name:"端午节", emoji:"🐉", desc:"吃粽子、赛龙舟，纪念伟大的诗人屈原。" },
    { date:"2026-08-19", name:"七夕节", emoji:"💕", desc:"牛郎织女鹊桥相会的浪漫日子。" },
    { date:"2026-09-25", name:"中秋节", emoji:"🌕", desc:"赏明月、吃月饼，阖家团圆最有味。" },
    { date:"2026-10-19", name:"重阳节", emoji:"🍂", desc:"敬老爱老的好日子，陪爷爷奶奶登高望远。" }
  ];

  // 返回某天的节日 {name,emoji,desc} 或 null（含母亲节/父亲节动态计算）
  function festivalOf(dateStr) {
    if (!dateStr) return null;
    const y = +dateStr.slice(0, 4);
    const dyn = [
      { date: nthSunday(y, 5, 2), name:"母亲节", emoji:"💐", desc:"向妈妈大声说爱她，谢谢她的照顾！" },
      { date: nthSunday(y, 6, 3), name:"父亲节", emoji:"🤴", desc:"给爸爸一个拥抱，感谢他的陪伴！" }
    ];
    const all = FESTIVALS.concat(dyn);
    const md = dateStr.slice(5); // "MM-DD"
    for (const f of all) {
      if (f.date.length === 5) { if (md === f.date) return { name: f.name, emoji: f.emoji, desc: f.desc }; }
      else { if (f.date === dateStr) return { name: f.name, emoji: f.emoji, desc: f.desc }; }
    }
    return null;
  }
  // 计算某年某月第 n 个星期日的日期字符串
  function nthSunday(y, month, n) {
    const first = new Date(y, month - 1, 1);
    const dow = first.getDay();          // 0=周日
    const firstSun = 1 + ((7 - dow) % 7);
    const day = firstSun + (n - 1) * 7;
    return `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  /* ---------- 每日表现（8 项行为，good/bad 对应红花增减） ---------- */
  const BEHAVIORS = [
    { id:"calm",    label:"遇事不哭闹，好好表达",          good:{ label:"做到了 +2", delta:2 },  bad:{ label:"哭闹了 -2", delta:-2 } },
    { id:"sleep",   label:"早睡早起（10 点前上床）",        good:{ label:"10点前 +2", delta:2 },  bad:{ label:"迟于10点 -1", delta:-1 } },
    { id:"study",   label:"主动在「学习平台」打卡学习",      good:{ label:"打卡了 +2", delta:2 },  bad:{ label:"没打卡 -2", delta:-2 } },
    { id:"hibob",   label:"主动学习 HiBob",                 good:{ label:"学了 +2", delta:2 },    bad:{ label:"没学 -2", delta:-2 } },
    { id:"tidy",    label:"收纳玩具、打扫好书桌",            good:{ label:"整洁 +1", delta:1 },    bad:{ label:"没收拾 -1", delta:-1 } },
    { id:"eat",     label:"吃饭不拖拉、不剩饭",              good:{ label:"做到了 +2", delta:2 },  bad:{ label:"没做到 -2", delta:-2 } },
    { id:"wash",    label:"进门洗手、换鞋、换衣服",          good:{ label:"做到了 +1", delta:1 },  bad:{ label:"没做到 -1", delta:-1 } },
    { id:"share",   label:"分享学校里的学习成果",            good:{ label:"分享好 +3", delta:3 },  bad:{ label:"没分享 0", delta:0 } },
    { id:"exercise",label:"锻炼 / 跳舞动作",                good:{ label:"锻炼了 +1", delta:1 },  bad:{ label:"没锻炼 -1", delta:-1 } },
    { id:"help",    label:"主动帮助或夸奖他人",             good:{ label:"做到了 +1", delta:1 },  bad:{ label:"没做 0", delta:0 } },
    { id:"swear",   label:"与他人生气说脏话",               good:{ label:"没说 0", delta:0 },     bad:{ label:"说脏话 -2", delta:-2 } }
  ];

  /* ---------- 游戏：两图找不同场景 ---------- */
  // 每场景 base 为左图，diffs 中 right 为右图对应位置不同的图案；孩子点右图不同处
  const DIFF_SCENES = [
    {
      ico:"🌸", name:"花园里找不同", desc:"左右两幅花园图有 3 处不一样，点出右边不同的地方！",
      base: ["🌸","🌿","🌸","🌿","🌿","🦋","🌿","🌸","🌸","🌿","⭐","🌿","🌿","🌸","🌿","🐝"],
      diffs: [ { i:5, right:"🐞" }, { i:10, right:"🌟" }, { i:15, right:"🐞" } ]
    },
    {
      ico:"☁️", name:"天空找不同", desc:"天上的宝贝有 3 处不同，仔细看右边哦！",
      base: ["☀️","☁️","☀️","⭐","🌈","☁️","🌈","☀️","⭐","☀️","☁️","🌈","☀️","⭐","☁️","🌙"],
      diffs: [ { i:1, right:"🌧️" }, { i:8, right:"🌟" }, { i:14, right:"⚡" } ]
    },
    {
      ico:"🐄", name:"农场找不同", desc:"农场里的小动物有 3 处变化，找出来吧！",
      base: ["🐄","🌾","🐄","🌾","🐔","🌾","🐔","🐄","🌾","🐄","🌾","🐔","🐄","🌾","🐔","🐑"],
      diffs: [ { i:0, right:"🐂" }, { i:5, right:"🍀" }, { i:12, right:"🐎" } ]
    }
  ];

  /* ---------- 绘画：每日简笔画主题（不限制张数，按需持续扩充） ----------
     每个主题含：name 名称 / emoji 代表图 / cat 类目 / step 儿童友好绘画小提示。
     原有 14 个名称（小猫/太阳/房子/大树/小花/小船/星星/彩虹/苹果/小鱼/气球/雪人/月亮/蝴蝶）
     保留不变，以匹配 DRAW_REFS 中的手绘 SVG 线稿；其余主题无 SVG 时回退为大 emoji 目标图 + 小提示。 */
  const DRAW_PROMPTS = [
    /* —— 动物 —— */
    { name:"小猫",   emoji:"🐱", cat:"动物", step:"先画一个圆圆的脑袋，添上两只尖尖耳朵和黑黑的小鼻子～" },
    { name:"小狗",   emoji:"🐶", cat:"动物", step:"先画圆脑袋，加两只耷拉耳朵和黑鼻子，再画身体～" },
    { name:"小兔",   emoji:"🐰", cat:"动物", step:"先画圆脸，再加两只长长的耳朵和一个小三角嘴～" },
    { name:"大象",   emoji:"🐘", cat:"动物", step:"先画大大的身体，再画长长的鼻子和一把大扇子耳朵～" },
    { name:"长颈鹿", emoji:"🦒", cat:"动物", step:"先画高高的脖子，再点上一身橙色的小斑点点～" },
    { name:"熊猫",   emoji:"🐼", cat:"动物", step:"先画圆圆的白身子，再加黑眼圈、黑胳膊和黑腿～" },
    { name:"老虎",   emoji:"🐯", cat:"动物", step:"先画圆脑袋，加一个王字和橙色条纹，别忘了尖尖牙～" },
    { name:"狮子",   emoji:"🦁", cat:"动物", step:"先画脸，再围上一圈棕色的鬃毛，像小太阳～" },
    { name:"猴子",   emoji:"🐵", cat:"动物", step:"先画圆脑袋和小圆耳朵，再加一条弯弯卷卷的尾巴～" },
    { name:"企鹅",   emoji:"🐧", cat:"动物", step:"先画白白胖胖的肚子，再加黑背和小尖嘴～" },
    { name:"乌龟",   emoji:"🐢", cat:"动物", step:"先画圆圆的硬壳，再伸出小脑袋和四条小腿～" },
    { name:"青蛙",   emoji:"🐸", cat:"动物", step:"先画一个大半圆的身体，加上两只大眼睛和笑脸～" },
    { name:"蜗牛",   emoji:"🐌", cat:"动物", step:"先画一个螺旋的小房子，再伸出软软的身体～" },
    { name:"蜜蜂",   emoji:"🐝", cat:"动物", step:"先画椭圆身子，加黄黑条纹和一对小翅膀～" },
    { name:"蝴蝶",   emoji:"🦋", cat:"动物", step:"先画身体，再加两对带花斑的大翅膀～" },
    { name:"螃蟹",   emoji:"🦀", cat:"动物", step:"先画扁扁的身体，再加两只大钳子和许多小腿～" },
    { name:"小鱼",   emoji:"🐟", cat:"动物", step:"先画椭圆鱼身，加圆眼睛、小尾巴和泡泡～" },
    { name:"鲨鱼",   emoji:"🦈", cat:"动物", step:"先画长长尖尖的身体，再加背上的三角鳍～" },
    { name:"鲸鱼",   emoji:"🐳", cat:"动物", step:"先画一个大大的水滴身体，再喷一股小水柱～" },
    { name:"河马",   emoji:"🦛", cat:"动物", step:"先画大方头，加两只小耳朵和笑嘻嘻的大嘴～" },
    { name:"小鸡",   emoji:"🐤", cat:"动物", step:"先画圆圆的黄身子，加尖尖小嘴和点点眼睛～" },
    { name:"鸭子",   emoji:"🦆", cat:"动物", step:"先画圆身子，加扁扁的橙嘴和一条波浪尾巴～" },
    { name:"猫头鹰", emoji:"🦉", cat:"动物", step:"先画圆脸，加两只大眼睛和尖尖的小嘴～" },
    { name:"刺猬",   emoji:"🦔", cat:"动物", step:"先画半圆身子，再加满身的尖刺和小鼻子～" },
    { name:"松鼠",   emoji:"🐿️", cat:"动物", step:"先画圆身子，加一条毛茸茸的大尾巴～" },
    { name:"马",     emoji:"🐴", cat:"动物", step:"先画长脸和飘逸的鬃毛，再加四条长腿～" },
    { name:"牛",     emoji:"🐮", cat:"动物", step:"先画方方的头，加两只弯弯的牛角和鼻子圈～" },
    { name:"羊",     emoji:"🐑", cat:"动物", step:"先画卷卷的毛团身子，加一张小脸和四条腿～" },
    { name:"猪",     emoji:"🐷", cat:"动物", step:"先画圆滚滚的粉身子，加卷卷小尾巴和猪鼻子～" },
    { name:"蛇",     emoji:"🐍", cat:"动物", step:"先画一条弯弯曲曲的长身体，再加小眼睛和信子～" },
    { name:"恐龙",   emoji:"🦖", cat:"动物", step:"先画大大的头和锋利的牙，再加长尾巴和强壮的腿～" },
    { name:"龙",     emoji:"🐲", cat:"动物", step:"先画长长身体和鹿角，再加四只爪子和胡须～" },
    /* —— 食物 —— */
    { name:"苹果",   emoji:"🍎", cat:"食物", step:"先画一个圆圆的果子，加小叶子和小肚脐～" },
    { name:"香蕉",   emoji:"🍌", cat:"食物", step:"先画弯弯的月牙形，再加两头的小黑点和棱线～" },
    { name:"西瓜",   emoji:"🍉", cat:"食物", step:"先画半个大圆，加绿皮、红瓤和黑籽～" },
    { name:"草莓",   emoji:"🍓", cat:"食物", step:"先画心形身子，加点点籽和顶上的小叶子～" },
    { name:"葡萄",   emoji:"🍇", cat:"食物", step:"先画一串小圆圈，再加卷卷的藤～" },
    { name:"橙子",   emoji:"🍊", cat:"食物", step:"先画圆圆的橙球，加小肚脐和小叶子～" },
    { name:"蛋糕",   emoji:"🍰", cat:"食物", step:"先画分层方块，加奶油小花和一颗樱桃～" },
    { name:"冰淇淋", emoji:"🍦", cat:"食物", step:"先画尖尖蛋筒，再叠上圆圆的冰淇淋球～" },
    { name:"棒棒糖", emoji:"🍭", cat:"食物", step:"先画一个彩色大圆，再加一根小棍～" },
    { name:"甜甜圈", emoji:"🍩", cat:"食物", step:"先画一个带洞的圆，撒上学点小糖粒～" },
    { name:"披萨",   emoji:"🍕", cat:"食物", step:"先画三角形切块，加芝士和小红椒～" },
    { name:"汉堡",   emoji:"🍔", cat:"食物", step:"先画上下两片面包，中间夹肉、菜和芝士～" },
    { name:"饼干",   emoji:"🍪", cat:"食物", step:"先画圆圆饼干，加几颗巧克力豆～" },
    { name:"面包",   emoji:"🍞", cat:"食物", step:"先画一个胖胖的长椭圆，加几道切口～" },
    { name:"汤圆",   emoji:"🥟", cat:"食物", step:"先画一个小碗，里面放上几个白白的圆团～" },
    { name:"糖果",   emoji:"🍬", cat:"食物", step:"先画一个圆糖，再加两边的彩色糖纸～" },
    { name:"雪糕",   emoji:"🍨", cat:"食物", step:"先画长方冰棒，加小棍和彩色条纹～" },
    /* —— 自然 —— */
    { name:"太阳",   emoji:"☀️", cat:"自然", step:"先画一个圆，周围加放射的光芒线～" },
    { name:"月亮",   emoji:"🌙", cat:"自然", step:"先画一个弯弯的月牙，像笑眯眯的小船～" },
    { name:"星星",   emoji:"⭐", cat:"自然", step:"先画一个五角星，再加亮亮的光点～" },
    { name:"云",     emoji:"☁️", cat:"自然", step:"先画几个连在一起的小圆弧，变成一朵软软的云～" },
    { name:"彩虹",   emoji:"🌈", cat:"自然", step:"先画一道弯弯的桥，再涂红橙黄绿青蓝紫～" },
    { name:"大树",   emoji:"🌳", cat:"自然", step:"先画粗粗的树干，再加一个圆圆的绿树冠～" },
    { name:"小花",   emoji:"🌸", cat:"自然", step:"先画一圈花瓣，中间加花蕊，下面加花茎～" },
    { name:"小草",   emoji:"🌿", cat:"自然", step:"先画一条竖线，再添上两片尖尖的小叶子～" },
    { name:"雪花",   emoji:"❄️", cat:"自然", step:"先画一个十字，再加六条分枝像小星星～" },
    { name:"雨滴",   emoji:"💧", cat:"自然", step:"先画一个水滴形，加几条下落的短线～" },
    { name:"闪电",   emoji:"⚡", cat:"自然", step:"先画一条弯弯的折线，加一点小分叉～" },
    { name:"山",     emoji:"⛰️", cat:"自然", step:"先画一个三角形山顶，再加雪白的山尖～" },
    { name:"河流",   emoji:"🌊", cat:"自然", step:"先画几条弯弯的波浪线，像在跳舞～" },
    { name:"火山",   emoji:"🌋", cat:"自然", step:"先画一座小山，山顶喷出红红的岩浆～" },
    { name:"仙人掌", emoji:"🌵", cat:"自然", step:"先画一个胖柱子，加两只小手和几朵小花～" },
    { name:"叶子",   emoji:"🍃", cat:"自然", step:"先画一片椭圆，加中间一条叶脉～" },
    { name:"火",     emoji:"🔥", cat:"自然", step:"先画两个跳舞的火苗，加一点小火苗～" },
    { name:"雪人",   emoji:"⛄", cat:"自然", step:"先画一大一小两个圆，加胡萝卜鼻子和扣子～" },
    /* —— 交通 —— */
    { name:"汽车",   emoji:"🚗", cat:"交通", step:"先画一个半圆车顶，再加车身和圆圆的轮子～" },
    { name:"公交车", emoji:"🚌", cat:"交通", step:"先画长方车身，加一排小窗和轮子～" },
    { name:"火车",   emoji:"🚂", cat:"交通", step:"先画车头，加一节节车厢和圆圆的轮子～" },
    { name:"自行车", emoji:"🚲", cat:"交通", step:"先画两个圆轮子，加车架和车把～" },
    { name:"飞机",   emoji:"✈️", cat:"交通", step:"先画一个长机身，再加两只翅膀和尾翼～" },
    { name:"火箭",   emoji:"🚀", cat:"交通", step:"先画尖尖头，加圆身体和喷火的尾巴～" },
    { name:"小船",   emoji:"⛵", cat:"交通", step:"先画弯弯的船身，再加一面三角帆～" },
    { name:"救护车", emoji:"🚑", cat:"交通", step:"先画长方车身，加红十字符号和闪灯～" },
    { name:"消防车", emoji:"🚒", cat:"交通", step:"先画红车身，加长梯子和闪灯～" },
    { name:"警车",   emoji:"🚓", cat:"交通", step:"先画白车身，加蓝红条和警灯～" },
    /* —— 物品 —— */
    { name:"房子",   emoji:"🏠", cat:"物品", step:"先画三角形屋顶，再加方方的屋身和门窗～" },
    { name:"城堡",   emoji:"🏰", cat:"物品", step:"先画几个圆顶塔楼，加旗帜和小窗户～" },
    { name:"帐篷",   emoji:"⛺", cat:"物品", step:"先画一个三角帐篷，加中间的门和支点～" },
    { name:"桥",     emoji:"🌉", cat:"物品", step:"先画一道弯弯的桥面，加桥墩和栏杆～" },
    { name:"灯笼",   emoji:"🏮", cat:"物品", step:"先画椭圆灯笼，加顶盖、流苏和竖条纹～" },
    { name:"雨伞",   emoji:"☂️", cat:"物品", step:"先画半圆伞面，加伞柄和弯钩～" },
    { name:"时钟",   emoji:"⏰", cat:"物品", step:"先画一个圆，加十二个数字和长针短针～" },
    { name:"书",     emoji:"📖", cat:"物品", step:"先画两页翻开的书，加书脊和书线～" },
    { name:"铅笔",   emoji:"✏️", cat:"物品", step:"先画一个长木杆，加尖尖铅笔头和小橡皮～" },
    { name:"灯泡",   emoji:"💡", cat:"物品", step:"先画一个圆灯泡，加底部的螺纹～" },
    { name:"风筝",   emoji:"🪁", cat:"物品", step:"先画菱形风筝，加尾巴和长长的线～" },
    { name:"礼物盒", emoji:"🎁", cat:"物品", step:"先画方盒子，加十字丝带和蝴蝶结～" },
    { name:"杯子",   emoji:"☕", cat:"物品", step:"先画一个马克杯，加把手和小热气～" },
    { name:"椅子",   emoji:"🪑", cat:"物品", step:"先画面靠背和坐板，加四条腿～" },
    { name:"气球",   emoji:"🎈", cat:"物品", step:"先画一个圆圆气球，加小尾巴和绳子～" },
    { name:"机器人", emoji:"🤖", cat:"物品", step:"先画方头方身，加天线、圆眼和按钮～" },
    /* —— 人物 —— */
    { name:"男孩",   emoji:"👦", cat:"人物", step:"先画圆脸和头发，加身体和挥动的手～" },
    { name:"女孩",   emoji:"👧", cat:"人物", step:"先画圆脸和小辫子，加裙子和小鞋～" },
    { name:"爸爸",   emoji:"👨", cat:"人物", step:"先画圆脸和短发，加方方肩膀～" },
    { name:"妈妈",   emoji:"👩", cat:"人物", step:"先画圆脸和长发，加温柔的笑～" },
    { name:"宝宝",   emoji:"👶", cat:"人物", step:"先画大大的圆脑袋，加小身子和小手～" },
    { name:"医生",   emoji:"🧑‍⚕️", cat:"人物", step:"先画圆脸和白大褂，加听诊器～" },
    { name:"老师",   emoji:"👩‍🏫", cat:"人物", step:"先画圆脸和眼镜，加教鞭和书～" },
    { name:"警察",   emoji:"👮", cat:"人物", step:"先画圆脸和帽子，加制服和哨子～" },
    { name:"宇航员", emoji:"🧑‍🚀", cat:"人物", step:"先画圆头盔，加胖胖的航天服～" },
    { name:"超人",   emoji:"🦸", cat:"人物", step:"先画披风和人字标志，加飞翔姿势～" },
    { name:"公主",   emoji:"👸", cat:"人物", step:"先画皇冠和长发，加漂亮的裙子～" },
    { name:"天使",   emoji:"😇", cat:"人物", step:"先画圆脸和光环，加一对小翅膀～" },
    /* —— 节日 / 场景 —— */
    { name:"圣诞树", emoji:"🎄", cat:"节日", step:"先画三层三角，加顶上的星星和彩球～" },
    { name:"南瓜灯", emoji:"🎃", cat:"节日", step:"先画一个胖南瓜，加三角眼和咧嘴笑～" },
    { name:"月饼",   emoji:"🥮", cat:"节日", step:"先画花边圆饼，加中间的精美花纹～" },
    { name:"生日蛋糕", emoji:"🎂", cat:"节日", step:"先画面蜡烛的蛋糕，加奶油和樱桃～" },
    { name:"烟花",   emoji:"🎆", cat:"节日", step:"先画几道放射线，再加点点火花～" },
    /* —— 海洋 / 天空 —— */
    { name:"海星",   emoji:"🌟", cat:"海洋", step:"先画五角星身体，加小圆点和笑脸～" },
    { name:"贝壳",   emoji:"🐚", cat:"海洋", step:"先画扇贝形，加一道道纹路～" },
    { name:"水母",   emoji:"🪼", cat:"海洋", step:"先画圆圆伞盖，加飘动的长触手～" },
    { name:"海豚",   emoji:"🐬", cat:"海洋", step:"先画弯弯的身体，加笑嘴和背鳍～" },
    { name:"小鸟",   emoji:"🐦", cat:"天空", step:"先画圆身子和尖嘴，加翅膀和尾巴～" },
    { name:"老鹰",   emoji:"🦅", cat:"天空", step:"先画大翅膀，加钩钩嘴和利爪～" },
    { name:"信鸽",   emoji:"🕊️", cat:"天空", step:"先画白鸽，加嘴里的小橄榄枝～" }
  ];

  /* ---------- 绘画范本：每个主题的简笔画（线条稿，供孩子仿照） ---------- */
  const DRAW_REFS = {
    "小猫": `<svg viewBox="0 0 200 200" width="100%" xmlns="http://www.w3.org/2000/svg" style="stroke:#444;stroke-width:4;fill:none;stroke-linecap:round;stroke-linejoin:round"><path d="M60 62 L72 28 L92 58"/><path d="M140 62 L128 28 L108 58"/><circle cx="100" cy="106" r="52" style="fill:#fff7fb"/><circle cx="82" cy="100" r="7" style="fill:#444"/><circle cx="118" cy="100" r="7" style="fill:#444"/><path d="M93 118 L107 118 L100 127 Z" style="fill:#ff9ec4"/><path d="M100 127 Q88 140 78 130"/><path d="M100 127 Q112 140 122 130"/><path d="M50 102 H74"/><path d="M50 114 H72"/><path d="M150 102 H126"/><path d="M150 114 H128"/></svg>`,
    "太阳": `<svg viewBox="0 0 200 200" width="100%" xmlns="http://www.w3.org/2000/svg" style="stroke:#444;stroke-width:4;fill:none;stroke-linecap:round;stroke-linejoin:round"><circle cx="100" cy="100" r="46" style="fill:#fff3c4"/><path d="M100 30 V12"/><path d="M100 170 V188"/><path d="M30 100 H12"/><path d="M170 100 H188"/><path d="M48 48 L36 36"/><path d="M152 48 L164 36"/><path d="M48 152 L36 164"/><path d="M152 152 L164 164"/><circle cx="86" cy="94" r="4" style="fill:#444"/><circle cx="114" cy="94" r="4" style="fill:#444"/><path d="M82 108 Q100 124 118 108"/></svg>`,
    "房子": `<svg viewBox="0 0 200 200" width="100%" xmlns="http://www.w3.org/2000/svg" style="stroke:#444;stroke-width:4;fill:none;stroke-linecap:round;stroke-linejoin:round"><path d="M40 100 L100 45 L160 100"/><rect x="55" y="100" width="90" height="70" style="fill:#fff"/><rect x="88" y="124" width="26" height="46" style="fill:#ffe2c2"/><rect x="64" y="112" width="22" height="22" style="fill:#cfeffd"/><rect x="116" y="112" width="22" height="22" style="fill:#cfeffd"/></svg>`,
    "大树": `<svg viewBox="0 0 200 200" width="100%" xmlns="http://www.w3.org/2000/svg" style="stroke:#444;stroke-width:4;fill:none;stroke-linecap:round;stroke-linejoin:round"><rect x="92" y="110" width="16" height="62" style="fill:#d9b38c"/><circle cx="100" cy="82" r="48" style="fill:#d8f3d0"/><circle cx="68" cy="100" r="28" style="fill:#d8f3d0"/><circle cx="132" cy="100" r="28" style="fill:#d8f3d0"/></svg>`,
    "小花": `<svg viewBox="0 0 200 200" width="100%" xmlns="http://www.w3.org/2000/svg" style="stroke:#444;stroke-width:4;fill:none;stroke-linecap:round;stroke-linejoin:round"><circle cx="100" cy="90" r="15" style="fill:#ffe27a"/><circle cx="100" cy="55" r="14" style="fill:#ffb3d1"/><circle cx="135" cy="75" r="14" style="fill:#ffb3d1"/><circle cx="135" cy="105" r="14" style="fill:#ffb3d1"/><circle cx="100" cy="125" r="14" style="fill:#ffb3d1"/><circle cx="65" cy="105" r="14" style="fill:#ffb3d1"/><circle cx="65" cy="75" r="14" style="fill:#ffb3d1"/><path d="M100 105 V172"/><path d="M100 140 Q130 130 140 150 Q115 162 100 140 Z" style="fill:#bdeeb0"/></svg>`,
    "小船": `<svg viewBox="0 0 200 200" width="100%" xmlns="http://www.w3.org/2000/svg" style="stroke:#444;stroke-width:4;fill:none;stroke-linecap:round;stroke-linejoin:round"><path d="M40 120 L160 120 L140 156 L60 156 Z" style="fill:#ffe2c2"/><path d="M100 120 V52"/><path d="M100 58 L150 116 L100 116 Z" style="fill:#fff"/><path d="M100 52 L120 58 L100 64 Z" style="fill:#ff9ec4"/><path d="M28 168 Q48 156 68 168 T108 168 T148 168 T188 168"/></svg>`,
    "星星": `<svg viewBox="0 0 200 200" width="100%" xmlns="http://www.w3.org/2000/svg" style="stroke:#444;stroke-width:4;fill:none;stroke-linecap:round;stroke-linejoin:round"><path d="M100 28 L121 80 L177 82 L133 117 L150 172 L100 138 L50 172 L67 117 L23 82 L79 80 Z" style="fill:#fff3c4"/></svg>`,
    "彩虹": `<svg viewBox="0 0 200 200" width="100%" xmlns="http://www.w3.org/2000/svg" style="stroke-width:5;fill:none;stroke-linecap:round"><path d="M30 160 A70 70 0 0 1 170 160" style="stroke:#ff6fa3"/><path d="M45 160 A55 55 0 0 1 155 160" style="stroke:#ffce54"/><path d="M60 160 A40 40 0 0 1 140 160" style="stroke:#6cc4ff"/><path d="M75 160 A25 25 0 0 1 125 160" style="stroke:#46c9a3"/><ellipse cx="32" cy="162" rx="24" ry="15" style="fill:#fff;stroke:#ddd"/><ellipse cx="168" cy="162" rx="24" ry="15" style="fill:#fff;stroke:#ddd"/></svg>`,
    "苹果": `<svg viewBox="0 0 200 200" width="100%" xmlns="http://www.w3.org/2000/svg" style="stroke:#444;stroke-width:4;fill:none;stroke-linecap:round;stroke-linejoin:round"><path d="M100 62 C60 62 50 112 60 142 C70 172 130 172 140 142 C150 112 140 62 100 62 Z" style="fill:#ffb3b3"/><path d="M100 62 Q120 42 136 56 Q116 72 100 62 Z" style="fill:#bdeeb0"/><path d="M100 62 V46"/><path d="M80 92 Q75 116 86 136" style="stroke:#fff;opacity:.6"/></svg>`,
    "小鱼": `<svg viewBox="0 0 200 200" width="100%" xmlns="http://www.w3.org/2000/svg" style="stroke:#444;stroke-width:4;fill:none;stroke-linecap:round;stroke-linejoin:round"><ellipse cx="92" cy="106" rx="54" ry="38" style="fill:#bfe9ff"/><path d="M146 106 L178 80 L178 132 Z" style="fill:#bfe9ff"/><circle cx="68" cy="96" r="6" style="fill:#444"/><path d="M92 72 Q98 106 92 140"/><path d="M88 68 Q100 50 114 68" style="fill:#9fd6f5"/><circle cx="58" cy="56" r="6"/><circle cx="44" cy="42" r="4"/></svg>`,
    "气球": `<svg viewBox="0 0 200 200" width="100%" xmlns="http://www.w3.org/2000/svg" style="stroke:#444;stroke-width:4;fill:none;stroke-linecap:round;stroke-linejoin:round"><ellipse cx="100" cy="82" rx="44" ry="54" style="fill:#ffc2dd"/><path d="M100 136 L92 146 L108 146 Z" style="fill:#ffc2dd"/><path d="M100 146 Q90 166 100 182 Q110 196 100 200"/><path d="M82 56 Q78 82 88 108" style="stroke:#fff;opacity:.6"/></svg>`,
    "雪人": `<svg viewBox="0 0 200 200" width="100%" xmlns="http://www.w3.org/2000/svg" style="stroke:#444;stroke-width:4;fill:none;stroke-linecap:round;stroke-linejoin:round"><circle cx="100" cy="142" r="44" style="fill:#fff"/><circle cx="100" cy="78" r="32" style="fill:#fff"/><rect x="64" y="54" width="72" height="9" style="fill:#444"/><path d="M72 54 H128 V44 H72 Z" style="fill:#444"/><circle cx="90" cy="74" r="4" style="fill:#444"/><circle cx="110" cy="74" r="4" style="fill:#444"/><path d="M100 82 L120 86 L100 90 Z" style="fill:#ff9ec4"/><path d="M88 94 Q100 102 112 94"/><path d="M56 132 L26 116"/><path d="M144 132 L174 116"/><circle cx="100" cy="132" r="4" style="fill:#444"/><circle cx="100" cy="148" r="4" style="fill:#444"/></svg>`,
    "月亮": `<svg viewBox="0 0 200 200" width="100%" xmlns="http://www.w3.org/2000/svg" style="stroke:#444;stroke-width:4;fill:none;stroke-linecap:round;stroke-linejoin:round"><path d="M128 38 A62 62 0 1 0 128 162 A48 48 0 1 1 128 38 Z" style="fill:#fff3c4"/></svg>`,
    "蝴蝶": `<svg viewBox="0 0 200 200" width="100%" xmlns="http://www.w3.org/2000/svg" style="stroke:#444;stroke-width:4;fill:none;stroke-linecap:round;stroke-linejoin:round"><ellipse cx="100" cy="102" rx="8" ry="38" style="fill:#444"/><circle cx="100" cy="62" r="10" style="fill:#444"/><path d="M92 80 Q50 48 40 90 Q60 112 92 96 Z" style="fill:#ffc2dd"/><path d="M108 80 Q150 48 160 90 Q140 112 108 96 Z" style="fill:#ffc2dd"/><path d="M92 106 Q55 120 60 156 Q90 150 95 116 Z" style="fill:#bfe9ff"/><path d="M108 106 Q145 120 140 156 Q110 150 105 116 Z" style="fill:#bfe9ff"/><path d="M96 54 Q88 38 80 36"/><path d="M104 54 Q112 38 120 36"/></svg>`
  };

  /* ---------- 绘画每日场景参考：多元素、故事性强、色彩丰富的整幅画 ---------- */
  /* 孩子可以照着画一个“热闹的小故事”，按天轮换（DRAW_SCENES[S.dailyIndex(len)]）。 */
const DRAW_SCENES = [
    { name:"彩虹城堡", emoji:"🏰", story:"在绿色的山坡上，三座彩色圆顶塔楼手拉手。太阳公公笑眯眯，白云像棉花糖飘在蓝天。你可以给城堡画上闪闪发光的窗户和一条通往大门的小路！",
      img:"images/ai-01.jpg" },
    { name:"西瓜冰淇淋", emoji:"🍉", story:"半个甜甜的大西瓜变成冰淇淋碗！一层层彩色冰淇淋球堆得高高的，上面还有草莓和樱桃。夏天吃上一口，清凉又快乐。你最喜欢什么口味的冰淇淋呢？",
      img:"images/ai-02.jpg" },
    { name:"小桥房子", emoji:"🏠", story:"一座可爱的小桥跨在蓝蓝的河水上，桥上的小房子露出甜甜的笑脸。两岸有绿绿的大树和草地，云朵也在微笑。试着画出这个温馨的小桥房子吧！",
      img:"images/ai-03.jpg" },
    { name:"兔子菜园", emoji:"🐰", story:"小白兔抱着最爱的胡萝卜，坐在金黄色的田埂上。周围长着高高的胡萝卜，紫色天空里飘着几朵云。兔子的脸蛋红扑扑的，你也来画一只可爱的小兔子吧！",
      img:"images/ai-04.jpg" },
    { name:"蘑菇小屋", emoji:"🍄", story:"森林深处有一座蘑菇形状的小房子，粉红色的屋顶上点缀着彩色圆点。木门旁边挂着小灯笼，周围开满小花和绿草。你猜小精灵会不会住在里面呢？",
      img:"images/ai-05.jpg" },
    { name:"海底乐园", emoji:"🐠", story:"海底世界五彩缤纷！橙色的小鱼吐着泡泡，绿色海草摇摇摆摆，海星趴在沙地上，还有一只粉色水母在发光。快拿起画笔，画出神秘的海底乐园吧！",
      img:"images/ai-06.jpg" },
    { name:"星空露营", emoji:"⛺", story:"夜晚的山坡上搭着一顶小帐篷，旁边生起温暖的篝火。抬头看，月亮弯弯，星星一闪一闪。萤火虫也提着灯笼飞来啦。画一画这美妙的露营夜晚吧！",
      img:"images/ai-07.jpg" },
    { name:"花园蝴蝶", emoji:"🦋", story:"春天的花园里，一只彩色的大蝴蝶停在花朵上。周围有太阳、白云和绿绿的草地。蝴蝶的翅膀上有好看的斑点，你也来设计一只独一无二的蝴蝶吧！",
      img:"images/ai-08.jpg" },
    { name:"森林蘑菇屋", emoji:"🍄", story:"粉红色的蘑菇屋顶下，住着一座温暖的木头小房子。门口的小路通向森林，周围还有可爱的蘑菇伙伴。一起来画这座森林里的蘑菇小屋吧！",
      img:"images/user-01.jpg" },
    { name:"蓝色小鱼", emoji:"🐟", story:"一条蓝色的鱼儿在海里快乐地游来游去，周围有绿色海草和彩色小泡泡。海底世界真奇妙，你也来画一条小鱼吧！",
      img:"images/user-02.jpg" },
    { name:"夏日西瓜冰", emoji:"🍦", story:"半个大西瓜变成冰淇淋碗，里面装满了五颜六色的冰淇淋球，还有甜甜的草莓和樱桃。夏天就该这样清凉又甜蜜！",
      img:"images/user-03.jpg" },
    { name:"彩虹上的家", emoji:"🌈", story:"一道弯弯的彩虹上，建起了彩色的小房子，旁边有长满果实的树和快乐的小鸟。你想住在彩虹上的家里吗？",
      img:"images/user-04.jpg" },
    { name:"蘑菇小城堡", emoji:"🏰", story:"红色大蘑菇变成了一座小城堡，黄色的小墙上开着蓝色的窗户，太阳公公在旁边微微笑。画出你心中的蘑菇城堡吧！",
      img:"images/user-05.jpg" },
    { name:"彩色仙人掌", emoji:"🌵", story:"一盆胖乎乎的彩色仙人掌，身上长满了白色小点点，还开着漂亮的小花。它坐在漂亮的花盆里，可爱极了！",
      img:"images/user-06.jpg" },
    { name:"小丑鱼旅行", emoji:"🐠", story:"三条橙白相间的小丑鱼在大海里游来游去，周围有绿色海草和蓝色泡泡。它们好像在比赛谁游得快呢！",
      img:"images/user-07.jpg" },
    { name:"美丽的狮子鱼", emoji:"🐡", story:"一条漂亮的狮子鱼张开彩虹色的鱼鳍，像一把彩色的小扇子。它的身上有漂亮的花纹，你也来画一画吧！",
      img:"images/user-08.jpg" },
    { name:"童话城堡", emoji:"🏯", story:"一座圆圆的童话城堡里，住着五颜六色的高塔，屋顶上有星星和花纹装饰。画一画你梦想中的城堡吧！",
      img:"images/user-09.jpg" },
    { name:"沙滩小螃蟹", emoji:"🦀", story:"一只红色的小螃蟹站在沙滩上，挥着大钳子，旁边有黄色的小海星和微笑的太阳。海边真热闹呀！",
      img:"images/user-10.jpg" },
    { name:"彩色蘑菇屋", emoji:"🍄", story:"粉色的蘑菇屋顶上点缀着彩色小圆点，木门前挂着小灯笼，周围有绿叶和红花。小精灵也许就住在这里哦！",
      img:"images/user-11.jpg" },
    { name:"美丽的祖国", emoji:"🚀", story:"火箭飞向蓝天，高铁穿过城市，长城盘绕在祖国大地上，小朋友们穿着漂亮的民族服装载歌载舞。画出你心中美丽的祖国吧！",
      img:"images/user-12.jpg" },
    { name:"蜜蜂花园", emoji:"🐝", story:"勤劳的小蜜蜂在五颜六色的花丛中采蜜，粉色、蓝色、黄色的花儿竞相开放。春天的花园真热闹！",
      img:"images/user-13.jpg" },
    { name:"小鱼吹泡泡", emoji:"🐟", story:"一条彩色的小鱼在海里游来游去，嘴里吐出一串串彩色泡泡。海底的沙子黄黄的，海草绿绿的，真漂亮！",
      img:"images/user-14.jpg" },
    { name:"粉色小鱼", emoji:"🐠", story:"一条粉色的小鱼在蓝色的大海里游泳，身上还有条纹，圆圆的眼睛好可爱。你也来画一条这样的小鱼吧！",
      img:"images/user-15.jpg" },
    { name:"彩色树林", emoji:"🌳", story:"远处是蓝蓝的高山，近处是一片五颜六色的树林，小朋友们在湖边玩耍、划船。秋天的树林像一幅美丽的画！",
      img:"images/user-16.jpg" }
  ];

  /* ---------- 诗词配图关键词 → emoji（用于每句生成插画卡） ---------- */
  const POEM_IMG_KEYWORDS = {
    "明月":"🌕","月亮":"🌙","月":"🌙","故乡":"🏠","乡":"🏠","思":"💭","忆":"💭",
    "春风":"🌬️","春风":"🌸","风":"🌬️","杨柳":"🌿","柳":"🌿","花":"🌸","桃":"🌸","梅":"🌸",
    "雪":"❄️","霜":"🌨️","冰":"🧊","雨":"🌧️","云":"☁️","雾":"🌫️","烟":"🌫️",
    "山":"⛰️","峰":"⛰️","江":"🌊","河":"🌊","海":"🌊","泉":"⛲","水":"💧","溪":"💧",
    "日":"☀️","阳":"☀️","夜":"🌌","星":"⭐","银河":"🌌","天":"🌤️","空":"🌤️",
    "鸟":"🐦","燕":"🐦","雁":"🦅","莺":"🐦","蝶":"🦋","蜂":"🐝","鱼":"🐟","虫":"🐛",
    "春":"🌱","夏":"🌞","秋":"🍂","冬":"❄️","草":"🌿","树":"🌳","林":"🌲","松":"🌲","竹":"🎋","莲":"🪷","荷":"🪷",
    "红":"🔴","白":"⚪","黄":"🟡","绿":"🟢","青":"🟢","紫":"🟣","金":"🟡",
    "人":"🧑","儿":"🧒","童":"🧒","友":"🤝","客":"🧳","君":"🧑","妻":"👩","母":"👩","父":"👨",
    "酒":"🍶","茶":"🍵","楼":"🏯","台":"🏛️","亭":"⛩️","桥":"🌉","船":"⛵","舟":"⛵","马车":"🐴","马":"🐴",
    "歌":"🎤","舞":"💃","笑":"😄","哭":"😢","愁":"🌧️","悲":"💔","喜":"😊","乐":"😄",
    "兵":"⚔️","剑":"⚔️","战":"⚔️","塞":"🏰","关":"🏰","征":"🚩","功":"🏅",
    "龙":"🐉","凤":"🦚","虎":"🐯","鹿":"🦌","兔":"🐰","猿":"🐵","鹤":"🦤","莺":"🐦",
    "书":"📖","诗":"📜","画":"🖼️","琴":"🎻","棋":"♟️","笛":"🎶","鼓":"🥁",
    "火":"🔥","灯":"💡","烛":"🕯️","窗":"🪟","门":"🚪","梦":"💤","影":"👤","光":"✨"
  };

  /* ---------- 图形认知（平面图形 + 立体图形） ---------- */
  const SHAPES = [
    { name:"圆形", dim:"2D", svg:`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="72" style="fill:#ffd6e7;stroke:#444;stroke-width:5"/></svg>` },
    { name:"正方形", dim:"2D", svg:`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="38" y="38" width="124" height="124" style="fill:#cfeffd;stroke:#444;stroke-width:5"/></svg>` },
    { name:"三角形", dim:"2D", svg:`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M100 34 L166 166 L34 166 Z" style="fill:#fff3c4;stroke:#444;stroke-width:5;stroke-linejoin:round"/></svg>` },
    { name:"长方形", dim:"2D", svg:`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="26" y="58" width="148" height="84" style="fill:#d8f3d0;stroke:#444;stroke-width:5"/></svg>` },
    { name:"半圆", dim:"2D", svg:`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M34 122 A66 66 0 0 1 166 122 Z" style="fill:#e7d6ff;stroke:#444;stroke-width:5;stroke-linejoin:round"/></svg>` },
    { name:"正方体", dim:"3D", svg:`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="55" y="62" width="70" height="70" style="fill:#bfe9ff;stroke:#444;stroke-width:5"/><polygon points="55,62 125,62 150,40 80,40" style="fill:#9fd6f5;stroke:#444;stroke-width:5;stroke-linejoin:round"/><polygon points="125,62 150,40 150,110 125,132" style="fill:#7fc4ec;stroke:#444;stroke-width:5;stroke-linejoin:round"/></svg>` },
    { name:"球体", dim:"3D", svg:`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><circle cx="100" cy="100" r="70" style="fill:#ffd6e7;stroke:#444;stroke-width:5"/><ellipse cx="100" cy="100" rx="46" ry="64" style="fill:none;stroke:#f3a9c6;stroke-width:3"/><circle cx="78" cy="74" r="14" style="fill:#fff;opacity:.7"/></svg>` },
    { name:"圆柱", dim:"3D", svg:`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="64" y="56" width="72" height="92" style="fill:#d8f3d0;stroke:#444;stroke-width:5"/><ellipse cx="100" cy="56" rx="36" ry="13" style="fill:#eafbe4;stroke:#444;stroke-width:5"/><ellipse cx="100" cy="148" rx="36" ry="13" style="fill:#b6e3a6;stroke:#444;stroke-width:5"/></svg>` },
    { name:"圆锥", dim:"3D", svg:`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path d="M100 40 L156 158 L44 158 Z" style="fill:#fff3c4;stroke:#444;stroke-width:5;stroke-linejoin:round"/><ellipse cx="100" cy="158" rx="56" ry="14" style="fill:#ffe9a6;stroke:#444;stroke-width:5"/></svg>` },
    { name:"长方体", dim:"3D", svg:`<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><rect x="44" y="66" width="86" height="64" style="fill:#e7d6ff;stroke:#444;stroke-width:5"/><polygon points="44,66 130,66 152,46 66,46" style="fill:#d3bcff;stroke:#444;stroke-width:5;stroke-linejoin:round"/><polygon points="130,66 152,46 152,110 130,130" style="fill:#b79bf0;stroke:#444;stroke-width:5;stroke-linejoin:round"/></svg>` }
  ];

  /* ---------- 找规律 ---------- */
  const PATTERNS = [
    { items:["🔴","⭐","🔴","⭐","🔴"], answer:"⭐", kind:"图形交替出现" },
    { items:["🐱","🐶","🐱","🐶","🐱"], answer:"🐶", kind:"动物交替出现" },
    { items:["🌸","🌿","🌸","🌿","🌸"], answer:"🌿", kind:"花草交替出现" },
    { items:["🍎","🍌","🍎","🍌","🍎"], answer:"🍌", kind:"水果交替出现" },
    { items:["1","2","3","4","5"], answer:"6", kind:"每次多 1" },
    { items:["2","4","6","8","10"], answer:"12", kind:"双数（每次多 2）" },
    { items:["1","3","5","7","9"], answer:"11", kind:"单数（每次多 2）" },
    { items:["5","10","15","20","25"], answer:"30", kind:"5 的倍数" },
    { items:["10","20","30","40","50"], answer:"60", kind:"10 的倍数" },
    { items:["🔺","🔺","🔵","🔺","🔺"], answer:"🔵", kind:"隔两个出现一次" },
    { items:["🌟","🌟","🌟","🌟","🌟"], answer:"🌟", kind:"全都一样" },
    { items:["🟡","🔵","🟢","🟡","🔵"], answer:"🟢", kind:"三种颜色轮流" }
  ];

  /* ---------- 十万个为什么（科普 / 日常知识） ---------- */
  const WHYS = [
    { q:"天空为什么是蓝色的？", a:"太阳光里有七种颜色，其中蓝色光最容易四处散开，把整个天空都染成了蓝色。" },
    { q:"为什么星星会一闪一闪？", a:"星星的光要穿过厚厚、晃动的大气层才能到我们眼睛，所以看起来就像在眨眼睛。" },
    { q:"我们为什么要睡觉？", a:"睡觉的时候，大脑会整理白天学到的事情，身体也会长大、修复疲劳，第二天才更有精神。" },
    { q:"彩虹是怎么来的？", a:"雨后空气里有许多小水珠，阳光照进去会被分成七种颜色，拼起来就是弯弯的彩虹。" },
    { q:"为什么天冷时嘴里会冒白气？", a:"嘴里呼出的热气遇到冷空气，会变成许多小水珠，聚在一起就像一团白雾。" },
    { q:"树叶为什么秋天会变黄、变红？", a:"天冷了，树叶里的绿色会慢慢消失，原本藏着的黄、红颜色就显出来了。" },
    { q:"为什么我们要刷牙？", a:"吃完东西牙齿上会留下小细菌，刷牙能把它们赶走，让牙齿又白又健康。" },
    { q:"小鱼在水里怎么呼吸？", a:"小鱼用鳃把水里的氧气留下、把废气排掉，所以它在水里也能呼吸。" },
    { q:"打雷和闪电哪个先到？", a:"其实它们同时发生，但光跑得比声音快得多，所以我们先看到闪电、后听到雷声。" },
    { q:"为什么面包会发酵变大？", a:"面团里的小酵母会放出气体，把面包撑出一个个小洞，烤出来就松软又蓬松。" },
    { q:"月亮为什么有圆有缺？", a:"月亮自己不发光，我们看到的亮光是太阳照到的部分；它绕着地球转，照到的样子每天在变。" },
    { q:"为什么喝水对身体好？", a:"水帮我们把营养送到全身、把废物排出去，还能让皮肤水嫩、脑袋清醒。" },
    { q:"蜜蜂是怎么采蜜的？", a:"蜜蜂用细细的嘴吸花里的甜汁，存在肚子里带回蜂巢，再做成香甜的蜂蜜。" },
    { q:"为什么运动后心跳会加快？", a:"运动时肌肉要更多力气，心脏就加快跳动，把更多带氧气的血送过去。" },
    { q:"雪为什么是白色的？", a:"雪花是透明的小冰晶，它们把各种颜色的光都反射回来混在一起，看起来就是白色。" },
    { q:"影子是怎么来的？", a:"光沿直线走，被身体挡住的地方照不到光，就留下了黑黑的影子。" },
    { q:"为什么海水是咸的？", a:"雨水把陆地上的盐冲进河里，河水又把盐带进大海；水会蒸发变淡，盐却留了下来，越积越咸。" },
    { q:"猫为什么喜欢舔毛？", a:"猫舔毛是在洗澡、理顺毛发，还能把身上的气味抹匀，让自己安心又干净。" },
    { q:"为什么我们不能一直看电视？", a:"眼睛一直盯近处会疲劳、容易近视；起来动一动，眼睛和身体才更健康。" },
    { q:"冰为什么这么滑？", a:"冰面有一层快化成水的小薄层，脚踩上去像打了蜡，所以特别容易滑。" },
    { q:"为什么我们要吃蔬菜？", a:"蔬菜里有维生素和纤维，能让我们不生病、肠胃通畅，长得高高的。" },
    { q:"知了为什么夏天一直叫？", a:"那是雄知了在用肚子上的小鼓唱歌，一边吸引朋友，一边说夏天好热呀。" },
    { q:"为什么硬币能浮在魔力水上？", a:"把硬币轻轻平放，水的表面像一层有弹性的薄膜，能托住它一小会儿不沉。" },
    { q:"火箭为什么能飞上太空？", a:"火箭尾巴喷出高速气体，气体往后推、火箭就往前冲，快到能冲出地球的大气层。" },
    { q:"为什么会有四季的变化？", a:"地球是歪着身子绕太阳转的，不同地区被太阳照到的多少会随月份变化，于是就有了春夏秋冬。" },
    { q:"为什么大海是蓝色的，浪花却是白的？", a:"深海把蓝光留下来、把别的颜色吸走，所以看起来蓝；浪花打碎成许多小水珠，把各种光都反射回来，就变成白色啦。" },
    { q:"香蕉为什么是弯的？", a:"香蕉小时候朝太阳生长，为了追上阳光，茎会慢慢向上弯，长着长着就变成弯弯的月牙形。" },
    { q:"为什么我们要打预防针？", a:"针里有一点没有危险的病菌碎片，让身体提前学会怎么打败它，以后真的遇到就不怕啦。" },
    { q:"萤火虫为什么会发光？", a:"它肚子里有会发光的物质，遇到空气就亮起来，用来找朋友、吓跑敌人。" },
    { q:"为什么大象的鼻子那么长？", a:"长鼻子能呼吸、闻味道、卷食物，还能当水管喝水洗澡，是它最厉害的多功能工具。" },
    { q:"云是怎么变成雨的？", a:"空气中的水汽越聚越多，变成小水滴；小水滴抱成团太重了，就从天上落下来，成了雨。" },
    { q:"为什么我们有时会长高、有时不长？", a:"长高主要在夜里睡觉和春天，身体分泌生长素；营养、运动和睡眠足够，就长得快。" },
    { q:"恐龙为什么会消失？", a:"科学家猜想，可能有一颗小行星撞地球，灰尘遮住太阳、天气变冷，恐龙没能适应就灭绝了。" },
    { q:"为什么盐能让雪化得更快？", a:"盐撒在雪上会让冰的熔点变低，雪更容易变成水，所以马路撒盐后化得快。" },
    { q:"我们为什么会打嗝？", a:"横膈膜突然抽筋，让空气猛地冲进喉咙、被声带挡住，就发出「嗝」的一声。" },
    { q:"彩虹为什么总是弯的？", a:"阳光在水珠里折射、反射，能照到我们眼睛的角度刚好围成一个圆，所以我们看到的是半圆形的弯弓。" },
    { q:"为什么猫的眼睛在夜里会发亮？", a:"猫眼后面有一层会反光的膜，把微弱的光再反射一次，帮它在黑夜里也能看清东西。" },
    { q:"为什么苹果切开后会变黄？", a:"苹果里的物质碰到空气会氧化，就像铁会生锈一样，颜色就慢慢变黄变褐。" },
    { q:"风是怎么来的？", a:"太阳把各地晒得不一样热，热空气往上跑、冷空气补过来，空气流动起来，就是风。" },
    { q:"为什么星星有的亮有的暗？", a:"有的一开始就更大更亮，有的离我们更远，光变弱了，所以看起来就暗一些。" },
    { q:"为什么我们要每天吃不同颜色的食物？", a:"不同颜色藏着不同的维生素和营养，红黄绿紫都吃点，身体才更全面健康。" },
    { q:"蜜蜂跳的舞是什么意思？", a:"蜜蜂用「8字舞」告诉同伴：花在哪里、有多远，大家一起飞去采蜜。" },
    { q:"为什么下雪天特别安静？", a:"松软的雪花像小棉花，能把声音吸进去，所以雪后的世界格外安静。" }
  ];

  return {
    APP_NAME, DEFAULT_NAME, AVATARS, ENCOURAGE,
    PINYIN_INITIALS, PINYIN_FINALS, PINYIN_COMBOS,
    STORIES, MATH, EN_WORDS, EN_DIALOGUES, LOGIC, BOOKS, GAMES,
    REWARDS, POETS, CALENDAR, COMMON_MEAN,
    BEHAVIORS, DIFF_SCENES, DRAW_PROMPTS, DRAW_REFS, DRAW_SCENES, POEM_IMG_KEYWORDS,
    FESTIVALS, festivalOf, SHAPES, PATTERNS, WHYS
  };
})();
