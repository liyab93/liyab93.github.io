// ============================================================
//  深浅模式切换 + 语言下拉菜单
// ============================================================
(function () {
  'use strict';

  // ---- 深浅模式 ----
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // ---- 语言下拉 ----
  var lang = document.getElementById('lang');
  var langBtn = document.getElementById('lang-btn');
  if (lang && langBtn) {
    langBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = lang.classList.toggle('open');
      langBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!lang.contains(e.target)) {
        lang.classList.remove('open');
        langBtn.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') lang.classList.remove('open');
    });
  }

  // ---- 应用搜索 / 平台筛选（应用多时自动可用） ----
  var toolbar = document.querySelector('[data-app-toolbar]');
  var grid = document.querySelector('[data-app-grid]');
  if (toolbar && grid) {
    var search = toolbar.querySelector('[data-app-search]');
    var countEl = toolbar.querySelector('[data-app-count]');
    var emptyEl = document.querySelector('[data-app-empty]');
    var chips = [].slice.call(toolbar.querySelectorAll('[data-plat]'));
    var items = [].slice.call(grid.querySelectorAll('[data-app-item]'));
    var countWord = countEl ? (countEl.getAttribute('data-word') || '') : '';
    var plat = 'all';

    function apply() {
      var q = (search ? search.value : '').trim().toLowerCase();
      var n = 0;
      items.forEach(function (el) {
        var plats = (el.getAttribute('data-platforms') || '').split(',');
        var okPlat = plat === 'all' || plats.indexOf(plat) !== -1;
        var okText = q === '' || (el.getAttribute('data-search') || '').indexOf(q) !== -1;
        var show = okPlat && okText;
        el.hidden = !show;
        if (show) n++;
      });
      if (countEl) countEl.textContent = n + ' ' + countWord;
      if (emptyEl) emptyEl.hidden = n !== 0;
    }

    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        plat = c.getAttribute('data-plat');
        chips.forEach(function (x) { x.classList.toggle('is-active', x === c); });
        apply();
      });
    });
    if (search) search.addEventListener('input', apply);
    apply();
  }

  // ---- 详情页：通过 App Store lookup 接口实时填充 版本 / 系统要求 / 更新于 ----
  var spec = document.querySelector('[data-appstore-spec]');
  if (spec) {
    var ids = (spec.getAttribute('data-store-urls') || '')
      .split(',')
      .map(function (u) { var m = u.match(/id(\d+)/); return m ? m[1] : null; })
      .filter(Boolean);

    if (ids.length) {
      var country = spec.getAttribute('data-country') || 'cn';

      var setSpec = function (key, val) {
        if (!val) return;
        var dd = spec.querySelector('[data-spec="' + key + '"]');
        var row = spec.querySelector('[data-spec-row="' + key + '"]');
        if (dd && row) { dd.textContent = val; row.hidden = false; }
      };

      var fill = function (results) {
        if (!results || !results.length) return;
        var versions = [], requires = [], dates = [];
        results.forEach(function (r) {
          if (r.version && versions.indexOf(r.version) === -1) versions.push(r.version);
          if (r.minimumOsVersion) {
            var os = r.kind === 'mac-software' ? 'macOS' : 'iOS';
            var label = os + ' ' + r.minimumOsVersion.split('.')[0];
            if (requires.indexOf(label) === -1) requires.push(label);
          }
          if (r.currentVersionReleaseDate) dates.push(r.currentVersionReleaseDate);
        });
        setSpec('version', versions.join(' / '));
        setSpec('requires', requires.join(' · '));
        var latest = dates.sort().pop();
        setSpec('updated', latest ? latest.slice(0, 7) : null);
      };

      // 最新更新记录（releaseNotes）
      var cl = document.querySelector('[data-changelog]');
      var clBody = cl && cl.querySelector('[data-changelog-body]');
      var buildChangelog = function (results) {
        if (!cl || !clBody || !results || !results.length) return;
        var multi = results.length > 1;
        var sorted = results.slice().sort(function (a, b) {
          return (b.currentVersionReleaseDate || '').localeCompare(a.currentVersionReleaseDate || '');
        });
        var any = false;
        sorted.forEach(function (r) {
          if (!r.releaseNotes) return;
          any = true;
          var item = document.createElement('div'); item.className = 'cl-item';
          var head = document.createElement('div'); head.className = 'cl-head';
          if (r.version) {
            var ver = document.createElement('span'); ver.className = 'cl-ver';
            ver.textContent = 'v' + r.version; head.appendChild(ver);
          }
          if (multi) {
            var plat = document.createElement('span'); plat.className = 'cl-plat';
            plat.textContent = r.kind === 'mac-software' ? 'macOS' : 'iOS'; head.appendChild(plat);
          }
          if (r.currentVersionReleaseDate) {
            var dt = document.createElement('span'); dt.className = 'cl-date';
            dt.textContent = r.currentVersionReleaseDate.slice(0, 10); head.appendChild(dt);
          }
          var notes = document.createElement('p'); notes.className = 'cl-notes';
          notes.textContent = r.releaseNotes;
          item.appendChild(head); item.appendChild(notes);
          clBody.appendChild(item);
        });
        if (any) cl.hidden = false;
      };

      var cbName = 'itunesCb_' + Math.random().toString(36).slice(2);
      window[cbName] = function (data) {
        var results = data && data.results;
        try { fill(results); } catch (e) {}
        try { buildChangelog(results); } catch (e) {}
        delete window[cbName];
      };
      var s = document.createElement('script');
      s.src = 'https://itunes.apple.com/lookup?id=' + ids.join(',') +
              '&country=' + encodeURIComponent(country) + '&callback=' + cbName;
      s.onerror = function () { try { delete window[cbName]; } catch (e) {} };
      document.head.appendChild(s);
    }
  }

  // ---- 截图画廊：左右按钮 + 圆点指示器 + 滚动联动 ----
  [].slice.call(document.querySelectorAll('[data-sc]')).forEach(function (sc) {
    var track = sc.querySelector('[data-sc-track]');
    if (!track) return;
    var frames = [].slice.call(track.querySelectorAll('.sc-frame'));
    if (!frames.length) return;
    var prev = sc.querySelector('[data-sc-prev]');
    var next = sc.querySelector('[data-sc-next]');
    var dotsWrap = sc.querySelector('[data-sc-dots]');
    var dots = [].slice.call(sc.querySelectorAll('.sc-dot'));

    // 某张图相对滚动内容的绝对偏移（不受当前滚动位置影响）
    function offsetOf(f) {
      return f.getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
    }
    function overflowing() { return track.scrollWidth - track.clientWidth > 4; }
    function currentIndex() {
      var pos = track.scrollLeft, best = 0, bestD = Infinity;
      frames.forEach(function (f, i) {
        var d = Math.abs(offsetOf(f) - pos);
        if (d < bestD) { bestD = d; best = i; }
      });
      return best;
    }
    function goTo(i) {
      i = Math.max(0, Math.min(frames.length - 1, i));
      track.scrollTo({ left: offsetOf(frames[i]), behavior: 'smooth' });
    }
    function update() {
      var i = currentIndex(), of = overflowing();
      dots.forEach(function (d, di) { d.classList.toggle('is-active', di === i); });
      if (dotsWrap) dotsWrap.hidden = !of;
      if (prev) { prev.hidden = !of; prev.disabled = i <= 0; }
      if (next) { next.hidden = !of; next.disabled = i >= frames.length - 1; }
    }

    if (prev) prev.addEventListener('click', function () { goTo(currentIndex() - 1); });
    if (next) next.addEventListener('click', function () { goTo(currentIndex() + 1); });
    dots.forEach(function (d) {
      d.addEventListener('click', function () { goTo(parseInt(d.getAttribute('data-sc-i'), 10) || 0); });
    });

    var raf;
    track.addEventListener('scroll', function () {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }, { passive: true });
    window.addEventListener('resize', update);
    // 图片尺寸在加载后才确定，加载完重新计算是否溢出
    [].slice.call(track.querySelectorAll('img')).forEach(function (img) {
      if (!img.complete) img.addEventListener('load', update, { once: true });
    });
    update();
  });
})();
