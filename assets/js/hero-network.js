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
    const tiltRad = canvas.dataset.tilt !== undefined ? Number(canvas.dataset.tilt) : -0.30;
    // Helix centre (desktop): the smaller of a fraction of the screen width and the
    // right edge of the 1160px content column plus an offset. Laptops get the
    // fraction, large monitors stay close to the content instead of drifting right.
    const cxMax = canvas.dataset.cxMax !== undefined ? Number(canvas.dataset.cxMax) : 0.80;
    const cxOff = canvas.dataset.cxOff !== undefined ? Number(canvas.dataset.cxOff) : 40;
    let w = 0, h = 0, dpr = 1, nodes = [], helix = [], raf = 0, visible = true, t0 = performance.now();
    const LINK = 130;

    function resize() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(60, Math.max(16, (w * h) / 24000)) * density);
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
    // Base pairs follow the first 375 nt of the human TP53 coding sequence
    // (translates to p53 MEEPQSDPSVEPPLSQ...). Each rung is drawn as its
    // hydrogen bonds: A–T pairs get 2 thin lines, G–C pairs get 3.
    const SEQ = "ATGGAGGAGCCGCAGTCAGATCCTAGCGTCGAGCCCCCTCTGAGTCAGGAAACATTTTCAGACCTATGGAAACTACTTCCTGAAAACAACGTTCTGTCCCCCTTGCCGTCCCAAGCAATGGATGATTTGATGCTGTCCCCGGACGATATTGAACAATGGTTCACTGAAGACCCAGGTCCAGATGAAGCTCCCAGAATGCCAGAGGCTGCTCCCCCCGTGGCCCCTGCACCAGCAGCTCCTACACCGGCGGCCCCTGCACCAGCCCCCTCCTGGCCCCTGTCATCTTCTGTCCCTTCCCAGAAAACCTACCAGGGCAGCTACGGTTTCCGTCTGGGCTTCTTGCATTCTGGGACAGCCAAGTCTGTGACTTGCACG";
    function drawHelix(t) {
      if (!helixScale) { helix = []; return; }
      const narrow = w < 760;
      // Proportions follow B-DNA: pitch ≈ 1.7 × diameter (3.4 nm vs 2 nm) and
      // ~10 base pairs per turn. The strands are drawn 180° apart (symmetric)
      // rather than the real ~130° groove offset, which reads as busier.
      const R = (narrow ? 22 : 54) * helixScale;          // helix radius
      const pitch = R * 2 * 1.75;                          // px per full turn
      const GROOVE = Math.PI;                              // strands opposite (180°): symmetric, calmer than real ~130° grooves
      const wrapRight = (w + Math.min(1160, w - 32)) / 2;
      const cx = narrow ? w * .94 : Math.min(w * cxMax, wrapRight + cxOff);
      const tilt = tiltRad;                                // radians; more negative = top leans further left (data-tilt)
      const step = pitch / 40;                             // 40 backbone dots per turn
      const spin = reduce ? 0 : t * 0.175;
      helix = [];
      ctx.save();
      ctx.translate(cx, h / 2); ctx.rotate(tilt); ctx.translate(-cx, -h / 2);
      const yStart = -h * .3, yEnd = h * 1.3;
      let k = 0;
      for (let y = yStart; y < yEnd; y += step, k++) {
        const th = (y / pitch) * Math.PI * 2 + spin;
        const za = Math.sin(th), zb = Math.sin(th + GROOVE);
        const xa = cx + R * Math.cos(th), xb = cx + R * Math.cos(th + GROOVE);
        // base-pair rungs: every 4th backbone dot = 10 per turn
        if (k % 4 === 0) {
          const base = SEQ[(k / 4) % SEQ.length];
          const bonds = (base === "G" || base === "C") ? 3 : 2;   // G–C: 3 H-bonds, A–T: 2
          const gap = 1.7;                                         // px between bond lines
          const g = ctx.createLinearGradient(xa, y, xb, y);
          g.addColorStop(0, `rgba(143,216,239,${.08 + .09 * (za + 1) / 2})`);
          g.addColorStop(1, `rgba(255,215,153,${.08 + .09 * (zb + 1) / 2})`);
          ctx.strokeStyle = g; ctx.lineWidth = .6;
          // bonds only in the middle of the rung, like hydrogen bonds between the bases
          const x0 = xa + (xb - xa) * .18, x1 = xa + (xb - xa) * .82;
          ctx.beginPath(); ctx.moveTo(xa, y); ctx.lineTo(x0, y); ctx.moveTo(x1, y); ctx.lineTo(xb, y); ctx.stroke();
          ctx.beginPath();
          for (let b = 0; b < bonds; b++) {
            const yy = y + (b - (bonds - 1) / 2) * gap;
            ctx.moveTo(x0, yy); ctx.lineTo(x1, yy);
          }
          ctx.stroke();
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
      ctx.fillStyle = `rgba(${r},${g},${b},${.10 + .32 * depth})`;
      ctx.beginPath(); ctx.arc(x, y, 1.0 + 1.5 * depth, 0, Math.PI * 2); ctx.fill();
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
