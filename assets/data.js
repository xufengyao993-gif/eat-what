/**
 * 菜品库
 * 字段说明：
 *   n  名称
 *   e  emoji
 *   c  分类
 *   m  适合的餐别：b=早餐 l=午餐 d=晚餐 n=夜宵
 *   p  人均价位：1=15元内 2=15-30 3=30-60 4=60-120 5=120以上
 *   s  辣度：0=不辣 1=微辣 2=够辣
 *   v  是否清淡/素食友好
 *   b  是不是连锁店（有这个字段的是店，没有的是菜）
 */
const CATEGORIES = [
  '本帮沪菜', '江浙菜', '川湘菜', '粤菜',
  '西北菜', '云贵菜', '东北菜', '家常菜',
  '面食', '盖饭米线', '快餐', '火锅烧烤',
  '日韩料理', '西餐', '东南亚', '小吃',
  '汤粥轻食'
];

const MEALS = [
  { k: 'b', label: '早餐' },
  { k: 'l', label: '午餐' },
  { k: 'd', label: '晚餐' },
  { k: 'n', label: '夜宵' }
];

/* 价位按上海人均行情分档。改这里的话，app.js 里的 PRICE_MIGRATE 也要跟着改 */
const PRICES = [
  { k: 1, label: '15 元内',  note: '早餐、小吃' },
  { k: 2, label: '15-30',   note: '面条、快餐' },
  { k: 3, label: '30-60',   note: '正经吃一顿' },
  { k: 4, label: '60-120',  note: '好好吃一顿' },
  { k: 5, label: '120 以上', note: '搓一顿' }
];

const SPICY = [
  { k: 0, label: '不辣' },
  { k: 1, label: '微辣' },
  { k: 2, label: '够辣' }
];

