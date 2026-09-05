# Verify headset speech and alert cues — report 3

## Verdict: PASS

Headset Cue Check passes independent verification with **0 findings** and
**0 untested claims**.

- Implementation reviewed: `bc5c0da5d22334c71ef1a66cabc8774325f4d663`
- Verification-test commit: `8ce7500f1c454f4ad1709acfcc95df89f74b29e1`
- Documentation baseline: `13543f32102a538d03d7e023545090474b873ca1`
- Live URL: `https://headset-cue-check.sociobot.in`
- Verified: 5 September 2026 UTC

The commits after the implementation change only tests and reports. A clean
build from the documentation baseline matches the live product for the root,
demo, privacy, terms, manifest, service worker, illustration, and speech audio.

## First screen before scrolling

- Job: check the speech, channel, level, and alert cues used during headset work.
- Audience: screen-reader users and accessibility staff who need repeatable settings.
- First action: **Try it with sample data**.

These points and the free, local-storage, and offline facts were visible before
scrolling in fresh 1280×720 desktop and 390×844 phone browsers. The headline
names the job in eight words. The page uses direct task headings and no mood or
metaphor headings.

## Declared claims

All commands below ran from a fresh checkout after only `npm ci`. Each command
built `dist/` and passed in desktop and 390×844 Chromium.

| Claim | Exact command | Result |
| --- | --- | --- |
| `guided-check` | `npm run test:e2e -- --grep @claim:guided-check` | Pass, 2/2 |
| `demo-isolation` | `npm run test:e2e -- --grep @claim:demo-isolation` | Pass, 2/2 |
| `local-privacy` | `npm run test:e2e -- --grep @claim:local-privacy` | Pass, 2/2 |
| `offline-reload` | `npm run test:e2e -- --grep @claim:offline-reload` | Pass, 2/2 |
| `free-use` | `npm run test:e2e -- --grep @claim:free-use` | Pass, 2/2 |
| `json-portability` | `npm run test:e2e -- --grep @claim:json-portability` | Pass, 2/2 |
| `copy-print` | `npm run test:e2e -- --grep @claim:copy-print` | Pass, 2/2 |
| `remove-undo` | `npm run test:e2e -- --grep @claim:remove-undo` | Pass, 2/2 |
| `keyboard-access` | `npm run test:e2e -- --grep @claim:keyboard-access` | Pass, 2/2 |
| `non-diagnostic-results` | `npm run test:e2e -- --grep @claim:non-diagnostic-results` | Pass, 2/2 |
| `manual-routing` | `npm run test:e2e -- --grep @claim:manual-routing` | Pass, 2/2 |

The live page, legal pages, README, demo guide, and interface were checked
against `.factory/claims.json`. No public claim lacks a listed test.

## Clean checkout results

