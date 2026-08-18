/* 今天吃啥 —— 纠结时帮你决定一顿饭 */
(function () {
  'use strict';

  // ---------- 本地存储 ----------
  const KEY = {
    custom: 'ew.custom',    // 用户自己加的菜
    off:    'ew.off',       // 被取消勾选的菜 id
    hist:   'ew.history',   // 吃饭记录
    filter: 'ew.filter',    // 筛选条件
    theme:  'ew.theme'
  };

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* 隐私模式等，忽略 */ }
  }

  // ---------- 状态 ----------
  const state = {
    custom: load(KEY.custom, []),
    off:    load(KEY.off, []),
    hist:   load(KEY.hist, []),
    filter: Object.assign({
      meal: 'auto',   // auto | b | l | d | n | all
      cats: [],       // 空数组＝全部
      prices: [],
      spicy: [],
      veg: false,
      avoid: true
    }, load(KEY.filter, {})),
    last: null,
    rolling: false
  };

  const $ = (sel) => document.querySelector(sel);

  // 默认菜带上稳定 id，方便记住"哪些被取消勾选了"
  const baseDishes = DEFAULT_DISHES.map((d, i) => Object.assign({ id: 'd' + i }, d));
  const allDishes = () => baseDishes.concat(state.custom);

  const DAY = 86400000;
  const MEAL_LABEL = { b: '早餐', l: '午餐', d: '晚餐', n: '夜宵' };

  /** 根据当前时间猜这顿是哪一餐 */
  function currentMeal() {
    const h = new Date().getHours();
    if (h >= 5  && h < 10) return 'b';
    if (h >= 10 && h < 15) return 'l';
    if (h >= 15 && h < 21) return 'd';
    return 'n';
  }

  // ---------- 候选池 ----------
  function pool() {
    const f = state.filter;
    const offSet = new Set(state.off);
    const meal = f.meal === 'auto' ? currentMeal() : f.meal;

    return allDishes().filter((d) => {
      if (offSet.has(d.id)) return false;
      if (meal !== 'all' && !d.m.includes(meal)) return false;
      if (f.cats.length && !f.cats.includes(d.c)) return false;
      if (f.prices.length && !f.prices.includes(d.p)) return false;
      if (f.spicy.length && !f.spicy.includes(d.s)) return false;
      if (f.veg && !d.v) return false;
      return true;
    });
  }

  /** 最近吃过的降权，避免连着抽到同一个 */
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
      syncButtons();
      return;
    }
    // "换一个"时尽量避开刚抽到的
    if (excludeId && list.length > 1) {
      list = list.filter((d) => d.id !== excludeId);
    }

    const final = pickFrom(list);
    state.rolling = true;
    syncButtons();
    resultEl.className = 'result rolling';

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
      stat(week, '最近 7 天') +
      stat(state.hist.length, '累计记录') +
      stat(top || '—', '最常吃', !top || top.length > 4);
  }

  function stat(num, label, small) {
    return '<div><div class="stat-num' + (small ? ' small' : '') + '">' + esc(String(num)) + '</div>' +
           '<div class="stat-label">' + label + '</div></div>';
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

    $('#fCat').innerHTML = CATEGORIES
      .map((c) => chip(c, f.cats.includes(c), 'data-cat="' + esc(c) + '"')).join('');

    $('#fPrice').innerHTML = PRICES
      .map((p) => chip(p.label, f.prices.includes(p.k), 'data-price="' + p.k + '"')).join('');

    $('#fSpicy').innerHTML = SPICY
      .map((s) => chip(s.label, f.spicy.includes(s.k), 'data-spicy="' + s.k + '"')).join('');

    $('#fVeg').checked = f.veg;
    $('#fAvoid').checked = f.avoid;
    $('#poolCount').textContent = '候选 ' + pool().length + ' 道';
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
          (d.id.charAt(0) === 'c'
            ? '<button class="del-btn" data-del="' + d.id + '" type="button">删除</button>'
            : '') +
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
      n: name,
      e: '🍽️',
      c: $('#addCat').value,
      m: 'bldn',          // 自己加的菜默认哪一餐都行
      p: Number($('#addPrice').value),
      s: Number($('#addSpicy').value),
      v: false
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

  // 摇一摇
  function initShake() {
    let last = 0, lastMag = 0;
    function onMotion(e) {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const mag = Math.sqrt((a.x || 0) ** 2 + (a.y || 0) ** 2 + (a.z || 0) ** 2);
      const now = Date.now();
      if (Math.abs(mag - lastMag) > 16 && now - last > 1200) {
        last = now;
        if ($('#view-pick').classList.contains('is-active')) roll();
      }
      lastMag = mag;
    }
    // iOS 13+ 需要用户手势里申请权限
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

  // ---------- 事件绑定 ----------
  function bind() {
    $('#rollBtn').addEventListener('click', () => roll());
    $('#againBtn').addEventListener('click', () => roll(state.last && state.last.id));
    $('#eatBtn').addEventListener('click', eatIt);

    $('#filterToggle').addEventListener('click', () => {
      const btn = $('#filterToggle');
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      $('#filterBody').hidden = open;
    });

    $('#fMeal').addEventListener('click', (e) => {
      const b = e.target.closest('[data-meal]');
      if (!b) return;
      state.filter.meal = b.dataset.meal;
      onFilterChange();
    });
    $('#fCat').addEventListener('click', (e) => {
      const b = e.target.closest('[data-cat]');
      if (!b) return;
      toggleIn(state.filter.cats, b.dataset.cat);
      onFilterChange();
    });
    $('#fPrice').addEventListener('click', (e) => {
      const b = e.target.closest('[data-price]');
      if (!b) return;
      toggleIn(state.filter.prices, Number(b.dataset.price));
      onFilterChange();
    });
    $('#fSpicy').addEventListener('click', (e) => {
      const b = e.target.closest('[data-spicy]');
      if (!b) return;
      toggleIn(state.filter.spicy, Number(b.dataset.spicy));
      onFilterChange();
    });
    $('#fVeg').addEventListener('change', (e) => { state.filter.veg = e.target.checked; onFilterChange(); });
    $('#fAvoid').addEventListener('change', (e) => { state.filter.avoid = e.target.checked; onFilterChange(); });
    $('#resetFilter').addEventListener('click', () => {
      state.filter = { meal: 'auto', cats: [], prices: [], spicy: [], veg: false, avoid: true };
      onFilterChange();
      toast('筛选已重置');
    });

    $('#addForm').addEventListener('submit', addDish);
    $('#search').addEventListener('input', renderMenu);
    $('#restoreBtn').addEventListener('click', () => {
      if (!confirm('恢复默认菜单？自己添加的菜会被删掉，吃饭记录保留。')) return;
      state.custom = [];
      state.off = [];
      save(KEY.custom, state.custom);
      save(KEY.off, state.off);
      renderMenu();
      renderFilter();
      toast('已恢复默认菜单');
    });

    $('#dishList').addEventListener('click', (e) => {
      const del = e.target.closest('[data-del]');
      if (!del) return;
      e.preventDefault();
      state.custom = state.custom.filter((d) => d.id !== del.dataset.del);
      save(KEY.custom, state.custom);
      renderMenu();
      renderFilter();
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

    document.querySelectorAll('.tab').forEach((t) => {
      t.addEventListener('click', () => switchView(t.dataset.view));
    });

    $('#themeBtn').addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
      const next = cur === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      save(KEY.theme, next);
    });

    // 空格 / 回车快速抽
    document.addEventListener('keydown', (e) => {
      if (e.code !== 'Space' && e.code !== 'Enter') return;
      if (/INPUT|SELECT|TEXTAREA|BUTTON/.test(e.target.tagName)) return;
      if (!$('#view-pick').classList.contains('is-active')) return;
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
})();
