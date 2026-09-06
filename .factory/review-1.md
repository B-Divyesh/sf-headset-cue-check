# Check headset speech and alert cues — strict review 1

## Verdict: PASS

Headset Cue Check passes this fresh strict review with **0 findings** and
**0 untested claims**.

- Implementation reviewed: `bc5c0da5d22334c71ef1a66cabc8774325f4d663`
- Verification-test commit: `8ce7500f1c454f4ad1709acfcc95df89f74b29e1`
- Documentation baseline: `4a4d8f3714bfe18110978d064a95ce9a3fa88b39`
- Live URL: `https://headset-cue-check.sociobot.in`
- Reviewed: 6 September 2026 UTC

Commits after the implementation are tests and reports. SHA-256 checks matched
the clean build and live bytes for `/`, `/demo`, `/privacy`, `/terms`, the 404
document, manifest, service worker, main JavaScript and CSS, hero illustration,
and a bundled speech file.

## First screen before scrolling

- Job: check speech, channel, level, and alert cues used with a headset.
- Audience: screen-reader users and accessibility staff who need repeatable
  settings.
- First action: **Try it with sample data**.

Fresh 1280×720 desktop and 390×844 phone contexts showed all three before
scrolling. The sample action began at 530 px on desktop and 410 px on phone.
The same first view showed the three facts: free to use, notes and cards stay
in this browser, and offline use after the first visit. The eight-word headline
names the job. Section headings are direct task labels, with no metaphor or mood
headings.

## Declared claims

After only `npm ci` in a detached clean checkout at the documentation baseline,
every exact command from `.factory/claims.json` built the production app and
passed in desktop and 390×844 Chromium.

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

The live landing page, interface, privacy page, terms, README, and demo guide
were compared with the inventory. No public claim is unlisted.

## Live sample and data isolation

The one-click action opened `/demo`. The persistent label said **Demo — sample
data, nothing is saved** on the home and setup-card views. The populated sample
contained an Accessibility lab headset on Windows, six observations, 38%
system output, 62% screen-reader speech, audio settings, and useful repeat
notes. This is realistic output rather than placeholder content.

Removing the sample produced the empty state. **Reset demo** restored it.
**Start for real** removed the demo label and opened an empty real workspace.
IndexedDB contained one row in `headset-cue-check-demo` and zero rows in
`headset-cue-check`. The exercised flow made same-origin GET requests only and
created no cookies, localStorage, or sessionStorage entries.

## Normal, invalid, boundary, and recovery paths

- The clean suite completed all six observations, saved and reopened a setup
  card, and verified its six recorded results.
- A missing rating produces an announced instruction and focuses the first
  rating. A listener may choose **Could not assess this cue** and continue.
- Settings at 0% and 100%, 240-character observation notes, 400-character
  setup notes, and HTML-like device names remain bounded, stored, and escaped.
- A valid export/import round trip passes. Invalid JSON and the earlier
  structurally corrupt row are rejected; reload remains usable, and a damaged
  stored row is removed with an announced recovery message.
- Copy, print, confirmed removal, cancelled removal, immediate undo, refresh
  persistence, back navigation, and route focus restoration pass.
- An audio-load failure gives a concrete permission/output-device recovery
  instruction. Local oscillated cues and bundled speech remain usable without
  a remote audio service.

## Accessibility, mobile, and privacy

- The factory URL checker passed `/`, `/demo`, `/privacy`, and `/terms` with
  correct title, `lang=en`, one h1, a main landmark, image alternatives,
  labelled buttons, and no console or page errors.
- Playwright axe found zero serious or critical WCAG A/AA issues on live home,
  demo, populated-card, privacy, and terms states. The full local suite covers
  light and dark treatments.
- Live keyboard checks confirmed the visible 3 px import focus treatment, a
  44 px control, native radio operation, and focus transfer to the next h1.
  The complete six-observation keyboard path passes in both browser projects.
- At 200% text, the live 390 px page kept client and scroll widths at 390 px
  before and during a check. Reduced-motion duration was 0.00001 seconds.
