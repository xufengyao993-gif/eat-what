/* 今天吃啥 —— 纠结时帮你决定一顿饭（上海） */
(function () {
  'use strict';

  // ---------- 本地存储 ----------
  const KEY = {
    custom: 'ew.custom',
    off:    'ew.off',
    hist:   'ew.history',
    filter: 'ew.filter',
    theme:  'ew.theme'
  };

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* 隐私模式，忽略 */ }
  }

  /* 每次都返回新对象。用共享常量的话，里面的数组会被 Object.assign 浅拷贝共享，
     用户勾选就把默认值污染了，「重置筛选」会重置不干净。 */
  function freshFilter() {
    return {
      meal: 'auto',      // auto | b | l | d | n | all
      prices: [],        // 空＝不限
      cats: [],
      spicy: [],
      veg: false,
      avoid: true,
      place: 'any',      // any | area | near
      area: '静安寺',
      range: 2000
    };
  }

  const state = {
    custom: load(KEY.custom, []),
    off:    load(KEY.off, []),
    hist:   load(KEY.hist, []),
    filter: Object.assign(freshFilter(), load(KEY.filter, {})),
    last: null,
    rolling: false,
    geo: null            // 定位到的 '经度,纬度'
  };

  const $ = (sel) => document.querySelector(sel);
  const DAY = 86400000;
  const MEAL_LABEL = { b: '早餐', l: '午餐', d: '晚餐', n: '夜宵' };

  const baseDishes = DEFAULT_DISHES.map((d, i) => Object.assign({ id: 'd' + i }, d));
  const allDishes = () => baseDishes.concat(state.custom);

  function currentMeal() {
    const h = new Date().getHours();
    if (h >= 5  && h < 10) return 'b';
    if (h >= 10 && h < 15) return 'l';
    if (h >= 15 && h < 21) return 'd';
    return 'n';
  }

  // ---------- 候选池 ----------
  /** @param {object} [override] 试算用的临时筛选条件 */
  function pool(override) {
    const f = Object.assign({}, state.filter, override || {});
    const offSet = new Set(state.off);
    const meal = f.meal === 'auto' ? currentMeal() : f.meal;

    return allDishes().filter((d) => {
      if (offSet.has(d.id)) return false;
      if (meal !== 'all' && !d.m.includes(meal)) return false;
      if (f.prices.length && !f.prices.includes(d.p)) return false;
      if (f.cats.length && !f.cats.includes(d.c)) return false;
      if (f.spicy.length && !f.spicy.includes(d.s)) return false;
      if (f.veg && !d.v) return false;
      return true;
    });
  }

  function weightOf(dish) {
    if (!state.filter.avoid) return 1;
    const rec = state.hist.find((h) => h.id === dish.id);
    if (!rec) return 1;
    const days = (Date.now() - rec.ts) / DAY;
    if (days < 1) return 0.05;
    if (days < 3) return 0.3;
    if (days < 7) return 0.6;
    return 1;
  }

  function pickFrom(list) {
    if (!list.length) return null;
    const weights = list.map(weightOf);
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < list.length; i++) {
      r -= weights[i];
      if (r <= 0) return list[i];
    }
    return list[list.length - 1];
  }

  // ---------- 地点 ----------
  /** 当前地点的文字描述，用于拼搜索词 */
  function placeText() {
    const f = state.filter;
    if (f.place === 'area') return f.area;
    if (f.place === 'near') return state.geo ? '附近' : '';
    return '';
  }

  /** 附近搜索的中心点坐标；没有就返回 null（退化成全城搜） */
  function placeCenter() {
    const f = state.filter;
    if (f.place === 'near' && state.geo) return state.geo;
    if (f.place === 'area') {
      const a = AREAS.find((x) => x.n === f.area);
      return a ? a.loc : null;
    }
    return null;
  }

  function locate() {
    const el = $('#geoStatus');
    if (!navigator.geolocation) {
      el.textContent = '这个浏览器不支持定位，可以改成选商圈。';
      return;
    }
    el.textContent = '正在定位…';
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // 注意：浏览器给的是 WGS-84，高德用 GCJ-02，市区内偏差约 300–500 米。
        // 找餐厅够用，要更准就得接高德的坐标转换接口。
        state.geo = pos.coords.longitude.toFixed(6) + ',' + pos.coords.latitude.toFixed(6);
        el.textContent = '已定位（误差约几百米）';
        renderFilter();
      },
      () => { el.textContent = '定位没成功，改用选商圈吧。'; },
      { timeout: 8000, maximumAge: 300000 }
    );
  }

  // ---------- 抽取 ----------
  const resultEl = $('#result');
  const emojiEl  = $('#resultEmoji');
  const nameEl   = $('#resultName');
  const tagsEl   = $('#resultTags');

  function tagsOf(d) {
    const t = [d.c, (PRICES.find((p) => p.k === d.p) || {}).label];
    if (d.s > 0) t.push((SPICY.find((s) => s.k === d.s) || {}).label);
    if (d.v) t.push('清淡');
    return t.filter(Boolean);
  }

  function paint(d, withTags) {
    emojiEl.textContent = d.e;
    nameEl.textContent = d.n;
    tagsEl.innerHTML = withTags
      ? tagsOf(d).map((x) => '<span class="tag">' + esc(x) + '</span>').join('')
      : '';
  }

  function roll(excludeId) {
    if (state.rolling) return;

    let list = pool();
    if (!list.length) {
      state.last = null;
      resultEl.className = 'result empty';
      emojiEl.textContent = '🤷';
      nameEl.textContent = '这些条件下没有菜了，放宽一点？';
      tagsEl.innerHTML = '';
      $('#goEat').hidden = true;
      syncButtons();
      return;
    }
    if (excludeId && list.length > 1) list = list.filter((d) => d.id !== excludeId);

    const final = pickFrom(list);
    state.rolling = true;
    syncButtons();
    resultEl.className = 'result rolling';
    $('#goEat').hidden = true;

    let delay = 45;
    (function tick() {
      paint(list[Math.floor(Math.random() * list.length)], false);
      delay *= 1.13;
      if (delay < 270) {
        setTimeout(tick, delay);
      } else {
        state.rolling = false;
        state.last = final;
        paint(final, true);
        resultEl.className = 'result pop';
        buzz(18);
        syncButtons();
        renderGoEat();
      }
    })();
  }

  function syncButtons() {
    const has = !!state.last && !state.rolling;
    $('#againBtn').disabled = !has;
    $('#eatBtn').disabled = !has;
    $('#rollBtn').disabled = state.rolling;
    $('#rollBtn').textContent = state.rolling ? '正在挑…' : (state.last ? '再抽一次' : '吃什么？');
  }

  function buzz(ms) {
    if (navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) {} }
  }

  // ---------- 去哪吃 ----------
  /** 搜索词 = 菜名 + 地点，例如「小笼包 静安寺」 */
  function searchKeyword() {
    if (!state.last) return '';
    const p = placeText();
    return p && p !== '附近' ? state.last.n + ' ' + p : state.last.n;
  }

  function renderGoEat() {
    if (!state.last) { $('#goEat').hidden = true; return; }
    const kw = searchKeyword();
    const center = placeCenter();
    const p = placeText();

    $('#goTitle').textContent = p ? '去哪吃 · ' + p : '去哪吃';
    $('#platforms').innerHTML = PLATFORMS.map((pf) =>
      '<button class="plat" type="button" data-plat="' + pf.k + '">' +
        '<span class="plat-icon">' + pf.icon + '</span>' +
        '<span class="plat-name">' + esc(pf.label) + '</span>' +
      '</button>'
    ).join('');

    $('#nearbyBtn').textContent = Nearby.ready() ? '看附近的店 ›' : '配置后可看附近的店 ›';
    $('#nearby').hidden = true;
    $('#nearby').innerHTML = '';
    $('#goEat').hidden = false;
    $('#goEat').dataset.kw = kw;
    $('#goEat').dataset.center = center || '';
  }

  const UA = navigator.userAgent;
  const inWechat = /MicroMessenger/i.test(UA);
  const isAndroid = /Android/i.test(UA);
  const isIOS = /iPhone|iPad|iPod/i.test(UA);

  /* 决定该跳哪个地址、用什么方式。抽成纯函数，方便测也方便以后加平台。
   *   web    微信里：scheme 和 intent 都会被拦，试也白试
   *   intent Android：自带 browser_fallback_url，唤不起会自己跳网页
   *   scheme iOS：只能先试，再用定时器兜底回网页
   *   newtab 桌面浏览器
   */
  function platformTarget(pf, kw, center) {
    const web = pf.web(kw, center);
    if (inWechat)               return { via: 'web',    url: web };
    if (isAndroid && pf.intent) return { via: 'intent', url: pf.intent(kw, web) };
    if (isIOS && pf.app)        return { via: 'scheme', url: pf.app(kw), fallback: web };
    return { via: 'newtab', url: web };
  }

  function openPlatform(k) {
    const pf = PLATFORMS.find((x) => x.k === k);
    if (!pf) return;
    const t = platformTarget(pf, $('#goEat').dataset.kw, $('#goEat').dataset.center);

    if (t.via === 'newtab') { window.open(t.url, '_blank', 'noopener'); return; }

    // 微信里跳网页版之前先把话说完 —— 立刻跳走的话这句提示一闪而过等于没说
    if (t.via === 'web' && inWechat) {
      toast('微信里打不开 App，右上角「···」→ 在浏览器打开');
      setTimeout(() => { window.location.href = t.url; }, 1400);
      return;
    }

    if (t.via === 'scheme') {
      const timer = setTimeout(() => { window.location.href = t.fallback; }, 1500);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) clearTimeout(timer);   // App 起来了，页面切到后台
      }, { once: true });
    }
    window.location.href = t.url;
  }

  // 供自动化测试检查跳转决策，不影响正常使用
  window.EatWhat = {
    platformTarget: (k, kw, center) =>
      platformTarget(PLATFORMS.find((x) => x.k === k), kw, center),
    env: { inWechat: inWechat, isAndroid: isAndroid, isIOS: isIOS }
  };

  /* 跳过去搜不对时的兜底：把菜名复制走，自己在 App 里搜 */
  function copyDish() {
    if (!state.last) return;
    const name = state.last.n;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(name)
        .then(() => toast('已复制「' + name + '」'))
        .catch(() => copyFallback(name));
    } else {
      copyFallback(name);
    }
  }

  function showNearby() {
    const box = $('#nearby');
    box.hidden = false;

    if (!Nearby.ready()) {
      box.innerHTML = '<p class="empty-note">还没配高德 Key。<br>' +
        '点右上角 ⚙️ 填一个免费的 Key，就能在这里直接看附近餐厅的评分、人均和距离。<br>' +
        '不想配也没关系，用上面三个按钮跳过去一样能找店。</p>';
      return;
    }

    box.innerHTML = '<p class="empty-note">正在找附近的店…</p>';
    Nearby.search($('#goEat').dataset.kw, $('#goEat').dataset.center, state.filter.range)
      .then((list) => {
        if (!list.length) {
          box.innerHTML = '<p class="empty-note">附近没搜到，换个范围或者用上面的按钮跳过去看看。</p>';
          return;
        }
        box.innerHTML = list.map((s) => {
          const meta = [];
          if (s.rating)   meta.push('⭐ ' + s.rating);
          if (s.cost)     meta.push('人均 ¥' + Math.round(s.cost));
          if (s.distance) meta.push(s.distance < 1000
            ? Math.round(s.distance) + ' m'
            : (s.distance / 1000).toFixed(1) + ' km');
          return '<div class="shop">' +
            '<div class="shop-top"><span class="shop-name">' + esc(s.name) + '</span>' +
              (meta.length ? '<span class="shop-meta">' + esc(meta.join(' · ')) + '</span>' : '') +
            '</div>' +
            (s.dishes.length
              ? '<div class="shop-dishes">' + s.dishes.map((d) => '<span class="tag">' + esc(d) + '</span>').join('') + '</div>'
              : '') +
            (s.address ? '<div class="shop-addr">' + esc(s.address) + '</div>' : '') +
          '</div>';
        }).join('');
      })
      .catch((err) => {
        const m = String(err.message || err);
        const why = m === 'NO_KEY'      ? '还没填 Key'
                  : m === 'NO_DATA'     ? '这一带没搜到相关的店'
                  : m.indexOf('SDK') === 0 ? '高德地图加载不出来，检查下网络或 Key 是否是「Web端(JS API)」类型'
                  : '高德返回：' + m;
        box.innerHTML = '<p class="empty-note">' + esc(why) +
          '<br>用上面的按钮跳到点评或高德也能找店。</p>';
      });
  }

  // ---------- 引导式选择 ----------
  /* 按「预算 → 菜系 → 口味 → 地点」一步步来，每步都能跳过 */
  const STEPS = [
    {
      title: '先定个预算', sub: '人均大概多少？', key: 'prices', multi: true,
      options: () => PRICES.map((p) => ({
        v: p.k,
        label: p.label,
        note: { 1: '20 元以内', 2: '20–50 元', 3: '50 元以上' }[p.k]
      }))
    },
    {
      title: '想吃什么菜系', sub: '可以多选，不选就是都行', key: 'cats', multi: true,
      options: () => CATEGORIES.map((c) => ({ v: c, label: c }))
    },
    {
      title: '口味呢', sub: '今天能吃辣吗？', key: 'spicy', multi: true,
      options: () => SPICY.map((s) => ({ v: s.k, label: s.label }))
    },
    {
      title: '在哪儿吃', sub: '这一步只用来找店，不影响抽到哪道菜', key: 'place', multi: false,
      options: () => [
        { v: 'near', label: '我附近', note: '需要定位' },
        { v: 'area', label: '选个商圈', note: '上海 ' + AREAS.length + ' 个常用商圈' },
        { v: 'any',  label: '还没定',  note: '待会儿再说' }
      ]
    }
  ];

  let wStep = 0;

  function openWizard() {
    wStep = 0;
    $('#wizard').hidden = false;
    document.body.style.overflow = 'hidden';
    renderStep();
  }
  function closeWizard() {
    $('#wizard').hidden = true;
    document.body.style.overflow = '';
  }

  function renderStep() {
    const st = STEPS[wStep];
    const f = state.filter;

    $('#wTitle').textContent = st.title;
    $('#wSub').textContent = st.sub;
    $('#wPrev').style.visibility = wStep === 0 ? 'hidden' : 'visible';
    $('#wDots').innerHTML = STEPS.map((_, i) =>
      '<span class="dot' + (i === wStep ? ' on' : '') + '"></span>').join('');

    $('#wOptions').innerHTML = st.options().map((o) => {
      const on = st.multi ? f[st.key].includes(o.v) : f[st.key] === o.v;
      // 未选中的选项先试算一下「选了还剩几道」，免得走到最后才发现选空了。
      // 已选中的不报数：那个数字是「取消之后」的量，写出来反而容易看反。
      let n = null;
      if (st.multi && !on) {
        const probe = {};
        probe[st.key] = f[st.key].concat([o.v]);
        n = pool(probe).length;
      }
      const note = [o.note, on ? '✓ 已选' : (n === null ? null : '剩 ' + n + ' 道')]
                     .filter(Boolean).join(' · ');
      return '<button class="w-opt' + (on ? ' on' : '') + (n === 0 ? ' zero' : '') + '" type="button" ' +
        'data-v="' + esc(String(o.v)) + '">' +
        '<span class="wo-label">' + esc(o.label) + '</span>' +
        (note ? '<span class="wo-note">' + esc(note) + '</span>' : '') +
      '</button>';
    }).join('');

    // 地点那步不影响候选数，显示的就是这轮最终能抽的数量
    const left = pool().length;
    const cnt = $('#wCount');
    cnt.textContent = left ? '候选 ' + left + ' 道' : '这么选没菜了，松一个条件吧';
    cnt.classList.toggle('warn', left === 0);

    /* 预算/菜系/口味都是多选，选一个不能就自动翻页，否则没法选第二个。
       所以让「往下走」这个动作自己显出来：选过东西之后按钮变主色的「下一步」。 */
    const isLast = wStep === STEPS.length - 1;
    const picked = st.multi && f[st.key].length > 0;
    const btn = $('#wSkip');
    btn.textContent = isLast ? '开抽 🎲' : (picked ? '下一步 ›' : '这步随便 ›');
    btn.className = 'btn btn-sm ' + (picked || isLast ? 'btn-primary' : 'btn-ghost');
  }

  function chooseInStep(v) {
    const st = STEPS[wStep];
    const f = state.filter;
    if (st.multi) {
      // 选项值可能是数字（价位、辣度）
      const val = isNaN(Number(v)) ? v : Number(v);
      toggleIn(f[st.key], val);
      save(KEY.filter, f);
      renderStep();
      renderFilter();
    } else {
      f[st.key] = v;
      save(KEY.filter, f);
      if (v === 'near') locate();
      renderFilter();
      nextStep();
    }
  }

  function prevStep() {
    if (wStep > 0) { wStep--; renderStep(); }
  }

  /* 左右滑动切换步骤。垂直位移更大时不拦，免得挡住正常滚动。 */
  function initSwipe() {
    const el = $('#wizard .sheet-body');
    let x0 = null, y0 = null;
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) { x0 = null; return; }
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
    }, { passive: true });
    el.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - x0, dy = t.clientY - y0;
      x0 = null;
      if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (dx < 0) nextStep(); else prevStep();
    }, { passive: true });
  }

  function nextStep() {
    if (wStep < STEPS.length - 1) {
      wStep++;
      renderStep();
    } else {
      closeWizard();
      renderFilter();
      roll();
    }
  }

  // ---------- 筛选 UI ----------
  function chip(label, on, data) {
    return '<button class="chip' + (on ? ' on' : '') + '" type="button" ' + data + '>' + esc(label) + '</button>';
  }

  function renderFilter() {
    const f = state.filter;

    $('#fMeal').innerHTML =
      chip('现在（' + MEAL_LABEL[currentMeal()] + '）', f.meal === 'auto', 'data-meal="auto"') +
      MEALS.map((m) => chip(m.label, f.meal === m.k, 'data-meal="' + m.k + '"')).join('') +
      chip('不限', f.meal === 'all', 'data-meal="all"');

    $('#fPrice').innerHTML = PRICES.map((p) => chip(p.label, f.prices.includes(p.k), 'data-price="' + p.k + '"')).join('');
    $('#fCat').innerHTML   = CATEGORIES.map((c) => chip(c, f.cats.includes(c), 'data-cat="' + esc(c) + '"')).join('');
    $('#fSpicy').innerHTML = SPICY.map((s) => chip(s.label, f.spicy.includes(s.k), 'data-spicy="' + s.k + '"')).join('');

    $('#fPlace').innerHTML =
      chip('我附近', f.place === 'near', 'data-place="near"') +
      chip('选商圈', f.place === 'area', 'data-place="area"') +
      chip('还没定', f.place === 'any',  'data-place="any"');

    $('#areaWrap').hidden = f.place !== 'area';
    $('#rangeWrap').hidden = f.place !== 'near';
    $('#areaSel').innerHTML = AREAS
      .map((a) => '<option value="' + esc(a.n) + '"' + (a.n === f.area ? ' selected' : '') + '>' + esc(a.n) + '</option>').join('');
    $('#fRange').innerHTML = RANGES.map((r) => chip(r.label, f.range === r.k, 'data-range="' + r.k + '"')).join('');

    $('#fVeg').checked = f.veg;
    $('#fAvoid').checked = f.avoid;
    $('#poolCount').textContent = '候选 ' + pool().length + ' 道';

    if (state.last) renderGoEat();
  }

  function toggleIn(arr, val) {
    const i = arr.indexOf(val);
    if (i < 0) arr.push(val); else arr.splice(i, 1);
    return arr;
  }
  function onFilterChange() {
    save(KEY.filter, state.filter);
    renderFilter();
  }

  // ---------- 记录 ----------
  function eatIt() {
    const d = state.last;
    if (!d) return;
    state.hist.unshift({ id: d.id, n: d.n, e: d.e, ts: Date.now() });
    state.hist = state.hist.slice(0, 200);
    save(KEY.hist, state.hist);
    toast('已记下：' + d.n + '，好好吃饭 🍚');
    renderHistory();
  }

  function timeText(ts) {
    const d = new Date(ts);
    const days = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(ts).setHours(0, 0, 0, 0)) / DAY);
    const hm = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    if (days === 0) return '今天 ' + hm;
    if (days === 1) return '昨天 ' + hm;
    if (days < 7) return days + ' 天前';
    return (d.getMonth() + 1) + '月' + d.getDate() + '日';
  }

  function renderHistory() {
    const list = $('#histList');
    if (!state.hist.length) {
      list.innerHTML = '<p class="empty-note">还没有记录，抽完点「就吃这个」就会记在这里。</p>';
    } else {
      list.innerHTML = state.hist.map((h, i) =>
        '<div class="hist-row">' +
          '<span class="h-emoji">' + esc(h.e) + '</span>' +
          '<span class="h-name">' + esc(h.n) + '</span>' +
          '<span class="h-time">' + timeText(h.ts) + '</span>' +
          '<button class="del-btn" data-hist="' + i + '" type="button">删除</button>' +
        '</div>'
      ).join('');
    }

    const weekAgo = Date.now() - 7 * DAY;
    const week = state.hist.filter((h) => h.ts >= weekAgo).length;
    const count = {};
    state.hist.forEach((h) => { count[h.n] = (count[h.n] || 0) + 1; });
    const top = Object.keys(count).sort((a, b) => count[b] - count[a])[0];

    $('#stats').innerHTML =
      stat(week, '最近 7 天') + stat(state.hist.length, '累计记录') +
      stat(top || '—', '最常吃', !top || top.length > 4);
  }

  function stat(num, label, small) {
    return '<div><div class="stat-num' + (small ? ' small' : '') + '">' + esc(String(num)) + '</div>' +
           '<div class="stat-label">' + label + '</div></div>';
  }

  // ---------- 菜单 UI ----------
  function renderMenu() {
    const kw = $('#search').value.trim().toLowerCase();
    const offSet = new Set(state.off);
    const groups = {};

    allDishes().forEach((d) => {
      if (kw && d.n.toLowerCase().indexOf(kw) < 0) return;
      (groups[d.c] = groups[d.c] || []).push(d);
    });

    const cats = CATEGORIES.filter((c) => groups[c] && groups[c].length);
    if (!cats.length) {
      $('#dishList').innerHTML = '<p class="empty-note">没找到这道菜，去上面添加一个吧。</p>';
      return;
    }

    $('#dishList').innerHTML = cats.map((c) => {
      const rows = groups[c].map((d) => {
        const off = offSet.has(d.id);
        const meta = d.m.split('').map((k) => MEAL_LABEL[k]).join('/');
        return '<label class="dish-row' + (off ? ' off' : '') + '">' +
          '<input type="checkbox" data-toggle="' + d.id + '"' + (off ? '' : ' checked') + '>' +
          '<span class="name">' + esc(d.e) + ' ' + esc(d.n) + '</span>' +
          '<span class="meta">' + meta + '</span>' +
          (d.id.charAt(0) === 'c' ? '<button class="del-btn" data-del="' + d.id + '" type="button">删除</button>' : '') +
        '</label>';
      }).join('');
      return '<div class="cat-group"><div class="cat-name">' + esc(c) +
             '（' + groups[c].length + '）</div>' + rows + '</div>';
    }).join('');
  }

  function fillSelects() {
    $('#addCat').innerHTML   = CATEGORIES.map((c) => '<option value="' + esc(c) + '">' + esc(c) + '</option>').join('');
    $('#addPrice').innerHTML = PRICES.map((p) => '<option value="' + p.k + '"' + (p.k === 2 ? ' selected' : '') + '>' + p.label + '</option>').join('');
    $('#addSpicy').innerHTML = SPICY.map((s) => '<option value="' + s.k + '">' + s.label + '</option>').join('');
  }

  function addDish(e) {
    e.preventDefault();
    const name = $('#addName').value.trim();
    if (!name) return;
    if (allDishes().some((d) => d.n === name)) {
      toast('「' + name + '」已经在菜单里了');
      return;
    }
    state.custom.push({
      id: 'c' + Date.now().toString(36) + Math.floor(Math.random() * 1000),
      n: name, e: '🍽️', c: $('#addCat').value, m: 'bldn',
      p: Number($('#addPrice').value), s: Number($('#addSpicy').value), v: false
    });
    save(KEY.custom, state.custom);
    $('#addName').value = '';
    renderMenu();
    renderFilter();
    toast('加好了：' + name);
  }

  // ---------- 杂项 ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1900);
  }

  function switchView(name) {
    document.querySelectorAll('.view').forEach((v) => v.classList.toggle('is-active', v.id === 'view-' + name));
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('is-active', t.dataset.view === name));
    window.scrollTo(0, 0);
    if (name === 'menu') renderMenu();
    if (name === 'history') renderHistory();
    if (name === 'pick') renderFilter();
  }

  function applyTheme(t) {
    if (t) document.documentElement.setAttribute('data-theme', t);
    else document.documentElement.removeAttribute('data-theme');
    const dark = t === 'dark' || (!t && matchMedia('(prefers-color-scheme: dark)').matches);
    $('#themeBtn').textContent = dark ? '☀️' : '🌙';
  }

  function initShake() {
    let last = 0, lastMag = 0;
    function onMotion(e) {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const mag = Math.sqrt((a.x || 0) ** 2 + (a.y || 0) ** 2 + (a.z || 0) ** 2);
      const now = Date.now();
      if (Math.abs(mag - lastMag) > 16 && now - last > 1200) {
        last = now;
        if ($('#view-pick').classList.contains('is-active') && $('#wizard').hidden) roll();
      }
      lastMag = mag;
    }
    if (typeof DeviceMotionEvent !== 'undefined' &&
        typeof DeviceMotionEvent.requestPermission === 'function') {
      $('#tip').innerHTML = '<button class="text-btn" id="shakeBtn" type="button">开启摇一摇</button>';
      document.addEventListener('click', function handler(e) {
        if (e.target.id !== 'shakeBtn') return;
        DeviceMotionEvent.requestPermission().then((r) => {
          if (r === 'granted') {
            window.addEventListener('devicemotion', onMotion);
            $('#tip').textContent = '摇一摇手机就能抽 🎲';
          } else {
            $('#tip').textContent = '没拿到权限，用按钮抽也一样';
          }
        }).catch(() => { $('#tip').textContent = '这台设备不支持摇一摇'; });
        document.removeEventListener('click', handler);
      });
    } else if ('ondevicemotion' in window) {
      window.addEventListener('devicemotion', onMotion);
    } else {
      $('#tip').textContent = '点按钮开抽，选不出来就多抽两次 🎲';
    }
  }

  // ---------- 分享 ----------
  /* 手机上走系统分享面板，桌面/不支持的退回复制链接 */
  function share() {
    const url = location.href.split(/[?#]/)[0];
    const data = { title: '今天吃啥', text: '纠结吃啥的时候点一下，帮你决定', url: url };

    if (navigator.share) {
      navigator.share(data).catch(() => {});   // 用户取消分享不算错误
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => toast('链接已复制，发给朋友吧'))
        .catch(() => copyFallback(url));
      return;
    }
    copyFallback(url);
  }

  /* 老浏览器 / 非安全上下文下 clipboard API 不可用 */
  function copyFallback(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-9999px';
    document.body.appendChild(ta);
    ta.select();
    let okCopy = false;
    try { okCopy = document.execCommand('copy'); } catch (e) { okCopy = false; }
    document.body.removeChild(ta);
    toast(okCopy ? '已复制' : text);
  }

  // ---------- 设置 ----------
  function openSettings() {
    const c = Nearby.conf() || {};
    $('#amapKey').value = c.key || '';
    $('#amapCode').value = c.code || '';
    $('#settings').hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeSheet(id) {
    $('#' + id).hidden = true;
    document.body.style.overflow = '';
  }

  // ---------- 事件绑定 ----------
  function bind() {
    $('#rollBtn').addEventListener('click', () => roll());
    $('#againBtn').addEventListener('click', () => roll(state.last && state.last.id));
    $('#eatBtn').addEventListener('click', eatIt);
    $('#wizardBtn').addEventListener('click', openWizard);

    $('#filterToggle').addEventListener('click', () => {
      const btn = $('#filterToggle');
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      $('#filterBody').hidden = open;
    });

    const pick = (sel, attr, fn) => $(sel).addEventListener('click', (e) => {
      const b = e.target.closest('[data-' + attr + ']');
      if (!b) return;
      fn(b.dataset[attr]);
      onFilterChange();
    });
    pick('#fMeal',  'meal',  (v) => { state.filter.meal = v; });
    pick('#fCat',   'cat',   (v) => toggleIn(state.filter.cats, v));
    pick('#fPrice', 'price', (v) => toggleIn(state.filter.prices, Number(v)));
    pick('#fSpicy', 'spicy', (v) => toggleIn(state.filter.spicy, Number(v)));
    pick('#fRange', 'range', (v) => { state.filter.range = Number(v); });
    pick('#fPlace', 'place', (v) => {
      state.filter.place = v;
      if (v === 'near' && !state.geo) locate();
    });

    $('#areaSel').addEventListener('change', (e) => { state.filter.area = e.target.value; onFilterChange(); });
    $('#fVeg').addEventListener('change', (e) => { state.filter.veg = e.target.checked; onFilterChange(); });
    $('#fAvoid').addEventListener('change', (e) => { state.filter.avoid = e.target.checked; onFilterChange(); });
    $('#resetFilter').addEventListener('click', () => {
      state.filter = freshFilter();
      onFilterChange();
      toast('筛选已重置');
    });

    // 引导流程
    $('#wOptions').addEventListener('click', (e) => {
      const b = e.target.closest('[data-v]');
      if (b) chooseInStep(b.dataset.v);
    });
    $('#wSkip').addEventListener('click', nextStep);
    $('#wPrev').addEventListener('click', prevStep);

    // 去哪吃
    $('#platforms').addEventListener('click', (e) => {
      const b = e.target.closest('[data-plat]');
      if (b) openPlatform(b.dataset.plat);
    });
    $('#copyDish').addEventListener('click', copyDish);
    $('#nearbyBtn').addEventListener('click', () => {
      const box = $('#nearby');
      if (!box.hidden) { box.hidden = true; return; }
      showNearby();
    });

    // 菜单
    $('#addForm').addEventListener('submit', addDish);
    $('#search').addEventListener('input', renderMenu);
    $('#restoreBtn').addEventListener('click', () => {
      if (!confirm('恢复默认菜单？自己添加的菜会被删掉，吃饭记录保留。')) return;
      state.custom = []; state.off = [];
      save(KEY.custom, state.custom); save(KEY.off, state.off);
      renderMenu(); renderFilter();
      toast('已恢复默认菜单');
    });
    $('#dishList').addEventListener('click', (e) => {
      const del = e.target.closest('[data-del]');
      if (!del) return;
      e.preventDefault();
      state.custom = state.custom.filter((d) => d.id !== del.dataset.del);
      save(KEY.custom, state.custom);
      renderMenu(); renderFilter();
    });
    $('#dishList').addEventListener('change', (e) => {
      const cb = e.target.closest('[data-toggle]');
      if (!cb) return;
      const id = cb.dataset.toggle;
      state.off = cb.checked ? state.off.filter((x) => x !== id) : state.off.concat(id);
      save(KEY.off, state.off);
      cb.closest('.dish-row').classList.toggle('off', !cb.checked);
      renderFilter();
    });

    // 记录
    $('#histList').addEventListener('click', (e) => {
      const b = e.target.closest('[data-hist]');
      if (!b) return;
      state.hist.splice(Number(b.dataset.hist), 1);
      save(KEY.hist, state.hist);
      renderHistory();
    });
    $('#clearHist').addEventListener('click', () => {
      if (!state.hist.length) return;
      if (!confirm('清空全部吃饭记录？')) return;
      state.hist = [];
      save(KEY.hist, state.hist);
      renderHistory();
      toast('记录已清空');
    });

    // 设置
    $('#shareBtn').addEventListener('click', share);
    $('#setBtn').addEventListener('click', openSettings);
    $('#saveKey').addEventListener('click', () => {
      const key = $('#amapKey').value.trim();
      if (!key) { toast('Key 不能为空'); return; }
      Nearby.setConf({ key: key, code: $('#amapCode').value.trim() });
      closeSheet('settings');
      renderFilter();
      toast('保存好了，抽完就能看附近的店');
    });
    $('#clearKey').addEventListener('click', () => {
      Nearby.setConf(null);
      $('#amapKey').value = ''; $('#amapCode').value = '';
      renderFilter();
      toast('已清除');
    });

    document.addEventListener('click', (e) => {
      const c = e.target.closest('[data-close]');
      if (c) closeSheet(c.dataset.close);
    });

    document.querySelectorAll('.tab').forEach((t) => {
      t.addEventListener('click', () => switchView(t.dataset.view));
    });

    $('#themeBtn').addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      save(KEY.theme, next);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!$('#wizard').hidden) closeSheet('wizard');
        if (!$('#settings').hidden) closeSheet('settings');
        return;
      }
      if (e.code !== 'Space' && e.code !== 'Enter') return;
      if (/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName)) return;
      if (!$('#view-pick').classList.contains('is-active')) return;
      if (!$('#wizard').hidden || !$('#settings').hidden) return;
      e.preventDefault();
      roll();
    });
  }

  // ---------- 启动 ----------
  applyTheme(load(KEY.theme, null));
  fillSelects();
  renderFilter();
  renderHistory();
  bind();
  syncButtons();
  initShake();
  initSwipe();
})();
