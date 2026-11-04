/* ============================================================
   调频 · 能量图腾 + 宇宙订单 + 照镜子 + 秘密留言（v10）
   ============================================================ */
(() => {
  'use strict';
  console.log('[tuning] 加载 v10');

  /* ===== 情绪数据 ===== */
  const TIERS = {
    high: [
      { key:'love',        name:'爱',   color:'#f5b8d0', bg:'#8a3a5c', desc:'心中满溢，愿意给予。' },
      { key:'joy',         name:'喜悦', color:'#ffe066', bg:'#8a7a20', desc:'轻快明亮，笑意自然。' },
      { key:'gratitude',   name:'感恩', color:'#e8c47a', bg:'#7a5c20', desc:'珍惜已有，心生温暖。' },
      { key:'peace',       name:'平静', color:'#a8d8f0', bg:'#2a5a7a', desc:'如水面般安然无波。' },
      { key:'compassion',  name:'慈悲', color:'#6ec98a', bg:'#1a5a3a', desc:'看见他人，也看见自己。' },
      { key:'forgiveness', name:'宽恕', color:'#d4b8e8', bg:'#4a3a6a', desc:'放下执念，放过彼此。' },
      { key:'acceptance',  name:'接纳', color:'#e8e8ec', bg:'#5a5a62', desc:'如其所是，不再对抗。' },
      { key:'trust',       name:'信任', color:'#4a7ac8', bg:'#1a3a6a', desc:'相信流动，相信对方。' },
      { key:'freedom',     name:'自由', color:'#4ac0c8', bg:'#1a5a60', desc:'不被困住，随风而行。' },
      { key:'oneness',     name:'合一', color:'#f5e8a0', bg:'#8a7a20', desc:'边界消融，与万物相连。' }
    ],
    mid: [
      { key:'courage',    name:'勇气', color:'#d8443a', bg:'#6a1a14', desc:'即使害怕，也向前一步。' },
      { key:'initiative', name:'主动', color:'#e88a3a', bg:'#7a3a10', desc:'愿意先伸手，先开口。' },
      { key:'reason',     name:'理性', color:'#e8d44a', bg:'#6a5a10', desc:'用清晰辨认混乱。' },
      { key:'neutral',    name:'中立', color:'#8090a8', bg:'#3a4a5a', desc:'不偏不倚，旁观自处。' },
      { key:'explore',    name:'探索', color:'#3ac0a0', bg:'#1a5a4a', desc:'好奇未卜，走向未知。' },
      { key:'boundary',   name:'边界', color:'#4a6a3a', bg:'#2a3a1a', desc:'知道自己在哪里结束。' },
      { key:'discern',    name:'分辨', color:'#3a4aa8', bg:'#1a1a5a', desc:'看清什么该留下。' }
    ],
    low: [
      { key:'shame',    name:'羞耻', color:'#3a3a3e', bg:'#1a1a1e', desc:'想要消失，不敢被看见。' },
      { key:'guilt',    name:'内疚', color:'#6e5a2e', bg:'#3a2e10', desc:'觉得自己亏欠了什么。' },
      { key:'apathy',   name:'冷漠', color:'#7a7a82', bg:'#3a3a42', desc:'一切都无所谓，风也吹不动。' },
      { key:'sadness',  name:'悲伤', color:'#2e4a7a', bg:'#101a3a', desc:'有什么正在缓缓沉下去。' },
      { key:'fear',     name:'恐惧', color:'#1e1e2e', bg:'#08081a', desc:'绷紧身体，等待坏消息。' },
      { key:'desire',   name:'欲望', color:'#7a1a2e', bg:'#3a0814', desc:'被想要的感觉吞没。' },
      { key:'anger',    name:'愤怒', color:'#c82222', bg:'#5a0808', desc:'灼热的东西在体内翻涌。' },
      { key:'pride',    name:'骄傲', color:'#9a7a3a', bg:'#4a3a10', desc:'站得太高，看不见别人。' },
      { key:'envy',     name:'嫉妒', color:'#3a5a3a', bg:'#1a2a1a', desc:'看别人时，眼里有火。' },
      { key:'control',  name:'控制', color:'#3a1e4a', bg:'#1a0a25', desc:'不敢松手，怕失去一切。' },
      { key:'scarcity', name:'匮乏', color:'#5a4a3a', bg:'#2a1e10', desc:'总觉得不够，总觉得会被拿走。' },
      { key:'anxiety',  name:'焦虑', color:'#8a8a3a', bg:'#4a4a10', desc:'心里有只不停的鸟。' }
    ]
  };
  const TIER_NAMES = { high:'高频', mid:'中频', low:'低频' };
  const TIER_RANK = { high:2, mid:1, low:0 };

  const ADVICE = {
    anxiety:  { first:'4-6 呼吸、泡脚',        next:'写可控清单，只做一件' },
    fear:     { first:'5-4-3-2-1 落地',         next:'深蓝观想 + 小行动' },
    anger:    { first:'快走 / 抖手 2 分钟',     next:'表达边界，不攻击' },
    sadness:  { first:'允许流泪、保暖',         next:'淡粉 / 暖金观想，找人陪' },
    shame:    { first:'手放胸口自我慈悲',       next:'银白观想，停止自我惩罚' },
    guilt:    { first:'能修复就修复',           next:'做一件善事，停止赎罪' },
    apathy:   { first:'晒太阳、哼唱',           next:'2 分钟微行动' },
    desire:   { first:'延迟 10 分钟',           next:'问真实需要，喝水散步' },
    control:  { first:'写交托清单',             next:'天蓝呼吸，只控下一步' },
    pride:    { first:'匿名好事 / 真诚感谢',    next:'接地，防「高频优越感」' },
    envy:     { first:'承认匮乏感',             next:'祝福对方 + 做自己的下一步' },
    scarcity: { first:'数已有资源',             next:'土褐落地，做具体积累' }
  };
  const STABLE_ADVICE = {
    high:'此刻是明亮的——享受这份清晰，让它自然流动。',
    mid: '此刻是稳定的——保持这个节奏，不用着急。'
  };

  /* ===== 100 条阻碍 ===== */
  const OBSTACLE_GROUPS = {
    goal:'目标与信念', emotion:'情绪与关系', behavior:'行为与选择',
    body:'控制 · 身体 · 环境', collective:'集体信念与误用', custom:'自定义'
  };
  const BUILTIN_OBSTACLES = [
    { id:'o_001', text:'目标模糊：不知道要什么', group:'goal' },
    { id:'o_002', text:'矛盾信念：想要又觉得不可能', group:'goal' },
    { id:'o_003', text:'不配得感：我不值得', group:'goal' },
    { id:'o_004', text:'恐惧失去：越想要越抓', group:'goal' },
    { id:'o_005', text:'反复怀疑：真的会成吗', group:'goal' },
    { id:'o_006', text:'匮乏聚焦：总看没有什么', group:'goal' },
    { id:'o_007', text:'只观想不行动', group:'goal' },
    { id:'o_008', text:'行动焦虑驱动：越做越耗', group:'goal' },
    { id:'o_009', text:'不允许接收：来了也推开', group:'goal' },
    { id:'o_010', text:'控制时间方式：必须按我想的', group:'goal' },
    { id:'o_011', text:'执念抓取：非成不可', group:'goal' },
    { id:'o_012', text:'自我概念低：我不够好', group:'goal' },
    { id:'o_013', text:'害怕成功：怕承担后果', group:'goal' },
    { id:'o_014', text:'害怕失败：怕证明不行', group:'goal' },
    { id:'o_015', text:'害怕被看见、被评判', group:'goal' },
    { id:'o_016', text:'内疚自责：我不该要', group:'goal' },
    { id:'o_017', text:'羞耻感：欲望可耻', group:'goal' },
    { id:'o_018', text:'愤怒怨恨：能量被占用', group:'goal' },
    { id:'o_019', text:'受害者意识：都是别人害我', group:'goal' },
    { id:'o_020', text:'拯救者情结：先救别人', group:'goal' },
    { id:'o_021', text:'讨好模式：不敢要求', group:'emotion' },
    { id:'o_022', text:'边界不清：不敢拒绝', group:'emotion' },
    { id:'o_023', text:'外部验证：靠别人认可', group:'emotion' },
    { id:'o_024', text:'比较嫉妒：别人有我没有', group:'emotion' },
    { id:'o_025', text:'抱怨吐槽：强化缺乏', group:'emotion' },
    { id:'o_026', text:'感恩形式化：嘴上感恩心里不信', group:'emotion' },
    { id:'o_027', text:'视觉化太用力：越观想越焦虑', group:'emotion' },
    { id:'o_028', text:'感觉强迫：必须一直高兴', group:'emotion' },
    { id:'o_029', text:'压情绪装高频', group:'emotion' },
    { id:'o_030', text:'灵性逃避：用光逃避现实', group:'emotion' },
    { id:'o_031', text:'高频优越感：我比你高', group:'emotion' },
    { id:'o_032', text:'排斥低频：制造分离', group:'emotion' },
    { id:'o_033', text:'回音室：只听同频', group:'emotion' },
    { id:'o_034', text:'否认负面：不面对现实', group:'emotion' },
    { id:'o_035', text:'不接地：只飘不做', group:'emotion' },
    { id:'o_036', text:'信息过载：天天看显化', group:'emotion' },
    { id:'o_037', text:'目标太多：能量分散', group:'emotion' },
    { id:'o_038', text:'优先级混乱：什么都想要', group:'emotion' },
    { id:'o_039', text:'身份不匹配：还是旧的我', group:'emotion' },
    { id:'o_040', text:'说一套做一套', group:'emotion' },
    { id:'o_041', text:'拖延：等准备好', group:'behavior' },
    { id:'o_042', text:'完美主义：不能出错', group:'behavior' },
    { id:'o_043', text:'害怕承诺：怕锁死', group:'behavior' },
    { id:'o_044', text:'害怕责任：不想承担', group:'behavior' },
    { id:'o_045', text:'害怕自由：不敢选', group:'behavior' },
    { id:'o_046', text:'害怕孤独：抓着关系', group:'behavior' },
    { id:'o_047', text:'害怕亲密：推开爱', group:'behavior' },
    { id:'o_048', text:'害怕冲突：不敢谈边界', group:'behavior' },
    { id:'o_049', text:'不敢求助', group:'behavior' },
    { id:'o_050', text:'不接受帮助', group:'behavior' },
    { id:'o_051', text:'拒绝反馈', group:'behavior' },
    { id:'o_052', text:'不记录不复盘', group:'behavior' },
    { id:'o_053', text:'不调整路径', group:'behavior' },
    { id:'o_054', text:'目标不是自己的：父母 / 社会要的', group:'behavior' },
    { id:'o_055', text:'目标来自恐惧：为证明自己', group:'behavior' },
    { id:'o_056', text:'目标来自匮乏：为填补空洞', group:'behavior' },
    { id:'o_057', text:'目标违背价值观', group:'behavior' },
    { id:'o_058', text:'目标太大无拆解', group:'behavior' },
    { id:'o_059', text:'期限不现实', group:'behavior' },
    { id:'o_060', text:'只等时机', group:'behavior' },
    { id:'o_061', text:'等别人改变', group:'body' },
    { id:'o_062', text:'把显化当控制别人', group:'body' },
    { id:'o_063', text:'把显化当魔法按钮', group:'body' },
    { id:'o_064', text:'忽略现实步骤', group:'body' },
    { id:'o_065', text:'忽略医疗、法律、财务', group:'body' },
    { id:'o_066', text:'睡眠不足', group:'body' },
    { id:'o_067', text:'身体疲惫', group:'body' },
    { id:'o_068', text:'压力过载', group:'body' },
    { id:'o_069', text:'创伤触发', group:'body' },
    { id:'o_070', text:'上瘾分心：短视频 / 游戏', group:'body' },
    { id:'o_071', text:'多巴胺刷屏', group:'body' },
    { id:'o_072', text:'酒精 / 药物依赖（需专业帮助）', group:'body' },
    { id:'o_073', text:'饮食混乱', group:'body' },
    { id:'o_074', text:'缺乏运动', group:'body' },
    { id:'o_075', text:'不晒太阳、不接地', group:'body' },
    { id:'o_076', text:'空间杂乱', group:'body' },
    { id:'o_077', text:'环境负面：持续被打压', group:'body' },
    { id:'o_078', text:'社交圈消耗', group:'body' },
    { id:'o_079', text:'家庭集体信念', group:'body' },
    { id:'o_080', text:'父母期待', group:'body' },
    { id:'o_081', text:'同辈压力', group:'collective' },
    { id:'o_082', text:'社会比较', group:'collective' },
    { id:'o_083', text:'算法投喂', group:'collective' },
    { id:'o_084', text:'消费主义：买 = 解决', group:'collective' },
    { id:'o_085', text:'债务焦虑', group:'collective' },
    { id:'o_086', text:'收入天花板信念', group:'collective' },
    { id:'o_087', text:'时间稀缺感', group:'collective' },
    { id:'o_088', text:'竞争信念', group:'collective' },
    { id:'o_089', text:'零和信念：别人得我就少', group:'collective' },
    { id:'o_090', text:'必须辛苦才配得', group:'collective' },
    { id:'o_091', text:'钱是脏的、富人不道德', group:'collective' },
    { id:'o_092', text:'爱要牺牲、痛苦才是爱', group:'collective' },
    { id:'o_093', text:'关系要抓、查岗控制', group:'collective' },
    { id:'o_094', text:'必须完美才被爱', group:'collective' },
    { id:'o_095', text:'不能休息、忙碌成瘾', group:'collective' },
    { id:'o_096', text:'不能自私、必须有用', group:'collective' },
    { id:'o_097', text:'性羞耻、身体羞耻', group:'collective' },
    { id:'o_098', text:'害怕欲望、害怕力量', group:'collective' },
    { id:'o_099', text:'道德内疚、赎罪模式', group:'collective' },
    { id:'o_100', text:'用「频率不够」责怪自己或他人', group:'collective' }
  ];

  /* ===== 情绪池 ===== */
  const ALL_EMOTIONS = [];
  TIERS.high.forEach(e => ALL_EMOTIONS.push(Object.assign({ tier:'high' }, e)));
  TIERS.mid.forEach(e => ALL_EMOTIONS.push(Object.assign({ tier:'mid' }, e)));
  TIERS.low.forEach(e => ALL_EMOTIONS.push(Object.assign({ tier:'low' }, e)));

  function pickRandomEnergy() {
    const idx = Math.floor(Math.random() * ALL_EMOTIONS.length);
    return Object.assign({}, ALL_EMOTIONS[idx]);
  }
  function calcUserEnergy() { const e = pickRandomEnergy(); console.log('[tuning] 你 →', TIER_NAMES[e.tier], e.name); return e; }
  function calcMuseEnergy() { const e = pickRandomEnergy(); console.log('[tuning] 他 →', TIER_NAMES[e.tier], e.name); return e; }

  /* ===== 存储 ===== */
  const HISTORY_KEY = 'jingyan.tuning.history.v1';
  const MANIFEST_KEY = 'jingyan.manifest.v1';
  const LAST_KEY = 'jingyan.tuning.last.v1';
  const OBSTACLE_KEY = 'jingyan.tuning.obstacles.v1';
  const MIRROR_LOG_KEY = 'jingyan.tuning.mirrorLog.v1';
  const SECRET_KEY = 'jingyan.tuning.secretBoard.v1';
  const HISTORY_MAX = 5;
  const MIRROR_LOG_MAX = 200;
  const SECRET_MAX = 100;

  function readJSON(k, fb) { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch (e) { return fb; } }
  function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  function loadHistory() { const list = readJSON(HISTORY_KEY, []); return Array.isArray(list) ? list.slice(0, HISTORY_MAX) : []; }
  function saveHistory(entry) { const list = loadHistory(); list.unshift(entry); writeJSON(HISTORY_KEY, list.slice(0, HISTORY_MAX)); }

  function loadOrders() { const d = readJSON(MANIFEST_KEY, { orders: [] }); return Array.isArray(d.orders) ? d.orders : []; }
  function saveOrders(orders) { writeJSON(MANIFEST_KEY, { orders: orders.slice(0, 100) }); }
  function loadLastTuning() { return readJSON(LAST_KEY, null); }
  function saveLastTuning(d) { writeJSON(LAST_KEY, d); }

  function loadObstacleState() {
    const d = readJSON(OBSTACLE_KEY, { custom:[], hidden:[] });
    return { custom: Array.isArray(d.custom)?d.custom:[], hidden: Array.isArray(d.hidden)?d.hidden:[] };
  }
  function saveObstacleState(s) { writeJSON(OBSTACLE_KEY, { custom:s.custom, hidden:s.hidden }); }
  function getActiveObstacles() {
    const s = loadObstacleState();
    const hiddenSet = new Set(s.hidden);
    const builtins = BUILTIN_OBSTACLES.filter(o => !hiddenSet.has(o.id));
    const customs = s.custom.map(o => Object.assign({}, o, { custom:true, group:'custom' }));
    return builtins.concat(customs);
  }

  function loadMirrorLog() {
    const d = readJSON(MIRROR_LOG_KEY, { records: [] });
    const list = d && Array.isArray(d.records) ? d.records : [];
    return list.filter(r => r && typeof r.text === 'string');
  }
  function saveMirrorLog(list) { writeJSON(MIRROR_LOG_KEY, { records: list.slice(0, MIRROR_LOG_MAX) }); }
  function addMirrorLog(obstacle) {
    const log = loadMirrorLog();
    const now = Date.now();
    const existing = log.find(r => r.obstacleId === obstacle.id);
    if (existing) {
      existing.lastSeenAt = now;
      existing.times = (Number(existing.times) || 1) + 1;
    } else {
      log.unshift({ id:'r_' + now.toString(36) + '_' + Math.random().toString(36).slice(2,6),
        obstacleId: obstacle.id, text: obstacle.text, group: obstacle.group,
        firstSeenAt: now, lastSeenAt: now, times: 1 });
    }
    log.sort((a, b) => b.lastSeenAt - a.lastSeenAt);
    saveMirrorLog(log);
  }
  function removeMirrorLog(id) { saveMirrorLog(loadMirrorLog().filter(r => r.id !== id)); }

  /* 秘密留言 */
  function loadSecretMessages() {
    const d = readJSON(SECRET_KEY, { messages: [] });
    return Array.isArray(d.messages) ? d.messages : [];
  }
  function saveSecretMessages(list) { writeJSON(SECRET_KEY, { messages: list.slice(0, SECRET_MAX) }); }

  function timeAgo(ts) {
    const diff = Date.now() - ts;
    const min = Math.floor(diff / 60000);
    if (min < 1) return '刚刚';
    if (min < 60) return min + ' 分钟前';
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr + ' 小时前';
    return Math.floor(hr / 24) + ' 天前';
  }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function formatDate(ts) {
    const d = new Date(ts);
    const now = new Date();
    const today = now.toDateString();
    const yesterday = new Date(now.getTime() - 86400000).toDateString();
    const ds = d.toDateString();
    const timeStr = pad2(d.getHours()) + ':' + pad2(d.getMinutes());
    if (ds === today) return '今天 ' + timeStr;
    if (ds === yesterday) return '昨天 ' + timeStr;
    return (d.getMonth()+1) + '月' + d.getDate() + '日 ' + timeStr;
  }
  function showToast(text) {
    let rootEl = document.getElementById('toastRoot');
    if (!rootEl) {
      rootEl = document.createElement('div');
      rootEl.id = 'toastRoot';
      rootEl.className = 'toast-root';
      rootEl.setAttribute('role', 'status');
      rootEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(rootEl);
    }
    const item = document.createElement('div');
    item.className = 'toast';
    item.textContent = text;
    rootEl.appendChild(item);
    window.setTimeout(() => {
      item.classList.add('out');
      window.setTimeout(() => item.remove(), 280);
    }, 2400);
  }

  /* ===== 显化理论 ===== */
  const MANIFEST_THEORY = [
    { title:'核心奥义', blocks:[
      { type:'quote', text:'“你生命中所发生的一切都是你吸引来的；你持续聚焦并强烈感觉到的思想，会吸引同类现实进入你的生命——所以坚定地要求你想要的、相信它已经成为你的、以已经拥有的感觉和感恩去接收。”' },
      { type:'paragraph', text:'对应《秘密》的三步骤：要求 — 相信 — 接收。' }
    ] },
    { title:'显化公式', blocks:[
      { type:'formula', text:'清晰意图 + 状态调频 + 信念清理 + 对齐行动 + 允许接收 + 现实条件 / 时间' },
      { type:'paragraph', text:'“频率”主要影响：注意力焦点 / 行为质量 / 关系场 / 阻力大小 / 承接能力。' }
    ] },
    { title:'高频对显化的帮助', blocks:[
      { type:'list', items:[
        '减少内耗，行动更清晰',
        '提高觉察，容易识别匹配机会',
        '改善关系场，增加合作与支持',
        '增强配得感和允许接收',
        '降低抓取和控制，反而减少阻力',
        '高频后的落地行动更容易持续'
      ] }
    ] },
    { title:'低频不是「不能显化」', blocks:[
      { type:'paragraph', text:'低频是信号，不是坏东西。但容易：' },
      { type:'list', items:[
        '注意力窄化，只看到匮乏和危险',
        '行为被恐惧 / 愤怒 / 羞耻驱动，容易抓取、控制、逃避',
        '发出矛盾信号：「我想要，但我不配 / 我不信 / 我怕失去」',
        '显化出短暂结果后又自我破坏',
        '把「调频」变成压情绪，形成更大阻力'
      ] },
      { type:'paragraph', text:'压抑低频装高频，通常比诚实觉察更阻碍显化。' }
    ] },
    { title:'高频 ≠ 亢奋 ≠ 永远积极', blocks:[
      { type:'paragraph', text:'真正有利于显化的高频，常表现为：' },
      { type:'list', items:[
        '身体松、呼吸稳',
        '边界清，不拯救不控制',
        '意图清晰，但不过度执着',
        '能允许不确定',
        '有爱，也有分辨',
        '调频后能落地行动'
      ] },
      { type:'paragraph', text:'「天天粉光观想、拒绝负面情绪」——这更像灵性 bypass，不是稳定高频。' }
    ] },
    { title:'显化中最常见的阻力', blocks:[
      { type:'list', items:[
        '不配得感：想要，但觉得自己不够好',
        '恐惧失去：越想要越抓取',
        '矛盾信念：嘴上想要，心里觉得不可能',
        '羞耻 / 内疚：觉得自己不配拥有',
        '控制欲：必须按我想要的时间方式发生',
        '拯救者 / 受害者模式：把显化当成别人改变',
        '只调频不行动：观想很多，现实步骤很少',
        '只行动不调频：焦虑驱动，越做越耗'
      ] }
    ] }
  ];

  /* ===== CSS ===== */
  function injectCSS() {
    if (document.getElementById('tuningStyle')) return;
    const style = document.createElement('style');
    style.id = 'tuningStyle';
    style.textContent = `
.view-tuning { display:none; }
.view-tuning.active { display:flex; flex-direction:column; width:100%; max-width:720px; height:100%; margin:0 auto; overflow:hidden; border:1px solid rgba(var(--accent-rgb,181,111,107),.18); border-radius:20px; background:radial-gradient(100% 60% at 20% 0%,rgba(var(--accent-2-rgb,124,48,53),.18),transparent 62%),linear-gradient(170deg,rgba(23,8,10,.9),rgba(8,3,4,.95)); box-shadow:0 0 0 6px rgba(52,16,19,.2),0 0 0 7px rgba(var(--accent-rgb,181,111,107),.1),0 50px 130px -50px #000; backdrop-filter:blur(14px); box-sizing:border-box; animation:viewIn .4s ease both; }

.tuning-tabs { display:flex; gap:4px; padding:4px 22px 0; border-bottom:1px solid rgba(var(--accent-rgb,181,111,107),.14); flex-shrink:0; overflow-x:auto; scrollbar-width:none; }
.tuning-tabs::-webkit-scrollbar { display:none; }
.tuning-tab { position:relative; padding:10px 14px; border:none; background:none; color:var(--muted-2,#7d625e); font-family:var(--font-serif,serif); font-size:12.5px; letter-spacing:.12em; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:color .18s; white-space:nowrap; flex-shrink:0; }
.tuning-tab:hover { color:var(--text,#f0e3dd); }
.tuning-tab.active { color:#f5e8c0; }
.tuning-tab.active::after { content:""; position:absolute; left:14px; right:14px; bottom:-1px; height:2px; background:linear-gradient(90deg,transparent,rgba(var(--gold-rgb,185,154,114),.9),transparent); border-radius:2px; }

.tuning-scroll { flex:1; min-height:0; overflow-y:auto; overflow-x:hidden; padding:6px 22px 36px; scrollbar-width:thin; scrollbar-color:rgba(var(--accent-rgb,181,111,107),.22) transparent; }
.tuning-scroll::-webkit-scrollbar { width:6px; }
.tuning-scroll::-webkit-scrollbar-thumb { border-radius:999px; background:rgba(var(--accent-rgb,181,111,107),.22); }
.tuning-scroll[hidden] { display:none !important; }

/* 调频 */
.tuning-stage { display:flex; flex-direction:column; align-items:center; padding:12px 0 6px; gap:14px; }
.tuning-totem { width:min(260px,68vw); height:min(260px,68vw); padding:0; border:none; background:transparent; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:transform .22s,filter .22s; display:block; }
.tuning-totem:hover { transform:scale(1.02); filter:brightness(1.08); }
.tuning-totem:active { transform:scale(.97); }
.tuning-totem svg { width:100%; height:100%; display:block; overflow:visible; }
.tuning-waves .tw { stroke-dasharray:8 6; stroke-dashoffset:0; animation:tuningFlow 4s linear infinite; opacity:.65; }
.tuning-waves .tw2 { animation-delay:-.7s; opacity:.5; }
.tuning-waves .tw3 { animation-delay:-1.4s; opacity:.4; }
.tuning-waves .tw4 { animation-delay:-2.1s; opacity:.55; }
.tuning-totem.sensing .tw { animation-duration:.9s; opacity:1; stroke-width:1.4; }
.tuning-totem.sensing svg circle:nth-child(1) { animation:tuningGlow 1.6s ease-in-out infinite; }
@keyframes tuningFlow { from { stroke-dashoffset:0; } to { stroke-dashoffset:-28; } }
@keyframes tuningGlow { 0%,100% { opacity:.7; } 50% { opacity:1; } }
.tuning-hint { margin:0; color:var(--muted-2,#7d625e); font-size:12px; letter-spacing:.08em; text-align:center; min-height:18px; }
.tuning-sense-btn { min-width:170px; padding:10px 24px !important; font-size:13px !important; }

.tuning-result { display:grid; grid-template-columns:1fr auto 1fr; gap:14px; align-items:stretch; margin-top:6px; }
.tuning-result:empty { display:none; }
.tuning-energy-card { display:flex; flex-direction:column; align-items:center; text-align:center; gap:8px; padding:18px 14px 16px; border:1px solid rgba(var(--accent-rgb,181,111,107),.2); border-radius:14px; background:radial-gradient(120% 100% at 50% 0%,rgba(var(--accent-rgb,181,111,107),.1),transparent 62%),rgba(255,255,255,.02); animation:tuningCardIn .55s cubic-bezier(.2,.8,.3,1) both; }
.tuning-energy-card:nth-child(3) { animation-delay:.15s; }
@keyframes tuningCardIn { from { opacity:0; transform:translateY(8px) scale(.96); } to { opacity:1; transform:none; } }
.tuning-energy-label { margin:0; color:var(--muted-2,#7d625e); font-size:10px; letter-spacing:.2em; text-transform:uppercase; }
.tuning-energy-dot { width:74px; height:74px; border-radius:50%; margin:4px 0; animation:tuningPulse 3s ease-in-out infinite; flex-shrink:0; }
@keyframes tuningPulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.06); } }
.tuning-energy-name { font-family:var(--font-serif,serif); font-size:22px; letter-spacing:.1em; color:var(--e-color,#f0e3dd); text-shadow:0 0 22px var(--e-color,transparent); line-height:1.2; }
.tuning-energy-tier { display:inline-block; padding:2px 10px; border-radius:999px; font-size:10px; letter-spacing:.08em; border:1px solid; white-space:nowrap; }
.tuning-tier-high { color:#d9c8a8; border-color:rgba(217,200,168,.42); background:rgba(217,200,168,.08); }
.tuning-tier-mid  { color:#a8c8d0; border-color:rgba(168,200,208,.42); background:rgba(168,200,208,.08); }
.tuning-tier-low  { color:#a89090; border-color:rgba(168,144,144,.42); background:rgba(168,144,144,.08); }
.tuning-energy-desc { margin:4px 0 0; color:var(--muted,#b09993); font-size:11.5px; line-height:1.7; letter-spacing:.02em; }
.tuning-arrow { align-self:center; color:rgba(var(--gold-rgb,185,154,114),.55); font-size:22px; font-family:var(--font-serif,serif); line-height:1; user-select:none; }

.tuning-gap { grid-column:1 / -1; margin:4px 0 0; padding:12px 18px; border-radius:12px; font-family:var(--font-serif,serif); font-size:13.5px; letter-spacing:.04em; line-height:1.8; text-align:center; font-style:italic; animation:tuningCardIn .55s cubic-bezier(.2,.8,.3,1) both; animation-delay:.3s; }
.tuning-gap.gap-good { color:#d9c8a8; border:1px solid rgba(217,200,168,.3); background:rgba(217,200,168,.05); }
.tuning-gap.gap-mid  { color:#c9b8a0; border:1px solid rgba(185,154,114,.25); background:rgba(185,154,114,.04); }
.tuning-gap.gap-far  { color:#b09090; border:1px solid rgba(168,144,144,.28); background:rgba(140,120,120,.05); }
.tuning-note { grid-column:1 / -1; margin:0; color:var(--muted-2,#7d625e); font-size:10px; letter-spacing:.08em; text-align:center; animation:tuningCardIn .55s ease both; animation-delay:.4s; }

.tuning-suggestion { grid-column:1 / -1; margin:6px 0 0; padding:14px 18px 14px 20px; border-left:3px solid rgba(var(--gold-rgb,185,154,114),.6); border-radius:0 10px 10px 0; background:rgba(var(--gold-rgb,185,154,114),.05); animation:tuningCardIn .55s cubic-bezier(.2,.8,.3,1) both; animation-delay:.3s; }
.tuning-suggestion-label { display:block; color:rgba(var(--gold-rgb,185,154,114),.7); font-size:9.5px; letter-spacing:.22em; margin-bottom:6px; }
.tuning-suggestion-text { margin:0; color:#d9c8a8; font-family:var(--font-serif,serif); font-size:13px; line-height:1.85; font-style:italic; letter-spacing:.02em; }

.tuning-action { grid-column:1 / -1; margin:6px 0 0; padding:16px 18px 14px; border:1px solid rgba(var(--gold-rgb,185,154,114),.22); border-radius:12px; background:radial-gradient(120% 100% at 0% 0%,rgba(var(--gold-rgb,185,154,114),.06),transparent 62%),rgba(255,255,255,.012); animation:tuningCardIn .55s cubic-bezier(.2,.8,.3,1) both; animation-delay:.38s; }
.tuning-action-label { display:flex; align-items:center; gap:6px; color:rgba(var(--gold-rgb,185,154,114),.75); font-size:9.5px; letter-spacing:.22em; margin-bottom:12px; }
.tuning-action-label::before { content:"✦"; font-size:10px; color:rgba(var(--gold-rgb,185,154,114),.9); }
.tuning-action-steps { display:flex; flex-direction:column; gap:9px; }
.tuning-action-step { display:flex; align-items:flex-start; gap:10px; }
.tuning-action-num { flex:none; display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:50%; border:1px solid rgba(var(--gold-rgb,185,154,114),.45); color:rgba(var(--gold-rgb,185,154,114),.95); font-family:var(--font-serif,serif); font-size:11px; line-height:1; background:rgba(var(--gold-rgb,185,154,114),.06); }
.tuning-action-text { color:#e0d2c4; font-family:var(--font-serif,serif); font-size:13.5px; line-height:1.7; letter-spacing:.02em; padding-top:3px; }
.tuning-action-stable { margin:0; color:rgba(var(--gold-rgb,185,154,114),.6); font-family:var(--font-serif,serif); font-size:13px; line-height:1.75; font-style:italic; letter-spacing:.02em; }

.tuning-history { grid-column:1 / -1; margin:14px 0 0; padding:14px 16px 10px; border-top:1px dashed rgba(var(--gold-rgb,185,154,114),.18); animation:tuningCardIn .55s ease both; animation-delay:.5s; }
.tuning-history-label { display:flex; align-items:center; justify-content:space-between; color:rgba(var(--gold-rgb,185,154,114),.55); font-size:9.5px; letter-spacing:.22em; margin-bottom:10px; }
.tuning-history-pool { color:rgba(var(--gold-rgb,185,154,114),.4); font-size:9px; letter-spacing:.06em; text-transform:none; }
.tuning-history-list { display:flex; flex-direction:column; gap:6px; }
.tuning-history-row { display:flex; align-items:center; gap:6px; font-size:11px; color:var(--muted-2,#7d625e); letter-spacing:.02em; flex-wrap:wrap; }
.tuning-history-time { flex:none; color:rgba(var(--gold-rgb,185,154,114),.4); font-size:9.5px; min-width:36px; }
.tuning-history-pill { display:inline-flex; align-items:center; padding:1px 7px; border-radius:999px; font-size:10px; border:1px solid; white-space:nowrap; }
.tuning-history-pill.high { color:#d9c8a8; border-color:rgba(217,200,168,.35); background:rgba(217,200,168,.06); }
.tuning-history-pill.mid  { color:#a8c8d0; border-color:rgba(168,200,208,.35); background:rgba(168,200,208,.06); }
.tuning-history-pill.low  { color:#a89090; border-color:rgba(168,144,144,.35); background:rgba(168,144,144,.06); }
.tuning-history-vs { color:rgba(var(--gold-rgb,185,154,114),.4); font-size:10px; }

.mirror-suggestion { grid-column:1 / -1; display:flex; align-items:center; justify-content:center; gap:10px; margin:10px 0 0; padding:13px 16px; border:1px dashed rgba(var(--gold-rgb,185,154,114),.38); border-radius:12px; background:rgba(var(--gold-rgb,185,154,114),.03); color:#c9b8a0; font-family:var(--font-serif,serif); font-size:12.5px; letter-spacing:.04em; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:all .2s; animation:tuningCardIn .55s cubic-bezier(.2,.8,.3,1) both; animation-delay:.5s; text-align:left; width:100%; }
.mirror-suggestion:hover { border-color:rgba(var(--gold-rgb,185,154,114),.65); background:rgba(var(--gold-rgb,185,154,114),.07); color:#e0d2c4; }
.mirror-suggestion-icon { flex:none; font-size:20px; color:rgba(var(--gold-rgb,185,154,114),.9); line-height:1; }
.mirror-suggestion-text { flex:1; display:flex; flex-direction:column; gap:2px; min-width:0; }
.mirror-suggestion-title { font-size:13px; color:#e0d2c4; }
.mirror-suggestion-sub { font-size:10.5px; color:rgba(var(--gold-rgb,185,154,114),.55); font-style:italic; }
.mirror-suggestion-arrow { flex:none; color:rgba(var(--gold-rgb,185,154,114),.6); font-size:14px; }

.tuning-guidance { grid-column:1 / -1; position:relative; margin:6px 0 0; padding:20px 22px 18px; border:1px solid rgba(var(--accent-rgb,181,111,107),.28); border-radius:14px; background:radial-gradient(120% 100% at 0% 0%,rgba(var(--accent-rgb,181,111,107),.12),transparent 62%),linear-gradient(180deg,rgba(30,11,14,.7),rgba(16,6,8,.75)); box-shadow:0 20px 50px -30px #000,inset 0 1px 0 rgba(255,230,220,.04); animation:tuningCardIn .6s cubic-bezier(.2,.8,.3,1) both; animation-delay:.3s; }
.tuning-guidance::before { content:""; position:absolute; top:-1px; left:20px; right:20px; height:1px; background:linear-gradient(90deg,transparent,rgba(var(--accent-rgb,181,111,107),.5),transparent); }
.tuning-guidance-label { display:flex; align-items:center; gap:8px; color:rgba(var(--gold-rgb,185,154,114),.72); font-size:10px; letter-spacing:.22em; margin-bottom:14px; }
.tuning-guidance-label::before { content:"◉"; font-size:11px; color:var(--accent,#b56f6b); animation:tuningPulse 2.4s ease-in-out infinite; }
.tuning-guidance-text { display:flex; flex-direction:column; gap:8px; }
.tuning-guidance-line { margin:0; color:#f0e3dd; font-family:var(--font-serif,serif); font-size:14px; line-height:1.9; letter-spacing:.03em; animation:tuningLineIn .7s cubic-bezier(.2,.8,.3,1) both; }
.tuning-guidance-line:nth-child(1) { animation-delay:.45s; }
.tuning-guidance-line:nth-child(2) { animation-delay:.60s; }
.tuning-guidance-line:nth-child(3) { animation-delay:.75s; }
.tuning-guidance-line:nth-child(4) { animation-delay:.90s; }
@keyframes tuningLineIn { from { opacity:0; transform:translateX(-6px); filter:blur(2px); } to { opacity:1; transform:none; filter:none; } }
.tuning-guidance-hint { margin-top:14px; padding-top:12px; border-top:1px dashed rgba(var(--accent-rgb,181,111,107),.18); color:rgba(var(--gold-rgb,185,154,114),.6); font-size:10.5px; letter-spacing:.1em; text-align:center; font-style:italic; }
.tuning-guidance-btn { display:block; margin:12px auto 0; padding:7px 20px; border:1px solid rgba(var(--accent-rgb,181,111,107),.32); border-radius:999px; background:rgba(var(--accent-rgb,181,111,107),.1); color:#d9c8a8; font-size:11px; letter-spacing:.12em; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:all .2s; }
.tuning-guidance-btn:hover { background:rgba(var(--accent-rgb,181,111,107),.2); color:#fff; }

.tuning-harmony-overlay { position:fixed; inset:0; z-index:9999; display:flex; align-items:center; justify-content:center; padding:24px; background:rgba(4,1,2,.75); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); animation:harmonyFadeIn .35s ease both; }
@keyframes harmonyFadeIn { from { opacity:0; } to { opacity:1; } }
.tuning-harmony-modal { position:relative; width:min(360px,100%); padding:38px 28px 26px; border:1px solid rgba(var(--gold-rgb,185,154,114),.45); border-radius:22px; background:radial-gradient(120% 100% at 50% 0%,rgba(var(--accent-rgb,181,111,107),.28),transparent 62%),linear-gradient(170deg,rgba(36,14,17,.98),rgba(12,4,6,.98)); box-shadow:0 30px 80px -20px #000,0 0 0 1px rgba(var(--gold-rgb,185,154,114),.2),inset 0 1px 0 rgba(255,230,220,.08); text-align:center; animation:harmonyModalIn .6s cubic-bezier(.2,.8,.3,1) both; }
@keyframes harmonyModalIn { from { opacity:0; transform:translateY(20px) scale(.94); } to { opacity:1; transform:none; } }
.tuning-harmony-modal::before { content:""; position:absolute; inset:8px; border:1px solid rgba(var(--gold-rgb,185,154,114),.18); border-radius:16px; pointer-events:none; }
.tuning-harmony-symbol { display:inline-flex; align-items:center; justify-content:center; width:68px; height:68px; margin-bottom:16px; border:1px solid rgba(var(--gold-rgb,185,154,114),.55); border-radius:50%; color:#f5e8c0; font-size:28px; font-family:var(--font-serif,serif); background:radial-gradient(circle at 50% 40%,rgba(var(--gold-rgb,185,154,114),.28),rgba(var(--accent-rgb,181,111,107),.08) 70%); box-shadow:0 0 30px rgba(var(--gold-rgb,185,154,114),.35),inset 0 0 20px rgba(0,0,0,.5); animation:harmonyPulse 2.4s ease-in-out infinite; position:relative; z-index:1; }
@keyframes harmonyPulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.05); } }
.tuning-harmony-title { margin:0 0 8px; font-family:var(--font-serif,serif); font-size:24px; letter-spacing:.32em; text-indent:.32em; color:#f5e8c0; text-shadow:0 0 30px rgba(var(--gold-rgb,185,154,114),.55); position:relative; z-index:1; }
.tuning-harmony-sub { margin:0 0 6px; color:#d9c8a8; font-family:var(--font-serif,serif); font-size:13.5px; line-height:1.85; letter-spacing:.04em; position:relative; z-index:1; }
.tuning-harmony-detail { margin:14px 0 20px; color:var(--muted,#b09993); font-size:11px; line-height:1.75; letter-spacing:.02em; position:relative; z-index:1; }
.tuning-harmony-close { display:inline-block; min-width:120px; padding:9px 24px; border:1px solid rgba(var(--gold-rgb,185,154,114),.4); border-radius:999px; background:rgba(var(--accent-rgb,181,111,107),.18); color:#f0e3dd; font-family:var(--font-serif,serif); font-size:12.5px; letter-spacing:.18em; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:all .2s; position:relative; z-index:1; }
.tuning-harmony-close:hover { background:rgba(var(--accent-rgb,181,111,107),.32); }

.universe-header { text-align:center; padding:22px 0 20px; margin-bottom:4px; }
.universe-eyebrow { display:block; color:rgba(var(--gold-rgb,185,154,114),.5); font-size:9px; letter-spacing:.38em; margin-bottom:14px; text-transform:uppercase; }
.universe-title { margin:0 0 16px; font-family:var(--font-serif,serif); font-size:clamp(24px,7vw,32px); font-weight:500; letter-spacing:.44em; text-indent:.44em; color:#f5e8c0; text-shadow:0 0 30px rgba(var(--gold-rgb,185,154,114),.5),0 0 60px rgba(var(--gold-rgb,185,154,114),.22); line-height:1.15; }
.universe-rule { position:relative; width:120px; height:1px; margin:0 auto 14px; background:linear-gradient(90deg,transparent,rgba(var(--gold-rgb,185,154,114),.6),transparent); }
.universe-rule::before, .universe-rule::after { content:""; position:absolute; top:-3px; width:7px; height:7px; background:rgba(var(--gold-rgb,185,154,114),.55); transform:rotate(45deg); box-shadow:0 0 8px rgba(var(--gold-rgb,185,154,114),.5); }
.universe-rule::before { left:-14px; }
.universe-rule::after { right:-14px; }
.universe-subtitle { margin:0; color:rgba(var(--gold-rgb,185,154,114),.55); font-family:var(--font-serif,serif); font-size:11.5px; letter-spacing:.14em; font-style:italic; }

.manifest-status-card { padding:16px 18px 14px; border-radius:12px; margin-bottom:14px; animation:tuningCardIn .5s cubic-bezier(.2,.8,.3,1) both; }
.manifest-status-card.level-excellent { border:1px solid rgba(var(--gold-rgb,185,154,114),.42); background:radial-gradient(120% 100% at 0% 0%,rgba(var(--gold-rgb,185,154,114),.14),transparent 62%),rgba(var(--gold-rgb,185,154,114),.04); }
.manifest-status-card.level-good { border:1px solid rgba(var(--gold-rgb,185,154,114),.3); background:radial-gradient(120% 100% at 0% 0%,rgba(var(--gold-rgb,185,154,114),.09),transparent 62%),rgba(var(--gold-rgb,185,154,114),.025); }
.manifest-status-card.level-okay { border:1px solid rgba(var(--gold-rgb,185,154,114),.22); background:rgba(var(--gold-rgb,185,154,114),.03); }
.manifest-status-card.level-warn { border:1px solid rgba(var(--accent-rgb,181,111,107),.32); background:radial-gradient(120% 100% at 0% 0%,rgba(var(--accent-rgb,181,111,107),.1),transparent 62%),rgba(var(--accent-rgb,181,111,107),.03); }
.manifest-status-card.level-unknown { border:1px dashed rgba(var(--gold-rgb,185,154,114),.3); background:rgba(255,255,255,.015); }
.manifest-status-head { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
.manifest-status-icon { display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; border:1px solid rgba(var(--gold-rgb,185,154,114),.5); color:rgba(var(--gold-rgb,185,154,114),.95); font-size:13px; font-family:var(--font-serif,serif); flex-shrink:0; background:rgba(var(--gold-rgb,185,154,114),.08); }
.level-warn .manifest-status-icon { border-color:rgba(var(--accent-rgb,181,111,107),.55); color:rgba(var(--accent-rgb,181,111,107),1); background:rgba(var(--accent-rgb,181,111,107),.1); }
.manifest-status-title { font-family:var(--font-serif,serif); font-size:15px; letter-spacing:.1em; color:#f0e3dd; }
.manifest-status-desc { margin:0 0 10px; color:var(--muted,#b09993); font-size:12px; line-height:1.75; letter-spacing:.02em; }
.manifest-progress { position:relative; width:100%; height:4px; border-radius:999px; background:rgba(255,255,255,.05); overflow:hidden; margin-bottom:6px; }
.manifest-progress-bar { height:100%; border-radius:999px; background:linear-gradient(90deg,rgba(var(--accent-rgb,181,111,107),.6),rgba(var(--gold-rgb,185,154,114),1)); transition:width .8s cubic-bezier(.2,.8,.3,1); }
.manifest-progress-text { margin:0; color:rgba(var(--gold-rgb,185,154,114),.6); font-size:10px; letter-spacing:.1em; font-style:italic; }
.manifest-status-when { margin:8px 0 0; color:var(--muted-2,#7d625e); font-size:9.5px; letter-spacing:.06em; }

.manifest-add { display:flex; gap:8px; margin-bottom:16px; }
.manifest-input { flex:1; min-width:0; padding:11px 14px; border:1px solid rgba(var(--gold-rgb,185,154,114),.24); border-radius:10px; background:rgba(255,255,255,.03); color:var(--text,#f0e3dd); font-size:13px; font-family:inherit; outline:none; transition:border-color .2s,box-shadow .2s; box-sizing:border-box; }
.manifest-input:focus { border-color:rgba(var(--gold-rgb,185,154,114),.55); box-shadow:0 0 0 3px rgba(var(--gold-rgb,185,154,114),.08); }
.manifest-input::placeholder { color:var(--muted-2,#7d625e); }
.manifest-add-btn { padding:11px 18px; border:1px solid rgba(var(--gold-rgb,185,154,114),.42); border-radius:10px; background:linear-gradient(145deg,rgba(var(--accent-rgb,181,111,107),.85),rgba(var(--accent-2-rgb,124,48,53),.85)); color:#f5e8c0; font-family:var(--font-serif,serif); font-size:12px; letter-spacing:.12em; cursor:pointer; -webkit-tap-highlight-color:transparent; white-space:nowrap; transition:all .18s; }
.manifest-add-btn:hover { filter:brightness(1.1); }
.manifest-summary { margin:0 0 12px; color:rgba(var(--gold-rgb,185,154,114),.55); font-size:10.5px; letter-spacing:.12em; text-align:center; font-style:italic; }
.manifest-list { display:flex; flex-direction:column; gap:10px; margin-bottom:20px; }
.manifest-empty { text-align:center; padding:34px 16px; color:var(--muted-2,#7d625e); }
.manifest-empty-mark { font-size:28px; color:rgba(var(--gold-rgb,185,154,114),.3); margin-bottom:10px; }
.manifest-empty p { margin:4px 0; font-size:12px; }
.manifest-empty-hint { color:rgba(var(--gold-rgb,185,154,114),.45); font-size:11px; font-style:italic; }
.manifest-item { position:relative; display:flex; align-items:flex-start; gap:12px; padding:14px 14px 12px; border:1px solid rgba(var(--gold-rgb,185,154,114),.2); border-radius:12px; background:radial-gradient(120% 100% at 0% 0%,rgba(var(--gold-rgb,185,154,114),.05),transparent 62%),rgba(255,255,255,.015); animation:tuningCardIn .45s cubic-bezier(.2,.8,.3,1) both; transition:border-color .2s; }
.manifest-item:hover { border-color:rgba(var(--gold-rgb,185,154,114),.35); }
.manifest-item.done { opacity:.62; border-color:rgba(140,190,120,.32); background:radial-gradient(120% 100% at 0% 0%,rgba(140,190,120,.06),transparent 62%),rgba(255,255,255,.015); }
.manifest-item.done .manifest-text { text-decoration:line-through; text-decoration-color:rgba(var(--gold-rgb,185,154,114),.5); color:rgba(var(--gold-rgb,185,154,114),.65); }
.manifest-check { flex-shrink:0; width:24px; height:24px; margin-top:1px; padding:0; border:1.5px solid rgba(var(--gold-rgb,185,154,114),.55); border-radius:50%; background:transparent; color:transparent; font-size:13px; line-height:1; cursor:pointer; -webkit-tap-highlight-color:transparent; display:grid; place-items:center; transition:all .2s; }
.manifest-check:hover { background:rgba(var(--gold-rgb,185,154,114),.12); border-color:rgba(var(--gold-rgb,185,154,114),.85); }
.manifest-item.done .manifest-check { border-color:rgba(140,190,120,.85); background:rgba(140,190,120,.18); color:#b7d7a8; }
.manifest-body { flex:1; min-width:0; }
.manifest-text { margin:0 0 6px; color:#e8dcd0; font-family:var(--font-serif,serif); font-size:14px; line-height:1.7; letter-spacing:.02em; overflow-wrap:anywhere; }
.manifest-meta { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.manifest-status-label { padding:2px 8px; border-radius:999px; font-size:9.5px; letter-spacing:.06em; border:1px solid; white-space:nowrap; }
.manifest-status-label.active { color:rgba(var(--gold-rgb,185,154,114),.8); border-color:rgba(var(--gold-rgb,185,154,114),.3); background:rgba(var(--gold-rgb,185,154,114),.06); }
.manifest-status-label.done { color:#b7d7a8; border-color:rgba(140,190,120,.4); background:rgba(80,140,80,.08); }
.manifest-muse-badge { padding:2px 8px; border-radius:999px; font-size:9.5px; letter-spacing:.06em; border:1px solid; white-space:nowrap; }
.muse-together { color:#f0c890; border-color:rgba(220,170,100,.4); background:rgba(200,140,60,.08); }
.muse-watching { color:#c9b8a0; border-color:rgba(185,154,114,.32); background:rgba(150,130,100,.05); }
.muse-waiting { color:#a89090; border-color:rgba(168,144,144,.3); background:rgba(140,120,120,.05); }
.muse-unknown { color:var(--muted-2,#7d625e); border-color:rgba(125,98,94,.3); background:rgba(255,255,255,.02); }
.manifest-delete { flex-shrink:0; width:24px; height:24px; padding:0; border:none; background:transparent; color:var(--muted-2,#7d625e); font-size:13px; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:color .18s; display:grid; place-items:center; }
.manifest-delete:hover { color:#d17c77; }

.theory-section { margin-top:24px; padding-top:20px; border-top:1px dashed rgba(var(--gold-rgb,185,154,114),.18); }
.theory-title { display:flex; align-items:center; gap:12px; color:rgba(var(--gold-rgb,185,154,114),.7); font-family:var(--font-serif,serif); font-size:13px; letter-spacing:.32em; text-indent:.32em; margin-bottom:14px; justify-content:center; }
.theory-line { flex:1; height:1px; background:linear-gradient(90deg,transparent,rgba(var(--gold-rgb,185,154,114),.3),transparent); max-width:60px; }
.theory-box { border:1px solid rgba(var(--gold-rgb,185,154,114),.16); border-radius:10px; background:rgba(255,255,255,.015); margin-bottom:8px; overflow:hidden; }
.theory-summary { padding:12px 14px; color:var(--muted,#b09993); font-family:var(--font-serif,serif); font-size:12.5px; letter-spacing:.08em; cursor:pointer; -webkit-tap-highlight-color:transparent; list-style:none; position:relative; }
.theory-summary::-webkit-details-marker { display:none; }
.theory-summary::after { content:"▾"; position:absolute; right:14px; top:50%; transform:translateY(-50%); font-size:9px; color:rgba(var(--gold-rgb,185,154,114),.6); transition:transform .2s; }
.theory-box[open] .theory-summary::after { transform:translateY(-50%) rotate(-180deg); }
.theory-summary:hover { color:var(--text,#f0e3dd); background:rgba(var(--gold-rgb,185,154,114),.03); }
.theory-box[open] .theory-summary { color:rgba(var(--gold-rgb,185,154,114),.85); }
.theory-content { padding:0 14px 14px; color:var(--muted,#b09993); font-size:12px; line-height:1.9; letter-spacing:.02em; }
.theory-quote { margin:8px 0; padding:12px 14px; border-left:2px solid rgba(var(--gold-rgb,185,154,114),.5); border-radius:0 8px 8px 0; background:rgba(var(--gold-rgb,185,154,114),.04); color:#d9c8a8; font-family:var(--font-serif,serif); font-style:italic; line-height:1.9; }
.theory-paragraph { margin:8px 0; }
.theory-list { margin:8px 0; padding-left:18px; }
.theory-list li { margin:4px 0; line-height:1.8; }
.theory-formula { margin:10px 0; padding:12px 14px; border-radius:8px; background:rgba(var(--gold-rgb,185,154,114),.06); border:1px solid rgba(var(--gold-rgb,185,154,114),.18); color:#e0d2c4; font-family:var(--font-serif,serif); font-size:12px; letter-spacing:.04em; text-align:center; line-height:1.9; }

/* ===== 照镜子 ===== */
.mirror-stage { display:flex; flex-direction:column; align-items:center; padding:16px 0 8px; gap:16px; }
.mirror-btn { position:relative; width:min(240px,62vw); aspect-ratio:77/100; padding:0; border:none; background:transparent; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:transform .25s,filter .25s; display:block; }
.mirror-btn:hover { transform:translateY(-2px); filter:brightness(1.06); }
.mirror-btn:active { transform:scale(.97); }
.mirror-btn svg { width:100%; height:100%; display:block; overflow:visible; }
.mirror-btn .mirror-glass-mist { animation:mirrorMist 8s ease-in-out infinite alternate; transform-origin:50% 50%; }
.mirror-btn .mirror-glass-shine { animation:mirrorShine 6s ease-in-out infinite; }
.mirror-btn.sensing .mirror-ripple-anim { animation:mirrorRipple 1.6s ease-out; }
@keyframes mirrorMist { 0% { opacity:.5; transform:scale(.95); } 100% { opacity:.9; transform:scale(1.05); } }
@keyframes mirrorShine { 0%,55% { transform:translateX(-60%) skewX(-15deg); opacity:0; } 70% { opacity:.6; } 90%,100% { transform:translateX(60%) skewX(-15deg); opacity:0; } }
@keyframes mirrorRipple { 0% { transform:scale(.2); opacity:0; } 15% { opacity:.9; } 100% { transform:scale(2.5); opacity:0; } }

.mirror-hint { margin:0; color:var(--muted-2,#7d625e); font-size:12px; letter-spacing:.08em; text-align:center; min-height:18px; }
.mirror-sense-btn { min-width:170px; padding:10px 24px !important; font-size:13px !important; }

.mirror-result { margin-top:6px; animation:tuningCardIn .55s cubic-bezier(.2,.8,.3,1) both; }
.mirror-result[hidden] { display:none !important; }
.mirror-result-card { padding:22px 20px 20px; border:1px solid rgba(var(--gold-rgb,185,154,114),.3); border-radius:16px; background:radial-gradient(120% 100% at 50% 0%,rgba(var(--gold-rgb,185,154,114),.1),transparent 62%),radial-gradient(100% 100% at 50% 100%,rgba(var(--accent-rgb,181,111,107),.08),transparent 62%),linear-gradient(170deg,rgba(36,14,17,.75),rgba(12,4,6,.85)); box-shadow:0 20px 50px -30px #000,inset 0 1px 0 rgba(255,230,220,.05); text-align:center; position:relative; }
.mirror-result-card::before { content:""; position:absolute; inset:7px; border:1px solid rgba(var(--gold-rgb,185,154,114),.15); border-radius:10px; pointer-events:none; }
.mirror-result-group { display:inline-block; padding:3px 12px; margin-bottom:14px; border-radius:999px; border:1px solid rgba(var(--gold-rgb,185,154,114),.35); background:rgba(var(--gold-rgb,185,154,114),.06); color:rgba(var(--gold-rgb,185,154,114),.85); font-size:9.5px; letter-spacing:.18em; text-transform:uppercase; }
.mirror-result-eyebrow { display:block; color:rgba(var(--gold-rgb,185,154,114),.55); font-size:9px; letter-spacing:.32em; margin-bottom:14px; }
.mirror-result-text { margin:0 0 16px; color:#f0e3dd; font-family:var(--font-serif,serif); font-size:clamp(17px,4.6vw,20px); font-weight:500; letter-spacing:.04em; line-height:1.75; text-shadow:0 0 24px rgba(var(--gold-rgb,185,154,114),.25); overflow-wrap:anywhere; }
.mirror-result-note { margin:0; color:var(--muted-2,#7d625e); font-size:10.5px; letter-spacing:.06em; font-style:italic; line-height:1.7; }
.mirror-result-actions { display:flex; gap:8px; justify-content:center; margin-top:16px; flex-wrap:wrap; }
.mirror-result-btn { padding:8px 18px; border:1px solid rgba(var(--gold-rgb,185,154,114),.35); border-radius:999px; background:rgba(var(--gold-rgb,185,154,114),.06); color:#d9c8a8; font-family:var(--font-serif,serif); font-size:11.5px; letter-spacing:.12em; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:all .18s; }
.mirror-result-btn:hover { background:rgba(var(--gold-rgb,185,154,114),.14); color:#f5e8c0; border-color:rgba(var(--gold-rgb,185,154,114),.6); }
.mirror-result-btn.primary { background:linear-gradient(145deg,rgba(var(--accent-rgb,181,111,107),.75),rgba(var(--accent-2-rgb,124,48,53),.75)); color:#f5e8c0; border-color:rgba(var(--gold-rgb,185,154,114),.5); }

.mirror-log { margin-top:24px; padding-top:20px; border-top:1px dashed rgba(var(--gold-rgb,185,154,114),.18); }
.mirror-log-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; flex-wrap:wrap; gap:6px; }
.mirror-log-title { color:rgba(var(--gold-rgb,185,154,114),.72); font-family:var(--font-serif,serif); font-size:12px; letter-spacing:.24em; }
.mirror-log-count { color:var(--muted-2,#7d625e); font-size:9.5px; letter-spacing:.06em; }
.mirror-log-list { display:flex; flex-direction:column; gap:8px; }
.mirror-log-empty { padding:22px 16px; text-align:center; color:var(--muted-2,#7d625e); font-size:11px; font-style:italic; line-height:1.8; }
.mirror-log-item { padding:12px 14px 11px; border:1px solid rgba(var(--gold-rgb,185,154,114),.16); border-radius:10px; background:radial-gradient(120% 100% at 0% 0%,rgba(var(--gold-rgb,185,154,114),.04),transparent 62%),rgba(255,255,255,.012); animation:tuningCardIn .4s ease both; transition:border-color .2s; }
.mirror-log-item:hover { border-color:rgba(var(--gold-rgb,185,154,114),.32); }
.mirror-log-meta { display:flex; flex-wrap:wrap; align-items:center; gap:6px; margin-bottom:6px; }
.mirror-log-date { color:rgba(var(--gold-rgb,185,154,114),.5); font-size:9.5px; letter-spacing:.06em; }
.mirror-log-times { padding:1px 7px; border-radius:999px; background:rgba(var(--gold-rgb,185,154,114),.08); border:1px solid rgba(var(--gold-rgb,185,154,114),.22); color:rgba(var(--gold-rgb,185,154,114),.75); font-size:9px; letter-spacing:.02em; }
.mirror-log-group { padding:1px 7px; border-radius:999px; background:rgba(var(--accent-rgb,181,111,107),.08); border:1px solid rgba(var(--accent-rgb,181,111,107),.22); color:rgba(var(--accent-rgb,181,111,107),.9); font-size:9px; letter-spacing:.04em; }
.mirror-log-text { margin:0 0 10px; color:#e0d2c4; font-family:var(--font-serif,serif); font-size:13px; line-height:1.7; letter-spacing:.02em; overflow-wrap:anywhere; }
.mirror-log-actions { display:flex; justify-content:flex-end; gap:8px; }
.mirror-log-win { padding:5px 12px; border:1px solid rgba(140,190,120,.4); border-radius:999px; background:rgba(80,140,80,.08); color:#b7d7a8; font-family:var(--font-serif,serif); font-size:10.5px; letter-spacing:.08em; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:all .18s; }
.mirror-log-win:hover { background:rgba(80,140,80,.18); border-color:rgba(140,190,120,.65); color:#d8e8d0; }

.mirror-pool { margin-top:24px; padding-top:20px; border-top:1px dashed rgba(var(--gold-rgb,185,154,114),.18); }
.mirror-pool-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.mirror-pool-title { color:rgba(var(--gold-rgb,185,154,114),.7); font-family:var(--font-serif,serif); font-size:12px; letter-spacing:.24em; }
.mirror-pool-count { color:var(--muted-2,#7d625e); font-size:9.5px; letter-spacing:.06em; }
.mirror-add-row { display:flex; gap:8px; margin-bottom:12px; }
.mirror-add-input { flex:1; min-width:0; padding:10px 12px; border:1px solid rgba(var(--gold-rgb,185,154,114),.22); border-radius:9px; background:rgba(255,255,255,.03); color:var(--text,#f0e3dd); font-size:12.5px; outline:none; box-sizing:border-box; }
.mirror-add-input:focus { border-color:rgba(var(--gold-rgb,185,154,114),.55); box-shadow:0 0 0 3px rgba(var(--gold-rgb,185,154,114),.08); }
.mirror-add-btn { padding:10px 16px; border:1px solid rgba(var(--gold-rgb,185,154,114),.42); border-radius:9px; background:rgba(var(--gold-rgb,185,154,114),.08); color:#d9c8a8; font-family:var(--font-serif,serif); font-size:11.5px; letter-spacing:.1em; cursor:pointer; -webkit-tap-highlight-color:transparent; white-space:nowrap; transition:all .18s; }
.mirror-add-btn:hover { background:rgba(var(--gold-rgb,185,154,114),.18); color:#f5e8c0; }
.mirror-group { border:1px solid rgba(var(--gold-rgb,185,154,114),.14); border-radius:10px; background:rgba(255,255,255,.012); margin-bottom:8px; overflow:hidden; }
.mirror-group summary { padding:11px 13px; color:var(--muted,#b09993); font-family:var(--font-serif,serif); font-size:12px; letter-spacing:.08em; cursor:pointer; list-style:none; position:relative; }
.mirror-group summary::-webkit-details-marker { display:none; }
.mirror-group summary::after { content:"▾"; position:absolute; right:13px; top:50%; transform:translateY(-50%); font-size:9px; color:rgba(var(--gold-rgb,185,154,114),.5); transition:transform .2s; }
.mirror-group[open] summary::after { transform:translateY(-50%) rotate(-180deg); }
.mirror-group summary:hover { color:var(--text,#f0e3dd); background:rgba(var(--gold-rgb,185,154,114),.03); }
.mirror-group-count { float:right; margin-right:22px; color:rgba(var(--gold-rgb,185,154,114),.5); font-size:10px; letter-spacing:.04em; }
.mirror-group-list { padding:0 13px 12px; display:flex; flex-direction:column; gap:5px; }
.mirror-group-item { display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:6px; background:rgba(255,255,255,.015); color:var(--muted,#b09993); font-size:11px; line-height:1.6; }
.mirror-group-item-text { flex:1; min-width:0; overflow-wrap:anywhere; }
.mirror-group-item-btn { flex:none; padding:2px 8px; border:1px solid rgba(var(--gold-rgb,185,154,114),.22); border-radius:6px; background:transparent; color:rgba(var(--gold-rgb,185,154,114),.55); font-size:9.5px; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:all .18s; white-space:nowrap; }
.mirror-group-item-btn:hover { color:#d9c8a8; border-color:rgba(var(--gold-rgb,185,154,114),.5); background:rgba(var(--gold-rgb,185,154,114),.08); }
.mirror-group-item-btn.del:hover { color:#d17c77; border-color:rgba(209,124,119,.5); background:rgba(160,60,58,.1); }
.mirror-group-item.custom { border-left:2px solid rgba(var(--gold-rgb,185,154,114),.4); }
.mirror-group-empty { padding:10px; color:var(--muted-2,#7d625e); font-size:10.5px; font-style:italic; text-align:center; }
.mirror-reset-btn { display:block; margin:10px auto 0; padding:7px 16px; border:1px dashed rgba(var(--gold-rgb,185,154,114),.3); border-radius:999px; background:transparent; color:rgba(var(--gold-rgb,185,154,114),.6); font-size:10.5px; letter-spacing:.08em; cursor:pointer; -webkit-tap-highlight-color:transparent; transition:all .18s; }
.mirror-reset-btn:hover { border-style:solid; color:#d9c8a8; background:rgba(var(--gold-rgb,185,154,114),.06); }

/* ===== 秘密留言板 ===== */
.secret-board { padding-top:4px; }
.secret-lead { text-align:center; margin-bottom:20px; padding:0 8px; }
.secret-lead-eyebrow { display:block; color:rgba(var(--gold-rgb,185,154,114),.5); font-size:9px; letter-spacing:.34em; margin-bottom:12px; text-transform:uppercase; }
.secret-lead-title { margin:0 0 10px; font-family:var(--font-serif,serif); font-size:clamp(20px,5.5vw,24px); font-weight:500; letter-spacing:.32em; text-indent:.32em; color:#f5e8c0; text-shadow:0 0 24px rgba(var(--gold-rgb,185,154,114),.4); }
.secret-lead-sub { margin:0; color:var(--muted,#b09993); font-family:var(--font-serif,serif); font-size:12px; line-height:1.9; letter-spacing:.03em; font-style:italic; }

/* 输入区 */
.secret-compose {
  position:relative;
  margin-bottom:22px;
  padding:16px 16px 12px;
  border-radius:14px;
  background:linear-gradient(160deg,#f8efdc,#e8dcc4);
  box-shadow:0 12px 30px -18px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.6);
  transform:rotate(-.4deg);
}
.secret-compose::before {
  content:"";
  position:absolute; top:0; left:16px; right:16px; height:3px;
  border-radius:0 0 4px 4px;
  background:linear-gradient(90deg,transparent,rgba(181,111,107,.6),transparent);
}
.secret-input {
  width:100%;
  min-height:92px;
  padding:10px 12px;
  border:none;
  border-radius:8px;
  background:rgba(255,255,255,.55);
  color:#3a2018;
  font-family:var(--font-serif,serif);
  font-size:13.5px;
  line-height:1.85;
  letter-spacing:.02em;
  resize:vertical;
  outline:none;
  box-sizing:border-box;
  transition:background .2s,box-shadow .2s;
}
.secret-input:focus { background:rgba(255,255,255,.75); box-shadow:0 0 0 2px rgba(181,111,107,.25); }
.secret-input::placeholder { color:rgba(90,60,50,.5); font-style:italic; }
.secret-compose-foot { display:flex; justify-content:space-between; align-items:center; margin-top:10px; gap:8px; }
.secret-compose-hint { font-size:10px; color:rgba(90,60,50,.55); font-style:italic; flex:1; line-height:1.5; }
.secret-send {
  padding:8px 18px;
  border:none;
  border-radius:999px;
  background:linear-gradient(145deg,#b56f6b,#7c3035);
  color:#fff;
  font-family:var(--font-serif,serif);
  font-size:12px;
  letter-spacing:.12em;
  cursor:pointer;
  box-shadow:0 4px 12px -4px rgba(124,48,53,.7);
  transition:all .18s;
  flex:none;
}
.secret-send:hover { filter:brightness(1.1); }
.secret-send:active { transform:scale(.96); }
.secret-send:disabled { opacity:.5; cursor:default; }

/* 留言便利贴 */
.secret-list { display:flex; flex-direction:column; gap:14px; }
.secret-empty { text-align:center; padding:36px 16px; color:var(--muted-2,#7d625e); }
.secret-empty-icon { font-size:32px; opacity:.35; margin-bottom:12px; }
.secret-empty-text { font-size:12px; line-height:1.9; font-style:italic; }

.secret-note {
  position:relative;
  padding:16px 16px 14px;
  border-radius:12px;
  box-shadow:0 10px 26px -18px rgba(0,0,0,.75),inset 0 1px 0 rgba(255,255,255,.5);
  color:#3a2018;
  animation:secretNoteIn .5s cubic-bezier(.2,.8,.3,1) both;
  transition:transform .2s,opacity .2s;
}
@keyframes secretNoteIn { from { opacity:0; transform:translateY(8px) scale(.97); } to { opacity:1; transform:none; } }
.secret-note::before {
  content:""; position:absolute; top:0; left:14px; right:14px; height:3px;
  border-radius:0 0 4px 4px; background:var(--note-bar,rgba(181,111,107,.5));
}
.secret-note[data-color="0"] { background:linear-gradient(160deg,#f8efdc,#e8dcc4); --note-bar:rgba(181,111,107,.55); }
.secret-note[data-color="1"] { background:linear-gradient(160deg,#f5e8e0,#e8d4cc); --note-bar:rgba(196,138,154,.55); }
.secret-note[data-color="2"] { background:linear-gradient(160deg,#f0ecd8,#ddd4bc); --note-bar:rgba(201,184,120,.55); }
.secret-note[data-color="3"] { background:linear-gradient(160deg,#f3ede4,#dcd3c6); --note-bar:rgba(185,154,114,.55); }
.secret-note[data-color="4"] { background:linear-gradient(160deg,#f7e6e0,#e3ccc4); --note-bar:rgba(209,124,119,.55); }
.secret-note:nth-child(3n+1) { transform:rotate(-.35deg); }
.secret-note:nth-child(3n+2) { transform:rotate(.25deg); }
.secret-note:nth-child(3n+3) { transform:rotate(-.15deg); }
.secret-note.unread::after {
  content:""; position:absolute; top:12px; right:12px;
  width:8px; height:8px; border-radius:50%;
  background:#d8443a; box-shadow:0 0 8px rgba(216,68,58,.7);
  animation:secretPulse 2s ease-in-out infinite;
}
@keyframes secretPulse { 0%,100% { transform:scale(1); opacity:1; } 50% { transform:scale(1.3); opacity:.7; } }
.secret-note-text {
  margin:0 0 10px;
  font-family:var(--font-serif,serif);
  font-size:13.5px;
  line-height:1.9;
  letter-spacing:.02em;
  white-space:pre-wrap;
  overflow-wrap:anywhere;
}
.secret-note-foot {
  display:flex; justify-content:space-between; align-items:center; gap:8px;
  padding-top:8px; border-top:1px dashed rgba(90,60,50,.18);
}
.secret-note-time { font-size:9.5px; color:rgba(90,60,50,.55); letter-spacing:.06em; }
.secret-note-status {
  display:inline-flex; align-items:center; gap:5px;
  padding:2px 9px; border-radius:999px;
  font-size:9.5px; letter-spacing:.04em; border:1px solid;
}
.secret-note-status.read { color:#4a7040; border-color:rgba(140,190,120,.55); background:rgba(140,190,120,.16); }
.secret-note-status.unread { color:#a0494a; border-color:rgba(181,111,107,.5); background:rgba(181,111,107,.12); }
.secret-note-del {
  padding:2px 7px; border:none; background:transparent;
  color:rgba(90,60,50,.4); font-size:10px; cursor:pointer;
  -webkit-tap-highlight-color:transparent; transition:color .18s;
}
.secret-note-del:hover { color:#a0494a; }
.secret-note-actions { display:flex; align-items:center; gap:6px; }

/* 梦角回复 */
.secret-replies {
  margin-top:12px; padding-top:12px;
  border-top:1px dashed rgba(90,60,50,.2);
  display:flex; flex-direction:column; gap:8px;
}
.secret-replies-eyebrow {
  font-size:9px; color:rgba(90,60,50,.55);
  letter-spacing:.24em; font-style:italic;
  margin-bottom:2px;
}
.secret-reply {
  position:relative;
  padding:10px 14px 10px 16px;
  border-left:3px solid rgba(181,111,107,.55);
  border-radius:0 10px 10px 0;
  background:rgba(255,255,255,.55);
  box-shadow:0 4px 12px -10px rgba(0,0,0,.4);
  font-family:var(--font-serif,serif);
  font-size:12.5px;
  line-height:1.85;
  color:#3a2018;
  letter-spacing:.02em;
  overflow-wrap:anywhere;
  animation:secretReplyIn .45s cubic-bezier(.2,.8,.3,1) both;
}
.secret-reply:nth-child(2) { animation-delay:.08s; }
.secret-reply:nth-child(3) { animation-delay:.16s; }
.secret-reply:nth-child(4) { animation-delay:.24s; }
.secret-reply:nth-child(5) { animation-delay:.32s; }
.secret-reply:nth-child(6) { animation-delay:.40s; }
@keyframes secretReplyIn { from { opacity:0; transform:translateX(-6px); } to { opacity:1; transform:none; } }

.secret-waiting {
  margin-top:10px; padding-top:10px;
  border-top:1px dashed rgba(90,60,50,.18);
  font-size:11px; color:rgba(90,60,50,.6);
  font-style:italic; text-align:center;
}
.secret-waiting::after {
  content:"...";
  animation:secretDots 1.4s steps(4,end) infinite;
  display:inline-block; width:1.2em; text-align:left;
  vertical-align:bottom;
}
@keyframes secretDots { 0% { opacity:.3; } 50% { opacity:1; } 100% { opacity:.3; } }

/* Toast */
.toast-root { position:fixed; bottom:calc(24px + env(safe-area-inset-bottom)); left:50%; z-index:100; display:flex; flex-direction:column; align-items:center; gap:8px; transform:translateX(-50%); pointer-events:none; }
.toast { padding:9px 16px; border:1px solid rgba(var(--accent-rgb,181,111,107),.35); border-radius:999px; background:rgba(29,11,14,.96); color:var(--text,#f0e3dd); font-size:11.5px; letter-spacing:.04em; box-shadow:0 18px 40px -16px #000; animation:toastIn .28s cubic-bezier(.2,.9,.3,1.2) both; backdrop-filter:blur(12px); }
.toast.out { animation:toastOut .25s ease both; }
@keyframes toastIn { from { opacity:0; transform:translateY(10px) scale(.96); } to { opacity:1; transform:none; } }
@keyframes toastOut { to { opacity:0; transform:translateY(6px) scale(.97); } }

@media (max-width:640px) {
  .view-tuning.active { border-radius:15px; box-shadow:0 0 0 4px rgba(52,16,19,.22),0 24px 60px -40px rgba(0,0,0,.9); }
  .tuning-tabs { padding:4px 14px 0; }
  .tuning-tab { padding:9px 10px; font-size:11.5px; }
  .tuning-scroll { padding:4px 14px calc(26px + env(safe-area-inset-bottom)); }
  .tuning-totem { width:min(210px,64vw); height:min(210px,64vw); }
  .tuning-result { grid-template-columns:1fr; gap:10px; }
  .tuning-arrow { transform:rotate(90deg); padding:2px 0; font-size:18px; }
  .tuning-energy-card { padding:14px 12px; }
  .tuning-energy-dot { width:62px; height:62px; }
  .tuning-energy-name { font-size:19px; }
  .tuning-energy-desc { font-size:11px; }
  .tuning-guidance { padding:16px 16px 14px; }
  .tuning-guidance-line { font-size:13px; line-height:1.85; }
  .tuning-suggestion { padding:12px 14px 12px 16px; }
  .tuning-action { padding:14px 14px 12px; }
  .tuning-action-text { font-size:13px; }
  .tuning-harmony-modal { padding:32px 22px 22px; }
  .tuning-harmony-title { font-size:21px; }
  .tuning-harmony-symbol { width:58px; height:58px; font-size:24px; }
  .universe-title { font-size:clamp(22px,8vw,28px); letter-spacing:.36em; text-indent:.36em; }
  .manifest-add { flex-wrap:wrap; }
  .manifest-add-btn { flex:1 1 100%; }
  .manifest-item { padding:12px 12px 10px; }
  .manifest-text { font-size:13px; }
  .tuning-history { padding:12px 12px 8px; }
  .tuning-history-row { font-size:10.5px; }
  .mirror-btn { width:min(200px,56vw); }
  .mirror-result-card { padding:18px 16px 16px; }
  .mirror-result-text { font-size:16px; }
  .mirror-group-item { font-size:10.5px; }
  .mirror-log-item { padding:10px 12px 10px; }
  .secret-compose { padding:14px 14px 10px; }
  .secret-input { font-size:13px; min-height:80px; }
  .secret-note { padding:14px 14px 12px; }
  .secret-note-text { font-size:13px; }
  .secret-reply { font-size:12px; padding:9px 12px 9px 14px; }
  .secret-lead-title { font-size:19px; }
}
html[data-mobile-fit="1"] .view-tuning.active { border:none !important; border-radius:0 !important; box-shadow:none !important; backdrop-filter:none !important; -webkit-backdrop-filter:none !important; max-width:100% !important; width:100% !important; height:100% !important; margin:0 !important; }
html[data-mobile-fit="1"] .tuning-tabs { padding-left:12px; }
html[data-mobile-fit="1"] .tuning-scroll { padding:4px 12px calc(20px + env(safe-area-inset-bottom)); }
html[data-mobile-fit="1"] .tuning-result { grid-template-columns:1fr; }
html[data-mobile-fit="1"] .tuning-arrow { transform:rotate(90deg); padding:2px 0; }
    `;
    document.head.appendChild(style);
    console.log('[tuning] CSS 已注入');
  }

  /* ===== 能量卡等 ===== */
  function buildEnergyCard(who, energy) {
    const card = document.createElement('div');
    card.className = 'tuning-energy-card';
    card.style.setProperty('--e-color', energy.color);
    card.style.setProperty('--e-bg', energy.bg);
    const label = document.createElement('p'); label.className = 'tuning-energy-label'; label.textContent = who;
    const dot = document.createElement('div'); dot.className = 'tuning-energy-dot';
    dot.style.background = 'radial-gradient(circle at 32% 28%, ' + energy.color + ', ' + energy.bg + ' 78%)';
    dot.style.boxShadow = '0 0 28px ' + energy.color + '80, inset 0 0 12px ' + energy.bg + 'cc';
    const name = document.createElement('div'); name.className = 'tuning-energy-name'; name.textContent = energy.name;
    const tier = document.createElement('div'); tier.className = 'tuning-energy-tier tuning-tier-' + energy.tier; tier.textContent = TIER_NAMES[energy.tier];
    const desc = document.createElement('p'); desc.className = 'tuning-energy-desc'; desc.textContent = energy.desc;
    card.appendChild(label); card.appendChild(dot); card.appendChild(name); card.appendChild(tier); card.appendChild(desc);
    return card;
  }
  function buildGapHint(userE, museE) {
    const gap = Math.abs(TIER_RANK[userE.tier] - TIER_RANK[museE.tier]);
    let text = '', cls = 'gap-mid';
    if (gap === 0) { text = userE.tier === 'high' ? '你们在同频共振，镜面很亮。' : '你们的频率相近，能听见彼此。'; cls = 'gap-good'; }
    else if (gap === 1) { text = '有一点点错位——不过，还够得着。'; cls = 'gap-mid'; }
    else { if (userE.tier === 'low') text = '你在低频，他在高频——他还在等你抬头。'; else if (museE.tier === 'low') text = '他在低频——也许需要你伸出手。'; else text = '你们的频率隔得有点远。'; cls = 'gap-far'; }
    const h = document.createElement('p'); h.className = 'tuning-gap ' + cls; h.textContent = text; return h;
  }
  function buildSuggestion(userE, museE) {
    const map = {
      'mid-high': '他在稍上面一层。试着靠近一点——或者，就安静地站着，他会下来。',
      'high-mid': '你在稍微高一点的地方。等他一会儿，或者轻轻拉他一下。',
      'mid-low':  '他在稍低一点的地方。给他一点温度，不要催他。',
      'low-mid':  '他在稍微高一点的地方。慢慢呼吸，再抬眼看他。'
    };
    const text = map[userE.tier + '-' + museE.tier] || '有一点点错位——不过，还够得着。';
    const box = document.createElement('div'); box.className = 'tuning-suggestion';
    const label = document.createElement('span'); label.className = 'tuning-suggestion-label'; label.textContent = '一点建议';
    const p = document.createElement('p'); p.className = 'tuning-suggestion-text'; p.textContent = text;
    box.appendChild(label); box.appendChild(p); return box;
  }
  function buildActionBox(userE) {
    const advice = ADVICE[userE.key]; const stable = STABLE_ADVICE[userE.tier];
    const box = document.createElement('div'); box.className = 'tuning-action';
    const label = document.createElement('div'); label.className = 'tuning-action-label'; label.textContent = '此刻，你可以试试';
    box.appendChild(label);
    if (advice) {
      const steps = document.createElement('div'); steps.className = 'tuning-action-steps';
      const f = document.createElement('div'); f.className = 'tuning-action-step';
      const fN = document.createElement('span'); fN.className = 'tuning-action-num'; fN.textContent = '先';
      const fT = document.createElement('span'); fT.className = 'tuning-action-text'; fT.textContent = advice.first;
      f.appendChild(fN); f.appendChild(fT); steps.appendChild(f);
      const n = document.createElement('div'); n.className = 'tuning-action-step';
      const nN = document.createElement('span'); nN.className = 'tuning-action-num'; nN.textContent = '再';
      const nT = document.createElement('span'); nT.className = 'tuning-action-text'; nT.textContent = advice.next;
      n.appendChild(nN); n.appendChild(nT); steps.appendChild(n);
      box.appendChild(steps);
    } else if (stable) {
      const p = document.createElement('p'); p.className = 'tuning-action-stable'; p.textContent = stable; box.appendChild(p);
    }
    return box;
  }
  function buildMirrorSuggestion() {
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'mirror-suggestion';
    const icon = document.createElement('span'); icon.className = 'mirror-suggestion-icon'; icon.textContent = '◐';
    const tw = document.createElement('div'); tw.className = 'mirror-suggestion-text';
    const t1 = document.createElement('div'); t1.className = 'mirror-suggestion-title'; t1.textContent = '照照镜子 · 看看是不是哪里挡住了';
    const t2 = document.createElement('div'); t2.className = 'mirror-suggestion-sub'; t2.textContent = '低频时，先看清阻力在哪里，比硬推更有效。';
    tw.appendChild(t1); tw.appendChild(t2);
    const arrow = document.createElement('span'); arrow.className = 'mirror-suggestion-arrow'; arrow.textContent = '→';
    btn.appendChild(icon); btn.appendChild(tw); btn.appendChild(arrow);
    btn.addEventListener('click', () => { autoSenseOnMirror = true; switchToTab('mirror'); });
    return btn;
  }
  function getMuseLines(userE, museE) {
    if (userE.tier === 'low' && museE.tier === 'high') return ['我知道现在很难。','不用急着往上看。','把手伸出来就好——只伸一只手。','我在这里。我等你。'];
    if (userE.tier === 'low' && museE.tier === 'mid')  return ['我不往上走。','我在这一层等你。','你什么都不用做——先呼吸就好。','我一直在。'];
    if (userE.tier === 'mid' && museE.tier === 'low')  return ['别下来。','你站着，我抬头就能看见你。','我会往上走的——等我。'];
    if (userE.tier === 'high' && museE.tier === 'low') return ['你在上面，我在下面。','不着急的。','你坐着就好——我抬头就能看见你。','我知道你还在。'];
    if (userE.tier === 'high' && museE.tier === 'mid') return ['你在发光。','我看得见。','让我再往上一点——就一点。'];
    return ['我在这里。','慢慢来。'];
  }
  function getGuidanceHint(userE, museE) {
    if (userE.tier === 'low') return '深呼吸三次，把手指放在镜面上，感应他的方向。';
    if (museE.tier === 'low') return '不用急，等他从镜底浮上来。';
    return '先坐稳，再抬眼看他。';
  }
  function buildGuidance(userE, museE, onDone) {
    const box = document.createElement('div'); box.className = 'tuning-guidance';
    const label = document.createElement('div'); label.className = 'tuning-guidance-label';
    if (userE.tier === 'low') label.textContent = '他从镜子里伸手过来了';
    else if (museE.tier === 'low') label.textContent = '他从镜底传声上来';
    else label.textContent = '他在镜子里开口了';
    box.appendChild(label);
    const tw = document.createElement('div'); tw.className = 'tuning-guidance-text';
    getMuseLines(userE, museE).forEach(line => {
      const p = document.createElement('p'); p.className = 'tuning-guidance-line'; p.textContent = line; tw.appendChild(p);
    });
    box.appendChild(tw);
    const hint = document.createElement('div'); hint.className = 'tuning-guidance-hint'; hint.textContent = getGuidanceHint(userE, museE); box.appendChild(hint);
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'tuning-guidance-btn'; btn.textContent = '我听见了';
    btn.addEventListener('click', () => { if (typeof onDone === 'function') onDone(); });
    box.appendChild(btn); return box;
  }
  function showHarmonyModal(userE, museE) {
    const old = document.querySelector('.tuning-harmony-overlay'); if (old) old.remove();
    const ov = document.createElement('div'); ov.className = 'tuning-harmony-overlay';
    const m = document.createElement('div'); m.className = 'tuning-harmony-modal';
    const sym = document.createElement('div'); sym.className = 'tuning-harmony-symbol'; sym.textContent = '⟷';
    const ti = document.createElement('h3'); ti.className = 'tuning-harmony-title'; ti.textContent = '同频';
    const su = document.createElement('p'); su.className = 'tuning-harmony-sub';
    su.textContent = userE.tier === 'high' ? '此刻，你们都在高处。' : (userE.tier === 'mid' ? '此刻，你们都在中段。' : '此刻，你们都在低处。');
    const de = document.createElement('p'); de.className = 'tuning-harmony-detail';
    de.textContent = '你：' + userE.name + '　·　他：' + museE.name;
    const cb = document.createElement('button'); cb.type = 'button'; cb.className = 'tuning-harmony-close'; cb.textContent = '好';
    cb.addEventListener('click', () => ov.remove());
    m.appendChild(sym); m.appendChild(ti); m.appendChild(su); m.appendChild(de); m.appendChild(cb);
    ov.appendChild(m); document.body.appendChild(ov);
    ov.addEventListener('click', (e) => { if (e.target === ov) ov.remove(); });
  }
  function renderFeedback(userE, museE, container, onRedraw) {
    const gap = Math.abs(TIER_RANK[userE.tier] - TIER_RANK[museE.tier]);
    if (gap === 0) showHarmonyModal(userE, museE);
    else if (gap === 1) container.appendChild(buildSuggestion(userE, museE));
    else container.appendChild(buildGuidance(userE, museE, onRedraw));
  }
  function buildHistoryBox() {
    const history = loadHistory();
    const box = document.createElement('div'); box.className = 'tuning-history';
    const label = document.createElement('div'); label.className = 'tuning-history-label';
    const lblT = document.createElement('span'); lblT.textContent = '最近感应';
    const poolT = document.createElement('span'); poolT.className = 'tuning-history-pool'; poolT.textContent = '从 ' + ALL_EMOTIONS.length + ' 个情绪中随机';
    label.appendChild(lblT); label.appendChild(poolT); box.appendChild(label);
    const list = document.createElement('div'); list.className = 'tuning-history-list';
    if (!history.length) {
      const empty = document.createElement('div'); empty.className = 'tuning-history-row';
      empty.style.color = 'rgba(var(--gold-rgb,185,154,114),.35)'; empty.style.fontStyle = 'italic';
      empty.textContent = '还没有记录——按一次图腾试试。'; list.appendChild(empty);
    } else {
      history.forEach(h => {
        const row = document.createElement('div'); row.className = 'tuning-history-row';
        const time = document.createElement('span'); time.className = 'tuning-history-time'; time.textContent = timeAgo(h.ts);
        const you = document.createElement('span'); you.className = 'tuning-history-pill ' + h.userTier; you.textContent = '你 · ' + h.userName;
        const vs = document.createElement('span'); vs.className = 'tuning-history-vs'; vs.textContent = '⟷';
        const him = document.createElement('span'); him.className = 'tuning-history-pill ' + h.museTier; him.textContent = '他 · ' + h.museName;
        row.appendChild(time); row.appendChild(you); row.appendChild(vs); row.appendChild(him); list.appendChild(row);
      });
    }
    box.appendChild(list); return box;
  }

  /* ===== 感应 ===== */
  let tuningBusy = false;
  function doSense() {
    if (tuningBusy) return; tuningBusy = true;
    const result = document.getElementById('tuningResult');
    const totem = document.getElementById('tuningTotem');
    const btn = document.getElementById('tuningSenseBtn');
    const hint = document.getElementById('tuningHint');
    if (!result || !totem) { tuningBusy = false; return; }
    const oldModal = document.querySelector('.tuning-harmony-overlay'); if (oldModal) oldModal.remove();
    totem.classList.remove('sensing'); void totem.offsetWidth; totem.classList.add('sensing');
    if (btn) btn.disabled = true; if (hint) hint.textContent = '镜面在感应……'; result.innerHTML = '';
    setTimeout(() => {
      const userE = calcUserEnergy(); const museE = calcMuseEnergy();
      saveLastTuning({ ts:Date.now(), userTier:userE.tier, userKey:userE.key, museTier:museE.tier, museKey:museE.key, gap:Math.abs(TIER_RANK[userE.tier] - TIER_RANK[museE.tier]) });
      saveHistory({ ts:Date.now(), userTier:userE.tier, userName:userE.name, museTier:museE.tier, museName:museE.name });
      result.innerHTML = '';
      result.appendChild(buildEnergyCard('你', userE));
      const arrow = document.createElement('div'); arrow.className = 'tuning-arrow'; arrow.textContent = '⟷'; result.appendChild(arrow);
      result.appendChild(buildEnergyCard('他', museE));
      result.appendChild(buildGapHint(userE, museE));
      renderFeedback(userE, museE, result, () => { result.innerHTML = ''; result.appendChild(buildHistoryBox()); if (hint) hint.textContent = '按图腾，重新感应。'; });
      result.appendChild(buildActionBox(userE));
      if (userE.tier === 'low') result.appendChild(buildMirrorSuggestion());
      result.appendChild(buildHistoryBox());
      const note = document.createElement('p'); note.className = 'tuning-note'; note.textContent = '再按一次图腾，可以重新感应。'; result.appendChild(note);
      if (btn) btn.disabled = false; if (hint) hint.textContent = '按图腾，重新感应。';
      tuningBusy = false;
    }, 1600);
  }

  /* ===== 照镜子 ===== */
  let mirrorBusy = false;
  let autoSenseOnMirror = false;
  let currentMirrorObstacle = null;

  function drawObstacle() {
    const pool = getActiveObstacles();
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function doMirrorSense() {
    if (mirrorBusy) return; mirrorBusy = true;
    const mirrorBtn = document.getElementById('mirrorBtn');
    const hint = document.getElementById('mirrorHint');
    const result = document.getElementById('mirrorResult');
    const senseBtn = document.getElementById('mirrorSenseBtn');
    if (!result) { mirrorBusy = false; return; }
    if (mirrorBtn) { mirrorBtn.classList.remove('sensing'); void mirrorBtn.offsetWidth; mirrorBtn.classList.add('sensing'); }
    if (hint) hint.textContent = '镜面泛起涟漪……';
    if (senseBtn) senseBtn.disabled = true;
    result.hidden = true; result.innerHTML = '';
    setTimeout(() => {
      const obstacle = drawObstacle();
      currentMirrorObstacle = obstacle;
      result.innerHTML = '';
      if (!obstacle) {
        result.innerHTML = '<div class="mirror-result-card"><span class="mirror-result-eyebrow">✧ · 照镜子 · ✧</span><p class="mirror-result-text">阻碍池是空的。<br/>请添加至少一条，或恢复内置。</p></div>';
      } else {
        addMirrorLog(obstacle);
        result.appendChild(buildMirrorResult(obstacle));
        renderMirrorLog();
      }
      result.hidden = false;
      if (hint) hint.textContent = '再按一次，可以再照一次。';
      if (senseBtn) senseBtn.disabled = false;
      mirrorBusy = false;
    }, 1500);
  }

  function buildMirrorResult(obstacle) {
    const card = document.createElement('div'); card.className = 'mirror-result-card';
    const groupLabel = document.createElement('span'); groupLabel.className = 'mirror-result-group';
    groupLabel.textContent = OBSTACLE_GROUPS[obstacle.group] || '显化阻碍';
    const eyebrow = document.createElement('span'); eyebrow.className = 'mirror-result-eyebrow'; eyebrow.textContent = '✧ · 镜子里说 · ✧';
    const text = document.createElement('p'); text.className = 'mirror-result-text'; text.textContent = obstacle.text;
    const note = document.createElement('p'); note.className = 'mirror-result-note';
    note.textContent = '看清它，就已经在松动了。不需要马上「解决」——先承认它。';
    const actions = document.createElement('div'); actions.className = 'mirror-result-actions';
    const againBtn = document.createElement('button'); againBtn.type = 'button'; againBtn.className = 'mirror-result-btn'; againBtn.textContent = '换一面';
    againBtn.addEventListener('click', doMirrorSense);
    const okBtn = document.createElement('button'); okBtn.type = 'button'; okBtn.className = 'mirror-result-btn primary'; okBtn.textContent = '我看见了';
    okBtn.addEventListener('click', () => {
      const r = document.getElementById('mirrorResult'); if (r) { r.hidden = true; r.innerHTML = ''; }
      const h = document.getElementById('mirrorHint'); if (h) h.textContent = '按镜面，看看下一个。';
    });
    actions.appendChild(againBtn); actions.appendChild(okBtn);
    card.appendChild(groupLabel); card.appendChild(eyebrow); card.appendChild(text); card.appendChild(note); card.appendChild(actions);
    return card;
  }

  function renderMirrorLog() {
    const container = document.getElementById('mirrorLog'); if (!container) return;
    container.innerHTML = '';
    const log = loadMirrorLog();
    const head = document.createElement('div'); head.className = 'mirror-log-head';
    const title = document.createElement('div'); title.className = 'mirror-log-title'; title.textContent = '照见记录';
    const count = document.createElement('div'); count.className = 'mirror-log-count';
    count.textContent = log.length ? '共 ' + log.length + ' 条 · 最近 ' + timeAgo(log[0].lastSeenAt) : '';
    head.appendChild(title); head.appendChild(count); container.appendChild(head);
    const list = document.createElement('div'); list.className = 'mirror-log-list';
    if (!log.length) {
      const empty = document.createElement('div'); empty.className = 'mirror-log-empty';
      empty.textContent = '还没有照见过什么。按一次镜面，开始记录你的觉察。';
      list.appendChild(empty);
    } else {
      log.forEach(r => list.appendChild(buildMirrorLogItem(r)));
    }
    container.appendChild(list);
  }

  function buildMirrorLogItem(record) {
    const item = document.createElement('div'); item.className = 'mirror-log-item'; item.dataset.id = record.id;
    const meta = document.createElement('div'); meta.className = 'mirror-log-meta';
    const date = document.createElement('span'); date.className = 'mirror-log-date'; date.textContent = formatDate(record.firstSeenAt); meta.appendChild(date);
    if (Number(record.times) > 1) {
      const times = document.createElement('span'); times.className = 'mirror-log-times'; times.textContent = '照见 ' + record.times + ' 次'; meta.appendChild(times);
    }
    const groupName = OBSTACLE_GROUPS[record.group] || '显化阻碍';
    const group = document.createElement('span'); group.className = 'mirror-log-group'; group.textContent = groupName; meta.appendChild(group);
    const text = document.createElement('p'); text.className = 'mirror-log-text'; text.textContent = record.text;
    const actions = document.createElement('div'); actions.className = 'mirror-log-actions';
    const winBtn = document.createElement('button'); winBtn.type = 'button'; winBtn.className = 'mirror-log-win';
    winBtn.textContent = '✦ 我战胜了';
    winBtn.addEventListener('click', () => {
      if (!window.confirm('确定已经战胜这条了吗？它会从照见记录里收起。')) return;
      removeMirrorLog(record.id); renderMirrorLog(); showToast('✦ 这条已被你战胜');
    });
    actions.appendChild(winBtn);
    item.appendChild(meta); item.appendChild(text); item.appendChild(actions);
    return item;
  }

  function renderMirrorPool() {
    const container = document.getElementById('mirrorPool'); if (!container) return;
    const state = loadObstacleState(); const hiddenSet = new Set(state.hidden);
    const activeCount = BUILTIN_OBSTACLES.filter(o => !hiddenSet.has(o.id)).length + state.custom.length;
    const totalCount = BUILTIN_OBSTACLES.length + state.custom.length;
    container.innerHTML = '';
    const head = document.createElement('div'); head.className = 'mirror-pool-head';
    const title = document.createElement('div'); title.className = 'mirror-pool-title'; title.textContent = '阻碍池';
    const count = document.createElement('div'); count.className = 'mirror-pool-count'; count.textContent = '启用 ' + activeCount + ' / 共 ' + totalCount + ' 条';
    head.appendChild(title); head.appendChild(count); container.appendChild(head);
    const addRow = document.createElement('div'); addRow.className = 'mirror-add-row';
    const addInput = document.createElement('input'); addInput.type = 'text'; addInput.className = 'mirror-add-input'; addInput.placeholder = '添加一条你自己的阻碍...'; addInput.maxLength = 80;
    const addBtn = document.createElement('button'); addBtn.type = 'button'; addBtn.className = 'mirror-add-btn'; addBtn.textContent = '添加';
    const tryAdd = () => {
      const v = addInput.value.trim(); if (!v) { addInput.focus(); return; } if (v.length > 80) return;
      const s = loadObstacleState();
      s.custom.push({ id:'c_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,6), text:v, group:'custom' });
      saveObstacleState(s); addInput.value = ''; renderMirrorPool();
    };
    addBtn.addEventListener('click', tryAdd);
    addInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); tryAdd(); } });
    addRow.appendChild(addInput); addRow.appendChild(addBtn); container.appendChild(addRow);
    if (state.custom.length) {
      const group = document.createElement('details'); group.className = 'mirror-group'; group.open = true;
      const summary = document.createElement('summary');
      summary.innerHTML = '自定义 <span class="mirror-group-count">' + state.custom.length + ' 条</span>';
      group.appendChild(summary);
      const list = document.createElement('div'); list.className = 'mirror-group-list';
      state.custom.forEach(o => {
        const row = document.createElement('div'); row.className = 'mirror-group-item custom';
        const text = document.createElement('span'); text.className = 'mirror-group-item-text'; text.textContent = o.text;
        const del = document.createElement('button'); del.type = 'button'; del.className = 'mirror-group-item-btn del'; del.textContent = '删除';
        del.addEventListener('click', () => {
          if (!window.confirm('删除这一条自定义阻碍吗？')) return;
          const s = loadObstacleState(); s.custom = s.custom.filter(x => x.id !== o.id); saveObstacleState(s); renderMirrorPool();
        });
        row.appendChild(text); row.appendChild(del); list.appendChild(row);
      });
      group.appendChild(list); container.appendChild(group);
    }
    Object.keys(OBSTACLE_GROUPS).forEach(gkey => {
      if (gkey === 'custom') return;
      const items = BUILTIN_OBSTACLES.filter(o => o.group === gkey); if (!items.length) return;
      const group = document.createElement('details'); group.className = 'mirror-group';
      const summary = document.createElement('summary');
      const activeInGroup = items.filter(o => !hiddenSet.has(o.id)).length;
      summary.innerHTML = OBSTACLE_GROUPS[gkey] + ' <span class="mirror-group-count">' + activeInGroup + ' / ' + items.length + '</span>';
      group.appendChild(summary);
      const list = document.createElement('div'); list.className = 'mirror-group-list';
      items.forEach(o => {
        if (hiddenSet.has(o.id)) return;
        const row = document.createElement('div'); row.className = 'mirror-group-item';
        const text = document.createElement('span'); text.className = 'mirror-group-item-text'; text.textContent = o.text;
        const hide = document.createElement('button'); hide.type = 'button'; hide.className = 'mirror-group-item-btn'; hide.textContent = '暂时不用';
        hide.addEventListener('click', () => {
          const s = loadObstacleState(); if (!s.hidden.includes(o.id)) s.hidden.push(o.id); saveObstacleState(s); renderMirrorPool();
        });
        row.appendChild(text); row.appendChild(hide); list.appendChild(row);
      });
      if (!list.children.length) {
        const empty = document.createElement('div'); empty.className = 'mirror-group-empty'; empty.textContent = '这一组全部隐藏了。'; list.appendChild(empty);
      }
      group.appendChild(list); container.appendChild(group);
    });
    if (state.hidden.length) {
      const group = document.createElement('details'); group.className = 'mirror-group';
      const summary = document.createElement('summary');
      summary.innerHTML = '已隐藏 <span class="mirror-group-count">' + state.hidden.length + ' 条</span>';
      group.appendChild(summary);
      const list = document.createElement('div'); list.className = 'mirror-group-list';
      state.hidden.forEach(id => {
        const o = BUILTIN_OBSTACLES.find(x => x.id === id); if (!o) return;
        const row = document.createElement('div'); row.className = 'mirror-group-item';
        const text = document.createElement('span'); text.className = 'mirror-group-item-text'; text.style.opacity = '.6'; text.textContent = o.text;
        const restore = document.createElement('button'); restore.type = 'button'; restore.className = 'mirror-group-item-btn'; restore.textContent = '恢复';
        restore.addEventListener('click', () => {
          const s = loadObstacleState(); s.hidden = s.hidden.filter(x => x !== id); saveObstacleState(s); renderMirrorPool();
        });
        row.appendChild(text); row.appendChild(restore); list.appendChild(row);
      });
      group.appendChild(list); container.appendChild(group);
    }
    const reset = document.createElement('button'); reset.type = 'button'; reset.className = 'mirror-reset-btn'; reset.textContent = '↻ 恢复所有内置阻碍';
    reset.addEventListener('click', () => {
      if (!window.confirm('把所有隐藏的内置阻碍都恢复回来？')) return;
      const s = loadObstacleState(); s.hidden = []; saveObstacleState(s); renderMirrorPool();
    });
    container.appendChild(reset);
  }

  /* ===== 宇宙订单 ===== */
  function getManifestStatus(last) {
    if (!last) {
      return { level:'unknown', icon:'◇', title:'先感应一下频率', desc:'在「调频」页按一下图腾，看看此刻的你和他，再回来下单。', progress:10, progressText:'尚未连接', muse:{ level:'unknown', text:'尚未连接' }, when:'' };
    }
    const staleMs = 6 * 3600 * 1000; const isStale = (Date.now() - last.ts) > staleMs;
    const whenText = '基于 ' + timeAgo(last.ts) + ' 的调频' + (isStale ? '（建议重新感应）' : '');
    const userRank = TIER_RANK[last.userTier]; const gap = last.gap;
    let level, icon, title, desc, progress, progressText;
    if (userRank >= 2) {
      if (gap === 0) { level='excellent'; icon='✦'; title='此刻非常适合显化'; desc='你们同频在高处——信号很稳。现在写下的订单，更容易被「接住」。'; progress=95; progressText='完成态 · 你正处在接收的位置'; }
      else if (gap === 1) { level='good'; icon='✦'; title='适合显化'; desc='你的信号清晰而稳。有一点点小错位，不影响，只是提醒你不要抓得太紧。'; progress=80; progressText='近完成态 · 允许一点点不确定'; }
      else { level='good'; icon='✦'; title='适合显化'; desc='你正处在高处。他在下面抬头看你——先下去一点，让他看见你的手。'; progress=75; progressText='近完成态 · 用你的光，照亮他'; }
    } else if (userRank === 1) {
      if (gap === 0) { level='good'; icon='◈'; title='可以显化'; desc='你们都在中段——平稳的节奏。写下愿望，保持对齐，不要焦虑驱动。'; progress=60; progressText='在过程中 · 保持节奏'; }
      else if (gap === 1) { level='okay'; icon='◈'; title='可以显化，但慢一点'; desc='你的状态中等稳定。写下愿望可以，但先做一些小的对齐行动，比一次许下很多更有效。'; progress=45; progressText='起步 · 从小处开始行动'; }
      else { level='warn'; icon='◉'; title='先调频，再显化'; desc='你们一个在上一端、一个在下一端。此刻许愿，容易变成「我要」「我抓」，先缓缓，等频率靠近一些。'; progress=25; progressText='未启动 · 先修好自己的信号'; }
    } else {
      level='warn'; icon='◉'; title='先照顾自己，再谈显化'; desc='你在低频里。这不是坏事——是信号。但现在的许愿容易被焦虑、羞耻、恐惧驱动。先做「行动指南」里的事，再回来。'; progress=15; progressText='未启动 · 低频容易产生矛盾信号';
    }
    let museLevel, museText;
    if (gap === 0) { museLevel='together'; museText='在和你一起显化'; }
    else if (gap === 1) { museLevel='watching'; museText='在旁边看着'; }
    else { museLevel='waiting'; museText='在等你先稳定'; }
    return { level, icon, title, desc, progress, progressText, muse:{ level:museLevel, text:museText }, when:whenText };
  }
  function renderStatusCard(container, status) {
    container.className = 'manifest-status-card level-' + status.level; container.innerHTML = '';
    const head = document.createElement('div'); head.className = 'manifest-status-head';
    const icon = document.createElement('span'); icon.className = 'manifest-status-icon'; icon.textContent = status.icon;
    const title = document.createElement('span'); title.className = 'manifest-status-title'; title.textContent = status.title;
    head.appendChild(icon); head.appendChild(title); container.appendChild(head);
    const desc = document.createElement('p'); desc.className = 'manifest-status-desc'; desc.textContent = status.desc; container.appendChild(desc);
    const prog = document.createElement('div'); prog.className = 'manifest-progress';
    const bar = document.createElement('div'); bar.className = 'manifest-progress-bar'; bar.style.width = status.progress + '%';
    prog.appendChild(bar); container.appendChild(prog);
    const pt = document.createElement('p'); pt.className = 'manifest-progress-text'; pt.textContent = status.progressText; container.appendChild(pt);
    if (status.when) { const w = document.createElement('p'); w.className = 'manifest-status-when'; w.textContent = status.when; container.appendChild(w); }
  }
  function renderOrderItem(order, museStatus) {
    const item = document.createElement('div'); item.className = 'manifest-item' + (order.done ? ' done' : ''); item.dataset.id = order.id;
    const check = document.createElement('button'); check.type = 'button'; check.className = 'manifest-check';
    check.setAttribute('aria-label', order.done ? '取消完成' : '标记已完成');
    if (order.done) check.textContent = '✓';
    check.addEventListener('click', () => toggleDone(order.id));
    const body = document.createElement('div'); body.className = 'manifest-body';
    const text = document.createElement('p'); text.className = 'manifest-text'; text.textContent = order.text;
    const meta = document.createElement('div'); meta.className = 'manifest-meta';
    const statusLabel = document.createElement('span'); statusLabel.className = 'manifest-status-label ' + (order.done ? 'done' : 'active'); statusLabel.textContent = order.done ? '已完成' : '在显化中';
    const museBadge = document.createElement('span'); museBadge.className = 'manifest-muse-badge muse-' + museStatus.level; museBadge.textContent = '他 · ' + museStatus.text;
    meta.appendChild(statusLabel); meta.appendChild(museBadge);
    body.appendChild(text); body.appendChild(meta);
    const del = document.createElement('button'); del.type = 'button'; del.className = 'manifest-delete'; del.setAttribute('aria-label', '删除'); del.textContent = '✕';
    del.addEventListener('click', () => deleteOrder(order.id));
    item.appendChild(check); item.appendChild(body); item.appendChild(del); return item;
  }
  function renderOrders() {
    const statusCard = document.getElementById('manifestStatusCard');
    const listEl = document.getElementById('manifestList'); const summaryEl = document.getElementById('manifestSummary');
    if (!statusCard || !listEl) return;
    const orders = loadOrders(); const last = loadLastTuning(); const status = getManifestStatus(last);
    renderStatusCard(statusCard, status);
    const doneCount = orders.filter(o => o.done).length;
    if (summaryEl) summaryEl.textContent = orders.length ? '已完成 ' + doneCount + ' 件 · 共 ' + orders.length + ' 件' : '';
    listEl.innerHTML = '';
    if (!orders.length) {
      const empty = document.createElement('div'); empty.className = 'manifest-empty';
      empty.innerHTML = '<div class="manifest-empty-mark">✧</div><p>你的宇宙订单还是空的。</p><p class="manifest-empty-hint">写下第一件想要显化的东西吧。</p>';
      listEl.appendChild(empty); return;
    }
    orders.forEach(order => listEl.appendChild(renderOrderItem(order, status.muse)));
  }
  function renderTheory() {
    const container = document.getElementById('theorySection'); if (!container) return;
    container.innerHTML = '';
    const title = document.createElement('div'); title.className = 'theory-title';
    const l1 = document.createElement('span'); l1.className = 'theory-line';
    const t = document.createElement('span'); t.textContent = '关于显化';
    const l2 = document.createElement('span'); l2.className = 'theory-line';
    title.appendChild(l1); title.appendChild(t); title.appendChild(l2); container.appendChild(title);
    MANIFEST_THEORY.forEach(section => {
      const details = document.createElement('details'); details.className = 'theory-box';
      const summary = document.createElement('summary'); summary.className = 'theory-summary'; summary.textContent = section.title;
      details.appendChild(summary);
      const content = document.createElement('div'); content.className = 'theory-content';
      section.blocks.forEach(block => {
        if (block.type === 'quote') { const el = document.createElement('blockquote'); el.className = 'theory-quote'; el.textContent = block.text; content.appendChild(el); }
        else if (block.type === 'paragraph') { const el = document.createElement('p'); el.className = 'theory-paragraph'; el.textContent = block.text; content.appendChild(el); }
        else if (block.type === 'list') { const ul = document.createElement('ul'); ul.className = 'theory-list'; block.items.forEach(item => { const li = document.createElement('li'); li.textContent = item; ul.appendChild(li); }); content.appendChild(ul); }
        else if (block.type === 'formula') { const el = document.createElement('div'); el.className = 'theory-formula'; el.textContent = block.text; content.appendChild(el); }
      });
      details.appendChild(content); container.appendChild(details);
    });
  }
  function toggleDone(id) { const orders = loadOrders(); const o = orders.find(x => x.id === id); if (!o) return; o.done = !o.done; o.doneAt = o.done ? Date.now() : null; saveOrders(orders); renderOrders(); }
  function deleteOrder(id) { if (!window.confirm('要从宇宙订单里删除这一条吗？')) return; saveOrders(loadOrders().filter(o => o.id !== id)); renderOrders(); }
  function addOrder() {
    const input = document.getElementById('manifestInput'); if (!input) return;
    const text = input.value.trim(); if (!text) { input.focus(); return; } if (text.length > 100) return;
    const orders = loadOrders();
    orders.unshift({ id:'m_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,6), text:text, createdAt:Date.now(), done:false, doneAt:null });
    saveOrders(orders); input.value = ''; renderOrders();
    const l = document.getElementById('manifestList'); if (l) l.scrollIntoView({ behavior:'smooth', block:'nearest' });
  }

  /* ============================================================
     秘密留言板
     ============================================================ */
  function personalizeSecretReply(text) {
    const s = readJSON('jingyan.settings.v1', {}) || {};
    const myName = String(s.myName || '你').slice(0, 16).trim();
    const charName = String(s.charName || '梦角').slice(0, 16).trim();
    return String(text).split('{我}').join(myName).split('{名字}').join(charName);
  }

  function generateSecretReplies() {
    const raw = readJSON('jingyan.cards.v1', []);
    const cards = Array.isArray(raw) ? raw.filter(c => c && typeof c.text === 'string' && c.text.trim()) : [];
    if (!cards.length) return ['……'];
    const count = 1 + Math.floor(Math.random() * 5);
    const pool = cards.slice();
    const picked = [];
    for (let i = 0; i < Math.min(count, pool.length); i++) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(idx, 1)[0]);
    }
    return picked.map(c => personalizeSecretReply(c.text));
  }

  function submitSecret() {
    const input = document.getElementById('secretInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) { input.focus(); return; }
    if (text.length > 500) return;

    const msg = {
      id: 'sm_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
      text: text,
      createdAt: Date.now(),
      readAt: null,
      replies: [],
      colorIdx: Math.floor(Math.random() * 5)
    };
    const list = loadSecretMessages();
    list.unshift(msg);
    saveSecretMessages(list);

    input.value = '';
    renderSecretBoard();

    /* 2–5 秒后自动读取 */
    const delay = 2000 + Math.random() * 3000;
    window.setTimeout(() => {
      const list2 = loadSecretMessages();
      const m = list2.find(x => x.id === msg.id);
      if (!m || m.readAt) return;
      m.readAt = Date.now();
      m.replies = generateSecretReplies().map(t => ({ text: t, ts: Date.now() }));
      saveSecretMessages(list2);
      renderSecretBoard();
      showToast('✦ 梦角读完了你的留言');
    }, delay);
  }

  function deleteSecretMessage(id) {
    if (!window.confirm('删除这条秘密留言吗？此操作不可撤销。')) return;
    saveSecretMessages(loadSecretMessages().filter(m => m.id !== id));
    renderSecretBoard();
    showToast('已删除');
  }

  function renderSecretBoard() {
    const listEl = document.getElementById('secretList');
    const countEl = document.getElementById('secretCount');
    if (!listEl) return;
    const messages = loadSecretMessages();
    if (countEl) countEl.textContent = messages.length ? '共 ' + messages.length + ' 封' : '';
    listEl.innerHTML = '';
    if (!messages.length) {
      const empty = document.createElement('div'); empty.className = 'secret-empty';
      empty.innerHTML = '<div class="secret-empty-icon">✉</div><div class="secret-empty-text">还没有秘密投进来。<br/>你可以写下此刻最不敢说的那一句。</div>';
      listEl.appendChild(empty);
      return;
    }
    messages.forEach(m => listEl.appendChild(buildSecretNote(m)));
  }

  function buildSecretNote(msg) {
    const note = document.createElement('div');
    note.className = 'secret-note ' + (msg.readAt ? 'read' : 'unread');
    note.dataset.color = String(msg.colorIdx != null ? msg.colorIdx : 0);
    note.dataset.id = msg.id;

    const text = document.createElement('p');
    text.className = 'secret-note-text';
    text.textContent = msg.text;
    note.appendChild(text);

    const foot = document.createElement('div');
    foot.className = 'secret-note-foot';

    const time = document.createElement('span');
    time.className = 'secret-note-time';
    time.textContent = formatDate(msg.createdAt);
    foot.appendChild(time);

    const actions = document.createElement('div');
    actions.className = 'secret-note-actions';

    const status = document.createElement('span');
    status.className = 'secret-note-status ' + (msg.readAt ? 'read' : 'unread');
    status.textContent = msg.readAt ? '✦ 梦角已读' : '⏳ 等待被读';
    actions.appendChild(status);

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'secret-note-del';
    del.setAttribute('aria-label', '删除这条留言');
    del.textContent = '✕';
    del.addEventListener('click', () => deleteSecretMessage(msg.id));
    actions.appendChild(del);

    foot.appendChild(actions);
    note.appendChild(foot);

    if (msg.readAt && msg.replies && msg.replies.length) {
      const replies = document.createElement('div');
      replies.className = 'secret-replies';
      const eyebrow = document.createElement('div');
      eyebrow.className = 'secret-replies-eyebrow';
      eyebrow.textContent = '梦角回应了你';
      replies.appendChild(eyebrow);
      msg.replies.forEach(r => {
        const rep = document.createElement('div');
        rep.className = 'secret-reply';
        rep.textContent = '「' + r.text + '」';
        replies.appendChild(rep);
      });
      note.appendChild(replies);
    } else if (!msg.readAt) {
      const waiting = document.createElement('div');
      waiting.className = 'secret-waiting';
      waiting.textContent = '梦角正在读';
      note.appendChild(waiting);
    }

    return note;
  }

  /* ============================================================
     Tab 切换
     ============================================================ */
  function switchToTab(name) {
    const tabs = document.querySelectorAll('.tuning-tab');
    const sensePage = document.getElementById('tuningScrollSense');
    const ordersPage = document.getElementById('tuningScrollOrders');
    const mirrorPage = document.getElementById('tuningScrollMirror');
    const secretPage = document.getElementById('tuningScrollSecret');
    const summary = document.getElementById('tuningSummary');
    tabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-tab') === name));
    if (sensePage) sensePage.hidden = name !== 'sense';
    if (ordersPage) ordersPage.hidden = name !== 'orders';
    if (mirrorPage) mirrorPage.hidden = name !== 'mirror';
    if (secretPage) secretPage.hidden = name !== 'secret';
    if (summary) {
      if (name === 'sense') summary.textContent = '看看此刻，你们在哪一层。';
      else if (name === 'orders') summary.textContent = '写下此刻想显化的东西。';
      else if (name === 'mirror') summary.textContent = '看看是不是哪里挡住了。';
      else summary.textContent = '把秘密留在镜子里。';
    }
    if (name === 'orders') { renderOrders(); if (ordersPage) ordersPage.scrollTop = 0; }
    else if (name === 'mirror') {
      renderMirrorPool(); renderMirrorLog();
      if (mirrorPage) mirrorPage.scrollTop = 0;
      if (autoSenseOnMirror) { autoSenseOnMirror = false; setTimeout(doMirrorSense, 350); }
    }
    else if (name === 'secret') { renderSecretBoard(); if (secretPage) secretPage.scrollTop = 0; }
    else if (name === 'sense') { if (sensePage) sensePage.scrollTop = 0; }
  }

  /* ============================================================
     注入视图
     ============================================================ */
  function injectHTML() {
    if (document.getElementById('viewTuning')) return;
    const main = document.querySelector('.main');
    if (!main) { console.warn('[tuning] 没找到 .main'); return; }
    const section = document.createElement('section');
    section.className = 'view view-tuning';
    section.id = 'viewTuning';
    section.setAttribute('aria-label', '调频');
    section.innerHTML = [
      '<header class="page-head">',
        '<div class="page-head-left">',
          '<button type="button" class="home-return-btn" id="tuningHomeBtn" aria-label="返回主页">⌂</button>',
          '<div class="page-head-text">',
            '<p class="eyebrow">ATTUNEMENT</p>',
            '<h2>调频</h2>',
            '<p class="page-sub" id="tuningSummary">看看此刻，你们在哪一层。</p>',
          '</div>',
        '</div>',
      '</header>',
      '<div class="tuning-tabs">',
        '<button type="button" class="tuning-tab active" data-tab="sense">调频</button>',
        '<button type="button" class="tuning-tab" data-tab="orders">✧ 宇宙订单</button>',
        '<button type="button" class="tuning-tab" data-tab="mirror">◐ 照镜子</button>',
        '<button type="button" class="tuning-tab" data-tab="secret">✉ 秘密留言</button>',
      '</div>',

      '<div class="tuning-scroll tuning-page-sense" id="tuningScrollSense">',
        '<div class="tuning-stage">',
          '<button type="button" class="tuning-totem" id="tuningTotem" aria-label="感应能量">',
            '<svg viewBox="0 0 200 200" aria-hidden="true">',
              '<defs>',
                '<radialGradient id="tGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="rgba(216,180,120,.35)"/><stop offset="60%" stop-color="rgba(181,111,107,.12)"/><stop offset="100%" stop-color="rgba(181,111,107,0)"/></radialGradient>',
                '<linearGradient id="tRing" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e8c9a8"/><stop offset="50%" stop-color="#b98a5a"/><stop offset="100%" stop-color="#5a3010"/></linearGradient>',
              '</defs>',
              '<circle cx="100" cy="100" r="88" fill="url(#tGlow)"/>',
              '<circle cx="100" cy="100" r="78" fill="none" stroke="url(#tRing)" stroke-width="1.2" opacity=".7"/>',
              '<circle cx="100" cy="100" r="64" fill="none" stroke="url(#tRing)" stroke-width=".7" opacity=".5"/>',
              '<circle cx="100" cy="100" r="50" fill="none" stroke="url(#tRing)" stroke-width=".5" opacity=".35"/>',
              '<g class="tuning-waves" stroke="url(#tRing)" fill="none" stroke-linecap="round">',
                '<path class="tw tw1" d="M40 100 Q60 88 80 100 T120 100 T160 100"/>',
                '<path class="tw tw2" d="M40 100 Q60 112 80 100 T120 100 T160 100"/>',
                '<path class="tw tw3" d="M40 100 Q60 92 80 100 T120 100 T160 100"/>',
                '<path class="tw tw4" d="M40 100 Q60 108 80 100 T120 100 T160 100"/>',
              '</g>',
              '<circle cx="100" cy="100" r="8" fill="url(#tRing)" opacity=".85"/>',
              '<circle cx="100" cy="100" r="3" fill="#1a0a0c"/>',
              '<g stroke="url(#tRing)" stroke-width=".8" opacity=".5" stroke-linecap="round">',
                '<line x1="100" y1="6" x2="100" y2="18"/>',
                '<line x1="100" y1="182" x2="100" y2="194"/>',
                '<line x1="6" y1="100" x2="18" y2="100"/>',
                '<line x1="182" y1="100" x2="194" y2="100"/>',
              '</g>',
            '</svg>',
          '</button>',
          '<p class="tuning-hint" id="tuningHint">按图腾，感应此刻的能量。</p>',
          '<button type="button" class="btn primary tuning-sense-btn" id="tuningSenseBtn">感应能量</button>',
        '</div>',
        '<div class="tuning-result" id="tuningResult"></div>',
      '</div>',

      '<div class="tuning-scroll tuning-page-orders" id="tuningScrollOrders" hidden>',
        '<div class="universe-header">',
          '<span class="universe-eyebrow">✧ · UNIVERSE ORDER · ✧</span>',
          '<h1 class="universe-title">宇宙订单</h1>',
          '<div class="universe-rule"></div>',
          '<p class="universe-subtitle">写下你此刻想要显化的东西</p>',
        '</div>',
        '<div class="manifest-status-card level-unknown" id="manifestStatusCard"></div>',
        '<div class="manifest-add">',
          '<input class="manifest-input" id="manifestInput" type="text" placeholder="写下你想要显化的目标..." maxlength="100" autocomplete="off" />',
          '<button type="button" class="manifest-add-btn" id="manifestAddBtn">加入订单</button>',
        '</div>',
        '<p class="manifest-summary" id="manifestSummary"></p>',
        '<div class="manifest-list" id="manifestList"></div>',
        '<div class="theory-section" id="theorySection"></div>',
      '</div>',

      '<div class="tuning-scroll tuning-page-mirror" id="tuningScrollMirror" hidden>',
        '<div class="mirror-stage">',
          '<button type="button" class="mirror-btn" id="mirrorBtn" aria-label="照镜子">',
            '<svg viewBox="0 0 200 260" aria-hidden="true">',
              '<defs>',
                '<linearGradient id="mFrame" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#6b4a3b"/><stop offset="20%" stop-color="#2a1315"/><stop offset="40%" stop-color="#a87a5a"/><stop offset="60%" stop-color="#3a1a1c"/><stop offset="80%" stop-color="#7a5540"/><stop offset="100%" stop-color="#2a1012"/></linearGradient>',
                '<radialGradient id="mGlass" cx="50%" cy="40%" r="70%"><stop offset="0%" stop-color="#4a1a20"/><stop offset="50%" stop-color="#1a080a"/><stop offset="100%" stop-color="#050203"/></radialGradient>',
                '<radialGradient id="mMist" cx="50%" cy="55%" r="55%"><stop offset="0%" stop-color="rgba(180,80,80,.28)"/><stop offset="55%" stop-color="rgba(120,40,45,.12)"/><stop offset="100%" stop-color="rgba(80,20,25,0)"/></radialGradient>',
                '<linearGradient id="mShine" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(255,240,230,.28)"/><stop offset="100%" stop-color="rgba(255,240,230,0)"/></linearGradient>',
                '<clipPath id="mClip"><ellipse cx="100" cy="110" rx="78" ry="100"/></clipPath>',
              '</defs>',
              '<path d="M100 4 l7 10 l-7 10 l-7 -10 z" fill="rgba(200,160,128,.85)" stroke="rgba(20,6,8,.8)" stroke-width=".6"/>',
              '<ellipse cx="100" cy="110" rx="90" ry="112" fill="url(#mFrame)" stroke="rgba(10,4,5,.95)" stroke-width="2"/>',
              '<ellipse cx="100" cy="110" rx="83" ry="105" fill="none" stroke="rgba(200,160,128,.4)" stroke-width=".8"/>',
              '<ellipse cx="100" cy="110" rx="78" ry="100" fill="url(#mGlass)" stroke="rgba(20,4,6,.6)" stroke-width="1.4"/>',
              '<g clip-path="url(#mClip)">',
                '<ellipse class="mirror-glass-mist" cx="100" cy="110" rx="62" ry="82" fill="url(#mMist)"/>',
                '<ellipse cx="70" cy="60" rx="22" ry="30" fill="rgba(255,230,220,.05)" transform="rotate(-18 70 60)"/>',
                '<rect class="mirror-glass-shine" x="0" y="0" width="40" height="260" fill="url(#mShine)" opacity=".8"/>',
                '<ellipse class="mirror-ripple-anim" cx="100" cy="110" rx="20" ry="20" fill="none" stroke="rgba(216,180,120,.7)" stroke-width="2" opacity="0"/>',
              '</g>',
              '<path d="M50 234 L150 234 L162 258 L38 258 Z" fill="rgba(60,20,22,.95)" stroke="rgba(10,4,5,.9)" stroke-width="1.4"/>',
              '<path d="M60 240 L140 240" stroke="rgba(200,160,128,.35)" stroke-width=".8"/>',
              '<ellipse cx="100" cy="234" rx="48" ry="6" fill="rgba(40,14,16,.95)"/>',
            '</svg>',
          '</button>',
          '<p class="mirror-hint" id="mirrorHint">按镜面，看看此刻的阻碍。</p>',
          '<button type="button" class="btn primary mirror-sense-btn" id="mirrorSenseBtn">照一下</button>',
        '</div>',
        '<div class="mirror-result" id="mirrorResult" hidden></div>',
        '<div class="mirror-log" id="mirrorLog"></div>',
        '<div class="mirror-pool" id="mirrorPool"></div>',
      '</div>',

      '<div class="tuning-scroll tuning-page-secret" id="tuningScrollSecret" hidden>',
        '<div class="secret-board">',
          '<div class="secret-lead">',
            '<span class="secret-lead-eyebrow">✉ · SECRET LETTER · ✉</span>',
            '<h2 class="secret-lead-title">秘密留言</h2>',
            '<p class="secret-lead-sub">写下此刻最不敢说的那一句。<br/>镜子里有人会读到它。</p>',
          '</div>',
          '<div class="secret-compose">',
            '<textarea class="secret-input" id="secretInput" maxlength="500" placeholder="我的秘密是……"></textarea>',
            '<div class="secret-compose-foot">',
              '<span class="secret-compose-hint">只有你自己看得见这些留言</span>',
              '<button type="button" class="secret-send" id="secretSendBtn">投进镜子</button>',
            '</div>',
          '</div>',
          '<p class="manifest-summary" id="secretCount" style="margin-bottom:14px"></p>',
          '<div class="secret-list" id="secretList"></div>',
        '</div>',
      '</div>',
    ].join('');

    main.appendChild(section);
    console.log('[tuning] 视图已注入');

    const grid = document.querySelector('.home-grid');
    if (grid && !document.getElementById('tuningHomeApp')) {
      const app = document.createElement('button');
      app.type = 'button'; app.className = 'home-app'; app.id = 'tuningHomeApp'; app.setAttribute('data-action', 'tuning');
      app.innerHTML = '<span class="home-icon" aria-hidden="true">◎</span><span class="home-label">调频</span>';
      const before = grid.querySelector('[data-action="mirror"]');
      if (before) grid.insertBefore(app, before); else grid.appendChild(app);
      app.addEventListener('click', () => { const ov = document.getElementById('homeOverlay'); if (ov) ov.classList.remove('visible'); openTuning(); });
    }
    const drawer = document.querySelector('.drawer-grid');
    if (drawer && !drawer.querySelector('[data-action="tuning"]')) {
      const item = document.createElement('button');
      item.type = 'button'; item.className = 'drawer-item'; item.setAttribute('data-action', 'tuning');
      item.innerHTML = '<span class="drawer-icon">◎</span><span class="drawer-label">调频</span>';
      drawer.insertBefore(item, drawer.firstChild);
      item.addEventListener('click', () => { const d = document.getElementById('composerDrawer'); if (d) d.classList.remove('open'); setTimeout(() => openTuning(), 120); });
    }

    const totem = document.getElementById('tuningTotem'); if (totem) totem.addEventListener('click', doSense);
    const senseBtn = document.getElementById('tuningSenseBtn'); if (senseBtn) senseBtn.addEventListener('click', doSense);
    const mirrorBtn = document.getElementById('mirrorBtn'); if (mirrorBtn) mirrorBtn.addEventListener('click', doMirrorSense);
    const mirrorSenseBtn = document.getElementById('mirrorSenseBtn'); if (mirrorSenseBtn) mirrorSenseBtn.addEventListener('click', doMirrorSense);
    const addBtn = document.getElementById('manifestAddBtn'); if (addBtn) addBtn.addEventListener('click', addOrder);
    const mInput = document.getElementById('manifestInput');
    if (mInput) mInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); addOrder(); } });

    const secretSendBtn = document.getElementById('secretSendBtn');
    if (secretSendBtn) secretSendBtn.addEventListener('click', submitSecret);
    const secretInput = document.getElementById('secretInput');
    if (secretInput) {
      secretInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault(); submitSecret();
        }
      });
    }

    document.querySelectorAll('.tuning-tab').forEach(tab => {
      tab.addEventListener('click', () => switchToTab(tab.getAttribute('data-tab')));
    });

    const homeBtn = document.getElementById('tuningHomeBtn');
    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        ['viewChat','viewLibrary','viewDiary','viewPainting','viewTuning'].forEach(i => { const el = document.getElementById(i); if (el) el.classList.remove('active'); });
        const ov = document.getElementById('homeOverlay'); if (ov) ov.classList.add('visible');
      });
    }

    renderTheory();
    renderMirrorPool();
    renderMirrorLog();
    renderSecretBoard();
  }

  function openTuning() {
    ['viewChat','viewLibrary','viewDiary','viewPainting'].forEach(i => { const el = document.getElementById(i); if (el) el.classList.remove('active'); });
    const v = document.getElementById('viewTuning'); if (v) v.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const ov = document.getElementById('homeOverlay'); if (ov) ov.classList.remove('visible');
    const sc = document.querySelector('.tuning-scroll:not([hidden])'); if (sc) sc.scrollTop = 0;
  }

  function watch() {
    if (typeof MutationObserver !== 'function') return;
    const t = document.getElementById('viewTuning'); if (!t) return;
    const others = ['viewChat','viewLibrary','viewDiary','viewPainting'].map(i => document.getElementById(i)).filter(Boolean);
    const mo = new MutationObserver(() => { if (others.some(o => o.classList.contains('active'))) t.classList.remove('active'); });
    others.forEach(o => mo.observe(o, { attributes:true, attributeFilter:['class'] }));
  }

  function init() {
    injectCSS();
    injectHTML();
    watch();
    console.log('[tuning] 初始化完成 v10');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();