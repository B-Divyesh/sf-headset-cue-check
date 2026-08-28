# Headset Cue Check — repair handoff

## Outcome

All release-blocking findings in verifier report commit `6491504cbac4b93ec464e70b775ff7137dff6fdc` for candidate `6dec30f4526b380f4b56b2fb20c73d8e9277b255` are repaired. The artifact remains a static offline PWA built to `dist/`.

## Repairs

- Added the mandatory claim inventory at `.factory/claims.json`: nine unique public claims, each mapped to exactly one `@claim:<id>` Playwright test using `/demo` and shipped sample data.
- Added `/demo`, `/?demo=1` support, a realistic completed accessibility-lab card, the persistent required banner, Reset demo, and Start for real. Demo records use IndexedDB `headset-cue-check-demo`; real records use `headset-cue-check`.
- Reworked the cold first screen to identify screen-reader users and accessibility staff, use an eight-word job headline, show a one-click sample action plus real action, and list free/privacy/offline facts. At 390×844 the sample action begins around y=372 and is fully visible.
- Replaced shallow import checks with runtime validation of every session, rating, date, enum, length, range, and completion dependency. Existing invalid IndexedDB rows are removed during reads with a visible recovery message. Date rendering also has a defensive fallback.
- Rebuilt Import JSON as a full-size transparent file input inside its visible label. Keyboard focus produces the designed 3 px rust outline on the 44 px label.
- Added route-specific canonical, Open Graph, Twitter, apple-touch, title, and description metadata; a 1200×630 social image; `robots.txt`; `sitemap.xml`; `/demo`; and a designed `404.html` plus host-side 404 override.
- Added `staticwebapp.config.json` with CSP, frame denial, nosniff, referrer and permissions policies, the manifest MIME type, immutable asset/audio/icon caching, and no-cache HTML/manifest/service-worker handling.
- Removed the inline progress style so the CSP needs no unsafe style source. The offline fallback now uses a self-hosted stylesheet.
- Raised the legal return link to a 44 px target. Mobile navigation now remains within 390 px at simulated 200% text.
- Added `.factory/demo.md`, `.factory/copy-audit.md`, an updated README, ESLint/typecheck scripts, release-contract tests, and recorded social-art provenance in `.factory/design.md`.

## Regression coverage

- `tests/model.test.ts`: exact invalid completion-date shape, invalid answer values, invalid setting ranges, and a valid complete sample.
- `tests/release.test.ts`: one test tag per claim; route metadata; 404; CSP/frame/MIME/cache policy; no inline page styles; manifest and service-worker versioning.
- `tests/e2e/app.spec.ts`: full six-observation flow; offline reload/audio/update check; demo isolation/reset/exit; whole-flow same-origin privacy; JSON export/import; copy/print; remove/undo; keyboard/focus/touch targets; 200% text; reduced motion; desktop/mobile axe; designed 404; rejected corrupt import; and cleanup of a corrupt row already in IndexedDB.

## Local verification — 28 August 2026 UTC

- `npm ci`: pass; 181 packages installed; 0 vulnerabilities.
- `npm test`: pass; 8/8 unit and release-contract tests.
- `npm run typecheck`: pass.
- `npm run lint`: pass.
- `npm run build`: pass; `dist/index.html` present.
- `npm run test:e2e`: pass; 26/26 across desktop Chromium and 390×844 Chromium.
- Playwright axe: zero serious/critical findings on tested light/dark home, legal, setup, and saved-card states.
- Keyboard: full first steps operate with Enter/Space; route h1 focus is restored; Import JSON has a visible 3 px outline; no trap.
- Responsive: no horizontal overflow at 390 px, including simulated 200% root text; first sample action is above the fold; reduced-motion animation duration is ≤0.001 s.
- Offline/update: `/demo` reloads offline, bundled WAV completes offline, cache `hcc-shell-v3` exists, and `registration.update()` completes after reconnecting.
- Privacy: a complete demo workflow sends same-origin GET requests only; cookies, localStorage, and sessionStorage remain empty.
- Local `verify-url.sh`: HTTP 200; title/lang/one h1/main/alt/buttons pass; zero console or page errors.
- Local mobile Lighthouse 12.8.2: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 2.0 s, TBT 0 ms, CLS 0.
- Production output: JS 37,744 B raw / 12,400 B gzip; CSS 19,120 B raw / 4,890 B gzip; hero WebP 110,538 B; social image 149,208 B; no runtime fonts.

## Run

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Every claim command is listed in `.factory/claims.json` and is also covered by the complete browser run.

## Deployment and known gaps

Deployment and live identity/policy evidence will be appended immediately after the repair commit is uploaded. No local release blocker or known product gap remains.