const DEFAULT_DISHES = [
  // —— 本帮沪菜 ——
  { n: '红烧肉', e: '🥩', c: '本帮沪菜', m: 'ld', p: 3, s: 0, v: false },
  { n: '油爆虾', e: '🦐', c: '本帮沪菜', m: 'ld', p: 4, s: 0, v: false },
  { n: '响油鳝丝', e: '🐍', c: '本帮沪菜', m: 'ld', p: 4, s: 0, v: false },
  { n: '腌笃鲜', e: '🍲', c: '本帮沪菜', m: 'ld', p: 3, s: 0, v: true },
  { n: '草头圈子', e: '🌿', c: '本帮沪菜', m: 'd', p: 4, s: 0, v: false },
  { n: '八宝辣酱', e: '🥘', c: '本帮沪菜', m: 'ld', p: 3, s: 1, v: false },
  { n: '糖醋小排', e: '🍖', c: '本帮沪菜', m: 'ld', p: 3, s: 0, v: false },
  { n: '四喜烤麸', e: '🍄', c: '本帮沪菜', m: 'ld', p: 1, s: 0, v: true },
  { n: '蟹粉豆腐', e: '🦀', c: '本帮沪菜', m: 'ld', p: 4, s: 0, v: false },
  { n: '本帮红烧带鱼', e: '🐟', c: '本帮沪菜', m: 'ld', p: 3, s: 0, v: false },
  { n: '醉蟹醉虾', e: '🦀', c: '本帮沪菜', m: 'd', p: 5, s: 0, v: false },
  { n: '烤麸拌面', e: '🍜', c: '本帮沪菜', m: 'bl', p: 2, s: 0, v: true },
  { n: '小杨生煎', e: '🥟', c: '本帮沪菜', m: 'bln', p: 2, s: 0, v: false, b: true },
  { n: '大壶春', e: '🥟', c: '本帮沪菜', m: 'bl', p: 2, s: 0, v: false, b: true },
  { n: '老盛昌汤包', e: '🥟', c: '本帮沪菜', m: 'bld', p: 2, s: 0, v: false, b: true },
  { n: '光明邨', e: '🍖', c: '本帮沪菜', m: 'bl', p: 2, s: 0, v: false, b: true },
  { n: '南翔馒头店', e: '🥟', c: '本帮沪菜', m: 'bl', p: 3, s: 0, v: false, b: true },
  { n: '沈大成', e: '🍡', c: '本帮沪菜', m: 'b', p: 1, s: 0, v: true, b: true },
  { n: '王家沙', e: '🥟', c: '本帮沪菜', m: 'bl', p: 2, s: 0, v: false, b: true },
  { n: '逸桂禾', e: '🍜', c: '本帮沪菜', m: 'bl', p: 2, s: 0, v: false, b: true },
  { n: '阿娘面馆', e: '🍜', c: '本帮沪菜', m: 'bl', p: 2, s: 0, v: false, b: true },
  { n: '沧浪亭', e: '🍜', c: '本帮沪菜', m: 'bl', p: 2, s: 0, v: false, b: true },
  { n: '大闸蟹', e: '🦀', c: '本帮沪菜', m: 'd', p: 5, s: 0, v: false },
  { n: '本帮私房菜', e: '🍲', c: '本帮沪菜', m: 'd', p: 5, s: 0, v: false },

  // —— 江浙菜 ——
  { n: '西湖醋鱼', e: '🐟', c: '江浙菜', m: 'ld', p: 4, s: 0, v: false },
  { n: '龙井虾仁', e: '🦐', c: '江浙菜', m: 'ld', p: 4, s: 0, v: false },
  { n: '东坡肉', e: '🥩', c: '江浙菜', m: 'ld', p: 3, s: 0, v: false },
  { n: '蟹粉小笼', e: '🦀', c: '江浙菜', m: 'bl', p: 4, s: 0, v: false },
  { n: '阳春面', e: '🍜', c: '江浙菜', m: 'bld', p: 1, s: 0, v: true },
  { n: '片儿川', e: '🍜', c: '江浙菜', m: 'bld', p: 2, s: 0, v: false },
  { n: '无锡排骨', e: '🍖', c: '江浙菜', m: 'ld', p: 3, s: 0, v: false },
  { n: '盐水鸭', e: '🦆', c: '江浙菜', m: 'ld', p: 3, s: 0, v: false },
  { n: '外婆家', e: '🍚', c: '江浙菜', m: 'ld', p: 3, s: 0, v: false, b: true },
  { n: '新白鹿', e: '🍚', c: '江浙菜', m: 'ld', p: 2, s: 1, v: false, b: true },
  { n: '绿茶餐厅', e: '🍵', c: '江浙菜', m: 'ld', p: 3, s: 0, v: false, b: true },

  // —— 川湘菜 ——
  { n: '宫保鸡丁', e: '🍗', c: '川湘菜', m: 'ld', p: 3, s: 1, v: false },
  { n: '鱼香肉丝', e: '🐟', c: '川湘菜', m: 'ld', p: 3, s: 1, v: false },
  { n: '麻婆豆腐', e: '🌶️', c: '川湘菜', m: 'ld', p: 2, s: 2, v: true },
  { n: '干煸四季豆', e: '🫛', c: '川湘菜', m: 'ld', p: 3, s: 1, v: true },
  { n: '水煮肉片', e: '🥵', c: '川湘菜', m: 'ld', p: 3, s: 2, v: false },
  { n: '酸菜鱼', e: '🐟', c: '川湘菜', m: 'ld', p: 4, s: 1, v: false },
  { n: '回锅肉', e: '🐷', c: '川湘菜', m: 'ld', p: 3, s: 1, v: false },
  { n: '麻辣香锅', e: '🌶️', c: '川湘菜', m: 'ldn', p: 3, s: 2, v: false },
  { n: '剁椒鱼头', e: '🐟', c: '川湘菜', m: 'd', p: 4, s: 2, v: false },
  { n: '辣子鸡', e: '🌶️', c: '川湘菜', m: 'ld', p: 3, s: 2, v: false },
  { n: '毛血旺', e: '🌶️', c: '川湘菜', m: 'ld', p: 3, s: 2, v: false },
  { n: '夫妻肺片', e: '🥩', c: '川湘菜', m: 'ld', p: 3, s: 2, v: false },
  { n: '口水鸡', e: '🐔', c: '川湘菜', m: 'ld', p: 3, s: 2, v: false },
  { n: '酸辣土豆丝', e: '🥔', c: '川湘菜', m: 'ld', p: 2, s: 1, v: true },
  { n: '水煮鱼', e: '🐟', c: '川湘菜', m: 'ld', p: 4, s: 2, v: false },
  { n: '小炒黄牛肉', e: '🥩', c: '川湘菜', m: 'ld', p: 3, s: 2, v: false },
  { n: '剁椒芋头', e: '🍠', c: '川湘菜', m: 'ld', p: 2, s: 1, v: true },
  { n: '外婆菜炒蛋', e: '🥬', c: '川湘菜', m: 'ld', p: 2, s: 1, v: false },
  { n: '冷锅串串', e: '🍢', c: '川湘菜', m: 'ldn', p: 3, s: 2, v: false },
  { n: '钵钵鸡', e: '🍗', c: '川湘菜', m: 'ldn', p: 3, s: 2, v: false },
  { n: '太二酸菜鱼', e: '🐟', c: '川湘菜', m: 'ld', p: 4, s: 1, v: false, b: true },
  { n: '费大厨小炒肉', e: '🌶️', c: '川湘菜', m: 'ld', p: 4, s: 2, v: false, b: true },
  { n: '农耕记', e: '🥬', c: '川湘菜', m: 'ld', p: 3, s: 2, v: false, b: true },

  // —— 粤菜 ——
  { n: '煲仔饭', e: '🍲', c: '粤菜', m: 'ld', p: 3, s: 0, v: false },
  { n: '肠粉', e: '🍥', c: '粤菜', m: 'bl', p: 1, s: 0, v: true },
  { n: '砂锅粥', e: '🍲', c: '粤菜', m: 'dn', p: 3, s: 0, v: false },
  { n: '白斩鸡', e: '🐔', c: '粤菜', m: 'ld', p: 3, s: 0, v: true },
  { n: '白切鸡', e: '🐔', c: '粤菜', m: 'ld', p: 3, s: 0, v: true },
  { n: '烧鹅', e: '🦆', c: '粤菜', m: 'ld', p: 4, s: 0, v: false },
  { n: '叉烧饭', e: '🍖', c: '粤菜', m: 'ld', p: 2, s: 0, v: false },
  { n: '干炒牛河', e: '🍜', c: '粤菜', m: 'ld', p: 3, s: 0, v: false },
  { n: '艇仔粥', e: '🥣', c: '粤菜', m: 'bd', p: 2, s: 0, v: true },
  { n: '虾饺烧卖', e: '🥟', c: '粤菜', m: 'bl', p: 3, s: 0, v: false },
  { n: '猪肚鸡', e: '🍲', c: '粤菜', m: 'd', p: 4, s: 0, v: true },
  { n: '卤鹅饭', e: '🦆', c: '粤菜', m: 'ld', p: 3, s: 0, v: false },
  { n: '潮汕牛肉火锅', e: '🥩', c: '粤菜', m: 'dn', p: 4, s: 0, v: false },
  { n: '点都德', e: '🫖', c: '粤菜', m: 'bl', p: 3, s: 0, v: false, b: true },
  { n: '粤式海鲜', e: '🦞', c: '粤菜', m: 'd', p: 5, s: 0, v: false },

  // —— 西北菜 ——
  { n: '手抓饭', e: '🍚', c: '西北菜', m: 'ld', p: 3, s: 0, v: false },
  { n: '新疆大盘鸡', e: '🍗', c: '西北菜', m: 'ld', p: 4, s: 2, v: false },
  { n: '羊肉串', e: '🍢', c: '西北菜', m: 'dn', p: 2, s: 1, v: false },
  { n: '烤羊排', e: '🍖', c: '西北菜', m: 'dn', p: 4, s: 1, v: false },
  { n: '拉条子', e: '🍜', c: '西北菜', m: 'ld', p: 2, s: 1, v: false },
  { n: '馕包肉', e: '🫓', c: '西北菜', m: 'ld', p: 3, s: 1, v: false },
  { n: '羊肉泡馍', e: '🍲', c: '西北菜', m: 'ld', p: 3, s: 0, v: false },
  { n: '油泼biangbiang面', e: '🍜', c: '西北菜', m: 'ld', p: 2, s: 1, v: false },
  { n: '西贝莜面村', e: '🌾', c: '西北菜', m: 'ld', p: 4, s: 0, v: false, b: true },
  { n: '马记永', e: '🍜', c: '西北菜', m: 'bld', p: 2, s: 1, v: false, b: true },
  { n: '陈香贵', e: '🍜', c: '西北菜', m: 'bld', p: 2, s: 1, v: false, b: true },

  // —— 云贵菜 ——
  { n: '过桥米线', e: '🍜', c: '云贵菜', m: 'bld', p: 2, s: 1, v: false },
  { n: '汽锅鸡', e: '🍲', c: '云贵菜', m: 'ld', p: 4, s: 0, v: true },
  { n: '酸汤鱼', e: '🐟', c: '云贵菜', m: 'ld', p: 4, s: 1, v: false },
  { n: '菌菇火锅', e: '🍄', c: '云贵菜', m: 'd', p: 4, s: 0, v: true },
  { n: '小锅米线', e: '🍜', c: '云贵菜', m: 'bld', p: 2, s: 1, v: false },
  { n: '折耳根拌菜', e: '🌿', c: '云贵菜', m: 'ld', p: 2, s: 1, v: true },
  { n: '丝娃娃', e: '🌯', c: '云贵菜', m: 'ld', p: 3, s: 1, v: true },
  { n: '云海肴', e: '🍲', c: '云贵菜', m: 'ld', p: 4, s: 1, v: false, b: true },
  { n: '花溪牛肉粉', e: '🍜', c: '云贵菜', m: 'bld', p: 2, s: 1, v: false },

  // —— 东北菜 ——
  { n: '地三鲜', e: '🍆', c: '东北菜', m: 'ld', p: 2, s: 0, v: true },
  { n: '锅包肉', e: '🍖', c: '东北菜', m: 'ld', p: 3, s: 0, v: false },
  { n: '猪肉炖粉条', e: '🍲', c: '东北菜', m: 'ld', p: 3, s: 0, v: false },
  { n: '小鸡炖蘑菇', e: '🍗', c: '东北菜', m: 'ld', p: 3, s: 0, v: false },
  { n: '酸菜白肉', e: '🥬', c: '东北菜', m: 'ld', p: 3, s: 0, v: false },
  { n: '大拉皮', e: '🥗', c: '东北菜', m: 'ld', p: 2, s: 1, v: true },
  { n: '铁锅炖', e: '🍲', c: '东北菜', m: 'd', p: 4, s: 0, v: false },

  // —— 家常菜 ——
  { n: '番茄炒蛋盖饭', e: '🍅', c: '家常菜', m: 'ld', p: 2, s: 0, v: true },
  { n: '青椒肉丝', e: '🫑', c: '家常菜', m: 'ld', p: 3, s: 1, v: false },
  { n: '土豆炖牛腩', e: '🥔', c: '家常菜', m: 'd', p: 4, s: 0, v: false },
  { n: '梅菜扣肉', e: '🥘', c: '家常菜', m: 'd', p: 4, s: 0, v: false },
  { n: '蒜蓉西兰花', e: '🥦', c: '家常菜', m: 'ld', p: 2, s: 0, v: true },
  { n: '可乐鸡翅', e: '🍗', c: '家常菜', m: 'ld', p: 2, s: 0, v: false },
  { n: '西红柿牛腩', e: '🍅', c: '家常菜', m: 'ld', p: 3, s: 0, v: false },
  { n: '清蒸鱼', e: '🐟', c: '家常菜', m: 'ld', p: 3, s: 0, v: true },
  { n: '蒸蛋羹', e: '🥚', c: '家常菜', m: 'ld', p: 1, s: 0, v: true },
  { n: '炒时蔬', e: '🥬', c: '家常菜', m: 'ld', p: 2, s: 0, v: true },
  { n: '红烧茄子', e: '🍆', c: '家常菜', m: 'ld', p: 2, s: 0, v: true },
  { n: '北京烤鸭', e: '🦆', c: '家常菜', m: 'd', p: 4, s: 0, v: false },

  // —— 面食 ——
  { n: '兰州拉面', e: '🍜', c: '面食', m: 'bld', p: 2, s: 1, v: false },
  { n: '重庆小面', e: '🌶️', c: '面食', m: 'bld', p: 2, s: 2, v: false },
  { n: '刀削面', e: '🍜', c: '面食', m: 'ld', p: 2, s: 1, v: false },
  { n: '炸酱面', e: '🍜', c: '面食', m: 'ld', p: 2, s: 0, v: false },
  { n: '油泼面', e: '🍜', c: '面食', m: 'ld', p: 2, s: 1, v: false },
  { n: '牛肉面', e: '🐮', c: '面食', m: 'ldn', p: 2, s: 1, v: false },
  { n: '热干面', e: '🥜', c: '面食', m: 'bl', p: 2, s: 0, v: false },
  { n: '炒面', e: '🍳', c: '面食', m: 'ldn', p: 2, s: 0, v: false },
  { n: '饺子', e: '🥟', c: '面食', m: 'bldn', p: 2, s: 0, v: false },
  { n: '馄饨/抄手', e: '🥟', c: '面食', m: 'bldn', p: 2, s: 1, v: false },
  { n: '包子豆浆', e: '🥟', c: '面食', m: 'b', p: 1, s: 0, v: true },
  { n: '手抓饼', e: '🫓', c: '面食', m: 'bn', p: 1, s: 0, v: true },
  { n: '肉夹馍', e: '🥙', c: '面食', m: 'bln', p: 1, s: 0, v: false },
  { n: '煎饼果子', e: '🥞', c: '面食', m: 'bn', p: 1, s: 1, v: true },
  { n: '锅贴', e: '🥟', c: '面食', m: 'bln', p: 2, s: 0, v: false },
  { n: '葱油拌面', e: '🍜', c: '面食', m: 'bld', p: 2, s: 0, v: true },
  { n: '辣肉面', e: '🌶️', c: '面食', m: 'bld', p: 2, s: 1, v: false },
  { n: '黄鱼面', e: '🐟', c: '面食', m: 'ld', p: 3, s: 0, v: false },
  { n: '大肠面', e: '🍜', c: '面食', m: 'ldn', p: 3, s: 1, v: false },
  { n: '蟹黄拌面', e: '🦀', c: '面食', m: 'ld', p: 3, s: 0, v: false },
  { n: '开洋葱油面', e: '🍜', c: '面食', m: 'bld', p: 2, s: 0, v: false },
  { n: '云吞面', e: '🥟', c: '面食', m: 'bldn', p: 2, s: 0, v: false },

  // —— 盖饭米线 ——
  { n: '黄焖鸡米饭', e: '🍗', c: '盖饭米线', m: 'ld', p: 2, s: 1, v: false },
  { n: '猪脚饭', e: '🍖', c: '盖饭米线', m: 'ld', p: 2, s: 0, v: false },
  { n: '卤肉饭', e: '🍚', c: '盖饭米线', m: 'ld', p: 2, s: 0, v: false },
  { n: '咖喱鸡饭', e: '🍛', c: '盖饭米线', m: 'ld', p: 2, s: 1, v: false },
  { n: '螺蛳粉', e: '🐌', c: '盖饭米线', m: 'ldn', p: 2, s: 2, v: false },
  { n: '桂林米粉', e: '🍜', c: '盖饭米线', m: 'bld', p: 2, s: 1, v: false },
  { n: '扬州炒饭', e: '🍚', c: '盖饭米线', m: 'ldn', p: 2, s: 0, v: false },
  { n: '麻辣烫', e: '🌶️', c: '盖饭米线', m: 'ldn', p: 3, s: 2, v: false },
  { n: '海南鸡饭', e: '🐔', c: '盖饭米线', m: 'ld', p: 3, s: 0, v: false },
  { n: '酸辣粉', e: '🌶️', c: '盖饭米线', m: 'ldn', p: 2, s: 2, v: true },

  // —— 快餐 ——
  { n: '麦当劳', e: '🍟', c: '快餐', m: 'bldn', p: 2, s: 0, v: false, b: true },
  { n: '肯德基', e: '🍗', c: '快餐', m: 'bldn', p: 2, s: 1, v: false, b: true },
  { n: '汉堡王', e: '🍔', c: '快餐', m: 'ldn', p: 2, s: 0, v: false, b: true },
  { n: '塔斯汀', e: '🍔', c: '快餐', m: 'ldn', p: 2, s: 1, v: false, b: true },
  { n: '华莱士', e: '🍗', c: '快餐', m: 'ldn', p: 2, s: 1, v: false, b: true },
  { n: '披萨', e: '🍕', c: '快餐', m: 'ldn', p: 3, s: 0, v: false },
  { n: '炸鸡啤酒', e: '🍺', c: '快餐', m: 'dn', p: 3, s: 1, v: false },
  { n: '三明治', e: '🥪', c: '快餐', m: 'bl', p: 2, s: 0, v: true },
  { n: '便利店饭团', e: '🍙', c: '快餐', m: 'bln', p: 1, s: 0, v: true },
  { n: '德克士', e: '🍗', c: '快餐', m: 'ldn', p: 2, s: 1, v: false, b: true },
  { n: '必胜客', e: '🍕', c: '快餐', m: 'ld', p: 4, s: 0, v: false, b: true },
  { n: '萨莉亚', e: '🍝', c: '快餐', m: 'ldn', p: 2, s: 0, v: false, b: true },
  { n: '老乡鸡', e: '🐔', c: '快餐', m: 'bld', p: 2, s: 0, v: true, b: true },
  { n: '乡村基', e: '🍚', c: '快餐', m: 'ld', p: 2, s: 1, v: false, b: true },
  { n: '大米先生', e: '🍚', c: '快餐', m: 'ld', p: 2, s: 0, v: false, b: true },
  { n: '真功夫', e: '🍚', c: '快餐', m: 'ld', p: 2, s: 0, v: false, b: true },
  { n: '老娘舅', e: '🍚', c: '快餐', m: 'ld', p: 2, s: 0, v: false, b: true },
  { n: '吉祥馄饨', e: '🥟', c: '快餐', m: 'bld', p: 2, s: 0, v: false, b: true },
  { n: '和府捞面', e: '🍜', c: '快餐', m: 'ld', p: 3, s: 0, v: false, b: true },
  { n: '味千拉面', e: '🍜', c: '快餐', m: 'ld', p: 3, s: 0, v: false, b: true },
  { n: '五爷拌面', e: '🍜', c: '快餐', m: 'ld', p: 2, s: 1, v: false, b: true },
  { n: '遇见小面', e: '🍜', c: '快餐', m: 'ld', p: 2, s: 2, v: false, b: true },
  { n: '杨铭宇黄焖鸡', e: '🍗', c: '快餐', m: 'ld', p: 2, s: 1, v: false, b: true },
  { n: '阿香米线', e: '🍜', c: '快餐', m: 'ld', p: 2, s: 1, v: false, b: true },

  // —— 火锅烧烤 ——
  { n: '重庆火锅', e: '🍲', c: '火锅烧烤', m: 'dn', p: 4, s: 2, v: false },
  { n: '清汤火锅', e: '🍲', c: '火锅烧烤', m: 'dn', p: 4, s: 0, v: false },
  { n: '椰子鸡', e: '🥥', c: '火锅烧烤', m: 'd', p: 4, s: 0, v: false },
  { n: '烧烤串串', e: '🍢', c: '火锅烧烤', m: 'dn', p: 3, s: 1, v: false },
  { n: '烤鱼', e: '🐟', c: '火锅烧烤', m: 'dn', p: 4, s: 2, v: false },
  { n: '小龙虾', e: '🦐', c: '火锅烧烤', m: 'dn', p: 4, s: 2, v: false },
  { n: '铁板烧', e: '🍳', c: '火锅烧烤', m: 'd', p: 5, s: 0, v: false },
  { n: '烤肉自助', e: '🥓', c: '火锅烧烤', m: 'dn', p: 4, s: 1, v: false },
  { n: '干锅虾', e: '🦐', c: '火锅烧烤', m: 'dn', p: 4, s: 2, v: false },
  { n: '海底捞', e: '🍲', c: '火锅烧烤', m: 'dn', p: 4, s: 1, v: false, b: true },
  { n: '湊湊火锅', e: '🍲', c: '火锅烧烤', m: 'dn', p: 4, s: 1, v: false, b: true },
  { n: '呷哺呷哺', e: '🍲', c: '火锅烧烤', m: 'ld', p: 3, s: 1, v: false, b: true },
  { n: '巴奴毛肚火锅', e: '🍲', c: '火锅烧烤', m: 'dn', p: 5, s: 2, v: false, b: true },
  { n: '小龙坎', e: '🍲', c: '火锅烧烤', m: 'dn', p: 4, s: 2, v: false, b: true },
  { n: '大龙燚', e: '🍲', c: '火锅烧烤', m: 'dn', p: 4, s: 2, v: false, b: true },
  { n: '谭鸭血', e: '🍲', c: '火锅烧烤', m: 'dn', p: 4, s: 2, v: false, b: true },
  { n: '左庭右院', e: '🥩', c: '火锅烧烤', m: 'dn', p: 4, s: 0, v: false, b: true },
  { n: '木屋烧烤', e: '🍢', c: '火锅烧烤', m: 'dn', p: 3, s: 1, v: false, b: true },
  { n: '很久以前羊肉串', e: '🍢', c: '火锅烧烤', m: 'dn', p: 4, s: 1, v: false, b: true },
  { n: '丰茂烤串', e: '🍢', c: '火锅烧烤', m: 'dn', p: 4, s: 1, v: false, b: true },
  { n: '汉拿山', e: '🥓', c: '火锅烧烤', m: 'ld', p: 3, s: 1, v: false, b: true },
  { n: '九田家', e: '🥓', c: '火锅烧烤', m: 'dn', p: 4, s: 1, v: false, b: true },

  // —— 日韩料理 ——
  { n: '寿司', e: '🍣', c: '日韩料理', m: 'ld', p: 4, s: 0, v: false },
  { n: '日式拉面', e: '🍜', c: '日韩料理', m: 'ld', p: 3, s: 0, v: false },
  { n: '咖喱饭', e: '🍛', c: '日韩料理', m: 'ld', p: 3, s: 1, v: false },
  { n: '天妇罗盖饭', e: '🍤', c: '日韩料理', m: 'ld', p: 3, s: 0, v: false },
  { n: '鳗鱼饭', e: '🍱', c: '日韩料理', m: 'ld', p: 4, s: 0, v: false },
  { n: '石锅拌饭', e: '🍚', c: '日韩料理', m: 'ld', p: 2, s: 1, v: true },
  { n: '部队锅', e: '🍲', c: '日韩料理', m: 'dn', p: 4, s: 2, v: false },
  { n: '韩式炸鸡', e: '🍗', c: '日韩料理', m: 'dn', p: 3, s: 1, v: false },
  { n: '寿喜锅', e: '🍲', c: '日韩料理', m: 'd', p: 4, s: 0, v: false },
  { n: '章鱼小丸子', e: '🐙', c: '日韩料理', m: 'n', p: 1, s: 0, v: false },
  { n: '烤肉拌饭', e: '🍚', c: '日韩料理', m: 'ld', p: 3, s: 1, v: false },
  { n: '日料放题', e: '🍣', c: '日韩料理', m: 'd', p: 4, s: 0, v: false },
  { n: '争鲜回转寿司', e: '🍣', c: '日韩料理', m: 'ld', p: 2, s: 0, v: false, b: true },
  { n: '寿司郎', e: '🍣', c: '日韩料理', m: 'ld', p: 3, s: 0, v: false, b: true },
  { n: '村上一屋', e: '🍱', c: '日韩料理', m: 'd', p: 4, s: 0, v: false, b: true },
  { n: '辣炒年糕', e: '🌶️', c: '日韩料理', m: 'ldn', p: 2, s: 2, v: false },
  { n: '韩式冷面', e: '🍜', c: '日韩料理', m: 'ld', p: 3, s: 0, v: false },
  { n: '居酒屋', e: '🍶', c: '日韩料理', m: 'dn', p: 4, s: 0, v: false },
  { n: '怀石料理', e: '🍱', c: '日韩料理', m: 'd', p: 5, s: 0, v: false },
  { n: '和牛烧肉', e: '🥩', c: '日韩料理', m: 'd', p: 5, s: 0, v: false },

  // —— 西餐 ——
  { n: '牛排', e: '🥩', c: '西餐', m: 'd', p: 5, s: 0, v: false },
  { n: '意大利面', e: '🍝', c: '西餐', m: 'ld', p: 3, s: 0, v: false },
  { n: '烤鸡', e: '🍗', c: '西餐', m: 'ld', p: 4, s: 0, v: false },
  { n: '汉堡薯条', e: '🍔', c: '西餐', m: 'ldn', p: 2, s: 0, v: false },
  { n: '奶油蘑菇汤配面包', e: '🍞', c: '西餐', m: 'bl', p: 3, s: 0, v: true },
  { n: '墨西哥卷', e: '🌯', c: '西餐', m: 'ld', p: 3, s: 1, v: false },
  { n: '早午餐 Brunch', e: '🍳', c: '西餐', m: 'bl', p: 4, s: 0, v: true },
  { n: '自助餐', e: '🍽️', c: '西餐', m: 'ld', p: 5, s: 0, v: false },

  // —— 东南亚 ——
  { n: '冬阴功汤面', e: '🍤', c: '东南亚', m: 'ld', p: 3, s: 2, v: false },
  { n: '泰式绿咖喱', e: '🍛', c: '东南亚', m: 'ld', p: 3, s: 1, v: false },
  { n: '越南河粉', e: '🍜', c: '东南亚', m: 'bld', p: 3, s: 0, v: false },
  { n: '菠萝饭', e: '🍍', c: '东南亚', m: 'ld', p: 3, s: 0, v: true },
  { n: '沙嗲烤串', e: '🍢', c: '东南亚', m: 'dn', p: 3, s: 1, v: false },

  // —— 小吃 ——
  { n: '关东煮', e: '🍢', c: '小吃', m: 'n', p: 1, s: 0, v: true },
  { n: '烤冷面', e: '🍳', c: '小吃', m: 'n', p: 1, s: 1, v: false },
  { n: '臭豆腐', e: '🧆', c: '小吃', m: 'n', p: 1, s: 1, v: true },
  { n: '铁板豆腐', e: '🧈', c: '小吃', m: 'n', p: 1, s: 1, v: true },
  { n: '凉皮凉面', e: '🥗', c: '小吃', m: 'ld', p: 2, s: 1, v: true },
  { n: '烤红薯', e: '🍠', c: '小吃', m: 'bn', p: 1, s: 0, v: true },
  { n: '鸡蛋灌饼', e: '🫓', c: '小吃', m: 'bn', p: 1, s: 0, v: true },
  { n: '生煎馒头', e: '🥟', c: '小吃', m: 'bln', p: 1, s: 0, v: false },
  { n: '小笼包', e: '🥟', c: '小吃', m: 'bl', p: 2, s: 0, v: false },
  { n: '粢饭团', e: '🍙', c: '小吃', m: 'b', p: 1, s: 0, v: true },
  { n: '豆浆油条', e: '🥛', c: '小吃', m: 'b', p: 1, s: 0, v: true },
  { n: '鲜肉月饼', e: '🥮', c: '小吃', m: 'bn', p: 1, s: 0, v: false },
  { n: '蟹壳黄', e: '🥯', c: '小吃', m: 'b', p: 1, s: 0, v: true },
  { n: '排骨年糕', e: '🍖', c: '小吃', m: 'ldn', p: 2, s: 0, v: false },

  // —— 汤粥轻食 ——
  { n: '皮蛋瘦肉粥', e: '🥣', c: '汤粥轻食', m: 'bdn', p: 1, s: 0, v: false },
  { n: '小米粥配咸菜', e: '🥣', c: '汤粥轻食', m: 'bd', p: 1, s: 0, v: true },
  { n: '轻食沙拉', e: '🥗', c: '汤粥轻食', m: 'bld', p: 3, s: 0, v: true },
  { n: '鸡胸肉便当', e: '🍱', c: '汤粥轻食', m: 'ld', p: 3, s: 0, v: false },
  { n: '牛肉粉丝汤', e: '🍜', c: '汤粥轻食', m: 'bld', p: 2, s: 0, v: false },
  { n: '燕麦牛奶', e: '🥣', c: '汤粥轻食', m: 'b', p: 1, s: 0, v: true }
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
 *
 * 三种跳法，按平台和系统选：
 *   web    —— 网页版，什么时候都能兜底
 *   app    —— iOS 用的 URL Scheme
 *   intent —— Android Chrome 用的 intent://，带 browser_fallback_url，
 *             唤不起 App 会自动跳网页版，比 scheme + 定时器可靠
 *
 * 注意：微信内置浏览器会拦掉 scheme 和 intent，只能走网页版（见 app.js）。
 * 链接格式若哪天失效，改这里就行。
 */
function intentUrl(path, scheme, pkg, fallback) {
  return 'intent://' + path + '#Intent;scheme=' + scheme + ';package=' + pkg +
         ';S.browser_fallback_url=' + encodeURIComponent(fallback) + ';end';
}

/* ---- 点外卖 ----
 * 淘宝闪购就是原来的饿了么 App，2025 年 12 月改的名，所以走 eleme:// 这套。
 * 链接格式若哪天失效，改这里就行。
 */
const DELIVERY = [
  {
    k: 'mtwm',
    label: '美团外卖',
    icon: '🛵',
    web: (kw) => 'https://h5.waimai.meituan.com/waimai/mindex/home?keyword=' + encodeURIComponent(kw),
    app: (kw) => 'meituanwaimai://waimai.meituan.com/search?query=' + encodeURIComponent(kw),
    intent: (kw, web) => intentUrl(
      'waimai.meituan.com/search?query=' + encodeURIComponent(kw),
      'meituanwaimai', 'com.sankuai.meituan.takeoutnew', web)
  },
  {
    k: 'tbsg',
    label: '淘宝闪购',
    icon: '🧡',
    web: (kw) => 'https://h5.ele.me/search/?keyword=' + encodeURIComponent(kw),
    app: (kw) => 'eleme://search?keyword=' + encodeURIComponent(kw),
    intent: (kw, web) => intentUrl(
      'search?keyword=' + encodeURIComponent(kw),
      'eleme', 'me.ele', web)
  }
];

const PLATFORMS = [
  {
    k: 'dianping',
    label: '大众点评',
    icon: '🔴',
    web: (kw) => 'https://www.dianping.com/search/keyword/' +
                 CITY.dianpingId + '/0_' + encodeURIComponent(kw),
    app: (kw) => 'dianping://searchshoplist?keyword=' + encodeURIComponent(kw),
    intent: (kw, web) => intentUrl(
      'searchshoplist?keyword=' + encodeURIComponent(kw),
      'dianping', 'com.dianping.v1', web)
  },
  {
    k: 'amap',
    label: '高德地图',
    icon: '🗺️',
    // 高德官方 URI API 自己会处理唤起，不用我们拼 scheme
    web: (kw, loc) => 'https://uri.amap.com/search?keyword=' + encodeURIComponent(kw) +
                      '&city=' + encodeURIComponent(CITY.name) +
                      (loc ? '&center=' + loc : '') + '&src=eat-what&coordinate=gaode',
    app: null,
    intent: null
  },
  {
    k: 'meituan',
    label: '美团',
    icon: '🟡',
    web: (kw) => 'https://i.meituan.com/s/' + encodeURIComponent(kw),
    app: (kw) => 'imeituan://www.meituan.com/search?q=' + encodeURIComponent(kw),
    intent: (kw, web) => intentUrl(
      'www.meituan.com/search?q=' + encodeURIComponent(kw),
      'imeituan', 'com.sankuai.meituan', web)
  }
];
