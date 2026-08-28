# Independent product verification

## Verdict: FAIL

Candidate `6dec30f4526b380f4b56b2fb20c73d8e9277b255` is deployed at
`https://headset-cue-check.sociobot.in`, but it does not meet the acceptance
contract. The mandatory claims manifest and demo sandbox are absent, the cold
first screen does not identify the intended user, and a corrupt import can
persistently blank the app.

Verified independently on 28 August 2026 UTC from a clean candidate checkout.
No product code was changed.

## Release-blocking gates

### Claims gate — FAIL

- `.factory/claims.json` does not exist. The required preflight exited 2 with
  `RELEASE_BLOCKER: .factory/claims.json missing`; consequently there were no
  listed claim commands to run through a demo entry point.
- `rg "@claim:"` found no tagged claim tests.
- Claim-like copy is nevertheless shipped and is therefore unlisted. Examples
  include “About 4 minutes”, “works offline after first visit”, “Your
  observations stay in this browser”, and README claims covering privacy,
  copy/print/export/import, last-write-wins, visible focus, 44 px targets, and
  offline use.

### Cold first-read and demo gate — FAIL

Cold live read:

- What it does: checks speech, left/right, mono, level, and interruption cues,
  then saves a setup card.
- For whom: not stated on the first screen. The intended screen-reader users
  and accessibility staff appear only in the README.
- What to click: desktop shows “Start the six checks”. At 390×844, that button
  begins at y=963 and is not in the first viewport.

The 10-word headline also exceeds the required nine-word maximum. The screen
does not present the required three privacy/offline/price facts. There is no
“Try it with sample data” action. Both `/demo` and `/?demo=1` render the normal,
empty product with no sample content, demo banner, reset action, “Start for
real” action, or separate storage namespace. `.factory/demo.md` is absent.

## Findings by severity

### Blocker

1. **Mandatory claims contract is absent.** No `.factory/claims.json`, claim
   tags, demo-driven claim tests, or complete claim inventory exists.
2. **Mandatory first-read/demo contract fails.** The first screen does not name
   its intended user and no one-click isolated sample-data demo exists. On a
   390×844 viewport, even the real start action is below the fold.

### High

1. **A structurally corrupt import permanently blanks the app.** A JSON object
   with `id`, `createdAt`, `updatedAt`, `answers: []`, and an invalid truthy
   `completedAt` passes `isValidImport`. Rendering then throws `Invalid time
   value`; the bad row remains in IndexedDB. Reload produced an empty `#app`
   and only “Skip to main content” in the body. Recovery requires clearing site
   data outside the product.
2. **The Import JSON control has no visible keyboard focus.** Tab focuses the
   clipped `#import-file` input at 1×48 CSS px (`clip: rect(0, 0, 0, 0)`), while
   its visible label retains `outline: none`. This conflicts directly with the
   target audience and the README’s visible-focus claim.

### Medium

1. **Required site metadata and routes are incomplete.** There is no canonical
   link, Open Graph/Twitter metadata, apple-touch icon, `robots.txt`,
   `sitemap.xml`, `staticwebapp.config.json`, or designed 404. An unknown
   extensionless route returns HTTP 200 and the home screen. The footer omits
   “Built by Param Factory” and a build/version identity. `.factory/copy-audit.md`
   is also absent.
2. **Browser response policy is incomplete.** Live responses include HSTS,
   `Referrer-Policy`, and `X-Content-Type-Options`, but no Content-Security-Policy
   or frame restriction. The manifest is served as `application/octet-stream`.
3. **Production caching misses the stated budget policy.** Hashed JS, CSS, the
   hero image, audio, manifest, and service worker all return
   `cache-control: public, must-revalidate, max-age=30`; hashed assets are not
   long-lived/immutable.
4. **One legal-page touch target is undersized.** “Return to Headset Cue Check”
   measures 236×19 CSS px at 390 px width, below the required 44 px height.

## Passing evidence

### Checkout, install, tests, and build

- `git rev-parse HEAD`:
  `6dec30f4526b380f4b56b2fb20c73d8e9277b255`; initial tracked tree clean.
- `npm ci`: 59 packages installed; audit reported 0 vulnerabilities.
- `npm test`: 1 file, 4/4 Vitest tests passed.
- `npm run build`: TypeScript `--noEmit` and Vite production build passed.
- `npm run test:e2e`: 8/8 Playwright tests passed across desktop Chromium and
  390×844 mobile.
