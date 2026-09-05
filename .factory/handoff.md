# Headset Cue Check — repair handoff

## Outcome: PASS

Repair 2 is complete. The release blockers from `.factory/verification-2.md`
are fixed, the static PWA is deployed, and the live HTTPS product matches the
local production build.

- Product implementation: `bc5c0da5d22334c71ef1a66cabc8774325f4d663`
- Added verification coverage: `8ce7500f1c454f4ad1709acfcc95df89f74b29e1`
- Verification documentation: `75e82e67e327a206aa1b7d1ddc6aae90b44ffa6b`
- Superseded failure-report commit: `ca9aabeb766b3d3e5d7f58c0716829bbe23f6ace`
- Live URL: `https://headset-cue-check.sociobot.in`

## Repairs

- Made `npm run test:e2e` build the production site before Playwright starts
  `vite preview`. Every exact command in `.factory/claims.json` now works after
  only `npm ci` in a clean checkout.
- Fixed the 200% text-resize overflow at its cause. Hidden rating radios had
  inherited `width: 100%` and intermittently extended the active check to
  1601 px. Their accessible native inputs now use a 1 px hidden box while the
  visible labels retain their focus treatment.
- Replaced the boolean overflow check with a browser measurement that reports
  the overflowing elements. The check passes before and after starting a real
  check on desktop and 390 px mobile.
- Added `non-diagnostic-results` and `manual-routing` to the public claim
  inventory. Their demo tests verify six observational results, no pass/fail
  outcome, visible medical/hardware limits, a blank user-entered device field,
  and exact user-entered settings on the saved card.
- Kept all earlier repair regressions: corrupt import rejection and recovery,
  import focus, demo isolation, local privacy, offline audio, JSON portability,
  copy/print, remove/undo, route metadata, security headers, caching, and the
  designed 404.
- Extended the keyboard test through all six observations and setup-card
  creation. Added browser back/title/focus checks for real routes.
- Replaced public metaphor labels with direct task language and refreshed the
  copy audit. `.factory/catalog-description.txt` is verb-first, 76 bytes, and
  is copied to `/work/.evidence/catalog-description.txt`.
- Bumped the app to 1.0.2 and the service-worker caches to `hcc-shell-v4`.

## Clean-checkout and local verification

Verified on 5 September 2026 UTC:

- `npm ci`: pass; 181 packages installed; 0 vulnerabilities.
- All 11 exact claim commands: pass from a fresh clone of the implementation;
  each command built `dist/` itself and passed on desktop and mobile Chromium.
- `npm test`: pass; 8/8 unit and release-contract tests.
- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm run build`: pass; `dist/index.html` present.
- `npm run test:e2e`: pass; 32/32 browser tests across desktop Chromium and a
  390×844 Chromium viewport.
- Axe WCAG A/AA integration: zero serious or critical findings on tested light,
  dark, home, legal, active-check, setup, and populated-card states.
- Factory `verify-url.sh`: pass on local `/`, `/demo`, `/privacy`, and `/terms`;
  each had the correct title, `lang=en`, one h1, a main landmark, complete alt
  and button labels, and zero console or page errors.
- Local mobile Lighthouse 12.8.2: Performance 99, Accessibility 100, Best
  Practices 100, SEO 100; FCP 1.0 s, LCP 2.0 s, TBT 10 ms, CLS 0.
- Production output: JavaScript 37,623 B raw / 12,296 B gzip; CSS 18,887 B raw /
  4,868 B gzip; hero WebP 110,538 B; social image 149,208 B; no runtime fonts.

Exact clean-checkout order:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

The 11 individually runnable claim commands remain the `test` values in
`.factory/claims.json`.

## Deployment and live verification

- Deployment command: `/opt/fleet/lib/deploy-static.sh headset-cue-check dist`.
- Azure Static Web Apps deployment ID:
  `72981133-878a-4b25-ae4c-2dfe4fb6a6ec`; status `Succeeded`.
- Local/live bytes match for root, demo, privacy, terms, designed 404, manifest,
  service worker, hashed JS/CSS, hero WebP, and bundled speech audio.
- Fresh desktop and phone first screens show the job, audience, sample action,
  and three facts before scrolling. The action begins at 530 px on a 720 px
  desktop viewport and 410 px on an 844 px phone viewport.
- Both fresh contexts opened the one-click sample, showed the persistent demo
  label, and displayed the Windows “Accessibility lab headset” card with six
  results and 38%/62% levels. Reset restored the sample; Start for real left
  zero real setup cards.
- Those desktop/phone flows made same-origin GET requests only, produced zero
  console/page errors, and had zero serious/critical axe findings.
- Live 200% text produced 1280 px scroll and client widths after starting a
  check. Reduced-motion animation duration was 0.00001 s.
- A fresh phone context reloaded `/demo` offline, used `hcc-shell-v4`, and
  played the bundled speech cue to completion with no errors.
- Route titles, focused h1 restoration, browser back, legal pages, links, and
  the designed HTTP 404 passed. A deliberate 404 is recorded as expected.
- Live security and cache headers include CSP with `frame-ancestors 'none'`,
  frame denial, nosniff, referrer and permissions policies, no-cache HTML and
  manifest, no-store service worker, and immutable hashed assets/audio.
- Live mobile Lighthouse 12.8.2: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.9 s, LCP 1.7 s, TBT 0 ms, CLS 0.

## Remaining limits and next steps

No release blocker or known implementation defect remains. The documented
product limits are intentional: this is not a hearing test or hardware
certification, and browsers cannot identify, change, or verify the physical
output device or operating-system settings. The 15-person pilot in the brief
remains a post-release outcome study, not a build claim.

Backend, shared database, auth, billing, health, rate-limit, CLI, library, and
consumer-install checks do not apply to this free static local-first PWA.
