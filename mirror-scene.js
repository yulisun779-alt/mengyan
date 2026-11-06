/* ============================================================
   镜中影 · 场景绘画引擎 v8
   —— 不撒星空，画一个能看懂的「场景」：
      天光 + 地面 + 主体剪影 + 一件会发光的东西
   —— 场景母题 × 构图 × 天气，再由心境决定他想画什么
   ============================================================ */
(function () {
  'use strict';

  function ha(hex, a) {
    var v = Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16);
    return hex + (v.length < 2 ? '0' + v : v);
  }
  function pk(arr, r) { return arr[Math.floor(r() * arr.length)]; }

  /* 一块柔光：所有场景的“可读性”都靠它 */
  function glow(ctx, x, y, rad, color, a) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(1, rad));
    g.addColorStop(0, ha(color, a));
    g.addColorStop(0.45, ha(color, a * 0.38));
    g.addColorStop(1, ha(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
  }

  /* 天光：用 mid 做背景，剪影才有对比 */
  function sky(ctx, W, H, p, r, c1, c2) {
    var top = c1 || p.mid[2], bot = c2 || p.mid[0];
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, ha(top, 1));
    g.addColorStop(0.52, ha(p.mid[1], 1));
    g.addColorStop(1, ha(bot, 1));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  /* 地面 / 水面：近处压暗，边缘留一线反光 */
  function ground(ctx, W, H, y, color, a) {
    var g = ctx.createLinearGradient(0, y, 0, H);
    g.addColorStop(0, ha(color, a == null ? 0.55 : a));
    g.addColorStop(1, ha(color, 0.96));
    ctx.fillStyle = g; ctx.fillRect(0, y, W, H - y);
    ctx.strokeStyle = ha('#ffffff', 0.08);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  function rect(ctx, x, y, w, h, color, a) {
    ctx.fillStyle = ha(color, a == null ? 1 : a);
    ctx.fillRect(x, y, w, h);
  }

  function ellipse(ctx, x, y, rx, ry, color, a) {
    ctx.fillStyle = ha(color, a == null ? 1 : a);
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  }

  function stroke(ctx, color, w, a) {
    ctx.strokeStyle = ha(color, a == null ? 1 : a);
    ctx.lineWidth = w;
  }

  /* —— 天气 —— */
  function rain(ctx, W, H, p, r, a) {
    ctx.save(); ctx.lineCap = 'round';
    var n = Math.floor(W * 0.14);
    for (var i = 0; i < n; i++) {
      var x = r() * W, y = r() * H, len = 7 + r() * 20;
      stroke(ctx, pk(p.accent, r), 0.6 + r() * 0.7, (a || 0.2) * (0.35 + r() * 0.75));
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - len * 0.26, y + len); ctx.stroke();
    }
    ctx.restore();
  }

  function snow(ctx, W, H, p, r, a, count) {
    var n = count || Math.floor(W * 0.22);
    for (var i = 0; i < n; i++) {
      var x = r() * W, y = r() * H, s = 0.5 + r() * 1.2;
      ellipse(ctx, x, y, s, s, p.accent[0], (a || 0.55) * (0.3 + r() * 0.7));
    }
  }

  function petals(ctx, W, H, p, r, count, a) {
    for (var i = 0; i < (count || 14); i++) {
      var x = r() * W, y = r() * H * 0.9;
      var s = 1.4 + r() * 2.4;
      ctx.save();
      ctx.translate(x, y); ctx.rotate(r() * Math.PI);
      ellipse(ctx, 0, 0, s, s * 0.42, pk(p.accent, r), (a || 0.5) * (0.35 + r() * 0.65));
      ctx.restore();
    }
  }

  function fog(ctx, W, H, p, r, y, h, color) {
    for (var i = 0; i < 3; i++) {
      var g = ctx.createLinearGradient(0, y - h, 0, y + h);
      g.addColorStop(0, ha(color || p.light[0], 0));
      g.addColorStop(0.5, ha(color || p.light[0], 0.14 - i * 0.03));
      g.addColorStop(1, ha(color || p.light[0], 0));
      ctx.fillStyle = g;
      ctx.fillRect(0, y - h + (r() - 0.5) * h * 0.5, W, h * 2);
    }
  }

  /* —— 主体：一个看得清的背影 / 剪影，带轮廓光 —— */
  function person(ctx, W, H, p, r, o) {
    o = o || {};
    var h = o.h != null ? o.h : H * 0.42;
    var cx = o.x != null ? o.x : W * 0.5;
    var baseY = o.y != null ? o.y : H * 0.84;
    var dark = o.color || p.bg[0];
    var headR = h * 0.105;
    var shoulder = h * 0.17;
    var bodyTop = baseY - h + headR * 2.1;
    var headY = baseY - h + headR;

    glow(ctx, cx, baseY - h * 0.52, h * 0.75, pk(p.light, r), 0.3);

    ctx.save();
    /* 身体：一件垂到脚边的长风衣 */
    ctx.fillStyle = ha(dark, 0.97);
    ctx.beginPath();
    ctx.moveTo(cx - shoulder * 0.52, bodyTop);
    ctx.quadraticCurveTo(cx - shoulder * 1.2, baseY - h * 0.42, cx - shoulder * 0.98, baseY);
    ctx.lineTo(cx + shoulder * 0.98, baseY);
    ctx.quadraticCurveTo(cx + shoulder * 1.2, baseY - h * 0.42, cx + shoulder * 0.52, bodyTop);
    ctx.closePath(); ctx.fill();
    /* 头 */
    ctx.beginPath(); ctx.arc(cx, headY, headR, 0, Math.PI * 2); ctx.fill();
    /* 颈 */
    ctx.fillRect(cx - headR * 0.4, headY, headR * 0.8, headR * 0.9);

    /* 轮廓光：只描受光的那一侧，让剪影从背景里立起来 */
    var side = o.rimSide == null ? 1 : o.rimSide;
    var rim = pk(p.accent, r);
    stroke(ctx, rim, Math.max(1.1, h * 0.014), 0.62);
    ctx.beginPath();
    ctx.moveTo(cx + side * shoulder * 0.52, bodyTop + h * 0.01);
    ctx.quadraticCurveTo(cx + side * shoulder * 1.2, baseY - h * 0.42, cx + side * shoulder * 0.98, baseY - 1);
    ctx.stroke();
    ctx.beginPath();
    var a0 = side > 0 ? Math.PI * 1.62 : Math.PI * 1.12;
    ctx.arc(cx, headY, headR * 1.01, a0, a0 + Math.PI * 0.62);
    ctx.stroke();
    /* 发丝 / 衣角的一点细节 */
    stroke(ctx, rim, 1, 0.22);
    ctx.beginPath();
    ctx.moveTo(cx - side * headR * 0.5, headY - headR * 0.7);
    ctx.quadraticCurveTo(cx - side * headR * 1.1, headY + headR * 0.4, cx - side * headR * 0.7, headY + headR * 1.2);
    ctx.stroke();
    ctx.restore();
  }

  function wantFigure(opt, r) {
    if (!opt) return r() < 0.75;
    if (opt.intent === 'farewell') return r() < 0.5;
    if (opt.intent === 'invite') return r() < 0.45;
    if (opt.intent === 'soothe') return r() < 0.58;
    if (opt.intent === 'guard') return r() < 0.72;
    return r() < 0.82;
  }

  /* 主体站位：三分法，避免每张都在正中 */
  function spot(comp, W) {
    if (comp === 1) return W * 0.66;
    if (comp === 2) return W * 0.34;
    return W * 0.5;
  }
  function other(comp, W) { return comp === 2 ? W * 0.68 : W * 0.32; }

  /* —— 会发光的物件：画面的“说明句” —— */
  function litWindow(ctx, x, y, w, h, p, r, o) {
    o = o || {};
    glow(ctx, x + w / 2, y + h / 2, Math.max(w, h) * 1.1, pk(p.accent, r), 0.38);
    var g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, ha(p.accent[1] || pk(p.accent, r), 0.96));
    g.addColorStop(0.55, ha(p.light[2], 0.92));
    g.addColorStop(1, ha(p.light[1], 0.94));
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);

    /* 窗外：远山、屋檐、月亮或雨 */
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.fillStyle = ha(p.bg[1], 0.5);
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.74);
    ctx.quadraticCurveTo(x + w * 0.24, y + h * 0.62, x + w * 0.48, y + h * 0.72);
    ctx.quadraticCurveTo(x + w * 0.76, y + h * 0.82, x + w, y + h * 0.66);
    ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
    if (o.moon) {
      ellipse(ctx, x + w * 0.72, y + h * 0.24, w * 0.085, w * 0.085, p.accent[3] || p.accent[0], 0.5);
    }
    if (o.rain) {
      for (var i = 0; i < 18; i++) {
        var rx = x + r() * w, ry = y + r() * h, len = 4 + r() * 12;
        stroke(ctx, p.bg[0], 0.8, 0.16);
        ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - len * 0.2, ry + len); ctx.stroke();
      }
    }
    ctx.restore();

    /* 窗棂与窗框 */
    ctx.fillStyle = ha(p.bg[0], 0.9);
    ctx.fillRect(x + w / 2 - 1.5, y, 3, h);
    ctx.fillRect(x, y + h * 0.46, w, 3);
    stroke(ctx, p.bg[0], 3, 0.96); ctx.strokeRect(x, y, w, h);
    rect(ctx, x - w * 0.04, y + h, w * 1.08, Math.max(2, h * 0.03), p.bg[0], 0.96);
  }

  function curtain(ctx, W, H, p, r, side) {
    var w = W * 0.17, x = side > 0 ? W - w * 0.7 : -w * 0.3;
    var g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, ha(p.bg[0], 0.92));
    g.addColorStop(0.45, ha(p.mid[0], 0.96));
    g.addColorStop(1, ha(p.bg[0], 0.92));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x, 0); ctx.lineTo(x + w, 0);
    ctx.quadraticCurveTo(x + w * 0.82, H * 0.38, x + w * 0.94, H * 0.7);
    ctx.quadraticCurveTo(x + w * 0.76, H * 0.86, x + w * 0.58, H);
    ctx.lineTo(x + w * 0.18, H * 0.76);
    ctx.quadraticCurveTo(x + w * 0.04, H * 0.4, x, 0);
    ctx.closePath(); ctx.fill();
    for (var i = 1; i < 4; i++) {
      stroke(ctx, p.bg[0], 1.2, 0.22);
      ctx.beginPath();
      ctx.moveTo(x + w * i / 4, 0);
      ctx.quadraticCurveTo(x + w * i / 4 - w * 0.06, H * 0.5, x + w * i / 4 + w * 0.05, H * 0.9);
      ctx.stroke();
    }
  }

  function candle(ctx, x, y, s, p, r) {
    glow(ctx, x, y - s * 2.6, s * 5, p.accent[1], 0.36);
    rect(ctx, x - s * 0.17, y - s * 2.3, s * 0.34, s * 2.3, p.accent[3], 0.9);
    var fy = y - s * 2.55;
    glow(ctx, x, fy, s * 1.5, p.accent[1], 0.5);
    ctx.fillStyle = ha(p.accent[1], 0.96);
    ctx.beginPath();
    ctx.moveTo(x, fy - s * 0.55);
    ctx.quadraticCurveTo(x + s * 0.26, fy - s * 0.02, x, fy + s * 0.3);
    ctx.quadraticCurveTo(x - s * 0.26, fy - s * 0.02, x, fy - s * 0.55);
    ctx.fill();
  }

  function lamp(ctx, x, baseY, h, p, r) {
    glow(ctx, x, baseY - h, h * 0.85, p.accent[1], 0.38);
    stroke(ctx, p.bg[0], Math.max(1.8, h * 0.028), 0.95);
    ctx.beginPath(); ctx.moveTo(x, baseY); ctx.lineTo(x, baseY - h); ctx.stroke();
    rect(ctx, x - h * 0.05, baseY - h * 0.05, h * 0.1, h * 0.05, p.bg[0], 0.95);
    ctx.fillStyle = ha(p.bg[0], 0.96);
    ctx.beginPath();
    ctx.moveTo(x - h * 0.1, baseY - h);
    ctx.lineTo(x + h * 0.1, baseY - h);
    ctx.lineTo(x + h * 0.06, baseY - h * 0.89);
    ctx.lineTo(x - h * 0.06, baseY - h * 0.89);
    ctx.closePath(); ctx.fill();
    ellipse(ctx, x, baseY - h * 0.9, h * 0.055, h * 0.036, p.accent[0], 0.96);
    glow(ctx, x, baseY - h * 0.9, h * 0.42, p.accent[0], 0.48);
  }

  function letter(ctx, x, y, w, h, rot, p, r) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot || 0);
    rect(ctx, -w / 2 + 2, -h / 2 + 3, w, h, p.bg[0], 0.38);
    rect(ctx, -w / 2, -h / 2, w, h, p.accent[3], 0.93);
    stroke(ctx, p.mid[2], 1, 0.32);
    for (var i = 0; i < 4; i++) {
      var ly = -h * 0.24 + i * h * 0.15;
      ctx.beginPath(); ctx.moveTo(-w * 0.34, ly);
      ctx.lineTo(-w * 0.34 + w * 0.68 * (0.55 + r() * 0.45), ly); ctx.stroke();
    }
    ctx.restore();
  }

  function cup(ctx, x, y, s, p, r) {
    rect(ctx, x - s * 0.22, y - s * 0.52, s * 0.44, s * 0.52, p.accent[3], 0.92);
    ellipse(ctx, x, y - s * 0.52, s * 0.22, s * 0.07, p.accent[1], 0.85);
    stroke(ctx, p.accent[3], Math.max(1, s * 0.05), 0.85);
    ctx.beginPath(); ctx.arc(x + s * 0.24, y - s * 0.28, s * 0.12, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
    for (var i = 0; i < 2; i++) {
      stroke(ctx, p.accent[0], 1, 0.16);
      ctx.beginPath();
      ctx.moveTo(x - s * 0.08 + i * s * 0.16, y - s * 0.64);
      ctx.bezierCurveTo(x - s * 0.2 + i * s * 0.16, y - s * 0.95,
        x + s * 0.12 + i * s * 0.16, y - s * 1.1,
        x - s * 0.04 + i * s * 0.16, y - s * 1.42);
      ctx.stroke();
    }
  }

  function flowers(ctx, x, y, s, p, r, count) {
    var n = count || 5;
    for (var i = 0; i < n; i++) {
      var fx = x + (r() - 0.5) * s * 0.85;
      var fy = y - s * (0.45 + r() * 0.55);
      stroke(ctx, p.light[0], Math.max(0.8, s * 0.018), 0.55);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(fx, fy + s * 0.3, fx, fy); ctx.stroke();
      var petal = pk([p.accent[1], p.light[2], p.accent[0]], r);
      for (var k = 0; k < 5; k++) {
        var ang = r() * Math.PI * 2;
        ellipse(ctx, fx + Math.cos(ang) * s * 0.05, fy + Math.sin(ang) * s * 0.05,
          s * 0.052, s * 0.036, petal, 0.88);
      }
      ellipse(ctx, fx, fy, s * 0.026, s * 0.026, p.accent[3], 0.9);
    }
  }

  function tree(ctx, x, baseY, h, p, r, lean) {
    lean = lean || 0;
    var trunkW = Math.max(1.6, h * 0.024);
    stroke(ctx, p.bg[0], trunkW, 0.95);
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.quadraticCurveTo(x + lean * h * 0.12, baseY - h * 0.55, x + lean * h * 0.3, baseY - h * 0.92);
    ctx.stroke();
    for (var i = 1; i <= 5; i++) {
      var t = i / 6;
      var by = baseY - h * t * 0.9;
      var bx = x + lean * h * 0.16 * t;
      var dir = i % 2 ? 1 : -1;
      stroke(ctx, p.bg[0], trunkW * 0.55, 0.9);
      ctx.beginPath(); ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(bx + dir * h * 0.12, by - h * 0.08, bx + dir * h * 0.2, by - h * 0.18);
      ctx.stroke();
    }
    var cy = baseY - h * 0.86;
    for (var j = 0; j < 4; j++) {
      ellipse(ctx,
        x + lean * h * 0.3 + (r() - 0.5) * h * 0.3,
        cy - h * 0.06 - r() * h * 0.1,
        h * 0.085 + r() * h * 0.05,
        h * 0.055 + r() * h * 0.035,
        p.bg[0], 0.62);
    }
  }

  function boat(ctx, x, y, w, p, r) {
    ctx.save();
    ctx.fillStyle = ha(p.bg[0], 0.96);
    ctx.beginPath();
    ctx.moveTo(x - w * 0.5, y);
    ctx.quadraticCurveTo(x, y + w * 0.16, x + w * 0.5, y);
    ctx.lineTo(x + w * 0.38, y - w * 0.06);
    ctx.lineTo(x - w * 0.38, y - w * 0.06);
    ctx.closePath(); ctx.fill();
    stroke(ctx, p.bg[0], Math.max(1, w * 0.018), 0.95);
    ctx.beginPath(); ctx.moveTo(x, y - w * 0.06); ctx.lineTo(x, y - w * 0.62); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - w * 0.56); ctx.lineTo(x + w * 0.24, y - w * 0.12); ctx.stroke();
    ctx.restore();
  }

  function clock(ctx, x, y, rad, p, r) {
    glow(ctx, x, y, rad * 2.4, p.accent[1], 0.2);
    ellipse(ctx, x, y, rad, rad, p.accent[3], 0.92);
    stroke(ctx, p.bg[0], Math.max(1, rad * 0.08), 0.85);
    ctx.beginPath(); ctx.arc(x, y, rad * 0.92, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + rad * 0.34, y - rad * 0.28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - rad * 0.06, y - rad * 0.56); ctx.stroke();
  }

  function arch(ctx, x, baseY, w, h, p, r) {
    var cx = x + w / 2, spring = baseY - h * 0.6;
    glow(ctx, cx, baseY - h * 0.55, w * 1.15, p.accent[1], 0.26);
    var g = ctx.createLinearGradient(x, baseY - h, x, baseY);
    g.addColorStop(0, ha(p.accent[1], 0.34));
    g.addColorStop(1, ha(p.light[1], 0.16));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x, spring);
    ctx.arc(cx, spring, w / 2, Math.PI, Math.PI * 2);
    ctx.lineTo(x + w, baseY);
    ctx.closePath(); ctx.fill();
    stroke(ctx, p.bg[0], Math.max(2, w * 0.05), 0.95);
    ctx.beginPath();
    ctx.moveTo(x, baseY); ctx.lineTo(x, spring);
    ctx.arc(cx, spring, w / 2, Math.PI, Math.PI * 2);
    ctx.lineTo(x + w, baseY);
    ctx.stroke();
  }

  function bench(ctx, x, y, w, p, r) {
    rect(ctx, x - w * 0.5, y, w, Math.max(2, w * 0.05), p.bg[0], 0.94);
    rect(ctx, x - w * 0.44, y - w * 0.26, w * 0.88, Math.max(2, w * 0.04), p.bg[0], 0.9);
    rect(ctx, x - w * 0.42, y, w * 0.05, w * 0.4, p.bg[0], 0.94);
    rect(ctx, x + w * 0.37, y, w * 0.05, w * 0.4, p.bg[0], 0.94);
    rect(ctx, x - w * 0.42, y - w * 0.26, w * 0.05, w * 0.26, p.bg[0], 0.9);
    rect(ctx, x + w * 0.37, y - w * 0.26, w * 0.05, w * 0.26, p.bg[0], 0.9);
  }

  function lantern(ctx, x, y, s, p, r) {
    glow(ctx, x, y, s * 4.2, p.accent[1], 0.34);
    stroke(ctx, p.bg[0], 1, 0.65);
    ctx.beginPath(); ctx.moveTo(x, y - s * 1.7); ctx.lineTo(x, y - s * 0.82); ctx.stroke();
    ellipse(ctx, x, y, s * 0.62, s * 0.74, p.accent[1], 0.92);
    ellipse(ctx, x, y, s * 0.28, s * 0.34, p.accent[3], 0.9);
    rect(ctx, x - s * 0.3, y - s * 0.86, s * 0.6, s * 0.12, p.bg[0], 0.8);
    rect(ctx, x - s * 0.3, y + s * 0.72, s * 0.6, s * 0.12, p.bg[0], 0.8);
  }

  /* ============================================================
     场景 1 · 窗：他把夜色关在外面，留一盏灯给你
     ============================================================ */
  function sceneWindow(ctx, W, H, p, r, opt) {
    opt = opt || {};
    var comp = opt.comp || 0;
    sky(ctx, W, H, p, r);
    rect(ctx, 0, 0, W, H, p.bg[1], 0.16);

    var wx = comp === 2 ? W * 0.08 : W * 0.42;
    var ww = W * 0.48, wh = H * 0.44, wy = H * 0.14;
    litWindow(ctx, wx, wy, ww, wh, p, r, {
      rain: opt.weather === 'rain',
      moon: opt.weather !== 'rain'
    });
    curtain(ctx, W, H, p, r, comp === 1 ? 1 : -1);

    ground(ctx, W, H, H * 0.76, p.mid[0], 0.62);

    /* 窗光落在地上 */
    var g = ctx.createLinearGradient(wx, wy + wh, wx, H);
    g.addColorStop(0, ha(p.accent[1], 0.2));
    g.addColorStop(1, ha(p.accent[1], 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(wx, wy + wh);
    ctx.lineTo(wx + ww, wy + wh);
    ctx.lineTo(wx + ww * 1.22, H);
    ctx.lineTo(wx - ww * 0.22, H);
    ctx.closePath(); ctx.fill();

    /* 与主体相对的小桌：烛、杯、信 */
    var tx = other(comp, W);
    rect(ctx, tx - W * 0.11, H * 0.78, W * 0.22, H * 0.014, p.bg[0], 0.92);
    rect(ctx, tx - W * 0.095, H * 0.795, W * 0.014, H * 0.12, p.bg[0], 0.92);
    rect(ctx, tx + W * 0.08, H * 0.795, W * 0.014, H * 0.12, p.bg[0], 0.92);
    candle(ctx, tx + W * 0.045, H * 0.78, W * 0.032, p, r);
    cup(ctx, tx - W * 0.045, H * 0.78, W * 0.048, p, r);
    letter(ctx, tx + W * 0.005, H * 0.778, W * 0.08, W * 0.05, -0.14, p, r);

    if (wantFigure(opt, r)) {
      person(ctx, W, H, p, r, {
        x: spot(comp, W) + W * 0.02,
        y: H * 0.92,
        h: H * 0.5,
        rimSide: comp === 2 ? -1 : 1
      });
    }

    if (opt.weather === 'rain') rain(ctx, W, H, p, r, 0.08);
    if (opt.weather === 'snow') snow(ctx, W, H, p, r, 0.5, 42);
    if (opt.weather === 'petal') petals(ctx, W, H, p, r, 10, 0.32);
    fog(ctx, W, H, p, r, H * 0.72, H * 0.12);
  }

  /* ============================================================
     场景 2 · 长廊：门一扇扇退后，光在尽头等他
     ============================================================ */
  function sceneHall(ctx, W, H, p, r, opt) {
    opt = opt || {};
    var comp = opt.comp || 0;
    sky(ctx, W, H, p, r, p.mid[1], p.bg[1]);

    var hz = H * 0.5;
    /* 两侧墙 */
    rect(ctx, 0, 0, W * 0.34, H, p.bg[1], 0.7);
    rect(ctx, W * 0.66, 0, W * 0.34, H, p.bg[1], 0.7);
    /* 地面：向中心收 */
    var g = ctx.createLinearGradient(0, hz, 0, H);
    g.addColorStop(0, ha(p.mid[0], 0.8));
    g.addColorStop(1, ha(p.bg[0], 0.98));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, H); ctx.lineTo(W * 0.30, hz);
    ctx.lineTo(W * 0.70, hz); ctx.lineTo(W, H);
    ctx.closePath(); ctx.fill();
    /* 地面透视与边线 */
    stroke(ctx, p.accent[1], 1, 0.12);
    ctx.beginPath();
    ctx.moveTo(0, H); ctx.lineTo(W * 0.30, hz);
    ctx.moveTo(W, H); ctx.lineTo(W * 0.70, hz);
    ctx.stroke();
    for (var f = 1; f < 5; f++) {
      var fx = W * f / 5;
      stroke(ctx, p.accent[1], 0.8, 0.05);
      ctx.beginPath();
      ctx.moveTo(fx, H);
      ctx.lineTo(W / 2 + (fx - W / 2) * 0.12, hz);
      ctx.stroke();
    }

    /* 一重重拱门 */
    for (var i = 0; i < 3; i++) {
      var aw = W * (0.92 - i * 0.19);
      var spring = H * (0.44 + i * 0.055);
      var top = spring - aw / 2;
      if (top < 0) top = 0;
      stroke(ctx, p.bg[0], Math.max(1.2, 3.2 - i * 0.9), 0.55 + i * 0.15);
      ctx.beginPath();
      ctx.moveTo(W / 2 - aw / 2, H);
      ctx.lineTo(W / 2 - aw / 2, spring);
      ctx.arc(W / 2, spring, aw / 2, Math.PI, Math.PI * 2);
      ctx.lineTo(W / 2 + aw / 2, H);
      ctx.stroke();
    }

    /* 尽头的门：一线暖光 */
    var dw = W * 0.16, dh = H * 0.3;
    glow(ctx, W / 2, hz - dh * 0.1, W * 0.3, p.accent[1], 0.34);
    rect(ctx, W / 2 - dw / 2, hz - dh * 0.55, dw, dh, p.accent[1], 0.5);
    rect(ctx, W / 2 - dw * 0.06, hz - dh * 0.55, dw * 0.12, dh, p.accent[3], 0.35);

    /* 地上的光路 */
    var fg = ctx.createLinearGradient(0, hz, 0, H);
    fg.addColorStop(0, ha(p.accent[1], 0.22));
    fg.addColorStop(1, ha(p.accent[1], 0));
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.moveTo(W / 2 - dw / 2, hz);
    ctx.lineTo(W / 2 + dw / 2, hz);
    ctx.lineTo(W * 0.66, H); ctx.lineTo(W * 0.34, H);
    ctx.closePath(); ctx.fill();

    /* 吊灯 */
    var lx = W * (0.36 + comp * 0.14);
    stroke(ctx, p.bg[0], 1, 0.7);
    ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, H * 0.14); ctx.stroke();
    glow(ctx, lx, H * 0.18, W * 0.2, p.accent[1], 0.34);
    ellipse(ctx, lx, H * 0.18, W * 0.035, W * 0.028, p.accent[1], 0.92);
    ellipse(ctx, lx, H * 0.18, W * 0.016, W * 0.013, p.accent[3], 0.95);

    /* 墙上的镜子：另一处微光 */
    var mx = comp === 2 ? W * 0.76 : W * 0.16;
    rect(ctx, mx - W * 0.055, H * 0.3, W * 0.11, H * 0.2, p.accent[1], 0.14);
    stroke(ctx, p.bg[0], 2, 0.8);
    ctx.strokeRect(mx - W * 0.055, H * 0.3, W * 0.11, H * 0.2);

    if (wantFigure(opt, r)) {
      person(ctx, W, H, p, r, {
        x: spot(comp, W),
        y: H * 0.9,
        h: H * 0.34,
        rimSide: comp === 2 ? -1 : 1
      });
    }

    fog(ctx, W, H, p, r, hz + H * 0.03, H * 0.08);
    if (opt.weather === 'rain') rain(ctx, W, H, p, r, 0.05);
  }

  /* ============================================================
     场景 3 · 雨街：灯把雨照成一条条竖线
     ============================================================ */
  function sceneStreet(ctx, W, H, p, r, opt) {
    opt = opt || {};
    var comp = opt.comp || 0;
    sky(ctx, W, H, p, r, p.mid[2], p.mid[0]);

    var hz = H * 0.56;
    /* 远处的屋檐 */
    var bx = -W * 0.02;
    while (bx < W) {
      var bw = W * (0.08 + r() * 0.14);
      var bh = H * (0.07 + r() * 0.17);
      rect(ctx, bx, hz - bh, bw, bh, p.bg[0], 0.72);
      bx += bw + W * 0.008;
    }

    /* 湿路面 */
    ground(ctx, W, H, hz, p.bg[1], 0.88);

    /* 路面反光：只在近处留几道被灯拉长的光痕 */
    for (var i = 0; i < 5; i++) {
      var rx = r() * W, rw = 1.5 + r() * 3.5;
      var g = ctx.createLinearGradient(rx, hz, rx, H);
      g.addColorStop(0, ha(pk(p.accent, r), 0.14));
      g.addColorStop(0.7, ha(pk(p.accent, r), 0.06));
      g.addColorStop(1, ha(pk(p.accent, r), 0));
      ctx.fillStyle = g;
      ctx.fillRect(rx - rw / 2, hz + H * 0.05, rw, H * 0.42);
    }
    /* 湿地面的一道横向水光 */
    var sheen = ctx.createLinearGradient(0, hz + H * 0.08, 0, H);
    sheen.addColorStop(0, ha(p.accent[0], 0.07));
    sheen.addColorStop(1, ha(p.accent[0], 0));
    ctx.fillStyle = sheen;
    ctx.fillRect(0, hz + H * 0.08, W, H * 0.5);

    /* 路灯：主灯在主体对面，副灯在另一侧 */
    var lx = other(comp, W);
    var farX = lx < W / 2 ? W * 0.82 : W * 0.18;
    lamp(ctx, lx, hz + H * 0.02, H * 0.52, p, r);
    lamp(ctx, farX, hz + H * 0.01, H * 0.33, p, r);

    /* 水洼 */
    ellipse(ctx, lx, H * 0.9, W * 0.15, H * 0.032, p.accent[1], 0.12);
    ellipse(ctx, lx, H * 0.9, W * 0.1, H * 0.02, p.accent[1], 0.12);

    /* 主体 */
    if (wantFigure(opt, r)) {
      var fx = spot(comp, W);
      var fh = H * 0.5;
      person(ctx, W, H, p, r, {
        x: fx, y: H * 0.93, h: fh,
        rimSide: fx < W / 2 ? 1 : -1
      });
    }

    if (opt.weather !== 'clear') rain(ctx, W, H, p, r, 0.22);
    fog(ctx, W, H, p, r, hz + H * 0.05, H * 0.09);
  }

  /* ============================================================
     场景 4 · 海：月亮把水面分成两半，他在岸上留了一个位置
     ============================================================ */
  function sceneSea(ctx, W, H, p, r, opt) {
    opt = opt || {};
    var comp = opt.comp || 0;
    sky(ctx, W, H, p, r, p.mid[2], p.bg[1]);
    var hz = H * 0.54;

    /* 低垂的月 */
    var mx = other(comp, W) * 0.86 + W * 0.07;
    var my = H * 0.22;
    glow(ctx, mx, my, W * 0.32, p.accent[1], 0.4);
    ellipse(ctx, mx, my, W * 0.078, W * 0.078, p.accent[3], 0.82);
    ellipse(ctx, mx + W * 0.02, my - W * 0.02, W * 0.06, W * 0.06, p.accent[1], 0.3);

    /* 水体本身 */
    ground(ctx, W, H, hz, p.mid[1], 0.92);

    /* 月光在水面的光柱 */
    var col = ctx.createLinearGradient(0, hz, 0, H);
    col.addColorStop(0, ha(p.accent[3] || p.accent[1], 0.16));
    col.addColorStop(1, ha(p.accent[3] || p.accent[1], 0));
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(mx - W * 0.055, hz);
    ctx.lineTo(mx + W * 0.055, hz);
    ctx.lineTo(mx + W * 0.14, H);
    ctx.lineTo(mx - W * 0.14, H);
    ctx.closePath(); ctx.fill();

    for (var i = 0; i < 26; i++) {
      var y = hz + (i / 26) * (H - hz) + r() * 4;
      var w = W * (0.12 + r() * 0.5);
      var x = r() * (W - w);
      stroke(ctx, pk([p.light[0], p.light[1], p.accent[0]], r), 0.6 + r() * 0.8, 0.06 + r() * 0.15);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + w / 2, y - 2 - r() * 3, x + w, y);
      ctx.stroke();
    }

    /* 月光倒影 */
    for (var j = 0; j < 16; j++) {
      var ry = hz + j * ((H - hz) / 16) + r() * 4;
      var rw = W * (0.05 + r() * 0.09) * (1 - j / 22);
      stroke(ctx, p.accent[3] || p.accent[1], 1 + r() * 1.5, 0.3 * (1 - j / 19));
      ctx.beginPath(); ctx.moveTo(mx - rw / 2, ry); ctx.lineTo(mx + rw / 2, ry); ctx.stroke();
    }

    boat(ctx, other(comp, W), hz + (H - hz) * 0.2, W * 0.2, p, r);

    /* 岸边的礁石 */
    if (comp !== 1) {
      ctx.fillStyle = ha(p.bg[0], 0.96);
      ctx.beginPath();
      ctx.moveTo(0, H);
      ctx.lineTo(0, H * 0.72);
      ctx.quadraticCurveTo(W * 0.16, H * 0.77, W * 0.25, H * 0.85);
      ctx.lineTo(W * 0.3, H);
      ctx.closePath(); ctx.fill();
    }

    if (wantFigure(opt, r)) {
      person(ctx, W, H, p, r, {
        x: spot(comp, W),
        y: H * 0.95,
        h: H * 0.42,
        rimSide: comp === 2 ? -1 : 1
      });
    }

    fog(ctx, W, H, p, r, hz + H * 0.02, H * 0.08);
  }

  /* ============================================================
     场景 5 · 林：雾把路藏起来，只留一束月光
     ============================================================ */
  function sceneForest(ctx, W, H, p, r, opt) {
    opt = opt || {};
    var comp = opt.comp || 0;
    sky(ctx, W, H, p, r, p.mid[1], p.bg[1]);

    var mx = comp === 2 ? W * 0.72 : W * 0.28;
    glow(ctx, mx, H * 0.18, W * 0.26, p.accent[1], 0.3);
    ellipse(ctx, mx, H * 0.18, W * 0.056, W * 0.056, p.accent[3], 0.8);

    /* 远处的树，浸在雾里 */
    for (var i = 0; i < 7; i++) {
      tree(ctx, r() * W, H * 0.72, H * (0.16 + r() * 0.12), p, r, (r() - 0.5) * 0.4);
    }
    fog(ctx, W, H, p, r, H * 0.62, H * 0.1);

    ground(ctx, W, H, H * 0.7, p.bg[1], 0.92);

    /* 小径 */
    var pathX = spot(comp, W);
    ctx.fillStyle = ha(p.mid[0], 0.42);
    ctx.beginPath();
    ctx.moveTo(pathX - W * 0.025, H * 0.7);
    ctx.quadraticCurveTo(pathX - W * 0.08, H * 0.84, pathX - W * 0.19, H);
    ctx.lineTo(pathX + W * 0.19, H);
    ctx.quadraticCurveTo(pathX + W * 0.08, H * 0.84, pathX + W * 0.025, H * 0.7);
    ctx.closePath(); ctx.fill();

    /* 近处的树 */
    tree(ctx, W * 0.03, H * 1.04, H * 0.88, p, r, 0.22);
    tree(ctx, W * 0.97, H * 1.06, H * 0.84, p, r, -0.2);

    /* 月光柱 */
    for (var b = 0; b < 2; b++) {
      var bx = W * (0.32 + b * 0.3);
      var g = ctx.createLinearGradient(bx, H * 0.16, bx + W * 0.14, H * 0.9);
      g.addColorStop(0, ha(p.accent[1], 0.13));
      g.addColorStop(1, ha(p.accent[1], 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(bx - W * 0.012, H * 0.16);
      ctx.lineTo(bx + W * 0.05, H * 0.16);
      ctx.lineTo(bx + W * 0.2, H * 0.92);
      ctx.lineTo(bx - W * 0.04, H * 0.92);
      ctx.closePath(); ctx.fill();
    }

    if (wantFigure(opt, r)) {
      person(ctx, W, H, p, r, {
        x: pathX,
        y: H * 0.87,
        h: H * 0.34,
        rimSide: pathX < W / 2 ? 1 : -1
      });
    }

    /* 只在低处留几粒萤火，不做星空 */
    for (var k = 0; k < 7; k++) {
      var fx = r() * W, fy = H * (0.6 + r() * 0.3);
      glow(ctx, fx, fy, W * 0.012, p.accent[1], 0.5);
    }
    fog(ctx, W, H, p, r, H * 0.8, H * 0.07);
  }

  /* ============================================================
     场景 6 · 书桌：灯只照到桌面，他坐在光的另一边
     ============================================================ */
  function sceneDesk(ctx, W, H, p, r, opt) {
    opt = opt || {};
    var comp = opt.comp || 0;
    sky(ctx, W, H, p, r, p.mid[1], p.bg[0]);

    /* 背景的小窗 */
    var ww = W * 0.22, wh = H * 0.2;
    litWindow(ctx, comp === 2 ? W * 0.64 : W * 0.12, H * 0.08, ww, wh, p, r, { moon: true });

    /* 桌面 */
    var ty = H * 0.62;
    ground(ctx, W, H, ty, p.mid[0], 0.96);
    rect(ctx, 0, ty, W, Math.max(2, H * 0.008), p.accent[1], 0.12);

    /* 台灯与光锥 */
    var lx = other(comp, W);
    glow(ctx, lx, H * 0.42, W * 0.34, p.accent[1], 0.44);
    ctx.fillStyle = ha(p.accent[1], 0.09);
    ctx.beginPath();
    ctx.moveTo(lx, H * 0.41);
    ctx.lineTo(lx - W * 0.26, H * 0.74);
    ctx.lineTo(lx + W * 0.26, H * 0.74);
    ctx.closePath(); ctx.fill();

    /* 台灯：底座 + 灯杆 + 灯罩 */
    ellipse(ctx, lx, ty, W * 0.05, W * 0.012, p.bg[0], 0.95);
    stroke(ctx, p.bg[0], Math.max(2, W * 0.008), 0.95);
    ctx.beginPath(); ctx.moveTo(lx, ty); ctx.lineTo(lx, H * 0.34); ctx.stroke();
    ctx.fillStyle = ha(p.bg[0], 0.96);
    ctx.beginPath();
    ctx.moveTo(lx - W * 0.055, H * 0.33);
    ctx.lineTo(lx + W * 0.075, H * 0.33);
    ctx.lineTo(lx + W * 0.1, H * 0.41);
    ctx.lineTo(lx - W * 0.075, H * 0.41);
    ctx.closePath(); ctx.fill();
    ellipse(ctx, lx + W * 0.012, H * 0.405, W * 0.085, W * 0.014, p.accent[1], 0.95);

    /* 桌上：信、杯、花、墨水瓶 */
    letter(ctx, W * 0.5, H * 0.76, W * 0.24, W * 0.15, -0.06, p, r);
    letter(ctx, W * 0.6, H * 0.69, W * 0.19, W * 0.12, 0.22, p, r);
    var cx2 = lx < W / 2 ? W * 0.74 : W * 0.26;
    cup(ctx, cx2, H * 0.71, W * 0.06, p, r);
    flowers(ctx, lx < W / 2 ? W * 0.14 : W * 0.86, H * 0.71, W * 0.16, p, r, 4);
    rect(ctx, lx < W / 2 ? W * 0.4 : W * 0.56, H * 0.73, W * 0.035, W * 0.03, p.bg[0], 0.9);
    stroke(ctx, p.accent[3], 1.4, 0.8);
    ctx.beginPath();
    ctx.moveTo(lx < W / 2 ? W * 0.42 : W * 0.58, H * 0.73);
    ctx.lineTo(lx < W / 2 ? W * 0.47 : W * 0.53, H * 0.7);
    ctx.stroke();

    /* 墙上的钟 */
    clock(ctx, lx < W / 2 ? W * 0.84 : W * 0.16, H * 0.2, W * 0.05, p, r);

    if (wantFigure(opt, r)) {
      person(ctx, W, H, p, r, {
        x: spot(comp, W),
        y: ty,
        h: H * 0.34,
        rimSide: lx < W / 2 ? -1 : 1
      });
    }

    fog(ctx, W, H, p, r, H * 0.6, H * 0.06);
  }

  /* ============================================================
     场景 7 · 庭：花在夜里也开着，因为他说会来
     ============================================================ */
  function sceneGarden(ctx, W, H, p, r, opt) {
    opt = opt || {};
    var comp = opt.comp || 0;
    sky(ctx, W, H, p, r, p.mid[2], p.bg[1]);

    var mx = other(comp, W);
    glow(ctx, mx, H * 0.15, W * 0.24, p.accent[1], 0.26);
    ellipse(ctx, mx, H * 0.15, W * 0.046, W * 0.046, p.accent[3], 0.7);

    /* 远处的树篱 */
    ctx.fillStyle = ha(p.bg[1], 0.88);
    ctx.beginPath();
    ctx.moveTo(0, H * 0.66);
    for (var x = 0; x <= W; x += W * 0.08) {
      var y = H * 0.62 - Math.sin(x * 0.03) * H * 0.02 + r() * H * 0.015;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();

    ground(ctx, W, H, H * 0.72, p.mid[0], 0.55);

    /* 小径 */
    var px = spot(comp, W);
    ctx.fillStyle = ha(p.bg[0], 0.42);
    ctx.beginPath();
    ctx.moveTo(px - W * 0.05, H * 0.72);
    ctx.quadraticCurveTo(px - W * 0.09, H * 0.86, px - W * 0.2, H);
    ctx.lineTo(px + W * 0.2, H);
    ctx.quadraticCurveTo(px + W * 0.09, H * 0.86, px + W * 0.05, H * 0.72);
    ctx.closePath(); ctx.fill();

    /* 花拱门 */
    arch(ctx, W * 0.5 - W * 0.2, H * 0.74, W * 0.4, H * 0.5, p, r);
    for (var i = 0; i < 9; i++) {
      var t = i / 8;
      var ax = W * 0.5 - W * 0.2 + t * W * 0.4;
      var ay = H * 0.74 - H * 0.3 - Math.sin(t * Math.PI) * H * 0.14;
      ellipse(ctx, ax, ay, W * 0.013, W * 0.01, pk([p.accent[1], p.light[2]], r), 0.82);
    }

    bench(ctx, other(comp, W), H * 0.83, W * 0.2, p, r);
    lantern(ctx, comp === 2 ? W * 0.78 : W * 0.22, H * 0.4, W * 0.03, p, r);
    lantern(ctx, comp === 2 ? W * 0.24 : W * 0.76, H * 0.46, W * 0.024, p, r);

    petals(ctx, W, H, p, r, 12, 0.4);

    if (wantFigure(opt, r)) {
      person(ctx, W, H, p, r, {
        x: px,
        y: H * 0.91,
        h: H * 0.4,
        rimSide: px < W / 2 ? 1 : -1
      });
    }

    fog(ctx, W, H, p, r, H * 0.7, H * 0.07);
  }

  /* ============================================================
     场景 8 · 雪原：脚印只往一个方向，远处有一点暖光
     ============================================================ */
  function sceneSnow(ctx, W, H, p, r, opt) {
    opt = opt || {};
    var comp = opt.comp || 0;
    sky(ctx, W, H, p, r, p.mid[2], p.mid[1]);
    var hz = H * 0.6;

    /* 远处亮着灯的小屋 */
    var hx = other(comp, W);
    glow(ctx, hx, hz - H * 0.05, W * 0.18, p.accent[1], 0.4);
    rect(ctx, hx - W * 0.05, hz - H * 0.08, W * 0.1, H * 0.08, p.bg[0], 0.95);
    ctx.fillStyle = ha(p.bg[0], 0.97);
    ctx.beginPath();
    ctx.moveTo(hx - W * 0.065, hz - H * 0.078);
    ctx.lineTo(hx, hz - H * 0.16);
    ctx.lineTo(hx + W * 0.065, hz - H * 0.078);
    ctx.closePath(); ctx.fill();
    /* 屋顶积雪的一线亮边 */
    stroke(ctx, p.accent[3], Math.max(1.2, W * 0.006), 0.55);
    ctx.beginPath();
    ctx.moveTo(hx - W * 0.065, hz - H * 0.078);
    ctx.lineTo(hx, hz - H * 0.16);
    ctx.lineTo(hx + W * 0.065, hz - H * 0.078);
    ctx.stroke();
    glow(ctx, hx, hz - H * 0.045, W * 0.07, p.accent[3], 0.38);
    rect(ctx, hx - W * 0.017, hz - H * 0.056, W * 0.034, H * 0.052, p.accent[3], 0.9);
    stroke(ctx, p.bg[0], 1.2, 0.7);
    ctx.beginPath();
    ctx.moveTo(hx, hz - H * 0.056); ctx.lineTo(hx, hz - H * 0.004);
    ctx.moveTo(hx - W * 0.017, hz - H * 0.03); ctx.lineTo(hx + W * 0.017, hz - H * 0.03);
    ctx.stroke();

    /* 雪地 */
    ground(ctx, W, H, hz, p.mid[1], 0.9);
    rect(ctx, 0, hz, W, H - hz, p.accent[3], 0.09);

    for (var i = 0; i < 4; i++) {
      tree(ctx, r() * W, hz + (r() - 0.5) * H * 0.05, H * (0.15 + r() * 0.1), p, r, 0);
    }

    /* 脚印 */
    var fx = spot(comp, W);
    var dir = comp === 2 ? -1 : 1;
    for (var j = 0; j < 9; j++) {
      var t = j / 8;
      var pxx = fx + Math.sin(t * Math.PI * 1.1) * W * 0.06 * dir;
      var pyy = H - (H - hz) * t;
      var s = W * 0.013 * (1 - t * 0.6);
      ellipse(ctx, pxx, pyy, s, s * 0.5, p.bg[1], 0.42);
    }

    if (wantFigure(opt, r)) {
      person(ctx, W, H, p, r, {
        x: fx + W * 0.02 * dir,
        y: hz + (H - hz) * 0.28,
        h: H * 0.3,
        rimSide: -dir
      });
    }

    snow(ctx, W, H, p, r, 0.62, Math.floor(W * 0.26));
    fog(ctx, W, H, p, r, hz + H * 0.02, H * 0.07);
  }

  /* ============================================================
     场景目录：名字 + 画家 + 这个场景专属的标题
     ============================================================ */
  var SCENES = {
    window: {
      name: '窗',
      draw: sceneWindow,
      titles: ['窗台上的第二只杯子', '灯还亮着的那扇窗', '雨关在玻璃外面', '窗外的雨替他说话', '把夜关在外面']
    },
    hall: {
      name: '长廊',
      draw: sceneHall,
      titles: ['长廊尽头的门缝', '一重重退后的门', '他站在光与光之间', '走廊尽头还亮着', '他退到光后面']
    },
    street: {
      name: '雨街',
      draw: sceneStreet,
      titles: ['路灯把雨照成竖线', '湿透的街与一盏灯', '伞下的那一小块干燥', '雨里只有一盏灯认路', '伞下空了一半']
    },
    sea: {
      name: '海',
      draw: sceneSea,
      titles: ['月亮把海分成两半', '岸上留了一个位置', '潮水替他说话', '海面替他翻来覆去', '岸上两个人的脚印']
    },
    forest: {
      name: '林',
      draw: sceneForest,
      titles: ['雾里的那条小径', '只够照亮一步的月光', '林子里有人等你', '雾散之前他不走', '林子记得你来过']
    },
    desk: {
      name: '书桌',
      draw: sceneDesk,
      titles: ['灯只照到桌面', '写了一半的信', '两只杯子，一杯还热', '信纸上还有温度', '灯下留着半个座位']
    },
    garden: {
      name: '庭',
      draw: sceneGarden,
      titles: ['夜里开着的花', '拱门下的长椅', '灯笼替花照着路', '花开给没人看的夜', '长椅的一侧是空的']
    },
    snow: {
      name: '雪原',
      draw: sceneSnow,
      titles: ['雪把来路盖住了', '远处那点暖光', '脚印只往一个方向', '雪地上两行脚印', '小屋的灯没关']
    }
  };

  /* ============================================================
     他的七种用意：心境 / 时辰 / 字卡会把人推到其中一种里
     ============================================================ */
  var INTENTS = {
    watch: {
      name: '守望',
      scenes: ['window', 'hall', 'street', 'garden', 'sea'],
      will: [
        '把这一幕留给你——他想让你知道，你回头的时候，他一直在。',
        '他不打算喊你，只想确认你今晚睡在光里。',
        '他把自己放在画面边缘，好让你站在中间。'
      ],
      titles: ['他站在画面的边上', '守着一盏没熄的灯', '你回头的时候他还在', '灯亮着，你就知道他在', '他把夜色让给你', '窗边的第三个人']
    },
    miss: {
      name: '思念',
      scenes: ['sea', 'window', 'street', 'snow', 'desk'],
      will: [
        '画一个你会经过的地方，这样你也算来过他这里。',
        '他把想说的话拆成光和水，慢慢摆给你看。',
        '这一张没有落款，因为他想让你先认出他。'
      ],
      titles: ['把想念折成一张纸', '你走后的第三种夜色', '雨停在半空等他', '他学着你走路的节奏', '把一整个海写成一句话', '你不在，画替你站着']
    },
    soothe: {
      name: '安抚',
      scenes: ['desk', 'window', 'garden', 'forest'],
      will: [
        '先把世界关在门外，剩下的交给他。',
        '他画了热的东西，好让你觉得手是暖的。',
        '今晚不用坚强，画面替你把灯留着。'
      ],
      titles: ['先把世界关在门外', '一盏留给你的小灯', '热茶、灯，和一场好梦', '把手放进画里暖一暖', '今晚的门都关好了', '他在灯下等你打盹']
    },
    test: {
      name: '试探',
      scenes: ['hall', 'street', 'forest'],
      will: [
        '他没把门关严，留了一道缝，看你会不会推。',
        '他画了你可能会喜欢的地方，然后等你先开口。',
        '这一步他不敢先走，就把路画出来给你看。'
      ],
      titles: ['他在门缝里看你', '试探着把光递过来', '如果你先开口', '门缝里那一点光', '他先画了，再问你', '走过来，还是站着']
    },
    invite: {
      name: '邀约',
      scenes: ['desk', 'garden', 'window', 'hall'],
      will: [
        '门没锁，灯也亮着——他在等你自己走进来。',
        '他摆了两只杯子，另一只谁也不许坐。',
        '他算好了时间，把最暖的一刻留给你。'
      ],
      titles: ['门没锁，灯也亮着', '今晚留一个位置给你', '他摆了两只杯子', '茶凉之前过来', '第二只杯子一直空着', '他数着你会来的时间']
    },
    farewell: {
      name: '诀别',
      scenes: ['snow', 'sea', 'street', 'forest'],
      will: [
        '他没有回头，是怕一回头就走不成了。',
        '他把灯留在原处，好像这样你就不算一个人。',
        '这一张画得很远，因为他不敢画得太近。'
      ],
      titles: ['最后一页留白', '雪把来路盖住了', '他把灯留在原处', '他把门带上，没锁', '最后一张不写名字', '雪落在画框外面']
    },
    guard: {
      name: '守护',
      scenes: ['hall', 'window', 'forest', 'street'],
      will: [
        '他站在你和黑暗中间，不打算让开。',
        '所有门都替你关好了，你只管睡。',
        '他把夜里最硬的那一块，画成了自己的背。'
      ],
      titles: ['他站在你和黑暗之间', '所有门都替你关好', '夜里替你挡风的那道墙', '他背对光站着', '你睡，他看门', '所有影子都归他管']
    }
  };

  function draw(ctx, W, H, p, r, key, opt) {
    var s = SCENES[key] || SCENES.window;
    s.draw(ctx, W, H, p, r, opt || {});
  }

  if (typeof window !== 'undefined') {
    window.JYScene = { draw: draw, SCENES: SCENES, INTENTS: INTENTS };
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { draw: draw, SCENES: SCENES, INTENTS: INTENTS };
  }
})();
