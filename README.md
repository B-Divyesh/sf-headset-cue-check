# Headset Cue Check

Check speech, channels, levels, and alerts with a headset. This free guide is for screen-reader users and accessibility staff who need repeatable settings.

The guide runs six listening observations and saves a setup card in browser IndexedDB. It does not diagnose hearing, certify hardware, identify the selected device, or change system settings.

Live product: <https://headset-cue-check.sociobot.in>

One-click sample: <https://headset-cue-check.sociobot.in/demo>

## What it does

- Runs six labelled observations for speech, left/right channels, mono, working level, interruptions, and alert character.
- Saves ratings, notes, and setup cards in the browser. There are no accounts, analytics, ads, tracking, or remote storage.
- Works offline after the first visit, including the bundled speech cues.
- Exports and imports setup cards as JSON.
- Copies or prints one setup-card summary.
- Removes a setup card with immediate undo.
- Supports keyboard use, visible focus, screen-reader announcements, and touch targets at least 44 pixels high.

Every public claim and its demo-driven browser test is listed in [`.factory/claims.json`](.factory/claims.json). The sample data and separate `headset-cue-check-demo` storage namespace are documented in [`.factory/demo.md`](.factory/demo.md).

## Run locally

Requires Node.js 20.19 or newer.

```sh
npm ci
npm run dev
```

Open <http://127.0.0.1:5173/demo> to use the sample sandbox.

## Test and build

```sh
npm test
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

Playwright 1.58.2 is pinned. Set `PLAYWRIGHT_BROWSERS_PATH` to the installed browser directory when needed. `npm run build` writes the static PWA to `dist/`, with `dist/index.html` at its root.

## Deploy

Upload `dist/` to Azure Static Web Apps. The included `staticwebapp.config.json` sets the manifest MIME type, response security headers, a designed 404, no-cache HTML and service-worker policies, and immutable asset caching.

The project uses the MIT License. Original illustration and synthesized-audio provenance is recorded in [`.factory/design.md`](.factory/design.md).
