/* AiLIFE hero background: "agents reading the genome".
 *
 * Two layers on one canvas:
 *  1. A slowly rotating DNA double helix drawn as depth-shaded dots with
 *     base-pair rungs (data-helix="1" enables it; the value scales its size).
 *  2. A drifting agent network: small nodes that link when close; a few amber
 *     "agent" nodes pulse and reach out to the nearest helix base.
 *
 * Pure canvas, no dependencies. With prefers-reduced-motion a single still
 * frame is drawn; off-screen or hidden tabs pause the animation. */
(function () {
  "use strict";
  const canvases = document.querySelectorAll("canvas[data-network]");
  if (!canvases.length) return;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  canvases.forEach(canvas => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const density = Number(canvas.dataset.network) || 1;
    const helixScale = Number(canvas.dataset.helix) || 0;
    let w = 0, h = 0, dpr = 1, nodes = [], helix = [], raf = 0, visible = true, t0 = performance.now();
    const LINK = 130;

    function resize() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(90, Math.max(24, (w * h) / 16000)) * density);
      while (nodes.length < n) nodes.push(makeNode(nodes.length));
      nodes.length = n;
    }
    function makeNode(i) {
      return {
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18,
        r: Math.random() * 1.4 + .8,
        amber: i % 19 === 4,               // a handful of "agent" nodes
        phase: Math.random() * Math.PI * 2,
      };
    }

    // --- DNA double helix ---------------------------------------------------
    function drawHelix(t) {
      if (!helixScale) { helix = []; return; }
      const narrow = w < 760;
      const R = (narrow ? 34 : 84) * helixScale;          // helix radius
      const pitch = (narrow ? 150 : 230) * helixScale;    // px per full turn
      const cx = narrow ? w * .94 : w * .74;
      const tilt = -0.30;                                  // radians; more negative = top leans further left
      const step = narrow ? 9 : 7;
      const spin = reduce ? 0 : t * 0.35;
      helix = [];
      ctx.save();
      ctx.translate(cx, h / 2); ctx.rotate(tilt); ctx.translate(-cx, -h / 2);
      const yStart = -h * .3, yEnd = h * 1.3;
      let k = 0;
      for (let y = yStart; y < yEnd; y += step, k++) {
        const th = (y / pitch) * Math.PI * 2 + spin;
        const za = Math.sin(th), zb = Math.sin(th + Math.PI);
        const xa = cx + R * Math.cos(th), xb = cx + R * Math.cos(th + Math.PI);
        // base-pair rungs every 5th step
        if (k % 5 === 0) {
          const g = ctx.createLinearGradient(xa, y, xb, y);
          g.addColorStop(0, `rgba(143,216,239,${.10 + .12 * (za + 1) / 2})`);
          g.addColorStop(1, `rgba(255,215,153,${.10 + .12 * (zb + 1) / 2})`);
          ctx.strokeStyle = g; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(xb, y); ctx.stroke();
        }
        dot(xa, y, za, 143, 216, 239);
        dot(xb, y, zb, 255, 215, 153);
        if (k % 3 === 0) helix.push({ x: xa, y, z: za });
      }
      ctx.restore();
      // helix points are in rotated space; store them transformed for agent links
      const cos = Math.cos(tilt), sin = Math.sin(tilt);
      helix = helix.map(p => {
        const dx = p.x - cx, dy = p.y - h / 2;
        return { x: cx + dx * cos - dy * sin, y: h / 2 + dx * sin + dy * cos, z: p.z };
      });
    }
    function dot(x, y, z, r, g, b) {
      const depth = (z + 1) / 2;                           // 0 = behind, 1 = in front
      ctx.fillStyle = `rgba(${r},${g},${b},${.18 + .55 * depth})`;
      ctx.beginPath(); ctx.arc(x, y, 1.1 + 1.9 * depth, 0, Math.PI * 2); ctx.fill();
    }

    // --- agent network ------------------------------------------------------
    function step(now) {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      drawHelix(t);
      for (const n of nodes) {
        if (!reduce) {
          n.x += n.vx; n.y += n.vy;
          if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
          if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
        }
      }
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            const k = 1 - Math.sqrt(d2) / LINK;
            ctx.strokeStyle = (a.amber || b.amber) ? `rgba(255,176,0,${.28 * k})` : `rgba(160,205,255,${.15 * k})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      // agents "read" the helix: link each amber node to its nearest front-facing base
      if (helix.length) {
        for (const n of nodes) {
          if (!n.amber) continue;
          let best = null, bd = 160 * 160;
          for (const p of helix) {
            if (p.z < 0) continue;
            const dx = n.x - p.x, dy = n.y - p.y, d2 = dx * dx + dy * dy;
            if (d2 < bd) { bd = d2; best = p; }
          }
          if (best) {
            const k = 1 - Math.sqrt(bd) / 160;
            ctx.strokeStyle = `rgba(255,176,0,${.12 + .35 * k})`; ctx.lineWidth = 1;
            ctx.setLineDash([3, 5]);
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(best.x, best.y); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = `rgba(255,176,0,${.5 + .5 * k})`;
            ctx.beginPath(); ctx.arc(best.x, best.y, 2.4, 0, Math.PI * 2); ctx.fill();
          }
        }
      }
      for (const n of nodes) {
        if (n.amber) {
          const pulse = (Math.sin(t * 2 + n.phase) + 1) / 2;
          ctx.fillStyle = `rgba(255,176,0,${.10 + .18 * pulse})`;
          ctx.beginPath(); ctx.arc(n.x, n.y, 6 + 6 * pulse, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#ffb000";
          ctx.beginPath(); ctx.arc(n.x, n.y, 2.6, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = "rgba(255,255,255,.55)";
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
        }
      }
      if (!reduce && visible) raf = requestAnimationFrame(step);
    }
    function start() { cancelAnimationFrame(raf); raf = requestAnimationFrame(step); }

    resize(); start();
    let rt = 0;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { resize(); start(); }, 120); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; if (visible) start(); })).observe(canvas);
    }
    document.addEventListener("visibilitychange", () => { visible = !document.hidden; if (visible) start(); });
  });
})();
