# Headset Cue Check — independent verification handoff

## Verdict: FAIL

- Tested candidate: `6dec30f4526b380f4b56b2fb20c73d8e9277b255`
- Tested URL: `https://headset-cue-check.sociobot.in`
- Verification date: 28 August 2026 UTC

The live deployment matches the candidate byte-for-byte for the checked build
artifacts, and the core six-step workflow, local persistence, export/import,
offline reload, accessibility scans, mobile layout, and production build mostly
work. It is not releasable under the supplied contract.

Release blockers:

- `.factory/claims.json` is missing, no `@claim:` tests exist, and shipped
  claims are not inventoried.
- No one-click sample-data demo or isolated demo storage exists; `/demo` and
  `/?demo=1` are ordinary empty product views and `.factory/demo.md` is absent.
- The first screen does not identify screen-reader users/accessibility staff.
  On 390×844 mobile, the real start button is below the first viewport.

High-severity defects:

- A weakly validated import with an invalid completion date is persisted,
  throws `Invalid time value`, and blanks the app on every reload until browser
  site data is cleared.
- Keyboard focus on Import JSON lands on a clipped 1 px file input while the
  visible label has no focus indicator.

Additional issues include missing CSP/frame protection, non-immutable 30-second
asset caching, missing canonical/social/apple metadata, robots/sitemap and a
real 404, a 19 px-high legal return link, and missing demo/copy-audit docs.

Verification results:

- `npm ci`: pass, 0 vulnerabilities
- `npm test`: pass, 4/4
- `npm run build`: pass, TypeScript plus Vite
- `npm run test:e2e`: pass, 8/8 desktop and 390 px mobile
- Live normal-flow axe: 0 serious/critical after state transitions settle
- Live offline root, unvisited privacy route, and cached audio: pass
- Live outbound traffic: same-origin GET only; no cookies or web-storage data
- Live/candidate SHA-256 checks: all checked artifacts match
- Mobile Lighthouse: 93 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; LCP 1.7 s, CLS 0
- Bundles: JS 33,283 B raw / 11,154 B gzip; CSS 17,193 B raw / 4,525 B gzip;
  hero 110,538 B; no runtime fonts

Full evidence and reproductions are in `.factory/verification.md`. No product
code was modified during verification.

## Required next steps

1. Add the isolated one-click demo and `.factory/demo.md`.
2. Inventory every shipped claim in `.factory/claims.json` and add one tagged,
   demo-driven observable test for each claim.
3. Fix the first screen and mobile action placement.
4. Strictly validate imports before writing; quarantine/recover bad stored rows.
5. Give the visible Import JSON control a visible focus state.
6. Complete metadata, 404, security headers, caching, and missing audit docs.
7. Rerun every gate and independent verification before release.
