# Independent product verification 2

## Verdict: FAIL

Candidate `f41d98bfa0386972117188e28fba141f5ae70dc2` was independently
verified on 28 August 2026 UTC from a clean checkout at
`https://headset-cue-check.sociobot.in`. The live deployment byte-matches this
candidate, but the candidate does not meet the release contract because a
required repository quality gate fails and the declared claim commands are not
runnable from a clean clone without an undocumented prerequisite.

No product code was modified.

## Release-blocking findings

### High — `npm run test:e2e` fails

The complete browser suite failed with one failing test out of 26:

```text
tests/e2e/app.spec.ts:38
supports 200% text, reduced motion, and narrow screens without overflow
Expected: true
Received: false
at app.spec.ts:45
document.documentElement.scrollWidth <= document.documentElement.clientWidth
```

The failure is reproducible in the desktop Chromium project with:

```sh
npx playwright test -g 'supports 200% text' --project=desktop-chromium --reporter=list
```

It happens after the test sets the root font size to 32 px and starts a check.
This fails the required 200% text-resize/no-loss baseline as well as the
definition-of-done requirement that the full test command pass. The mobile-390
project passed the same test; the desktop failure remains release-blocking.

### High — exact claim commands fail in a clean clone before build

Following the required preflight order after `npm ci`, the first exact commands
from `.factory/claims.json` failed:

```sh
npm run test:e2e -- --grep @claim:guided-check
npm run test:e2e -- --grep @claim:demo-isolation
```

Both started `vite preview` and then failed because the clean checkout has no
`dist/` directory. The recorded browser trace shows `GET /demo` returning 404,
then the test timing out while waiting for the demo's Start button. The claim
command is not self-contained and the manifest does not document `npm run
build` as a prerequisite. A failing listed claim test is explicitly
release-blocking.

After running the exact production build, all nine listed claim tests passed.
The functional claims are therefore evidenced, but this does not erase the
clean-clone claim-gate failure.

| Claim id | Exact command from clean clone | Exact command after build |
| --- | --- | --- |
| `guided-check` | Fail — `/demo` 404 / start control timeout | Pass |
| `demo-isolation` | Fail — `/demo` 404 / start control timeout | Pass |
| `local-privacy` | Fail — `/demo` 404 / start control timeout | Pass |
| `offline-reload` | Fail — `/demo` 404 / start control timeout | Pass |
| `free-use` | Fail — landing UI absent | Pass |
| `json-portability` | Fail — `/demo` UI absent | Pass |
| `copy-print` | Fail — `/demo` UI absent | Pass |
| `remove-undo` | Fail — `/demo` UI absent | Pass |
| `keyboard-access` | Fail — `/demo` UI absent | Pass |

### Medium — public limitation claims are unlisted

The live landing page says that the product is not an audiology test, does not
diagnose or certify hardware, does not change system settings, and that browser
audio follows the operating-system output. The README additionally says that
the product does not identify the selected device. None has an entry in
`.factory/claims.json`. The claims contract requires every visitor-reliant
claim to have a demo-observable test or be removed; these are unlisted claims.

## Evidence that passed

### Checkout and local gates

- Clean checkout HEAD: `f41d98bfa0386972117188e28fba141f5ae70dc2`.
- `npm ci`: passed; 181 packages installed; `npm audit` reported 0
  vulnerabilities.
- `npm test`: passed, 8/8 Vitest tests.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed and produced `dist/`.
- All nine claim tests passed after that build: guided check, demo isolation,
  local privacy, offline reload, free use, JSON portability, copy/print,
  remove/undo, and keyboard access.
- Initial bundle sizes: JavaScript 37,744 B raw / 12,366 B gzip; CSS 19,119 B
  raw / 4,905 B gzip. Both are within the static-PWA budgets.

### First-read and demo check — PASS

Cold mobile (390 x 844) live-page reading gives the answer in plain words:

- Does: “Check the headset cues your work depends on.”
- For whom: screen-reader users and accessibility staff who need repeatable
  speech, channel, level, and alert settings.
- First click: the above-the-fold **Try it with sample data** link (at y≈410),
  which opens the sample sandbox.

The first screen also gives the three required facts: free, local browser
storage, and offline after the first visit. `/demo` presents the persistent
“Demo — sample data, nothing is saved” banner, a realistic Accessibility lab
headset card, Reset demo, and Start for real.

### Live functional, privacy, PWA, and accessibility checks — PASS

- A live `/demo` walkthrough completed all six observations and created an
  `Independent QA headset` setup card. Normal state had no console or page
  errors.
- A fresh mobile demo context recorded only same-origin GET requests; it had no
  cookies, localStorage, or sessionStorage entries. This supports the
  no-account/no-tracking/local-first claim. There are no server-side product
  endpoints, sign-in, billing, CLI, or library API, so rate-limit, Entra,
  consumer-install, and backend checks are not applicable.
- Live axe-core (`wcag2a`, `wcag2aa`) found zero serious or critical violations
  on the completed demo card. The normal mobile page had no horizontal overflow
  at 390 px; reduced-motion computed animation and transition durations were
  `0.00001s`.
- A fresh live context received service-worker control. Offline reload of
  `/demo` showed the offline notice; the bundled speech sample reached “Speech
  cue finished.” `registration.update()` left an active worker and cache
  `hcc-shell-v3`; no waiting update was available to force an update banner.
- Live headers include same-origin CSP, `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and a restrictive
  permissions policy. HTML/manifest are no-cache; `sw.js` is no-store; hashed
  JS/CSS and audio are `max-age=31536000, immutable`. Internal landing links
  returned 200; an unknown route returned the designed 404 with HTTP 404.

### Deployment identity — PASS

SHA-256 matched between local `dist/` and live for root, demo, privacy, terms,
404, manifest, service worker, main JS/CSS, illustration, and bundled speech
audio. The live product is the requested candidate, not an earlier deployment.

## Required remediation before release

1. Make every `claims.json` test command runnable from a fresh clone, for
   example by having the test entry point build first or documenting and
   enforcing its prerequisite in the command itself.
2. Fix the desktop 200% text overflow and make `npm run test:e2e` pass in full.
3. Add observable demo tests for the public limitation/routing claims or remove
   the untestable claim copy, then rerun the complete claim inventory.
