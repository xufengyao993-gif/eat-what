/**
 * 默认菜品库
 * 字段说明：
 *   n  名称
 *   e  emoji
 *   c  分类
 *   m  适合的餐别：b=早餐 l=午餐 d=晚餐 n=夜宵
 *   p  价位：1=便宜(≈20以内) 2=适中(20-50) 3=小贵(50以上)
 *   s  辣度：0=不辣 1=微辣 2=够辣
 *   v  是否清淡/素食友好
 */
const CATEGORIES = [
  '本帮沪菜', '家常菜', '面食', '盖饭米线', '快餐', '火锅烧烤',
  '日韩料理', '西餐', '东南亚', '小吃', '汤粥轻食'
];

const MEALS = [
  { k: 'b', label: '早餐' },
  { k: 'l', label: '午餐' },
  { k: 'd', label: '晚餐' },
  { k: 'n', label: '夜宵' }
];

const PRICES = [
  { k: 1, label: '便宜' },
  { k: 2, label: '适中' },
  { k: 3, label: '小贵' }
];

const SPICY = [
  { k: 0, label: '不辣' },
  { k: 1, label: '微辣' },
  { k: 2, label: '够辣' }
];

const DEFAULT_DISHES = [
  // —— 家常菜 ——
  { n: '番茄炒蛋盖饭', e: '🍅', c: '家常菜', m: 'ld', p: 1, s: 0, v: true },
  { n: '青椒肉丝', e: '🫑', c: '家常菜', m: 'ld', p: 2, s: 1, v: false },
  { n: '宫保鸡丁', e: '🍗', c: '家常菜', m: 'ld', p: 2, s: 1, v: false },
  { n: '鱼香肉丝', e: '🐟', c: '家常菜', m: 'ld', p: 2, s: 1, v: false },
  { n: '麻婆豆腐', e: '🌶️', c: '家常菜', m: 'ld', p: 1, s: 2, v: true },
  { n: '干煸四季豆', e: '🫛', c: '家常菜', m: 'ld', p: 2, s: 1, v: true },
  { n: '土豆炖牛腩', e: '🥔', c: '家常菜', m: 'd', p: 3, s: 0, v: false },
  { n: '糖醋排骨', e: '🍖', c: '家常菜', m: 'ld', p: 3, s: 0, v: false },
  { n: '水煮肉片', e: '🥵', c: '家常菜', m: 'ld', p: 2, s: 2, v: false },
  { n: '酸菜鱼', e: '🐟', c: '家常菜', m: 'ld', p: 3, s: 1, v: false },
  { n: '梅菜扣肉', e: '🥘', c: '家常菜', m: 'd', p: 3, s: 0, v: false },
  { n: '蒜蓉西兰花', e: '🥦', c: '家常菜', m: 'ld', p: 1, s: 0, v: true },
  { n: '回锅肉', e: '🐷', c: '家常菜', m: 'ld', p: 2, s: 1, v: false },
  { n: '地三鲜', e: '🍆', c: '家常菜', m: 'ld', p: 1, s: 0, v: true },

  // —— 面食 ——
  { n: '兰州拉面', e: '🍜', c: '面食', m: 'bld', p: 1, s: 1, v: false },
  { n: '重庆小面', e: '🌶️', c: '面食', m: 'bld', p: 1, s: 2, v: false },
  { n: '刀削面', e: '🍜', c: '面食', m: 'ld', p: 1, s: 1, v: false },
  { n: '炸酱面', e: '🍜', c: '面食', m: 'ld', p: 1, s: 0, v: false },
  { n: '油泼面', e: '🍜', c: '面食', m: 'ld', p: 1, s: 1, v: false },
  { n: '牛肉面', e: '🐮', c: '面食', m: 'ldn', p: 2, s: 1, v: false },
  { n: '热干面', e: '🥜', c: '面食', m: 'bl', p: 1, s: 0, v: false },
  { n: '炒面', e: '🍳', c: '面食', m: 'ldn', p: 1, s: 0, v: false },
  { n: '饺子', e: '🥟', c: '面食', m: 'bldn', p: 1, s: 0, v: false },
  { n: '馄饨/抄手', e: '🥟', c: '面食', m: 'bldn', p: 1, s: 1, v: false },
  { n: '包子豆浆', e: '🥟', c: '面食', m: 'b', p: 1, s: 0, v: true },
  { n: '手抓饼', e: '🫓', c: '面食', m: 'bn', p: 1, s: 0, v: true },
  { n: '肉夹馍', e: '🥙', c: '面食', m: 'bln', p: 1, s: 0, v: false },
  { n: '煎饼果子', e: '🥞', c: '面食', m: 'bn', p: 1, s: 1, v: true },
  { n: '锅贴', e: '🥟', c: '面食', m: 'bln', p: 1, s: 0, v: false },

  // —— 盖饭米线 ——
  { n: '黄焖鸡米饭', e: '🍗', c: '盖饭米线', m: 'ld', p: 2, s: 1, v: false },
  { n: '猪脚饭', e: '🍖', c: '盖饭米线', m: 'ld', p: 2, s: 0, v: false },
  { n: '卤肉饭', e: '🍚', c: '盖饭米线', m: 'ld', p: 1, s: 0, v: false },
  { n: '咖喱鸡饭', e: '🍛', c: '盖饭米线', m: 'ld', p: 2, s: 1, v: false },
  { n: '过桥米线', e: '🍜', c: '盖饭米线', m: 'bld', p: 2, s: 1, v: false },
  { n: '螺蛳粉', e: '🐌', c: '盖饭米线', m: 'ldn', p: 2, s: 2, v: false },
  { n: '桂林米粉', e: '🍜', c: '盖饭米线', m: 'bld', p: 1, s: 1, v: false },
  { n: '煲仔饭', e: '🍲', c: '盖饭米线', m: 'ld', p: 2, s: 0, v: false },
  { n: '扬州炒饭', e: '🍚', c: '盖饭米线', m: 'ldn', p: 1, s: 0, v: false },
  { n: '麻辣烫', e: '🌶️', c: '盖饭米线', m: 'ldn', p: 2, s: 2, v: false },
  { n: '海南鸡饭', e: '🐔', c: '盖饭米线', m: 'ld', p: 2, s: 0, v: false },

  // —— 快餐 ——
  { n: '麦当劳', e: '🍟', c: '快餐', m: 'bldn', p: 2, s: 0, v: false },
  { n: '肯德基', e: '🍗', c: '快餐', m: 'bldn', p: 2, s: 1, v: false },
  { n: '汉堡王', e: '🍔', c: '快餐', m: 'ldn', p: 2, s: 0, v: false },
  { n: '塔斯汀', e: '🍔', c: '快餐', m: 'ldn', p: 1, s: 1, v: false },
  { n: '华莱士', e: '🍗', c: '快餐', m: 'ldn', p: 1, s: 1, v: false },
  { n: '披萨', e: '🍕', c: '快餐', m: 'ldn', p: 3, s: 0, v: false },
  { n: '炸鸡啤酒', e: '🍺', c: '快餐', m: 'dn', p: 3, s: 1, v: false },
  { n: '三明治', e: '🥪', c: '快餐', m: 'bl', p: 1, s: 0, v: true },
  { n: '便利店饭团', e: '🍙', c: '快餐', m: 'bln', p: 1, s: 0, v: true },

  // —— 火锅烧烤 ——
  { n: '重庆火锅', e: '🍲', c: '火锅烧烤', m: 'dn', p: 3, s: 2, v: false },
  { n: '清汤火锅', e: '🍲', c: '火锅烧烤', m: 'dn', p: 3, s: 0, v: false },
  { n: '椰子鸡', e: '🥥', c: '火锅烧烤', m: 'd', p: 3, s: 0, v: false },
  { n: '烧烤串串', e: '🍢', c: '火锅烧烤', m: 'dn', p: 2, s: 1, v: false },
  { n: '烤鱼', e: '🐟', c: '火锅烧烤', m: 'dn', p: 3, s: 2, v: false },
  { n: '小龙虾', e: '🦐', c: '火锅烧烤', m: 'dn', p: 3, s: 2, v: false },
  { n: '铁板烧', e: '🍳', c: '火锅烧烤', m: 'd', p: 3, s: 0, v: false },
  { n: '烤肉自助', e: '🥓', c: '火锅烧烤', m: 'dn', p: 3, s: 1, v: false },
  { n: '干锅虾', e: '🦐', c: '火锅烧烤', m: 'dn', p: 3, s: 2, v: false },

  // —— 日韩料理 ——
  { n: '寿司', e: '🍣', c: '日韩料理', m: 'ld', p: 3, s: 0, v: false },
  { n: '日式拉面', e: '🍜', c: '日韩料理', m: 'ld', p: 3, s: 0, v: false },
  { n: '咖喱饭', e: '🍛', c: '日韩料理', m: 'ld', p: 2, s: 1, v: false },
  { n: '天妇罗盖饭', e: '🍤', c: '日韩料理', m: 'ld', p: 3, s: 0, v: false },
  { n: '鳗鱼饭', e: '🍱', c: '日韩料理', m: 'ld', p: 3, s: 0, v: false },
  { n: '石锅拌饭', e: '🍚', c: '日韩料理', m: 'ld', p: 2, s: 1, v: true },
  { n: '部队锅', e: '🍲', c: '日韩料理', m: 'dn', p: 3, s: 2, v: false },
  { n: '韩式炸鸡', e: '🍗', c: '日韩料理', m: 'dn', p: 3, s: 1, v: false },
  { n: '寿喜锅', e: '🍲', c: '日韩料理', m: 'd', p: 3, s: 0, v: false },
  { n: '章鱼小丸子', e: '🐙', c: '日韩料理', m: 'n', p: 1, s: 0, v: false },

  // —— 西餐 ——
  { n: '牛排', e: '🥩', c: '西餐', m: 'd', p: 3, s: 0, v: false },
  { n: '意大利面', e: '🍝', c: '西餐', m: 'ld', p: 2, s: 0, v: false },
  { n: '烤鸡', e: '🍗', c: '西餐', m: 'ld', p: 3, s: 0, v: false },
  { n: '汉堡薯条', e: '🍔', c: '西餐', m: 'ldn', p: 2, s: 0, v: false },
  { n: '奶油蘑菇汤配面包', e: '🍞', c: '西餐', m: 'bl', p: 2, s: 0, v: true },
  { n: '墨西哥卷', e: '🌯', c: '西餐', m: 'ld', p: 2, s: 1, v: false },
  { n: '早午餐 Brunch', e: '🍳', c: '西餐', m: 'bl', p: 3, s: 0, v: true },

  // —— 东南亚 ——
  { n: '冬阴功汤面', e: '🍤', c: '东南亚', m: 'ld', p: 2, s: 2, v: false },
  { n: '泰式绿咖喱', e: '🍛', c: '东南亚', m: 'ld', p: 3, s: 1, v: false },
  { n: '越南河粉', e: '🍜', c: '东南亚', m: 'bld', p: 2, s: 0, v: false },
  { n: '菠萝饭', e: '🍍', c: '东南亚', m: 'ld', p: 2, s: 0, v: true },
  { n: '沙嗲烤串', e: '🍢', c: '东南亚', m: 'dn', p: 2, s: 1, v: false },

  // —— 小吃 ——
  { n: '关东煮', e: '🍢', c: '小吃', m: 'n', p: 1, s: 0, v: true },
  { n: '烤冷面', e: '🍳', c: '小吃', m: 'n', p: 1, s: 1, v: false },
  { n: '臭豆腐', e: '🧆', c: '小吃', m: 'n', p: 1, s: 1, v: true },
  { n: '铁板豆腐', e: '🧈', c: '小吃', m: 'n', p: 1, s: 1, v: true },
  { n: '凉皮凉面', e: '🥗', c: '小吃', m: 'ld', p: 1, s: 1, v: true },
  { n: '肠粉', e: '🍥', c: '小吃', m: 'bl', p: 1, s: 0, v: true },
  { n: '手抓饭', e: '🍚', c: '小吃', m: 'ld', p: 2, s: 0, v: false },
  { n: '烤红薯', e: '🍠', c: '小吃', m: 'bn', p: 1, s: 0, v: true },
  { n: '鸡蛋灌饼', e: '🫓', c: '小吃', m: 'bn', p: 1, s: 0, v: true },
  { n: '生煎包', e: '🥟', c: '小吃', m: 'bl', p: 1, s: 0, v: false },

  // —— 汤粥轻食 ——
  { n: '皮蛋瘦肉粥', e: '🥣', c: '汤粥轻食', m: 'bdn', p: 1, s: 0, v: false },
  { n: '小米粥配咸菜', e: '🥣', c: '汤粥轻食', m: 'bd', p: 1, s: 0, v: true },
  { n: '轻食沙拉', e: '🥗', c: '汤粥轻食', m: 'bld', p: 2, s: 0, v: true },
  { n: '鸡胸肉便当', e: '🍱', c: '汤粥轻食', m: 'ld', p: 2, s: 0, v: false },
  { n: '牛肉粉丝汤', e: '🍜', c: '汤粥轻食', m: 'bld', p: 2, s: 0, v: false },
  { n: '砂锅粥', e: '🍲', c: '汤粥轻食', m: 'dn', p: 2, s: 0, v: false },
  { n: '蔬菜三明治+牛奶', e: '🥛', c: '汤粥轻食', m: 'b', p: 1, s: 0, v: true },
  { n: '燕麦牛奶', e: '🥣', c: '汤粥轻食', m: 'b', p: 1, s: 0, v: true },

  // —— 本帮沪菜 ——
  { n: '红烧肉', e: '🥩', c: '本帮沪菜', m: 'ld', p: 2, s: 0, v: false },
  { n: '油爆虾', e: '🦐', c: '本帮沪菜', m: 'ld', p: 3, s: 0, v: false },
  { n: '响油鳝丝', e: '🐍', c: '本帮沪菜', m: 'ld', p: 3, s: 0, v: false },
  { n: '腌笃鲜', e: '🍲', c: '本帮沪菜', m: 'ld', p: 2, s: 0, v: true },
  { n: '草头圈子', e: '🌿', c: '本帮沪菜', m: 'd', p: 3, s: 0, v: false },
  { n: '八宝辣酱', e: '🥘', c: '本帮沪菜', m: 'ld', p: 2, s: 1, v: false },
  { n: '糖醋小排', e: '🍖', c: '本帮沪菜', m: 'ld', p: 2, s: 0, v: false },
  { n: '白斩鸡', e: '🐔', c: '本帮沪菜', m: 'ld', p: 2, s: 0, v: true },
  { n: '四喜烤麸', e: '🍄', c: '本帮沪菜', m: 'ld', p: 1, s: 0, v: true },
  { n: '蟹粉豆腐', e: '🦀', c: '本帮沪菜', m: 'ld', p: 3, s: 0, v: false },
  { n: '本帮红烧带鱼', e: '🐟', c: '本帮沪菜', m: 'ld', p: 2, s: 0, v: false },
  { n: '醉蟹醉虾', e: '🦀', c: '本帮沪菜', m: 'd', p: 3, s: 0, v: false },
  { n: '烤麸拌面', e: '🍜', c: '本帮沪菜', m: 'bl', p: 1, s: 0, v: true },

  // —— 上海面点小吃 ——
  { n: '生煎馒头', e: '🥟', c: '小吃', m: 'bln', p: 1, s: 0, v: false },
  { n: '小笼包', e: '🥟', c: '小吃', m: 'bl', p: 2, s: 0, v: false },
  { n: '粢饭团', e: '🍙', c: '小吃', m: 'b', p: 1, s: 0, v: true },
  { n: '豆浆油条', e: '🥛', c: '小吃', m: 'b', p: 1, s: 0, v: true },
  { n: '鲜肉月饼', e: '🥮', c: '小吃', m: 'bn', p: 1, s: 0, v: false },
  { n: '蟹壳黄', e: '🥯', c: '小吃', m: 'b', p: 1, s: 0, v: true },
  { n: '排骨年糕', e: '🍖', c: '小吃', m: 'ldn', p: 1, s: 0, v: false },
  { n: '葱油拌面', e: '🍜', c: '面食', m: 'bld', p: 1, s: 0, v: true },
  { n: '辣肉面', e: '🌶️', c: '面食', m: 'bld', p: 1, s: 1, v: false },
  { n: '黄鱼面', e: '🐟', c: '面食', m: 'ld', p: 2, s: 0, v: false },
  { n: '大肠面', e: '🍜', c: '面食', m: 'ldn', p: 2, s: 1, v: false },
  { n: '蟹黄拌面', e: '🦀', c: '面食', m: 'ld', p: 3, s: 0, v: false },
  { n: '开洋葱油面', e: '🍜', c: '面食', m: 'bld', p: 1, s: 0, v: false },
  { n: '云吞面', e: '🥟', c: '面食', m: 'bldn', p: 1, s: 0, v: false },

  // —— 沪上常见外来菜 ——
  { n: '麻辣香锅', e: '🌶️', c: '家常菜', m: 'ldn', p: 2, s: 2, v: false },
  { n: '酸辣粉', e: '🌶️', c: '盖饭米线', m: 'ldn', p: 1, s: 2, v: true },
  { n: '剁椒鱼头', e: '🐟', c: '家常菜', m: 'd', p: 3, s: 2, v: false },
  { n: '烤肉拌饭', e: '🍚', c: '日韩料理', m: 'ld', p: 2, s: 1, v: false },
  { n: '日料放题', e: '🍣', c: '日韩料理', m: 'd', p: 3, s: 0, v: false }
];

