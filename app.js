(() => {
  'use strict';

  /* =========================================================
     基础数据
     ========================================================= */

  const KEYS = {
    cards: 'jingyan.cards.v1',
    settings: 'jingyan.settings.v1',
    chat: 'jingyan.chat.v1'
  };

  const DEFAULT_SETTINGS = {
    charName: '沈砚',
    charTitle: '住在镜子背面的人',
    myName: '你',
    speed: 'normal',
    avoidRepeat: true,
    drawTags: []
  };

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

  function normalizeCard(input) {
    if (!input) return null;

    if (typeof input === 'string') {
      const text = clampText(input, 200);
      if (!text) return null;
      return { id: uid(), text, tag: '日常', createdAt: Date.now() };
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

    return {
      id: typeof input.id === 'string' && input.id ? input.id : uid(),
      text,
      tag: clampText(rawTag, 12) || '日常',
      createdAt: Number(input.createdAt) || Date.now()
    };
  }

  function loadCards() {
    const raw = readJSON(KEYS.cards, []);
    if (!Array.isArray(raw)) return [];
    return raw.map(normalizeCard).filter(Boolean);
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

    return settings;
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

  /* =========================================================
     状态
     ========================================================= */

  let cards = loadCards();
  let settings = loadSettings();
  let messages = loadMessages();

  let bag = [];
  let busy = false;
  let editingId = null;
  let confirmCallback = null;
  let libFilter = { tag: 'all', query: '' };

  /* =========================================================
     UI 基础
     ========================================================= */

  function applySettings() {
    $('#charNameLabel').textContent = settings.charName;
    $('#chatName').textContent = settings.charName;
    $('#charTitleLabel').textContent = settings.charTitle;
    $('#chatSub').textContent = settings.charTitle;
    $('#charStatus').textContent = '在等你的消息';
    $('#messageInput').placeholder = '想对' + settings.charName + '说点什么…';

    updatePoolHint();
  }

  function updatePoolHint() {
    const count = eligibleCards().length;
    $('#poolHint').textContent = String(count);
  }

  function updateCounts() {
    $('#navCardCount').textContent = String(cards.length);
    $('#librarySummary').textContent = '共 ' + cards.length + ' 张字卡 · 抽卡池 ' + eligibleCards().length + ' 张';
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
      $('#charStatus').textContent = '我想说…';
      $('#chatSub').textContent = '我想说…';
    } else {
      $('#charStatus').textContent = '在等你的消息';
      $('#chatSub').textContent = settings.charTitle;
    }
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

  function resetBag() {
    bag = [];
  }

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

  function getDelay(length) {
    const base = settings.speed === 'fast' ? 380 : settings.speed === 'slow' ? 1500 : 800;
    const extra = Math.min(1000, length * 24);
    return base + extra + Math.random() * 260;
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
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.textContent = message.text;
      wrap.append(meta, bubble);
      return wrap;
    }

    meta.textContent = '镜中来信 · ' + timeLabel(message.ts);
    wrap.append(meta, buildCardElement(message));

    const actions = document.createElement('div');
    actions.className = 'msg-actions';
    const redraw = document.createElement('button');
    redraw.type = 'button';
    redraw.className = 'text-btn';
    redraw.textContent = '↻ 换一张';
    redraw.addEventListener('click', () => redrawMessage(message, wrap, redraw));
    actions.appendChild(redraw);
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

  function appendMessage(message) {
    messages.push(message);
    writeJSON(KEYS.chat, messages);

    const list = $('#chatList');
    const welcome = $('.welcome', list);
    if (welcome) welcome.remove();

    list.appendChild(renderMessage(message));
    scrollToBottom(true);
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
    scrollToBottom(true);
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

    if (!card) {
      toast('抽卡池里没有可用的字卡');
      return;
    }

    message.text = card.text;
    message.tag = card.tag;
    message.cardId = card.id;
    message.no = cards.findIndex((item) => item.id === card.id) + 1;
    message.ts = Date.now();
    writeJSON(KEYS.chat, messages);

    const oldCard = $('.card', wrap);
    if (oldCard) oldCard.replaceWith(buildCardElement(message));

    const meta = $('.msg-meta', wrap);
    if (meta) meta.textContent = '镜中来信 · ' + timeLabel(message.ts);

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
    if (!text) {
      input.focus();
      return;
    }

    busy = true;
    $('#sendBtn').disabled = true;
    input.value = '';
    autoGrow(input);

    appendMessage({
      id: uid(),
      role: 'user',
      text,
      ts: Date.now()
    });

    setBusyUI(true);

    const totalDelay = getDelay(text.length);
    const firstWait = Math.min(260, totalDelay * 0.25);
    await sleep(firstWait);
    showTyping();
    await sleep(Math.max(120, totalDelay - firstWait));
    removeTyping();

    const card = drawCard();

    if (card) {
      appendMessage({
        id: uid(),
        role: 'card',
        text: card.text,
        tag: card.tag,
        cardId: card.id,
        no: cards.findIndex((item) => item.id === card.id) + 1,
        ts: Date.now()
      });
    } else {
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
    }

    busy = false;
    $('#sendBtn').disabled = false;
    setBusyUI(false);
    updatePoolHint();
    input.focus({ preventScroll: true });
  }

  /* =========================================================
     字卡库
     ========================================================= */

  function getTags() {
    const counts = new Map();
    cards.forEach((card) => {
      counts.set(card.tag, (counts.get(card.tag) || 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'))
      .map(([tag, count]) => ({ tag, count }));
  }

  function renderTagFilter() {
    const container = $('#tagFilter');
    container.innerHTML = '';

    if (libFilter.tag !== 'all' && !cards.some((card) => card.tag === libFilter.tag)) {
      libFilter.tag = 'all';
    }

    const all = document.createElement('button');
    all.type = 'button';
    all.className = 'chip' + (libFilter.tag === 'all' ? ' active' : '');
    all.textContent = '全部';
    const allCount = document.createElement('span');
    allCount.className = 'chip-count';
    allCount.textContent = String(cards.length);
    all.appendChild(allCount);
    all.addEventListener('click', () => {
      libFilter.tag = 'all';
      renderTagFilter();
      renderCardGrid();
    });
    container.appendChild(all);

    getTags().forEach(({ tag, count }) => {
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

    grid.innerHTML = '';

    const query = libFilter.query.trim().toLowerCase();
    const filtered = cards.filter((card) => {
      const matchTag = libFilter.tag === 'all' || card.tag === libFilter.tag;
      const matchQuery = !query
        || card.text.toLowerCase().includes(query)
        || card.tag.toLowerCase().includes(query);
      return matchTag && matchQuery;
    });

    empty.hidden = filtered.length > 0;
    if (!filtered.length) {
      $('#libEmptyText').textContent = cards.length
        ? '没有找到匹配的字卡，换个关键词或标签试试。'
        : '新建一张字卡，或从文本 / JSON 批量导入。';
    }

    filtered.forEach((card) => {
      const number = cards.findIndex((item) => item.id === card.id) + 1;

      const item = document.createElement('article');
      item.className = 'lib-card';

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
  }

  function renderLibrary() {
    renderTagFilter();
    renderCardGrid();
    updateCounts();
    updateTagSuggestions();
  }

  function updateTagSuggestions() {
    const datalist = $('#tagSuggestions');
    datalist.innerHTML = '';
    getTags().forEach(({ tag }) => {
      const option = document.createElement('option');
      option.value = tag;
      datalist.appendChild(option);
    });
  }

  function deleteCard(id) {
    const card = cards.find((item) => item.id === id);
    if (!card) return;

    cards = cards.filter((item) => item.id !== id);
    writeJSON(KEYS.cards, cards);
    pruneDrawTags();
    resetBag();
    renderLibrary();

    const preview = card.text.length > 20 ? card.text.slice(0, 20) + '…' : card.text;
    toast('已删除「' + preview + '」');
  }

  /* =========================================================
     新建 / 编辑字卡
     ========================================================= */

  function openCardDialog(id = null) {
    editingId = id || null;
    const card = editingId ? cards.find((item) => item.id === editingId) : null;

    $('#cardDialogTitle').textContent = card ? '编辑字卡' : '新建字卡';
    $('#cardText').value = card ? card.text : '';
    $('#cardTag').value = card ? card.tag : (libFilter.tag !== 'all' ? libFilter.tag : '');
    $('#cardTextError').textContent = '';
    $('#cardTextCount').textContent = (card ? card.text.length : 0) + ' / 200';

    updateCardPreview();
    updateTagSuggestions();
    openDialog($('#cardDialog'));

    window.setTimeout(() => $('#cardText').focus(), 90);
  }

  function updateCardPreview() {
    const text = $('#cardText').value.trim();
    const tag = $('#cardTag').value.trim() || '日常';

    $('#previewText').textContent = personalize(text || '你的字卡会出现在这里。');
    $('#previewTag').textContent = tag.slice(0, 12);
    $('#cardTextCount').textContent = $('#cardText').value.length + ' / 200';
  }

  function saveCard(event) {
    event.preventDefault();

    const text = $('#cardText').value.trim();
    const tag = clampText($('#cardTag').value, 12) || '日常';

    if (!text) {
      $('#cardTextError').textContent = '写点什么吧，字卡不能是空的。';
      $('#cardText').focus();
      return;
    }

    $('#cardTextError').textContent = '';

    if (editingId) {
      const card = cards.find((item) => item.id === editingId);
      if (card) {
        card.text = text.slice(0, 200);
        card.tag = tag;
      }
      toast('字卡已更新');
    } else {
      cards.push({
        id: uid(),
        text: text.slice(0, 200),
        tag,
        createdAt: Date.now()
      });
      toast('字卡已加入抽卡池');
    }

    editingId = null;
    writeJSON(KEYS.cards, cards);
    resetBag();
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

    $('#setAvoidRepeat').checked = settings.avoidRepeat;

    renderDrawTags();
    openDialog($('#settingsDialog'));
  }

  function renderDrawTags() {
    const container = $('#drawTags');
    container.innerHTML = '';

    const tags = getTags();
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

    if (selected.length) {
      count = cards.filter((card) => selected.includes(card.tag)).length;
    }

    $('#drawPoolHint').textContent = selected.length
      ? '已选 ' + selected.length + ' 个标签 · ' + count + ' 张可用'
      : '不选 = 全部字卡 · ' + count + ' 张可用';
  }

  function saveSettings(event) {
    event.preventDefault();

    const selectedTags = $$('#drawTags input:checked').map((input) => input.value);
    const speedInput = $('input[name="speed"]:checked');

    settings = {
      charName: clampText($('#setCharName').value, 16) || DEFAULT_SETTINGS.charName,
      charTitle: clampText($('#setCharTitle').value, 30) || DEFAULT_SETTINGS.charTitle,
      myName: clampText($('#setMyName').value, 16) || DEFAULT_SETTINGS.myName,
      speed: speedInput ? speedInput.value : 'normal',
      avoidRepeat: $('#setAvoidRepeat').checked,
      drawTags: selectedTags
    };

    writeJSON(KEYS.settings, settings);
    applySettings();
    renderChat();
    renderLibrary();
    resetBag();
    $('#settingsDialog').close();

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
    return card.tag + '|' + card.text.replace(/\s+/g, ' ').trim();
  }

  function parseImportText(raw) {
    const source = String(raw || '').trim();
    if (!source) return { cards: [], error: '还没有粘贴内容。' };

    if (source.startsWith('[') || source.startsWith('{')) {
      try {
        const data = JSON.parse(source);
        let list = null;

        if (Array.isArray(data)) list = data;
        else if (data && Array.isArray(data.cards)) list = data.cards;

        if (!list) return { cards: [], error: 'JSON 格式不正确：需要字卡数组。' };

        const parsed = list.map(normalizeCard).filter(Boolean);
        if (!parsed.length) return { cards: [], error: 'JSON 里没有找到有效的字卡。' };
        return { cards: parsed, error: '' };
      } catch (error) {
        return { cards: [], error: 'JSON 解析失败，请检查格式。' };
      }
    }

    const parsed = [];
    let currentTag = '日常';

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
        tag: tag.slice(0, 12) || '日常',
        createdAt: Date.now()
      });
    });

    if (!parsed.length) return { cards: [], error: '没有解析到有效字卡，请检查格式。' };
    return { cards: parsed, error: '' };
  }

  function openImport() {
    $('#importText').value = '';
    $('#importFile').value = '';
    $('#importHint').textContent = '支持 .txt 与 .json（本应用导出的 JSON 可直接再导入）。';
    $('#importHint').style.color = '';
    const append = $('input[name="importMode"][value="append"]');
    if (append) append.checked = true;
    openDialog($('#importDialog'));
  }

  function handleImport(event) {
    event.preventDefault();

    const hint = $('#importHint');
    const result = parseImportText($('#importText').value);

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
      cards.forEach((card) => seen.add(dedupeKey(card)));
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

    const skipped = result.cards.length - unique.length;

    if (mode === 'replace') {
      $('#importDialog').close();
      askConfirm(
        '替换全部字卡？',
        '现有 ' + cards.length + ' 张字卡将被替换为导入的 ' + unique.length + ' 张，此操作不可撤销。',
        '确认替换',
        () => {
          cards = unique;
          writeJSON(KEYS.cards, cards);
          pruneDrawTags();
          resetBag();
          renderLibrary();
          switchView('library');
          toast('已替换为 ' + cards.length + ' 张字卡');
        }
      );
      return;
    }

    cards = cards.concat(unique);
    writeJSON(KEYS.cards, cards);
    resetBag();
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
      version: 1,
      exportedAt: new Date().toISOString(),
      cards: cards.map((card) => ({ tag: card.tag, text: card.text }))
    }, null, 2);
  }

  function openExport() {
    $('#exportSummary').textContent = cards.length
      ? '共 ' + cards.length + ' 张字卡，抽卡池 ' + eligibleCards().length + ' 张，' + getTags().length + ' 个标签。'
      : '字卡库现在是空的，先写几张再导出吧。';
    $('#exportHint').textContent = '导出的 JSON 可以再次导入，也可以分享给同好。';
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
    const content = cards
      .map((card) => card.tag + ' | ' + card.text.replace(/\r?\n/g, ' '))
      .join('\n');
    downloadFile('镜魇字卡_' + todayStamp() + '.txt', content, 'text/plain;charset=utf-8');
    $('#exportHint').textContent = 'TXT 已开始下载。多行字卡会合并为一行，需要完整保留请用 JSON。';
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
      try {
        ok = document.execCommand('copy');
      } catch (copyError) {
        ok = false;
      }
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
    });

    $('#newCardBtn').addEventListener('click', () => openCardDialog());
    $('#emptyAddBtn').addEventListener('click', () => openCardDialog());
    $('#importBtn').addEventListener('click', openImport);
    $('#exportBtn').addEventListener('click', openExport);

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
          writeJSON(KEYS.chat, messages);
          renderChat();
          toast('聊天记录已清空');
        }
      );
    });

    $('#resetCardsBtn').addEventListener('click', () => {
      askConfirm(
        '清空字卡库？',
        '现有的 ' + cards.length + ' 张字卡会被全部删除，聊天记录不会受影响。此操作不可撤销。',
        '清空字卡',
        () => {
          const settingsDialog = $('#settingsDialog');
          if (settingsDialog.open) settingsDialog.close();
          cards = [];
          settings.drawTags = [];
          writeJSON(KEYS.cards, cards);
          writeJSON(KEYS.settings, settings);
          resetBag();
          renderLibrary();
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

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') updatePoolHint();
    });
  }

  /* =========================================================
     PWA：安装到桌面 / 离线可用
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

    if (isStandalone()) {
      setInstallVisible(false);
      return;
    }

    // iPhone 不会触发 beforeinstallprompt；安卓也常有提示延迟，手机上直接给出入口
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
      if (!installPrompt) {
        openDialog($('#installDialog'));
        return;
      }

      installPrompt.prompt();
      try {
        await installPrompt.userChoice;
      } catch (error) {
        /* 用户取消也算正常结束 */
      }
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

    window.setTimeout(() => {
      if (messages.length) scrollToBottom();
    }, 60);
  }

  init();
})();
