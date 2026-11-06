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
//   venue       key in AILIFE.venues: "biomedicum" (BM1 seminar rooms 1-2), "biomedicum3" (BM1 seminar room 3), "biocenter3" (Biocenter 3, Viikki), "viikki", "online", "tba" (not yet confirmed)
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
  biocenter3: {
    name: "Biocenter 3",
    room: "Seminar rooms 3401 & 3402",
    address: "Viikinkaari 1, 00790 Helsinki",
    campus: "Viikki campus",
    mapUrl: "https://maps.google.com/?q=Biocenter+3,+Viikinkaari+1,+00790+Helsinki",
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
    radar: "",
    radarItems: [],
    venue: "biomedicum",
    registration: "https://elomake.helsinki.fi/lomakkeet/141857/lomake.html",
    zoom: "",
    recording: "",
    slides: "",
    tags: ["opening session"],
  },
  {
    id: "2026-11-24",
    date: "2026-11-24",
    start: "13:00",
    end: "14:00",
    status: "confirmed",
    speakers: [
      { name: "Esa Pitkänen", affiliation: "FIMM, University of Helsinki", url: "https://mlbiomed.net/profiles.html#esa-pitkanen", photo: "assets/img/people/esa-pitkanen.jpg" },
    ],
    title: "AI Agents for Life Sciences: From Ad Hoc Software to Automated Computational Method Development",
    abstract: "Modern AI agents are language models that pursue a goal by repeatedly deciding what to do next, using tools, and autonomously reacting to observations. In my talk, I will discuss the use of AI agents in life sciences to develop computational methods and analyses, and to analyze and interpret data in an automated fashion. Our group's experiences utilizing AI agents to create ad hoc software and tools for a single task or dataset, will be covered. I will then introduce MuFM, a foundation model for somatic variants whose development process has been semi-automated and agent-driven. The talk concludes with the prospects of fully automating computational method development and data analysis for life sciences.",
    bio: "",
    venue: "biomedicum3",
    registration: "",
    zoom: "",
    recording: "",
    slides: "",
    tags: [],
  },
  {
    id: "2026-12-15",
    date: "2026-12-15",
    start: "14:00",
    end: "15:00",
    status: "confirmed",
    speakers: [
      { name: "Laura Ruotsalainen", affiliation: "Department of Computer Science, University of Helsinki", url: "https://researchportal.helsinki.fi/fi/persons/laura-ruotsalainen/", photo: "assets/img/people/laura-ruotsalainen.jpg" },
    ],
    title: "TBA",
    abstract: "",
    bio: "",
    venue: "biocenter3",
    registration: "",
    zoom: "",
    recording: "",
    slides: "",
    tags: [],
  },
  { id: "2027-01-26", date: "2027-01-26", start: "13:00", end: "14:00", status: "tentative", speakers: [], title: "TBA", venue: "tba", tags: [] },
  { id: "2027-02-23", date: "2027-02-23", start: "13:00", end: "14:00", status: "tentative", speakers: [], title: "TBA", venue: "tba", tags: [] },
  { id: "2027-03-23", date: "2027-03-23", start: "13:00", end: "14:00", status: "tentative", speakers: [], title: "TBA", venue: "tba", tags: [] },
  { id: "2027-04-13", date: "2027-04-13", start: "13:00", end: "14:00", status: "tentative", speakers: [], title: "TBA", venue: "tba", tags: [] },
  { id: "2027-05-11", date: "2027-05-11", start: "13:00", end: "14:00", status: "tentative", speakers: [], title: "TBA", venue: "tba", tags: [] },
  { id: "2027-06-08", date: "2027-06-08", start: "13:00", end: "14:00", status: "tentative", speakers: [], title: "TBA", venue: "tba", tags: [] },
];
