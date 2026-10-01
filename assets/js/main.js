/* AiLIFE website — shared rendering logic.
 * Reads window.AILIFE (from assets/data/seminars.js) and fills in
 * elements marked with data-ailife="..." attributes. No build step needed. */
(function () {
  "use strict";
  const S = window.AILIFE;
  if (!S) return;

  const TZ = S.series.timezone || "Europe/Helsinki";
  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const MONTHS_LONG = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  // --- helpers -------------------------------------------------------------
  function toDate(sem, which) {
    // Build a Date for the seminar start/end in Helsinki time.
    // We render dates by parts, so we only need a comparable instant here.
    const [y, m, d] = sem.date.split("-").map(Number);
    const [hh, mm] = (sem[which || "start"] || "13:00").split(":").map(Number);
    // Approximate Helsinki offset (EET/EEST). Good enough for "is it past?".
    const utc = Date.UTC(y, m - 1, d, hh, mm);
    const probe = new Date(utc);
    const offsetMin = helsinkiOffsetMinutes(probe);
    return new Date(utc - offsetMin * 60000);
  }
  function helsinkiOffsetMinutes(date) {
    try {
      const f = new Intl.DateTimeFormat("en-US", { timeZone: TZ, timeZoneName: "shortOffset" });
      const part = f.formatToParts(date).find(p => p.type === "timeZoneName");
      const m = part && /GMT([+-]\d+)(?::(\d+))?/.exec(part.value);
      if (m) return Number(m[1]) * 60 + (m[2] ? Math.sign(Number(m[1])) * Number(m[2]) : 0);
    } catch (e) { /* fall through */ }
    return 120;
  }
  function parts(sem) {
    const [y, m, d] = sem.date.split("-").map(Number);
    const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    return { y, m, d, dow, mon: MONTHS[m - 1], monLong: MONTHS_LONG[m - 1], day: DAYS[dow] };
  }
  function longDate(sem) { const p = parts(sem); return `${p.day} ${p.d} ${p.monLong} ${p.y}`; }
  function shortDate(sem) { const p = parts(sem); return `${p.d} ${p.mon} ${p.y}`; }
  function timeRange(sem) { return `${sem.start || "13:00"}–${sem.end || "14:00"}`; }
  function venueOf(sem) { return S.venues[sem.venue] || { name: sem.venue || "TBA" }; }
  function speakersText(sem) {
    if (!sem.speakers || !sem.speakers.length) return "Speaker to be announced";
    return sem.speakers.map(s => s.name).join(" & ");
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
  function isPast(sem, now) { return toDate(sem, "end") < now; }
  function isToday(sem, now) {
    const f = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
    return f.format(now) === sem.date;
  }
  function googleCalUrl(sem) {
    const v = venueOf(sem);
    const d = sem.date.replace(/-/g, "");
    const st = (sem.start || "13:00").replace(":", "") + "00";
    const en = (sem.end || "14:00").replace(":", "") + "00";
    const title = `${S.series.name}: ${speakersText(sem)}` + (sem.title && sem.title !== "TBA" ? ` — ${sem.title}` : "");
    const details = S.series.fullName + (sem.radar ? `\nAiLIFE Radar: ${sem.radar}` : "") + (sem.zoom || S.series.zoom ? `\nZoom: ${sem.zoom || S.series.zoom}` : "");
    const loc = [v.name, v.room, v.address].filter(Boolean).join(", ");
    const q = new URLSearchParams({ action: "TEMPLATE", text: title, dates: `${d}T${st}/${d}T${en}`, ctz: TZ, details, location: loc });
    return "https://calendar.google.com/calendar/render?" + q.toString();
  }
  function speakersHtml(sem) {
    if (!sem.speakers || !sem.speakers.length) return `<span class="speaker"><strong>Speaker to be announced</strong></span>`;
    return sem.speakers.map(x => `<span class="speaker">${x.photo ? `<img class="speaker-photo" src="${esc(x.photo)}" alt="" loading="lazy">` : ""}<span class="speaker-text"><strong>${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.name)}</a>` : esc(x.name)}</strong>${x.affiliation ? `<span class="speaker-aff">${esc(x.affiliation)}</span>` : ""}</span></span>`).join("");
  }
  function localTimeLine(sem) {
    // Secondary line with the viewer's own time zone, only if it differs from Helsinki.
    try {
      const viewerTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!viewerTZ || viewerTZ === TZ) return "";
      const f = new Intl.DateTimeFormat("en-GB", { timeZone: viewerTZ, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
      return `<p class="hero-localtime">In your time zone (${esc(viewerTZ)}): ${esc(f.format(toDate(sem, "start")))} – ${esc(new Intl.DateTimeFormat("en-GB", { timeZone: viewerTZ, hour: "2-digit", minute: "2-digit" }).format(toDate(sem, "end")))}</p>`;
    } catch (e) { return ""; }
  }
  function statusBadge(sem) {
    if (sem.status === "cancelled") return `<span class="badge badge-cancelled">Cancelled</span>`;
    if (sem.status === "tentative") return `<span class="badge badge-tentative">Date reserved · details to follow</span>`;
    return `<span class="badge badge-confirmed">Confirmed</span>`;
  }

  const now = new Date();
  const all = S.seminars.slice().sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = all.filter(s => !isPast(s, now) && s.status !== "cancelled");
  const past = all.filter(s => isPast(s, now)).reverse();
  const next = upcoming[0] || null;

  // --- Next seminar hero (index.html) -------------------------------------
  const heroEl = document.querySelector('[data-ailife="next"]');
  if (heroEl) {
    if (!next) {
      heroEl.innerHTML = `<p class="hero-kicker">Next seminar</p>
        <h2 class="hero-title">The ${S.series.season} programme has concluded</h2>
        <p class="hero-lead">Thank you for joining us. Browse the <a href="past.html">archive of past seminars</a> or <a href="join.html">join the mailing list</a> to hear about the next season.</p>`;
    } else {
      const v = venueOf(next);
      const p = parts(next);
      const today = isToday(next, now);
      const sp = speakersHtml(next);
      const zoom = next.zoom || S.series.zoom;
      heroEl.innerHTML = `
        <div class="hero-date-block" aria-hidden="true">
          <span class="hero-date-day">${p.d}</span>
          <span class="hero-date-mon">${p.mon} ${p.y}</span>
          <span class="hero-date-time">${esc(timeRange(next))}</span>
        </div>
        <div class="hero-body">
          <p class="hero-kicker">${today ? "Today" : "Next seminar"} <span class="sr-only">on</span> <span class="hero-kicker-date">${esc(longDate(next))}, ${esc(timeRange(next))} (Helsinki time)</span></p>
          <h2 class="hero-title">${esc(next.title && next.title !== "TBA" ? next.title : "Title to be announced")}</h2>
          <div class="hero-speakers">${sp}</div>
          ${next.radar ? `<p class="hero-radar"><span class="radar-dot" aria-hidden="true"></span><strong>AiLIFE Radar:</strong> ${esc(next.radar)}</p>` : ""}
          ${next.notice ? `<p class="notice">${esc(next.notice)}</p>` : ""}
          <p class="hero-venue">
            <svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>
            ${v.mapUrl ? `<a href="${esc(v.mapUrl)}" target="_blank" rel="noopener">${esc(v.name)}${v.room ? ", " + esc(v.room) : ""}</a>` : esc(v.name)}${v.campus ? ` · ${esc(v.campus)}` : ""}
            <span class="hybrid-pill">+ Zoom (hybrid)</span>
          </p>
          ${localTimeLine(next)}
          <div class="hero-actions">
            ${next.abstract ? `<a class="btn btn-primary" href="program.html#${esc(next.id)}">Read the abstract</a>` : ""}
            ${zoom ? `<a class="btn btn-primary" href="${esc(zoom)}" target="_blank" rel="noopener">Join on Zoom</a>` : `<a class="btn btn-primary" href="join.html">How to attend</a>`}
            <a class="btn btn-ghost" href="${googleCalUrl(next)}" target="_blank" rel="noopener">Add to Google Calendar</a>
            <a class="btn btn-ghost" href="ailife.ics" download>Subscribe (.ics)</a>
          </div>
          ${next.status !== "confirmed" ? `<p class="hero-status">${statusBadge(next)}</p>` : ""}
        </div>`;
    }
  }

  // --- "Also coming up" strip (index.html) --------------------------------
  const stripEl = document.querySelector('[data-ailife="upcoming-strip"]');
  if (stripEl) {
    const rest = upcoming.slice(1, 4);
    if (!rest.length) { stripEl.closest("section") && stripEl.closest("section").remove(); }
    else stripEl.innerHTML = rest.map(s => `
      <a class="mini-card" href="program.html#${esc(s.id)}">
        <span class="mini-date">${esc(shortDate(s))}</span>
        <span class="mini-speaker">${esc(speakersText(s))}</span>
        <span class="mini-title">${esc(s.title && s.title !== "TBA" ? s.title : "Title TBA")}</span>
      </a>`).join("");
  }

  // --- Full programme list (program.html) ---------------------------------
  function seminarCard(s, opts) {
    opts = opts || {};
    const v = venueOf(s);
    const p = parts(s);
    const pastCls = opts.past ? " is-past" : "";
    const sp = speakersHtml(s);
    const links = [];
    if (s.recording) links.push(`<a class="btn btn-small" href="${esc(s.recording)}" target="_blank" rel="noopener">▶ Recording</a>`);
    if (s.slides) links.push(`<a class="btn btn-small" href="${esc(s.slides)}" target="_blank" rel="noopener">Slides</a>`);
    if (!opts.past && s.status !== "cancelled") {
      links.push(`<a class="btn btn-small" href="${googleCalUrl(s)}" target="_blank" rel="noopener">Add to calendar</a>`);
      const z = s.zoom || S.series.zoom; if (z) links.push(`<a class="btn btn-small" href="${esc(z)}" target="_blank" rel="noopener">Zoom</a>`);
    }
    const details = (s.abstract || s.bio) ? `
      <details class="abstract"><summary>Abstract${s.bio ? " & speaker bio" : ""}</summary>
        ${s.abstract ? `<div class="abstract-text">${s.abstract}</div>` : ""}
        ${s.bio ? `<div class="bio-text"><h4>About the speaker</h4>${s.bio}</div>` : ""}
      </details>` : "";
    return `
      <article class="sem-card${pastCls}${s.status === "cancelled" ? " is-cancelled" : ""}" id="${esc(s.id)}">
        <div class="sem-date" aria-label="${esc(longDate(s))}">
          <span class="sem-date-day">${p.d}</span>
          <span class="sem-date-mon">${p.mon}</span>
          <span class="sem-date-year">${p.y}</span>
        </div>
        <div class="sem-body">
          <p class="sem-meta">${esc(p.day)} · ${esc(timeRange(s))} · ${v.mapUrl ? `<a href="${esc(v.mapUrl)}" target="_blank" rel="noopener">${esc(v.name)}</a>` : esc(v.name)}${v.room ? ", " + esc(v.room) : ""} · hybrid ${s.status !== "confirmed" ? statusBadge(s) : ""}${s.recording ? ` <span class="badge badge-recording">Recording available</span>` : ""}</p>
          <h3 class="sem-title">${esc(s.title && s.title !== "TBA" ? s.title : "Title to be announced")}</h3>
          ${s.notice ? `<p class="notice">${esc(s.notice)}</p>` : ""}
          <div class="sem-speakers">${sp}</div>
          ${s.radar ? `<p class="sem-radar"><span class="radar-dot" aria-hidden="true"></span><strong>AiLIFE Radar:</strong> ${esc(s.radar)}</p>` : ""}
          ${s.tags && s.tags.length ? `<p class="tags">${s.tags.map(t => `<span class="tag">${esc(t)}</span>`).join("")}</p>` : ""}
          ${details}
          ${links.length ? `<p class="sem-links">${links.join(" ")}</p>` : ""}
        </div>
      </article>`;
  }

  const progEl = document.querySelector('[data-ailife="program"]');
  if (progEl) {
    progEl.innerHTML = upcoming.length
      ? upcoming.map(s => seminarCard(s)).join("")
      : `<p class="empty">No upcoming seminars are scheduled right now. See the <a href="past.html">archive</a>.</p>`;
  }

  // --- Past seminars archive, grouped by season/year (past.html) ----------
  const pastEl = document.querySelector('[data-ailife="past"]');
  if (pastEl) {
    if (!past.length) {
      pastEl.innerHTML = `<p class="empty">The series starts on <strong>${esc(longDate(all[0]))}</strong>. Past seminars, speakers and recordings will be archived here after each session.</p>`;
    } else {
      // Academic season: Aug–Jul
      const groups = {};
      past.forEach(s => {
        const p = parts(s);
        const seasonStart = p.m >= 8 ? p.y : p.y - 1;
        const key = `${seasonStart}–${seasonStart + 1}`;
        (groups[key] = groups[key] || []).push(s);
      });
      pastEl.innerHTML = Object.keys(groups).sort().reverse().map(k => `
        <section class="season">
          <h2 class="season-title">Season ${esc(k)} <span class="count">${groups[k].length} seminar${groups[k].length > 1 ? "s" : ""}</span></h2>
          ${groups[k].map(s => seminarCard(s, { past: true })).join("")}
        </section>`).join("");
    }
  }

  // --- Stats (any page) ----------------------------------------------------
  document.querySelectorAll('[data-ailife="count-past"]').forEach(el => el.textContent = past.length);
  document.querySelectorAll('[data-ailife="count-upcoming"]').forEach(el => el.textContent = upcoming.length);
  document.querySelectorAll('[data-ailife="next-date"]').forEach(el => el.textContent = next ? longDate(next) : "TBA");
  document.querySelectorAll('[data-ailife="zoom-link"]').forEach(el => {
    const z = S.series.zoom;
    if (z) { el.innerHTML = `<a href="${esc(z)}" target="_blank" rel="noopener">${esc(z)}</a>`; }
    else { el.textContent = "The Zoom link is sent to the mailing list before each seminar."; }
  });
  document.querySelectorAll('[data-ailife="webcal"]').forEach(el => {
    if (location.protocol === "http:" || location.protocol === "https:") {
      const u = new URL("ailife.ics", location.href);
      el.innerHTML = `<a href="webcal://${esc(u.host + u.pathname)}">webcal://${esc(u.host + u.pathname)}</a>`;
    } else { el.innerHTML = `<a href="ailife.ics" download>ailife.ics</a>`; }
  });
  document.querySelectorAll('[data-ailife="mailing-list"]').forEach(el => { if (S.series.mailingList) el.setAttribute("href", S.series.mailingList); });
  document.querySelectorAll('[data-ailife="contact-email"]').forEach(el => { el.setAttribute("href", "mailto:" + S.series.contactEmail); el.textContent = S.series.contactEmail; });

  // --- Nav: mark current page, mobile toggle -------------------------------
  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a").forEach(a => { if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page"); });
  const toggle = document.querySelector(".nav-toggle");
  if (toggle) toggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // Footer year
  document.querySelectorAll('[data-ailife="year"]').forEach(el => el.textContent = new Date().getFullYear());
})();
