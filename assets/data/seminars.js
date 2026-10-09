// ---------------------------------------------------------------------------
// AiLIFE seminar data — the single source of truth for the whole website.
//
// To add or update a seminar, edit this file only. The home page picks the
// next upcoming seminar automatically from the dates below, program.html lists
// everything, and past.html shows everything whose date has passed.
//
// Field reference (all strings unless noted):
//   id          unique slug, used for anchors, e.g. "2026-10-27"
//   date        ISO date "YYYY-MM-DD"
//   start/end   24h local time (Europe/Helsinki), e.g. "13:00"
//   status      "confirmed" | "tentative" | "cancelled"
//   speakers    array of { name, affiliation, url (optional), photo (optional, e.g. "assets/img/speakers/name.jpg") }
//   title       talk title ("TBA" if not yet known)
//   abstract    plain text / simple HTML, optional
//   bio         speaker bio, optional
//   radar       who gave the 10-15 min "AiLIFE Radar" opener, optional
//   radarItems  the Radar round-up, shown on past.html once filled in, optional:
//               [{ title: "ESM3 released", url: "https://...", note: "one-line why it matters" }, ...]
//   venue       key in AILIFE.venues: "biomedicum" (BM1 seminar rooms 1-2), "biomedicum3" (BM1 seminar room 3), "viikki", "online", "tba" (not yet confirmed)
//   notice      short highlighted message, optional (e.g. "Room changed to Hall 2")
//   registration  sign-up form URL, optional (shows a "Register" button when set)
//   zoom        URL string, optional (leave "" until announced)
//   recording   URL string, optional (filled in after the talk)
//   slides      URL string, optional
//   tags        array of short topic strings, optional
// ---------------------------------------------------------------------------

window.AILIFE = window.AILIFE || {};

AILIFE.series = {
  name: "AiLIFE",
  fullName: "AiLIFE: Accelerating Life Sciences with AI and Agents",
  season: "2026–2027",
  cadence: "Monthly, Tuesdays 13:00–14:00 (Helsinki time)",
  timezone: "Europe/Helsinki",
  // General Zoom link for the hybrid stream. Leave empty until announced.
  zoom: "",
  // Mailing list signup — set to the real list page (or a mailto:) when available;
  // until then the links point to the organizers page.
  mailingList: "organizers.html",
  // Contact e-mail is intentionally empty: the site says "contact the organizers".
  contactEmail: "",
};

AILIFE.venues = {
  biomedicum: {
    name: "Biomedicum Helsinki 1",
    room: "Seminar rooms 1–2",
    address: "Haartmaninkatu 8, 00290 Helsinki",
    campus: "Meilahti campus",
    mapUrl: "https://maps.google.com/?q=Biomedicum+Helsinki+1,+Haartmaninkatu+8,+00290+Helsinki",
  },
  biomedicum3: {
    name: "Biomedicum Helsinki 1",
    room: "Seminar room 3",
    address: "Haartmaninkatu 8, 00290 Helsinki",
    campus: "Meilahti campus",
    mapUrl: "https://maps.google.com/?q=Biomedicum+Helsinki+1,+Haartmaninkatu+8,+00290+Helsinki",
  },
  viikki: {
    name: "Viikki campus",
    room: "TBA",
    address: "Viikinkaari, 00790 Helsinki",
    campus: "Viikki campus",
    mapUrl: "https://maps.google.com/?q=Viikki+campus,+University+of+Helsinki",
  },
  // Placeholder until the campus and room are confirmed (Meilahti or Viikki).
  tba: {
    name: "Location to be confirmed",
    room: "",
    address: "",
    campus: "",
    mapUrl: "",
  },
  online: {
    name: "Online (Zoom)",
    room: "",
    address: "",
    campus: "",
    mapUrl: "",
  },
};

AILIFE.seminars = [
  {
    id: "2026-10-27",
    date: "2026-10-27",
    start: "13:00",
    end: "14:00",
    status: "confirmed",
    speakers: [
      { name: "Olli Kallioniemi", affiliation: "FIMM, University of Helsinki", url: "https://researchportal.helsinki.fi/en/persons/olli-kallioniemi/", photo: "assets/img/people/olli-kallioniemi.jpg" },
    ],
    title: "Towards AI-Native Molecular Medicine Research: A Life Scientist's Perspective",
    abstract: "",
    bio: "",
    radar: "Esa Pitkänen — introduction to the series and the month in AI",
    radarItems: [],
    venue: "biomedicum",
    registration: "https://elomake.helsinki.fi/lomakkeet/141857/lomake.html",
    zoom: "",
    recording: "",
    slides: "",
    tags: ["opening session"],
  },
  { id: "2026-11-24", date: "2026-11-24", start: "13:00", end: "14:00", status: "tentative", speakers: [], title: "TBA", venue: "tba", tags: [] },
  { id: "2026-12-22", date: "2026-12-22", start: "13:00", end: "14:00", status: "tentative", speakers: [], title: "TBA", venue: "tba", tags: [] },
  { id: "2027-01-26", date: "2027-01-26", start: "13:00", end: "14:00", status: "tentative", speakers: [], title: "TBA", venue: "tba", tags: [] },
  { id: "2027-02-23", date: "2027-02-23", start: "13:00", end: "14:00", status: "tentative", speakers: [], title: "TBA", venue: "tba", tags: [] },
  { id: "2027-03-23", date: "2027-03-23", start: "13:00", end: "14:00", status: "tentative", speakers: [], title: "TBA", venue: "tba", tags: [] },
  { id: "2027-04-13", date: "2027-04-13", start: "13:00", end: "14:00", status: "tentative", speakers: [], title: "TBA", venue: "tba", tags: [] },
  { id: "2027-05-11", date: "2027-05-11", start: "13:00", end: "14:00", status: "tentative", speakers: [], title: "TBA", venue: "tba", tags: [] },
  { id: "2027-06-08", date: "2027-06-08", start: "13:00", end: "14:00", status: "tentative", speakers: [], title: "TBA", venue: "tba", tags: [] },
];
