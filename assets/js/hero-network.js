/* AiLIFE hero background: a slowly drifting "agent network".
 * Nodes connect when close; a few amber nodes pulse like the AiLIFE Radar.
 * Pure canvas, no dependencies. Renders a single still frame when the
 * visitor prefers reduced motion, and pauses when the hero is off-screen. */
(function () {
  "use strict";
  const canvases = document.querySelectorAll("canvas[data-network]");
  if (!canvases.length) return;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  canvases.forEach(canvas => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const density = Number(canvas.dataset.network) || 1;
    let w = 0, h = 0, dpr = 1, nodes = [], raf = 0, visible = true, t0 = performance.now();
    const LINK = 130;

    function resize() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(110, Math.max(28, (w * h) / 14000)) * density);
      // Keep existing nodes where possible so resizing does not "jump".
      while (nodes.length < n) nodes.push(makeNode(nodes.length));
      nodes.length = n;
    }
    function makeNode(i) {
      return {
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18,
        r: Math.random() * 1.4 + .8,
        amber: i % 23 === 4,               // a handful of "radar" nodes
        phase: Math.random() * Math.PI * 2,
      };
    }
    function step(now) {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        if (!reduce) {
          n.x += n.vx; n.y += n.vy;
          if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
          if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
        }
      }
      // edges
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            const k = 1 - Math.sqrt(d2) / LINK;
            ctx.strokeStyle = (a.amber || b.amber) ? `rgba(255,176,0,${.28 * k})` : `rgba(160,205,255,${.16 * k})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      // nodes
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
