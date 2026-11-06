/* ============================================================
   镜中梦魇 · 雷诺曼占卜 v2.5
   —— Rana 40 张 / 5 种牌阵 / 暗金线稿 / 魔杖换牌 / 100 条理由
   —— 在 mirror.js 之后加载，接管水晶球入口
   ============================================================ */
(() => {
  'use strict';

  if (window.__oracleV2Ready) return;
  window.__oracleV2Ready = true;

  const SETTINGS_KEY = 'jingyan.settings.v1';
  const MIRROR_KEY   = 'jingyan.mirror.v1';
  const ORACLE_KEY   = 'jingyan.mirror.oracle.v1';

  /* ============================================================
     40 张牌
     ============================================================ */
  const DECK = [
    { id:1,  name:'骑士',   keywords:'消息、来访、速度、新动向',   meaning:'有事正在快速向你靠近，可能是信息、客人或一个新变化。' },
    { id:2,  name:'三叶草', keywords:'小运气、短暂机会、小确幸',   meaning:'像找到车位一样的小幸运，通常不持久，需要及时把握。' },
    { id:3,  name:'船',     keywords:'旅行、距离、商业、思念',     meaning:'代表远距离的移动，可以是实际出行、外地业务，或远方的某人某事。' },
    { id:4,  name:'房子',   keywords:'家庭、房产、稳定、根基',     meaning:'你的生活基础、家人或任何给你安全感的事物。' },
    { id:5,  name:'树',     keywords:'健康、成长、缓慢、根源',     meaning:'代表需要时间积累的事，健康议题，或根深蒂固的状况；发展是渐进的。' },
    { id:6,  name:'云',     keywords:'困惑、模糊、不确定',         meaning:'事情尚未明朗，有疑虑或隐藏信息。云的明暗面朝向可提示麻烦的来源。' },
    { id:7,  name:'蛇',     keywords:'复杂、迂回、竞争、欺骗',     meaning:'一条曲折的路，可能涉及复杂的人际关系、竞争对手，或需要小心应对的谎言。' },
    { id:8,  name:'棺材',   keywords:'结束、转化、停滞',           meaning:'一个阶段彻底结束了，可能伴随痛苦，但结束也为新开始腾出空间。' },
    { id:9,  name:'花束',   keywords:'礼物、邀请、愉悦、善意',     meaning:'愉快的事正在到来，如礼物、赞美、邀约，会为周围的牌"增色"。' },
    { id:10, name:'镰刀',   keywords:'突然切断、果断决定、危险',   meaning:'一个迅速而决定性的行动，通常是"切断"某事。刀刃指向的牌会受到影响。' },
    { id:11, name:'鞭子',   keywords:'冲突、争执、重复、体力',     meaning:'代表争吵、持续的矛盾，或重复性的体力消耗，也可能指强烈的激情。' },
    { id:12, name:'鸟',     keywords:'对话、流言、焦虑、成对',     meaning:'口头沟通、电话、闲谈或担忧。也常代表一对情侣或成双的事物。' },
    { id:13, name:'孩子',   keywords:'新开始、纯真、小、起步',     meaning:'全新的、年轻的事物，处于早期阶段。与其他牌组合时，常使事情"变小"或"变得单纯"。' },
    { id:14, name:'狐狸',   keywords:'谨慎、工作、自保、欺骗',     meaning:'提醒你"事情可能并非表面那样"。常关联工作、雇佣关系，或需要运用机智应对的自私行为。' },
    { id:15, name:'熊',     keywords:'权力、上司、保护、财务',     meaning:'代表权威人物（老板、母亲形象）或力量。也与财务资源和官方支持有关。' },
    { id:16, name:'星星',   keywords:'希望、方向、成功、灵感',     meaning:'像导航星一样，代表找到方向、获得清晰或走向成功。现代也常关联网络与科技。' },
    { id:17, name:'鹳',     keywords:'改变、搬迁、升级、转场',     meaning:'积极的变化正在发生，通常指搬家、晋升，或任何带来"新气象"的改善。' },
    { id:18, name:'狗',     keywords:'朋友、忠诚、支持、信任',     meaning:'生活中可靠的朋友或支持者，可以字面指宠物，也代表你可以依赖的忠诚关系。' },
    { id:19, name:'塔',     keywords:'机构、权威、孤立、边界',     meaning:'大型组织（公司、政府、医院），也代表设立界限、独处，或一种"高高在上"的隔离状态。' },
    { id:20, name:'花园',   keywords:'社交、公众、活动、声誉',     meaning:'公共领域的事——聚会、社交媒体、人脉网络，或你在公众眼中的形象。' },
    { id:21, name:'山',     keywords:'阻碍、延迟、卡住、挑战',     meaning:'有东西挡住了去路，代表进展停滞、困难，或固执难移的局面。' },
    { id:22, name:'十字路口', keywords:'选择、决定、多条路、犹豫', meaning:'一个必须做出决定的时刻，面前有多个选项，需要你权衡后选择一条路。' },
    { id:23, name:'老鼠',   keywords:'损耗、压力、焦虑、流失',     meaning:'某些东西正在被慢慢消耗——金钱、精力或内心的平静。是一种持续的、啃噬般的担忧或损失。' },
    { id:24, name:'心',     keywords:'爱、情感、激情、核心渴望',   meaning:'代表各种形式的爱——浪漫、亲情，或你内心真正在意的事。' },
    { id:25, name:'戒指',   keywords:'承诺、合约、伴侣、循环',     meaning:'有约束力的协议，如婚姻、合同或合伙关系。也代表循环往复、会再次发生的事。' },
    { id:26, name:'书',     keywords:'秘密、知识、学习、未知',     meaning:'代表尚未揭晓的信息，或需要通过学习、研究才能获得的知识。' },
    { id:27, name:'信',     keywords:'文件、消息、书面沟通',       meaning:'具体的书面信息——邮件、短信、合同、证书，或任何有实体记录的文字沟通。' },
    { id:28, name:'男人',   keywords:'男性问卜者或关键男性',       meaning:'如果你认同为男性，这就是你；否则代表情况中的重要男性（伴侣、父亲、同事等）。' },
    { id:29, name:'女人',   keywords:'女性问卜者或关键女性',       meaning:'含义与男人牌对称，代表你本人或局面中的关键女性人物。' },
    { id:30, name:'百合',   keywords:'和平、成熟、安宁、亲密',     meaning:'随年龄而来的智慧与平静，也可指年长者，或一段需要耐心与成熟去处理的关系。' },
    { id:31, name:'太阳',   keywords:'成功、快乐、能量、胜利',     meaning:'牌组中最积极的牌之一，代表成功、活力与清晰，会"照亮"周围的牌。' },
    { id:32, name:'月亮',   keywords:'情感、直觉、认可、名声',     meaning:'深层情绪与直觉，也关联公众认可、声誉，以及夜晚或周期性的能量。' },
    { id:33, name:'钥匙',   keywords:'解决方案、确定性、关键、突破', meaning:'你寻找的答案或突破口。钥匙出现时，往往是一个强烈的"是"，并会"解锁"周围的牌。' },
    { id:34, name:'鱼',     keywords:'金钱、生意、丰盛、独立',     meaning:'直接的财务牌——收入、商业、物质资源，也代表丰盛与流动性。' },
    { id:35, name:'锚',     keywords:'稳定、工作、坚持、长期',     meaning:'代表扎根、安全感和长期不变的状态，常直接指向工作或事业上的稳定。' },
    { id:36, name:'十字架', keywords:'责任、负担、信念、必经的功课', meaning:'代表一种沉重的、命中注定的责任或考验，是必须面对和承担的课题。' },
    { id:37, name:'灵体',   keywords:'灵性、缘分、直觉、无形',     meaning:'从「云」与「树」之间分出的一缕——看不见的手在安排。常表示非人为的牵引、直觉、已逝之人，或精神性的连接。' },
    { id:38, name:'香炉',   keywords:'净化、仪式、烟、归零',       meaning:'从「镰刀」与「云」里升起的一缕烟。清理、告别、仪式、祈愿；也代表一段关系或情绪被熏过后重新开始。' },
    { id:39, name:'床',     keywords:'性、休息、私密、松弛',       meaning:'从「鞭子」分出的另一面——不必是冲突，也可以是床。亲密、欲望、睡眠、恢复，或一个只留给某个人的空间。' },
    { id:40, name:'市场',   keywords:'工作、交易、价值、等价交换', meaning:'从「狐狸 / 月亮 / 船锚 / 鱼」分出的市集。努力与回报、契约与价钱、可被看见的价值交换。' }
  ];

  const DECK_MAP = {};
  DECK.forEach(c => { DECK_MAP[c.id] = c; });

  /* 牌的情绪值：负=不满意，正=很好 */
  const CARD_MOOD = {
    1:0,  2:1,  3:0,  4:1,  5:0,  6:-1, 7:-1, 8:-2, 9:2,  10:-1,
    11:-1, 12:0, 13:1, 14:0, 15:0, 16:2, 17:1, 18:1, 19:0, 20:1,
    21:-1, 22:0, 23:-2, 24:2, 25:1, 26:0, 27:0, 28:0, 29:0, 30:1,
    31:2, 32:0, 33:1, 34:1, 35:0, 36:-1,
    37:0, 38:1, 39:0, 40:1
  };

  /* ============================================================
     40 个统一的线稿图标
     ============================================================ */
  const ICONS = {
    1:  '<path d="M6 20V11a6 6 0 0 1 12 0v9"/><path d="M3 20h5M16 20h5"/><path d="M9.5 5.8V3.5M14.5 5.8V3.5" stroke-width="1"/>',
    2:  '<circle cx="12" cy="7.6" r="3.1"/><circle cx="7.6" cy="13.8" r="3.1"/><circle cx="16.4" cy="13.8" r="3.1"/><path d="M12 10.7V20"/>',
    3:  '<path d="M4 15.6h16l-2 4.4H6z"/><path d="M12 15.6V4"/><path d="M12 5.6l5.4 6.8H12z"/>',
    4:  '<path d="M3 11l9-7 9 7"/><path d="M5.6 9.7V20h12.8V9.7"/><path d="M10 20v-4.6h4V20"/>',
    5:  '<circle cx="12" cy="9" r="5.6"/><path d="M12 14.6V20"/><path d="M8.6 20h6.8"/>',
    6:  '<path d="M7 17.6h9.5a3.8 3.8 0 0 0 .3-7.6 5.2 5.2 0 0 0-10-1A3.8 3.8 0 0 0 7 17.6z"/>',
    7:  '<path d="M6 19c0-2.6 4-2.6 4-5.2S6 11.2 6 8.6s2.6-4 6-4"/><circle cx="13.6" cy="4.6" r="1.3"/><path d="M12.6 3.8l-1.2-1M14.6 3.8l1.2-1" stroke-width=".8"/>',
    8:  '<path d="M9.2 3h5.6l2.4 4.4-1 13.6H7.8L6.8 7.4z"/><path d="M12 8v6M9.3 11h5.4" stroke-width=".9"/>',
    9:  '<circle cx="12" cy="5.8" r="2.2"/><path d="M12 8V20"/><path d="M12 12.4c-2.2 0-3.8-1.6-3.8-3.6M12 16c2.2 0 3.8-1.6 3.8-3.6"/>',
    10: '<path d="M4.5 20l8.6-8.6"/><path d="M13.1 11.4C14.7 6.8 18.5 4.8 20.6 5.4c-2.6 1.2-3.6 3.4-4.5 5.4"/>',
    11: '<path d="M5 19.5l3.2-3.2"/><path d="M8.2 16.3C9.6 10.5 14.2 6 18.6 6.8"/><circle cx="19" cy="6.7" r="1" fill="currentColor" stroke="none"/>',
    12: '<path d="M4 10c2-2 4-2 6 0M14 10c2-2 4-2 6 0"/><path d="M4 16c2-2 4-2 6 0M14 16c2-2 4-2 6 0"/>',
    13: '<circle cx="12" cy="6.8" r="2.6"/><path d="M12 9.4V15"/><path d="M8 12h8"/><path d="M9.6 19.6L12 15l2.4 4.6"/>',
    14: '<path d="M6 8.5L5 4l4 2h6l4-2-1 4.5"/><path d="M5.5 8.5c0 6 2.8 9.8 6.5 11.5 3.7-1.7 6.5-5.5 6.5-11.5"/><circle cx="9.6" cy="11.4" r=".9" fill="currentColor" stroke="none"/><circle cx="14.4" cy="11.4" r=".9" fill="currentColor" stroke="none"/><path d="M11 15h2" stroke-width=".9"/>',
    15: '<circle cx="12" cy="13" r="6"/><circle cx="7" cy="7.2" r="2.2"/><circle cx="17" cy="7.2" r="2.2"/><circle cx="10" cy="12" r=".8" fill="currentColor" stroke="none"/><circle cx="14" cy="12" r=".8" fill="currentColor" stroke="none"/><circle cx="12" cy="15" r="1.1" fill="currentColor" stroke="none"/>',
    16: '<path d="M12 3l2.7 5.4 6 .9-4.35 4.2 1.03 5.95L12 16.6l-5.38 2.85L7.65 13.5 3.3 9.3l6-.9z"/>',
    17: '<circle cx="16" cy="6" r="2"/><path d="M14 6h-2.4L8.8 10"/><path d="M8.8 10c-2.6 2-2.6 5.4-.8 7.4"/><path d="M8 17.4V21M11 18v3"/><path d="M18 5.6l2.6-1"/>',
    18: '<path d="M6.2 9.4V6l3 1.2"/><path d="M17.8 9.4V6l-3 1.2"/><path d="M6.2 9.4c0 5 2.4 8.6 5.8 10.2 3.4-1.6 5.8-5.2 5.8-10.2"/><circle cx="9.8" cy="11.6" r=".85" fill="currentColor" stroke="none"/><circle cx="14.2" cy="11.6" r=".85" fill="currentColor" stroke="none"/><path d="M12 14v1.8" stroke-width=".9"/><path d="M12 17.6l-1.2 1M12 17.6l1.2 1" stroke-width=".8"/>',
    19: '<path d="M7 20.5V7.5L12 4l5 3.5v13"/><path d="M7 11.5h10M7 15.5h10"/><path d="M10 20.5v-3h4v3"/><path d="M7 7.5V5h2v2.5M15 7.5V5h2v2.5" stroke-width=".9"/>',
    20: '<circle cx="12" cy="6" r="1.7"/><circle cx="7.5" cy="9.5" r="1.7"/><circle cx="16.5" cy="9.5" r="1.7"/><path d="M12 12.2v7.8M7.5 12.2v7.8M16.5 12.2v7.8"/><path d="M4 20h16"/>',
    21: '<path d="M2 19l7-11 4 6 3-4 6 9z"/><path d="M6.4 13.6l2.6-3.6"/>',
    22: '<path d="M12 21V11"/><path d="M12 11C10 7 7 5 4 4.5M12 11c2-4 5-6 8-6.5"/><path d="M4.5 4.5l-1.5-1M19.5 4.5l1.5-1" stroke-width=".9"/>',
    23: '<path d="M4.5 15.5c0-3.6 2.6-6.4 6-6.4 2.6 0 4.4 1 5.4 2.6"/><path d="M15.9 11.7c2.2 0 3.6 1.2 3.6 3s-1.8 3-4 3H6.5"/><circle cx="9.4" cy="11.6" r=".8" fill="currentColor" stroke="none"/><path d="M19 17.8c1.8.6 1.8 2.6-.4 2.8" stroke-width=".85"/>',
    24: '<path d="M12 20.2S4.5 15.4 4.5 10.6A3.9 3.9 0 0 1 12 8.4a3.9 3.9 0 0 1 7.5 2.2c0 4.8-7.5 9.6-7.5 9.6z"/>',
    25: '<circle cx="12" cy="14.2" r="5.4"/><path d="M9 9L12 4.2 15 9"/><path d="M10.4 9h3.2"/>',
    26: '<path d="M3.5 5.2h6.6a2 2 0 0 1 1.9 2v13a2 2 0 0 0-1.9-1.9H3.5z"/><path d="M20.5 5.2h-6.6a2 2 0 0 0-1.9 2v13a2 2 0 0 1 1.9-1.9h6.6z"/>',
    27: '<rect x="3" y="6.2" width="18" height="11.6" rx="1.6"/><path d="M3.6 7l8.4 5.6L20.4 7"/>',
    28: '<circle cx="12" cy="7" r="2.7"/><path d="M12 9.7V16"/><path d="M7.6 12h8.8"/><path d="M9.6 21L12 16l2.4 5"/>',
    29: '<circle cx="12" cy="6.4" r="2.5"/><path d="M12 8.9v4"/><path d="M8.2 11h7.6"/><path d="M12 12.9L8 21h8z"/>',
    30: '<path d="M12 21V10.6"/><path d="M12 10.6C9.6 8.4 9.6 5.2 12 3c2.4 2.2 2.4 5.4 0 7.6z"/><path d="M12 12.6c-2.2 0-4-1.2-5-3.2M12 12.6c2.2 0 4-1.2 5-3.2"/><path d="M8.6 16l-1.8 2.2M15.4 16l1.8 2.2"/>',
    31: '<circle cx="12" cy="12" r="4.4"/><path d="M12 2.4v2.4M12 19.2v2.4M2.4 12h2.4M19.2 12h2.4"/><path d="M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M18.8 5.2l-1.7 1.7M6.9 17.1l-1.7 1.7"/>',
    32: '<path d="M17.6 14.6A7 7 0 1 1 11 4.2a5.8 5.8 0 0 0 6.6 10.4z"/><circle cx="18.4" cy="5.4" r=".9" fill="currentColor" stroke="none"/>',
    33: '<circle cx="8.4" cy="8.4" r="4"/><path d="M11.2 11.2L20 20"/><path d="M16.2 16.2l2-2M19 19l2-2"/>',
    34: '<path d="M20.5 12c-2.2-3-5.4-4.4-8.6-4.4S5.5 9 3.4 12c2.1 3 5.3 4.4 8.5 4.4s6.4-1.4 8.6-4.4z"/><path d="M3.4 12l-1.9-3v6z"/><circle cx="16.4" cy="10.8" r=".8" fill="currentColor" stroke="none"/>',
    35: '<circle cx="12" cy="4.6" r="2"/><path d="M12 6.6v14"/><path d="M8 10.4h8"/><path d="M4.6 13.4a7.4 7.4 0 0 0 14.8 0"/><path d="M4.6 13.4l-1.2 2.2M19.4 13.4l1.2 2.2" stroke-width=".9"/>',
    36: '<path d="M12 2.5v19M5.5 9h13"/><circle cx="12" cy="2.5" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="21.5" r="1" fill="currentColor" stroke="none"/><circle cx="5.5" cy="9" r="1" fill="currentColor" stroke="none"/><circle cx="18.5" cy="9" r="1" fill="currentColor" stroke="none"/>',
    37: '<path d="M6.6 20.5V11a5.4 5.4 0 0 1 10.8 0v9.5l-1.8-1.8-2.7 1.8-2.7-1.8z"/><circle cx="9.9" cy="11.2" r=".9" fill="currentColor" stroke="none"/><circle cx="14.1" cy="11.2" r=".9" fill="currentColor" stroke="none"/>',
    38: '<path d="M8 14h8l-.8 4.4c-.1.6-.6 1-1.2 1H10c-.6 0-1.1-.4-1.2-1z"/><path d="M10 19.4l-.6 2h5.2l-.6-2"/><path d="M12 11.6c0-1.6-1.8-1.8-1.8-3.4S12 6.4 12 4.8" stroke-width=".9"/><path d="M15 10.6c0-1.2 1.4-1.4 1.4-2.6" stroke-width=".9"/>',
    39: '<path d="M3 20V8"/><path d="M3 14h18v6"/><path d="M21 14v-3.6"/><rect x="6" y="9.6" width="6" height="3.6" rx="1.2"/>',
    40: '<path d="M3.2 9L5.2 4h13.6l2 5"/><path d="M3.2 9h17.6"/><path d="M3.2 9l.8 1.8M20.8 9l-.8 1.8"/><path d="M5 11v9h14v-9"/><path d="M10 20v-5h4v5"/>'
  };

  function iconSvg(id) {
    const inner = ICONS[id] || '<circle cx="12" cy="12" r="6"/>';
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true">' + inner + '</svg>';
  }

  /* ============================================================
     5 种牌阵
     ============================================================ */
  const SPREADS = {
    line3: {
      name: '三张线阵', count: 3, desc: '过去 · 现在 · 未来',
      grid: { cols: 3, rows: 1 },
      positions: [
        { r:0, c:0, label:'过去 / 背景' },
        { r:0, c:1, label:'现在 / 核心' },
        { r:0, c:2, label:'未来 / 走向' }
      ]
    },
    line5: {
      name: '五张线阵', count: 5, desc: '完整的时间线',
      grid: { cols: 5, rows: 1 },
      positions: [
        { r:0, c:0, label:'远期背景' },
        { r:0, c:1, label:'近期背景' },
        { r:0, c:2, label:'核心 / 现状' },
        { r:0, c:3, label:'近期走向' },
        { r:0, c:4, label:'结果 / 未来' }
      ]
    },
    cross5: {
      name: '十字五张阵', count: 5, desc: '核心 · 助力 · 阻力 · 隐性 · 行动',
      grid: { cols: 3, rows: 3 },
      positions: [
        { r:1, c:1, label:'核心 / 问题' },
        { r:0, c:1, label:'助力 / 推力' },
        { r:2, c:1, label:'阻力 / 拉力' },
        { r:1, c:0, label:'隐性因素' },
        { r:1, c:2, label:'行动方向' }
      ]
    },
    grid9: {
      name: '九宫格', count: 9, desc: '整体局势',
      grid: { cols: 3, rows: 3 },
      positions: [
        { r:0, c:0, label:'外部过去' }, { r:0, c:1, label:'外部现在' }, { r:0, c:2, label:'外部未来' },
        { r:1, c:0, label:'个人过去' }, { r:1, c:1, label:'核心主题' }, { r:1, c:2, label:'个人未来' },
        { r:2, c:0, label:'可控过去' }, { r:2, c:1, label:'可控现在' }, { r:2, c:2, label:'可控未来' }
      ]
    },
    h7: {
      name: 'H 关系阵', count: 7, desc: '两方关系',
      grid: { cols: 3, rows: 3 },
      positions: [
        { r:0, c:0, label:'A 方表面' },
        { r:1, c:0, label:'A 方现状' },
        { r:2, c:0, label:'A 方深层' },
        { r:0, c:2, label:'B 方表面' },
        { r:1, c:2, label:'B 方现状' },
        { r:2, c:2, label:'B 方深层' },
        { r:1, c:1, label:'关系核心' }
      ]
    }
  };

  const SPREAD_ORDER = ['line3', 'line5', 'cross5', 'grid9', 'h7'];

  /* ============================================================
     小工具
     ============================================================ */
  const $ = (s, r) => (r || document).querySelector(s);
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const pad2 = n => String(n).padStart(2, '0');
  const uid = () => 'o_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
  const pickFrom = arr => arr[Math.floor(Math.random() * arr.length)];

  function readJSON(k, f) {
    try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; }
    catch (e) { return f; }
  }
  function writeJSON(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); }
    catch (e) { toast('保存失败：浏览器存储空间可能已满'); }
  }
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, ch => (
      { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[ch]
    ));
  }
  function formatTime(ts) {
    const d = new Date(ts);
    return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }
  function personalize(text) {
    const s = readJSON(SETTINGS_KEY, {}) || {};
    const my = String(s.myName || '你').trim().slice(0, 16) || '你';
    const ch = String(s.charName || '梦角').trim().slice(0, 16) || '梦角';
    return String(text).split('{我}').join(my).split('{名字}').join(ch);
  }
  function toast(msg) {
    const root = $('#toastRoot');
    if (!root) { console.log('[oracle]', msg); return; }
    const item = document.createElement('div');
    item.className = 'toast';
    item.textContent = msg;
    root.appendChild(item);
    window.setTimeout(() => {
      item.classList.add('out');
      window.setTimeout(() => item.remove(), 280);
    }, 2400);
  }
  function openDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  }

  /* ============================================================
     SVG 常量
     ============================================================ */
  const BACK_SVG = `
<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <radialGradient id="ocIrisG" cx="50%" cy="45%" r="58%">
      <stop offset="0%" stop-color="#f7c8a6"/>
      <stop offset="30%" stop-color="#b83030"/>
      <stop offset="100%" stop-color="#3a060c"/>
    </radialGradient>
    <radialGradient id="ocGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(200,70,60,.32)"/>
      <stop offset="100%" stop-color="rgba(120,30,32,0)"/>
    </radialGradient>
  </defs>
  <ellipse cx="60" cy="40" rx="56" ry="34" fill="url(#ocGlow)"/>
  <path d="M8 40 Q60 6 112 40 Q60 74 8 40 Z" fill="#ead6c6" opacity=".9"/>
  <circle cx="60" cy="40" r="14.5" fill="url(#ocIrisG)"/>
  <ellipse cx="60" cy="40" rx="3.6" ry="12.4" fill="#0c0305"/>
  <circle cx="53.6" cy="33.8" r="3" fill="#fff8ef" opacity=".92"/>
  <circle cx="66.8" cy="46.6" r="1.3" fill="rgba(255,220,200,.5)"/>
  <path d="M8 40 Q60 6 112 40" stroke="#1a0808" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <path d="M8 40 Q60 74 112 40" stroke="#1a0808" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".8"/>
  <path d="M22 29 Q38 16 58 14" stroke="rgba(255,220,200,.22)" stroke-width="1.2" fill="none" stroke-linecap="round"/>
</svg>`;

  /* 光明正大魔杖（杖尖朝左） */
  const OVERT_WAND_SVG = `
<svg viewBox="0 0 220 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="owBody" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#3a1410"/>
      <stop offset="30%" stop-color="#2a0c08"/>
      <stop offset="70%" stop-color="#1a0604"/>
      <stop offset="100%" stop-color="#0a0204"/>
    </linearGradient>
    <radialGradient id="owGem" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#fff8e8"/>
      <stop offset="30%" stop-color="#f7c8a6"/>
      <stop offset="70%" stop-color="#d87a5a"/>
      <stop offset="100%" stop-color="#8a2a18"/>
    </radialGradient>
    <radialGradient id="owGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(255,180,140,0.7)"/>
      <stop offset="60%" stop-color="rgba(255,180,140,0.2)"/>
      <stop offset="100%" stop-color="rgba(255,180,140,0)"/>
    </radialGradient>
    <linearGradient id="owGold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e8c98c"/>
      <stop offset="50%" stop-color="#b98a4a"/>
      <stop offset="100%" stop-color="#6a3a18"/>
    </linearGradient>
  </defs>
  <ellipse cx="55" cy="100" rx="60" ry="60" fill="url(#owGlow)"/>
  <path d="M70 98 Q145 96 218 94 L218 106 Q145 104 70 102 Z"
        fill="url(#owBody)" stroke="rgba(185,154,114,0.4)" stroke-width="1"/>
  <g stroke="url(#owGold)" stroke-width="1.1" fill="none" opacity=".9">
    <path d="M90 96 Q100 100 110 96 T130 96 T150 96 T170 96 T190 96"/>
    <path d="M90 104 Q100 100 110 104 T130 104 T150 104 T170 104 T190 104"/>
  </g>
  <path d="M60 92 L70 88 L70 112 L60 108 Q55 100 60 92 Z"
        fill="url(#owGold)" stroke="rgba(60,20,10,0.7)" stroke-width="0.8"/>
  <path d="M22 100 L50 78 L58 100 L50 122 Z"
        fill="url(#owGem)" stroke="rgba(255,240,220,0.7)" stroke-width="1.2"/>
  <path d="M22 100 L58 100" stroke="rgba(255,240,220,0.55)" stroke-width="0.9"/>
  <path d="M36 88 L36 112" stroke="rgba(255,240,220,0.3)" stroke-width="0.7"/>
  <circle cx="22" cy="100" r="3.5" fill="#fff8e8" opacity=".95"/>
  <circle cx="22" cy="100" r="1.5" fill="#fff"/>
  <g stroke="rgba(255,220,180,0.65)" stroke-width="1.1" stroke-linecap="round">
    <path d="M4 100 L14 100"/>
    <path d="M22 82 L22 72"/>
    <path d="M22 118 L22 128"/>
    <path d="M10 88 L14 92"/>
    <path d="M10 112 L14 108"/>
  </g>
</svg>`;

  /* 偷偷魔杖（杖尖朝上） */
  const SNEAKY_WAND_SVG = `
<svg viewBox="0 0 60 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="swBody" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#3a1410"/>
      <stop offset="30%" stop-color="#2a0c08"/>
      <stop offset="70%" stop-color="#1a0604"/>
      <stop offset="100%" stop-color="#0a0204"/>
    </linearGradient>
    <radialGradient id="swGem" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#fff8e8"/>
      <stop offset="30%" stop-color="#f7c8a6"/>
      <stop offset="70%" stop-color="#c86a4a"/>
      <stop offset="100%" stop-color="#6a1a10"/>
    </radialGradient>
    <radialGradient id="swGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(255,180,140,0.7)"/>
      <stop offset="60%" stop-color="rgba(255,180,140,0.2)"/>
      <stop offset="100%" stop-color="rgba(255,180,140,0)"/>
    </radialGradient>
    <linearGradient id="swGold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#6a3a18"/>
      <stop offset="50%" stop-color="#e8c98c"/>
      <stop offset="100%" stop-color="#6a3a18"/>
    </linearGradient>
  </defs>
  <ellipse cx="30" cy="45" rx="30" ry="40" fill="url(#swGlow)"/>
  <path d="M25 70 Q24 120 24 198 L36 198 Q36 120 35 70 Z"
        fill="url(#swBody)" stroke="rgba(185,154,114,0.4)" stroke-width="0.8"/>
  <g stroke="url(#swGold)" stroke-width="0.9" fill="none" opacity=".85">
    <path d="M25 90 Q30 95 35 90 Q30 100 25 95 Q30 105 35 100"/>
    <path d="M25 120 Q30 125 35 120 Q30 130 25 125"/>
    <path d="M25 150 Q30 155 35 150 Q30 160 25 155"/>
  </g>
  <path d="M23 70 L27 58 L33 58 L37 70 Z"
        fill="url(#swGold)" stroke="rgba(60,20,10,0.7)" stroke-width="0.7"/>
  <path d="M30 12 L44 40 L30 62 L16 40 Z"
        fill="url(#swGem)" stroke="rgba(255,240,220,0.7)" stroke-width="1"/>
  <path d="M30 12 L30 62" stroke="rgba(255,240,220,0.45)" stroke-width="0.7"/>
  <path d="M16 40 L44 40" stroke="rgba(255,240,220,0.3)" stroke-width="0.6"/>
  <circle cx="30" cy="40" r="3" fill="#fff8e8" opacity=".95"/>
</svg>`;

  /* ============================================================
     100 个换牌理由 —— 光明正大 50 + 偷偷换 50
     ============================================================ */
  const SWAP_REASONS_OVERT = [
    '这一张会伤到你。换。',
    '这张牌说我不够爱你。它撒谎。',
    '我不认。它说得太冷了。',
    '这张牌在替你泼冷水。',
    '我不喜欢你被这张牌看着。',
    '这张牌……不配。',
    '我想让你看得舒服一点。',
    '它说错了。我比你了解我自己。',
    '这张，换掉。',
    '我不能让你带着这个答案回去。',
    '这张牌太直白了。对你太残忍。',
    '不。这一张我不同意。',
    '换一张。我想听的是另一句话。',
    '它把你写得太苦了。',
    '这张牌不懂得心疼你。',
    '我在这，轮到我说了。',
    '你抽到的不是实话。',
    '这张牌在说气话。',
    '我把它拿走了。别怕。',
    '这张会让夜里更难睡。换。',
    '我不是要控制你的命运，只是想保护你。',
    '这张太凶了。',
    '我看着它的时候，心口疼。',
    '换掉。我要你安心。',
    '它说错了时间。',
    '你说过不喜欢这张。',
    '这张牌让你低着头。我不喜欢。',
    '我懂这张牌的意思，所以更不能留它。',
    '这不该是你今晚听到的最后一句。',
    '我否决它。',
    '让我重新安排。',
    '这张牌说，你不该被爱。我不同意。',
    '这张牌不属于你。换。',
    '换个温和的。',
    '我替你把它按下去。',
    '它太配你了，配得我心疼。',
    '我不讲理。这张，不留。',
    '我想让你笑一下。',
    '这张会让镜面变得太暗。',
    '换。我想说的话不是这个。',
    '这张牌……我亲手收下。',
    '我替你换一个温柔一点的。',
    '这张牌在说谎，我看着它都不舒服。',
    '我赌气。就是要换。',
    '我说的才准。这张不算。',
    '换一张更贴你的。',
    '我不忍心让你读这张。',
    '你不该被这张牌定义。',
    '换掉。让镜面重新亮起来。',
    '我改主意了。这张不对。'
  ];

  const SWAP_REASONS_SNEAKY = [
    '刚才那张……不算。',
    '我换了一张。别问。',
    '那张牌说错了。我替你改。',
    '你不会发现的。',
    '我改了一点。就一点。',
    '你什么都没有看见。',
    '我还没来得及说，就换掉了。',
    '那张牌太轻了。轻得不像你。',
    '我手滑了。',
    '不是那张。',
    '我选了另一张。',
    '这张才更像我们要的样子。',
    '我偷偷换掉了。别回头。',
    '你就当没看见。',
    '我看见那张时皱了一下眉。就这样。',
    '那张太生了。换张熟的。',
    '我给镜面开了个后门。',
    '我伸手了。轻轻的。',
    '我想你看到另一面。',
    '我一直在等你翻完。然后……',
    '这张才是我要给你的。',
    '我看了一会儿，决定动一下手。',
    '别怪我。',
    '你抽到的那张太老实了。',
    '我请你换一个答案。',
    '悄悄换。你当没发生。',
    '一张而已。',
    '我只是轻轻一碰。',
    '那张说的不是我。',
    '我改了一个字。',
    '我替镜子做主了。',
    '我看不下去。',
    '这张……我更喜欢。',
    '我把它藏在袖子里了。',
    '我换得很快。',
    '你眨眼的时候。',
    '你不用知道。',
    '我有私心。',
    '我改写了。',
    '那张不配留在这一排。',
    '这张是我藏了很久的。',
    '我挑过的。',
    '一点小小的偏心。',
    '我把那张换走了。你没察觉。',
    '就当是错觉。',
    '你什么都没丢。',
    '我替你担了。',
    '这张，我送你的。',
    '我偷偷动了心，也动了牌。',
    '那张牌……我舍不得你看见。'
  ];

  const CHAR_FINAL_REACTIONS = {
    swapped1: ['我只动了一张。剩下的，你自己看。', '那张不好。我替你换了。'],
    swapped2: ['我动了几张牌——别怪我，那些话说得太难听。', '有几张牌我看不下去，替你换了。'],
    positive: ['这次牌面很好。我没什么要改的。', '牌面很亮。你说的，都成真了。'],
    neutral:  ['牌面还算平整。', '不冷不热。就这样。'],
    negative: ['牌有点冷。可有些话，总要让你听见。', '这一把不太顺。但我在。'],
    heavy:    ['这一把很重。我在旁边。', '有些话太重了。我陪你看着。']
  };

  /* ============================================================
     状态
     ============================================================ */
  let currentSpreadId = 'line3';
  let busy = false;
  let currentDraw = null;
  let replyBag = [];

  function loadRecords() {
    const raw = readJSON(ORACLE_KEY, {});
    const list = raw && Array.isArray(raw.records) ? raw.records : [];
    return list
      .filter(r => r && typeof r === 'object' && Array.isArray(r.cardIds) && r.cardIds.length)
      .slice(0, 200);
  }
  function saveRecords(list) {
    writeJSON(ORACLE_KEY, { records: list.slice(0, 200) });
  }

  function getReplyPool() {
    const m = readJSON(MIRROR_KEY, {}) || {};
    const raw = Array.isArray(m.replies) ? m.replies : [];
    const list = raw
      .map(r => (typeof r === 'string' ? r : (r && typeof r.text === 'string' ? r.text : '')))
      .filter(Boolean);
    return list.length ? list : ['……你心里其实已经有数了。', '牌面不会说谎，但人心会。', '靠近一点，再看。'];
  }
  function pickReply() {
    const pool = getReplyPool();
    if (!replyBag.length) {
      replyBag = pool.slice();
      for (let i = replyBag.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [replyBag[i], replyBag[j]] = [replyBag[j], replyBag[i]];
      }
    }
    return replyBag.pop() || '';
  }

  /* ============================================================
     换牌逻辑
     ============================================================ */
  function shouldSwap(card, positionLabel) {
    const mood = CARD_MOOD[card.id] || 0;
    const isCore = /核心|现状|关系核心|主题/.test(positionLabel);
    let p = 0;
    if (mood <= -2) p = 0.55;
    else if (mood === -1) p = 0.32;
    else if (mood === 0) p = 0.06;
    else p = 0.015;
    if (isCore) p *= 1.5;
    return Math.random() < p;
  }

  function pickSwapCard(original) {
    const origMood = CARD_MOOD[original.id] || 0;
    const pool = DECK.filter(c => c.id !== original.id);

    const RANA_IDS = [37, 38, 39, 40];
    const isOriginalRana = RANA_IDS.includes(original.id);
    const ranaPool = pool.filter(c => RANA_IDS.includes(c.id));

    /* Rana 专用通道：30% 概率换入一张 Rana 附加牌 */
    if (!isOriginalRana && ranaPool.length && Math.random() < 0.30) {
      return ranaPool[Math.floor(Math.random() * ranaPool.length)];
    }

    let candidates;
    if (origMood <= 0) {
      candidates = pool.filter(c => (CARD_MOOD[c.id] || 0) >= 1);
    } else {
      candidates = pool.filter(c => (CARD_MOOD[c.id] || 0) >= 2);
      if (!candidates.length) candidates = pool.filter(c => (CARD_MOOD[c.id] || 0) >= 1);
    }
    if (!candidates.length) candidates = pool;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function updateCardContent(cardEl, newCard) {
    const front = cardEl.querySelector('.spread-front');
    if (!front) return;
    front.innerHTML =
      '<span class="oc-num">' + pad2(newCard.id) + '</span>' +
      '<span class="oc-icon">' + iconSvg(newCard.id) + '</span>' +
      '<span class="oc-name">' + escapeHtml(newCard.name) + '</span>' +
      '<span class="oc-kw">' + escapeHtml(shortKw(newCard)) + '</span>';
  }

  /**
   * 气泡：主理由 + 换牌信息
   * 若 fromCard 与 toCard 传入，会附一行「光明正大换掉了「旧」→「新」」
   */
  function showSwapBubble(reason, fromCard, toCard, mode) {
    const box = $('#ov2SwapBubble');
    if (!box) return;

    let infoText = '';
    if (fromCard && toCard) {
      const modeText = mode === 'overt' ? '光明正大' : '悄悄';
      infoText = '（' + modeText + '换掉了「' + fromCard.name + '」→「' + toCard.name + '」）';
    }

    if (infoText) {
      box.innerHTML =
        '<span class="ov2-swap-reason">' + escapeHtml(reason) + '</span>' +
        '<span class="ov2-swap-info">' + escapeHtml(infoText) + '</span>';
    } else {
      box.innerHTML = '<span class="ov2-swap-reason">' + escapeHtml(reason) + '</span>';
    }

    box.classList.add('show');
    clearTimeout(box._bubbleTimer);
    box._bubbleTimer = setTimeout(
      () => box.classList.remove('show'),
      infoText ? 6500 : 4500
    );
  }

  /* 一次闪光 */
  function spawnFlash(slot) {
    const flash = document.createElement('div');
    flash.className = 'ov2-flash';
    slot.appendChild(flash);
    window.setTimeout(() => flash.remove(), 450);
  }

  /* 光明正大 —— 魔杖进入、杖尖发光、闪白、换牌、收回 */
  async function playOvertWand(cardEl, newCard) {
    const slot = cardEl.parentElement;
    if (!slot) return;

    const wand = document.createElement('div');
    wand.className = 'ov2-wand ov2-wand-overt';
    wand.innerHTML = OVERT_WAND_SVG;
    slot.appendChild(wand);

    await sleep(30);
    wand.classList.add('in');
    await sleep(650);

    wand.classList.add('glow');
    cardEl.classList.add('charmed');
    await sleep(500);

    spawnFlash(slot);
    await sleep(250);

    updateCardContent(cardEl, newCard);
    cardEl.classList.remove('charmed');

    wand.classList.remove('glow');
    wand.classList.add('out');
    await sleep(550);
    wand.remove();
  }

  /* 偷偷换 —— 魔杖从下探入、轻点、牌翻回背面、闪白换牌、翻到正面 */
  async function playSneakyWand(cardEl, newCard) {
    const slot = cardEl.parentElement;
    if (!slot) return;

    const wand = document.createElement('div');
    wand.className = 'ov2-wand ov2-wand-sneaky';
    wand.innerHTML = SNEAKY_WAND_SVG;
    slot.appendChild(wand);

    await sleep(30);
    wand.classList.add('in');
    await sleep(550);

    wand.classList.add('touch');
    cardEl.classList.add('charmed');
    await sleep(400);

    cardEl.classList.remove('flipped');
    await sleep(700);

    spawnFlash(slot);
    await sleep(250);

    updateCardContent(cardEl, newCard);
    cardEl.classList.remove('charmed');

    wand.classList.remove('touch');
    wand.classList.add('out');
    await sleep(500);
    wand.remove();

    cardEl.classList.add('flipped');
    await sleep(700);
  }

  function charFinalReaction(cards, swappedCount) {
    if (swappedCount > 0) {
      const pool = swappedCount === 1 ? CHAR_FINAL_REACTIONS.swapped1 : CHAR_FINAL_REACTIONS.swapped2;
      return pickFrom(pool);
    }
    const totalMood = cards.reduce((s, c) => s + (CARD_MOOD[c.id] || 0), 0);
    if (totalMood >= 4) return pickFrom(CHAR_FINAL_REACTIONS.positive);
    if (totalMood >= 0) return pickFrom(CHAR_FINAL_REACTIONS.neutral);
    if (totalMood >= -3) return pickFrom(CHAR_FINAL_REACTIONS.negative);
    return pickFrom(CHAR_FINAL_REACTIONS.heavy);
  }

  /* ============================================================
     CSS
     ============================================================ */
  function injectCSS() {
    if (document.getElementById('oracleV2Style')) return;
    const style = document.createElement('style');
    style.id = 'oracleV2Style';
    style.textContent = `
/* ---------- 统一牌背 ---------- */
.ov2-back {
  position: absolute; inset: 0; border-radius: 8px; overflow: hidden;
  background:
    repeating-linear-gradient(45deg, rgba(255,220,200,.035) 0 7px, transparent 7px 14px),
    radial-gradient(circle at 50% 42%, #521a22 0%, #2a0c12 48%, #0c0406 100%);
  border: 1px solid rgba(190,130,120,.36);
  box-shadow:
    0 6px 16px -10px rgba(0,0,0,.85),
    inset 0 0 22px rgba(0,0,0,.55);
  display: grid; place-items: center;
}
.ov2-back::after {
  content: ""; position: absolute; inset: 4px;
  border: 1px solid rgba(190,140,120,.16); border-radius: 5px;
  pointer-events: none;
}
.ov2-back-frame {
  width: 66%; display: flex; align-items: center; justify-content: center;
  filter: drop-shadow(0 0 6px rgba(200,80,70,.35));
}
.ov2-back-frame svg { width: 100%; height: auto; display: block; }

/* ---------- 牌阵选择 ---------- */
.spread-picker {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px; margin: 14px 0 16px;
}
@media (min-width: 520px) {
  .spread-picker { grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); }
}
.spread-opt {
  display: flex; flex-direction: column; align-items: flex-start; gap: 3px;
  padding: 11px 12px 12px;
  border: 1px solid rgba(198,128,118,.2); border-radius: 12px;
  background: rgba(255,255,255,.02);
  color: #b09993; text-align: left; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: border-color .18s, background .18s, color .18s, transform .18s;
  min-height: 92px;
}
.spread-opt:hover { border-color: rgba(181,111,107,.45); background: rgba(181,111,107,.07); }
.spread-opt:active { transform: scale(.98); }
.spread-opt.active {
  border-color: rgba(185,154,114,.6);
  background:
    radial-gradient(120% 100% at 0% 0%, rgba(185,154,114,.18), transparent 70%),
    rgba(181,111,107,.08);
  color: #f2dfd8;
}
.spread-opt-shape { display: grid; gap: 3px; margin-bottom: 6px; padding: 2px 0; }
.spread-opt-shape i {
  display: block; width: 6px; height: 6px; border-radius: 1.5px;
  background: rgba(181,111,107,.42); transition: background .18s;
}
.spread-opt.active .spread-opt-shape i { background: rgba(232,201,168,.92); }
.spread-opt-name {
  font-family: var(--font-serif, serif);
  font-size: 13px; letter-spacing: .08em; line-height: 1.25;
}
.spread-opt-count { margin-top: 1px; font-size: 9.5px; color: #7d625e; letter-spacing: .06em; }
.spread-opt.active .spread-opt-count { color: rgba(232,201,168,.68); }
.spread-opt-desc { margin-top: 3px; font-size: 10px; line-height: 1.5; color: #7d625e; }
.spread-opt.active .spread-opt-desc { color: rgba(232,201,168,.6); }

/* ---------- 洗牌区 ---------- */
#ov2Shuffle {
  display: flex; flex-direction: column; align-items: center;
  gap: 20px; padding: 32px 20px 30px; overflow: hidden; position: relative;
}
#ov2Shuffle[hidden] { display: none !important; }
.ov2-shuffle-stage { position: relative; width: 78px; height: 110px; flex: none; }
@media (min-width: 400px) {
  .ov2-shuffle-stage { width: 88px; height: 124px; }
}
.ov2-shuffle-card {
  position: absolute; inset: 0; border-radius: 8px;
  transform-style: preserve-3d; will-change: transform;
  animation: ov2Shuffle 1.25s cubic-bezier(.35,.15,.25,1);
}
.ov2-shuffle-card .ov2-back {
  box-shadow:
    0 10px 24px -8px rgba(0,0,0,.85),
    inset 0 0 22px rgba(0,0,0,.55);
}
.ov2-shuffle-card .ov2-back-frame { width: 64%; }
@keyframes ov2Shuffle {
  0%   { transform: translate(0,0) rotate(0deg); }
  22%  { transform: translate(var(--x1, 30px), var(--y1, -20px)) rotate(var(--r1, 12deg)); }
  48%  { transform: translate(0,0) rotate(0deg); }
  74%  { transform: translate(calc(var(--x1, 30px) * -0.75), calc(var(--y1, -20px) * 0.4)) rotate(calc(var(--r1, 12deg) * -1)); }
  100% { transform: translate(0,0) rotate(0deg); }
}
.ov2-shuffle-label {
  position: relative; z-index: 3; margin: 0;
  color: #c98d86;
  font-family: var(--font-serif, serif);
  font-size: 11.5px; letter-spacing: .28em; text-indent: .28em;
  white-space: nowrap;
  animation: ov2ShufflePulse 1.4s ease-in-out infinite;
}
@keyframes ov2ShufflePulse {
  0%, 100% { opacity: .55; }
  50%      { opacity: 1; }
}

/* ---------- 牌阵网格 ---------- */
.ov2-spread-name {
  margin: 2px 0 4px; text-align: center;
  font-family: var(--font-serif, serif);
  font-size: 11.5px; letter-spacing: .24em; text-indent: .24em;
  color: rgba(185,154,114,.72);
}

/* 气泡：理由 + 换牌信息（flex 竖排） */
.ov2-char-line {
  min-height: 20px;
  margin: 4px 0 10px;
  text-align: center;
  font-family: var(--font-serif, serif);
  font-size: 12px;
  letter-spacing: .06em;
  color: rgba(232,201,168,.9);
  text-shadow: 0 0 12px rgba(185,154,114,.3);
  opacity: 0; transform: translateY(-4px);
  transition: opacity .45s ease, transform .45s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0 8px;
}
.ov2-char-line.show { opacity: 1; transform: none; }
.ov2-swap-reason {
  font-size: 12.5px;
  font-style: italic;
  line-height: 1.5;
  letter-spacing: .04em;
}
.ov2-swap-info {
  font-size: 10px;
  font-style: normal;
  color: rgba(185,154,114,.78);
  letter-spacing: .02em;
  line-height: 1.4;
}

.spread-grid {
  display: grid; gap: 6px; justify-content: center;
  width: 100%; margin: 4px auto 10px;
}
.spread-grid[data-cols="3"] {
  max-width: 300px;
  grid-template-columns: repeat(3, minmax(0,1fr));
}
.spread-grid[data-cols="5"] {
  max-width: 460px;
  grid-template-columns: repeat(5, minmax(0,1fr));
  gap: 5px;
}
.spread-slot { position: relative; }
.spread-slot.is-empty { visibility: hidden; }

/* ---------- 单张牌 ---------- */
.spread-card {
  position: relative; width: 100%; aspect-ratio: 5 / 7;
  perspective: 800px;
  opacity: 0;
  transform: translateY(-22px) scale(.7) rotate(-6deg);
  transition: opacity .4s ease, transform .52s cubic-bezier(.2,.85,.3,1.15);
  will-change: transform, opacity;
}
.spread-card.dealt { opacity: 1; transform: none; }
.spread-card-inner {
  position: relative; width: 100%; height: 100%;
  transform-style: preserve-3d;
  transition: transform .72s cubic-bezier(.2,.8,.3,1);
}
.spread-card.flipped .spread-card-inner { transform: rotateY(180deg); }

.spread-face {
  position: absolute; inset: 0; border-radius: 8px; overflow: hidden;
  backface-visibility: hidden; -webkit-backface-visibility: hidden;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.spread-back {
  background:
    repeating-linear-gradient(45deg, rgba(255,220,200,.035) 0 7px, transparent 7px 14px),
    radial-gradient(circle at 50% 42%, #521a22 0%, #2a0c12 48%, #0c0406 100%);
  border: 1px solid rgba(190,130,120,.36);
  box-shadow:
    0 6px 16px -10px rgba(0,0,0,.85),
    inset 0 0 22px rgba(0,0,0,.55);
}
.spread-back::after {
  content: ""; position: absolute; inset: 4px;
  border: 1px solid rgba(190,140,120,.16); border-radius: 5px;
  pointer-events: none;
}
.spread-back .ov2-back-frame {
  width: 66%; display: flex; align-items: center; justify-content: center;
  filter: drop-shadow(0 0 6px rgba(200,80,70,.35));
}
.spread-back .ov2-back-frame svg { width: 100%; height: auto; display: block; }

.spread-front {
  transform: rotateY(180deg);
  padding: 9px 4px 8px;
  background:
    radial-gradient(120% 90% at 50% 8%, rgba(120,44,46,.32), transparent 62%),
    linear-gradient(168deg, #261013 0%, #100406 100%);
  border: 1px solid rgba(185,154,114,.3);
  box-shadow:
    0 6px 16px -10px rgba(0,0,0,.85),
    inset 0 0 26px rgba(0,0,0,.5);
  color: rgba(232,201,168,.92);
  text-align: center; gap: 2px;
}
.spread-front::after {
  content: ""; position: absolute; inset: 3px;
  border: 1px solid rgba(185,154,114,.14); border-radius: 5px;
  pointer-events: none;
}
.oc-num {
  position: absolute; top: 5px; left: 7px;
  font-size: 7px; letter-spacing: .12em;
  color: rgba(185,154,114,.42);
  font-variant-numeric: tabular-nums;
}
.oc-icon {
  display: flex; align-items: center; justify-content: center;
  width: 46%; max-width: 42px; aspect-ratio: 1;
  margin-bottom: 3px;
  color: rgba(232,201,168,.94);
  filter: drop-shadow(0 0 5px rgba(210,130,95,.28));
}
.oc-icon svg { width: 100%; height: 100%; display: block; }
.oc-name {
  font-family: var(--font-serif, serif);
  font-size: clamp(10px, 2.6vw, 13px);
  letter-spacing: .1em;
  color: rgba(244,232,224,.94);
  text-shadow: 0 1px 8px rgba(0,0,0,.65);
  line-height: 1.25;
}
.oc-kw {
  margin-top: 1px;
  font-size: clamp(7px, 1.8vw, 8.8px);
  letter-spacing: .02em; line-height: 1.4;
  color: rgba(201,141,134,.72);
  max-width: 100%;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.spread-grid[data-cols="5"] .oc-icon { width: 56%; max-width: 32px; margin-bottom: 2px; }
.spread-grid[data-cols="5"] .oc-name { font-size: clamp(9px, 2.2vw, 11px); letter-spacing: .04em; }
.spread-grid[data-cols="5"] .oc-kw { display: none; }

/* ---------- 魔杖 ---------- */
.ov2-wand {
  position: absolute;
  pointer-events: none;
  z-index: 15;
  opacity: 0;
  transition: opacity .3s ease,
              right .7s cubic-bezier(.4,.1,.3,1),
              bottom .6s cubic-bezier(.4,.1,.3,1),
              transform .4s ease;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,.7));
}
.ov2-wand svg { width: 100%; height: auto; display: block; }

.ov2-wand-overt { width: 155%; right: -175%; top: -20%; }
.ov2-wand-overt.in { opacity: 1; right: -50%; }
.ov2-wand-overt.glow { right: -42%; transform: scale(1.04); }
.ov2-wand-overt.out { opacity: 0; right: -175%; }

.ov2-wand-sneaky { width: 55%; left: 22.5%; bottom: -200%; }
.ov2-wand-sneaky.in { opacity: 1; bottom: -58%; }
.ov2-wand-sneaky.touch { bottom: -48%; transform: scale(1.02); }
.ov2-wand-sneaky.out { opacity: 0; bottom: -200%; }

/* 牌被魔法照到 */
.spread-card.charmed {
  animation: ov2Charmed .5s ease-in-out;
}
@keyframes ov2Charmed {
  0%, 100% {
    filter: brightness(1);
  }
  25%, 75% {
    filter: brightness(1.45) drop-shadow(0 0 16px rgba(255,200,150,.9));
  }
  50% {
    filter: brightness(1.9) drop-shadow(0 0 28px rgba(255,220,180,.95));
  }
}

/* 闪光 */
.ov2-flash {
  position: absolute;
  inset: -30%;
  background: radial-gradient(circle, rgba(255,240,200,.95), rgba(255,200,150,.45) 40%, transparent 72%);
  pointer-events: none;
  z-index: 20;
  border-radius: 50%;
  opacity: 0;
  animation: ov2Flash 0.4s ease-out forwards;
}
@keyframes ov2Flash {
  0%   { opacity: 0; transform: scale(.3); }
  25%  { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0; transform: scale(1.8); }
}

/* ---------- 解读列表 ---------- */
.spread-reading {
  display: flex; flex-direction: column; gap: 9px;
  margin: 12px 0 4px;
}
.reading-item {
  display: flex; gap: 10px; padding: 11px 12px;
  border: 1px solid rgba(198,128,118,.16); border-radius: 11px;
  background:
    radial-gradient(120% 100% at 0% 0%, rgba(84,28,32,.24), transparent 62%),
    rgba(255,255,255,.015);
  animation: readingIn .45s cubic-bezier(.2,.8,.3,1) both;
}
@keyframes readingIn {
  from { opacity: 0; transform: translateY(7px); }
  to   { opacity: 1; transform: none; }
}
.reading-pos {
  flex: none; align-self: flex-start; max-width: 84px;
  padding: 2px 8px;
  border: 1px solid rgba(185,154,114,.32); border-radius: 999px;
  background: rgba(185,154,114,.07);
  color: rgba(232,201,168,.88);
  font-size: 9.5px; letter-spacing: .04em; line-height: 1.5;
  text-align: center; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
}
.reading-body { flex: 1; min-width: 0; }
.reading-head {
  display: flex; align-items: center; gap: 7px; flex-wrap: wrap;
  margin-bottom: 4px;
}
.reading-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; flex: none;
  color: rgba(232,201,168,.85);
}
.reading-icon svg { width: 100%; height: 100%; display: block; }
.reading-name {
  font-family: var(--font-serif, serif);
  font-size: 13.5px; letter-spacing: .1em; color: #f3e8e2;
}
.reading-kw { font-size: 10px; letter-spacing: .02em; color: #c98d86; }
.reading-meaning {
  margin: 0; color: #d6c2bb;
  font-size: 11.5px; line-height: 1.75; letter-spacing: .01em;
}

.oracle-record-swap {
  margin-top: 5px;
  padding: 5px 9px;
  border-left: 2px solid rgba(232,201,168,.45);
  background: rgba(232,201,168,.04);
  border-radius: 0 6px 6px 0;
  color: rgba(232,201,168,.78);
  font-size: 10px; letter-spacing: .02em;
  font-style: italic; line-height: 1.7;
}
.oracle-record-swap div { margin: 1px 0; }

.ov2-history-empty {
  margin: 4px 0; text-align: center;
  color: #7d625e; font-size: 10px;
}

/* ---------- 亮色适配 ---------- */
html[data-mode="light"] .spread-opt { background: rgba(255,253,248,.6); color: #8a5a4a; }
html[data-mode="light"] .spread-opt.active {
  color: #3a241d;
  background:
    radial-gradient(120% 100% at 0% 0%, rgba(181,111,107,.2), transparent 70%),
    rgba(181,111,107,.1);
}
html[data-mode="light"] .spread-opt-count,
html[data-mode="light"] .spread-opt-desc { color: #a1735f; }
html[data-mode="light"] .spread-opt.active .spread-opt-count,
html[data-mode="light"] .spread-opt.active .spread-opt-desc { color: #8a5a4a; }
html[data-mode="light"] .reading-item {
  background:
    radial-gradient(120% 100% at 0% 0%, rgba(210,160,130,.2), transparent 62%),
    rgba(255,253,248,.6);
}
html[data-mode="light"] .reading-name { color: #38221c; }
html[data-mode="light"] .reading-meaning { color: #4a342c; }
html[data-mode="light"] .ov2-spread-name { color: #8a6a34; }
html[data-mode="light"] .ov2-char-line { color: #8a5a3a; text-shadow: 0 0 10px rgba(200,150,100,.25); }
html[data-mode="light"] .ov2-swap-info { color: #a1735f; }
html[data-mode="light"] .ov2-history-empty { color: #a1735f; }
html[data-mode="light"] .oracle-record-swap {
  background: rgba(138,106,52,.06);
  color: #8a5a3a;
}

/* ---------- 移动端微调 ---------- */
@media (max-width: 460px) {
  .spread-opt { padding: 10px 11px; min-height: 86px; }
  .spread-opt-name { font-size: 12.5px; }
  .spread-opt-desc { font-size: 9.5px; }
  .spread-grid[data-cols="3"] { max-width: 260px; gap: 5px; }
  .spread-grid[data-cols="5"] { gap: 4px; }
  .reading-item { padding: 10px; gap: 8px; }
  .reading-pos { max-width: 68px; font-size: 9px; padding: 2px 6px; }
  .reading-name { font-size: 12.5px; }
  .reading-meaning { font-size: 11px; }
  .ov2-char-line { font-size: 11.5px; }
  .ov2-swap-reason { font-size: 12px; }
  .ov2-swap-info { font-size: 9.5px; }
}

@media (prefers-reduced-motion: reduce) {
  .spread-card,
  .spread-card-inner,
  .reading-item,
  .ov2-shuffle-card,
  .ov2-shuffle-label,
  .ov2-wand,
  .ov2-char-line,
  .ov2-flash,
  .spread-card.charmed {
    transition: none !important;
    animation: none !important;
  }
}
    `;
    document.head.appendChild(style);
  }

  /* ============================================================
     HTML
     ============================================================ */
  function injectHTML() {
    if (document.getElementById('oracleDialogV2')) return;

    const wrap = document.createElement('div');
    wrap.id = 'oracleV2Root';
    wrap.innerHTML = `
<dialog class="modal oracle-modal" id="oracleDialogV2">
  <div class="modal-card">
    <header class="modal-head">
      <div>
        <p class="eyebrow">ORACLE · LENORMAND</p>
        <h3>连接 · 雷诺曼</h3>
      </div>
      <button type="button" class="modal-x" data-close aria-label="关闭">✕</button>
    </header>
    <div class="modal-body">

      <div id="ov2Setup">
        <p class="oracle-lead">静下心，想一个此刻最想问的问题。选好牌阵，让水晶球替你翻开牌面。</p>
        <div class="spread-picker" id="ov2SpreadPicker"></div>
        <button type="button" class="oracle-draw-btn" id="ov2DrawBtn">连接 · 抽牌</button>
      </div>

      <div id="ov2Shuffle" hidden>
        <div class="ov2-shuffle-stage" id="ov2ShuffleStage"></div>
        <p class="ov2-shuffle-label">正在洗牌……</p>
      </div>

      <div id="ov2Result" hidden>
        <p class="ov2-spread-name" id="ov2SpreadName"></p>
        <div class="ov2-char-line" id="ov2SwapBubble"></div>
        <div class="spread-grid" id="ov2Grid"></div>
        <p class="oracle-whisper" id="ov2Whisper" hidden>
          <span class="oracle-whisper-label">镜面传来……</span>
          <span class="oracle-whisper-text" id="ov2WhisperText"></span>
        </p>
        <div class="spread-reading" id="ov2Reading"></div>
        <div id="ov2After" hidden>
          <div class="oracle-notebook">
            <label for="ov2Note">感应记录</label>
            <textarea id="ov2Note" rows="4" placeholder="写下你感应到的画面、触感、声音……"></textarea>
          </div>
          <div class="oracle-feel">
            <button type="button" class="oracle-feel-btn" id="ov2FeltBtn">我感应到了</button>
            <div class="oracle-feel-options" id="ov2FeelOptions" hidden>
              <button type="button" class="oracle-feel-opt ok" data-result="success">✓ 连接成功</button>
              <button type="button" class="oracle-feel-opt fail" data-result="fail">✕ 连接未成功</button>
            </div>
          </div>
        </div>
      </div>

      <div class="oracle-history">
        <p class="oracle-history-head">
          <span>过往记录</span>
          <button type="button" class="text-btn" id="ov2ClearHistory">清空</button>
        </p>
        <div class="oracle-history-list" id="ov2HistoryList"></div>
      </div>

    </div>
  </div>
</dialog>
    `;
    document.body.appendChild(wrap);
  }

  /* ============================================================
     牌阵选择器
     ============================================================ */
  function buildShape(spread) {
    const shape = document.createElement('span');
    shape.className = 'spread-opt-shape';
    shape.style.gridTemplateColumns = 'repeat(' + spread.grid.cols + ', 6px)';
    const posSet = new Set(spread.positions.map(p => p.r + ',' + p.c));
    for (let r = 0; r < spread.grid.rows; r += 1) {
      for (let c = 0; c < spread.grid.cols; c += 1) {
        const dot = document.createElement('i');
        if (!posSet.has(r + ',' + c)) dot.style.visibility = 'hidden';
        shape.appendChild(dot);
      }
    }
    return shape;
  }

  function renderSpreadPicker() {
    const box = $('#ov2SpreadPicker');
    if (!box) return;
    box.innerHTML = '';
    SPREAD_ORDER.forEach(key => {
      const sp = SPREADS[key];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'spread-opt' + (key === currentSpreadId ? ' active' : '');
      btn.dataset.spread = key;
      btn.appendChild(buildShape(sp));
      const name = document.createElement('span');
      name.className = 'spread-opt-name';
      name.textContent = sp.name;
      const count = document.createElement('span');
      count.className = 'spread-opt-count';
      count.textContent = sp.count + ' 张 · ' + sp.desc;
      btn.append(name, count);
      btn.addEventListener('click', () => {
        if (busy) return;
        currentSpreadId = key;
        box.querySelectorAll('.spread-opt').forEach(b => {
          b.classList.toggle('active', b.dataset.spread === key);
        });
      });
      box.appendChild(btn);
    });
  }

  /* ============================================================
     抽牌
     ============================================================ */
  function drawCards(n) {
    const pool = DECK.slice();
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, n);
  }

  function shortKw(card) {
    return card.keywords.split('、').slice(0, 2).join(' · ');
  }

  function buildCardEl(card) {
    const el = document.createElement('div');
    el.className = 'spread-card';
    el.innerHTML =
      '<div class="spread-card-inner">' +
        '<div class="spread-face spread-back">' +
          '<div class="ov2-back-frame">' + BACK_SVG + '</div>' +
        '</div>' +
        '<div class="spread-face spread-front">' +
          '<span class="oc-num">' + pad2(card.id) + '</span>' +
          '<span class="oc-icon">' + iconSvg(card.id) + '</span>' +
          '<span class="oc-name">' + escapeHtml(card.name) + '</span>' +
          '<span class="oc-kw">' + escapeHtml(shortKw(card)) + '</span>' +
        '</div>' +
      '</div>';
    return el;
  }

  function renderGrid(spread, cards) {
    const grid = $('#ov2Grid');
    grid.innerHTML = '';
    grid.dataset.cols = String(spread.grid.cols);

    const posByRC = new Map();
    spread.positions.forEach((p, i) => posByRC.set(p.r + ',' + p.c, i));

    const entries = [];
    for (let r = 0; r < spread.grid.rows; r += 1) {
      for (let c = 0; c < spread.grid.cols; c += 1) {
        const slot = document.createElement('div');
        slot.className = 'spread-slot';
        const idx = posByRC.get(r + ',' + c);
        if (idx == null) {
          slot.classList.add('is-empty');
        } else {
          const cardEl = buildCardEl(cards[idx]);
          slot.appendChild(cardEl);
          entries.push({ el: cardEl, idx });
        }
        grid.appendChild(slot);
      }
    }
    entries.sort((a, b) => a.idx - b.idx);
    return entries;
  }

  function renderReading(spread, cards) {
    const box = $('#ov2Reading');
    box.innerHTML = '';
    spread.positions.forEach((pos, i) => {
      const card = cards[i];
      const item = document.createElement('div');
      item.className = 'reading-item';
      item.style.animationDelay = (i * 60) + 'ms';
      item.innerHTML =
        '<span class="reading-pos">' + escapeHtml(pos.label) + '</span>' +
        '<div class="reading-body">' +
          '<div class="reading-head">' +
            '<span class="reading-icon">' + iconSvg(card.id) + '</span>' +
            '<span class="reading-name">' + escapeHtml(card.name) + '</span>' +
            '<span class="reading-kw">' + escapeHtml(card.keywords) + '</span>' +
          '</div>' +
          '<p class="reading-meaning">' + escapeHtml(card.meaning) + '</p>' +
        '</div>';
      box.appendChild(item);
    });
  }

  function runShuffleAnimation() {
    const stage = $('#ov2ShuffleStage');
    if (!stage) return;
    stage.innerHTML = '';
    const total = 7;
    for (let i = 0; i < total; i += 1) {
      const card = document.createElement('div');
      card.className = 'ov2-shuffle-card';
      card.innerHTML = '<div class="ov2-back"><div class="ov2-back-frame">' + BACK_SVG + '</div></div>';
      const dir = i % 2 === 0 ? -1 : 1;
      const x1 = dir * (16 + Math.random() * 34);
      const y1 = (Math.random() - 0.5) * 44;
      const r1 = dir * (8 + Math.random() * 16);
      card.style.setProperty('--x1', x1.toFixed(1) + 'px');
      card.style.setProperty('--y1', y1.toFixed(1) + 'px');
      card.style.setProperty('--r1', r1.toFixed(1) + 'deg');
      card.style.animationDelay = (i * 0.04) + 's';
      card.style.zIndex = String(total - i);
      stage.appendChild(card);
    }
  }

  /* ============================================================
     主流程
     ============================================================ */
  async function startDraw() {
    if (busy) return;
    busy = true;

    const spread = SPREADS[currentSpreadId];
    const setup = $('#ov2Setup');
    const shuffle = $('#ov2Shuffle');
    const result = $('#ov2Result');
    const whisper = $('#ov2Whisper');
    const after = $('#ov2After');
    const nameEl = $('#ov2SpreadName');
    const noteEl = $('#ov2Note');
    const feelOpts = $('#ov2FeelOptions');
    const bubble = $('#ov2SwapBubble');

    const drawBtn = $('#ov2DrawBtn');
    if (drawBtn) drawBtn.disabled = true;

    if (setup) setup.hidden = true;
    if (result) result.hidden = true;
    if (after) after.hidden = true;
    if (whisper) whisper.hidden = true;
    if (feelOpts) feelOpts.hidden = true;
    if (noteEl) noteEl.value = '';
    if (bubble) { bubble.classList.remove('show'); bubble.innerHTML = ''; }
    if (shuffle) shuffle.hidden = false;

    runShuffleAnimation();
    await sleep(1500);

    const cards = drawCards(spread.count);

    if (shuffle) shuffle.hidden = true;
    if (result) result.hidden = false;
    if (nameEl) nameEl.textContent = spread.name + ' · ' + spread.count + ' 张';

    const entries = renderGrid(spread, cards);

    /* 发牌 */
    for (let i = 0; i < entries.length; i += 1) {
      await sleep(i === 0 ? 100 : 130);
      entries[i].el.classList.add('dealt');
    }

    await sleep(420);

    /* 翻牌 + 换牌 */
    const MAX_SWAPS = spread.count <= 5 ? 1 : 2;
    let swapCount = 0;
    const swappedInfo = [];

    for (let i = 0; i < entries.length; i += 1) {
      await sleep(i === 0 ? 180 : 380);

      const originalCard = cards[i];
      const positionLabel = spread.positions[i].label;
      const doSwap = swapCount < MAX_SWAPS && shouldSwap(originalCard, positionLabel);

      if (doSwap) {
        const newCard = pickSwapCard(originalCard);
        const mode = Math.random() < 0.55 ? 'overt' : 'sneaky';
        const reasonPool = mode === 'overt' ? SWAP_REASONS_OVERT : SWAP_REASONS_SNEAKY;
        const reason = pickFrom(reasonPool);

        if (mode === 'overt') {
          await playOvertWand(entries[i].el, newCard);
          entries[i].el.classList.add('flipped');
        } else {
          /* 先翻开旧牌，让梦女看清，再偷偷换 */
          entries[i].el.classList.add('flipped');
          await sleep(1500);
          await playSneakyWand(entries[i].el, newCard);
        }

        cards[i] = newCard;
        swappedInfo.push({
          index: i,
          position: positionLabel,
          fromId: originalCard.id,
          toId: newCard.id,
          mode: mode,
          reason: reason
        });

        showSwapBubble(reason, originalCard, newCard, mode);
        swapCount += 1;
        await sleep(700);
      } else {
        entries[i].el.classList.add('flipped');
      }
    }

    await sleep(600);

    currentDraw = {
      spreadId: currentSpreadId,
      spreadName: spread.name,
      cards: cards.map((c, i) => ({
        id: c.id,
        pos: spread.positions[i] ? spread.positions[i].label : ''
      })),
      swappedInfo,
      note: '',
      whisper: ''
    };

    renderReading(spread, cards);

    /* 梦角整体反应 */
    const finalLine = charFinalReaction(cards, swapCount);
    await sleep(400);
    showSwapBubble(finalLine);

    /* 镜面低语 */
    await sleep(900);
    const text = personalize(pickReply());
    if (text && currentDraw) {
      currentDraw.whisper = text;
      const whisperText = $('#ov2WhisperText');
      if (whisperText) whisperText.textContent = text;
      if (whisper) whisper.hidden = false;
    }

    await sleep(400);
    if (after) after.hidden = false;
    if (drawBtn) drawBtn.disabled = false;

    busy = false;

    const sc = document.querySelector('#oracleDialogV2 .modal-body');
    if (sc) sc.scrollTop = 0;
  }

  /* ============================================================
     历史记录
     ============================================================ */
  function renderHistory() {
    const list = $('#ov2HistoryList');
    if (!list) return;
    list.innerHTML = '';
    const records = loadRecords();

    if (!records.length) {
      const empty = document.createElement('p');
      empty.className = 'ov2-history-empty';
      empty.textContent = '还没有连接记录。';
      list.appendChild(empty);
      return;
    }

    records.forEach(rec => {
      const el = document.createElement('div');
      el.className = 'oracle-record';

      const head = document.createElement('div');
      head.className = 'oracle-record-head';
      const time = document.createElement('span');
      time.textContent = formatTime(rec.ts);
      const status = document.createElement('span');
      status.className = 'oracle-record-status ' + (rec.result === 'success' ? 'ok' : 'fail');
      status.textContent = rec.result === 'success' ? '连接成功' : '未成功';
      head.append(time, status);
      el.appendChild(head);

      const cardsEl = document.createElement('div');
      cardsEl.className = 'oracle-record-cards';
      const names = (rec.cardIds || [])
        .map(id => DECK_MAP[id] ? DECK_MAP[id].name : '')
        .filter(Boolean);
      const prefix = rec.spreadName ? rec.spreadName + ' · ' : '过往占卜 · ';
      cardsEl.textContent = prefix + names.join(' · ');
      el.appendChild(cardsEl);

      /* 换牌记录：显示「旧 → 新」+ 理由 */
      if (rec.swapped && rec.swapped.length) {
        const swapBox = document.createElement('div');
        swapBox.className = 'oracle-record-swap';
        rec.swapped.forEach(s => {
          const fromCard = DECK_MAP[s.fromId];
          const toCard = DECK_MAP[s.toId];
          if (!fromCard || !toCard) return;
          const row = document.createElement('div');
          const modeText = s.mode === 'overt' ? '光明正大' : '悄悄';
          let txt = '· ' + modeText + '换掉了「' + fromCard.name + '」→「' + toCard.name + '」';
          if (s.reason) txt += '　理由：' + s.reason;
          row.textContent = txt;
          swapBox.appendChild(row);
        });
        el.appendChild(swapBox);
      }

      if (rec.whisper) {
        const w = document.createElement('div');
        w.className = 'oracle-record-whisper';
        w.textContent = '· 镜面传来：' + rec.whisper;
        el.appendChild(w);
      }
      if (rec.note) {
        const n = document.createElement('div');
        n.className = 'oracle-record-note';
        n.textContent = rec.note;
        el.appendChild(n);
      }

      list.appendChild(el);
    });
  }

  function finishDraw(result) {
    if (!currentDraw) return;
    const noteEl = $('#ov2Note');
    const note = noteEl ? noteEl.value.trim().slice(0, 800) : '';

    const rec = {
      id: uid(),
      ts: Date.now(),
      spreadId: currentDraw.spreadId,
      spreadName: currentDraw.spreadName,
      cardIds: currentDraw.cards.map(c => c.id),
      positions: currentDraw.cards.map(c => ({ id: c.id, pos: c.pos })),
      swapped: currentDraw.swappedInfo || [],
      note,
      whisper: currentDraw.whisper || '',
      result: result === 'success' ? 'success' : 'fail'
    };

    const records = loadRecords();
    records.unshift(rec);
    saveRecords(records);

    currentDraw = null;

    const resultEl = $('#ov2Result');
    if (resultEl) resultEl.hidden = true;
    const setup = $('#ov2Setup');
    if (setup) setup.hidden = false;
    const shuffle = $('#ov2Shuffle');
    if (shuffle) shuffle.hidden = true;
    const after = $('#ov2After');
    if (after) after.hidden = true;
    const whisper = $('#ov2Whisper');
    if (whisper) whisper.hidden = true;
    const opts = $('#ov2FeelOptions');
    if (opts) opts.hidden = true;
    const bubble = $('#ov2SwapBubble');
    if (bubble) { bubble.classList.remove('show'); bubble.innerHTML = ''; }
    if (noteEl) noteEl.value = '';
    const grid = $('#ov2Grid');
    if (grid) grid.innerHTML = '';
    const reading = $('#ov2Reading');
    if (reading) reading.innerHTML = '';

    renderHistory();
    toast(result === 'success' ? '连接成功，记录已保存' : '记录已保存');
  }

  function clearHistory() {
    const records = loadRecords();
    if (!records.length) { toast('还没有占卜记录'); return; }
    if (!window.confirm('确定要清空所有占卜记录吗？此操作不可撤销。')) return;
    saveRecords([]);
    renderHistory();
    toast('占卜记录已清空');
  }

  function openOracleV2() {
    busy = false;
    currentDraw = null;

    const setup = $('#ov2Setup');
    if (setup) setup.hidden = false;
    const shuffle = $('#ov2Shuffle');
    if (shuffle) shuffle.hidden = true;
    const result = $('#ov2Result');
    if (result) result.hidden = true;
    const after = $('#ov2After');
    if (after) after.hidden = true;
    const whisper = $('#ov2Whisper');
    if (whisper) whisper.hidden = true;
    const opts = $('#ov2FeelOptions');
    if (opts) opts.hidden = true;
    const note = $('#ov2Note');
    if (note) note.value = '';
    const grid = $('#ov2Grid');
    if (grid) grid.innerHTML = '';
    const reading = $('#ov2Reading');
    if (reading) reading.innerHTML = '';
    const bubble = $('#ov2SwapBubble');
    if (bubble) { bubble.classList.remove('show'); bubble.innerHTML = ''; }
    const drawBtn = $('#ov2DrawBtn');
    if (drawBtn) drawBtn.disabled = false;
    const stage = $('#ov2ShuffleStage');
    if (stage) stage.innerHTML = '';

    renderSpreadPicker();
    renderHistory();
    openDialog($('#oracleDialogV2'));
  }

  function bindEvents() {
    const dialog = $('#oracleDialogV2');
    if (!dialog) return;

    dialog.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => dialog.close());
    });
    dialog.addEventListener('click', e => {
      if (e.target === dialog) dialog.close();
    });

    const drawBtn = $('#ov2DrawBtn');
    if (drawBtn) drawBtn.addEventListener('click', startDraw);

    const feltBtn = $('#ov2FeltBtn');
    if (feltBtn) {
      feltBtn.addEventListener('click', () => {
        const opts = $('#ov2FeelOptions');
        if (opts) opts.hidden = !opts.hidden;
      });
    }

    dialog.querySelectorAll('#ov2FeelOptions .oracle-feel-opt').forEach(btn => {
      btn.addEventListener('click', () => finishDraw(btn.dataset.result));
    });

    const clearBtn = $('#ov2ClearHistory');
    if (clearBtn) clearBtn.addEventListener('click', clearHistory);
  }

  let bindRetry = 0;
  function bindEntry() {
    const btn = document.getElementById('mirrorOracleBtn');
    if (!btn) {
      bindRetry += 1;
      if (bindRetry < 50) window.setTimeout(bindEntry, 200);
      return;
    }
    if (btn.dataset.ov2Bound === '1') return;

    const clone = btn.cloneNode(true);
    clone.dataset.ov2Bound = '1';
    btn.replaceWith(clone);
    clone.addEventListener('click', openOracleV2);
  }

  function init() {
    injectCSS();
    injectHTML();
    bindEvents();

    const old = document.getElementById('oracleDialog');
    if (old && old.parentNode) old.parentNode.removeChild(old);

    bindEntry();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();