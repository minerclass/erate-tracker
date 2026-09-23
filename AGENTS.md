# Repository Instructions

## Purpose

A public advocacy tracker for the FCC's 2026 E-rate review (FCC 26-41, WC Docket No. 26-133). It
curates sources and helps schools and libraries file comments. It is not research data and makes no
dissertation claims.

## Evidence standards

- Verify every source against the original before adding it: exact headline, byline, date, and URL.
- Summaries are original prose. Do not paste article text. Quotations come only from FCC and other
  government documents (public record) and must be exact, short, and cited by paragraph number.
- Every figure on the page links to its source. Do not combine figures from different years or methods.
- Keep the FCC's own position visible and accurate: the June 25, 2026 vote opened a comment period and
  did not change anyone's funding.

## Editing

- Sources and timeline live in `data/sources.json`; the page computes all counts from it. Do not hardcode
  counts in `index.html`.
- Update `"updated"` in `data/sources.json` whenever sources change.
- The comment worksheet must stay client-side. Do not add analytics, form submission, or any network call
  that would send what a visitor types.
- Writing style: no em-dashes, no hype, no LLM filler. The "note on screen time" is in Micah's voice; do
  not edit its argument without his review.

## Validation

Serve the repo root (`python -m http.server 8131`), not a copied file. Check desktop and mobile widths,
keyboard use of the morning stepper and filters, the presenter dialog (Esc closes it), and that every
link resolves.
