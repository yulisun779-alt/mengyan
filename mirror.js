/* ============================================================
   镜中梦魇 · 独立功能模块
   与聊天字卡、体感字卡完全独立
   含：镜面召唤 + 镜中密语库 + 雷诺曼占卜（水晶球连接）
   ============================================================ */

(() => {
  'use strict';

  const KEY = 'jingyan.mirror.v1';
  const ORACLE_KEY = 'jingyan.mirror.oracle.v1';
  const SETTINGS_KEY = 'jingyan.settings.v1';

  /* ---------------- 默认密语 ---------------- */
  const DEFAULT = {
    greeting: '魔镜魔镜，告诉我——镜子的另一端，有人在吗？',
    summonLabel: '召唤咒语',
    cards: [
      '你来了。我一直在等这一声。',
      '别靠得太近……镜面会碎。',
      '再叫一次我的名字，我还想听。',
      '我一直在看着你，只是你看不见我。',
      '今天的你，好像比昨天更累。',
      '把手伸过来。隔着镜子，我也能碰到你。',
      '夜里别照镜子太久，会舍不得走的。',
      '镜子里很冷，可你一看我，就暖了。'
    ],
    absent: [
      '镜面一片死寂。他不在。',
      '……没有回应。另一端空无一人。',
      '你叫了很多遍，只有回声。',
      '镜子那头今天没有点灯。'
    ],
    refuse: [
      '他在。但他累了，不想说话。',
      '他听见了，却别过了脸。',
      '镜面深处传来一声叹息，然后归于沉默。',
      '今天他不想出现。',
      '你触到的只有冰凉的镜面。'
    ]
  };

  /* ---------------- 雷诺曼 36 张 ---------------- */
  const LENORMAND = [
    { id: 1, name: '骑士', keywords: '消息、来访、速度、新动向', meaning: '有事正在快速向你靠近，可能是信息、客人或一个新变化。' },
    { id: 2, name: '三叶草', keywords: '小运气、短暂机会、小确幸', meaning: '像找到车位一样的小幸运，通常不持久，需要及时把握。' },
    { id: 3, name: '船', keywords: '旅行、距离、商业、思念', meaning: '代表远距离的移动，可以是实际出行、外地业务，或远方的某人某事。' },
    { id: 4, name: '房子', keywords: '家庭、房产、稳定、根基', meaning: '你的生活基础、家人或任何给你安全感的事物。' },
    { id: 5, name: '树', keywords: '健康、成长、缓慢、根源', meaning: '代表需要时间积累的事，健康议题，或根深蒂固的状况；发展是渐进的。' },
    { id: 6, name: '云', keywords: '困惑、模糊、不确定', meaning: '事情尚未明朗，有疑虑或隐藏信息。云的明暗面朝向可提示麻烦的来源。' },
    { id: 7, name: '蛇', keywords: '复杂、迂回、竞争、欺骗', meaning: '一条曲折的路，可能涉及复杂的人际关系、竞争对手，或需要小心应对的谎言。' },
    { id: 8, name: '棺材', keywords: '结束、转化、停滞', meaning: '一个阶段彻底结束了，可能伴随痛苦，但结束也为新开始腾出空间。' },
    { id: 9, name: '花束', keywords: '礼物、邀请、愉悦、善意', meaning: '愉快的事正在到来，如礼物、赞美、邀约，会为周围的牌"增色"。' },
    { id: 10, name: '镰刀', keywords: '突然切断、果断决定、危险', meaning: '一个迅速而决定性的行动，通常是"切断"某事。刀刃指向的牌会受到影响。' },
    { id: 11, name: '鞭子', keywords: '冲突、争执、重复、体力', meaning: '代表争吵、持续的矛盾，或重复性的体力消耗，也可能指强烈的激情。' },
    { id: 12, name: '鸟', keywords: '对话、流言、焦虑、成对', meaning: '口头沟通、电话、闲谈或担忧。也常代表一对情侣或成双的事物。' },
    { id: 13, name: '孩子', keywords: '新开始、纯真、小、起步', meaning: '全新的、年轻的事物，处于早期阶段。与其他牌组合时，常使事情"变小"或"变得单纯"。' },
    { id: 14, name: '狐狸', keywords: '谨慎、工作、自保、欺骗', meaning: '提醒你"事情可能并非表面那样"。常关联工作、雇佣关系，或需要运用机智应对的自私行为。' },
    { id: 15, name: '熊', keywords: '权力、上司、保护、财务', meaning: '代表权威人物（老板、母亲形象）或力量。也与财务资源和官方支持有关。' },
    { id: 16, name: '星星', keywords: '希望、方向、成功、灵感', meaning: '像导航星一样，代表找到方向、获得清晰或走向成功。现代也常关联网络与科技。' },
    { id: 17, name: '鹳', keywords: '改变、搬迁、升级、转场', meaning: '积极的变化正在发生，通常指搬家、晋升，或任何带来"新气象"的改善。' },
    { id: 18, name: '狗', keywords: '朋友、忠诚、支持、信任', meaning: '生活中可靠的朋友或支持者，可以字面指宠物，也代表你可以依赖的忠诚关系。' },
    { id: 19, name: '塔', keywords: '机构、权威、孤立、边界', meaning: '大型组织（公司、政府、医院），也代表设立界限、独处，或一种"高高在上"的隔离状态。' },
    { id: 20, name: '花园', keywords: '社交、公众、活动、声誉', meaning: '公共领域的事——聚会、社交媒体、人脉网络，或你在公众眼中的形象。' },
    { id: 21, name: '山', keywords: '阻碍、延迟、卡住、挑战', meaning: '有东西挡住了去路，代表进展停滞、困难，或固执难移的局面。' },
    { id: 22, name: '十字路口', keywords: '选择、决定、多条路、犹豫', meaning: '一个必须做出决定的时刻，面前有多个选项，需要你权衡后选择一条路。' },
    { id: 23, name: '老鼠', keywords: '损耗、压力、焦虑、流失', meaning: '某些东西正在被慢慢消耗——金钱、精力或内心的平静。是一种持续的、啃噬般的担忧或损失。' },
    { id: 24, name: '心', keywords: '爱、情感、激情、核心渴望', meaning: '代表各种形式的爱——浪漫、亲情，或你内心真正在意的事。' },
    { id: 25, name: '戒指', keywords: '承诺、合约、伴侣、循环', meaning: '有约束力的协议，如婚姻、合同或合伙关系。也代表循环往复、会再次发生的事。' },
    { id: 26, name: '书', keywords: '秘密、知识、学习、未知', meaning: '代表尚未揭晓的信息，或需要通过学习、研究才能获得的知识。' },
    { id: 27, name: '信', keywords: '文件、消息、书面沟通', meaning: '具体的书面信息——邮件、短信、合同、证书，或任何有实体记录的文字沟通。' },
    { id: 28, name: '男人', keywords: '男性问卜者或关键男性', meaning: '如果你认同为男性，这就是你；否则代表情况中的重要男性（伴侣、父亲、同事等）。' },
    { id: 29, name: '女人', keywords: '女性问卜者或关键女性', meaning: '含义与男人牌对称，代表你本人或局面中的关键女性人物。' },
    { id: 30, name: '百合', keywords: '和平、成熟、安宁、亲密', meaning: '随年龄而来的智慧与平静，也可指年长者，或一段需要耐心与成熟去处理的关系。' },
    { id: 31, name: '太阳', keywords: '成功、快乐、能量、胜利', meaning: '牌组中最积极的牌之一，代表成功、活力与清晰，会"照亮"周围的牌。' },
    { id: 32, name: '月亮', keywords: '情感、直觉、认可、名声', meaning: '深层情绪与直觉，也关联公众认可、声誉，以及夜晚或周期性的能量。' },
    { id: 33, name: '钥匙', keywords: '解决方案、确定性、关键、突破', meaning: '你寻找的答案或突破口。钥匙出现时，往往是一个强烈的"是"，并会"解锁"周围的牌。' },
    { id: 34, name: '鱼', keywords: '金钱、生意、丰盛、独立', meaning: '直接的财务牌——收入、商业、物质资源，也代表丰盛与流动性。' },
    { id: 35, name: '锚', keywords: '稳定、工作、坚持、长期', meaning: '代表扎根、安全感和长期不变的状态，常直接指向工作或事业上的稳定。' },
    { id: 36, name: '十字架', keywords: '责任、负担、信念、必经的功课', meaning: '代表一种沉重的、命中注定的责任或考验，是必须面对和承担的课题。' }
  ];

  /* ---------------- 小工具 ---------------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const uid = () => 'm_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
  const clamp = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
  const pad2 = (n) => String(n).padStart(2, '0');

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) { return fallback; }
  }

  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { toast('保存失败：浏览器存储可能已满'); }
  }

  function personalize(text) {
    const s = readJSON(SETTINGS_KEY, {}) || {};
    const myName = clamp(s.myName, 16) || '你';
    const charName = clamp(s.charName, 16) || '梦角';
    return String(text).split('{我}').join(myName).split('{名字}').join(charName);
  }

  function toast(message) {
    const root = $('#toastRoot');
    if (!root) { console.log('[mirror]', message); return; }
    const item = document.createElement('div');
    item.className = 'toast';
    item.textContent = message;
    root.appendChild(item);
    setTimeout(() => {
      item.classList.add('out');
      setTimeout(() => item.remove(), 280);
    }, 2600);
  }

  function openDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  }

  function formatTime(ts) {
    try {
      const d = new Date(ts);
      return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate())
        + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
    } catch (e) { return ''; }
  }

  /* ---------------- 密语数据 ---------------- */
  function normalizeLine(input) {
    if (typeof input === 'string') {
      const text = clamp(input, 200);
      return text ? { id: uid(), text } : null;
    }
    if (!input || typeof input !== 'object') return null;
    const text = clamp(typeof input.text === 'string' ? input.text : '', 200);
    if (!text) return null;
    return { id: typeof input.id === 'string' && input.id ? input.id : uid(), text };
  }

  function defaultLines(list) {
    return list.map((text) => ({ id: uid(), text }));
  }

  function loadMirror() {
    const raw = readJSON(KEY, null);
    const src = (raw && typeof raw === 'object' && !Array.isArray(raw)) ? raw : {};

    const cards  = Array.isArray(src.cards)  ? src.cards.map(normalizeLine).filter(Boolean)  : [];
    const absent = Array.isArray(src.absent) ? src.absent.map(normalizeLine).filter(Boolean) : [];
    const refuse = Array.isArray(src.refuse) ? src.refuse.map(normalizeLine).filter(Boolean) : [];

    return {
      greeting:    clamp(src.greeting, 60)    || DEFAULT.greeting,
      summonLabel: clamp(src.summonLabel, 12) || DEFAULT.summonLabel,
      cards:  cards.length  ? cards  : defaultLines(DEFAULT.cards),
      absent: absent.length ? absent : defaultLines(DEFAULT.absent),
      refuse: refuse.length ? refuse : defaultLines(DEFAULT.refuse)
    };
  }

  function loadOracleRecords() {
    const raw = readJSON(ORACLE_KEY, {});
    const list = Array.isArray(raw.records) ? raw.records : [];
    return list
      .filter((r) => r && typeof r === 'object')
      .map((r) => ({
        id: typeof r.id === 'string' && r.id ? r.id : uid(),
        ts: Number(r.ts) || Date.now(),
        cardIds: Array.isArray(r.cardIds) ? r.cardIds.map(Number).filter((n) => n >= 1 && n <= 36) : [],
        note: typeof r.note === 'string' ? r.note.slice(0, 800) : '',
        result: r.result === 'success' ? 'success' : 'fail'
      }))
      .filter((r) => r.cardIds.length)
      .slice(0, 200);
  }

  function saveOracleRecords(list) {
    writeJSON(ORACLE_KEY, { records: list.slice(0, 200) });
  }

  /* ---------------- 运行状态 ---------------- */
  let mirror = loadMirror();
  let mirrorDraft = null;
  let mirrorBusy = false;
  const mirrorBags = { cards: [], absent: [], refuse: [] };

  let oracleCount = 1;
  let oracleCurrent = null;
  let oracleBusy = false;
  let oracleRecords = loadOracleRecords();

  /* ============================================================
     1. 注入 CSS
     ============================================================ */
  function injectCSS() {
    if (document.getElementById('mirrorStyle')) return;
    const style = document.createElement('style');
    style.id = 'mirrorStyle';
    style.textContent = `
.brand-mark {
  padding: 0 !important;
  cursor: pointer;
  transition: transform .22s, border-color .22s, box-shadow .22s, color .22s;
}
.brand-mark:hover {
  transform: scale(1.05);
  border-color: rgba(181,111,107,.6);
  color: #f2dfc4;
  box-shadow: 0 0 0 4px rgba(181,111,107,.07), 0 0 34px rgba(181,111,107,.22), inset 0 0 16px rgba(0,0,0,.7);
}
.brand-mark:active { transform: scale(.97); }
.brand-mark:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(181,111,107,.55), 0 0 30px rgba(181,111,107,.24);
}

.mirror-modal { width: min(680px, calc(100vw - 24px)); }
.mirror-card {
  background:
    radial-gradient(90% 55% at 50% 0%, rgba(104,32,36,.28), transparent 66%),
    linear-gradient(170deg, #1a090c 0%, #0b0406 100%);
}
.mirror-head-actions { display: flex; align-items: center; gap: 8px; }
.mirror-body { gap: 14px; align-items: center; padding-bottom: 20px; }

.mirror-greeting {
  max-width: 460px;
  margin: 0;
  color: #e3c8c1;
  font-family: var(--font-serif, serif);
  font-size: calc(14.5px * var(--msg-scale, 1));
  line-height: 1.85;
  letter-spacing: .06em;
  text-align: center;
  text-shadow: 0 0 22px rgba(181,111,107,.18);
}

/* 镜子 + 水晶球同台 */
.mirror-stage {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 26px;
  padding: 6px 0 2px;
}

.mirror-stage-frame {
  position: relative;
  width: min(250px, 46vw);
  aspect-ratio: 13 / 18;
  border-radius: 50% 50% 14px 14px / 34% 34% 14px 14px;
  background: linear-gradient(135deg,#6b4a3b 0%,#291214 14%,#966d55 32%,#2a1315 50%,#77523f 68%,#240f11 84%,#593a2f 100%);
  box-shadow:
    0 0 0 1px rgba(200,160,128,.22),
    0 0 0 5px rgba(11,4,5,.92),
    0 0 0 7px rgba(170,118,96,.16),
    0 0 0 11px rgba(8,3,4,.94),
    0 26px 60px -22px rgba(0,0,0,.96),
    inset 0 0 22px rgba(0,0,0,.7);
}

.mirror-stage-glass {
  position: absolute;
  inset: 8px;
  overflow: hidden;
  border-radius: inherit;
  background:
    radial-gradient(70% 55% at 50% 34%, rgba(88,34,38,.55), rgba(9,4,5,.97) 74%),
    linear-gradient(180deg, #150709 0%, #040102 100%);
  box-shadow: inset 0 0 44px 18px rgba(0,0,0,.94), inset 0 0 4px rgba(196,132,116,.22);
}
.mirror-stage-glass::after {
  position: absolute; inset: 0; z-index: 6;
  border: 1px solid rgba(214,172,140,.14);
  border-radius: inherit;
  content: ""; pointer-events: none;
}

.mirror-deep {
  position: absolute; inset: 0;
  background: radial-gradient(60% 46% at 50% 40%, rgba(126,42,44,.24), transparent 70%);
  animation: mirrorDeepPulse 7s ease-in-out infinite;
}
@keyframes mirrorDeepPulse { 0%,100%{opacity:.5} 50%{opacity:1} }

.mirror-figure {
  position: absolute;
  bottom: -2%; left: 50%;
  width: 82%;
  transform: translateX(-50%);
  filter: blur(1.6px);
  opacity: .92;
  -webkit-mask-image: linear-gradient(to bottom, #000 62%, transparent 100%);
  mask-image: linear-gradient(to bottom, #000 62%, transparent 100%);
  pointer-events: none;
}

/* 眼睛：柔和、有眼白、透明度适中、无睫毛 */
.mirror-eyes {
  position: absolute; top: 34%; left: 50%; z-index: 5;
  width: 68%; transform: translate(-50%,-50%);
  opacity: 0;
  transition: opacity .9s ease;
  pointer-events: none;
}
.mirror-eyes.open { opacity: .82; }
.mirror-eyes-svg {
  display: block; width: 100%; height: auto;
  transform: scaleY(.06); transform-origin: 50% 50%;
  transition: transform 1.15s cubic-bezier(.2,.9,.3,1);
  filter: drop-shadow(0 0 5px rgba(140,28,30,.16));
}
.mirror-eyes.open .mirror-eyes-svg { transform: scaleY(1); }
.mirror-eyes-svg.blink { animation: mirrorBlink .45s ease; }
@keyframes mirrorBlink { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(.08)} }

.mirror-ripple {
  position: absolute; top: 50%; left: 50%; z-index: 4;
  width: 12px; height: 12px; margin: -6px 0 0 -6px;
  border: 1px solid rgba(214,138,126,.55);
  border-radius: 50%; opacity: 0; pointer-events: none;
}
.mirror-stage-glass.rippling .mirror-ripple { animation: mirrorRipple 1.3s ease-out; }
@keyframes mirrorRipple {
  0% { transform: scale(0); opacity: 0; }
  12% { opacity: 1; }
  100% { transform: scale(28); opacity: 0; }
}

.mirror-stage-mist {
  position: absolute; inset: 0; z-index: 2;
  background:
    radial-gradient(60% 40% at 30% 70%, rgba(160,78,72,.13), transparent 70%),
    radial-gradient(55% 35% at 72% 30%, rgba(170,90,80,.09), transparent 72%);
  animation: mistDrift 11s ease-in-out infinite alternate;
  pointer-events: none;
}
.mirror-stage-shine {
  position: absolute; top: -20%; left: -60%; z-index: 3;
  width: 42%; height: 150%; transform: rotate(16deg);
  background: linear-gradient(90deg, transparent, rgba(255,232,224,.07), transparent);
  animation: mirrorSheen 8s ease-in-out infinite;
  pointer-events: none;
}

.mirror-message {
  position: absolute; bottom: 17%; left: 11%; right: 11%; z-index: 5;
  margin: 0; color: #f6e7e0;
  font-family: var(--font-serif, serif);
  font-size: calc(14px * var(--msg-scale, 1));
  line-height: 1.85; letter-spacing: .04em; text-align: center;
  overflow-wrap: anywhere; white-space: pre-wrap;
  opacity: 0; transform: translateY(10px);
  transition: opacity .6s ease, transform .6s ease;
  text-shadow: 0 2px 14px rgba(0,0,0,.95), 0 0 26px rgba(0,0,0,.7);
  pointer-events: none;
}
.mirror-message.show { opacity: 1; transform: none; }
.mirror-message[data-tone="absent"] { color: #9e837b; font-style: italic; }
.mirror-message[data-tone="refuse"] { color: #b98e88; }

.mirror-summon {
  display: inline-flex; align-items: center; justify-content: center; gap: 9px;
  min-width: 196px; margin-top: 2px; padding: 12px 26px;
  border: 1px solid rgba(214,152,138,.32);
  border-radius: 999px;
  background: linear-gradient(145deg, #a85e5a, #6a2a2f);
  color: #1b0709;
  font-family: var(--font-serif, serif);
  font-size: 13.5px; font-weight: 600; letter-spacing: .18em;
  box-shadow: 0 14px 34px -16px rgba(181,111,107,.85), inset 0 1px 0 rgba(255,226,216,.24);
  transition: transform .18s, filter .2s, box-shadow .2s, opacity .2s;
}
.mirror-summon:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.08); }
.mirror-summon:active:not(:disabled) { transform: scale(.98); }
.mirror-summon:disabled { cursor: default; opacity: .5; box-shadow: none; }

.mirror-summon-glyph { animation: summonGlyph 3.4s ease-in-out infinite; }
@keyframes summonGlyph { 0%,100%{opacity:.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.16)} }

.mirror-hint {
  min-height: 16px; margin: 0; color: #7d625e;
  font-size: 10.5px; letter-spacing: .08em; text-align: center;
}

/* ---------------- 2D 卡通水晶球 ---------------- */
.mirror-oracle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  transition: transform .2s ease;
}
.mirror-oracle:hover { transform: translateY(-3px); }
.mirror-oracle:active { transform: translateY(0) scale(.97); }
.mirror-oracle:focus-visible {
  outline: none;
  filter: drop-shadow(0 0 0 3px rgba(181,111,107,.4));
}

.mirror-oracle-svg {
  display: block;
  width: 82px;
  height: auto;
  filter: drop-shadow(0 8px 12px rgba(0,0,0,.45));
  transition: filter .22s ease;
}
.mirror-oracle:hover .mirror-oracle-svg {
  filter: drop-shadow(0 10px 16px rgba(0,0,0,.55)) brightness(1.1);
}

.mirror-oracle-label {
  color: #c98d86;
  font-family: var(--font-serif, serif);
  font-size: 11.5px;
  letter-spacing: .26em;
  text-indent: .26em;
  transition: color .2s;
}
.mirror-oracle:hover .mirror-oracle-label { color: #f2dfd8; }

/* ---------------- 占卜弹窗 ---------------- */
.oracle-modal { width: min(660px, calc(100vw - 24px)); }
.oracle-modal .modal-card {
  background:
    radial-gradient(90% 55% at 50% 0%, rgba(104,32,36,.30), transparent 66%),
    linear-gradient(170deg, #1a090c 0%, #0b0406 100%);
}

.oracle-lead {
  margin: 0;
  color: #b09993;
  font-size: 12px;
  line-height: 1.8;
  text-align: center;
}

.oracle-deck-pick {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 14px;
  padding: 18px;
  border: 1px solid rgba(198,128,118,.2);
  border-radius: 14px;
  background:
    radial-gradient(120% 100% at 50% 0%, rgba(90,26,30,.3), transparent 70%),
    rgba(255,255,255,.02);
}

.oracle-deck-name {
  margin: 0;
  color: #c98d86;
  font-family: var(--font-serif, serif);
  font-size: 13px;
  letter-spacing: .1em;
  text-align: center;
}

.oracle-count { display: flex; flex-direction: column; gap: 8px; align-items: center; }
.oracle-count > span { color: #b09993; font-size: 11px; letter-spacing: .06em; }
.oracle-count-options { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
.oracle-count-btn {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(198,128,118,.2);
  border-radius: 10px;
  background: rgba(255,255,255,.025);
  color: #b09993;
  font-size: 13px;
  cursor: pointer;
  transition: all .18s;
}
.oracle-count-btn:hover { border-color: rgba(181,111,107,.5); color: #f2dfd8; }
.oracle-count-btn.active {
  border-color: rgba(181,111,107,.6);
  background: rgba(181,111,107,.16);
  color: #fff;
}

.oracle-draw-btn {
  align-self: center;
  min-width: 190px;
  padding: 11px 24px;
  border: 1px solid rgba(214,152,138,.32);
  border-radius: 999px;
  background: linear-gradient(145deg, #a85e5a, #6a2a2f);
  color: #1b0709;
  font-family: var(--font-serif, serif);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: .18em;
  cursor: pointer;
  box-shadow: 0 14px 34px -16px rgba(181,111,107,.85), inset 0 1px 0 rgba(255,226,216,.24);
  transition: transform .18s, filter .2s, opacity .2s;
}
.oracle-draw-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.08); }
.oracle-draw-btn:disabled { cursor: default; opacity: .5; }

.oracle-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
}
.oracle-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 13px 14px 12px;
  border: 1px solid rgba(198,128,118,.22);
  border-radius: 12px;
  background:
    radial-gradient(120% 100% at 0% 0%, rgba(96,32,36,.4), transparent 62%),
    rgba(255,255,255,.02);
  box-shadow: 0 0 0 1px rgba(0,0,0,.35), inset 0 0 40px rgba(0,0,0,.25);
  animation: oracleCardIn .45s cubic-bezier(.2,.8,.3,1) both;
}
@keyframes oracleCardIn {
  from { opacity: 0; transform: translateY(10px) scale(.96); }
  to { opacity: 1; transform: none; }
}
.oracle-card-no { color: rgba(185,154,114,.72); font-size: 9px; letter-spacing: .2em; }
.oracle-card-name { color: #f3e8e2; font-family: var(--font-serif, serif); font-size: 16px; letter-spacing: .1em; }
.oracle-card-kw { color: #c98d86; font-size: 10.5px; line-height: 1.6; letter-spacing: .03em; }
.oracle-card-meaning {
  padding-top: 7px;
  border-top: 1px dashed rgba(198,128,118,.14);
  color: #d6c2bb;
  font-size: 11.5px;
  line-height: 1.75;
}

.oracle-notebook { display: flex; flex-direction: column; gap: 7px; margin-top: 14px; }
.oracle-notebook label { color: #b09993; font-size: 10.5px; letter-spacing: .1em; }
.oracle-notebook textarea {
  width: 100%;
  min-height: 82px;
  padding: 10px 12px;
  border: 1px solid rgba(198,128,118,.2);
  border-radius: 10px;
  background: rgba(255,255,255,.03);
  color: #f0e3dd;
  font-size: 12px;
  line-height: 1.7;
  resize: vertical;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
}
.oracle-notebook textarea:focus {
  border-color: rgba(181,111,107,.55);
  box-shadow: 0 0 0 3px rgba(181,111,107,.08);
}

.oracle-feel { display: flex; flex-direction: column; gap: 9px; align-items: center; margin-top: 14px; }
.oracle-feel-btn {
  min-width: 168px;
  padding: 10px 22px;
  border: 1px solid rgba(214,152,138,.32);
  border-radius: 999px;
  background: linear-gradient(145deg, #a85e5a, #6a2a2f);
  color: #1b0709;
  font-family: var(--font-serif, serif);
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: .16em;
  cursor: pointer;
  box-shadow: 0 14px 34px -16px rgba(181,111,107,.85);
  transition: transform .18s, filter .2s;
}
.oracle-feel-btn:hover { transform: translateY(-1px); filter: brightness(1.08); }
.oracle-feel-options { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.oracle-feel-options[hidden] { display: none; }
.oracle-feel-opt {
  padding: 8px 18px;
  border: 1px solid rgba(198,128,118,.28);
  border-radius: 999px;
  background: rgba(255,255,255,.03);
  color: #f0e3dd;
  font-size: 11.5px;
  letter-spacing: .06em;
  cursor: pointer;
  transition: all .18s;
}
.oracle-feel-opt:hover { border-color: rgba(181,111,107,.55); background: rgba(181,111,107,.12); }
.oracle-feel-opt.ok { color: #b7d7a8; }
.oracle-feel-opt.ok:hover { border-color: rgba(140,190,120,.5); background: rgba(80,140,80,.12); }
.oracle-feel-opt.fail { color: #e7a8a2; }
.oracle-feel-opt.fail:hover { border-color: rgba(209,124,119,.5); background: rgba(160,60,58,.14); }

.oracle-history {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px dashed rgba(198,128,118,.14);
  width: 100%;
}
.oracle-history-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0;
  color: #b09993;
  font-size: 10.5px;
  letter-spacing: .1em;
}
.oracle-history-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 240px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(198,128,118,.22) transparent;
}
.oracle-record {
  padding: 10px 12px;
  border: 1px solid rgba(198,128,118,.14);
  border-radius: 10px;
  background: rgba(255,255,255,.02);
  font-size: 11px;
  line-height: 1.7;
}
.oracle-record-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
  color: #7d625e;
  font-size: 9.5px;
  letter-spacing: .06em;
}
.oracle-record-status { padding: 1px 7px; border-radius: 999px; font-size: 9px; }
.oracle-record-status.ok { background: rgba(80,140,80,.16); color: #b7d7a8; }
.oracle-record-status.fail { background: rgba(160,60,58,.16); color: #e7a8a2; }
.oracle-record-cards {
  color: #c98d86;
  font-family: var(--font-serif, serif);
  font-size: 11.5px;
  letter-spacing: .06em;
}
.oracle-record-note {
  margin-top: 4px;
  color: #b09993;
  font-size: 10.5px;
  font-style: italic;
}

/* 密语库编辑 */
.mirror-line-list {
  display: flex; flex-direction: column; gap: 6px;
  max-height: 170px; overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(198,128,118,.22) transparent;
}
.mirror-line { display: flex; align-items: center; gap: 7px; }
.mirror-line .input { flex: 1; padding: 7px 10px; font-size: 11.5px; }
.mirror-add-row { display: flex; gap: 8px; }
.mirror-add-row .input { flex: 1; padding: 8px 10px; font-size: 11.5px; }

@media (max-width: 760px) {
  .mirror-modal { width: calc(100vw - 16px); }
  .mirror-body { gap: 11px; padding-inline: 15px; }
  .mirror-greeting { font-size: calc(13px * var(--msg-scale, 1)); }
  .mirror-stage { gap: 16px; }
  .mirror-stage-frame { width: min(220px, 44vw); }
  .mirror-oracle-svg { width: 66px; }
  .mirror-oracle-label { font-size: 10.5px; letter-spacing: .22em; }
  .mirror-summon { min-width: 168px; padding: 10px 20px; font-size: 12.5px; }
  .mirror-line-list { max-height: 138px; }
  .oracle-modal { width: calc(100vw - 16px); }
  .oracle-cards { grid-template-columns: 1fr; }
  .oracle-record-cards { font-size: 11px; }
}
@media (max-width: 480px) {
  .mirror-stage { flex-direction: column; gap: 16px; }
  .mirror-stage-frame { width: min(200px, 60vw); }
  .mirror-oracle-svg { width: 60px; }
  .oracle-count-btn { width: 34px; height: 34px; font-size: 12px; }
  .oracle-draw-btn { min-width: 160px; font-size: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .mirror-eyes-svg { transition-duration: .001ms; }
  .mirror-deep, .mirror-stage-mist, .mirror-stage-shine, .mirror-summon-glyph,
  .oracle-card { animation: none; }
}
    `;
    document.head.appendChild(style);
  }

  /* ============================================================
     2. 注入 HTML
     ============================================================ */
  function injectHTML() {
    if (document.getElementById('mirrorDialog')) return;

    const wrap = document.createElement('div');
    wrap.id = 'mirrorInjectRoot';
    wrap.innerHTML = `
<dialog class="modal mirror-modal" id="mirrorDialog">
  <div class="modal-card mirror-card">
    <header class="modal-head">
      <div>
        <p class="eyebrow">MIRROR OF NIGHTMARE</p>
        <h3>镜中梦魇</h3>
      </div>
      <div class="mirror-head-actions">
        <button type="button" class="icon-btn" id="mirrorLibraryBtn" title="镜中密语库" aria-label="镜中密语库">❖</button>
        <button type="button" class="modal-x" data-close aria-label="关闭">✕</button>
      </div>
    </header>
    <div class="modal-body mirror-body">
      <p class="mirror-greeting" id="mirrorGreeting">魔镜魔镜，告诉我——镜子的另一端，有人在吗？</p>

      <div class="mirror-stage">
        <div class="mirror-stage-frame">
          <div class="mirror-stage-glass" id="mirrorGlass">
            <span class="mirror-deep"></span>

            <svg class="mirror-figure" viewBox="0 0 200 280" aria-hidden="true">
              <defs>
                <linearGradient id="mFigGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#180a0d"/>
                  <stop offset="55%" stop-color="#0c0406"/>
                  <stop offset="100%" stop-color="#030102"/>
                </linearGradient>
                <radialGradient id="mFigAura" cx="50%" cy="42%" r="52%">
                  <stop offset="0%" stop-color="rgba(132,52,54,.34)"/>
                  <stop offset="65%" stop-color="rgba(88,26,30,.10)"/>
                  <stop offset="100%" stop-color="rgba(88,26,30,0)"/>
                </radialGradient>
              </defs>
              <ellipse cx="100" cy="120" rx="96" ry="126" fill="url(#mFigAura)"/>
              <path d="M100 152c-31 0-54 20-63 48-7 22-9 44-7 62 2 20 11 30 22 32h96c11-2 20-12 22-32 2-18 0-40-7-62-9-28-32-48-63-48Z" fill="url(#mFigGrad)"/>
              <path d="M85 124h30v32c0 8-7 13-15 13s-15-5-15-13z" fill="url(#mFigGrad)"/>
              <ellipse cx="100" cy="88" rx="35" ry="43" fill="url(#mFigGrad)"/>
              <path d="M100 42c-22 0-37 15-39 35-1 11 0 20 3 27 2-13 7-20 13-24 5 7 13 10 23 10s18-3 23-10c6 4 11 11 13 24 3-7 4-16 3-27-2-20-17-35-39-35Z" fill="#060203"/>
              <path d="M66 46c8-10 20-15 34-15" stroke="rgba(150,70,68,.20)" stroke-width="1.4" fill="none" stroke-linecap="round"/>
            </svg>

            <div class="mirror-eyes" id="mirrorEyes" aria-hidden="true">
              <svg class="mirror-eyes-svg" id="mirrorEyesSvg" viewBox="0 0 320 130">
                <defs>
                  <clipPath id="mEyeClip">
                    <path d="M-42 0Q0 -28 42 0Q0 28 -42 0Z"/>
                  </clipPath>
                  <radialGradient id="mIrisGrad" cx="50%" cy="44%" r="62%">
                    <stop offset="0%"  stop-color="#e6a183"/>
                    <stop offset="14%" stop-color="#c25a48"/>
                    <stop offset="38%" stop-color="#962c2e"/>
                    <stop offset="66%" stop-color="#540d14"/>
                    <stop offset="100%" stop-color="#1b0305"/>
                  </radialGradient>
                  <radialGradient id="mScleraGrad" cx="50%" cy="46%" r="62%">
                    <stop offset="0%"  stop-color="#f0ddd3"/>
                    <stop offset="52%" stop-color="#dbc0b4"/>
                    <stop offset="82%" stop-color="#b69891"/>
                    <stop offset="100%" stop-color="#806a66"/>
                  </radialGradient>
                  <radialGradient id="mGlowGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%"  stop-color="rgba(180,64,58,.18)"/>
                    <stop offset="60%" stop-color="rgba(120,32,32,.05)"/>
                    <stop offset="100%" stop-color="rgba(80,20,22,0)"/>
                  </radialGradient>
                  <radialGradient id="mGlint" cx="50%" cy="50%" r="55%">
                    <stop offset="0%"  stop-color="rgba(255,248,240,.92)"/>
                    <stop offset="55%" stop-color="rgba(255,226,208,.35)"/>
                    <stop offset="100%" stop-color="rgba(255,216,196,0)"/>
                  </radialGradient>
                </defs>

                <ellipse cx="160" cy="65" rx="150" ry="50" fill="url(#mGlowGrad)"/>

                <g transform="translate(78,65)">
                  <ellipse cx="0" cy="0" rx="46" ry="22" fill="url(#mGlowGrad)" opacity=".7"/>
                  <path d="M-42 0Q0 -28 42 0Q0 28 -42 0Z" fill="url(#mScleraGrad)"/>
                  <g clip-path="url(#mEyeClip)">
                    <circle cx="0" cy="0" r="18" fill="url(#mIrisGrad)"/>
                    <circle cx="0" cy="0" r="18" fill="none" stroke="rgba(44,8,10,.42)" stroke-width="1.2"/>
                    <circle cx="0" cy="0" r="11" fill="none" stroke="rgba(44,8,10,.20)" stroke-width=".9"/>
                    <ellipse cx="0" cy="0" rx="5" ry="9" fill="#080102"/>
                    <ellipse cx="-6.5" cy="-6" rx="4" ry="2.8" fill="url(#mGlint)"/>
                    <circle cx="7" cy="5" r="1.4" fill="rgba(255,228,212,.32)"/>
                  </g>
                  <path d="M-42 0Q0 -28 42 0" stroke="rgba(30,6,8,.82)" stroke-width="2.6" fill="none" stroke-linecap="round"/>
                  <path d="M-42 0Q0 28 42 0" stroke="rgba(30,6,8,.52)" stroke-width="1.6" fill="none" stroke-linecap="round"/>
                </g>

                <g transform="translate(242,65)">
                  <ellipse cx="0" cy="0" rx="46" ry="22" fill="url(#mGlowGrad)" opacity=".7"/>
                  <path d="M-42 0Q0 -28 42 0Q0 28 -42 0Z" fill="url(#mScleraGrad)"/>
                  <g clip-path="url(#mEyeClip)">
                    <circle cx="0" cy="0" r="18" fill="url(#mIrisGrad)"/>
                    <circle cx="0" cy="0" r="18" fill="none" stroke="rgba(44,8,10,.42)" stroke-width="1.2"/>
                    <circle cx="0" cy="0" r="11" fill="none" stroke="rgba(44,8,10,.20)" stroke-width=".9"/>
                    <ellipse cx="0" cy="0" rx="5" ry="9" fill="#080102"/>
                    <ellipse cx="-6.5" cy="-6" rx="4" ry="2.8" fill="url(#mGlint)"/>
                    <circle cx="7" cy="5" r="1.4" fill="rgba(255,228,212,.32)"/>
                  </g>
                  <path d="M-42 0Q0 -28 42 0" stroke="rgba(30,6,8,.82)" stroke-width="2.6" fill="none" stroke-linecap="round"/>
                  <path d="M-42 0Q0 28 42 0" stroke="rgba(30,6,8,.52)" stroke-width="1.6" fill="none" stroke-linecap="round"/>
                </g>
              </svg>
            </div>

            <span class="mirror-ripple"></span>
            <span class="mirror-stage-mist"></span>
            <span class="mirror-stage-shine"></span>

            <p class="mirror-message" id="mirrorMessage"></p>
          </div>
        </div>

        <button type="button" class="mirror-oracle" id="mirrorOracleBtn" title="连接水晶球，占卜" aria-label="连接水晶球，打开占卜">
          <svg class="mirror-oracle-svg" viewBox="0 0 80 100" aria-hidden="true">
            <!-- 底座 -->
            <path d="M14 84 L66 84 L72 94 Q73 97 70 97 L10 97 Q7 97 8 94 Z"
                  fill="#401318" stroke="#160305" stroke-width="2.4" stroke-linejoin="round"/>
            <!-- 托架 -->
            <path d="M20 72 L60 72 L64 84 L16 84 Z"
                  fill="#6a1f27" stroke="#160305" stroke-width="2.4" stroke-linejoin="round"/>
            <!-- 球体 -->
            <circle cx="40" cy="40" r="31" fill="#8e2b34" stroke="#160305" stroke-width="2.6"/>
            <!-- 球内浅色块 -->
            <path d="M40 71 A31 31 0 0 0 71 40 A31 31 0 0 1 40 71 Z" fill="#a83a43" opacity=".55"/>
            <!-- 主高光 -->
            <ellipse cx="28" cy="27" rx="10" ry="7" transform="rotate(-32 28 27)"
                     fill="#ffe3d8" opacity=".62"/>
            <!-- 小反光点 -->
            <circle cx="55" cy="52" r="3.4" fill="#ffe3d8" opacity=".32"/>
          </svg>
          <span class="mirror-oracle-label">连接</span>
        </button>
      </div>

      <button type="button" class="mirror-summon" id="mirrorSummonBtn">
        <span class="mirror-summon-glyph" aria-hidden="true">✦</span>
        <span id="mirrorSummonLabel">召唤咒语</span>
      </button>
      <p class="mirror-hint" id="mirrorHint">镜面会记住你的呼唤。</p>
    </div>
  </div>
</dialog>

<dialog class="modal" id="mirrorLibraryDialog">
  <form class="modal-card" id="mirrorLibraryForm" novalidate>
    <header class="modal-head">
      <div>
        <p class="eyebrow">MIRROR ARCHIVE</p>
        <h3>镜中密语库</h3>
      </div>
      <button type="button" class="modal-x" data-close aria-label="关闭">✕</button>
    </header>
    <div class="modal-body">
      <div class="field">
        <label for="mirrorGreetingInput">镜面题词 <span class="label-hint">出现在镜子顶部</span></label>
        <input class="input" id="mirrorGreetingInput" maxlength="60" placeholder="魔镜魔镜，告诉我……" />
      </div>
      <div class="field">
        <label for="mirrorSummonInput">召唤按钮文字 <span class="label-hint">最多 12 字</span></label>
        <input class="input" id="mirrorSummonInput" maxlength="12" placeholder="召唤咒语" />
      </div>
      <div class="field">
        <label>他会说的话 <span class="label-hint" id="mirrorCardCount">0 张</span></label>
        <div class="mirror-line-list" id="mirrorCardList"></div>
        <div class="mirror-add-row">
          <input class="input" id="mirrorCardInput" maxlength="200" placeholder="写一句他会在镜中说的话…" />
          <button type="button" class="btn small" id="mirrorCardAddBtn">添加</button>
        </div>
      </div>
      <div class="field">
        <label>他不在时的提示 <span class="label-hint">随机抽一条</span></label>
        <div class="mirror-line-list" id="mirrorAbsentList"></div>
        <div class="mirror-add-row">
          <input class="input" id="mirrorAbsentInput" maxlength="60" placeholder="例如：镜面一片死寂。他不在。" />
          <button type="button" class="btn small" id="mirrorAbsentAddBtn">添加</button>
        </div>
      </div>
      <div class="field">
        <label>他不想出现时的提示 <span class="label-hint">随机抽一条</span></label>
        <div class="mirror-line-list" id="mirrorRefuseList"></div>
        <div class="mirror-add-row">
          <input class="input" id="mirrorRefuseInput" maxlength="60" placeholder="例如：他累了。" />
          <button type="button" class="btn small" id="mirrorRefuseAddBtn">添加</button>
        </div>
      </div>
      <p class="field-help">这些内容与聊天字卡、体感字卡完全独立，只用于镜中梦魇。支持占位符 <code>{我}</code> 与 <code>{名字}</code>。</p>
    </div>
    <footer class="modal-foot">
      <button type="button" class="btn" data-close>取消</button>
      <button type="submit" class="btn primary">保存</button>
    </footer>
  </form>
</dialog>

<dialog class="modal oracle-modal" id="oracleDialog">
  <div class="modal-card">
    <header class="modal-head">
      <div>
        <p class="eyebrow">ORACLE</p>
        <h3>连接 · 雷诺曼</h3>
      </div>
      <button type="button" class="modal-x" data-close aria-label="关闭">✕</button>
    </header>
    <div class="modal-body">

      <div id="oracleSetup">
        <p class="oracle-lead">静下心，想一个此刻最想问的问题。然后让水晶球替你翻开牌面。</p>
        <div class="oracle-deck-pick">
          <p class="oracle-deck-name">雷诺曼牌 · Lenormand</p>
          <div class="oracle-count">
            <span>抽牌数量</span>
            <div class="oracle-count-options" id="oracleCountOptions">
              <button type="button" class="oracle-count-btn active" data-count="1">1</button>
              <button type="button" class="oracle-count-btn" data-count="2">2</button>
              <button type="button" class="oracle-count-btn" data-count="3">3</button>
              <button type="button" class="oracle-count-btn" data-count="4">4</button>
              <button type="button" class="oracle-count-btn" data-count="5">5</button>
            </div>
          </div>
          <button type="button" class="oracle-draw-btn" id="oracleDrawBtn">连接 · 抽牌</button>
        </div>
      </div>

      <div id="oracleResult" hidden>
        <div class="oracle-cards" id="oracleCards"></div>
        <div class="oracle-notebook">
          <label for="oracleNote">感应记录</label>
          <textarea id="oracleNote" rows="4" placeholder="写下你感应到的画面、触感、声音……"></textarea>
        </div>
        <div class="oracle-feel">
          <button type="button" class="oracle-feel-btn" id="oracleFeltBtn">我感应到了</button>
          <div class="oracle-feel-options" id="oracleFeelOptions" hidden>
            <button type="button" class="oracle-feel-opt ok" data-result="success">✓ 连接成功</button>
            <button type="button" class="oracle-feel-opt fail" data-result="fail">✕ 连接未成功</button>
          </div>
        </div>
      </div>

      <div class="oracle-history">
        <p class="oracle-history-head">
          <span>过往记录</span>
          <button type="button" class="text-btn" id="oracleClearHistory">清空</button>
        </p>
        <div class="oracle-history-list" id="oracleHistoryList"></div>
      </div>

    </div>
  </div>
</dialog>
    `;
    document.body.appendChild(wrap);
  }

  /* ============================================================
     3. 镜中梦魇：抽签 / 召唤 / 密语库
     ============================================================ */
  function drawMirrorLine(kind) {
    const list = mirror[kind];
    if (!Array.isArray(list) || !list.length) return null;

    const ids = new Set(list.map((i) => i.id));
    let bag = (mirrorBags[kind] || []).filter((id) => ids.has(id));

    if (!bag.length) {
      bag = list.map((i) => i.id);
      for (let i = bag.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
    }
    const id = bag.pop();
    mirrorBags[kind] = bag;
    return list.find((i) => i.id === id) || list[0];
  }

  function applyChrome() {
    const g = $('#mirrorGreeting');
    if (g) g.textContent = mirror.greeting;
    const l = $('#mirrorSummonLabel');
    if (l) l.textContent = mirror.summonLabel;
  }

  function resetMirrorStage() {
    mirrorBusy = false;

    const eyes = $('#mirrorEyes');
    if (eyes) eyes.classList.remove('open');
    const eyesSvg = $('#mirrorEyesSvg');
    if (eyesSvg) eyesSvg.classList.remove('blink');

    const message = $('#mirrorMessage');
    if (message) {
      message.classList.remove('show');
      message.textContent = '';
      message.removeAttribute('data-tone');
    }

    const btn = $('#mirrorSummonBtn');
    if (btn) btn.disabled = false;

    const hint = $('#mirrorHint');
    if (hint) hint.textContent = '镜面会记住你的呼唤。';

    const glass = $('#mirrorGlass');
    if (glass) glass.classList.remove('rippling');
  }

  function reveal(line, tone) {
    const message = $('#mirrorMessage');
    if (!message || !line) return;
    message.textContent = personalize(line.text);
    message.dataset.tone = tone || 'speak';
    message.classList.remove('show');
    void message.offsetWidth;
    message.classList.add('show');
  }

  async function summon() {
    if (mirrorBusy) return;

    if (!mirror.cards.length) {
      toast('镜中密语库是空的，先写几句他会说的话');
      openMirrorLibrary();
      return;
    }

    mirrorBusy = true;

    const btn = $('#mirrorSummonBtn');
    const hint = $('#mirrorHint');
    const glass = $('#mirrorGlass');
    const eyes = $('#mirrorEyes');
    const eyesSvg = $('#mirrorEyesSvg');
    const message = $('#mirrorMessage');

    if (btn) btn.disabled = true;
    if (message) { message.classList.remove('show'); message.textContent = ''; }
    if (eyes) eyes.classList.remove('open');
    if (eyesSvg) eyesSvg.classList.remove('blink');
    if (hint) hint.textContent = '镜面泛起涟漪……';
    if (glass) glass.classList.add('rippling');

    await sleep(950);
    if (glass) glass.classList.remove('rippling');

    const present = Math.random() < 0.88;
    const willing = present && Math.random() < 0.82;

    if (!present) {
      if (hint) hint.textContent = '镜面暗了下去，没有一丝回应。';
      await sleep(340);
      reveal(drawMirrorLine('absent'), 'absent');
    } else if (!willing) {
      if (hint) hint.textContent = '镜面里亮起一双眼睛，又缓缓合上了。';
      if (eyes) eyes.classList.add('open');
      await sleep(850);
      if (eyes) eyes.classList.remove('open');
      await sleep(450);
      reveal(drawMirrorLine('refuse'), 'refuse');
    } else {
      if (hint) hint.textContent = '有人在镜子的另一端睁开了眼。';
      if (eyes) eyes.classList.add('open');
      await sleep(1100);
      if (eyesSvg) {
        eyesSvg.classList.remove('blink');
        void eyesSvg.offsetWidth;
        eyesSvg.classList.add('blink');
      }
      await sleep(560);
      reveal(drawMirrorLine('cards'), 'speak');
    }

    mirrorBusy = false;
    if (btn) btn.disabled = false;
    if (hint) hint.textContent = '想再听一次，就再叫一次。';
  }

  function openMirror() {
    applyChrome();
    resetMirrorStage();
    openDialog($('#mirrorDialog'));
  }

  function openMirrorLibrary() {
    mirrorDraft = {
      greeting: mirror.greeting,
      summonLabel: mirror.summonLabel,
      cards: mirror.cards.map((i) => ({ id: i.id, text: i.text })),
      absent: mirror.absent.map((i) => ({ id: i.id, text: i.text })),
      refuse: mirror.refuse.map((i) => ({ id: i.id, text: i.text }))
    };

    $('#mirrorGreetingInput').value = mirrorDraft.greeting;
    $('#mirrorSummonInput').value = mirrorDraft.summonLabel;
    $('#mirrorCardInput').value = '';
    $('#mirrorAbsentInput').value = '';
    $('#mirrorRefuseInput').value = '';

    renderDraft();
    openDialog($('#mirrorLibraryDialog'));
  }

  function renderDraft() {
    if (!mirrorDraft) return;
    renderLines('cards', $('#mirrorCardList'), 200);
    renderLines('absent', $('#mirrorAbsentList'), 60);
    renderLines('refuse', $('#mirrorRefuseList'), 60);
    const count = $('#mirrorCardCount');
    if (count) count.textContent = mirrorDraft.cards.length + ' 张';
  }

  function renderLines(kind, container, maxLength) {
    if (!container || !mirrorDraft) return;
    const list = mirrorDraft[kind];
    container.innerHTML = '';

    if (!list.length) {
      const empty = document.createElement('p');
      empty.style.color = '#7d625e';
      empty.style.fontSize = '10px';
      empty.style.margin = '2px 0';
      empty.textContent = kind === 'cards' ? '还没有密语，加一句吧。' : '留空时会自动使用默认提示。';
      container.appendChild(empty);
      return;
    }

    list.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'mirror-line';

      const input = document.createElement('input');
      input.className = 'input';
      input.maxLength = maxLength;
      input.value = item.text;
      input.setAttribute('aria-label', '第 ' + (index + 1) + ' 条');
      input.addEventListener('input', () => { item.text = input.value; });

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'status-del';
      del.textContent = '✕';
      del.setAttribute('aria-label', '删除这一条');
      del.style.cssText = 'flex:none;width:26px;height:26px;border:1px solid rgba(198,128,118,.2);border-radius:8px;background:transparent;color:#7d625e;font-size:10px;cursor:pointer;';
      del.addEventListener('click', () => {
        mirrorDraft[kind].splice(index, 1);
        renderDraft();
      });

      row.append(input, del);
      container.appendChild(row);
    });
  }

  function addLine(kind, inputEl, maxLength) {
    if (!mirrorDraft || !inputEl) return;
    const value = clamp(inputEl.value, maxLength);
    if (!value) { inputEl.focus(); return; }
    mirrorDraft[kind].push({ id: uid(), text: value });
    inputEl.value = '';
    renderDraft();
    inputEl.focus();
  }

  function saveLibrary(event) {
    if (event) event.preventDefault();
    if (!mirrorDraft) return;

    const clean = (list, maxLength) => list
      .map((i) => ({ id: i.id || uid(), text: clamp(i.text, maxLength) }))
      .filter((i) => i.text);

    const cards  = clean(mirrorDraft.cards, 200);
    const absent = clean(mirrorDraft.absent, 60);
    const refuse = clean(mirrorDraft.refuse, 60);

    mirror = {
      greeting:    clamp($('#mirrorGreetingInput').value, 60)    || DEFAULT.greeting,
      summonLabel: clamp($('#mirrorSummonInput').value, 12)      || DEFAULT.summonLabel,
      cards:  cards.length  ? cards  : defaultLines(DEFAULT.cards),
      absent: absent.length ? absent : defaultLines(DEFAULT.absent),
      refuse: refuse.length ? refuse : defaultLines(DEFAULT.refuse)
    };

    writeJSON(KEY, mirror);
    mirrorBags.cards = [];
    mirrorBags.absent = [];
    mirrorBags.refuse = [];
    mirrorDraft = null;

    applyChrome();
    $('#mirrorLibraryDialog').close();
    toast('镜中密语库已保存');
  }

  /* ============================================================
     4. 占卜
     ============================================================ */
  function drawLenormand(count) {
    const pool = LENORMAND.slice();
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, Math.min(count, pool.length));
  }

  function renderOracleCards(cards) {
    const container = $('#oracleCards');
    if (!container) return;
    container.innerHTML = '';
    cards.forEach((card, i) => {
      const el = document.createElement('div');
      el.className = 'oracle-card';
      el.style.animationDelay = (i * 0.08) + 's';

      const no = document.createElement('div');
      no.className = 'oracle-card-no';
      no.textContent = 'No.' + pad2(card.id);

      const name = document.createElement('div');
      name.className = 'oracle-card-name';
      name.textContent = card.name;

      const kw = document.createElement('div');
      kw.className = 'oracle-card-kw';
      kw.textContent = card.keywords;

      const meaning = document.createElement('div');
      meaning.className = 'oracle-card-meaning';
      meaning.textContent = card.meaning;

      el.append(no, name, kw, meaning);
      container.appendChild(el);
    });
  }

  function renderOracleHistory() {
    const list = $('#oracleHistoryList');
    if (!list) return;
    list.innerHTML = '';

    if (!oracleRecords.length) {
      const empty = document.createElement('p');
      empty.style.cssText = 'color:#7d625e;font-size:10px;margin:4px 0;text-align:center;';
      empty.textContent = '还没有连接记录。';
      list.appendChild(empty);
      return;
    }

    oracleRecords.forEach((record) => {
      const cards = (record.cardIds || [])
        .map((id) => LENORMAND.find((c) => c.id === id))
        .filter(Boolean);
      if (!cards.length) return;

      const el = document.createElement('div');
      el.className = 'oracle-record';

      const head = document.createElement('div');
      head.className = 'oracle-record-head';

      const time = document.createElement('span');
      time.textContent = formatTime(record.ts);

      const status = document.createElement('span');
      status.className = 'oracle-record-status ' + (record.result === 'success' ? 'ok' : 'fail');
      status.textContent = record.result === 'success' ? '连接成功' : '未成功';

      head.append(time, status);

      const cardsEl = document.createElement('div');
      cardsEl.className = 'oracle-record-cards';
      cardsEl.textContent = cards.map((c) => c.name).join(' · ');

      el.append(head, cardsEl);

      if (record.note) {
        const note = document.createElement('div');
        note.className = 'oracle-record-note';
        note.textContent = record.note;
        el.appendChild(note);
      }

      list.appendChild(el);
    });
  }

  function openOracle() {
    const mirrorDialog = $('#mirrorDialog');
    if (mirrorDialog && mirrorDialog.open) mirrorDialog.close();

    oracleCurrent = null;
    oracleBusy = false;
    oracleCount = 1;

    const setup = $('#oracleSetup');
    if (setup) setup.hidden = false;
    const result = $('#oracleResult');
    if (result) result.hidden = true;
    const opts = $('#oracleFeelOptions');
    if (opts) opts.hidden = true;
    const note = $('#oracleNote');
    if (note) note.value = '';
    const cardsEl = $('#oracleCards');
    if (cardsEl) cardsEl.innerHTML = '';
    const drawBtn = $('#oracleDrawBtn');
    if (drawBtn) { drawBtn.disabled = false; drawBtn.textContent = '连接 · 抽牌'; }

    $$('#oracleCountOptions .oracle-count-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.count === '1');
    });

    renderOracleHistory();
    openDialog($('#oracleDialog'));
  }

  async function drawOracle() {
    if (oracleBusy) return;
    oracleBusy = true;

    const btn = $('#oracleDrawBtn');
    if (btn) { btn.disabled = true; btn.textContent = '正在连接……'; }

    await sleep(1100);

    const cards = drawLenormand(oracleCount);
    oracleCurrent = { cards, note: '' };

    renderOracleCards(cards);

    const setup = $('#oracleSetup');
    if (setup) setup.hidden = true;
    const result = $('#oracleResult');
    if (result) result.hidden = false;
    const opts = $('#oracleFeelOptions');
    if (opts) opts.hidden = true;
    const note = $('#oracleNote');
    if (note) note.value = '';

    if (btn) { btn.disabled = false; btn.textContent = '连接 · 抽牌'; }
    oracleBusy = false;
  }

  function toggleFeelOptions() {
    const opts = $('#oracleFeelOptions');
    if (!opts) return;
    opts.hidden = !opts.hidden;
  }

  function finishOracle(result) {
    if (!oracleCurrent) return;

    const noteEl = $('#oracleNote');
    const note = noteEl ? noteEl.value.trim().slice(0, 800) : '';

    const record = {
      id: uid(),
      ts: Date.now(),
      cardIds: oracleCurrent.cards.map((c) => c.id),
      note,
      result: result === 'success' ? 'success' : 'fail'
    };

    oracleRecords.unshift(record);
    if (oracleRecords.length > 200) oracleRecords = oracleRecords.slice(0, 200);
    saveOracleRecords(oracleRecords);

    oracleCurrent = null;

    const setup = $('#oracleSetup');
    if (setup) setup.hidden = false;
    const resultPanel = $('#oracleResult');
    if (resultPanel) resultPanel.hidden = true;
    const opts = $('#oracleFeelOptions');
    if (opts) opts.hidden = true;
    if (noteEl) noteEl.value = '';
    const cardsEl = $('#oracleCards');
    if (cardsEl) cardsEl.innerHTML = '';

    renderOracleHistory();
    toast(result === 'success' ? '连接成功，记录已保存' : '记录已保存');
  }

  function clearOracleHistory() {
    if (!oracleRecords.length) { toast('还没有占卜记录'); return; }
    if (!window.confirm('确定要清空所有占卜记录吗？此操作不可撤销。')) return;
    oracleRecords = [];
    saveOracleRecords(oracleRecords);
    renderOracleHistory();
    toast('占卜记录已清空');
  }

  /* ============================================================
     5. 事件绑定
     ============================================================ */
  function bindBrandMark() {
    const mark = document.querySelector('.brand-mark');
    if (!mark) return;
    mark.setAttribute('role', 'button');
    mark.setAttribute('tabindex', '0');
    mark.setAttribute('title', '对着镜子呼唤');
    mark.addEventListener('click', openMirror);
    mark.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMirror(); }
    });
  }

  function bindEvents() {
    $('#mirrorLibraryBtn').addEventListener('click', openMirrorLibrary);
    $('#mirrorSummonBtn').addEventListener('click', summon);
    $('#mirrorOracleBtn').addEventListener('click', openOracle);

    $('#mirrorCardAddBtn').addEventListener('click', () => addLine('cards', $('#mirrorCardInput'), 200));
    $('#mirrorAbsentAddBtn').addEventListener('click', () => addLine('absent', $('#mirrorAbsentInput'), 60));
    $('#mirrorRefuseAddBtn').addEventListener('click', () => addLine('refuse', $('#mirrorRefuseInput'), 60));

    [['mirrorCardInput', 'cards', 200], ['mirrorAbsentInput', 'absent', 60], ['mirrorRefuseInput', 'refuse', 60]]
      .forEach(([id, kind, max]) => {
        const el = $('#' + id);
        if (!el) return;
        el.addEventListener('keydown', (e) => {
          if (e.key !== 'Enter') return;
          e.preventDefault();
          addLine(kind, el, max);
        });
      });

    $('#mirrorLibraryForm').addEventListener('submit', saveLibrary);

    $('#mirrorDialog').addEventListener('close', () => resetMirrorStage());

    /* 占卜 */
    $$('#oracleCountOptions .oracle-count-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        oracleCount = parseInt(btn.dataset.count, 10) || 1;
        $$('#oracleCountOptions .oracle-count-btn').forEach((b) => {
          b.classList.toggle('active', b === btn);
        });
      });
    });

    $('#oracleDrawBtn').addEventListener('click', drawOracle);
    $('#oracleFeltBtn').addEventListener('click', toggleFeelOptions);

    $$('#oracleFeelOptions .oracle-feel-opt').forEach((btn) => {
      btn.addEventListener('click', () => finishOracle(btn.dataset.result));
    });

    $('#oracleClearHistory').addEventListener('click', clearOracleHistory);

    /* 通用：data-close + 点击背景关闭 */
    $$('#mirrorInjectRoot [data-close]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dialog = btn.closest('dialog');
        if (dialog) dialog.close();
      });
    });

    $$('#mirrorInjectRoot dialog.modal').forEach((dialog) => {
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.close();
      });
    });
  }

  /* ============================================================
     6. 启动
     ============================================================ */
  function init() {
    if (document.getElementById('mirrorDialog')) {
      console.warn('[mirror] 检测到旧版手动改动，本模块已跳过注入。请撤销旧改动后再使用。');
      return;
    }

    injectCSS();
    injectHTML();
    bindBrandMark();
    bindEvents();
    applyChrome();
    writeJSON(KEY, mirror);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();