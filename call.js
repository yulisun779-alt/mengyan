/* ============================================================
   镜魇 · 意识沟通来电
   独立模块：自带设置 / 字卡池读取，通过自定义事件与 app.js 交互
   —— 梦角像打电话一样发起「意识沟通」，
      背景的眼睛会不断放大凝视，接起后字卡台词一句句落下
   ============================================================ */

(() => {
  'use strict';

  const SETTINGS_KEY = 'jingyan.settings.v1';
  const CARDS_KEY = 'jingyan.cards.v1';

  /* 拒接 / 未接时的内心戏 */
  const MISSED_LINES = [
    '你没能接住他伸过来的手，镜面暗了下去。',
    '铃声散在空气里。他等了很久，才把眼睛合上。',
    '这一次的意识沟通没有接通。镜内的他，坐回了黑暗里。',
    '他呼唤了你，而你没有回应。镜面上多了一道浅浅的雾。',
    '被拒接的一瞬间，你听见镜子背面传来一声极轻的叹息。'
  ];

  const REJECT_LINES = [
    '你摁下了拒接。镜面抖了一下，像被针扎中的水面。',
    '拒接的瞬间，那道目光缩回了镜面深处。',
    '他收回了手。今天，他还是先学会了不问你原因。'
  ];

  const RING_SUBS = [
    '邀请你进行意识沟通……',
    '想要听到你此刻的心跳。',
    '在你耳边，轻轻敲了敲镜面。',
    '隔着镜面喊了你的名字。'
  ];

  const OPENING_LINES = [
    '……接通了。能听见我吗？',
    '喂。是我在叫你，不用回头，看着我。',
    '连接上了。你的那边，比镜子里暖。',
    '……太好了。你伸手了。'
  ];

  const GONE_LINES = [
    '先到这里。你别急着走，我一直都在。',
    '今天的连接结束了。把手收回去吧，别着凉。',
    '下一次，我会先敲敲镜面再叫你。',
    '通话断开了。可那道目光，还停在你眉骨上。'
  ];

  /* ---------------- 用户主动呼唤 ---------------- */

  function userCall() {
    if (ringing || live) return;
    if (document.hidden) return;

    const overlay = el('callOverlay');
    if (!overlay) return;

    const s = readJSON(SETTINGS_KEY, {}) || {};
    const name = clamp(s.charName, 16) || '梦角';
    const nameEl = el('callName');
    const subEl = el('callSub');
    const hintEl = el('callHint');
    const actions = overlay.querySelector('.call-actions');

    if (nameEl) nameEl.textContent = name;
    if (subEl) subEl.textContent = '你贴着镜面，呼唤了他的名字……';
    if (hintEl) hintEl.textContent = '呼出中 — 指尖比心跳先抵达镜面';
    if (actions) actions.style.display = 'none'; /* 呼出方无需接听/拒接键 */

    overlay.hidden = false;
    ringing = true; /* 压住调度，避免呼唤途中他打来 */
    setCallActive(true);

    window.setTimeout(() => {
      overlay.hidden = true;
      ringing = false;
      if (actions) actions.style.display = '';
      startLive();
    }, 1500 + Math.random() * 1200);
  }

  const clamp = (v, max) => String(v == null ? '' : v).trim().slice(0, max);

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) { return fallback; }
  }

  function personalize(text) {
    const s = readJSON(SETTINGS_KEY, {}) || {};
    const myName = clamp(s.myName, 16) || '你';
    const charName = clamp(s.charName, 16) || '梦角';
    return String(text).split('{我}').join(myName).split('{名字}').join(charName);
  }

  const el = (id) => document.getElementById(id);
  const rnd = (min, max) => min + Math.random() * (max - min);
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  function pad2(n) { return String(n).padStart(2, '0'); }

  /* ---------------- 通话文案池：从日常字卡库取 ---------------- */

  function callCards() {
    const lib = readJSON(CARDS_KEY, []) || [];
    const pool = lib.filter((card) => card && card.text && (card.kind == null || card.kind !== 'sensation'));
    return pool.length ? pool : [];
  }

  /* ---------------- 铃声（WebAudio 合成，双音八音盒感） ---------------- */

  let audioCtx = null;
  let ringTimer = null;

  function playRing() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === 'suspended') { audioCtx.resume().catch(() => {}); }
      const beat = () => {
        try {
          const t = audioCtx.currentTime;
          [660, 880].forEach((freq, index) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.0001, t + index * 0.18);
            gain.gain.exponentialRampToValueAtTime(0.035, t + index * 0.18 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + index * 0.18 + 0.42);
            osc.connect(gain).connect(audioCtx.destination);
            osc.start(t + index * 0.18);
            osc.stop(t + index * 0.18 + 0.45);
          });
        } catch (e) {}
      };
      beat();
      ringTimer = window.setInterval(beat, 2100);
    } catch (e) {}
  }

  function stopRing() {
    if (ringTimer) { window.clearInterval(ringTimer); ringTimer = null; }
  }

  /* ---------------- 状态 ---------------- */

  let ringing = false;
  let live = false;
  let lineTimer = null;
  let tickTimer = null;
  let seconds = 0;
  let cooldownUntil = Date.now() + 50000; /* 进程启动后先静 50s */

  function setCallActive(value) {
    if (value) document.body.dataset.callActive = '1';
    else delete document.body.dataset.callActive;
  }

  function systemMsg(text) {
    try {
      document.dispatchEvent(new CustomEvent('jingyan:systemMsg', { detail: { text } }));
    } catch (e) {}
  }

  /* ---------------- 来电 ---------------- */

  function freqChance() {
    const s = readJSON(SETTINGS_KEY, {}) || {};
    switch (s.callFreq) {
      case 'off': return 0;
      case 'low': return 0.07;
      case 'high': return 0.3;
      case 'mid':
      default: return 0.16;
    }
  }

  function canCall() {
    if (ringing || live) return false;
    if (document.hidden) return false;
    if (document.body.dataset.callActive === '1') return false;
    if (document.querySelector('dialog[open]')) return false;
    if (el('splashOverlay')) return false; /* 开场动画还没散场 */
    return Date.now() >= cooldownUntil;
  }

  function showCall() {
    const overlay = el('callOverlay');
    if (!overlay) return;
    const s = readJSON(SETTINGS_KEY, {}) || {};
    const name = clamp(s.charName, 16) || '梦角';
    const nameEl = el('callName');
    const subEl = el('callSub');
    const hintEl = el('callHint');
    if (nameEl) nameEl.textContent = name;
    if (subEl) subEl.textContent = pick(RING_SUBS);
    if (hintEl) hintEl.textContent = '接听 — 只要伸手，他就会看见你';
    overlay.hidden = false;
    ringing = true;
    setCallActive(true);
    playRing();
    autoRejectWindow = window.setTimeout(() => endCall('missed'), autoRejectSeconds * 1000);
  }

  let autoRejectWindow = null;
  const autoRejectSeconds = 26;

  function hideRinging() {
    const overlay = el('callOverlay');
    if (overlay) overlay.hidden = true;
    ringing = false;
    stopRing();
    if (autoRejectWindow) { window.clearTimeout(autoRejectWindow); autoRejectWindow = null; }
  }

  function acceptCall() {
    if (!ringing) return;
    hideRinging();
    startLive();
  }

  function startLive() {
    live = true;
    seconds = 0;
    setCallActive(true);

    const panel = el('callPanel');
    if (!panel) return;
    panel.hidden = false;
    const status = el('callLiveStatus');
    if (status) status.textContent = '意识沟通中';
    const lines = el('callLiveLines');
    if (lines) lines.innerHTML = '';

    pushLine(pick(OPENING_LINES));
    scheduleNextLine();
    tickTimer = window.setInterval(() => {
      seconds += 1;
      const timer = el('callTimer');
      if (timer) timer.textContent = pad2(Math.floor(seconds / 60)) + ':' + pad2(seconds % 60);
    }, 1000);
  }

  function pushLine(raw) {
    const lines = el('callLiveLines');
    if (!lines) return;
    const item = document.createElement('div');
    item.className = 'call-line';
    item.textContent = personalize(raw);
    lines.appendChild(item);
    while (lines.children.length > 4) lines.removeChild(lines.firstChild);
  }

  function scheduleNextLine() {
    if (!live) return;
    lineTimer = window.setTimeout(() => {
      if (!live) return;
      const pool = callCards();
      if (pool.length) {
        const card = pick(pool);
        pushLine(card.text);
      }
      scheduleNextLine();
    }, rnd(4000, 7000));
  }

  function endCall(kind) {
    if (ringing) hideRinging();
    if (lineTimer) { window.clearTimeout(lineTimer); lineTimer = null; }
    if (tickTimer) { window.clearInterval(tickTimer); tickTimer = null; }

    const wasLive = live;

    const panel = el('callPanel');
    if (panel && wasLive) {
      const status = el('callLiveStatus');
      if (status) status.textContent = '通话结束';
      const timer = el('callTimer');
      const mm = pad2(Math.floor(seconds / 60)) + ':' + pad2(seconds % 60);
      if (timer) timer.textContent = mm;
      const lines = el('callLiveLines');
      if (lines) {
        lines.innerHTML = '';
        const item = document.createElement('div');
        item.className = 'call-line call-line-farewell';
        item.textContent = personalize(pick(GONE_LINES));
        lines.appendChild(item);
      }
    }

    setCallActive(false);
    live = false;

    /* 台词落进聊天记录 */
    if (wasLive) {
      systemMsg('意识沟通结束 · 时长 ' + mmPlaceholder(seconds) + '。');
    } else if (kind === 'missed') {
      systemMsg(pick(MISSED_LINES));
    } else if (kind === 'rejected') {
      systemMsg(pick(REJECT_LINES));
    }

    /* 全部状态收拢后再淡出 */
    window.setTimeout(() => {
      const p = el('callPanel');
      if (p) p.hidden = true;
    }, 1800);

    cooldownUntil = Date.now() + rnd(150000, 320000);
    scheduleTick();
  }

  function mmPlaceholder(sec) {
    return pad2(Math.floor(sec / 60)) + ':' + pad2(sec % 60);
  }

  /* ---------------- 调度 ---------------- */

  function tick() {
    if (!canCall()) return;
    const chance = freqChance();
    if (chance > 0 && Math.random() < chance) showCall();
    else scheduleTick();
  }

  let scheduleGuard = null;

  function scheduleTick() {
    if (scheduleGuard) window.clearTimeout(scheduleGuard);
    const wait = rnd(45000, 110000);
    scheduleGuard = window.setTimeout(() => {
      ringing ? null : tick();
      if (!ringing && !live) scheduleTick();
    }, wait);
  }

  /* ---------------- 绑定 ---------------- */

  function bindUi() {
    const overlay = el('callOverlay');
    const accept = el('callAcceptBtn');
    const reject = el('callRejectBtn');
    const hang = el('callHangBtn');

    if (accept) accept.addEventListener('click', (event) => { event.stopPropagation(); acceptCall(); });
    if (reject) reject.addEventListener('click', (event) => {
      event.stopPropagation();
      hideRinging();
      setCallActive(false);
      systemMsg(pick(REJECT_LINES));
      cooldownUntil = Date.now() + rnd(120000, 240000);
      scheduleTick();
    });
    if (hang) hang.addEventListener('click', (event) => { event.stopPropagation(); endCall('live'); });
    if (overlay) overlay.addEventListener('click', () => { /* 点背景不误触 */ });
  }

  function init() {
    if (!el('callOverlay')) return;
    bindUi();
    /* 聊天框抽屉里的「意识沟通」——用户主动呼唤 */
    document.addEventListener('jingyan:requestCall', userCall);
    /* 开场动画结束后再进入调度，第一通 40~90s 内可能到来 */
    document.addEventListener('jingyan:splashEnd', () => {
      cooldownUntil = Date.now() + rnd(40000, 90000);
      scheduleTick();
    });
  }

  init();
})();