/* ================== 地点：上海常用商圈 ================== */
/* location 为高德坐标系（GCJ-02）的「经度,纬度」，用于附近搜索的中心点 */
const CITY = { name: '上海', dianpingId: 1 };

const AREAS = [
  { n: '人民广场',   loc: '121.475,31.234' },
  { n: '南京西路',   loc: '121.452,31.229' },
  { n: '静安寺',     loc: '121.445,31.224' },
  { n: '淮海中路',   loc: '121.462,31.220' },
  { n: '新天地',     loc: '121.474,31.220' },
  { n: '徐家汇',     loc: '121.437,31.194' },
  { n: '陆家嘴',     loc: '121.506,31.239' },
  { n: '五角场',     loc: '121.515,31.303' },
  { n: '中山公园',   loc: '121.420,31.221' },
  { n: '长寿路',     loc: '121.443,31.246' },
  { n: '大宁',       loc: '121.457,31.281' },
  { n: '打浦桥',     loc: '121.470,31.207' },
  { n: '田林漕河泾', loc: '121.409,31.171' },
  { n: '龙阳路',     loc: '121.556,31.205' },
  { n: '世纪公园',   loc: '121.545,31.222' },
  { n: '张江',       loc: '121.600,31.205' },
  { n: '金桥',       loc: '121.596,31.259' },
  { n: '古北',       loc: '121.399,31.196' },
  { n: '虹桥天地',   loc: '121.322,31.194' },
  { n: '莘庄',       loc: '121.386,31.113' },
  { n: '七宝',       loc: '121.353,31.157' },
  { n: '上海南站',   loc: '121.428,31.155' },
  { n: '曹家渡',     loc: '121.437,31.234' },
  { n: '四川北路',   loc: '121.485,31.257' }
];

