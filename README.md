# Before the Bell: E-Rate Tracker

A curated, interactive tracker of the FCC's 2026 review of E-rate, the federal program that pays a
discounted share of internet access and internal networks for schools and libraries.

**Live site:** [minerclass.github.io/erate-tracker](https://minerclass.github.io/erate-tracker/)

The FCC's Notice of Proposed Rulemaking (FCC 26-41, WC Docket No. 26-133) asks whether E-rate should be
limited or sunset, limited to rural or single-provider areas, or narrowed in what it covers. Initial
comments are due **October 13, 2026**, and reply comments are due **November 12, 2026**.

The tracker starts from Stacy Hawthorne's CoSN article,
[Before a Single Student Logs On](https://www.cosn.org/before-a-single-student-logs-on/), and gathers the
FCC's own documents, the reporting, and the advocacy tools around it.

## What is on the page

- **Deadline countdown** to the comment and reply deadlines, calculated in Eastern time.
- **The morning, hour by hour:** a stepper through Hawthorne's account of what the network carries before
  any student logs on, with the federal and state mandates behind each system.
- **By the numbers:** eight figures, each linked to its source.
- **What the FCC is actually asking:** the key questions from the NPRM, quoted with paragraph numbers,
  plus each commissioner's position and the FCC's own statement that the June vote cut no one's funding.
- **The source tracker:** every source, filterable by type, searchable, and sortable.
- **Timeline** from the 1996 Telecommunications Act to the reply deadline, with a marker for today.
- **Comment worksheet:** a checklist and a few fields that assemble an editable comment starter. It runs
  entirely in the browser and saves a draft only on the visitor's own device.
- **Share kit:** a LinkedIn draft, a short post, a slide line, a QR code, and a full-screen presenter mode
  for conference slides (also reachable at [`#present`](https://minerclass.github.io/erate-tracker/#present)).

## Add or correct a source

Sources and the timeline live in [`data/sources.json`](data/sources.json). The page reads that file, so
adding a source means adding one object:

```json
{
  "id": "outlet-short-slug",
  "date": "2026-09-30",
  "type": "news",
  "angle": "A three-to-five word hook",
  "title": "Exact headline",
  "publisher": "Outlet",
  "author": "Byline",
  "url": "https://example.org/article",
  "summary": "Two or three sentences in your own words: what the piece adds and why a reader would open it."
}
```

- `type` is one of `fcc`, `advocacy`, `news`, `analysis`, `background`, or `tool`.
- Optional fields: `featured: true` to pin a source, and `dateLabel` to replace the formatted date
  (for example, `"May 2026"` or `"Open now"`).
- Update `"updated"` at the top of the file. The result counts on the page are computed, so nothing else
  needs to change.

Readers can suggest sources through the
[issue form](https://github.com/minerclass/erate-tracker/issues/new?template=suggest-a-source.yml).

## Editorial rules

- Verify every source against the original before adding it. Record the exact headline, byline, and date.
- Write summaries in original words. Quote only from FCC and other government documents, which are public
  record, and keep those quotes short and exact, with paragraph numbers.
- Do not overstate the proceeding. The June 25 vote opened a comment period; it did not change anyone's
  funding. Keep that distinction visible.

## Run locally

```bash
python -m http.server 8131
```

Then open <http://localhost:8131/>. Serve the folder rather than opening `index.html` directly, since the
page loads `data/sources.json`.

## Regenerate the social card

`social/card.png` is rendered from `social/card.html` at 1200 by 630:

```bash
msedge --headless --disable-gpu --hide-scrollbars --window-size=1200,630 --screenshot=social/card.png social/card.html
```

## Deployment

GitHub Pages builds from `main` through `.github/workflows/pages.yml` (artifact-based deploy, no build step).

## About

Curated by [Micah Miner](https://micahminer.com), a K-8 district technology leader. This is an independent
tracker and is not affiliated with CoSN, SHLB, AASA, ALA, or the FCC.
