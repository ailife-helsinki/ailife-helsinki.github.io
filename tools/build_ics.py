#!/usr/bin/env python3
"""Generate ailife.ics (whole series) from assets/data/seminars.js.

Run from the project root:  python3 tools/build_ics.py
No third-party dependencies. The JS data file is parsed by evaluating it as
JSON-ish via a tiny regex-free approach: we extract the AILIFE.seminars array
with a small JS-to-JSON cleanup, so keep the data file simple (no functions).
"""
import json, re, sys, pathlib, datetime as dt

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "data" / "seminars.js"
OUT = ROOT / "ailife.ics"

def js_block(src, name):
    m = re.search(r"AILIFE\.%s\s*=\s*(\{.*?\}|\[.*?\]);\n" % re.escape(name), src, re.S)
    if not m:
        sys.exit(f"could not find AILIFE.{name} in {SRC}")
    txt = m.group(1)
    txt = re.sub(r"^\s*//[^\n]*", "", txt, flags=re.M)  # strip full-line comments
    txt = re.sub(r",\s*([}\]])", r"\1", txt)           # trailing commas
    txt = re.sub(r"([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:", r'\1"\2":', txt)  # quote keys
    return json.loads(txt)

def esc(s):
    return s.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")

def main():
    src = SRC.read_text(encoding="utf8")
    series = js_block(src, "series")
    venues = js_block(src, "venues")
    seminars = js_block(src, "seminars")
    now = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    lines = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//AiLIFE seminar series//EN",
        "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
        f"X-WR-CALNAME:{esc(series['name'])} seminar series",
        f"X-WR-TIMEZONE:{series['timezone']}",
        "BEGIN:VTIMEZONE", "TZID:Europe/Helsinki",
        "BEGIN:DAYLIGHT", "TZOFFSETFROM:+0200", "TZOFFSETTO:+0300", "TZNAME:EEST",
        "DTSTART:19700329T030000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU", "END:DAYLIGHT",
        "BEGIN:STANDARD", "TZOFFSETFROM:+0300", "TZOFFSETTO:+0200", "TZNAME:EET",
        "DTSTART:19701025T040000", "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU", "END:STANDARD",
        "END:VTIMEZONE",
    ]
    for s in seminars:
        if s.get("status") == "cancelled":
            continue
        d = s["date"].replace("-", "")
        st = s.get("start", "13:00").replace(":", "") + "00"
        en = s.get("end", "14:00").replace(":", "") + "00"
        v = venues.get(s.get("venue", ""), {})
        who = ", ".join(sp["name"] for sp in s.get("speakers", [])) or "Speaker TBA"
        title = s.get("title") or "TBA"
        summary = f"{series['name']}: {who}" + (f" — {title}" if title != "TBA" else "")
        loc = ", ".join(x for x in [v.get("name"), v.get("room"), v.get("address")] if x)
        desc = series["fullName"]
        if s.get("radar"):
            desc += f"\nAiLIFE Radar: {s['radar']}"
        if s.get("abstract"):
            desc += "\n\n" + re.sub(r"<[^>]+>", "", s["abstract"])
        if s.get("registration"):
            desc += f"\nRegistration: {s['registration']}"
        zoom = s.get("zoom") or series.get("zoom")
        if zoom:
            desc += f"\nZoom: {zoom}"
        lines += [
            "BEGIN:VEVENT",
            f"UID:{s['id']}@ailife.helsinki",
            f"DTSTAMP:{now}",
            f"DTSTART;TZID=Europe/Helsinki:{d}T{st}",
            f"DTEND;TZID=Europe/Helsinki:{d}T{en}",
            f"SUMMARY:{esc(summary)}",
            f"LOCATION:{esc(loc)}",
            f"DESCRIPTION:{esc(desc)}",
            f"STATUS:{'TENTATIVE' if s.get('status') == 'tentative' else 'CONFIRMED'}",
            "END:VEVENT",
        ]
    lines.append("END:VCALENDAR")
    # fold long lines per RFC 5545
    out = []
    for l in lines:
        b = l.encode("utf8")
        while len(b) > 73:
            out.append(b[:73].decode("utf8", "ignore")); b = b" " + b[73:]
        out.append(b.decode("utf8"))
    OUT.write_text("\r\n".join(out) + "\r\n", encoding="utf8")
    print(f"wrote {OUT} with {sum(1 for s in seminars if s.get('status')!='cancelled')} events")

if __name__ == "__main__":
    main()