/* 找吃饭范围（米），用于附近搜索 */
const RANGES = [
  { k: 800,  label: '走路 10 分钟' },
  { k: 2000, label: '2 公里内' },
  { k: 5000, label: '5 公里内' }
];

/* ================== 跳转到点评 / 高德 / 美团 ==================
 * 不需要任何 key：拼好搜索词直接打开对方的搜索结果页。
 * 手机上会尝试唤起 App，唤不起就退回网页版。
 * 链接格式若哪天失效，改这里就行。
 */
const PLATFORMS = [
  {
    k: 'dianping',
    label: '大众点评',
    icon: '🔴',
    web: (kw) => 'https://www.dianping.com/search/keyword/' +
                 CITY.dianpingId + '/0_' + encodeURIComponent(kw),
    app: (kw) => 'dianping://searchshoplist?keyword=' + encodeURIComponent(kw)
  },
  {
    k: 'amap',
    label: '高德地图',
    icon: '🗺️',
    // 高德官方 URI API，PC 打开网页版，手机唤起高德 App
    web: (kw, loc) => 'https://uri.amap.com/search?keyword=' + encodeURIComponent(kw) +
                      '&city=' + encodeURIComponent(CITY.name) +
                      (loc ? '&center=' + loc : '') + '&src=eat-what&coordinate=gaode',
    app: null
  },
  {
    k: 'meituan',
    label: '美团',
    icon: '🟡',
    web: (kw) => 'https://i.meituan.com/s/' + encodeURIComponent(kw),
    app: (kw) => 'imeituan://www.meituan.com/search?q=' + encodeURIComponent(kw)
  }
];
