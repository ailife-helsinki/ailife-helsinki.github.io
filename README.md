# AiLIFE seminar series website

Static website for **AiLIFE: Accelerating Life Sciences with AI and Agents**, the monthly hybrid
seminar series organized by the MLBioMed group at FIMM and funded by HiLIFE and FIMM,
University of Helsinki.

No build tools or frameworks: plain HTML, CSS and a small JavaScript file. Open `index.html`
in a browser or host the folder on any static web server (GitHub Pages, UH web space, Netlify).

## Pages

| File | Purpose |
|---|---|
| `index.html` | Home: next-seminar card (picked automatically by date), "also coming up", about, hosts/sponsors |
| `program.html` | Full programme of upcoming seminars with calendar links, abstracts and Zoom links |
| `past.html` | Archive of past seminars grouped by season, with slides and recordings |
| `organizers.html` | Organizer bios and hosting institutions |
| `join.html` | Venue directions, Zoom/hybrid info, mailing list, calendar subscription |
| `ailife.ics` | Subscribable calendar for the whole series (generated, see below) |

## How to update the programme (the only file you normally edit)

All seminar data lives in **`assets/data/seminars.js`**. Every page reads it, so editing one
entry updates the home page, the programme, the archive and the calendar file.

```js
{
  id: "2026-11-24",            // unique slug, used in URLs (#2026-11-24)
  date: "2026-11-24",          // ISO date
  start: "13:00", end: "14:00",
  status: "confirmed",         // "confirmed" | "tentative" | "cancelled"
  speakers: [{ name: "Jane Doe", affiliation: "Aalto University", url: "https://...", photo: "assets/img/speakers/jane-doe.jpg" }],
  title: "Talk title",
  abstract: "<p>HTML or plain text</p>",
  bio: "<p>Speaker bio</p>",
  radar: "Heli Mönttinen",     // who gave the AiLIFE Radar opener
  radarItems: [                // the Radar round-up; appears on Past seminars once filled in
    { title: "ESM3 released", url: "https://...", note: "one line on why it matters" },
  ],
  venue: "biomedicum",         // key in AILIFE.venues ("biomedicum" | "viikki" | "online"); add new venues there
  notice: "",                  // optional highlighted message, e.g. "Room changed to Hall 2"
  zoom: "",                    // per-seminar Zoom link (falls back to AILIFE.series.zoom)
  recording: "", slides: "",   // fill in after the talk; the archive shows the buttons automatically
  tags: ["agents"],
}
```

* A seminar moves from the programme to the archive automatically once its end time has passed.
* Series-wide settings (general Zoom link, contact e-mail, mailing-list link) are in `AILIFE.series`.
* Speaker photos: drop a square JPG/PNG into `assets/img/speakers/` and reference it in `photo`.

After editing the data file, regenerate the calendar feed:

```bash
python3 tools/build_ics.py      # writes ailife.ics (no dependencies, Python 3)
```

## Design notes

* Colours follow the University of Helsinki brand: white dominant, black header/footer,
  UH blue `#005a94` as accent, plus one warm highlight (`#ffb000`) reserved for the
  next-seminar card and the AiLIFE Radar marker. All colours are CSS variables at the top
  of `assets/css/style.css`.
* Fonts: Inter (UI) and Fraunces (talk titles), loaded from Google Fonts. The site degrades
  to system fonts offline.
* Logos: `assets/img/ailife-logo.png` (series logo), `hilife-logo.png`, `fimm-logo.png`,
  `uh-logo.svg`, `mlbiomed-logo.svg`. Originals and extra variants are in `assets/brand/`.
  Official HiLIFE/FIMM/UH logo files should ideally be replaced with the versions from the
  UH Material Bank (staff login) before public launch.
* The `examples/` folder holds the 30 seminar-series websites surveyed while designing this
  site, with analysis and recommendations in `examples/README.md`. It is reference material
  only and can be deleted or excluded from deployment.

## Deploying on GitHub Pages

The site is published from the `main` branch of
`github.com/ailife-helsinki/ailife-helsinki.github.io` to https://ailife-helsinki.github.io.

1. Push to `main`; GitHub Pages rebuilds within a minute or two (Settings → Pages →
   Deploy from branch `main`, folder `/ (root)`). `.nojekyll` keeps Pages from running Jekyll.
2. `examples/`, `meta/` and `img/` are git-ignored and never published.
3. The site is public (no preview password, indexable by search engines).
4. For a custom domain (e.g. `ailife.mlbiomed.net`), add a `CNAME` file containing the
   domain and point a DNS CNAME record at `ailife-helsinki.github.io`.
5. The `webcal://` subscription address shown on the Attend page is built automatically
   from the site URL.
