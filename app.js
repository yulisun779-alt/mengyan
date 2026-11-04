(() => {
  'use strict';

  /* =========================================================
     基础数据
     ========================================================= */

  const KEYS = {
    cards: 'jingyan.cards.v1',
    sensation: 'jingyan.sensationCards.v1',
    settings: 'jingyan.settings.v1',
    chat: 'jingyan.chat.v1'
  };

  const DEFAULT_STATUS_POOL = [
    '在等你的消息',
    '在镜后静静看你',
    '心情不错',
    '有些困了',
    '在整理衣领',
    '想听你说话',
    '正望着镜面发呆'
  ];

  const DEFAULT_SETTINGS = {
    charName: '沈砚',
    charTitle: '住在镜子背面的人',
    myName: '你',
    speed: 'normal',
    avoidRepeat: true,
    drawTags: [],
    avatar: '',
    fontScale: 1,
    status: '在等你的消息',
    statusPool: DEFAULT_STATUS_POOL.slice(),
    proactive: true,
    sensationPopup: true
  };

  const FONT_STEPS = [
    { value: 0.85, label: '小' },
    { value: 1, label: '标准' },
    { value: 1.12, label: '大' },
    { value: 1.25, label: '特大' }
  ];

  const SUGGESTIONS = ['你在镜子里吗？', '今晚别走', '我想听你的声音', '再说一句'];

  /* =========================================================
     工具函数
     ========================================================= */

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const uid = () => 'c_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
  const pad3 = (n) => String(n).padStart(3, '0');
  const clampText = (value, max) => String(value == null ? '' : value).trim().slice(0, max);

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      toast('保存失败：浏览器存储空间可能已满');
    }
  }

  function normalizeCard(input, kind = 'daily') {
    if (!input) return null;
    const resolvedKind = kind === 'sensation' ? 'sensation' : 'daily';
    const fallbackTag = resolvedKind === 'sensation' ? '体感' : '日常';

    if (typeof input === 'string') {
      const text = clampText(input, 200);
      if (!text) return null;
      return { id: uid(), text, tag: fallbackTag, kind: resolvedKind, createdAt: Date.now() };
    }

    if (typeof input !== 'object') return null;

    const rawText = typeof input.text === 'string'
      ? input.text
      : (typeof input.content === 'string' ? input.content : '');
    const text = clampText(rawText, 200);
    if (!text) return null;

    const rawTag = typeof input.tag === 'string'
      ? input.tag
      : (typeof input.label === 'string' ? input.label : '');

    const itemKind = input.kind === 'sensation'
      ? 'sensation'
      : (input.kind === 'daily' ? 'daily' : resolvedKind);

    return {
      id: typeof input.id === 'string' && input.id ? input.id : uid(),
      text,
      tag: clampText(rawTag, 12) || (itemKind === 'sensation' ? '体感' : '日常'),
      kind: itemKind,
      createdAt: Number(input.createdAt) || Date.now()
    };
  }

  function loadCards(kind = 'daily') {
    const key = kind === 'sensation' ? KEYS.sensation : KEYS.cards;
    const raw = readJSON(key, []);
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => normalizeCard(item, kind)).filter(Boolean);
  }

  function loadSettings() {
    const raw = readJSON(KEYS.settings, {});
    const settings = Object.assign({}, DEFAULT_SETTINGS, (raw && typeof raw === 'object') ? raw : {});

    settings.charName = clampText(settings.charName, 16) || DEFAULT_SETTINGS.charName;
    settings.charTitle = clampText(settings.charTitle, 30) || DEFAULT_SETTINGS.charTitle;
    settings.myName = clampText(settings.myName, 16) || DEFAULT_SETTINGS.myName;
    if (!['slow', 'normal', 'fast'].includes(settings.speed)) settings.speed = 'normal';
    settings.avoidRepeat = settings.avoidRepeat !== false;
    if (!Array.isArray(settings.drawTags)) settings.drawTags = [];
    settings.drawTags = settings.drawTags.map((tag) => clampText(tag, 12)).filter(Boolean);

    settings.fontScale = Number(settings.fontScale);
    if (!Number.isFinite(settings.fontScale) || settings.fontScale < 0.8 || settings.fontScale > 1.4) {
      settings.fontScale = 1;
    }

    if (!Array.isArray(settings.statusPool)) settings.statusPool = [];
    settings.statusPool = settings.statusPool
      .map((status) => clampText(status, 20))
      .filter(Boolean)
      .filter((status, index, list) => list.indexOf(status) === index);
    if (!settings.statusPool.length) settings.statusPool = DEFAULT_STATUS_POOL.slice();

    settings.status = clampText(settings.status, 20);
    if (!settings.status || !settings.statusPool.includes(settings.status)) {
      settings.status = settings.statusPool[0];
    }

    settings.proactive = settings.proactive !== false;
    settings.sensationPopup = settings.sensationPopup !== false;

    if (typeof settings.avatar !== 'string' || !/^data:image\//.test(settings.avatar) || settings.avatar.length > 2000000) {
      settings.avatar = '';
    }

    return settings;
  }

  function normalizeReplyTo(raw) {
    if (!raw || typeof raw !== 'object') return null;
    if (typeof raw.text !== 'string' || !raw.text.trim()) return null;
    return {
      id: typeof raw.id === 'string' ? raw.id : null,
      role: raw.role === 'card' ? 'card' : 'user',
      text: raw.text.slice(0, 500),
      tag: clampText(raw.tag, 12) || '日常'
    };
  }

  function loadMessages() {
    const raw = readJSON(KEYS.chat, []);
    if (!Array.isArray(raw)) return [];

    return raw
      .filter((message) => message && typeof message === 'object')
      .filter((message) => ['user', 'card', 'system'].includes(message.role))
      .filter((message) => typeof message.text === 'string' && message.text.trim())
      .map((message) => ({
        id: typeof message.id === 'string' && message.id ? message.id : uid(),
        role: message.role,
        text: message.text.slice(0, 4000),
        tag: clampText(message.tag, 12) || '日常',
        cardId: typeof message.cardId === 'string' ? message.cardId : null,
        no: Number.isFinite(Number(message.no)) && Number(message.no) > 0 ? Number(message.no) : null,
        action: message.action === 'library' ? 'library' : null,
        replyTo: normalizeReplyTo(message.replyTo),
        ts: Number(message.ts) || Date.now()
      }))
      .slice(-400);
  }

  function timeLabel(timestamp) {
    try {
      return new Date(timestamp).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      return '';
    }
  }

  function personalize(text) {
    return String(text)
      .split('{我}').join(settings.myName || '你')
      .split('{名字}').join(settings.charName || '梦角');
  }

  function cardsOf(kind) {
    return kind === 'sensation' ? sensationCards : cards;
  }

  function allCards() {
    return cards.concat(sensationCards);
  }

  function findCard(id) {
    return allCards().find((card) => card.id === id) || null;
  }

  function getAllTags() {
    const counts = new Map();
    allCards().forEach((card) => {
      counts.set(card.tag, (counts.get(card.tag) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'))
      .map(([tag, count]) => ({ tag, count }));
  }

  /* =========================================================
     状态
     ========================================================= */

  let cards = loadCards('daily');
  let sensationCards = loadCards('sensation');
  let settings = loadSettings();
  let messages = loadMessages();

  let bag = [];
  let sensationBag = [];
  let busy = false;
  let editingId = null;
  let editingKind = 'daily';
  let confirmCallback = null;
  let libFilter = { tag: 'all', query: '' };
  let activeKind = 'daily';
  let selectMode = false;
  let selectedIds = new Set();
  let pendingReply = null;
  let statusDraft = [];
  let statusTimer = null;
  let proactiveTimer = null;
  let proactiveQuiet = 0;
  let lastUserAt = Date.now();
  let lastSensationAt = 0;
  let sensationTimer = null;
  let sensationCountdown = null;

  /* =========================================================
     头像
     ========================================================= */

  function compressImageFile(file, maxSize, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('error', () => reject(new Error('读取图片失败')));
      reader.addEventListener('load', () => {
        const img = new Image();
        img.addEventListener('error', () => reject(new Error('图片无法解析')));
        img.addEventListener('load', () => {
          try {
            const srcW = img.naturalWidth || img.width || 1;
            const srcH = img.naturalHeight || img.height || 1;
            const ratio = Math.min(1, maxSize / Math.max(srcW, srcH));
            const w = Math.max(1, Math.round(srcW * ratio));
            const h = Math.max(1, Math.round(srcH * ratio));

            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject(new Error('画布初始化失败')); return; }

            ctx.fillStyle = '#120709';
            ctx.fillRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);

            resolve(canvas.toDataURL('image/jpeg', quality));
          } catch (error) {
            reject(new Error('处理图片失败'));
          }
        });
        img.src = String(reader.result || '');
      });
      reader.readAsDataURL(file);
    });
  }

  function applyAvatar() {
    const src = settings.avatar || '';
    const big = $('#avatarImg');
    const mini = $('#chatAvatar');

    if (big) {
      if (src) { big.src = src; big.hidden = false; }
      else { big.removeAttribute('src'); big.hidden = true; }
    }

    if (mini) {
      if (src) { mini.src = src; mini.hidden = false; }
      else { mini.removeAttribute('src'); mini.hidden = true; }
    }

    const preview = $('#avatarPreview');
    if (preview) {
      preview.innerHTML = '';
      if (src) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = '头像预览';
        preview.appendChild(img);
      } else {
        const span = document.createElement('span');
        span.textContent = '默认';
        preview.appendChild(span);
      }
    }
  }

  async function handleAvatarPick(file) {
    if (!file) return;
    if (!file.type || !/^image\//.test(file.type)) { toast('请选择一张图片'); return; }
    if (file.size > 15 * 1024 * 1024) { toast('图片太大了，请选小于 15MB 的照片'); return; }

    try {
      let data = await compressImageFile(file, 480, 0.85);
      if (data.length > 900 * 1024) data = await compressImageFile(file, 320, 0.75);
      if (data.length > 1600 * 1024) { toast('图片压缩后仍然太大，换一张试试'); return; }

      settings.avatar = data;
      writeJSON(KEYS.settings, settings);
      applyAvatar();
      toast('头像已更新');
    } catch (error) {
      toast(error && error.message ? error.message : '头像更新失败');
    }
  }

  function clearAvatar() {
    if (!settings.avatar) { toast('当前是默认头像'); return; }
    settings.avatar = '';
    writeJSON(KEYS.settings, settings);
    applyAvatar();
    toast('已恢复默认头像');
  }

  function pickAvatar() {
    const input = $('#avatarFile');
    if (input) input.click();
  }

  /* =========================================================
     回复栏（pendingReply）
     ========================================================= */

  function makeReplyQuote(msg) {
    if (!msg || !msg.text) return null;
    return {
      id: msg.id || null,
      role: msg.role === 'card' ? 'card' : 'user',
      text: String(msg.text).slice(0, 500),
      tag: clampText(msg.tag, 12) || '日常'
    };
  }

  function setPendingReply(message) {
    pendingReply = makeReplyQuote(message);
    updateReplyBar();
    const input = $('#messageInput');
    if (input) input.focus();
  }

  function clearPendingReply() {
    pendingReply = null;
    updateReplyBar();
  }

  function updateReplyBar() {
    const bar = $('#replyBar');
    if (!bar) return;
    if (!pendingReply) { bar.hidden = true; return; }

    bar.hidden = false;
    const nameEl = $('#replyBarName');
    const textEl = $('#replyBarText');

    if (pendingReply.role === 'user') {
      nameEl.textContent = settings.myName || '你';
      textEl.textContent = truncate(pendingReply.text, 60);
    } else {
      nameEl.textContent = settings.charName;
      textEl.textContent = truncate(personalize(pendingReply.text), 60);
    }
  }

  function truncate(text, max) {
    const str = String(text || '').replace(/\s+/g, ' ').trim();
    return str.length > max ? str.slice(0, max) + '…' : str;
  }

  function buildReplyQuote(replyTo) {
    if (!replyTo) return null;
    const quote = document.createElement('div');
    quote.className = 'reply-quote reply-quote-' + replyTo.role;

    const name = document.createElement('span');
    name.className = 'reply-quote-name';
    name.textContent = replyTo.role === 'user'
      ? (settings.myName || '你')
      : settings.charName;

    const text = document.createElement('span');
    text.className = 'reply-quote-text';
    const raw = replyTo.role === 'card' ? personalize(replyTo.text) : replyTo.text;
    text.textContent = truncate(raw, 40);

    quote.append(name, text);
    return quote;
  }

  /* =========================================================
     UI 基础
     ========================================================= */

  function applyFontScale() {
    const scale = Number(settings.fontScale) || 1;
    document.documentElement.style.setProperty('--msg-scale', String(scale));
  }

  function renderStatus(animated = false) {
    const status = settings.status || (settings.statusPool && settings.statusPool[0]) || '在等你的消息';
    const side = $('#charStatus');
    const sub = $('#chatSub');

    if (side) side.textContent = status;
    if (sub) sub.textContent = status;

    if (animated) {
      [side, sub].forEach((node) => {
        if (!node) return;
        node.classList.remove('status-change');
        void node.offsetWidth;
        node.classList.add('status-change');
      });
    }
  }

  function applySettings() {
    $('#charNameLabel').textContent = settings.charName;
    $('#chatName').textContent = settings.charName;
    $('#charTitleLabel').textContent = settings.charTitle;
    $('#messageInput').placeholder = '想对' + settings.charName + '说点什么…';

    applyFontScale();
    renderStatus();
    applyAvatar();
    updateReplyBar();
    updatePoolHint();
  }

  function updatePoolHint() {
    const count = eligibleCards().length;
    const hint = $('#poolHint');
    if (hint) hint.textContent = String(count);
  }

  function updateCounts() {
    const nav = $('#navCardCount');
    if (nav) nav.textContent = String(allCards().length);

    const dailyCount = $('#dailyCount');
    if (dailyCount) dailyCount.textContent = String(cards.length);
    const sensationCount = $('#sensationCount');
    if (sensationCount) sensationCount.textContent = String(sensationCards.length);

    const summary = $('#librarySummary');
    if (summary) {
      summary.textContent = activeKind === 'sensation'
        ? '共 ' + sensationCards.length + ' 张体感字卡 · 弹窗会从这里抽取'
        : '共 ' + cards.length + ' 张日常字卡 · 抽卡池 ' + eligibleCards().length + ' 张';
    }

    const note = $('#libNote');
    if (note) {
      note.innerHTML = activeKind === 'sensation'
        ? '体感字卡只用于「体感弹窗」，与日常字卡分开存放。支持占位符 <code>{我}</code> 与 <code>{名字}</code>。'
        : '每行一句心意。支持占位符 <code>{我}</code>（你的昵称）与 <code>{名字}</code>（梦角名字）。';
    }

    updatePoolHint();
  }

  function pruneDrawTags() {
    const known = new Set(cards.map((card) => card.tag));
    const next = settings.drawTags.filter((tag) => known.has(tag));
    if (next.length !== settings.drawTags.length) {
      settings.drawTags = next;
      writeJSON(KEYS.settings, settings);
    }
  }

  function setBusyUI(isBusy) {
    if (isBusy) {
      const side = $('#charStatus');
      const sub = $('#chatSub');
      if (side) side.textContent = '我想说…';
      if (sub) sub.textContent = '我想说…';
    } else {
      renderStatus();
    }

    const headBtn = $('#continueBtn');
    if (headBtn) headBtn.disabled = isBusy;
    $$('.continue-btn').forEach((btn) => { btn.disabled = isBusy; });
  }

  function scrollToBottom() {
    const scroller = $('#chatScroll');
    if (!scroller) return;
    scroller.scrollTop = scroller.scrollHeight;
  }

  /* =========================================================
     抽卡
     ========================================================= */

  function eligibleCards() {
    if (!settings.drawTags.length) return cards;
    return cards.filter((card) => settings.drawTags.includes(card.tag));
  }

  function resetBag() { bag = []; }

  function drawCard() {
    const pool = eligibleCards();
    if (!pool.length) return null;

    if (!settings.avoidRepeat) {
      return pool[Math.floor(Math.random() * pool.length)];
    }

    const poolIds = new Set(pool.map((card) => card.id));
    bag = bag.filter((id) => poolIds.has(id));

    if (!bag.length) {
      bag = pool.map((card) => card.id);
      for (let i = bag.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
    }

    const id = bag.pop();
    return pool.find((card) => card.id === id) || pool[0];
  }

  function resetSensationBag() { sensationBag = []; }

  function drawSensationCard() {
    const pool = sensationCards;
    if (!pool.length) return null;

    if (!settings.avoidRepeat) {
      return pool[Math.floor(Math.random() * pool.length)];
    }

    const poolIds = new Set(pool.map((card) => card.id));
    sensationBag = sensationBag.filter((id) => poolIds.has(id));

    if (!sensationBag.length) {
      sensationBag = pool.map((card) => card.id);
      for (let i = sensationBag.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [sensationBag[i], sensationBag[j]] = [sensationBag[j], sensationBag[i]];
      }
    }

    const id = sensationBag.pop();
    return pool.find((card) => card.id === id) || pool[0];
  }

  function getDelay(length) {
    const base = settings.speed === 'fast' ? 380 : settings.speed === 'slow' ? 1500 : 800;
    const extra = Math.min(1000, length * 24);
    return base + extra + Math.random() * 260;
  }

  function getChainDelay(index) {
    if (index === 0) return getDelay(20);
    // 后续条数稍微快一点
    const base = settings.speed === 'fast' ? 300 : settings.speed === 'slow' ? 900 : 560;
    return base + Math.random() * 340;
  }

  /* =========================================================
     聊天渲染
     ========================================================= */

  function buildCardElement(message) {
    const card = document.createElement('div');
    card.className = 'card';

    const head = document.createElement('div');
    head.className = 'card-head';

    const brand = document.createElement('span');
    brand.className = 'card-brand';
    brand.textContent = '镜魇 · 字卡';

    const tag = document.createElement('span');
    tag.className = 'card-tag';
    tag.textContent = message.tag || '日常';

    head.append(brand, tag);

    const text = document.createElement('p');
    text.className = 'card-text';
    text.textContent = personalize(message.text);

    const foot = document.createElement('div');
    foot.className = 'card-foot';

    const number = document.createElement('span');
    number.textContent = message.no ? 'NO. ' + pad3(message.no) : 'NO. —';

    const seal = document.createElement('span');
    seal.className = 'seal';
    seal.textContent = '魇';

    foot.append(number, seal);
    card.append(head, text, foot);
    return card;
  }

  function buildReplyButton(message) {
    const replyBtn = document.createElement('button');
    replyBtn.type = 'button';
    replyBtn.className = 'text-btn';
    replyBtn.textContent = '↩ 回复';
    replyBtn.addEventListener('click', () => setPendingReply(message));
    return replyBtn;
  }

  function renderMessage(message) {
    const wrap = document.createElement('div');
    wrap.className = 'msg ' + (message.role === 'user' ? 'msg-user' : message.role === 'card' ? 'msg-reply' : 'msg-system');
    wrap.dataset.id = message.id;

    if (message.role === 'system') {
      wrap.textContent = message.text;
      if (message.action === 'library') {
        const action = document.createElement('button');
        action.type = 'button';
        action.className = 'text-btn';
        action.textContent = '去字卡库 →';
        action.addEventListener('click', () => switchView('library'));
        wrap.appendChild(action);
      }
      return wrap;
    }

    const meta = document.createElement('p');
    meta.className = 'msg-meta';

    if (message.role === 'user') {
      meta.textContent = timeLabel(message.ts);
      wrap.appendChild(meta);

      const quote = buildReplyQuote(message.replyTo);
      if (quote) wrap.appendChild(quote);

      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.textContent = message.text;
      wrap.appendChild(bubble);

      const actions = document.createElement('div');
      actions.className = 'msg-actions';
      actions.appendChild(buildReplyButton(message));
      wrap.appendChild(actions);

      return wrap;
    }

    meta.textContent = '镜后密语 · ' + timeLabel(message.ts);
    wrap.appendChild(meta);

    const quote = buildReplyQuote(message.replyTo);
    if (quote) wrap.appendChild(quote);

    wrap.appendChild(buildCardElement(message));

    const actions = document.createElement('div');
    actions.className = 'msg-actions';

    const redraw = document.createElement('button');
    redraw.type = 'button';
    redraw.className = 'text-btn';
    redraw.textContent = '↻ 换一张';
    redraw.addEventListener('click', () => redrawMessage(message, wrap, redraw));
    actions.appendChild(redraw);

    const cont = document.createElement('button');
    cont.type = 'button';
    cont.className = 'text-btn continue-btn';
    cont.textContent = '✧ 让它继续说';
    cont.addEventListener('click', () => continueReply());
    actions.appendChild(cont);

    actions.appendChild(buildReplyButton(message));
    wrap.appendChild(actions);

    return wrap;
  }

  function welcomeElement() {
    const wrap = document.createElement('div');
    wrap.className = 'welcome';

    const moon = document.createElement('div');
    moon.className = 'moon';
    moon.setAttribute('aria-hidden', 'true');
    const halo = document.createElement('span');
    halo.className = 'moon-halo';
    moon.appendChild(halo);

    const eyebrow = document.createElement('p');
    eyebrow.className = 'welcome-eyebrow';
    eyebrow.textContent = 'THE MIRROR REMEMBERS';

    const title = document.createElement('h2');
    title.textContent = '镜面之下，有人在等';

    const hasCards = cards.length > 0;

    const description = document.createElement('p');
    description.textContent = hasCards
      ? '写下此刻的心事，' + settings.charName + '会从你的字卡里抽一张，作为回信。'
      : '镜子里还没有你的字卡。先去字卡库写下几句想听的话，再回来找' + settings.charName + '。';

    const suggestions = document.createElement('div');
    suggestions.className = 'suggestions';
    SUGGESTIONS.forEach((text) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'suggestion';
      button.textContent = text;
      button.addEventListener('click', () => {
        const input = $('#messageInput');
        input.value = text;
        autoGrow(input);
        input.focus();
      });
      suggestions.appendChild(button);
    });

    const cta = document.createElement('button');
    cta.type = 'button';
    cta.className = 'welcome-cta';
    cta.textContent = '去字卡库写下第一张 →';
    cta.addEventListener('click', () => switchView('library'));

    const foot = document.createElement('p');
    foot.className = 'welcome-foot';
    foot.textContent = '字卡由你书写 · 镜面替你传讯';

    wrap.append(moon, eyebrow, title, description, hasCards ? suggestions : cta, foot);
    return wrap;
  }

  function renderChat() {
    const list = $('#chatList');
    list.innerHTML = '';

    if (!messages.length) {
      list.appendChild(welcomeElement());
      $('#chatScroll').scrollTop = 0;
      return;
    }

    messages.forEach((message) => {
      const node = renderMessage(message);
      node.style.animation = 'none';
      list.appendChild(node);
    });

    scrollToBottom();
  }

  function appendMessage(message, forceScroll = true) {
    messages.push(message);
    writeJSON(KEYS.chat, messages);

    const scroller = $('#chatScroll');
    const nearBottom = !scroller
      || (scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 140);

    const list = $('#chatList');
    const welcome = $('.welcome', list);
    if (welcome) welcome.remove();

    list.appendChild(renderMessage(message));
    if (forceScroll || nearBottom) scrollToBottom();
  }

  function showTyping() {
    removeTyping();
    const wrap = document.createElement('div');
    wrap.className = 'msg msg-typing';
    wrap.id = 'typingMsg';

    const card = document.createElement('div');
    card.className = 'typing-card';

    const dots = document.createElement('span');
    dots.className = 'dots';
    dots.innerHTML = '<i></i><i></i><i></i>';

    const label = document.createElement('span');
    label.textContent = '我想说';

    card.append(label, dots);
    wrap.appendChild(card);
    $('#chatList').appendChild(wrap);
    scrollToBottom();
  }

  function removeTyping() {
    const typing = $('#typingMsg');
    if (typing) typing.remove();
  }

  async function redrawMessage(message, wrap, button) {
    button.disabled = true;
    const originalLabel = button.textContent;
    button.textContent = '正在重新抽取…';

    await sleep(260);
    const card = drawCard();
    button.disabled = false;
    button.textContent = originalLabel;

    if (!card) { toast('抽卡池里没有可用的字卡'); return; }

    message.text = card.text;
    message.tag = card.tag;
    message.cardId = card.id;
    message.no = allCards().findIndex((item) => item.id === card.id) + 1;
    message.ts = Date.now();
    writeJSON(KEYS.chat, messages);

    const oldCard = $('.card', wrap);
    if (oldCard) oldCard.replaceWith(buildCardElement(message));

    const meta = $('.msg-meta', wrap);
    if (meta) meta.textContent = '镜后密语 · ' + timeLabel(message.ts);

    updatePoolHint();
  }

  /* =========================================================
     发送消息
     ========================================================= */

  function autoGrow(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 132) + 'px';
  }

  async function handleSend() {
    if (busy) return;

    const input = $('#messageInput');
    const text = input.value.trim();
    if (!text) { input.focus(); return; }

    noteUserActivity();

    busy = true;
    $('#sendBtn').disabled = true;
    input.value = '';
    autoGrow(input);

    const replyTo = pendingReply ? { ...pendingReply } : null;
    clearPendingReply();

    const userMsg = {
      id: uid(),
      role: 'user',
      text,
      replyTo,
      ts: Date.now()
    };
    appendMessage(userMsg);

    setBusyUI(true);
    await dreamReplyChain(userMsg);

    busy = false;
    $('#sendBtn').disabled = false;
    setBusyUI(false);
    updatePoolHint();
    maybeSensation(0.38);
    input.focus({ preventScroll: true });
  }

  /* =========================================================
     梦角连发 1-3 条
     ========================================================= */

  async function dreamReplyChain(triggerMsg) {
    const pool = eligibleCards();
    if (!pool.length) {
      const hasCards = cards.length > 0;
      appendMessage({
        id: uid(),
        role: 'system',
        text: hasCards
          ? '当前抽卡池里没有可用的字卡。去字卡库添加对应标签的字卡，或在设定里放宽抽卡池吧。'
          : '抽卡池里还没有字卡。去字卡库写下几句想听的话，再回来找' + settings.charName + '吧。',
        action: 'library',
        ts: Date.now()
      });
      toast(hasCards ? '当前抽卡池是空的，检查一下标签筛选' : '字卡库是空的，先添加几张字卡吧');
      return;
    }

    const count = 1 + Math.floor(Math.random() * 3); // 1 ~ 3

    for (let i = 0; i < count; i += 1) {
      showTyping();
      await sleep(getChainDelay(i));
      removeTyping();

      const card = drawCard();
      if (!card) break;

      let replyTo = null;
      if (i === 0 && triggerMsg && Math.random() < 0.5) {
        replyTo = makeReplyQuote(triggerMsg);
      }

      appendMessage({
        id: uid(),
        role: 'card',
        text: card.text,
        tag: card.tag,
        cardId: card.id,
        no: allCards().findIndex((item) => item.id === card.id) + 1,
        replyTo,
        ts: Date.now()
      });

      if (i < count - 1) await sleep(260);
    }
  }

  async function continueReply() {
    if (busy) return;

    const pool = eligibleCards();
    if (!pool.length) {
      const hasCards = cards.length > 0;
      appendMessage({
        id: uid(),
        role: 'system',
        text: hasCards
          ? '当前抽卡池里没有可用的字卡。去字卡库添加对应标签的字卡，或在设定里放宽抽卡池吧。'
          : '抽卡池里还没有字卡。去字卡库写下几句想听的话，再回来找' + settings.charName + '吧。',
        action: 'library',
        ts: Date.now()
      });
      toast(hasCards ? '当前抽卡池是空的，检查一下标签筛选' : '字卡库是空的，先添加几张字卡吧');
      return;
    }

    busy = true;
    setBusyUI(true);
    noteUserActivity();

    // 找最近一条用户消息，供梦角概率引用
    let triggerMsg = null;
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === 'user') { triggerMsg = messages[i]; break; }
    }

    await dreamReplyChain(triggerMsg);

    busy = false;
    setBusyUI(false);
    updatePoolHint();
    maybeSensation(0.3);
  }

  /* =========================================================
     状态卡池 / 主动传讯 / 体感
     ========================================================= */

  function pickStatus() {
    const pool = settings.statusPool.filter(Boolean);
    if (pool.length <= 1) return;

    let next = settings.status;
    for (let i = 0; i < 10 && next === settings.status; i += 1) {
      next = pool[Math.floor(Math.random() * pool.length)];
    }

    settings.status = next || pool[0];
    writeJSON(KEYS.settings, settings);
    renderStatus(true);
  }

  function scheduleStatusChange(delay) {
    window.clearTimeout(statusTimer);
    if (!settings.statusPool || settings.statusPool.length <= 1) return;

    const wait = typeof delay === 'number'
      ? delay
      : (120000 + Math.random() * 180000);
    statusTimer = window.setTimeout(() => {
      pickStatus();
      scheduleStatusChange();
    }, wait);
  }

  function noteUserActivity() {
    lastUserAt = Date.now();
    proactiveQuiet = 0;
    scheduleProactiveNext();
  }

  function scheduleProactiveNext(delay) {
    window.clearTimeout(proactiveTimer);
    if (!settings.proactive) return;

    const wait = typeof delay === 'number'
      ? delay
      : (45000 + Math.random() * 85000);
    proactiveTimer = window.setTimeout(runProactivePulse, wait);
  }

  function lastUserMessage() {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === 'user') return messages[i];
    }
    return null;
  }

  async function runProactivePulse() {
    proactiveTimer = null;
    if (!settings.proactive) return;

    const chatView = $('#viewChat');
    const chatActive = chatView && chatView.classList.contains('active');

    if (busy || document.visibilityState !== 'visible' || !chatActive
      || !eligibleCards().length || document.querySelector('dialog[open]')) {
      scheduleProactiveNext(40000 + Math.random() * 50000);
      return;
    }

    const input = $('#messageInput');
    if (input && document.activeElement === input && input.value.trim()) {
      scheduleProactiveNext(35000 + Math.random() * 40000);
      return;
    }

    const idle = Date.now() - lastUserAt;
    if (idle < 30000) {
      scheduleProactiveNext(30000 + Math.random() * 40000);
      return;
    }

    let chance = proactiveQuiet === 0 ? 0.62 : 0.46;
    if (idle > 10 * 60 * 1000) chance = 0.16;
    else if (idle > 5 * 60 * 1000) chance = 0.32;
    if (!lastUserMessage()) chance *= 0.6;

    if (Math.random() > chance) {
      scheduleProactiveNext(45000 + Math.random() * 80000);
      return;
    }

    await sendProactiveMessages();
  }

  async function sendProactiveMessages() {
    if (busy) return;
    const pool = eligibleCards();
    if (!pool.length) { scheduleProactiveNext(90000); return; }

    busy = true;
    setBusyUI(true);

    const count = Math.random() < 0.74 ? 1 : 2;
    const triggerMsg = lastUserMessage();

    for (let i = 0; i < count; i += 1) {
      showTyping();
      await sleep(1200 + Math.random() * 1600 + (settings.speed === 'slow' ? 900 : 0));
      removeTyping();

      const card = drawCard();
      if (!card) break;

      let replyTo = null;
      if (i === 0 && triggerMsg && Math.random() < 0.32) {
        replyTo = makeReplyQuote(triggerMsg);
      }

      appendMessage({
        id: uid(),
        role: 'card',
        text: card.text,
        tag: card.tag,
        cardId: card.id,
        no: allCards().findIndex((item) => item.id === card.id) + 1,
        replyTo,
        ts: Date.now()
      }, false);

      if (i < count - 1) await sleep(900 + Math.random() * 1700);
    }

    busy = false;
    setBusyUI(false);
    updatePoolHint();
    proactiveQuiet += 1;

    maybeSensation(0.45);

    const next = proactiveQuiet >= 3
      ? (150000 + Math.random() * 240000)
      : (75000 + Math.random() * 130000);
    scheduleProactiveNext(next);
  }

  function maybeSensation(probability = 0.35) {
    if (!settings.sensationPopup) return;
    if (!sensationCards.length) return;
    if (Date.now() - lastSensationAt < 90000) return;
    if (!$('#sensationOverlay').hidden) return;
    if (document.querySelector('dialog[open]')) return;
    if (Math.random() > probability) return;

    lastSensationAt = Date.now();
    window.clearTimeout(sensationTimer);
    sensationTimer = window.setTimeout(() => showSensation(true), 1200 + Math.random() * 2200);
  }

  function showSensation(auto = true) {
    if (!sensationCards.length) {
      if (!auto) toast('先在体感字卡库写几张字卡吧');
      return;
    }

    const overlay = $('#sensationOverlay');
    if (!overlay || !overlay.hidden) return;

    const card = drawSensationCard();
    if (!card) return;

    lastSensationAt = Date.now();
    const text = $('#sensationText');
    if (text) text.textContent = personalize(card.text);

    overlay.hidden = false;

    const progress = $('#sensationProgress');
    if (progress) {
      progress.style.animation = 'none';
      void progress.offsetWidth;
      progress.style.animation = '';
    }

    let left = 7;
    const countEl = $('#sensationTimerText');
    if (countEl) countEl.textContent = left + ' 秒后收起';

    window.clearInterval(sensationCountdown);
    window.clearTimeout(sensationTimer);

    sensationCountdown = window.setInterval(() => {
      left = Math.max(0, left - 1);
      if (countEl) countEl.textContent = left > 0 ? left + ' 秒后收起' : '正在收起…';
    }, 1000);

    sensationTimer = window.setTimeout(closeSensation, 7000);
  }

  function closeSensation() {
    window.clearTimeout(sensationTimer);
    window.clearInterval(sensationCountdown);
    sensationTimer = null;
    sensationCountdown = null;
    const overlay = $('#sensationOverlay');
    if (overlay) overlay.hidden = true;
  }

  function cycleFontScale() {
    const current = Number(settings.fontScale) || 1;
    let index = FONT_STEPS.findIndex((step) => Math.abs(step.value - current) < 0.001);
    index = (index + 1 + FONT_STEPS.length) % FONT_STEPS.length;
    const step = FONT_STEPS[index];

    settings.fontScale = step.value;
    writeJSON(KEYS.settings, settings);
    applyFontScale();
    toast('字号：' + step.label);
  }

  function restartPresenceTimers() {
    scheduleStatusChange(90000 + Math.random() * 150000);
    if (settings.proactive) {
      scheduleProactiveNext(40000 + Math.random() * 70000);
    } else {
      window.clearTimeout(proactiveTimer);
      proactiveTimer = null;
    }
  }

  /* =========================================================
     字卡库
     ========================================================= */

  function getTags(kind = activeKind) {
    const counts = new Map();
    cardsOf(kind).forEach((card) => {
      counts.set(card.tag, (counts.get(card.tag) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'))
      .map(([tag, count]) => ({ tag, count }));
  }

  function persistKind(kind) {
    if (kind === 'sensation') writeJSON(KEYS.sensation, sensationCards);
    else writeJSON(KEYS.cards, cards);
  }

  function visibleCards() {
    const query = libFilter.query.trim().toLowerCase();
    return cardsOf(activeKind).filter((card) => {
      const matchTag = libFilter.tag === 'all' || card.tag === libFilter.tag;
      const matchQuery = !query
        || card.text.toLowerCase().includes(query)
        || card.tag.toLowerCase().includes(query);
      return matchTag && matchQuery;
    });
  }

  function renderTagFilter() {
    const container = $('#tagFilter');
    if (!container) return;
    container.innerHTML = '';

    const source = cardsOf(activeKind);
    if (libFilter.tag !== 'all' && !source.some((card) => card.tag === libFilter.tag)) {
      libFilter.tag = 'all';
    }

    const all = document.createElement('button');
    all.type = 'button';
    all.className = 'chip' + (libFilter.tag === 'all' ? ' active' : '');
    all.textContent = '全部';
    const allCount = document.createElement('span');
    allCount.className = 'chip-count';
    allCount.textContent = String(source.length);
    all.appendChild(allCount);
    all.addEventListener('click', () => {
      libFilter.tag = 'all';
      renderTagFilter();
      renderCardGrid();
    });
    container.appendChild(all);

    getTags(activeKind).forEach(({ tag, count }) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip' + (libFilter.tag === tag ? ' active' : '');
      chip.textContent = tag;
      const chipCount = document.createElement('span');
      chipCount.className = 'chip-count';
      chipCount.textContent = String(count);
      chip.appendChild(chipCount);
      chip.addEventListener('click', () => {
        libFilter.tag = libFilter.tag === tag ? 'all' : tag;
        renderTagFilter();
        renderCardGrid();
      });
      container.appendChild(chip);
    });
  }

  function renderCardGrid() {
    const grid = $('#cardGrid');
    const empty = $('#libEmpty');
    if (!grid || !empty) return;

    const source = cardsOf(activeKind);
    const filtered = visibleCards();

    grid.innerHTML = '';
    grid.classList.toggle('select-mode', selectMode);

    empty.hidden = filtered.length > 0;
    if (!filtered.length) {
      $('#libEmptyText').textContent = source.length
        ? '没有找到匹配的字卡，换个关键词或标签试试。'
        : (activeKind === 'sensation'
          ? '还没有体感字卡。写几句梦角传给你的身体感觉吧。'
          : '新建一张字卡，或从文本 / JSON 批量导入。');
    }

    filtered.forEach((card) => {
      const number = source.findIndex((item) => item.id === card.id) + 1;

      const item = document.createElement('article');
      item.className = 'lib-card' + (selectedIds.has(card.id) ? ' selected' : '');
      item.dataset.id = card.id;

      if (selectMode) {
        const check = document.createElement('span');
        check.className = 'lib-check';
        check.textContent = '✓';
        item.appendChild(check);
        item.addEventListener('click', () => toggleCardSelection(card.id));
      }

      const top = document.createElement('div');
      top.className = 'lib-card-top';

      const tag = document.createElement('span');
      tag.className = 'tag-pill';
      tag.textContent = card.tag;

      const no = document.createElement('span');
      no.className = 'card-no';
      no.textContent = 'NO. ' + pad3(number);

      top.append(tag, no);

      const text = document.createElement('p');
      text.textContent = card.text;

      const foot = document.createElement('div');
      foot.className = 'lib-card-foot';

      const actions = document.createElement('div');
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'mini-btn';
      edit.textContent = '编辑';
      edit.addEventListener('click', () => openCardDialog(card.id));

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'mini-btn del';
      remove.textContent = '删除';
      remove.addEventListener('click', () => deleteCard(card.id));

      actions.append(edit, remove);

      const hint = document.createElement('span');
      hint.className = 'mini-btn';
      hint.style.cursor = 'default';
      hint.textContent = '约 ' + card.text.length + ' 字';

      foot.append(actions, hint);
      item.append(top, text, foot);
      grid.appendChild(item);
    });

    syncBatchUI();
  }

  function renderLibrary() {
    selectedIds = new Set(Array.from(selectedIds).filter((id) => findCard(id)));
    renderTagFilter();
    renderCardGrid();
    updateCounts();
    updateTagSuggestions();
    syncKindButtons();
    renderBatchTagOptions();
    syncBatchUI();
  }

  function updateTagSuggestions() {
    const datalist = $('#tagSuggestions');
    if (!datalist) return;
    datalist.innerHTML = '';
    getAllTags().forEach(({ tag }) => {
      const option = document.createElement('option');
      option.value = tag;
      datalist.appendChild(option);
    });
  }

  function syncKindButtons() {
    $$('#libKinds .kind-btn').forEach((button) => {
      const isActive = button.dataset.kind === activeKind;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  function setActiveKind(kind) {
    activeKind = kind === 'sensation' ? 'sensation' : 'daily';
    libFilter.tag = 'all';
    libFilter.query = '';
    $('#cardSearch').value = '';
    selectMode = false;
    selectedIds.clear();
    renderLibrary();
  }

  function syncBatchUI() {
    const bar = $('#batchBar');
    if (!bar) return;
    bar.hidden = !selectMode;

    const countEl = $('#batchCount');
    if (countEl) countEl.textContent = '已选 ' + selectedIds.size + ' 张';

    const modeBtn = $('#selectModeBtn');
    if (modeBtn) {
      modeBtn.classList.toggle('primary', selectMode);
      modeBtn.textContent = selectMode ? '✕ 退出批量' : '☑ 批量管理';
    }
  }

  function renderBatchTagOptions() {
    const select = $('#batchMoveSelect');
    if (!select) return;

    const previous = select.value;
    select.innerHTML = '';

    const tags = getAllTags();
    if (!tags.length) {
      const option = document.createElement('option');
      option.value = '';
      option.textContent = '还没有标签';
      select.appendChild(option);
      return;
    }

    tags.forEach(({ tag, count }) => {
      const option = document.createElement('option');
      option.value = tag;
      option.textContent = tag + ' · ' + count;
      select.appendChild(option);
    });

    if (previous && tags.some((item) => item.tag === previous)) select.value = previous;
  }

  function setSelectMode(on) {
    selectMode = !!on;
    if (!selectMode) selectedIds.clear();
    renderCardGrid();
    syncBatchUI();
  }

  function toggleCardSelection(id) {
    if (!selectMode) return;
    if (selectedIds.has(id)) selectedIds.delete(id);
    else selectedIds.add(id);
    renderCardGrid();
  }

  function selectAllVisible() {
    const list = visibleCards();
    if (!list.length) return;
    const allSelected = list.every((card) => selectedIds.has(card.id));
    if (allSelected) list.forEach((card) => selectedIds.delete(card.id));
    else list.forEach((card) => selectedIds.add(card.id));
    renderCardGrid();
  }

  function selectAllCards() {
    const list = allCards();
    if (!list.length) return;
    const allSelected = list.every((card) => selectedIds.has(card.id));
    if (allSelected) selectedIds.clear();
    else list.forEach((card) => selectedIds.add(card.id));
    renderCardGrid();
  }

  function batchDelete() {
    if (!selectedIds.size) { toast('先选中要删除的字卡'); return; }
    const total = selectedIds.size;
    const ids = new Set(selectedIds);

    askConfirm(
      '删除所选字卡？',
      '将删除 ' + total + ' 张字卡，日常与体感字卡中选中的都会移除。此操作不可撤销。',
      '删除所选',
      () => {
        cards = cards.filter((card) => !ids.has(card.id));
        sensationCards = sensationCards.filter((card) => !ids.has(card.id));
        writeJSON(KEYS.cards, cards);
        writeJSON(KEYS.sensation, sensationCards);
        pruneDrawTags();
        resetBag();
        resetSensationBag();
        selectedIds.clear();
        selectMode = false;
        renderLibrary();
        toast('已删除 ' + total + ' 张字卡');
      }
    );
  }

  function batchMove() {
    if (!selectedIds.size) { toast('先选中要移动的字卡'); return; }
    const select = $('#batchMoveSelect');
    const tag = select ? select.value : '';
    if (!tag) { toast('先选择一个目标标签'); return; }

    const total = selectedIds.size;
    allCards().forEach((card) => {
      if (selectedIds.has(card.id)) card.tag = tag;
    });

    writeJSON(KEYS.cards, cards);
    writeJSON(KEYS.sensation, sensationCards);
    pruneDrawTags();
    resetBag();
    resetSensationBag();
    selectedIds.clear();
    renderLibrary();
    toast('已把 ' + total + ' 张字卡移到「' + tag + '」');
  }

  function deleteCard(id) {
    const card = findCard(id);
    if (!card) return;

    if (card.kind === 'sensation') {
      sensationCards = sensationCards.filter((item) => item.id !== id);
      writeJSON(KEYS.sensation, sensationCards);
      resetSensationBag();
    } else {
      cards = cards.filter((item) => item.id !== id);
      writeJSON(KEYS.cards, cards);
      pruneDrawTags();
      resetBag();
    }

    selectedIds.delete(id);
    renderLibrary();

    const preview = card.text.length > 20 ? card.text.slice(0, 20) + '…' : card.text;
    toast('已删除「' + preview + '」');
  }

  /* =========================================================
     新建 / 编辑字卡
     ========================================================= */

  function openCardDialog(id = null) {
    editingId = id || null;
    const card = editingId ? findCard(editingId) : null;
    editingKind = card ? card.kind : activeKind;

    const kindLabel = editingKind === 'sensation' ? '体感' : '日常';
    $('#cardDialogTitle').textContent = (card ? '编辑' : '新建') + kindLabel + '字卡';

    const fallbackTag = editingKind === 'sensation' ? '体感' : '日常';
    $('#cardText').value = card ? card.text : '';
    $('#cardTag').value = card ? card.tag : (libFilter.tag !== 'all' ? libFilter.tag : fallbackTag);
    $('#cardTagHelp').textContent = editingKind === 'sensation'
      ? '体感字卡独立于日常字卡，只用于体感弹窗。留空则归入「体感」。'
      : '标签用于分类筛选，也可以限定抽卡池。留空则归入「日常」。';
    $('#cardText').placeholder = editingKind === 'sensation'
      ? '写下梦角传来的身体感觉，例如：后颈忽然一凉…'
      : '写下梦角会对你说的那句话…';
    $('#cardTextError').textContent = '';
    $('#cardTextCount').textContent = (card ? card.text.length : 0) + ' / 200';

    updateCardPreview();
    updateTagSuggestions();
    openDialog($('#cardDialog'));

    window.setTimeout(() => $('#cardText').focus(), 90);
  }

  function updateCardPreview() {
    const text = $('#cardText').value.trim();
    const fallbackTag = editingKind === 'sensation' ? '体感' : '日常';
    const tag = $('#cardTag').value.trim() || fallbackTag;

    $('#previewText').textContent = personalize(text || '你的字卡会出现在这里。');
    $('#previewTag').textContent = tag.slice(0, 12);
    $('#cardTextCount').textContent = $('#cardText').value.length + ' / 200';
  }

  function saveCard(event) {
    event.preventDefault();

    const text = $('#cardText').value.trim();
    const fallbackTag = editingKind === 'sensation' ? '体感' : '日常';
    const tag = clampText($('#cardTag').value, 12) || fallbackTag;

    if (!text) {
      $('#cardTextError').textContent = '写点什么吧，字卡不能是空的。';
      $('#cardText').focus();
      return;
    }

    $('#cardTextError').textContent = '';

    if (editingId) {
      const card = findCard(editingId);
      if (card) {
        card.text = text.slice(0, 200);
        card.tag = tag;
      }
      toast('字卡已更新');
    } else {
      const card = {
        id: uid(),
        text: text.slice(0, 200),
        tag,
        kind: editingKind,
        createdAt: Date.now()
      };
      if (editingKind === 'sensation') sensationCards.push(card);
      else cards.push(card);
      toast(editingKind === 'sensation' ? '体感字卡已加入弹窗池' : '字卡已加入抽卡池');
    }

    editingId = null;
    editingKind = 'daily';
    writeJSON(KEYS.cards, cards);
    writeJSON(KEYS.sensation, sensationCards);
    resetBag();
    resetSensationBag();
    $('#cardDialog').close();
    renderLibrary();
    updatePoolHint();
  }

  /* =========================================================
     设定
     ========================================================= */

  function openSettings() {
    $('#setCharName').value = settings.charName;
    $('#setCharTitle').value = settings.charTitle;
    $('#setMyName').value = settings.myName;

    const speedRadio = $('input[name="speed"][value="' + settings.speed + '"]');
    if (speedRadio) speedRadio.checked = true;

    const fontRadio = $('input[name="fontScale"][value="' + String(settings.fontScale) + '"]');
    if (fontRadio) fontRadio.checked = true;
    $$('input[name="fontScale"]').forEach((input) => {
      if (input !== fontRadio) input.checked = false;
    });

    $('#setAvoidRepeat').checked = settings.avoidRepeat;
    $('#setProactive').checked = settings.proactive;
    $('#setSensation').checked = settings.sensationPopup;
    const statusInput = $('#statusAddInput');
    if (statusInput) statusInput.value = '';

    statusDraft = settings.statusPool.slice();
    renderStatusPoolEditor();
    renderDrawTags();
    applyAvatar();
    openDialog($('#settingsDialog'));
  }

  function renderStatusPoolEditor() {
    const list = $('#statusPoolList');
    if (!list) return;

    list.innerHTML = '';

    if (!statusDraft.length) {
      const empty = document.createElement('p');
      empty.className = 'status-empty';
      empty.textContent = '卡池是空的，至少留下一个状态吧。';
      list.appendChild(empty);
    }

    statusDraft.forEach((status, index) => {
      const row = document.createElement('div');
      row.className = 'status-row';

      const input = document.createElement('input');
      input.className = 'input';
      input.maxLength = 20;
      input.value = status;
      input.setAttribute('aria-label', '状态 ' + (index + 1));
      input.addEventListener('input', () => {
        statusDraft[index] = input.value;
      });

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'status-del';
      del.textContent = '✕';
      del.setAttribute('aria-label', '删除这个状态');
      del.addEventListener('click', () => {
        statusDraft.splice(index, 1);
        renderStatusPoolEditor();
      });

      row.append(input, del);
      list.appendChild(row);
    });

    const hint = $('#statusPoolHint');
    if (hint) hint.textContent = '共 ' + statusDraft.length + ' 个状态 · 随机抽取';
  }

  function addStatusFromInput() {
    const input = $('#statusAddInput');
    if (!input) return;
    const value = clampText(input.value, 20);
    if (!value) { input.focus(); return; }
    if (statusDraft.includes(value)) { toast('这个状态已经在卡池里了'); return; }
    statusDraft.push(value);
    input.value = '';
    renderStatusPoolEditor();
    input.focus();
  }

  function renderDrawTags() {
    const container = $('#drawTags');
    container.innerHTML = '';

    const tags = getTags('daily');
    if (!tags.length) {
      const hint = document.createElement('span');
      hint.className = 'none-hint';
      hint.textContent = '字卡库还是空的，先去添加字卡吧。';
      container.appendChild(hint);
      refreshDrawPoolHint();
      return;
    }

    tags.forEach(({ tag, count }) => {
      const label = document.createElement('label');
      label.className = 'tag-check';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = tag;
      input.checked = settings.drawTags.includes(tag);
      input.addEventListener('change', refreshDrawPoolHint);

      const text = document.createElement('span');
      text.textContent = tag + ' · ' + count;

      label.append(input, text);
      container.appendChild(label);
    });

    refreshDrawPoolHint();
  }

  function refreshDrawPoolHint() {
    const selected = $$('#drawTags input:checked').map((input) => input.value);
    let count = cards.length;
    if (selected.length) count = cards.filter((card) => selected.includes(card.tag)).length;

    $('#drawPoolHint').textContent = selected.length
      ? '已选 ' + selected.length + ' 个标签 · ' + count + ' 张可用'
      : '不选 = 全部字卡 · ' + count + ' 张可用';
  }

  function saveSettings(event) {
    event.preventDefault();

    const selectedTags = $$('#drawTags input:checked').map((input) => input.value);
    const speedInput = $('input[name="speed"]:checked');
    const fontInput = $('input[name="fontScale"]:checked');

    let nextStatusPool = statusDraft
      .map((status) => clampText(status, 20))
      .filter(Boolean)
      .filter((status, index, list) => list.indexOf(status) === index);
    if (!nextStatusPool.length) nextStatusPool = [DEFAULT_STATUS_POOL[0]];

    const previousStatus = settings.status;
    const nextFont = fontInput ? Number(fontInput.value) : (Number(settings.fontScale) || 1);

    settings = {
      charName: clampText($('#setCharName').value, 16) || DEFAULT_SETTINGS.charName,
      charTitle: clampText($('#setCharTitle').value, 30) || DEFAULT_SETTINGS.charTitle,
      myName: clampText($('#setMyName').value, 16) || DEFAULT_SETTINGS.myName,
      speed: speedInput ? speedInput.value : 'normal',
      avoidRepeat: $('#setAvoidRepeat').checked,
      drawTags: selectedTags,
      avatar: settings.avatar || '',
      fontScale: nextFont,
      statusPool: nextStatusPool,
      status: nextStatusPool.includes(previousStatus) ? previousStatus : nextStatusPool[0],
      proactive: $('#setProactive').checked,
      sensationPopup: $('#setSensation').checked
    };

    writeJSON(KEYS.settings, settings);
    applySettings();
    renderChat();
    renderLibrary();
    resetBag();
    resetSensationBag();
    $('#settingsDialog').close();
    restartPresenceTimers();

    if (!eligibleCards().length) {
      toast('当前抽卡池是空的，请调整标签或添加字卡');
    } else {
      toast('设定已保存');
    }
  }

  /* =========================================================
     导入 / 导出
     ========================================================= */

  function dedupeKey(card) {
    return (card.kind === 'sensation' ? 'sensation' : 'daily') + '|' + card.tag + '|' + card.text.replace(/\s+/g, ' ').trim();
  }

  function parseImportText(raw, defaultKind = 'daily') {
    const source = String(raw || '').trim();
    const kind = defaultKind === 'sensation' ? 'sensation' : 'daily';
    if (!source) return { cards: [], error: '还没有粘贴内容。' };

    if (source.startsWith('[') || source.startsWith('{')) {
      try {
        const data = JSON.parse(source);
        let list = null;
        let sensationList = null;

        if (Array.isArray(data)) {
          list = data;
        } else if (data && typeof data === 'object') {
          if (Array.isArray(data.cards)) list = data.cards;
          if (Array.isArray(data.sensationCards)) sensationList = data.sensationCards;
        }

        if (!list && !sensationList) return { cards: [], error: 'JSON 格式不正确：需要字卡数组。' };

        const parsed = []
          .concat((list || []).map((item) => normalizeCard(item, kind)).filter(Boolean))
          .concat((sensationList || []).map((item) => normalizeCard(item, 'sensation')).filter(Boolean));

        if (!parsed.length) return { cards: [], error: 'JSON 里没有找到有效的字卡。' };
        return { cards: parsed, error: '' };
      } catch (error) {
        return { cards: [], error: 'JSON 解析失败，请检查格式。' };
      }
    }

    const parsed = [];
    const fallbackTag = kind === 'sensation' ? '体感' : '日常';
    let currentTag = fallbackTag;

    source.split(/\r?\n/).forEach((line) => {
      let value = line.trim();
      if (!value || value.startsWith('//')) return;

      if (value.startsWith('#') && !value.includes('|') && !value.includes('｜')) {
        const tag = value.replace(/^#+\s*/, '').trim();
        if (tag) currentTag = tag.slice(0, 12);
        return;
      }

      let tag = currentTag;
      const match = value.match(/^(.{1,12}?)\s*[|｜]\s*(.+)$/);
      if (match) {
        tag = match[1].replace(/^#+\s*/, '').trim() || currentTag;
        value = match[2].trim();
      }

      value = value.replace(/^["“”']+|["“”']+$/g, '').trim();
      if (!value) return;

      parsed.push({
        id: uid(),
        text: value.slice(0, 200),
        tag: tag.slice(0, 12) || fallbackTag,
        kind,
        createdAt: Date.now()
      });
    });

    if (!parsed.length) return { cards: [], error: '没有解析到有效字卡，请检查格式。' };
    return { cards: parsed, error: '' };
  }

  function openImport() {
    $('#importText').value = '';
    $('#importFile').value = '';
    $('#importHint').textContent = '支持 .txt 与 .json（本应用导出的 JSON 可直接再导入）。纯文本会导入到当前打开的'
      + (activeKind === 'sensation' ? '体感' : '日常') + '字卡库。';
    $('#importHint').style.color = '';
    const append = $('input[name="importMode"][value="append"]');
    if (append) append.checked = true;
    openDialog($('#importDialog'));
  }

  function handleImport(event) {
    event.preventDefault();

    const hint = $('#importHint');
    const result = parseImportText($('#importText').value, activeKind);

    if (result.error) {
      hint.textContent = result.error;
      hint.style.color = '#ffaaaa';
      return;
    }

    hint.style.color = '';
    const modeInput = $('input[name="importMode"]:checked');
    const mode = modeInput ? modeInput.value : 'append';
    const seen = new Set();
    const unique = [];

    if (mode === 'append') {
      allCards().forEach((card) => seen.add(dedupeKey(card)));
    }

    result.cards.forEach((card) => {
      const key = dedupeKey(card);
      if (seen.has(key)) return;
      seen.add(key);
      unique.push(card);
    });

    if (!unique.length) {
      hint.textContent = '这些字卡都已经在字卡库里了。';
      hint.style.color = '#ffaaaa';
      return;
    }

    const importedDaily = unique.filter((card) => card.kind !== 'sensation');
    const importedSensation = unique.filter((card) => card.kind === 'sensation');
    const skipped = result.cards.length - unique.length;

    if (mode === 'replace') {
      $('#importDialog').close();
      askConfirm(
        '替换全部字卡？',
        '现有 ' + allCards().length + ' 张字卡将被替换为导入的 ' + unique.length + ' 张，此操作不可撤销。',
        '确认替换',
        () => {
          cards = importedDaily;
          sensationCards = importedSensation;
          writeJSON(KEYS.cards, cards);
          writeJSON(KEYS.sensation, sensationCards);
          pruneDrawTags();
          resetBag();
          resetSensationBag();
          renderLibrary();
          switchView('library');
          toast('已替换为 ' + unique.length + ' 张字卡');
        }
      );
      return;
    }

    cards = cards.concat(importedDaily);
    sensationCards = sensationCards.concat(importedSensation);
    writeJSON(KEYS.cards, cards);
    writeJSON(KEYS.sensation, sensationCards);
    resetBag();
    resetSensationBag();
    $('#importDialog').close();
    renderLibrary();
    switchView('library');
    toast('导入 ' + unique.length + ' 张字卡' + (skipped ? '，跳过 ' + skipped + ' 张重复' : ''));
  }

  function readImportFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      $('#importText').value = String(reader.result || '');
      const hint = $('#importHint');
      hint.textContent = '已读取 ' + file.name + '（' + (file.size / 1024).toFixed(1) + ' KB）';
      hint.style.color = '';
    });
    reader.addEventListener('error', () => toast('读取文件失败'));
    reader.readAsText(file, 'utf-8');
  }

  function buildExportJSON() {
    return JSON.stringify({
      app: '镜魇 · 字卡传讯',
      version: 2,
      exportedAt: new Date().toISOString(),
      cards: cards.map((card) => ({ kind: 'daily', tag: card.tag, text: card.text })),
      sensationCards: sensationCards.map((card) => ({ kind: 'sensation', tag: card.tag, text: card.text }))
    }, null, 2);
  }

  function openExport() {
    $('#exportSummary').textContent = allCards().length
      ? '日常 ' + cards.length + ' 张 · 体感 ' + sensationCards.length + ' 张；抽卡池 '
        + eligibleCards().length + ' 张；' + getAllTags().length + ' 个标签。'
      : '字卡库现在是空的，先写几张再导出吧。';
    $('#exportHint').textContent = 'JSON 会同时导出日常与体感字卡，可以再次导入，也可以分享给同好；TXT 只导出当前打开的字卡库。';
    $('#exportHint').style.color = '';
    openDialog($('#exportDialog'));
  }

  function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  function todayStamp() {
    const now = new Date();
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  }

  function exportJSON() {
    downloadFile('镜魇字卡_' + todayStamp() + '.json', buildExportJSON(), 'application/json;charset=utf-8');
    $('#exportHint').textContent = 'JSON 已开始下载。';
  }

  function exportTXT() {
    const source = cardsOf(activeKind);
    const content = source
      .map((card) => card.tag + ' | ' + card.text.replace(/\r?\n/g, ' '))
      .join('\n');
    downloadFile('镜魇字卡_' + (activeKind === 'sensation' ? '体感_' : '日常_') + todayStamp() + '.txt', content, 'text/plain;charset=utf-8');
    $('#exportHint').textContent = 'TXT 已开始下载（仅当前字卡库）。多行字卡会合并为一行，需要完整保留请用 JSON。';
  }

  async function copyJSON() {
    const content = buildExportJSON();
    let ok = false;

    try {
      await navigator.clipboard.writeText(content);
      ok = true;
    } catch (error) {
      const area = document.createElement('textarea');
      area.value = content;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try { ok = document.execCommand('copy'); } catch (copyError) { ok = false; }
      area.remove();
    }

    $('#exportHint').textContent = ok ? 'JSON 已复制到剪贴板。' : '复制失败，请改用下载。';
    $('#exportHint').style.color = ok ? '' : '#ffaaaa';
    if (ok) toast('已复制 JSON');
  }

  /* =========================================================
     弹窗 / Toast
     ========================================================= */

  function openDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  }

  function askConfirm(title, text, okLabel, callback) {
    $('#confirmTitle').textContent = title;
    $('#confirmText').textContent = text;
    $('#confirmOk').textContent = okLabel;
    confirmCallback = callback;
    openDialog($('#confirmDialog'));
  }

  function toast(message) {
    const root = $('#toastRoot');
    const item = document.createElement('div');
    item.className = 'toast';
    item.textContent = message;
    root.appendChild(item);

    window.setTimeout(() => {
      item.classList.add('out');
      window.setTimeout(() => item.remove(), 280);
    }, 2600);
  }

  /* =========================================================
     视图切换
     ========================================================= */

  function switchView(view) {
    const isChat = view !== 'library';

    $('#viewChat').classList.toggle('active', isChat);
    $('#viewLibrary').classList.toggle('active', !isChat);

    $$('.nav-btn').forEach((button) => {
      button.classList.toggle('active', button.dataset.view === (isChat ? 'chat' : 'library'));
    });

    if (isChat) {
      if (!messages.length) renderChat();
      scrollToBottom();
    } else {
      renderLibrary();
      $('#libScroll').scrollTop = 0;
    }
  }

  /* =========================================================
     星空
     ========================================================= */

  function spawnStars() {
    const sky = $('#sky');
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < 84; i += 1) {
      const star = document.createElement('span');
      const size = (Math.random() * 1.8 + 0.6).toFixed(2);
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.left = (Math.random() * 100).toFixed(2) + '%';
      star.style.top = (Math.random() * 100).toFixed(2) + '%';
      star.style.animationDelay = (Math.random() * 5).toFixed(2) + 's';
      star.style.animationDuration = (3.6 + Math.random() * 4).toFixed(2) + 's';
      star.style.opacity = (0.18 + Math.random() * 0.5).toFixed(2);
      fragment.appendChild(star);
    }

    sky.appendChild(fragment);
  }

  /* =========================================================
     事件绑定
     ========================================================= */

  function bindEvents() {
    $$('.nav-btn').forEach((button) => {
      button.addEventListener('click', () => switchView(button.dataset.view));
    });

    $('#openSettingsBtn').addEventListener('click', openSettings);
    $('#chatSettingsBtn').addEventListener('click', openSettings);
    $('#chatLibraryBtn').addEventListener('click', () => switchView('library'));
    $('#continueBtn').addEventListener('click', continueReply);

    const fontBtn = $('#fontBtn');
    if (fontBtn) fontBtn.addEventListener('click', cycleFontScale);

    const sensationBtn = $('#sensationBtn');
    if (sensationBtn) sensationBtn.addEventListener('click', () => showSensation(false));

    /* 头像 */
    const avatarBtn = $('#avatarBtn');
    if (avatarBtn) avatarBtn.addEventListener('click', pickAvatar);

    const pickBtn = $('#pickAvatarBtn');
    if (pickBtn) pickBtn.addEventListener('click', pickAvatar);

    const clearBtn = $('#clearAvatarBtn');
    if (clearBtn) clearBtn.addEventListener('click', clearAvatar);

    const avatarFile = $('#avatarFile');
    if (avatarFile) {
      avatarFile.addEventListener('change', async (event) => {
        const file = event.target.files && event.target.files[0];
        event.target.value = '';
        await handleAvatarPick(file);
      });
    }

    /* 回复栏 */
    const replyBarClose = $('#replyBarClose');
    if (replyBarClose) replyBarClose.addEventListener('click', clearPendingReply);

    $('#composer').addEventListener('submit', (event) => {
      event.preventDefault();
      handleSend();
    });

    const input = $('#messageInput');
    input.addEventListener('input', () => autoGrow(input));
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        $('#composer').requestSubmit();
      }
      if (event.key === 'Escape' && pendingReply) {
        event.preventDefault();
        clearPendingReply();
      }
    });

    $('#newCardBtn').addEventListener('click', () => openCardDialog());
    $('#emptyAddBtn').addEventListener('click', () => openCardDialog());
    $('#importBtn').addEventListener('click', openImport);
    $('#exportBtn').addEventListener('click', openExport);

    $$('#libKinds .kind-btn').forEach((button) => {
      button.addEventListener('click', () => setActiveKind(button.dataset.kind));
    });

    const selectModeBtn = $('#selectModeBtn');
    if (selectModeBtn) selectModeBtn.addEventListener('click', () => setSelectMode(!selectMode));

    const selectAllBtn = $('#selectAllBtn');
    if (selectAllBtn) selectAllBtn.addEventListener('click', selectAllVisible);

    const selectAllAllBtn = $('#selectAllAllBtn');
    if (selectAllAllBtn) selectAllAllBtn.addEventListener('click', selectAllCards);

    const batchMoveBtn = $('#batchMoveBtn');
    if (batchMoveBtn) batchMoveBtn.addEventListener('click', batchMove);

    const batchDeleteBtn = $('#batchDeleteBtn');
    if (batchDeleteBtn) batchDeleteBtn.addEventListener('click', batchDelete);

    const batchExitBtn = $('#batchExitBtn');
    if (batchExitBtn) batchExitBtn.addEventListener('click', () => setSelectMode(false));

    const statusAddBtn = $('#statusAddBtn');
    if (statusAddBtn) statusAddBtn.addEventListener('click', addStatusFromInput);

    const statusAddInput = $('#statusAddInput');
    if (statusAddInput) {
      statusAddInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          addStatusFromInput();
        }
      });
    }

    $$('[data-sensation]').forEach((button) => {
      button.addEventListener('click', closeSensation);
    });

    const sensationOverlay = $('#sensationOverlay');
    if (sensationOverlay) {
      sensationOverlay.addEventListener('click', (event) => {
        if (event.target === sensationOverlay) closeSensation();
      });
    }

    $('#cardForm').addEventListener('submit', saveCard);
    $('#settingsForm').addEventListener('submit', saveSettings);
    $('#importForm').addEventListener('submit', handleImport);

    $('#cardText').addEventListener('input', updateCardPreview);
    $('#cardTag').addEventListener('input', updateCardPreview);

    $('#importFile').addEventListener('change', readImportFile);

    $('#cardSearch').addEventListener('input', (event) => {
      libFilter.query = event.target.value;
      renderCardGrid();
    });

    $('#exportJsonBtn').addEventListener('click', exportJSON);
    $('#exportTxtBtn').addEventListener('click', exportTXT);
    $('#copyJsonBtn').addEventListener('click', copyJSON);
    $('#exportForm').addEventListener('submit', (event) => event.preventDefault());

    $('#clearChatBtn').addEventListener('click', () => {
      askConfirm(
        '清空聊天记录？',
        '你和' + settings.charName + '之间保存的所有消息都会被删除，字卡库不会受影响。',
        '清空聊天',
        () => {
          const settingsDialog = $('#settingsDialog');
          if (settingsDialog.open) settingsDialog.close();
          messages = [];
          pendingReply = null;
          updateReplyBar();
          writeJSON(KEYS.chat, messages);
          renderChat();
          toast('聊天记录已清空');
        }
      );
    });

    $('#resetCardsBtn').addEventListener('click', () => {
      askConfirm(
        '清空字卡库？',
        '日常 ' + cards.length + ' 张、体感 ' + sensationCards.length + ' 张字卡会被全部删除，聊天记录不会受影响。此操作不可撤销。',
        '清空字卡',
        () => {
          const settingsDialog = $('#settingsDialog');
          if (settingsDialog.open) settingsDialog.close();
          cards = [];
          sensationCards = [];
          settings.drawTags = [];
          selectMode = false;
          selectedIds.clear();
          writeJSON(KEYS.cards, cards);
          writeJSON(KEYS.sensation, sensationCards);
          writeJSON(KEYS.settings, settings);
          resetBag();
          resetSensationBag();
          renderLibrary();
          updateCounts();
          updatePoolHint();
          toast('字卡库已清空');
        }
      );
    });

    $('#confirmOk').addEventListener('click', () => {
      const callback = confirmCallback;
      confirmCallback = null;
      $('#confirmDialog').close();
      if (callback) callback();
    });

    $('#confirmCancel').addEventListener('click', () => {
      confirmCallback = null;
      $('#confirmDialog').close();
    });

    $('#confirmDialog').addEventListener('close', () => {
      confirmCallback = null;
    });

    $$('[data-close]').forEach((button) => {
      button.addEventListener('click', () => {
        const dialog = button.closest('dialog');
        if (dialog) dialog.close();
      });
    });

    $$('dialog.modal').forEach((dialog) => {
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) dialog.close();
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      const overlay = $('#sensationOverlay');
      if (overlay && !overlay.hidden) closeSensation();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        updatePoolHint();
        if (settings.proactive) scheduleProactiveNext(25000 + Math.random() * 40000);
      }
    });
  }

  /* =========================================================
     PWA
     ========================================================= */

  let installPrompt = null;

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches
      || window.matchMedia('(display-mode: minimal-ui)').matches
      || window.navigator.standalone === true;
  }

  function isIos() {
    const ua = navigator.userAgent || '';
    return /iPad|iPhone|iPod/.test(ua)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function isMobile() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
  }

  function setInstallVisible(visible) {
    const button = $('#installBtn');
    if (button) button.hidden = !visible;
  }

  function setupInstall() {
    const button = $('#installBtn');
    if (!button) return;

    if (isStandalone()) { setInstallVisible(false); return; }
    if (isIos() || isMobile()) setInstallVisible(true);

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      installPrompt = event;
      setInstallVisible(true);
    });

    window.addEventListener('appinstalled', () => {
      installPrompt = null;
      setInstallVisible(false);
      toast('已经装到桌面了');
    });

    button.addEventListener('click', async () => {
      if (!installPrompt) { openDialog($('#installDialog')); return; }
      installPrompt.prompt();
      try { await installPrompt.userChoice; } catch (error) { /* 忽略 */ }
      installPrompt = null;
      setInstallVisible(false);
    });
  }

  function registerOffline() {
    if (!('serviceWorker' in navigator)) return;
    if (!/^https?:$/.test(location.protocol)) return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }

  /* =========================================================
     启动
     ========================================================= */

  function init() {
    const knownTags = new Set(cards.map((card) => card.tag));
    settings.drawTags = settings.drawTags.filter((tag) => knownTags.has(tag));

    spawnStars();
    applySettings();
    updateCounts();
    renderChat();
    renderLibrary();
    bindEvents();
    setupInstall();
    registerOffline();
    writeJSON(KEYS.cards, cards);
    writeJSON(KEYS.sensation, sensationCards);
    restartPresenceTimers();

    window.setTimeout(() => {
      if (messages.length) scrollToBottom();
    }, 60);
  }

  init();
})();