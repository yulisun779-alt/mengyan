/* =========================================================
   影喵 · v2.1（手机优先交互）
   单击=说话 / 长按=菜单 / 双击=喂食 / 拖动=移动
   ========================================================= */
(function () {
  'use strict';

  const KEYS = {
    state: 'jingyan.pet.v2.state',
    lines: 'jingyan.pet.v2.lines',
    pos:   'jingyan.pet.v2.pos',
    tasks: 'jingyan.pet.v2.tasks',
    hinted: 'jingyan.pet.v2.hinted'
  };

  const DEFAULT_LINES = {
    idle: [
      '（尾巴扫过地面）',
      '镜子里的人今天有点安静。',
      '我在这儿，不用找。',
      '要不要写一张字卡？',
      '他刚才往这边看了一眼。',
      '……你终于看我了。',
      '这个家今天有点凉。',
      '你有没有听见什么声音？'
    ],
    fed: ['好吃。','再来一点。','（眯起眼睛）','你手上有温度。','……谢谢。','比上次的好吃。'],
    hungry: ['有点饿。','……我等你很久了。','（无精打采地趴着）','我可以吃一点点吗。'],
    night: ['夜里凉，早点睡。','镜面在夜里更冷。','（蜷成一团）','月亮藏进云里了。','你还在，那就好。'],
    task: ['{名字}让我把这个交给你——','{名字}吩咐我把这个捎给你。','{名字}说，这个要你亲自看。','（从阴影里叼出一张字条）'],
    done: ['收好了。','他说你会懂。','（把东西放下，退回阴影里）','那我回去复命了。']
  };

  const FOOD = [
    { key: 'fish', label: '小鱼干', icon: '🐟', fx: '♥' },
    { key: 'milk', label: '牛奶',   icon: '🥛', fx: '♡' },
    { key: 'cake', label: '点心',   icon: '🍡', fx: '✦' },
    { key: 'star', label: '星星',   icon: '✨', fx: '✧' }
  ];

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const uid = () => 'pt_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
  const clamp = (v, n) => String(v == null ? '' : v).trim().slice(0, n);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function readJSON(k, f) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch (e) { return f; } }
  function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  function toast(msg) {
    const root = document.getElementById('toastRoot');
    if (!root) { console.log('[pet]', msg); return; }
    const item = document.createElement('div');
    item.className = 'toast';
    item.textContent = msg;
    root.appendChild(item);
    setTimeout(() => { item.classList.add('out'); setTimeout(() => item.remove(), 280); }, 2400);
  }

  function getCharName() {
    const s = readJSON('jingyan.settings.v1', {}) || {};
    return clamp(s.charName, 16) || '梦角';
  }

  function personalize(text) {
    const s = readJSON('jingyan.settings.v1', {}) || {};
    const myName = clamp(s.myName, 16) || '你';
    const charName = clamp(s.charName, 16) || '梦角';
    return String(text).split('{我}').join(myName).split('{名字}').join(charName);
  }

  let state = readJSON(KEYS.state, null) || {
    name: '墨', lastFed: 0, fedCount: 0, size: 100, hidden: false, notifyAt: 0
  };
  let lines = normalizeLines(readJSON(KEYS.lines, null) || DEFAULT_LINES);
  let tasks = normalizeTasks(readJSON(KEYS.tasks, []));

  function normalizeLines(raw) {
    const out = {};
    Object.keys(DEFAULT_LINES).forEach((k) => {
      const v = raw && Array.isArray(raw[k]) ? raw[k].filter((x) => typeof x === 'string' && x.trim()) : [];
      out[k] = v.length ? v : DEFAULT_LINES[k].slice();
    });
    return out;
  }

  function normalizeTasks(raw) {
    if (!Array.isArray(raw)) return [];
    return raw.filter((t) => t && typeof t.text === 'string' && t.text.trim()).map((t) => ({
      id: typeof t.id === 'string' && t.id ? t.id : uid(),
      text: t.text.slice(0, 400),
      from: clamp(t.from, 20) || '梦角',
      createdAt: Number(t.createdAt) || Date.now(),
      notifyAt: Number(t.notifyAt) || Date.now(),
      notified: !!t.notified,
      done: !!t.done,
      doneAt: Number(t.doneAt) || 0
    }));
  }

  function saveState() { writeJSON(KEYS.state, state); applySize(); }
  function saveLines() { writeJSON(KEYS.lines, lines); }
  function saveTasks() { writeJSON(KEYS.tasks, tasks); }
  function savePos() { if (wrap) writeJSON(KEYS.pos, { x: wrap.offsetLeft, y: wrap.offsetTop }); }

  function isHungry() { return Date.now() - (state.lastFed || 0) > 6 * 3600 * 1000; }

  function applySize() {
    if (!wrap) return;
    const base = 104, baseH = 132;
    const ratio = Math.max(0.7, Math.min(1.6, (Number(state.size) || 100) / 100));
    wrap.style.width  = Math.round(base * ratio) + 'px';
    wrap.style.height = Math.round(baseH * ratio) + 'px';
  }

  const PET_SVG = `
<svg viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="petBodyGrad" cx="50%" cy="36%" r="66%">
      <stop offset="0%" stop-color="#291620"/><stop offset="58%" stop-color="#100609"/><stop offset="100%" stop-color="#040103"/>
    </radialGradient>
    <linearGradient id="petEarIn" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#4a1828"/><stop offset="100%" stop-color="#1a0810"/>
    </linearGradient>
    <radialGradient id="petEyeGlowGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(245,215,142,0.75)"/><stop offset="100%" stop-color="rgba(245,215,142,0)"/>
    </radialGradient>
    <radialGradient id="petIrisGrad" cx="42%" cy="38%" r="66%">
      <stop offset="0%" stop-color="#fce8b2"/><stop offset="48%" stop-color="#e0b760"/><stop offset="100%" stop-color="#7a4a10"/>
    </radialGradient>
    <radialGradient id="petGemGrad" cx="40%" cy="34%" r="62%">
      <stop offset="0%" stop-color="#f06c74"/><stop offset="58%" stop-color="#a82030"/><stop offset="100%" stop-color="#4a0812"/>
    </radialGradient>
    <radialGradient id="petAuraGrad" cx="50%" cy="62%" r="56%">
      <stop offset="0%" stop-color="rgba(150,70,80,0.28)"/><stop offset="62%" stop-color="rgba(100,40,50,0.08)"/><stop offset="100%" stop-color="rgba(80,30,40,0)"/>
    </radialGradient>
  </defs>

  <g class="pet-breathe">
    <ellipse cx="60" cy="92" rx="56" ry="60" fill="url(#petAuraGrad)"/>

    <g class="pet-tail">
      <path d="M82 132 Q102 128 106 100 Q110 76 100 58 Q95 48 99 42" fill="none" stroke="#120608" stroke-width="11" stroke-linecap="round"/>
      <path d="M82 132 Q102 128 106 100 Q110 76 100 58 Q95 48 99 42" fill="none" stroke="#2a1420" stroke-width="3.5" stroke-linecap="round" opacity=".55"/>
    </g>

    <g class="pet-torso">
      <path d="M60 78 C32 78 22 96 22 118 C22 138 38 147 60 147 C82 147 98 138 98 118 C98 96 88 78 60 78 Z" fill="url(#petBodyGrad)"/>
      <path d="M40 100 Q44 130 60 142" fill="none" stroke="#2a1420" stroke-width="1.8" opacity=".45"/>
      <ellipse cx="41" cy="142" rx="9.5" ry="6" fill="#050103"/>
      <ellipse cx="79" cy="142" rx="9.5" ry="6" fill="#050103"/>
      <ellipse cx="37.5" cy="140.5" rx="2" ry="1" fill="#2a1820" opacity=".75"/>
      <ellipse cx="75.5" cy="140.5" rx="2" ry="1" fill="#2a1820" opacity=".75"/>
    </g>

    <g class="pet-head">
      <g class="pet-ear-l">
        <path d="M36 48 L25 17 L51 37 Z" fill="#0f0609" stroke="#1a0810" stroke-width="1"/>
        <path d="M38 44 L30 24 L46 37 Z" fill="url(#petEarIn)"/>
        <circle cx="26.5" cy="19.5" r="1.6" fill="#e8c98c" opacity=".7"/>
      </g>
      <g class="pet-ear-r">
        <path d="M84 48 L95 17 L69 37 Z" fill="#0f0609" stroke="#1a0810" stroke-width="1"/>
        <path d="M82 44 L90 24 L74 37 Z" fill="url(#petEarIn)"/>
        <circle cx="93.5" cy="19.5" r="1.6" fill="#e8c98c" opacity=".7"/>
      </g>

      <ellipse cx="60" cy="58" rx="30" ry="26" fill="url(#petBodyGrad)"/>
      <ellipse cx="60" cy="37" rx="18" ry="6" fill="#2a1420" opacity=".3"/>

      <circle cx="46" cy="60" r="14" fill="url(#petEyeGlowGrad)" class="pet-eye-glow"/>
      <circle cx="74" cy="60" r="14" fill="url(#petEyeGlowGrad)" class="pet-eye-glow" style="animation-delay:-1.6s"/>

      <g class="pet-eyes-open">
        <ellipse cx="46" cy="60" rx="7" ry="8.6" fill="#050103"/>
        <ellipse cx="46" cy="60" rx="6.2" ry="7.7" fill="url(#petIrisGrad)"/>
        <ellipse cx="46" cy="60" rx="1.5" ry="6.6" fill="#0a0305"/>
        <ellipse cx="43.4" cy="55.6" rx="1.9" ry="1.5" fill="#fff8e8"/>
        <circle cx="48.6" cy="63.2" r="0.9" fill="#fff8e8" opacity=".7"/>
        <ellipse cx="74" cy="60" rx="7" ry="8.6" fill="#050103"/>
        <ellipse cx="74" cy="60" rx="6.2" ry="7.7" fill="url(#petIrisGrad)"/>
        <ellipse cx="74" cy="60" rx="1.5" ry="6.6" fill="#0a0305"/>
        <ellipse cx="71.4" cy="55.6" rx="1.9" ry="1.5" fill="#fff8e8"/>
        <circle cx="76.6" cy="63.2" r="0.9" fill="#fff8e8" opacity=".7"/>
      </g>

      <g class="pet-eyes-happy">
        <path d="M40 60 Q46 53 52 60" fill="none" stroke="#e0b760" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M68 60 Q74 53 80 60" fill="none" stroke="#e0b760" stroke-width="2.2" stroke-linecap="round"/>
      </g>

      <g class="pet-eyes-closed">
        <path d="M40 60 H52" stroke="#5a3a1a" stroke-width="2" stroke-linecap="round"/>
        <path d="M68 60 H80" stroke="#5a3a1a" stroke-width="2" stroke-linecap="round"/>
      </g>

      <path d="M57 70 L63 70 L60 74 Z" fill="#c98d86"/>
      <path d="M60 74 Q56 78 52 76 M60 74 Q64 78 68 76" fill="none" stroke="#8a5a4a" stroke-width="1.2" stroke-linecap="round" opacity=".65"/>

      <g stroke="#a89a90" stroke-width=".75" opacity=".35" stroke-linecap="round">
        <line x1="40" y1="71.5" x2="26" y2="68.5"/>
        <line x1="40" y1="75"   x2="24" y2="75"/>
        <line x1="80" y1="71.5" x2="94" y2="68.5"/>
        <line x1="80" y1="75"   x2="96" y2="75"/>
      </g>

      <path d="M38 82 Q60 89 82 82" fill="none" stroke="#3a1a1e" stroke-width="3" stroke-linecap="round"/>
      <path d="M38 82 Q60 89 82 82" fill="none" stroke="#5a2a2e" stroke-width=".8" stroke-linecap="round" opacity=".8"/>

      <g transform="translate(60 87)">
        <path d="M0 -6 L5 0 L0 6 L-5 0 Z" fill="url(#petGemGrad)"/>
        <path d="M0 -6 L5 0 L0 6 L-5 0 Z" fill="none" stroke="#f06c74" stroke-width=".5" opacity=".7"/>
        <circle cx="-1.4" cy="-1.4" r="1" fill="#fff5ec" opacity=".9"/>
      </g>
    </g>
  </g>
</svg>`;

  let wrap = null;
  let bodyEl = null;
  let bubbleEl = null;
  let bubbleTextEl = null;
  let bubbleActionsEl = null;
  let menuEl = null;
  let fxEl = null;

  let bubbleTimer = null;
  let stateTimer = null;
  let longPressTimer = null;
  let drag = null;
  let moved = false;
  let longPressFired = false;
  let currentTaskNotifiedId = null;

  function buildPet() {
    const stale = document.getElementById('petWidget');
    if (stale) { try { stale.remove(); } catch (e) {} }

    wrap = document.createElement('div');
    wrap.className = 'pet-widget';
    wrap.id = 'petWidget';
    if (state.hidden) wrap.hidden = true;

    wrap.innerHTML = `
      <button type="button" class="pet-body" id="petBody" aria-label="影喵">
        ${PET_SVG}
      </button>
      <div class="pet-motes" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
      <div class="pet-fx" id="petFx" aria-hidden="true"></div>
      <div class="pet-bubble" id="petBubble" hidden>
        <p class="pet-bubble-text" id="petBubbleText"></p>
        <div class="pet-bubble-actions" id="petBubbleActions" hidden></div>
      </div>
      <div class="pet-menu" id="petMenu" hidden>
        <button type="button" data-act="feed">喂食</button>
        <button type="button" data-act="talk">说一句话</button>
        <button type="button" data-act="assign">派个活</button>
        <button type="button" data-act="settings">设置</button>
        <div class="pet-menu-sep"></div>
        <button type="button" data-act="hide" class="danger">让它歇一会儿</button>
      </div>
    `;
    document.body.appendChild(wrap);

    bodyEl = $('#petBody', wrap);
    bubbleEl = $('#petBubble', wrap);
    bubbleTextEl = $('#petBubbleText', wrap);
    bubbleActionsEl = $('#petBubbleActions', wrap);
    menuEl = $('#petMenu', wrap);
    fxEl = $('#petFx', wrap);

    const pos = readJSON(KEYS.pos, null);
    if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
      wrap.style.left = Math.max(0, Math.min(window.innerWidth - 60, pos.x)) + 'px';
      wrap.style.top  = Math.max(0, Math.min(window.innerHeight - 60, pos.y)) + 'px';
    }

    applySize();
    refreshHungry();

    bindPetEvents();
    scheduleIdleState();
    setTimeout(greetOnAppear, 4800);
    setInterval(refreshHungry, 60000);
    setInterval(pollTasks, 12000);
    setTimeout(pollTasks, 2000);
  }

  function refreshHungry() {
    if (!wrap) return;
    const hungry = isHungry();
    wrap.classList.toggle('pet-hungry', hungry);
    if (hungry && Math.random() < 0.2 && !drag) {
      wrap.classList.remove('pet-sleep');
      wrap.classList.add('pet-lie');
      bodyEl.classList.add('asleep');
      bodyEl.classList.remove('happy');
    }
  }

  function scheduleIdleState() {
    clearTimeout(stateTimer);
    const wait = 12000 + Math.random() * 22000;
    stateTimer = setTimeout(() => {
      if (drag) { scheduleIdleState(); return; }
      if (bubbleEl && !bubbleEl.hidden) { scheduleIdleState(); return; }
      if (menuEl && !menuEl.hidden) { scheduleIdleState(); return; }

      wrap.classList.remove('pet-lie', 'pet-sleep', 'pet-stretch', 'pet-wash',
                            'pet-flick', 'pet-twitch', 'pet-butt');
      bodyEl.classList.remove('asleep', 'happy');

      const r = Math.random();
      if (r < 0.16) {
        wrap.classList.add('pet-stretch');
        setTimeout(() => wrap.classList.remove('pet-stretch'), 2600);
      } else if (r < 0.30) {
        wrap.classList.add('pet-wash');
        setTimeout(() => wrap.classList.remove('pet-wash'), 2800);
      } else if (r < 0.42) {
        wrap.classList.add('pet-flick');
        setTimeout(() => wrap.classList.remove('pet-flick'), 1200);
      } else if (r < 0.52) {
        wrap.classList.add('pet-twitch');
        setTimeout(() => wrap.classList.remove('pet-twitch'), 1000);
      } else if (r < 0.62) {
        wrap.classList.add('pet-butt');
        setTimeout(() => wrap.classList.remove('pet-butt'), 1400);
      } else if (r < 0.78) {
        wrap.classList.add('pet-lie');
      } else {
        wrap.classList.add('pet-sleep');
        bodyEl.classList.add('asleep');
      }
      scheduleIdleState();
    }, wait);
  }

  function fxRise(symbol, big) {
    if (!fxEl) return;
    const el = document.createElement('span');
    el.className = 'pet-fx-item' + (big ? ' pet-fx-big' : '');
    el.textContent = symbol;
    el.style.left = (28 + Math.random() * 32) + '%';
    fxEl.appendChild(el);
    setTimeout(() => el.remove(), 1700);
  }

  function wiggle() {
    bodyEl.classList.add('wiggle');
    setTimeout(() => bodyEl.classList.remove('wiggle'), 600);
  }

  function happyFor(ms) {
    bodyEl.classList.add('happy');
    setTimeout(() => bodyEl.classList.remove('happy'), ms || 2200);
  }

  function say(text, actions) {
    if (!bubbleEl) return;
    bubbleTextEl.textContent = personalize(text);
    bubbleActionsEl.innerHTML = '';
    bubbleActionsEl.hidden = true;

    if (actions && actions.length) {
      actions.forEach((a) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = a.label;
        if (a.primary) b.className = 'primary';
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          hideBubble();
          if (typeof a.onClick === 'function') a.onClick();
        });
        bubbleActionsEl.appendChild(b);
      });
      bubbleActionsEl.hidden = false;
    }

    bubbleEl.hidden = false;
    wrap.classList.remove('pet-flip');
    if (wrap.getBoundingClientRect().top < 180) wrap.classList.add('pet-flip');

    clearTimeout(bubbleTimer);
    const ttl = actions && actions.length ? 9000 : 6000;
    bubbleTimer = setTimeout(hideBubble, ttl);
  }

  function hideBubble() {
    clearTimeout(bubbleTimer);
    if (bubbleEl) bubbleEl.hidden = true;
    currentTaskNotifiedId = null;
  }

  function feed(foodKey) {
    const food = FOOD.find((f) => f.key === foodKey) || pick(FOOD);
    state.lastFed = Date.now();
    state.fedCount = (state.fedCount || 0) + 1;
    saveState();
    refreshHungry();

    wrap.classList.remove('pet-sleep', 'pet-lie');
    bodyEl.classList.remove('asleep');
    happyFor(2200);
    wiggle();
    fxRise(food.icon, true);
    setTimeout(() => fxRise(food.fx, false), 260);
    say(pick(lines.fed), [
      { label: '再来一点', onClick: () => openFoodPanel() },
      { label: '好', onClick: hideBubble }
    ]);
  }

  function openFoodPanel() {
    say('想吃什么？', FOOD.map((f) => ({
      label: f.icon + ' ' + f.label,
      onClick: () => feed(f.key)
    })).concat([{ label: '都不用', onClick: hideBubble }]));
  }

  function pollTasks() {
    const now = Date.now();
    const pending = tasks.find((t) => !t.done && !t.notified && t.notifyAt <= now);
    if (!pending) return;
    if (!bubbleEl || !bubbleEl.hidden) return;
    if (document.hidden) return;
    if (document.body.dataset.callActive === '1') return;
    if (document.querySelector('dialog[open]')) return;
    notifyTask(pending);
  }

  function notifyTask(task) {
    if (currentTaskNotifiedId === task.id) return;
    currentTaskNotifiedId = task.id;
    task.notified = true;
    saveTasks();

    wrap.classList.remove('pet-sleep', 'pet-lie');
    bodyEl.classList.remove('asleep');
    wiggle();

    const head = personalize(pick(lines.task)).replace('{名字}', task.from);
    const full = head + '\n\n' + task.text;

    say(full, [
      { label: '我收到了', primary: true, onClick: () => completeTask(task.id) },
      { label: '等一会儿', onClick: hideBubble }
    ]);
  }

  function completeTask(id) {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    t.done = true;
    t.doneAt = Date.now();
    saveTasks();
    happyFor(2600);
    fxRise('✦', true);
    say(pick(lines.done), [{ label: '好', onClick: hideBubble }]);
    toast('影喵完成了一件活');
  }

  function addTask(text, opts) {
    opts = opts || {};
    const t = {
      id: uid(),
      text: clamp(text, 400),
      from: clamp(opts.from, 20) || getCharName(),
      createdAt: Date.now(),
      notifyAt: Date.now() + (Number(opts.delay) || (25 + Math.random() * 55) * 1000),
      notified: false, done: false, doneAt: 0
    };
    if (!t.text) return null;
    tasks.unshift(t);
    saveTasks();
    return t;
  }

  function onExternalTask(ev) {
    const d = ev && ev.detail ? ev.detail : {};
    const text = clamp(d.text, 400);
    if (!text) return;
    const t = addTask(text, { from: d.from, delay: d.delay });
    if (t) toast('影喵接了一件活');
  }
  document.addEventListener('jingyan:petTask', onExternalTask);

  /* ============================================================
     交互：单击=说话 / 长按=菜单 / 双击=喂食 / 拖动=移动
     ============================================================ */
  function bindPetEvents() {
    bodyEl.addEventListener('pointerdown', onPointerDown);
    bodyEl.addEventListener('pointermove', onPointerMove);
    bodyEl.addEventListener('pointerup',   onPointerUp);
    bodyEl.addEventListener('pointercancel', onPointerUp);

    /* 双击喂食（桌面/手机都能用，但不是主要入口） */
    bodyEl.addEventListener('dblclick', (e) => {
      e.preventDefault();
      if (longPressFired) return;
      if (menuEl && !menuEl.hidden) return;
      feed();
    });

    /* 桌面右键（手机不触发，保留无害） */
    bodyEl.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      openMenu();
    });

    menuEl.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-act]');
      if (!btn) return;
      const act = btn.getAttribute('data-act');
      closeMenu();
      if (act === 'feed')     openFoodPanel();
      if (act === 'talk')     onPetTap();
      if (act === 'assign')   openAssignDialog();
      if (act === 'settings') openSettingsDialog();
      if (act === 'hide')     setHidden(true);
    });

    /* 点空白关菜单（捕获阶段，避免被其他按钮吞掉） */
    document.addEventListener('pointerdown', (e) => {
      if (menuEl.hidden) return;
      if (menuEl.contains(e.target)) return;
      if (bodyEl.contains(e.target)) return;
      closeMenu();
    }, true);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { hideBubble(); closeMenu(); }
    });
  }

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    drag = {
      id: e.pointerId,
      sx: e.clientX, sy: e.clientY,
      ox: wrap.offsetLeft, oy: wrap.offsetTop
    };
    moved = false;
    longPressFired = false;
    wrap.classList.add('dragging');
    closeMenu();
    try { bodyEl.setPointerCapture(e.pointerId); } catch (err) {}

    /* 长按计时器：500ms 内不移动就开菜单 */
    clearTimeout(longPressTimer);
    longPressTimer = setTimeout(() => {
      if (!drag || moved) return;
      longPressFired = true;
      try { navigator.vibrate && navigator.vibrate(28); } catch (err) {}
      openMenu();
    }, 500);
  }

  function onPointerMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.sx;
    const dy = e.clientY - drag.sy;

    /* 只有超过阈值才算“移动”——同时取消长按 */
    if (!moved && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      moved = true;
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    if (!moved) return;

    /* 长按已经打开菜单了就不再拖 */
    if (longPressFired) return;

    const x = Math.max(0, Math.min(window.innerWidth - wrap.offsetWidth, drag.ox + dx));
    const y = Math.max(0, Math.min(window.innerHeight - wrap.offsetHeight, drag.oy + dy));
    wrap.style.left = x + 'px';
    wrap.style.top  = y + 'px';
  }

  function onPointerUp(e) {
    clearTimeout(longPressTimer);
    longPressTimer = null;

    if (!drag) return;
    if (e && e.pointerId !== undefined && e.pointerId !== drag.id) return;

    wrap.classList.remove('dragging');
    try { bodyEl.releasePointerCapture(drag.id); } catch (err) {}

    const wasLongPress = longPressFired;
    const wasMoved = moved;

    if (wasMoved) {
      savePos();
    } else if (!wasLongPress) {
      /* 没移动、没长按 → 一次干净的单击 */
      onPetTap();
    }
    /* 长按已经开过菜单，抬起时不再触发单击 */

    drag = null;
    moved = false;
    longPressFired = false;
  }

  function onPetTap() {
    if (menuEl && !menuEl.hidden) { closeMenu(); return; }
    if (!bubbleEl.hidden) { hideBubble(); return; }

    const pending = tasks.find((t) => !t.done && t.notified);
    if (pending) {
      currentTaskNotifiedId = pending.id;
      const head = personalize(pick(lines.task));
      say(head + '\n\n' + pending.text, [
        { label: '我收到了', primary: true, onClick: () => completeTask(pending.id) },
        { label: '等一会儿', onClick: hideBubble }
      ]);
      return;
    }

    const hungry = isHungry();
    const h = new Date().getHours();
    const isNight = h >= 22 || h < 5;

    let pool;
    if (hungry) pool = lines.hungry;
    else if (isNight) pool = lines.night.concat(lines.idle);
    else pool = lines.idle;

    say(pick(pool), [
      { label: '喂它', onClick: openFoodPanel },
      { label: '更多', onClick: () => { hideBubble(); setTimeout(openMenu, 60); } }
    ]);
  }

  function greetOnAppear() {
    if (!wrap || wrap.hidden) return;

    /* 首次出现给一句“长按”提示 */
    const hinted = localStorage.getItem(KEYS.hinted) === '1';
    if (!hinted) {
      try { localStorage.setItem(KEYS.hinted, '1'); } catch (e) {}
      say('（从镜面边缘探出头）\n长按我，可以喂食或派活。', [
        { label: '知道了', onClick: hideBubble }
      ]);
      return;
    }

    if (isHungry()) {
      say('……我等你很久了。', [{ label: '喂它', onClick: openFoodPanel }]);
    } else {
      const pool = ['（从镜面边缘探出头）', '你回来了。', '（尾巴轻轻扫了扫）'];
      say(pick(pool));
    }
  }

  function setHidden(h) {
    state.hidden = !!h;
    saveState();
    if (wrap) wrap.hidden = !!h;
    toast(h ? '影喵躲回镜子里了' : '影喵回来了');
  }

  function openMenu() {
    if (!menuEl || !wrap) return;
    hideBubble();
    menuEl.hidden = false;

    /* 上下翻 */
    wrap.classList.remove('pet-flip');
    if (wrap.getBoundingClientRect().top < 220) wrap.classList.add('pet-flip');

    /* 左右边界修正 */
    menuEl.style.left = '50%';
    menuEl.style.transform = 'translateX(-50%)';
    requestAnimationFrame(() => {
      const mr = menuEl.getBoundingClientRect();
      const pad = 8;
      if (mr.left < pad) {
        menuEl.style.left = (pad - wrap.getBoundingClientRect().left) + 'px';
        menuEl.style.transform = 'none';
      } else if (mr.right > window.innerWidth - pad) {
        menuEl.style.left = 'auto';
        menuEl.style.right = (pad + wrap.getBoundingClientRect().left + wrap.offsetWidth - window.innerWidth) + 'px';
        menuEl.style.transform = 'none';
      }
    });
  }

  function closeMenu() {
    if (menuEl) {
      menuEl.hidden = true;
      menuEl.style.left = '';
      menuEl.style.right = '';
      menuEl.style.transform = '';
    }
  }

  /* ============================================================
     派活弹窗
     ============================================================ */
  function openAssignDialog() {
    let dlg = document.getElementById('petAssignDialog');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.className = 'modal modal-sm';
      dlg.id = 'petAssignDialog';
      dlg.innerHTML = `
        <form class="modal-card" method="dialog" novalidate>
          <header class="modal-head">
            <div><p class="eyebrow">ASSIGN</p><h3>派一个活</h3></div>
            <button type="button" class="modal-x" data-close aria-label="关闭">✕</button>
          </header>
          <div class="modal-body">
            <p class="field-help">影喵会在一会儿之后，把这件事叼给你。<br/>通常这是梦角的吩咐，不过你也可以自己写。</p>
            <div class="field">
              <label for="petAssignText">要它送来的话 / 东西</label>
              <textarea class="input textarea" id="petAssignText" maxlength="400" rows="3" placeholder="比如：他让你今晚别熬太晚。"></textarea>
            </div>
            <div class="field-row">
              <div class="field">
                <label for="petAssignFrom">谁派的</label>
                <input class="input" id="petAssignFrom" maxlength="20" placeholder="沈砚" />
              </div>
              <div class="field">
                <label for="petAssignDelay">多久后送来</label>
                <select class="input" id="petAssignDelay">
                  <option value="10">10 秒后</option>
                  <option value="60">1 分钟后</option>
                  <option value="300">5 分钟后</option>
                  <option value="1800">30 分钟后</option>
                </select>
              </div>
            </div>
          </div>
          <footer class="modal-foot">
            <button type="button" class="btn" data-close>取消</button>
            <button type="submit" class="btn primary">交给它</button>
          </footer>
        </form>
      `;
      document.body.appendChild(dlg);
      dlg.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => dlg.close()));
      dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
      dlg.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        const text = clamp(dlg.querySelector('#petAssignText').value, 400);
        const from = clamp(dlg.querySelector('#petAssignFrom').value, 20) || getCharName();
        const delaySec = Number(dlg.querySelector('#petAssignDelay').value) || 30;
        if (!text) { dlg.querySelector('#petAssignText').focus(); return; }
        addTask(text, { from, delay: delaySec * 1000 });
        dlg.close();
        toast('影喵接了一件活');
        say('交给我吧。', [{ label: '好', onClick: hideBubble }]);
      });
    }
    dlg.querySelector('#petAssignText').value = '';
    dlg.querySelector('#petAssignFrom').value = getCharName();
    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); }
    else dlg.setAttribute('open', '');
  }

  /* ============================================================
     设置弹窗
     ============================================================ */
  let currentLinesTab = 'idle';

  function openSettingsDialog() {
    let dlg = document.getElementById('petSettingsDialog');
    if (!dlg) {
      dlg = document.createElement('dialog');
      dlg.className = 'modal';
      dlg.id = 'petSettingsDialog';
      dlg.innerHTML = `
        <form class="modal-card" novalidate>
          <header class="modal-head">
            <div><p class="eyebrow">SHADOW CAT</p><h3>影喵</h3></div>
            <button type="button" class="modal-x" data-close aria-label="关闭">✕</button>
          </header>
          <div class="modal-body">
            <div class="field">
              <label for="petNameInput">它叫什么</label>
              <input class="input" id="petNameInput" maxlength="12" placeholder="墨" />
              <p class="field-help">取一个你喜欢的名字，它会记得。</p>
            </div>
            <div class="field">
              <label>大小</label>
              <div class="pet-size-row">
                <input type="range" id="petSizeRange" min="70" max="160" step="2" />
                <span class="pet-size-value" id="petSizeValue">100%</span>
              </div>
            </div>
            <div class="field">
              <label>它会说的话</label>
              <p class="field-help">每行一句。同一分组内随机抽一句。<br/>可用占位符：<code>{我}</code>、<code>{名字}</code>。</p>
              <div class="pet-lines-tabs" id="petLinesTabs">
                <button type="button" data-tab="idle">空闲</button>
                <button type="button" data-tab="fed">喂食</button>
                <button type="button" data-tab="hungry">饿了</button>
                <button type="button" data-tab="night">夜间</button>
                <button type="button" data-tab="task">交差前</button>
                <button type="button" data-tab="done">交差后</button>
              </div>
              <textarea class="input textarea pet-lines-editor" id="petLinesEditor" rows="7"></textarea>
            </div>
            <div class="field">
              <label>待办的活</label>
              <p class="field-help">梦角吩咐它的，或你自己给它派的。<br/>到时间它会主动叼给你。</p>
              <div class="pet-task-list" id="petTaskList"></div>
              <div class="pet-add-task-row">
                <input class="input" id="petQuickTaskInput" maxlength="120" placeholder="写一句话，让它给你送来…" />
                <button type="button" class="btn small" id="petQuickTaskBtn">派给它</button>
              </div>
            </div>
            <div class="data-actions" style="padding-top:10px;border-top:1px dashed var(--line)">
              <button type="button" class="btn small" id="petResetPos">重置位置</button>
              <button type="button" class="btn small" id="petHideBtn">让它歇一会儿</button>
            </div>
          </div>
          <footer class="modal-foot">
            <button type="button" class="btn" data-close>取消</button>
            <button type="submit" class="btn primary">保存</button>
          </footer>
        </form>
      `;
      document.body.appendChild(dlg);

      dlg.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => dlg.close()));
      dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

      dlg.querySelectorAll('#petLinesTabs button').forEach((btn) => {
        btn.addEventListener('click', () => {
          flushLinesEditor();
          currentLinesTab = btn.getAttribute('data-tab');
          renderLinesTabs();
          renderLinesEditor();
        });
      });

      const sizeRange = dlg.querySelector('#petSizeRange');
      const sizeVal = dlg.querySelector('#petSizeValue');
      sizeRange.addEventListener('input', () => {
        const v = Number(sizeRange.value) || 100;
        sizeVal.textContent = v + '%';
        state.size = v;
        applySize();
      });

      const quickInput = dlg.querySelector('#petQuickTaskInput');
      const quickBtn = dlg.querySelector('#petQuickTaskBtn');
      const tryQuick = () => {
        const v = clamp(quickInput.value, 120);
        if (!v) { quickInput.focus(); return; }
        addTask(v, { from: getCharName(), delay: (25 + Math.random() * 55) * 1000 });
        quickInput.value = '';
        renderTaskList();
        toast('已派给它');
      };
      quickBtn.addEventListener('click', tryQuick);
      quickInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); tryQuick(); }
      });

      dlg.querySelector('#petResetPos').addEventListener('click', () => {
        wrap.style.left = '6%';
        wrap.style.top = '60%';
        savePos();
        toast('位置已重置');
      });

      dlg.querySelector('#petHideBtn').addEventListener('click', () => {
        setHidden(true);
        dlg.close();
      });

      dlg.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        flushLinesEditor();
        state.name = clamp(dlg.querySelector('#petNameInput').value, 12) || '墨';
        state.size = Number(sizeRange.value) || 100;
        saveState();
        saveLines();
        dlg.close();
        toast('影喵记住了');
        say('（歪了歪头）', [{ label: '好', onClick: hideBubble }]);
      });
    }

    dlg.querySelector('#petNameInput').value = state.name || '墨';
    const sizeRange = dlg.querySelector('#petSizeRange');
    sizeRange.value = state.size || 100;
    dlg.querySelector('#petSizeValue').textContent = (state.size || 100) + '%';

    currentLinesTab = 'idle';
    renderLinesTabs();
    renderLinesEditor();
    renderTaskList();

    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); }
    else dlg.setAttribute('open', '');
  }

  function renderLinesTabs() {
    document.querySelectorAll('#petLinesTabs button').forEach((b) =>
      b.classList.toggle('active', b.getAttribute('data-tab') === currentLinesTab));
  }

  function renderLinesEditor() {
    const editor = document.querySelector('#petLinesEditor');
    if (!editor) return;
    editor.value = (lines[currentLinesTab] || []).join('\n');
  }

  function flushLinesEditor() {
    const editor = document.querySelector('#petLinesEditor');
    if (!editor) return;
    const arr = String(editor.value || '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
    lines[currentLinesTab] = arr.length ? arr.slice(0, 40) : DEFAULT_LINES[currentLinesTab].slice();
  }

  function renderTaskList() {
    const list = document.querySelector('#petTaskList');
    if (!list) return;
    list.innerHTML = '';

    const visible = tasks.filter((t) => !t.done);
    if (!visible.length) {
      const empty = document.createElement('div');
      empty.className = 'pet-task-empty';
      empty.textContent = '目前没有待办的活。';
      list.appendChild(empty);
      return;
    }

    visible.forEach((t) => {
      const row = document.createElement('div');
      row.className = 'pet-task-row';

      const body = document.createElement('div');
      body.className = 'pet-task-body';
      const txt = document.createElement('div');
      txt.textContent = t.text;
      const meta = document.createElement('div');
      meta.className = 'pet-task-meta';
      const dueIn = Math.max(0, Math.round((t.notifyAt - Date.now()) / 1000));
      meta.textContent = '来自 ' + t.from + (dueIn > 0 ? ' · 约 ' + dueIn + ' 秒后' : ' · 即将送来');
      body.appendChild(txt);
      body.appendChild(meta);

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'pet-task-del';
      del.textContent = '✕';
      del.addEventListener('click', () => {
        tasks = tasks.filter((x) => x.id !== t.id);
        saveTasks();
        renderTaskList();
      });

      row.appendChild(body);
      row.appendChild(del);
      list.appendChild(row);
    });
  }

  function installEntry() {
    const actions = document.querySelector('.chat-actions');
    if (!actions || document.getElementById('petEntryBtn')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'icon-btn';
    btn.id = 'petEntryBtn';
    btn.title = '影喵';
    btn.setAttribute('aria-label', '影喵');
    btn.textContent = '🐾';
    btn.addEventListener('click', () => {
      if (state.hidden) { setHidden(false); return; }
      onPetTap();
    });
    actions.insertBefore(btn, actions.firstChild);
  }

  function init() {
    buildPet();
    installEntry();
    if (!state.lastFed) { state.lastFed = Date.now(); saveState(); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();