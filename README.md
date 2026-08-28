# Headset Cue Check

Headset Cue Check is a free, offline-friendly listening guide for screen-reader users and accessibility staff. It walks through six practical observations—speech clarity, left/right channels, mono compatibility, working level, interruption behavior, and notification character—then saves a reproducible setup card locally.

It is not a hearing test, audiology tool, hardware certification, or device-routing detector. The browser plays to the output selected by the operating system.

Live product: <https://headset-cue-check.sociobot.in>

## Privacy and accessibility

- Ratings, notes, and setup cards stay in browser IndexedDB; there are no accounts, analytics, ads, or remote storage.
- Cards can be copied, printed, exported as JSON, imported with last-write-wins conflict handling, or removed with undo.
- The complete flow uses semantic controls and landmarks, visible focus, screen-reader announcements, and touch targets of at least 44 px.
- Bundled speech cues and the app shell work offline after the first visit.

## Develop

Requires Node.js 20.19 or newer.

```sh
npm install
npm run dev
```

## Test and build

```sh
npm test
npm run build
npm run test:e2e
```

`npm run build` is the deployment command. It produces `dist/` with `dist/index.html` at the root. Playwright 1.58.2 is pinned; its Chromium browser must be available to run the end-to-end and offline tests.

## Deploy

Upload the contents of `dist/` to the static host. Serve `/privacy/` and `/terms/` as directory indexes (both are included), serve `sw.js` without immutable caching, and use long-lived immutable caching for fingerprinted files under `assets/`.

The product source and code-authored assets are MIT licensed. Image and synthesized-audio provenance is recorded in [.factory/design.md](.factory/design.md).
