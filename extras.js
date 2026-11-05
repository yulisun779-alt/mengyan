/* =========================================================
   extras.js · 观察镜面（影猫已交给 pet.js 单独负责）
   依赖：styles.css 里已有的 .obs-* 样式
   ========================================================= */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const clamp = (v, n) => String(v == null ? '' : v).trim().slice(0, n);

  function readJSON(k, f) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch (e) { return f; } }
  function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function personalize(text) {
    var s = readJSON('jingyan.settings.v1', {}) || {};
    var my = clamp(s.myName, 16) || '你';
    var ch = clamp(s.charName, 16) || '梦角';
    return String(text).split('{我}').join(my).split('{名字}').join(ch);
  }
  function toast(msg) {
    var root = document.getElementById('toastRoot');
    if (!root) { console.log('[extras]', msg); return; }
    var item = document.createElement('div');
    item.className = 'toast';
    item.textContent = msg;
    root.appendChild(item);
    setTimeout(function () {
      item.classList.add('out');
      setTimeout(function () { item.remove(); }, 280);
    }, 2400);
  }

  /* =========================================================
     观察镜面
     ========================================================= */
  var OBS_KEY = 'jingyan.observe.v1';

  var OBS_DEFAULT = [
    '他就在那里，侧脸贴着光，不知在看镜子里的你，还是看比你更远的哪里。',
    '你看见他抬手，像要碰一下镜面，指尖停在离玻璃一寸的地方，又收了回去。',
    '镜面浮起一层薄雾，人影的轮廓忽远忽近，看不太真切。',
    '他抱着膝盖坐在镜底的暗处，下巴搁在臂弯里，正望向你这一侧。',
    '他的手指在玻璃内侧慢慢划着，像在写字，又像在圈掉一句不想让你看到的话。',
    '夜里的镜面更凉。人影坐在暗处一动不动，只有一双眼睛还醒着。',
    '镜中的人影背对着你，肩线压得很低，似乎很沮丧。今天先别追问。',
    '他把额头抵在镜面内侧，罩下一小片阴影，很久没有动。',
    '镜面像在轻轻震颤，人影的轮廓抖得厉害，好像有什么要漫出来。',
    '他趴在镜面上死死盯着你。嗯——是高兴的那种盯法。'
  ];

  function loadObsLines() {
    var raw = readJSON(OBS_KEY, null);
    if (raw && Array.isArray(raw.lines) && raw.lines.length) {
      return raw.lines.filter(function (x) { return typeof x === 'string' && x.trim(); });
    }
    return OBS_DEFAULT.slice();
  }
  function saveObsLines(lines) {
    writeJSON(OBS_KEY, { lines: lines.slice(0, 60) });
  }

  function buildObsDialog() {
    if (document.getElementById('obsDialog')) return;

    var d = document.createElement('dialog');
    d.className = 'modal';
    d.id = 'obsDialog';
    d.innerHTML = '' +
      '<div class="modal-card">' +
        '<header class="modal-head">' +
          '<div><p class="eyebrow">OBSERVE</p><h3>观察镜面</h3></div>' +
          '<button type="button" class="modal-x" data-close aria-label="关闭">✕</button>' +
        '</header>' +
        '<div class="modal-body">' +
          '<div class="obs-glass" id="obsGlass">' +
            '<svg class="obs-sil" viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
              '<defs>' +
                '<radialGradient id="obsSilG" cx="50%" cy="40%" r="60%">' +
                  '<stop offset="0%" stop-color="rgba(150,70,70,.5)"/>' +
                  '<stop offset="70%" stop-color="rgba(80,30,34,.2)"/>' +
                  '<stop offset="100%" stop-color="rgba(40,14,18,0)"/>' +
                '</radialGradient>' +
              '</defs>' +
              '<ellipse cx="50" cy="80" rx="44" ry="66" fill="url(#obsSilG)"/>' +
              '<path d="M50 26c-14 0-23 12-23 27 0 11 6 18 10 24 3 4 1 7-4 10-16 7-27 21-30 40-2 16 4 26 12 28h70c8-2 14-12 12-28-3-19-14-33-30-40-5-3-7-6-4-10 4-6 10-13 10-24 0-15-9-27-23-27Z" fill="#0a0508"/>' +
              '<ellipse cx="50" cy="52" rx="14" ry="17" fill="#040103"/>' +
            '</svg>' +
            '<span class="obs-glow"></span>' +
          '</div>' +
          '<p class="obs-sight" id="obsSight"></p>' +
          '<p class="obs-note" id="obsNote"></p>' +
          '<div class="obs-actions">' +
            '<button type="button" class="btn primary" id="obsLookBtn">看一眼</button>' +
          '</div>' +
          '<details class="obs-editor">' +
            '<summary>编辑你看到的画面</summary>' +
            '<p class="field-help">一行一句。用「看一眼」时随机抽一句，并以打字机效果显示。</p>' +
            '<textarea class="input textarea" id="obsEditor" rows="7"></textarea>' +
            '<div class="obs-editor-actions">' +
              '<button type="button" class="btn" id="obsResetBtn">恢复默认</button>' +
              '<button type="button" class="btn primary" id="obsSaveBtn">保存</button>' +
            '</div>' +
          '</details>' +
        '</div>' +
      '</div>';
    document.body.appendChild(d);

    d.querySelectorAll('[data-close]').forEach(function (b) {
      b.addEventListener('click', function () { d.close(); });
    });
    d.addEventListener('click', function (e) {
      if (e.target === d) d.close();
    });

    var glass = d.querySelector('#obsGlass');
    var sight = d.querySelector('#obsSight');
    var note = d.querySelector('#obsNote');
    var editor = d.querySelector('#obsEditor');
    var lookBtn = d.querySelector('#obsLookBtn');

    var typingTimer = null;
    var typingToken = 0;

    function stopTyping() {
      typingToken++;
      clearInterval(typingTimer);
      typingTimer = null;
    }

    function typeOut(text) {
      stopTyping();
      var token = typingToken;
      sight.textContent = '';
      var i = 0;
      typingTimer = setInterval(function () {
        if (token !== typingToken) { clearInterval(typingTimer); return; }
        i++;
        sight.textContent = text.slice(0, i);
        if (i >= text.length) {
          clearInterval(typingTimer);
          typingTimer = null;
        }
      }, 34);
    }

    function look() {
      glass.classList.remove('obs-empty', 'obs-revealing', 'obs-mood-good', 'obs-mood-low', 'obs-mood-extreme', 'obs-extreme');
      void glass.offsetWidth;

      var b = readJSON('jingyan.board.v1', null);
      var cls = b && b.mood ? b.mood.cls : '';
      if (cls === 'mood-good') glass.classList.add('obs-mood-good');
      else if (cls === 'mood-low') glass.classList.add('obs-mood-low');
      else if (cls === 'mood-extreme') glass.classList.add('obs-mood-extreme', 'obs-extreme');

      if (Math.random() < 0.17) {
        glass.classList.add('obs-empty', 'obs-revealing');
        setTimeout(function () { glass.classList.remove('obs-revealing'); }, 1000);
        typeOut('你努力看了，但是什么都看不到。');
        note.textContent = '镜面今天很安静。';
        return;
      }

      var lines = loadObsLines();
      var line = lines[Math.floor(Math.random() * lines.length)];
      glass.classList.add('obs-revealing');
      setTimeout(function () { glass.classList.remove('obs-revealing'); }, 1000);

      typeOut(personalize(line));

      var h = new Date().getHours();
      var night = (h >= 22 || h < 5) ? '夜里的镜面更凉。' : '';
      var moodLine = cls === 'mood-good' ? ' 镜面轻轻泛着暖意。'
        : cls === 'mood-low' ? ' 镜面稍微有点凉。'
        : cls === 'mood-extreme' ? ' 镜面在微微发颤。' : '';
      note.textContent = night + moodLine;
    }

    lookBtn.addEventListener('click', look);

    d.querySelector('#obsSaveBtn').addEventListener('click', function () {
      var lines = String(editor.value || '')
        .split(/\r?\n/)
        .map(function (x) { return x.trim(); })
        .filter(Boolean)
        .slice(0, 60);
      if (!lines.length) { toast('至少留一句'); return; }
      saveObsLines(lines);
      toast('已保存，共 ' + lines.length + ' 句');
    });

    d.querySelector('#obsResetBtn').addEventListener('click', function () {
      saveObsLines(OBS_DEFAULT.slice());
      editor.value = OBS_DEFAULT.join('\n');
      toast('已恢复默认');
    });

    d.addEventListener('close', function () {
      stopTyping();
    });

    return d;
  }

  function openObserve() {
    var d = document.getElementById('obsDialog') || buildObsDialog();
    if (!d) return;
    var editor = d.querySelector('#obsEditor');
    if (editor) editor.value = loadObsLines().join('\n');
    var sight = d.querySelector('#obsSight');
    if (sight) sight.textContent = '';
    var note = d.querySelector('#obsNote');
    if (note) note.textContent = '按「看一眼」，凑近镜面。';
    var glass = d.querySelector('#obsGlass');
    if (glass) glass.classList.remove('obs-empty', 'obs-revealing', 'obs-mood-good', 'obs-mood-low', 'obs-mood-extreme', 'obs-extreme');

    if (typeof d.showModal === 'function') {
      if (!d.open) d.showModal();
    } else {
      d.setAttribute('open', '');
    }
    setTimeout(function () {
      var b = d.querySelector('#obsLookBtn');
      if (b) b.click();
    }, 260);
  }

  function installObserveEntry() {
    var actions = document.querySelector('.chat-actions');
    if (!actions || document.getElementById('obsOpenBtn')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'icon-btn obs-open-btn';
    btn.id = 'obsOpenBtn';
    btn.title = '观察镜面';
    btn.setAttribute('aria-label', '观察镜面');
    btn.textContent = '◉';
    btn.addEventListener('click', openObserve);

    actions.insertBefore(btn, actions.firstChild);
  }

  function init() {
    try { installObserveEntry(); } catch (e) { console.warn('[extras] 观察入口失败', e); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();