- No lint script exists. Type checking is part of `npm run build`.

Production output:

| Asset | Raw | Gzip | Budget |
| --- | ---: | ---: | ---: |
| JavaScript | 33,283 B | 11,154 B | ≤200 KB JS |
| CSS | 17,193 B | 4,525 B | ≤50 KB CSS |
| Hero WebP | 110,538 B | 110,598 B | ≤300 KB |
| Runtime fonts | 0 B | 0 B | ≤120 KB |

### Deployment identity

The live root HTML, privacy HTML, terms HTML, manifest, service worker,
fingerprinted JS/CSS, hero image, and speech WAV each matched the corresponding
candidate `dist/` file byte-for-byte by SHA-256. This supersedes any earlier
deployment-only failure: the candidate is now live.

### End-to-end behavior

- Completed all six observations live; the real WAV returned 200 `audio/wav`
  and reached “Speech cue finished.”
- Missing rating shows an announced message and focuses the first rating.
- Audio fetch failure gives a concrete recovery message; selecting “Could not
  assess this cue” proceeds to the next observation.
- Tested 240-character observation notes, 400-character setup notes, system
  volume 0, screen-reader volume 100, and HTML-like headset text. Values were
  preserved and escaped, and the correct recommendations appeared.
- A completed card persisted in IndexedDB and survived reload. Copy and JSON
  export worked; export contained format version 1 and the saved card.
- Valid import worked. Older same-ID data was ignored and newer data replaced
  it. Malformed JSON produced an alert. Confirmed deletion, cancellation, and
  undo worked.
- With IndexedDB unavailable, the product disclosed that the check might not
  survive and still allowed the current check to proceed.

### Accessibility and responsive behavior

- Normal settled states produced zero axe serious/critical findings on home,
  active check, setup, card, privacy, and terms views in the exercised light
  and dark modes. The repository’s axe coverage also passed desktop and mobile.
- A keyboard-only 390 px run completed all six observations and created a card;
  route changes focused the new h1. Standard controls worked with
  Tab/Enter/Space/arrow keys, with the import-focus exception above.
- The normal focus ring is a visible 3 px rust outline. There was no keyboard
  trap. The skip link, `lang=en`, titles, one h1, main landmark, labels, live
  regions, and meaningful image alt were present.
- At 390 px there was no horizontal overflow, including after a simulated 200%
  root text size. Reduced-motion mode set animations and transitions to
  0.01 ms and disabled smooth scrolling.
- Normal flows produced no console or uncaught page errors. The corrupt-import
  case produced the repeatable page error described above.

### Privacy, PWA, and performance

- A full live workflow generated only same-origin GET requests. No cookies,
  localStorage, or sessionStorage entries appeared; user data was in IndexedDB.
  There are no runtime third-party scripts or sign-in.
- The service worker activated with scope `/` and populated versioned cache
  `hcc-shell-v2` with the shell, hashed assets, icons, image, and four WAVs.
  After going offline, root and an unvisited `/privacy` deep link reloaded, and
  the speech sample played to completion. `registration.update()` completed
  with the existing worker active and no waiting worker; the update-notice code
  was inspected, but no newer live worker was available to force a real update.
- Chrome parsed the web manifest with no manifest errors. It includes 192/512
  icons, maskable purpose, standalone display, theme/background colors, and a
  versioned start query.
- Fresh mobile Lighthouse: Performance 93, Accessibility 100, Best Practices
  100, SEO 100; FCP 0.9 s, LCP 1.7 s, TBT 310 ms, CLS 0, Speed Index 0.9 s.

The product has no server-side/API endpoint, sign-in, library package, or CLI;
rate-limit, Entra authority, consumer-install, backend concurrency, persistence
boundary, and health/build endpoint checks are not applicable. Static asset
requests were not treated as an API for the 429 test.

## Reproduction commands

```sh
npm ci
npm test
npm run build
npm run test:e2e
CHROME_PATH=/opt/pw-browsers/chromium-1208/chrome-linux64/chrome \
  npx --yes lighthouse@12.8.2 https://headset-cue-check.sociobot.in/ \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags='--headless --no-sandbox --disable-gpu --disable-dev-shm-usage'
```

Release only after the blocker and high-severity findings are fixed and all
claims are listed and pass from the isolated demo entry point.