- `npm ci`: pass; 181 packages installed; 0 vulnerabilities.
- `npm test`: pass; 8/8 tests.
- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm run build`: pass; `dist/index.html` produced.
- `npm run test:e2e`: pass; 32/32 tests.
- JavaScript: 37,623 bytes raw, 12.32 KB gzip.
- CSS: 18,887 bytes raw, 4.85 KB gzip.
- Main illustration: 110,538 bytes.
- Runtime fonts: none.

## Live user paths

### Sample and real data

The one-click action opened `/demo`. The persistent banner said “Demo — sample
data, nothing is saved” on the home, check, and setup-card states. The sample
showed an Accessibility lab headset on Windows, six populated observations,
38% system output, 62% screen-reader speech, and useful repeat notes.

Removing the sample made the list empty. **Reset demo** restored the original
sample. **Start for real** returned to an empty real workspace. Direct database
counts were one item in `headset-cue-check-demo` and zero items in
`headset-cue-check`. Demo work did not change real data.

### Normal, invalid, boundary, and recovery paths

- Completed all six live observations and created a setup card.
- A missing rating showed an alert and focused the first rating.
- Bundled speech played to completion.
- A blank required headset name was rejected and focused.
- A 240-character observation note and 400-character setup note were retained.
- Volume boundaries 0 and 100 were retained.
- HTML-like headset text displayed as text, not markup.
- The completed card retained six results and survived reload.
- A corrupt import was rejected, the app stayed usable, and reload recovered.
- Local claim tests also passed valid import, export, copy, print, remove, and
  undo behavior.

### Keyboard and accessibility

- The full six-observation keyboard path passed live on desktop and phone.
- Import focus is visible with a 3 px outline; the legal return link is at
  least 44 px high.
- Route changes and browser Back focus the new h1 and update the title.
- Live regions, names, roles, labels, one h1, `lang=en`, skip link, main
  landmark, heading order, image alt text, and native form controls passed.
- Playwright axe checks found zero serious or critical WCAG A/AA violations.
- The factory URL verifier passed `/`, `/demo`, `/privacy`, and `/terms` with
  zero console or page errors.
- Light and dark states passed the repository accessibility suite.
- At 200% text, desktop and phone had no horizontal overflow before or during
  a check.
- Reduced motion changed the observation animation to 0.00001 seconds.

### Privacy, offline use, and updates

A complete fresh demo flow made same-origin GET requests only. It created no
cookies, localStorage, or sessionStorage. User cards remained in IndexedDB.
Privacy and terms explain storage, export, removal, routing limits, safe use,
and the non-medical purpose.

A fresh phone browser received service-worker control, reloaded `/demo`
offline, kept the demo label, and played the bundled speech cue to completion.
Cache `hcc-shell-v4` was present. A live update check kept an active worker; no
new waiting worker existed to display the update prompt. The update event and
reload control remain covered by code inspection because no newer worker was
available during verification.

### Routes, links, and 404

`/`, `/demo`, `/privacy`, and `/terms` returned 200 with correct route titles.
All internal links from the live home page returned 200. `robots.txt`,
`sitemap.xml`, manifest icons, social art, and all speech files returned 200.
The sitemap lists every public route.

An unknown route returned HTTP 404 and the designed “This page was not found”
page with a return link. Chromium's network message for that deliberate 404 is
expected evidence of the correct status, not a product error.

### Security, caching, and performance

Live responses include a same-origin CSP with `frame-ancestors 'none'`, frame
denial, nosniff, referrer policy, permissions policy, and HSTS. HTML and the
manifest use no-cache, the service worker uses no-store, and hashed scripts,
styles, icons, and audio use one-year immutable caching.

Fresh live mobile Lighthouse 12.8.2 results:

| Category or metric | Result |
| --- | ---: |
| Performance | 99 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| First Contentful Paint | 0.98 s |
| Largest Contentful Paint | 1.65 s |
| Total Blocking Time | 67 ms |
| Cumulative Layout Shift | 0 |

## Earlier finding disposition

Every finding from `.factory/verification.md` and
`.factory/verification-2.md` was checked again.

| Earlier finding | Current proof | Result |
| --- | --- | --- |
| Claims file and tagged tests were missing | 11 listed claims; every exact command passed | Fixed |
| First screen omitted the audience, facts, and visible sample action | Fresh desktop and phone checks passed before scrolling | Fixed |
| Demo route, sample, label, reset, and separate storage were missing | Live sample and direct database counts passed | Fixed |
| Corrupt import could blank the app | Live rejection and reload recovery passed | Fixed |
| Import had no visible keyboard focus | Live desktop and phone keyboard tests passed | Fixed |
| Metadata, standard routes, footer, copy audit, and real 404 were incomplete | Files, live routes, titles, footer, audit, and HTTP status passed | Fixed |
| CSP, frame protection, and manifest MIME type were missing | Live response headers passed | Fixed |
| Production cache policy was incomplete | Live cache headers passed | Fixed |
| Legal return link was shorter than 44 px | Live phone measurement passed | Fixed |
| Claim commands failed before a manual build | All 11 commands passed after only `npm ci` | Fixed |
| Desktop 200% text overflowed during a check | Live desktop and phone measurements passed | Fixed |
| Medical and routing limits were unlisted claims | Both claims are listed and passed in desktop and phone | Fixed |

## Applicability and final count

This product is a static, free, local-first PWA. It has no product backend,
tenant, server database, auth, billing, API rate limit, CLI, library package,
or desktop installer. Backend restart, tenant isolation, health, 429,
Retry-After, shared PostgreSQL, SQLite mount, and clean consumer-install checks
are not applicable. They are not public claims and are not counted as untested.

- Blocker findings: 0
- High findings: 0
- Medium findings: 0
- Low findings: 0
- Total findings: 0
- Untested claims: 0

**Final verdict: PASS.**
