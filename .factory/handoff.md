# Headset Cue Check — build handoff

## Shipped

- Six-step, screen-reader-operable listening sequence for speech clarity, left/right routing, mono compatibility, working volume, speech interruption, and three notification characters.
- Bundled local speech plus Web Audio channel/tone generation; replay, stop, visible status, and recoverable audio-error guidance.
- User ratings and settings persisted only in IndexedDB, including pause/resume and completed-card history.
- Repeatable setup card with exact platform, device name, system/screen-reader levels, mono, spatial audio, ducking, notification choice, notes, and answer-based settings to revisit.
- Copy, print, individual/all JSON export, JSON import with last-write-wins, confirmed removal, and undo.
- Installable PWA manifest, 192/512 maskable icon, versioned service-worker shell cache, cache-first assets, navigation fallback, update notice, and explicit offline status.
- Dedicated `/privacy/` and `/terms/` static entry points. No analytics, accounts, or third-party runtime scripts.
- Original botanical field-guide visual system and generated hero with prompt/provenance in `.factory/design.md`.

## Verify

Run from a clean clone:

```sh
npm install
npm test
npm run build
npm run test:e2e
```

Verified 2026-08-28:

- `npm audit`: 0 vulnerabilities.
- Vitest: 4/4 passing.
- Playwright 1.58.2: desktop Chromium and 390×844 mobile; 8/8 passing, including end-to-end card creation, keyboard path, axe WCAG A/AA scan, no console errors on initial load, and `context.setOffline(true)` reload.
- Production bundle: 33.28 KB JS (11.18 KB gzip), 17.19 KB CSS (4.52 KB gzip); no runtime fonts; hero WebP 108 KB.
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100; LCP 1.95 s, CLS 0, total blocking time 0 ms.
- Factory `verify-url.sh`: HTTP 200, title/lang/main/alt checks passed, zero page or console errors (646 ms local load).
- `dist/index.html`, `dist/privacy/index.html`, and `dist/terms/index.html` are present.

## Known limits

- Browsers cannot reliably identify or change the physical output device or operating-system accessibility settings. The app states this before testing and on the setup card.
- Audio perception is subjective; results are observations, not a medical assessment or hardware certification.
- Copy depends on clipboard permission; Print and JSON export remain available if it is blocked.

## Next steps

- Run a pilot with at least 15 screen-reader users against the brief’s 80% unassisted-completion target.
- Test the bundled voice and notification cues with a wider range of screen-reader ducking configurations and Bluetooth profiles.