- No third-party runtime requests, scripts, accounts, analytics, advertising,
  tracking, or remote user-data storage were found. Privacy and terms explain
  browser storage, export, removal, routing limits, and non-medical use.

## Offline, routes, security, and performance

A fresh phone context received service-worker control, reloaded `/demo`
offline, retained the demo label, and played bundled speech through “Speech cue
finished.” Cache `hcc-shell-v4` was present. An explicit update check retained
an active worker; there was no newer waiting worker to trigger the update
notice. The update-notice path exists in the reviewed implementation and is not
a public claim.

`/`, `/demo`, `/privacy`, and `/terms` returned 200 with their own titles, one
h1, and working internal links. An unknown path deliberately returned HTTP 404
and the designed “This page was not found” view with a 44.8 px return link.
That expected 404 is not a defect. Robots, sitemap, icons, social art, manifest,
and speech resources returned successfully.

Live headers include same-origin CSP with `frame-ancestors 'none'`, frame
denial, nosniff, referrer and permissions policies, and HSTS. HTML and the
manifest are no-cache, the service worker is no-store, and assets and audio use
one-year immutable caching.

Fresh live mobile Lighthouse 12.8.2:

| Category or metric | Result |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| First Contentful Paint | 1.02 s |
| Largest Contentful Paint | 1.62 s |
| Total Blocking Time | 38 ms |
| Cumulative Layout Shift | 0 |

The build contains 37,623 bytes of JavaScript, 18,887 bytes of CSS, a 110,538
byte hero WebP, a 149,208 byte social image, and no runtime font files. These
are within the product budgets.

## Clean-checkout gates

- `npm ci`: pass; 181 packages installed, 0 vulnerabilities.
- `npm test`: pass, 8/8.
- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm run build`: pass; `dist/index.html` exists.
- `npm run test:e2e`: pass, 32/32 across desktop and phone Chromium.
- All 11 individual claim commands: pass, 22/22 aggregate browser runs.

## Earlier finding disposition

Every finding, including minor findings, from `.factory/verification.md` and
`.factory/verification-2.md` was rechecked.

| Earlier finding | Current proof | Disposition |
| --- | --- | --- |
| Claims manifest and tagged tests were absent | 11 listed claims and 11 exact passing commands | Fixed |
| First view omitted audience, facts, and visible sample action | Fresh desktop and phone measurements pass | Fixed |
| Demo, sample, persistent label, reset, and isolation were absent | Live sample flow and separate database counts pass | Fixed |
| Corrupt import could persistently blank the app | Invalid import and corrupt-row recovery pass | Fixed |
| Import had no visible keyboard focus | Live 3 px focus treatment and full keyboard claim pass | Fixed |
| Metadata, routes, footer, audit, and 404 were incomplete | Live structure, files, titles, links, and HTTP 404 pass | Fixed |
| CSP, frame protection, and manifest MIME were missing | Live response headers pass | Fixed |
| Immutable production caching was missing | Live cache headers pass | Fixed |
| Legal return target was under 44 px | Live measurement is 44.8 px | Fixed |
| Claim commands failed before manual build | All exact commands pass after only `npm ci` | Fixed |
| Desktop 200% text overflowed | Desktop and phone checks pass in the full suite; live phone is 390/390 px | Fixed |
| Medical and routing limits were unlisted | Both are listed claims and pass in both projects | Fixed |

## Applicability and counts

This is a static, free, local-first PWA. It has no backend, server database,
tenant, authentication, billing, API, CLI, library package, or desktop
installer. Backend isolation, restart persistence, health, 429/Retry-After,
shared PostgreSQL, `/data` SQLite, and clean consumer-install checks do not
apply. An AI step would not improve this deterministic audio and preference
recording job; import/export is already present.

- Blocker findings: 0
- High findings: 0
- Medium findings: 0
- Low findings: 0
- Total findings: 0
- Untested claims: 0

**Final verdict: PASS.**
