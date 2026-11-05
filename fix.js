/* =========================================================
   fix.js · 修正补丁（在所有模块之后加载）
   1. 主页去掉冗余的“设置”格
   2. 占卜打开时不再把主页带出来
   3. “镜中影”聊天消息持久化 + 自动补插
   ========================================================= */
(function () {
  'use strict';

  /* ---------- 1. 主页去掉冗余设置格（顶部齿轮已够用） ---------- */
  try {
    document.querySelectorAll('.home-grid [data-action="settings"]').forEach(function (el) {
      el.remove();
    });
  } catch (e) {}

  /* ---------- 2. 占卜打开时，压住主页 ---------- */
  try {
    var home = document.getElementById('homeOverlay');
    var oracle = document.getElementById('oracleDialog');
    if (home && oracle) {
      var hideHome = function () {
        if (oracle.open && home.classList.contains('visible')) {
          home.classList.remove('visible');
        }
      };
      new MutationObserver(hideHome).observe(oracle, {
        attributes: true,
        attributeFilter: ['open']
      });
      hideHome();
    }
  } catch (e) {}

  /* ---------- 3. “镜中影”消息持久化 ---------- */
  (function () {
    var KEY = 'jingyan.paintingChat.v1';
    var list = document.getElementById('chatList');
    if (!list) return;

    function read() {
      try {
        var v = JSON.parse(localStorage.getItem(KEY) || '[]');
        return Array.isArray(v) ? v : [];
      } catch (e) { return []; }
    }
    function write(v) {
      try { localStorage.setItem(KEY, JSON.stringify(v.slice(-50))); } catch (e) {}
    }

    function buildPlaceholder(item) {
      var w = document.createElement('div');
      w.className = 'msg msg-painting msg-painting-restored';
      w.dataset.paintingId = item.id;

      var inf = document.createElement('div');
      inf.className = 'chat-painting-info';

      var eb = document.createElement('p');
      eb.className = 'chat-painting-eyebrow';
      eb.textContent = item.eyebrow || '他递给你一幅图象';

      var t = document.createElement('h4');
      t.className = 'chat-painting-title';
      t.textContent = item.title || '无言';

      var s = document.createElement('p');
      s.className = 'chat-painting-sub';
      s.textContent = (item.sub || '') + ' · 点开看';

      inf.appendChild(eb);
      inf.appendChild(t);
      inf.appendChild(s);
      w.appendChild(inf);

      w.addEventListener('click', function () {
        var b = document.getElementById('paintingNavBtn');
        if (b) b.click();
      });
      return w;
    }

    var scheduled = false;

    function scan() {
      scheduled = false;

      /* 聊天被清空 / 欢迎页出现 → 清掉画作记录，避免“复活” */
      if (list.querySelector('.welcome')) {
        write([]);
        return;
      }
      /* 正在输入时先不动，等它说完 */
      if (list.querySelector('.msg-typing')) return;

      /* 抓取新出现的画作消息 */
      var store = read();
      var changed = false;
      list.querySelectorAll('.msg-painting[data-painting-id]').forEach(function (n) {
        var id = n.dataset.paintingId;
        if (!id) return;
        if (store.some(function (x) { return x.id === id; })) return;

        var titleEl = n.querySelector('.chat-painting-title');
        var subEl = n.querySelector('.chat-painting-sub');
        var ebEl = n.querySelector('.chat-painting-eyebrow');

        store.push({
          id: id,
          title: titleEl ? titleEl.textContent : '无言',
          sub: subEl ? subEl.textContent : '',
          eyebrow: ebEl ? ebEl.textContent : '他递给你一幅图象',
          ts: Date.now()
        });
        changed = true;
      });
      if (changed) write(store);

      /* 补插缺失的 */
      var have = new Set(
        Array.from(list.querySelectorAll('[data-painting-id]'))
          .map(function (n) { return n.dataset.paintingId; })
      );
      var added = false;
      read().forEach(function (item) {
        if (have.has(item.id)) return;
        list.appendChild(buildPlaceholder(item));
        added = true;
      });

      if (added) {
        var sc = document.getElementById('chatScroll');
        if (sc) sc.scrollTop = sc.scrollHeight;
      }
    }

    new MutationObserver(function () {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(scan);
    }).observe(list, { childList: true });

    requestAnimationFrame(scan);

    /* 保存设置 / 清空聊天后，等 DOM 稳定再补一次 */
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t) return;
      if (t.closest && t.closest('#settingsForm [type="submit"], #confirmOk')) {
        setTimeout(function () {
          if (!scheduled) { scheduled = true; requestAnimationFrame(scan); }
        }, 400);
      }
    }, true);
  })();
})();