/* 高德附近餐厅搜索（可选功能）
 *
 * 为什么用 JS API 而不是 Web 服务 API：
 *   restapi.amap.com 的 Web 服务接口不允许浏览器跨域直接调用，纯静态站点用不了；
 *   官方给浏览器用的是 JS API 的 AMap.PlaceSearch 插件，个人开发者可以免费申请。
 *
 * 没配 Key 时这个模块什么都不做，主流程照常跑。
 */
window.Nearby = (function () {
  'use strict';

  const KEY_STORE = 'ew.amap';
  let loading = null;

  function conf() {
    try { return JSON.parse(localStorage.getItem(KEY_STORE) || 'null'); }
    catch (e) { return null; }
  }
  function setConf(c) {
    if (c) localStorage.setItem(KEY_STORE, JSON.stringify(c));
    else localStorage.removeItem(KEY_STORE);
  }
  function ready() {
    const c = conf();
    return !!(c && c.key);
  }

  /** 按需加载高德 JS API（只加载一次） */
  function loadSDK() {
    if (loading) return loading;
    const c = conf();
    if (!c || !c.key) return Promise.reject(new Error('NO_KEY'));

    loading = new Promise((resolve, reject) => {
      if (window.AMap && window.AMap.PlaceSearch) return resolve();

      // 2021-12 之后申请的 Key 必须配套安全密钥
      if (c.code) window._AMapSecurityConfig = { securityJsCode: c.code };

      const s = document.createElement('script');
      s.src = 'https://webapi.amap.com/maps?v=2.0&key=' +
              encodeURIComponent(c.key) + '&plugin=AMap.PlaceSearch';
      s.async = true;
      s.onerror = () => { loading = null; reject(new Error('SDK_LOAD_FAILED')); };
      s.onload = () => {
        if (window.AMap && window.AMap.PlaceSearch) return resolve();
        // 有些情况下插件要再显式加载一次
        if (window.AMap && window.AMap.plugin) {
          window.AMap.plugin('AMap.PlaceSearch', () => resolve());
        } else {
          loading = null;
          reject(new Error('SDK_BAD'));
        }
      };
      document.head.appendChild(s);

      setTimeout(() => { if (!window.AMap) { loading = null; reject(new Error('SDK_TIMEOUT')); } }, 12000);
    });
    return loading;
  }

  /**
   * 搜附近的店
   * @param {string} keyword  搜索词，一般是菜名
   * @param {string} center   '经度,纬度'，为空则按城市搜
   * @param {number} radius   半径（米）
   * @returns {Promise<Array>} 餐厅列表
   */
  function search(keyword, center, radius) {
    return loadSDK().then(() => new Promise((resolve, reject) => {
      const ps = new AMap.PlaceSearch({
        city: CITY.name,
        citylimit: true,
        pageSize: 10,
        pageIndex: 1,
        extensions: 'all',        // 要 all 才有评分和人均
        type: '餐饮服务'
      });

      const done = (status, res) => {
        if (status !== 'complete' || !res || !res.poiList || !res.poiList.pois) {
          return reject(new Error(
            status === 'no_data' ? 'NO_DATA' : String((res && res.info) || status)
          ));
        }
        resolve(res.poiList.pois.map(normalize));
      };

      if (center) {
        const [lng, lat] = center.split(',').map(Number);
        ps.searchNearBy(keyword, [lng, lat], radius || 2000, done);
      } else {
        ps.search(keyword, done);
      }
    }));
  }

  /** 高德返回的字段不太稳定，统一成自己的形状，缺什么就不显示什么 */
  function normalize(p) {
    // 评分和人均在不同版本里出现在不同位置，挨个找一遍；
    // 另外这属于增值字段，基础版查询可能压根不返回
    const biz = p.biz_ext || p.bizExt || {};
    const num = (v) => {
      const n = parseFloat(v);
      return isFinite(n) && n > 0 ? n : null;
    };
    const pick = (...vals) => {
      for (const v of vals) {
        const n = num(v);
        if (n !== null) return n;
      }
      return null;
    };
    const loc = p.location || {};
    return {
      id: p.id,
      name: p.name || '',
      lng: typeof loc.lng === 'number' ? loc.lng : null,
      lat: typeof loc.lat === 'number' ? loc.lat : null,
      address: typeof p.address === 'string' ? p.address : '',
      tel: typeof p.tel === 'string' ? p.tel : '',
      distance: num(p.distance),
      rating: pick(biz.rating, p.rating),
      cost: pick(biz.cost, biz.meal_price, p.cost),
      // 高德的 tag 字段里常常就是推荐菜，例如 "小笼包,蟹粉小笼"
      dishes: (typeof p.tag === 'string' ? p.tag : (typeof p.tags === 'string' ? p.tags : ''))
                .split(/[,，]/).map((s) => s.trim()).filter(Boolean).slice(0, 4)
    };
  }

  /* 用高德自己的定位。
     浏览器原生定位给的是 WGS-84，高德用 GCJ-02，市区能差三五百米；
     高德这个插件直接返回 GCJ-02，省掉坐标转换。 */
  function locate() {
    return loadSDK().then(() => new Promise((resolve, reject) => {
      AMap.plugin('AMap.Geolocation', () => {
        const g = new AMap.Geolocation({
          enableHighAccuracy: true,
          timeout: 10000,
          GeoLocationFirst: true      // 优先用浏览器定位，高德会做坐标纠偏
        });
        g.getCurrentPosition((status, r) => {
          if (status === 'complete' && r.position) {
            resolve(r.position.lng.toFixed(6) + ',' + r.position.lat.toFixed(6));
          } else {
            reject(new Error((r && r.message) || 'GEO_FAILED'));
          }
        });
      });
    }));
  }

  /* 三种出行方式各要多久。
     按需调用（点开某家店才查），一次三个请求，别对整个列表跑。
     某种方式查不到就不返回那一项，界面上就不显示。 */
  function routes(origin, dest) {
    return loadSDK().then(() => new Promise((resolve) => {
      AMap.plugin(['AMap.Driving', 'AMap.Riding', 'AMap.Walking'], () => {
        const out = {};
        const from = origin.split(',').map(Number);
        const to = [dest.lng, dest.lat];
        const jobs = [
          ['drive', () => new AMap.Driving({ policy: 0 })],
          ['ride',  () => new AMap.Riding()],
          ['walk',  () => new AMap.Walking()]
        ];
        let left = jobs.length;
        const done = () => { if (--left === 0) { clearTimeout(timer); resolve(out); } };
        // 有的服务可能一直不回调，整体设个上限，能查到几个算几个
        const timer = setTimeout(() => { left = -1; resolve(out); }, 12000);

        jobs.forEach(([k, make]) => {
          let svc;
          try { svc = make(); } catch (e) { return done(); }
          svc.search(from, to, (status, res) => {
            if (left < 0) return;                    // 已经超时返回过了
            if (status === 'complete' && res && res.routes && res.routes.length) {
              const r = res.routes[0];
              out[k] = { time: r.time, distance: r.distance };
            }
            done();
          });
        });
      });
    }));
  }

  return { conf, setConf, ready, search, locate, routes };
})();
